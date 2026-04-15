import { useEffect, useRef, useState } from "react";

export default function ConnectionToggle() {
  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState("Disconnected");
  const [error, setError] = useState("");
  const [eegData, setEegData] = useState([]);
  const intervalRef = useRef(null);

  async function startConnection() {
    try {
      setError("");
      setStatusText("Connecting...");

      const res = await fetch("http://127.0.0.1:8000/start_connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to start connection.");
      }

      setConnected(true);
      setStatusText("Connected");

      startPolling();
    } catch (err) {
      setConnected(false);
      setStatusText("Disconnected");
      setError(err.message || "Start failed.");
    }
  }

  async function endConnection() {
    try {
      setError("");

      const res = await fetch("http://127.0.0.1:8000/end_connection", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to end connection.");
      }

      stopPolling();
      setConnected(false);
      setStatusText("Disconnected");
      setEegData([]);
    } catch (err) {
      setError(err.message || "Stop failed.");
    }
  }

  async function fetchEEGSlice() {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/get_slice?sensor=EEG&seconds=1"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch EEG slice.");
      }

      setEegData(data.data || []);
    } catch (err) {
      setError(err.message || "Polling failed.");
      stopPolling();
      setConnected(false);
      setStatusText("Disconnected");
    }
  }

  function startPolling() {
    stopPolling();
    intervalRef.current = setInterval(() => {
      fetchEEGSlice();
    }, 500);
  }

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Fake EEG Stream</h2>

      <p>
        <strong>Status:</strong> {statusText}
      </p>

      {!connected ? (
        <button onClick={startConnection}>Connect</button>
      ) : (
        <button onClick={endConnection}>Disconnect</button>
      )}

      {error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      <h3>Latest EEG Slice</h3>
      <pre style={{ background: "#f4f4f4", padding: "12px", overflowX: "auto" }}>
        {JSON.stringify(eegData.slice(0, 5), null, 2)}
      </pre>
    </div>
  );
}