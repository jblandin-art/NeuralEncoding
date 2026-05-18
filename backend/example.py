import time
import requests

BASE_URL = "http://localhost:8000"

requests.post(f"{BASE_URL}/start_connection", json={})
time.sleep(10)

eeg_data = requests.get(f"{BASE_URL}/get_slice", params={"sensor": "EEG", "seconds": 1}).json()
optics_data = requests.get(f"{BASE_URL}/get_slice", params={"sensor": "Optics", "seconds": 1}).json()
gyro_data = requests.get(f"{BASE_URL}/get_slice", params={"sensor": "Gyro", "seconds": 1}).json()
accel_data = requests.get(f"{BASE_URL}/get_slice", params={"sensor": "Accel", "seconds": 1}).json()

print("EEG samples: ", eeg_data["data"][0])
print("Optics samples: ", optics_data["data"][0])
print("Gyro samples: ", gyro_data["data"][0])
print("Accel samples: ", accel_data["data"][0])

buffer = requests.get(f"{BASE_URL}/get_buffer").json()

eeg_matrix = [s["channels"] for s in buffer["EEG"]]
optics_matrix = [s["channels"] for s in buffer["Optics"]]
accel_xyz = [[s["x"], s["y"], s["z"]] for s in buffer["Accel"]]
gyro_xyz = [[s["x"], s["y"], s["z"]] for s in buffer["Gyro"]]

print("EEG buffer shape: ", len(eeg_matrix), "x", len(eeg_matrix[0]) if eeg_matrix else 0)
print("Optics buffer shape: ", len(optics_matrix), "x", len(optics_matrix[0]) if optics_matrix else 0)
print("Accel buffer shape: ", len(accel_xyz), "x", len(accel_xyz[0]) if accel_xyz else 0)
print("Gyro buffer shape: ", len(gyro_xyz), "x", len(gyro_xyz[0]) if gyro_xyz else 0)

requests.post(f"{BASE_URL}/end_connection", json={})
