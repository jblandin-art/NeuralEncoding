import { useEffect, useRef, useState } from "react";

export const STATUS = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  STREAMING: "Streaming",
};

export function useEegStream() {
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
      const nextPoints = samples
        .map((sample) => sample.channels?.[0])
        .filter((value) => typeof value === "number");

      setGraphData(nextPoints);
      setStatus(STATUS.STREAMING);
      return nextPoints;
    } catch (err) {
      stopPolling();
      setStatus(STATUS.DISCONNECTED);
      setError(err.message || "Polling failed.");
      return [];
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

  return {
    status,
    error,
    graphData,
    isOn,
    isBusy,
    handleToggleChange,
  };
}
