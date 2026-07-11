import Image from "next/image";
import Link from "next/link";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";
import type { SessionResult, Driver, Meeting } from "@/lib/openf1";

function fmtRaceTime(duration: SessionResult["duration"]): string {
  const d = Array.isArray(duration) ? duration[0] : duration;
  if (typeof d !== "number") return "—";
  const mins = Math.floor(d / 60);
  const secs = (d % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

function PositionIcon({ position }: { position: number }) {
  if (position === 1) return <Trophy size={16} className="text-amber-400" />;
  if (position === 2) return <Medal size={16} className="text-zinc-300" />;
  return <Medal size={16} className="text-orange-400" />;
}

export default function LastRaceRecap({
  meeting,
  results,
  drivers,
}: {
  meeting: Meeting;
  results: SessionResult[];
  drivers: Driver[];
}) {
  const podium = [...results]
    .filter((r) => r.position && r.position <= 3)
    .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

  if (podium.length === 0) return null;

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-red">Last Race</p>
          <h3 className="font-display text-lg text-white">{meeting.meeting_name}</h3>
        </div>
        <Link
          href={`/races/${meeting.meeting_key}`}
          className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-red"
        >
          Full result <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {podium.map((r, i) => {
          const d = driverMap.get(r.driver_number);
          const logo = getTeamLogo(d?.team_name);
          const position = r.position ?? i + 1;
          return (
            <div
              key={r.driver_number}
              className="flex items-center gap-3 rounded-lg border border-line/50 bg-black/20 px-3 py-2.5"
            >
              <span className="flex w-6 justify-center">
                <PositionIcon position={position} />
              </span>
              {logo ? (
                <Image src={logo} alt={d?.team_name ?? ""} width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
              ) : (
                <div className="h-6 w-6 shrink-0 rounded-full bg-neutral-700" />
              )}
              <span
                className="h-6 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: d ? `#${d.team_colour}` : "#444" }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-white">{d?.full_name ?? `#${r.driver_number}`}</p>
                <p className="truncate text-xs text-text-muted">{d?.team_name}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-text-muted">
                {position === 1 ? fmtRaceTime(r.duration) : r.gap_to_leader ? `+${r.gap_to_leader}` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}