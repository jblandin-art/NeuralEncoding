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

  function getStatusClassName(currentStatus) {
    switch (currentStatus) {
      case STATUS.DISCONNECTED:
        return "status disconnected";
      case STATUS.CONNECTING:
        return "status connecting";
      case STATUS.CONNECTED:
        return "status connected";
      case STATUS.STREAMING:
        return "status streaming";
      default:
        return "status";
    }
  }

  return (
    <section className="connection-card" aria-labelledby="connection-title">
      <h2 id="connection-title">Device Control</h2>

      <div className="control-row">
        <label className="toggle-wrapper">
          <span className="toggle-label">Connect</span>

          <button
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={`Device connection toggle. Current status: ${status}`}
            aria-busy={isBusy}
            disabled={isBusy}
            onClick={handleToggleChange}
            className={`toggle ${isOn ? "toggle-on" : "toggle-off"} ${
              isBusy ? "toggle-disabled" : ""
            }`}
          >
            <span className="toggle-thumb" />
          </button>
        </label>

        <div className={getStatusClassName(status)} aria-live="polite">
          {status}
        </div>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <button type="button" onClick={fetchCurrentStatus} className="refresh-btn">
        Refresh status
      </button>
    </section>
  );
}