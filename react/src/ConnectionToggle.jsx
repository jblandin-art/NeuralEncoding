export default function ConnectionToggle({
  status,
  error,
  isOn,
  isBusy,
  onToggle,
}) {
  const statusTone = isBusy
    ? "text-secondary"
    : isOn
      ? "text-tertiary"
      : "text-on-surface-variant";

  const statusChip = isBusy
    ? "bg-secondary/10 text-secondary border-secondary/20"
    : isOn
      ? "bg-tertiary/10 text-tertiary border-tertiary/20"
      : "bg-surface-container-highest text-on-surface-variant border-outline/20";

  const railTone = isOn
    ? "bg-gradient-to-r from-primary/15 via-primary/20 to-tertiary/15 shadow-[inset_0_0_0_1px_rgba(129,236,255,0.12)]"
    : "bg-gradient-to-r from-surface-container-highest via-surface-container-highest to-surface-container-high shadow-[inset_0_0_0_1px_rgba(236,237,246,0.05)]";

  const knobLeft = isOn ? 48 : 4;

  return (
    <section className="relative bg-surface-container rounded-sm p-6 pt-10 flex flex-col gap-5 border border-outline-variant/10">
      <span
        className={`absolute top-0 left-0 inline-flex h-7 w-[112px] items-center justify-center rounded-br-sm border-b border-r px-2 text-[10px] font-label uppercase tracking-[0.18em] ${statusChip}`}
      >
        <span className="truncate">{status}</span>
      </span>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline font-semibold text-lg text-on-surface tracking-tight">
            Device Connection
          </h3>
          <p className="font-body text-xs text-on-surface-variant mt-1 max-w-xs leading-5">
            Controls the EEG stream and waveform polling.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-label text-xs uppercase tracking-[0.24em] text-on-surface-variant">
            Connection
          </span>
          <span className={`text-sm font-semibold ${statusTone}`}>{status}</span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`Device connection toggle. Current status: ${status}`}
          aria-busy={isBusy}
          disabled={isBusy}
          onClick={onToggle}
          className={`relative h-11 w-[88px] rounded-full p-1 transition-all duration-300 ease-out overflow-hidden ${railTone} ${
            isBusy ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(129,236,255,0.08),transparent_50%)]" />
          <span
            className={`absolute top-1 h-9 w-9 rounded-full border transition-[left,transform,box-shadow,background-color] duration-300 ease-out ${
              isOn
                ? "border-white/55 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.16)]"
                : "border-outline-variant/40 bg-[#f8fafc] shadow-[0_2px_6px_rgba(0,0,0,0.16)]"
            }`}
            style={{ left: `${knobLeft}px` }}
          >
            <span
              className={`absolute inset-[10px] rounded-full transition-colors duration-300 ${
                isOn ? "bg-primary/80" : "bg-slate-400"
              }`}
            />
          </span>

          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.22em] text-on-surface-variant/70">
            OFF
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.22em] text-on-surface-variant/70">
            ON
          </span>
        </button>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
