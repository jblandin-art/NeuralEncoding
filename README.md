# Run Codes

## Disclaimer
Both the backend, the dev server, and the electron window will need terminals running for the app to function. So we'll be using three terminals in total. 

## Backend

### Setup
- Step 1 - Create the Venv: 
python -m venv venv
or
py -m venv venv
- Step 2 - Activate It: 
.\venv\Scripts\Activate.ps1
- Step 3 - Upgrade pip: 
python -m pip install --upgrade pip
- Step 4 - Install FastAPI and Uvicorn
pip install fastapi uvicorn

### Run It
uvicorn fake_stream:app --reload --port 8000

## Frontend

### Start the React Dev Server
- Step 1 - Navigate to the "react" folder from the root:
cd react
- Step 2 - Enter the command to start the dev server. 
npm run dev

### Load into Window with Electron
At the root (NeuralEncoding/) enter this command:
npm start


## Done!
