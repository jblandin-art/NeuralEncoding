import ConnectionToggle from "./ConnectionToggle";
import SideNavBar from "./SideNavBar";
import WaveformChart from "./WaveformChart";
import { useSharedEegStream } from "./EegStreamContext";
import { useNav } from "./NavProvider";

function rms(values) {
  if (!values.length) return 0;
  const squareMean = values.reduce((sum, value) => sum + value * value, 0) / values.length;
  return Math.sqrt(squareMean);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateSnrDb(samples) {
  if (!samples || samples.length < 4) return null;

  const signalRms = rms(samples);
  const diffs = samples.slice(1).map((value, index) => value - samples[index]);
  const noiseRms = rms(diffs) / Math.SQRT2;

  if (!Number.isFinite(signalRms) || !Number.isFinite(noiseRms) || noiseRms <= 0) {
    return null;
  }

  const ratio = signalRms / noiseRms;
  if (ratio <= 0) return null;

  const snrDb = 20 * Math.log10(ratio);
  return Number.isFinite(snrDb) ? snrDb : null;
}

export default function LiveFeed() {
  const {
    status,
    error,
    graphData,
    isOn,
    isBusy,
    handleToggleChange,
  } = useSharedEegStream();

  const isStreaming = status === "Streaming";
  const snrDb = calculateSnrDb(graphData);
  const snrLabel = snrDb === null ? "No signal" : snrDb >= 20 ? "Optimal" : snrDb >= 10 ? "Good" : "Noisy";
  const snrProgress = snrDb === null ? 0 : clamp((snrDb / 30) * 100, 0, 100);
  const { toggleNav } = useNav();



  return (
    <div className="bg-background text-on-surface h-screen w-full overflow-hidden flex flex-row">
      
      <SideNavBar />
      {/* Main Content Canvas */}
      <main className="flex-1 min-w-0 overflow-y-auto terminal-scroll bg-background p-8 flex flex-col gap-8 relative">
        {/* Header Section */}
        <button
          type="button"
          onClick={toggleNav}
          aria-label="Toggle navigation"
          className="p-5 self-start inline-flex h-10 w-10 items-center justify-center rounded-sm border border-outline-variant/30 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high active:scale-95 hover:cursor-pointer"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-primary" />
            <span className="h-0.5 w-5 rounded-full bg-primary" />
            <span className="h-0.5 w-5 rounded-full bg-primary" />
          </span>
        </button>
        <header className="flex flex-row justify-between items-end gap-4 shrink-0">
          <div>
            <h1 className="font-headline text-5xl font-bold text-on-surface tracking-tight mb-2">
              Live Neural Feed
            </h1>
            <p className="font-body text-on-surface-variant text-base">
              Monitoring high-fidelity BCI telemetry streams.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-sm outline outline-1 outline-outline-variant/15">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_theme('colors.tertiary')] ${isStreaming ? "bg-tertiary animate-pulse" : "bg-secondary"}`} />
            <span className="font-label text-sm font-bold text-on-surface tracking-widest uppercase">
              {isStreaming ? "Stream Active" : "Stream Idle"}
            </span>
            <span className="font-body text-secondary text-xs ml-2">Lat: 0.8ms</span>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
          {/* Primary Waveform Stream (Spans 8 cols) */}
          <WaveformChart data={graphData} status={status} />

          {/* Metrics Stack (Spans 4 cols) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <ConnectionToggle
              status={status}
              error={error}
              isOn={isOn}
              isBusy={isBusy}
              onToggle={handleToggleChange}
            />

            {/* SNR Metric */}
            <div className="bg-surface-container rounded-sm p-6 relative overflow-hidden">
              <span className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-2 block">
                Signal-to-Noise Ratio
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-bold text-5xl text-on-surface">
                  {snrDb === null ? "--" : snrDb.toFixed(1)}
                </span>
                <span className="font-body text-secondary text-lg">dB</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_theme('colors.primary')]"
                    style={{ width: `${snrProgress}%` }}
                  />
                </div>
                <span className="text-xs font-label text-primary">{snrLabel}</span>
              </div>
            </div>

            {/* Impedance Metric */}
            <div className="bg-surface-container rounded-sm p-6 relative overflow-hidden">
              <span className="font-label text-xs tracking-widest text-on-surface-variant uppercase mb-2 block">
                Mean Electrode Impedance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline font-bold text-5xl text-on-surface">X.x</span>
                <span className="font-body text-secondary text-lg">kΩ</span>
              </div>
              {/* Nested Recessed Data */}
              <div className="mt-4 bg-surface-container-lowest rounded-sm p-3 flex justify-between items-center outline outline-1 outline-outline-variant/15">
                <span className="text-xs font-body text-on-surface-variant">High Resistance Nodes:</span>
                <span className="text-sm font-label text-error">2</span>
              </div>
            </div>
          </section>

          {/* Electrode Mapping (Spans 6 cols) */}
          <section className="lg:col-span-6 bg-surface-container rounded-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-background pb-4">
              <h2 className="font-headline font-semibold text-lg text-on-surface flex items-center gap-2">
                Sensor Array Map
              </h2>
              <span className="text-xs font-label text-on-surface-variant">Standard 10-20 System</span>
            </div>
            <div className="flex-1 min-h-[200px] flex items-center justify-center relative p-4">
              {/* Abstract Head Map Representation */}
              <div className="relative w-48 h-56 rounded-full border border-outline-variant/30 flex items-center justify-center">
                {/* Nose indicator */}
                <div className="absolute -top-4 w-4 h-4 border-t border-r border-outline-variant/30 rotate-[-45deg]" />
                {/* Electrodes (Active/Inactive) */}
                <div className="absolute top-[10%] w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_theme('colors.primary')]" />
                <div className="absolute top-[25%] left-[20%] w-3 h-3 rounded-full bg-primary" />
                <div className="absolute top-[25%] right-[20%] w-3 h-3 rounded-full bg-surface-container-highest border border-outline-variant/50" />
                <div className="absolute top-[40%] left-[10%] w-3 h-3 rounded-full bg-primary" />
                <div className="absolute top-[40%] w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_theme('colors.primary')]" />
                <div className="absolute top-[40%] right-[10%] w-3 h-3 rounded-full bg-error animate-pulse" />
                <div className="absolute bottom-[25%] left-[25%] w-3 h-3 rounded-full bg-primary" />
                <div className="absolute bottom-[25%] right-[25%] w-3 h-3 rounded-full bg-primary" />
                <div className="absolute bottom-[10%] w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
          </section>

          {/* Event Log (Spans 6 cols) */}
          <section className="lg:col-span-6 bg-surface-container rounded-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-background flex justify-between items-center">
              <h2 className="font-headline font-semibold text-lg text-on-surface">Telemetry Events</h2>
              <button className="text-secondary text-sm font-label flex items-center gap-1 hover:text-primary transition-colors">
                Export <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
            <div className="flex flex-col flex-1 p-2">
              {/* Log Items */}
              <div className="px-4 py-3 flex gap-4 items-start hover:bg-surface-container-low transition-colors rounded-sm cursor-default">
                <span className="font-label text-xs text-on-surface-variant w-16 shrink-0 pt-1">14:02:11</span>
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0 mt-1.5" />
                <div className="flex flex-col">
                  <span className="font-body text-sm text-on-surface">
                    Connection stabilized. Full duplex channel open.
                  </span>
                  <span className="font-label text-[10px] text-secondary mt-1">SYS_AUTH</span>
                </div>
              </div>
              <div className="px-4 py-3 flex gap-4 items-start hover:bg-surface-container-low transition-colors rounded-sm cursor-default">
                <span className="font-label text-xs text-on-surface-variant w-16 shrink-0 pt-1">14:02:45</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <div className="flex flex-col">
                  <span className="font-body text-sm text-on-surface">Alpha burst detected in occipital region.</span>
                  <span className="font-label text-[10px] text-secondary mt-1">PATTERN_REC</span>
                </div>
              </div>
              <div className="px-4 py-3 flex gap-4 items-start bg-surface-container-low rounded-sm cursor-default">
                <span className="font-label text-xs text-on-surface-variant w-16 shrink-0 pt-1">14:03:02</span>
                <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0 mt-1.5" />
                <div className="flex flex-col">
                  <span className="font-body text-sm text-error">Impedance spike on T4 electrode. Recalibrating.</span>
                  <span className="font-label text-[10px] text-error mt-1">HW_WARN</span>
                </div>
              </div>
              <div className="px-4 py-3 flex gap-4 items-start hover:bg-surface-container-low transition-colors rounded-sm cursor-default">
                <span className="font-label text-xs text-on-surface-variant w-16 shrink-0 pt-1">14:03:15</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <div className="flex flex-col">
                  <span className="font-body text-sm text-on-surface">
                    Baseline recalibration complete. Streaming resumed.
                  </span>
                  <span className="font-label text-[10px] text-secondary mt-1">SYS_MAINT</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
