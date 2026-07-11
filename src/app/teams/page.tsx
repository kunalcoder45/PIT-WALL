import Image from "next/image";
import { getTeamLogo } from "@/lib/teamLogos";
import { openf1, latestCompletedRaceSession, CURRENT_SEASON } from "@/lib/openf1";

export const revalidate = 900;

export default async function TeamsPage() {
  const raceSession = await latestCompletedRaceSession();
  const sessionKey = raceSession?.session_key ?? "latest";

  const [drivers, teamStandings] = await Promise.all([
    openf1.drivers(sessionKey),
    raceSession ? openf1.championshipTeams(raceSession.session_key) : Promise.resolve([]),
  ]);

  const teamNames = Array.from(new Set(drivers.map((d) => d.team_name))).sort((a, b) => {
    const pa = teamStandings.find((t) => t.team_name === a)?.position_current ?? 99;
    const pb = teamStandings.find((t) => t.team_name === b)?.position_current ?? 99;
    return pa - pb;
  });

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red mb-2">
        {CURRENT_SEASON} Season
      </p>
      <h1 className="font-display font-[800] text-4xl sm:text-5xl tracking-tight mb-10">
        Teams
      </h1>
      <div className="grid sm:grid-cols-2 gap-5">
        {teamNames.map((name) => {
          const teamDrivers = drivers.filter((d) => d.team_name === name);
          const color = teamDrivers[0]?.team_colour ?? "444";
          const standing = teamStandings.find((t) => t.team_name === name);
          return (
            <div
              key={name}
              className="rounded-lg border border-line bg-panel overflow-hidden"
              style={{ borderTopColor: `#${color}`, borderTopWidth: "3px" }}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={getTeamLogo(name)}
                    alt={name}
                    width={42}
                    height={42}
                    className="w-10 h-10 object-contain shrink-0"
                  />

                  <h2 className="font-display font-[700] text-lg">
                    {name}
                  </h2>
                </div>

                {standing && (
                  <span className="font-mono text-sm text-amber">
                    P{standing.position_current} · {standing.points_current} pts
                  </span>
                )}
              </div>
              <div className="border-t border-line divide-y divide-line/60">
                {teamDrivers.map((d) => (
                  <div key={d.driver_number} className="flex items-center gap-3 px-4 py-3">
                    {d.headshot_url && (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-panel-2 shrink-0">
                        <Image src={d.headshot_url} alt={d.full_name} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[15px] leading-tight truncate">
                        {d.full_name}
                      </p>
                      <p className="text-xs text-text-muted">#{d.driver_number} · {d.name_acronym}</p>
                    </div>
                  </div>
                ))}
                {teamDrivers.length === 0 && (
                  <p className="px-4 py-3 text-sm text-text-muted">No driver data yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {teamNames.length === 0 && (
        <p className="text-text-muted">Team data isn&apos;t available yet for this season.</p>
      )}
    </div>
  );
}
