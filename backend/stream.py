import asyncio
from collections import deque
from contextlib import asynccontextmanager
from typing import Literal, Optional
import random
import math
import time

import uvicorn
from fastapi import FastAPI, HTTPException
from pylsl import StreamInlet, resolve_byprop
from pydantic import BaseModel


DEFAULT_ADDRESS = "00:55:DA:BB:BA:EA"
DEFAULT_PRESET = "p1035"
DEFAULT_BUFFER_SECONDS = 4
DEFAULT_STREAM_TYPE: Literal["fake", "real"] = "fake"

SAMPLE_RATES = {"EEG": 256, "Optics": 64, "Accel": 52, "Gyro": 52}


class StreamState:
    def __init__(self):
        self.process: Optional[asyncio.subprocess.Process] = None
        self.lsl_tasks: list[asyncio.Task] = []
        self.sim_tasks: list[asyncio.Task] = []
        self.active = False
        self.address = ""
        self.preset = ""
        self.stream_type: Literal["fake", "real"] = DEFAULT_STREAM_TYPE
        self.buffers: dict[str, deque] = {}
        self._reset_buffers(DEFAULT_BUFFER_SECONDS)

    def _reset_buffers(self, seconds: int):
        self.buffers = {k: deque(maxlen=r * seconds) for k, r in SAMPLE_RATES.items()}

    def push(self, sensor: str, sample: dict):
        if sensor in self.buffers:
            self.buffers[sensor].append(sample)


stream = StreamState()


# -------------------------
# Real stream helpers
# -------------------------

def _blocking_stream_reader(name: str):
    results = resolve_byprop("name", name, timeout=10.0)
    if not results:
        print(f"[WARN] Could not resolve stream: {name}")
        return

    inlet = StreamInlet(results[0])
    try:
        while stream.active and stream.stream_type == "real":
            sample, ts = inlet.pull_sample(timeout=1.0)
            if sample is None:
                continue

            if "EEG" in name:
                stream.push("EEG", {"ts": ts, "channels": [float(v) for v in sample[:4]]})
            elif "OPTICS" in name:
                stream.push("Optics", {"ts": ts, "channels": [float(v) for v in sample]})
            elif "ACCGYRO" in name and len(sample) >= 6:
                stream.push("Accel", {"ts": ts, "x": float(sample[0]), "y": float(sample[1]), "z": float(sample[2])})
                stream.push("Gyro", {"ts": ts, "x": float(sample[3]), "y": float(sample[4]), "z": float(sample[5])})
    finally:
        inlet.close_stream()


async def _read_stream(name: str):
    loop = asyncio.get_running_loop()
    try:
        await loop.run_in_executor(None, _blocking_stream_reader, name)
    except asyncio.CancelledError:
        pass


# -------------------------
# Fake stream helpers
# -------------------------

def _gen_eeg_sample(t: float):
    samples = []
    for _ in range(4):
        delta = 18.0 * math.sin(2 * math.pi * 2.0 * t + random.uniform(0, 2 * math.pi))
        theta = 12.0 * math.sin(2 * math.pi * 6.0 * t + random.uniform(0, 2 * math.pi))
        alpha = 20.0 * math.sin(2 * math.pi * 10.0 * t + random.uniform(0, 2 * math.pi))
        beta = 8.0 * math.sin(2 * math.pi * 20.0 * t + random.uniform(0, 2 * math.pi))
        signal = delta + theta + alpha + beta
        samples.append(800.0 + signal)
    return samples


def _gen_optics_sample():
    return [random.gauss(0.5, 0.05) for _ in range(4)]


def _gen_accel_sample():
    return (
        random.gauss(0.0, 0.02),
        random.gauss(0.0, 0.02),
        random.gauss(1.0, 0.02),
    )


def _gen_gyro_sample():
    return (
        random.gauss(0.0, 0.01),
        random.gauss(0.0, 0.01),
        random.gauss(0.0, 0.01),
    )


async def _simulate_eeg():
    interval = 1.0 / SAMPLE_RATES["EEG"]
    while stream.active and stream.stream_type == "fake":
        t = time.time()
        stream.push("EEG", {"ts": t, "channels": _gen_eeg_sample(t)})
        await asyncio.sleep(interval)


async def _simulate_optics():
    interval = 1.0 / SAMPLE_RATES["Optics"]
    while stream.active and stream.stream_type == "fake":
        t = time.time()
        stream.push("Optics", {"ts": t, "channels": _gen_optics_sample()})
        await asyncio.sleep(interval)


