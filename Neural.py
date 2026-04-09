from fastapi import FastAPI
import time

app = FastAPI()

current_status = "Disconnected"


@app.get("/api/device/status")
def get_status():
    return {"status": current_status}


@app.post("/api/device/start")
def start_device():
    global current_status

    if current_status in ["Connecting", "Connected", "Streaming"]:
        return {"status": current_status}

    current_status = "Connecting"

    # simulate connection work
    time.sleep(1)

    current_status = "Streaming"
    return {"status": current_status}


@app.post("/api/device/stop")
def stop_device():
    global current_status
    current_status = "Disconnected"
    return {"status": current_status}