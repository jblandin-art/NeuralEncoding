/*
JUST STREAMS THE DATA WITH NO VISUAL

import { useEffect, useRef, useState } from "react";

const STATUS = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  STREAMING: "Streaming",
};

export default function ConnectionToggle() {
  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [error, setError] = useState("");
  const [eegData, setEegData] = useState([]);
  const intervalRef = useRef(null);

  const isOn =
    status === STATUS.CONNECTING ||
    status === STATUS.CONNECTED ||
    status === STATUS.STREAMING;

  const isBusy = status === STATUS.CONNECTING;

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function fetchCurrentStatus() {
    try {
      setError("");

      const res = await fetch("http://127.0.0.1:8000/status");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch current status.");
      }

      if (data.active) {
        setStatus(STATUS.STREAMING);
      } else {
        setStatus(STATUS.DISCONNECTED);
        stopPolling();
      }
    } catch (err) {
      setError(err.message || "Unable to load status.");
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
      setStatus(STATUS.STREAMING);
    } catch (err) {
      stopPolling();
      setStatus(STATUS.DISCONNECTED);
      setError(err.message || "Polling failed.");
    }
  }

  function startPolling() {
    stopPolling();

    intervalRef.current = setInterval(() => {
      fetchEEGSlice();
    }, 500);
  }

  async function handleToggleChange() {
    if (isBusy) return;

    setError("");

    if (status === STATUS.DISCONNECTED) {
      try {
        setStatus(STATUS.CONNECTING);

        const res = await fetch("http://127.0.0.1:8000/start_connection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to start device.");
        }

        setStatus(STATUS.CONNECTED);

        await fetchEEGSlice();
        startPolling();
      } catch (err) {
        setStatus(STATUS.DISCONNECTED);
        setError(err.message || "Start request failed.");
      }

      return;
    }

    if (status === STATUS.CONNECTED || status === STATUS.STREAMING) {
      try {
        const res = await fetch("http://127.0.0.1:8000/end_connection", {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to stop device.");
        }

        stopPolling();
        setStatus(STATUS.DISCONNECTED);
        setEegData([]);
      } catch (err) {
        setError(err.message || "Stop request failed.");
      }
    }
  }

  useEffect(() => {
    fetchCurrentStatus();

    return () => {
      stopPolling();
    };
  }, []);

  return (
    <section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Device Control</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>Connect</span>

        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`Device connection toggle. Current status: ${status}`}
          aria-busy={isBusy}
          disabled={isBusy}
          onClick={handleToggleChange}
          style={{
            width: "56px",
            height: "32px",
            borderRadius: "999px",
            border: "none",
            cursor: isBusy ? "not-allowed" : "pointer",
            backgroundColor: isOn ? "#2563eb" : "#9ca3af",
            position: "relative",
            opacity: isBusy ? 0.7 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "4px",
              left: isOn ? "28px" : "4px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "white",
              transition: "left 0.2s ease",
            }}
          />
        </button>

        <strong>{status}</strong>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }} role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={fetchCurrentStatus}
        style={{ marginTop: "12px", marginRight: "8px" }}
      >
        Refresh status
      </button>

      <button
        type="button"
        onClick={fetchEEGSlice}
        style={{ marginTop: "12px" }}
      >
        Get EEG slice
      </button>

      <div style={{ marginTop: "16px" }}>
        <h3>Latest EEG Samples</h3>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "12px",
            borderRadius: "8px",
            overflowX: "auto",
            maxHeight: "300px",
          }}
        >
          {JSON.stringify(eegData.slice(0, 5), null, 2)}
        </pre>
      </div>
    </section>
  );
}
  */

/*

STREAMS DATA WITH GRAPH

*/

import { useEffect, useRef, useState } from "react";

const STATUS = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  STREAMING: "Streaming",
};