async def _simulate_accgyro():
    interval = 1.0 / SAMPLE_RATES["Accel"]
    while stream.active and stream.stream_type == "fake":
        t = time.time()
        ax, ay, az = _gen_accel_sample()
        gx, gy, gz = _gen_gyro_sample()
        stream.push("Accel", {"ts": t, "x": ax, "y": ay, "z": az})
        stream.push("Gyro", {"ts": t, "x": gx, "y": gy, "z": gz})
        await asyncio.sleep(interval)


# -------------------------
# Lifecycle helpers
# -------------------------

async def _kill_stream():
    for t in stream.lsl_tasks:
        t.cancel()
    await asyncio.gather(*stream.lsl_tasks, return_exceptions=True)
    stream.lsl_tasks = []

    for t in stream.sim_tasks:
        t.cancel()
    await asyncio.gather(*stream.sim_tasks, return_exceptions=True)
    stream.sim_tasks = []

    if stream.process:
        try:
            stream.process.terminate()
            await asyncio.wait_for(stream.process.wait(), timeout=3.0)
        except asyncio.TimeoutError:
            stream.process.kill()
        except Exception:
            pass
        finally:
            stream.process = None

    stream.active = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if stream.active:
        await _kill_stream()


app = FastAPI(title="Muse Athena Server", lifespan=lifespan)


class StartRequest(BaseModel):
    address: str = DEFAULT_ADDRESS
    preset: str = DEFAULT_PRESET
    buffer_size: int = DEFAULT_BUFFER_SECONDS
    stream_type: Literal["fake", "real"] = DEFAULT_STREAM_TYPE


@app.post("/start_connection")
async def start_connection(req: StartRequest):
    if stream.active:
        return {
            "status": "already_connected",
            "warning": "Connection already active, skipping.",
            "address": stream.address,
            "preset": stream.preset,
            "stream_type": stream.stream_type,
        }

    stream.address = req.address
    stream.preset = req.preset
    stream.stream_type = req.stream_type
    stream._reset_buffers(req.buffer_size)
    stream.active = True

    if req.stream_type == "real":
        try:
            proc = await asyncio.create_subprocess_shell(
                f"OpenMuse stream --address={req.address} --preset={req.preset}",
                stdout=asyncio.subprocess.DEVNULL,
                stderr=asyncio.subprocess.DEVNULL,
            )
        except Exception as e:
            stream.active = False
            raise HTTPException(status_code=500, detail=f"Failed to launch OpenMuse: {e}")

        stream.process = proc

        stream_names = [
            f"Muse-EEG ({req.address})",
            f"Muse-OPTICS ({req.address})",
            f"Muse-ACCGYRO ({req.address})",
        ]
        stream.lsl_tasks = [asyncio.create_task(_read_stream(n)) for n in stream_names]

    else:
        stream.sim_tasks = [
            asyncio.create_task(_simulate_eeg()),
            asyncio.create_task(_simulate_optics()),
            asyncio.create_task(_simulate_accgyro()),
        ]

    return {
        "status": "connected",
        "address": req.address,
        "preset": req.preset,
        "stream_type": req.stream_type,
    }


@app.post("/end_connection")
async def end_connection():
    if not stream.active:
        raise HTTPException(status_code=400, detail="No active connection.")
    await _kill_stream()
    return {"status": "disconnected"}


@app.get("/get_buffer")
async def get_buffer():
    if not stream.active:
        raise HTTPException(status_code=400, detail="No active connection. POST /start_connection first.")
    return {sensor: list(buf) for sensor, buf in stream.buffers.items()}


@app.get("/get_slice")
async def get_slice(sensor: str = "EEG", seconds: float = 1.0):
    if not stream.active:
        raise HTTPException(status_code=400, detail="No active connection. POST /start_connection first.")
    if sensor not in stream.buffers:
        raise HTTPException(status_code=400, detail=f"Unknown sensor '{sensor}'. Options: {list(stream.buffers)}")
    n = max(1, int(SAMPLE_RATES[sensor] * seconds))
    buf = list(stream.buffers[sensor])
    return {"sensor": sensor, "seconds": seconds, "n_samples": min(n, len(buf)), "data": buf[-n:]}


@app.get("/status")
async def status():
    return {
        "active": stream.active,
        "address": stream.address,
        "preset": stream.preset,
        "stream_type": stream.stream_type,
        "buffer_counts": {s: len(b) for s, b in stream.buffers.items()},
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
