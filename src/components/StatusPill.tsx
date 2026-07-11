export default function StatusPill({ status }: { status: "done" | "live" | "upcoming" }) {
  const map = {
    done: { label: "Finished", cls: "bg-panel-2 text-text-muted border-line" },
    live: { label: "Live", cls: "bg-red/10 text-red border-red/40" },
    upcoming: { label: "Upcoming", cls: "bg-amber/10 text-amber border-amber/30" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-display uppercase tracking-widest px-2.5 py-1 rounded-sm border ${s.cls}`}
    >
      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-red pulse-live" />}
      {s.label}
    </span>
  );
}
