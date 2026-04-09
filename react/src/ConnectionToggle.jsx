import { useEffect, useState } from "react";

const STATUS = {
  DISCONNECTED: "Disconnected",
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  STREAMING: "Streaming",
};

export default function ConnectionToggle() {
  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [error, setError] = useState("");

  const isOn =
    status === STATUS.CONNECTING ||
    status === STATUS.CONNECTED ||
    status === STATUS.STREAMING;

  const isBusy = status === STATUS.CONNECTING;

  async function fetchCurrentStatus() {
    try {
      setError("");

      const res = await fetch("/api/device/status");
      if (!res.ok) {
        throw new Error("Failed to fetch current status.");
      }

      const data = await res.json();

      if (Object.values(STATUS).includes(data.status)) {
        setStatus(data.status);
      } else {
        throw new Error("Backend returned an unknown status.");
      }
    } catch (err) {
      setError(err.message || "Unable to load status.");
    }
  }

  async function handleToggleChange() {
    if (isBusy) return;

    const previousStatus = status;
    setError("");

    if (status === STATUS.DISCONNECTED) {
      try {
        setStatus(STATUS.CONNECTING);

        const res = await fetch("/api/device/start", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to start device.");
        }

        const data = await res.json();

        if (Object.values(STATUS).includes(data.status)) {
          setStatus(data.status);
        } else {
          throw new Error("Backend returned an unknown status.");
        }
      } catch (err) {
        setStatus(previousStatus);
        setError(err.message || "Start request failed.");
      }
      return;
    }

    if (status === STATUS.CONNECTED || status === STATUS.STREAMING) {
      try {
        const res = await fetch("/api/device/stop", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to stop device.");
        }

        const data = await res.json();

        if (Object.values(STATUS).includes(data.status)) {
          setStatus(data.status);
        } else {
          setStatus(STATUS.DISCONNECTED);
        }
      } catch (err) {
        setError(err.message || "Stop request failed.");
      }
    }
  }

  useEffect(() => {
    fetchCurrentStatus();
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
        style={{ marginTop: "12px" }}
      >
        Refresh status
      </button>
    </section>
  );
}