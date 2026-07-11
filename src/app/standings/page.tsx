import { openf1, latestCompletedRaceSession, fmtDate, CURRENT_SEASON } from "@/lib/openf1";
import { getTeamLogo } from "@/lib/teamLogos";
import Image from "next/image";

export const revalidate = 900;

export default async function StandingsPage() {
  const raceSession = await latestCompletedRaceSession();

  if (!raceSession) {
    return (
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16 text-center">
        <p className="text-text-muted">Standings will appear once the first race is complete.</p>
      </div>
    );
  }

  const [driverStandings, teamStandings, drivers] = await Promise.all([
    openf1.championshipDrivers(raceSession.session_key),
    openf1.championshipTeams(raceSession.session_key),
    openf1.drivers(raceSession.session_key),
  ]);

  const sortedDrivers = [...driverStandings].sort(
    (a, b) => a.position_current - b.position_current
  );
  const sortedTeams = [...teamStandings].sort(
    (a, b) => a.position_current - b.position_current
  );

  const driverInfo = (num: number) => drivers.find((d) => d.driver_number === num);
  const teamColor = (name: string) => drivers.find((d) => d.team_name === name)?.team_colour;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red mb-2">
        {CURRENT_SEASON} Season · through {fmtDate(raceSession.date_start)}
      </p>
      <h1 className="font-display font-[800] text-4xl sm:text-5xl tracking-tight mb-10">
        Championship Standings
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display font-[700] text-xl uppercase tracking-tight mb-4">
            Drivers
          </h2>
          <div className="rounded-lg border border-line overflow-hidden">
            {sortedDrivers.map((d, i) => {
              const info = driverInfo(d.driver_number);
              const delta = d.position_start - d.position_current;
              return (
                <div
                  key={d.driver_number}
                  className="flex items-center gap-3 px-4 py-3 border-b border-line/60 last:border-0 bg-panel"
                >
                  <span className="font-mono text-text-muted w-6">{d.position_current}</span>
                  <Image
                    src={getTeamLogo(info?.team_name)}
                    alt={info?.team_name ?? "Team"}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain shrink-0"
                  />

                  <span
                    className="w-1 h-7 rounded-full shrink-0"
                    style={{
                      backgroundColor: info ? `#${info.team_colour}` : "#444",
                    }}
                  />
                  {info?.headshot_url && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-panel-2 shrink-0 hidden sm:block">
                      <Image src={info.headshot_url} alt={info.full_name} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] leading-tight truncate">
                      {info?.full_name ?? `#${d.driver_number}`}
                    </p>
                    <p className="text-xs text-text-muted truncate">{info?.team_name}</p>
                  </div>
                  {delta !== 0 && i !== 0 && (
                    <span
                      className={`font-mono text-xs ${delta > 0 ? "text-green" : "text-red"}`}
                    >
                      {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                    </span>
                  )}
                  <span className="font-mono text-sm text-amber w-14 text-right">
                    {d.points_current} pts
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display font-[700] text-xl uppercase tracking-tight mb-4">
            Constructors
          </h2>
          <div className="rounded-lg border border-line overflow-hidden">
            {sortedTeams.map((t) => {
              const delta = t.position_start - t.position_current;
              return (
                <div
                  key={t.team_name}
                  className="flex items-center gap-3 px-4 py-3 border-b border-line/60 last:border-0 bg-panel"
                >
                  <span className="font-mono text-text-muted w-6">{t.position_current}</span>
                  <Image
                    src={getTeamLogo(t.team_name)}
                    alt={t.team_name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain shrink-0"
                  />

                  <span
                    className="w-1 h-7 rounded-full shrink-0"
                    style={{
                      backgroundColor: `#${teamColor(t.team_name) ?? "444"}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] leading-tight truncate">
                      {t.team_name}
                    </p>
                  </div>
                  {delta !== 0 && (
                    <span
                      className={`font-mono text-xs ${delta > 0 ? "text-green" : "text-red"}`}
                    >
                      {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                    </span>
                  )}
                  <span className="font-mono text-sm text-amber w-14 text-right">
                    {t.points_current} pts
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
