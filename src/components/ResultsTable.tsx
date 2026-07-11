import Image from "next/image";
import { getTeamLogo } from "@/lib/teamLogos";
import { Driver, SessionResult, StartingGridEntry, fmtDuration, fmtGap } from "@/lib/openf1";

function driverFor(drivers: Driver[], num: number) {
  return drivers.find((d) => d.driver_number === num);
}

function posLabel(pos: number | null, dnf: boolean, dns: boolean, dsq: boolean) {
  if (dsq) return "DSQ";
  if (dns) return "DNS";
  if (dnf) return "DNF";
  return pos ?? "—";
}

export function RaceResultsTable({
  results,
  drivers,
}: {
  results: SessionResult[];
  drivers: Driver[];
}) {
  const sorted = [...results].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-panel-2 text-text-muted uppercase text-[11px] tracking-wider font-display">
            <th className="text-left px-4 py-3 w-12">Pos</th>
            <th className="text-left px-4 py-3">Driver</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Team</th>
            <th className="text-right px-4 py-3">Time / Gap</th>
            <th className="text-right px-4 py-3 hidden sm:table-cell">Laps</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const d = driverFor(drivers, r.driver_number);
            const isLeader = i === 0;
            return (
              <tr
                key={r.driver_number}
                className="border-b border-line/60 last:border-0 hover:bg-panel-2/60 transition-colors"
              >
                <td
                  className={`px-4 py-2.5 font-mono ${r.dnf
                    ? "text-yellow-400"
                    : r.dns
                      ? "text-blue-400"
                      : r.dsq
                        ? "text-red"
                        : "text-text-muted"
                    }`}
                >
                  {posLabel(r.position, r.dnf, r.dns, r.dsq)}
                </td>
                <td className="px-4 py-2.5">
                  <DriverCell driver={d} fallbackNum={r.driver_number} />
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <div className="flex items-center gap-2 text-text-muted">

                    {d?.team_name && (
                      <Image
                        src={getTeamLogo(d.team_name)}
                        alt={d.team_name}
                        width={22}
                        height={22}
                        className="object-contain w-5 h-5"
                      />
                    )}

                    <span>
                      {d?.team_name ?? "—"}
                    </span>

                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {isLeader
                    ? fmtDuration(Array.isArray(r.duration) ? null : r.duration)
                    : fmtGap(Array.isArray(r.gap_to_leader) ? null : r.gap_to_leader)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-text-muted hidden sm:table-cell">
                  {r.number_of_laps ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function QualifyingResultsTable({
  results,
  grid,
  drivers,
}: {
  results: SessionResult[];
  grid: StartingGridEntry[];
  drivers: Driver[];
}) {
  const rows = grid.length > 0 ? grid : results;
  const sorted = [...rows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-panel-2 text-text-muted uppercase text-[11px] tracking-wider font-display">
            <th className="text-left px-4 py-3 w-12">Grid</th>
            <th className="text-left px-4 py-3">Driver</th>
            <th className="text-left px-4 py-3 hidden sm:table-cell">Team</th>
            <th className="text-right px-4 py-3">Best Lap</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const d = driverFor(drivers, r.driver_number);
            const lap = "lap_duration" in r ? r.lap_duration : null;
            return (
              <tr
                key={r.driver_number}
                className="border-b border-line/60 last:border-0 hover:bg-panel-2/60 transition-colors"
              >
                <td className="px-4 py-2.5 font-mono text-text-muted">{r.position ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <DriverCell driver={d} fallbackNum={r.driver_number} />
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <div className="flex items-center gap-2 text-text-muted">

                    {d?.team_name && (
                      <Image
                        src={getTeamLogo(d.team_name)}
                        alt={d.team_name}
                        width={22}
                        height={22}
                        className="object-contain w-5 h-5"
                      />
                    )}

                    <span>
                      {d?.team_name ?? "—"}
                    </span>

                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">{fmtDuration(lap)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DriverCell({ driver, fallbackNum }: { driver?: Driver; fallbackNum: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-1 h-5 rounded-full shrink-0"
        style={{ backgroundColor: driver ? `#${driver.team_colour}` : "#444" }}
      />
      {driver?.headshot_url ? (
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-panel-2 shrink-0 hidden sm:block">
          <Image src={driver.headshot_url} alt={driver.full_name} fill className="object-cover" unoptimized />
        </div>
      ) : null}
      <span className="font-medium">
        {driver ? driver.full_name : `#${fallbackNum}`}
      </span>
      {driver && (
        <span className="font-mono text-xs text-text-muted">#{driver.driver_number}</span>
      )}
    </div>
  );
}
