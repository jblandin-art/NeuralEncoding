import SideNavBar from "./SideNavBar";
import { useSharedEegStream } from "./EegStreamContext";

function buildMiniWavePath(data, width, height, padding) {
  if (!data.length) {
    return "";
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });

  return points.join(" ");
}

export default function SystemLogsPage() {
  const { status, graphData } = useSharedEegStream();
  const isSocketConnected = status === "Connected" || status === "Streaming";
  const miniWavePath = buildMiniWavePath(graphData, 100, 20, 2);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen w-full overflow-x-hidden flex flex-col md:h-screen md:flex-row">
      <header className="md:hidden bg-[#0b0e14] flex justify-between items-center w-full px-6 h-16 border-b border-[#ecedf6]/5">
        <div className="text-xl font-bold tracking-widest text-[#00E5FF] uppercase font-headline">NEURAL_CORE v1.0</div>
        <div className="flex gap-4">
          <button className="text-[#00E5FF] cursor-pointer active:scale-95 hover:bg-[#1c2028] transition-colors p-2 rounded">
            <span className="material-symbols-outlined">sensors</span>
          </button>
          <button className="text-[#ecedf6] opacity-70 cursor-pointer active:scale-95 hover:bg-[#1c2028] transition-colors p-2 rounded">
            <span className="material-symbols-outlined">settings_input_component</span>
          </button>
          <button className="text-[#ecedf6] opacity-70 cursor-pointer active:scale-95 hover:bg-[#1c2028] transition-colors p-2 rounded">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <SideNavBar />

      <main className="flex-1 h-full overflow-hidden flex flex-col bg-background relative z-10 min-w-0">
        <header className="hidden md:flex justify-between items-center w-full px-8 h-20 bg-surface-container-low shrink-0 relative z-20">
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">System Terminal</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-sm border border-outline-variant/15">
              <span className={`w-2 h-2 rounded-full ${isSocketConnected ? "bg-tertiary animate-pulse" : "bg-error"}`} />
              <span className={`font-headline text-xs uppercase tracking-widest ${isSocketConnected ? "text-tertiary" : "text-error"}`}>
                Socket: {isSocketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="relative w-64">
              <input
                className="w-full bg-surface-container-lowest border-b-2 border-outline-variant text-on-surface text-sm py-2 pl-10 pr-4 focus:outline-none focus:border-primary focus:bg-surface-container transition-colors rounded-t-sm"
                placeholder="Filter logs..."
                type="text"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto terminal-scroll relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[800px]">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-6 shrink-0">
                <div className="bg-surface-container p-5 rounded-sm border border-outline-variant/15 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-tertiary" />
                  <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest mb-1">Packet Loss</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-3xl font-bold text-on-surface group-hover:text-tertiary transition-colors">0.02</span>
                    <span className="font-body text-sm text-on-surface-variant">%</span>
                  </div>
                </div>
                <div className="bg-surface-container p-5 rounded-sm border border-outline-variant/15 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-secondary" />
                  <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest mb-1">Latency</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-3xl font-bold text-on-surface group-hover:text-secondary transition-colors">4.1</span>
                    <span className="font-body text-sm text-on-surface-variant">ms</span>
                  </div>
                </div>
                <div className="bg-surface-container p-5 rounded-sm border border-outline-variant/15 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                  <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest mb-1">Data Rate</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline text-3xl font-bold text-on-surface group-hover:text-primary transition-colors">1.2</span>
                    <span className="font-body text-sm text-on-surface-variant">GB/s</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-sm flex flex-col overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="bg-surface-container-highest px-4 py-3 flex justify-between items-center border-b border-outline-variant/20 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                    <span className="font-headline text-xs text-on-surface uppercase tracking-widest">Raw Encoding Stream</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" />
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  </div>
                </div>

                <div className="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto terminal-scroll text-on-surface-variant">
                  <div className="mb-2"><span className="text-secondary">[SYS]</span> Initiating neural handshake protocol...</div>
                  <div className="mb-2"><span className="text-tertiary">[OK]</span> Handshake accepted. Port 8042 open.</div>
                  <div className="mb-2"><span className="text-primary">[DATA]</span> Receiving packet stream // SEQ_ID: 0x8F2A</div>
                  <div className="mb-2"><span className="text-on-surface opacity-50">01001011 00110010 11010010 00011100 10101010</span></div>
                  <div className="mb-2"><span className="text-on-surface opacity-50">11100101 10101001 00101111 00001111 11001010</span></div>
                  <div className="mb-2"><span className="text-secondary">[PROC]</span> Decoding cortex map...</div>
                  <div className="mb-2"><span className="text-tertiary">[OK]</span> Map decoded. Alignment variance: 0.04%</div>
                  <div className="mb-2"><span className="text-error">[WARN]</span> Spike detected in temporal lobe sector 4.</div>
                  <div className="mb-2"><span className="text-primary">[DATA]</span> Compensating buffer... // SEQ_ID: 0x8F2B</div>
                  <div className="mb-2"><span className="text-on-surface opacity-50">00110010 11010010 01001011 00011100 10101010</span></div>
                  <div className="mb-2"><span className="text-secondary">[SYS]</span> Calibrating noise filters...</div>
                  <div className="mb-2"><span className="text-tertiary">[OK]</span> Filters optimal.</div>
                  <div className="mb-2 flex items-center">
                    <span className="text-primary mr-2">_&gt;</span>
                    <span className="w-2 h-4 bg-primary animate-pulse inline-block" />
                  </div>
                </div>

                <div className="bg-surface-container px-4 py-2 border-t border-outline-variant/20 flex items-center shrink-0">
                  <span className="text-primary font-mono text-xs mr-3">operator@core:~#</span>
                  <input
                    className="bg-transparent border-none outline-none text-on-surface font-mono text-xs w-full focus:ring-0 p-0"
                    placeholder="Enter command..."
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-low rounded-sm border border-outline-variant/15 p-5 relative overflow-hidden flex flex-col h-64 shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest">Real-time EEG</h3>
                  <div className="bg-surface-container-highest px-2 py-1 rounded-sm border border-outline-variant/20">
                    <span className="font-headline text-[10px] text-primary">CH-01</span>
                  </div>
                </div>
                <div className="flex-1 relative w-full flex items-center justify-center shadow-[0_0_15px_5px_rgba(0,227,253,0.1)]">
                  <div className="absolute inset-0 flex items-center opacity-80">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
                      {miniWavePath ? (
                        <>
                          <path className="opacity-50" d={miniWavePath} fill="none" stroke="#81ecff" strokeWidth="0.5" />
                          <path d={miniWavePath} fill="none" stroke="#00e3fd" strokeWidth="1" />
                        </>
                      ) : (
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#5361ff" strokeOpacity="0.45" strokeWidth="0.5" />
                      )}
                    </svg>
                  </div>
                  {isSocketConnected && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[1px] bg-primary opacity-80 shadow-[0_0_8px_#81ecff]"
                      style={{ animation: "scan 3s linear infinite" }}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 bg-surface-container rounded-sm border border-outline-variant/15 p-5 flex flex-col min-h-[300px]">
                <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest mb-4">Critical Events</h3>
                <div className="flex flex-col gap-4 overflow-y-auto terminal-scroll pr-2">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center shrink-0 border border-error-container/50">
                      <span className="text-error text-[16px] leading-none" aria-label="warning">⚠</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-headline text-sm text-error">Packet Drop Detected</h4>
                        <span className="font-mono text-[10px] text-on-surface-variant">14:22:01</span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">Temporary disruption in temporal stream. Auto-corrected.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/30">
                      <span className="text-secondary text-[16px] leading-none" aria-label="sync">⟳</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-headline text-sm text-on-surface">Re-sync Initiated</h4>
                        <span className="font-mono text-[10px] text-on-surface-variant">14:20:15</span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">Routine phase alignment completed successfully.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-tertiary-container/10 flex items-center justify-center shrink-0 border border-tertiary/30">
                      <span className="text-tertiary text-[16px] leading-none" aria-label="check">✓</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-headline text-sm text-tertiary">Connection Stable</h4>
                        <span className="font-mono text-[10px] text-on-surface-variant">14:15:00</span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">Initial handshake and baseline calibration set.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-sm border border-outline-variant/15 p-5 shrink-0">
                <h3 className="font-headline text-xs text-on-surface-variant uppercase tracking-widest mb-3">Active Regions</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-surface-container-highest px-3 py-1.5 rounded-sm border border-outline-variant/20 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-label text-xs text-on-surface">Pre-Frontal Cortex</span>
                  </div>
                  <div className="bg-surface-container-highest px-3 py-1.5 rounded-sm border border-outline-variant/20 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="font-label text-xs text-on-surface">Occipital Lobe</span>
                  </div>
                  <div className="bg-surface-container-highest px-3 py-1.5 rounded-sm border border-outline-variant/20 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span className="font-label text-xs text-on-surface">Motor Cortex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