export default function ConnectionToggle() {
  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [error, setError] = useState("");
  const [graphData, setGraphData] = useState([]);
  const intervalRef = useRef(null);

  const isOn =
    status === STATUS.CONNECTING ||
    status === STATUS.CONNECTED ||
    status === STATUS.STREAMING;

  const isBusy = status === STATUS.CONNECTING;

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function fetchCurrentStatus() {
    try {
      setError("");

      const res = await fetch("http://127.0.0.1:8000/status");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch current status.");
      }

      if (data.active) {
        setStatus(STATUS.STREAMING);
      } else {
        setStatus(STATUS.DISCONNECTED);
        stopPolling();
      }
    } catch (err) {
      setError(err.message || "Unable to load status.");
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

      const samples = data.data || [];

      // Use channel 1 from each EEG sample
      const nextPoints = samples
        .map((sample) => sample.channels?.[0])
        .filter((value) => typeof value === "number");

      setGraphData(nextPoints);
      setStatus(STATUS.STREAMING);
    } catch (err) {
      stopPolling();
      setStatus(STATUS.DISCONNECTED);
      setError(err.message || "Polling failed.");
    }
  }

  function startPolling() {
    stopPolling();

    intervalRef.current = setInterval(() => {
      fetchEEGSlice();
    }, 200);
  }

  async function handleToggleChange() {
    if (isBusy) return;

    setError("");

    if (status === STATUS.DISCONNECTED) {
      try {
        setStatus(STATUS.CONNECTING);

        const res = await fetch("http://127.0.0.1:8000/start_connection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to start device.");
        }

        setStatus(STATUS.CONNECTED);
        await fetchEEGSlice();
        startPolling();
      } catch (err) {
        setStatus(STATUS.DISCONNECTED);
        setError(err.message || "Start request failed.");
      }

      return;
    }

    if (status === STATUS.CONNECTED || status === STATUS.STREAMING) {
      try {
        const res = await fetch("http://127.0.0.1:8000/end_connection", {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to stop device.");
        }

        stopPolling();
        setStatus(STATUS.DISCONNECTED);
        setGraphData([]);
      } catch (err) {
        setError(err.message || "Stop request failed.");
      }
    }
  }

  useEffect(() => {
    fetchCurrentStatus();

    return () => {
      stopPolling();
    };
  }, []);

  return (
    <section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Device Control</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span>Connect</span>

        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`Device connection toggle. Current status: ${status}`}
          aria-busy={isBusy}
          disabled={isBusy}
          onClick={handleToggleChange}
          style={{
            width: "56px",
            height: "32px",
            borderRadius: "999px",
            border: "none",
            cursor: isBusy ? "not-allowed" : "pointer",
            backgroundColor: isOn ? "#2563eb" : "#9ca3af",
            position: "relative",
            opacity: isBusy ? 0.7 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "4px",
              left: isOn ? "28px" : "4px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "white",
              transition: "left 0.2s ease",
            }}
          />
        </button>

        <strong>{status}</strong>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }} role="alert">
          {error}
        </p>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Live EEG Graph</h3>
        <LiveLineGraph data={graphData} width={1000} height={320} />
      </div>
    </section>
  );
}

function LiveLineGraph({ data, width = 800, height = 300 }) {
  if (!data.length) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e5e7eb",
          borderRadius: "12px",
          color: "#374151",
        }}
      >
        No EEG data yet
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 20;

  const points = data.map((value, index) => {
    const x =
      padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((value - min) / range) * (height - padding * 2);

    return `${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      style={{
        background: "#e5e7eb",
        borderRadius: "12px",
        display: "block",
      }}
    >
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#9ca3af"
        strokeWidth="1"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#9ca3af"
        strokeWidth="1"
      />

      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        points={points.join(" ")}
      />

      <text x={padding} y={16} fontSize="12" fill="#374151">
        Max: {max.toFixed(2)}
      </text>
      <text x={padding} y={height - 4} fontSize="12" fill="#374151">
        Min: {min.toFixed(2)}
      </text>
    </svg>
  );
}