import asyncio
from collections import deque
from contextlib import asynccontextmanager
import random
import math
import time

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


DEFAULT_ADDRESS = "00:55:DA:BB:BA:EA"
DEFAULT_PRESET = "p1035"
DEFAULT_BUFFER_SECONDS = 4

SAMPLE_RATES = {"EEG": 256, "Optics": 64, "Accel": 52, "Gyro": 52}


class StreamState:
    def __init__(self):
        self.sim_tasks = []
        self.active = False
        self.address = ""
        self.preset = ""
        self.buffers = {}
        self._reset_buffers(DEFAULT_BUFFER_SECONDS)

    def _reset_buffers(self, seconds):
        self.buffers = {k: deque(maxlen=r * seconds) for k, r in SAMPLE_RATES.items()}

    def push(self, sensor, sample):
        if sensor in self.buffers:
            self.buffers[sensor].append(sample)


stream = StreamState()


def _gen_eeg_sample(t):
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
    while stream.active:
        t = time.time()
        stream.push("EEG", {"ts": t, "channels": _gen_eeg_sample(t)})
        await asyncio.sleep(interval)


async def _simulate_optics():
    interval = 1.0 / SAMPLE_RATES["Optics"]
    while stream.active:
        t = time.time()
        stream.push("Optics", {"ts": t, "channels": _gen_optics_sample()})
        await asyncio.sleep(interval)


async def _simulate_accgyro():
    interval = 1.0 / SAMPLE_RATES["Accel"]
    while stream.active:
        t = time.time()
        ax, ay, az = _gen_accel_sample()
        gx, gy, gz = _gen_gyro_sample()
        stream.push("Accel", {"ts": t, "x": ax, "y": ay, "z": az})
        stream.push("Gyro", {"ts": t, "x": gx, "y": gy, "z": gz})
        await asyncio.sleep(interval)


async def _kill_stream():
    for task in stream.sim_tasks:
        task.cancel()
    await asyncio.gather(*stream.sim_tasks, return_exceptions=True)
    stream.sim_tasks = []
    stream.active = False


@asynccontextmanager
async def lifespan(app):
    yield
    if stream.active:
        await _kill_stream()


app = FastAPI(title="Muse Athena Server (Simulated)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartRequest(BaseModel):
    address: str = DEFAULT_ADDRESS
    preset: str = DEFAULT_PRESET
    buffer_size: int = DEFAULT_BUFFER_SECONDS


@app.post("/start_connection")
async def start_connection(req: StartRequest):
    if stream.active:
        return {
            "status": "already_connected",
            "warning": "Connection already active, skipping.",
            "address": stream.address,
            "preset": stream.preset,
        }

    stream.address = req.address
    stream.preset = req.preset
    stream._reset_buffers(req.buffer_size)
    stream.active = True

    stream.sim_tasks = [
        asyncio.create_task(_simulate_eeg()),
        asyncio.create_task(_simulate_optics()),
        asyncio.create_task(_simulate_accgyro()),
    ]

    return {"status": "connected", "address": req.address, "preset": req.preset}


@app.post("/end_connection")
async def end_connection():
    if not stream.active:
        raise HTTPException(status_code=400, detail="No active connection.")
    await _kill_stream()
    return {"status": "disconnected"}


@app.get("/get_buffer")
async def get_buffer():
    if not stream.active:
        raise HTTPException(
            status_code=400,
            detail="No active connection. POST /start_connection first.",
        )
    return {sensor: list(buf) for sensor, buf in stream.buffers.items()}


@app.get("/get_slice")
async def get_slice(sensor: str = "EEG", seconds: float = 1.0):
    if not stream.active:
        raise HTTPException(
            status_code=400,
            detail="No active connection. POST /start_connection first.",
        )
    if sensor not in stream.buffers:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown sensor '{sensor}'. Options: {list(stream.buffers)}",
        )
    n = max(1, int(SAMPLE_RATES[sensor] * seconds))
    buf = list(stream.buffers[sensor])
    return {
        "sensor": sensor,
        "seconds": seconds,
        "n_samples": min(n, len(buf)),
        "data": buf[-n:],
    }


@app.get("/status")
async def status():
    return {
        "active": stream.active,
        "address": stream.address,
        "preset": stream.preset,
        "buffer_counts": {s: len(b) for s, b in stream.buffers.items()},
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)