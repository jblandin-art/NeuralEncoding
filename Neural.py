from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import random

app = FastAPI()

# Allow frontend requests if you run React/Electron separately
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class StatusResponse(BaseModel):
    status: str


class DataResponse(BaseModel):
    status: str
    timestamp: float
    fake_stream: list[float]


# Device manager
class DeviceManager:
    def __init__(self):
        self.current_status = "Disconnected"
        self.fake_stream = []

    # Python getter for status
    def get_status(self):
        return self.current_status

    # Python getter for stream/data
    def get_data(self):
        return {
            "status": self.current_status,
            "timestamp": time.time(),
            "fake_stream": self.fake_stream,
        }

    # Start device
    def start(self):
        if self.current_status in ["Connecting", "Connected", "Streaming"]:
            return self.current_status

        self.current_status = "Connecting"
        time.sleep(1)  # simulate connection work

        # once connected, pretend stream starts
        self.current_status = "Streaming"
        self.fake_stream = [round(random.uniform(-1.0, 1.0), 3) for _ in range(10)]

        return self.current_status

    # Stop device
    def stop(self):
        self.current_status = "Disconnected"
        self.fake_stream = []
        return self.current_status

    def refresh_stream(self):
        if self.current_status == "Streaming":
            self.fake_stream = [round(random.uniform(-1.0, 1.0), 3) for _ in range(10)]


# one shared device instance
device = DeviceManager()


# FastAPI getter endpoints
@app.get("/api/device/status", response_model=StatusResponse)
def get_status():
    return {"status": device.get_status()}


@app.get("/api/device/data", response_model=DataResponse)
def get_data():
    device.refresh_stream()
    return device.get_data()



# FastAPI action endpoints
@app.post("/api/device/start", response_model=StatusResponse)
def start_device():
    return {"status": device.start()}


@app.post("/api/device/stop", response_model=StatusResponse)
def stop_device():
    return {"status": device.stop()}