import Link from "next/link";
import { fmtDate, fmtTime } from "@/lib/openf1";
import type { Session } from "@/lib/openf1";

export type SessionWithStatus = Session & { status: "live" | "done" | "upcoming" };

export default function WeekendScheduleStrip({
  sessions,
  meetingKey,
}: {
  sessions: SessionWithStatus[];
  meetingKey: number;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {sessions.map((s) => (
        <Link
          key={s.session_key}
          href={`/races/${meetingKey}`}
          className={`rounded-lg border p-3 transition-colors ${
            s.status === "live"
              ? "border-red bg-red/10"
              : "border-line bg-panel hover:border-red/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-white">{s.session_name}</p>
            <StatusDot status={s.status} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-muted">
            {fmtDate(s.date_start)} · {fmtTime(s.date_start)}
          </p>
        </Link>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: "live" | "done" | "upcoming" }) {
  if (status === "live") {
    return <span className="h-2 w-2 animate-pulse rounded-full bg-red" />;
  }
  if (status === "done") {
    return <span className="h-2 w-2 rounded-full bg-track-green, bg-emerald-500" />;
  }
  return <span className="h-2 w-2 rounded-full bg-white/20" />;
}