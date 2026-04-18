function buildWavePath(data, width, height, padding) {
  if (!data.length) {
    return {
      linePath: "",
      areaPath: "",
      min: 0,
      max: 0,
      range: 1,
    };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((value - min) / range) * (height - padding * 2);

    return { x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return {
    linePath,
    areaPath,
    min,
    max,
    range,
  };
}

export default function WaveformChart({ data = [], status = "Disconnected" }) {
  const width = 1000;
  const height = 100;
  const padding = 16;
  const { linePath, areaPath, min, max } = buildWavePath(data, width, height, padding);

  const hasData = data.length > 0;

  return (
    <section className="lg:col-span-8 bg-surface-container rounded-sm flex flex-col live-strip overflow-hidden relative">
      <div className="relative p-6 flex justify-between items-center bg-surface-container border-b border-background">
        <div className="flex items-center gap-3">
          <h2 className="font-headline font-semibold text-lg text-on-surface">Alpha/Beta Band Coherence</h2>
        </div>
        <div className="flex gap-2">
          <span className="bg-surface-container-highest px-2 py-1 rounded-sm text-xs font-label text-primary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Pre-Frontal
          </span>
          <span className="bg-surface-container-highest px-2 py-1 rounded-sm text-xs font-label text-on-surface-variant flex items-center gap-1">
            {status}
          </span>
        </div>

      </div>
      <div className="h-64 bg-surface-container-low crt-glow relative p-4 flex items-end overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(129,236,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(129,236,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,236,255,0.12),transparent_55%)]" />

        {hasData ? (
          <svg className="relative z-10 w-full h-full text-primary" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="wave-stroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="wave-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
              </linearGradient>
              <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="currentColor" floodOpacity="0.45" />
              </filter>
            </defs>

            <path d={areaPath} fill="url(#wave-fill)" opacity="0.7" />
            <path
              d={linePath}
              fill="none"
              stroke="url(#wave-stroke)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              filter="url(#wave-glow)"
            />
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.25"
              className="opacity-70"
            />

            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="6 6" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeOpacity="0.06" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeOpacity="0.06" />
          </svg>
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-2 text-center">
            <p className="font-headline text-lg text-on-surface">Awaiting EEG stream</p>
            <p className="font-body text-sm text-on-surface-variant">Connect the device to start rendering live activity.</p>
          </div>
        )}

        <div className="absolute bottom-2 left-4 right-4 z-10 flex justify-between text-[10px] font-label text-on-surface-variant">
          <span>{hasData ? `${min.toFixed(1)}` : "-5.0s"}</span>
          <span>{hasData ? `${((min + max) / 2).toFixed(1)}` : "-2.5s"}</span>
          <span>{hasData ? `${max.toFixed(1)}` : "Now"}</span>
        </div>
        <div className="absolute top-4 left-4 bottom-8 z-10 flex flex-col justify-between text-[10px] font-label text-on-surface-variant">
          <span>{hasData ? `${max.toFixed(1)}` : "+100µV"}</span>
          <span>0</span>
          <span>{hasData ? `${min.toFixed(1)}` : "-100µV"}</span>
        </div>
      </div>
    </section>
  );
}
