import Image from "next/image";
import { getTeamLogo } from "@/lib/teamLogos";
import Link from "next/link";
import {
  openf1,
  fmtDate,
  fmtTime,
  meetingStatus,
  latestCompletedRaceSession,
  sortSessions,
  CURRENT_SEASON,
} from "@/lib/openf1";
import CountdownWrapper from "@/components/CountdownWrapper";
import { ArrowRight, MapPin, Trophy, Flag, Thermometer, History, CalendarDays } from "lucide-react";
import CalendarStrip from "@/components/CalendarFilter";
// import GpTelemetryExplorer from "@/components/GpTelemetryExplorer";
import BroadcastTicker from "@/components/BroadcastTicker";
import WeekendScheduleStrip, { SessionWithStatus } from "@/components/WeekendScheduleStrip";
import LastRaceRecap from "@/components/LastRaceRecap";


export const revalidate = 1800;

export default async function Home() {
  const meetings = (await openf1.meetings(CURRENT_SEASON)).sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  // eslint-disable-next-line react-hooks/purity -- server component: evaluated once per request fetch, not a re-rendered client component
  const now = Date.now();
  const nextMeeting =
    meetings.find((m) => new Date(m.date_end).getTime() > now) ?? meetings[meetings.length - 1];

  const nextMeetingSessions = nextMeeting
    ? sortSessions(await openf1.sessions(nextMeeting.meeting_key))
    : [];
  const raceSession = nextMeetingSessions.find((s) => s.session_name === "Race");

  // Precompute status once here, so client components never need Date.now()
  const sessionsWithStatus: SessionWithStatus[] = nextMeetingSessions.map((s) => {
    const startMs = new Date(s.date_start).getTime();
    const endMs = new Date(s.date_end).getTime();
    const status: SessionWithStatus["status"] =
      now >= startMs && now <= endMs ? "live" : now > endMs ? "done" : "upcoming";
    return { ...s, status };
  });

  const latestRace = await latestCompletedRaceSession();
  const [driverStandings, teamStandings] = latestRace
    ? await Promise.all([
      openf1.championshipDrivers(latestRace.session_key),
      openf1.championshipTeams(latestRace.session_key),
    ])
    : [[], []];
  const drivers = latestRace ? await openf1.drivers(latestRace.session_key) : [];
  const lastRaceResults = latestRace ? await openf1.sessionResult(latestRace.session_key) : [];
  const lastRaceMeeting = latestRace
    ? meetings.find((m) => m.meeting_key === latestRace.meeting_key)
    : undefined;

  const nextWeather = nextMeeting ? await openf1.weather(nextMeeting.meeting_key) : [];
  const latestWeather = nextWeather[nextWeather.length - 1];

  const topDrivers = [...driverStandings]
    .sort((a, b) => a.position_current - b.position_current)
    .slice(0, 3);
  const topTeams = [...teamStandings]
    .sort((a, b) => a.position_current - b.position_current)
    .slice(0, 4);

  const championshipLeader =
    topDrivers[0] && drivers.find((d) => d.driver_number === topDrivers[0].driver_number);

  const tickerItems = [
    nextMeeting && {
      icon: <Flag size={12} />,
      text: `Round ${meetings.indexOf(nextMeeting) + 1} of ${meetings.length} · ${nextMeeting.meeting_name}`,
    },
    nextMeeting && { icon: <MapPin size={12} />, text: `${nextMeeting.location}, ${nextMeeting.country_name}` },
    latestWeather && {
      icon: <Thermometer size={12} />,
      text: `Track temp ${latestWeather.track_temperature.toFixed(0)}°C`,
    },
    championshipLeader && {
      icon: <Trophy size={12} />,
      text: `Championship leader: ${championshipLeader.full_name} · ${topDrivers[0].points_current} PTS`,
    },
    lastRaceMeeting && { icon: <History size={12} />, text: `Last race: ${lastRaceMeeting.meeting_name}` },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <div>
      {/* HERO */}
      {/* <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-red mb-3">
                {nextMeeting && meetingStatus(nextMeeting) === "live"
                  ? "Session Live Now"
                  : `Next up · Round ${meetings.indexOf(nextMeeting) + 1} of ${meetings.length}`}
              </p>
              <h1 className="font-display font-extrabold text-6xl sm:text-6xl leading-[0.95] tracking-tight">
                {nextMeeting?.meeting_name ?? "Season complete"}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm sm:text-base text-text-muted">
                <MapPin size={15} />
                {nextMeeting?.circuit_short_name}, {nextMeeting?.location}, {nextMeeting?.country_name}
              </p>

              {raceSession && (
                <div className="mt-8">
                  <CountdownWrapper targetIso={raceSession.date_start} />
                  <p className="mt-3 text-sm text-text-muted font-mono">
                    Race start · {fmtDate(raceSession.date_start)} · {fmtTime(raceSession.date_start)}
                  </p>
                </div>
              )}

              {nextMeeting && (
                <Link
                  href={`/races/${nextMeeting.meeting_key}`}
                  className="mt-8 inline-flex items-center gap-2 font-display uppercase tracking-wide text-sm bg-red text-white px-5 py-2.5 rounded-sm hover:bg-red/90 transition-colors"
                >
                  Weekend schedule <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {nextMeeting?.circuit_image && (
              <div className="relative w-full lg:w-[380px] h-56 shrink-0 bg-panel border border-line rounded-lg">
                <Image
                  src={nextMeeting.circuit_image}
                  alt={nextMeeting.circuit_short_name}
                  fill
                  className="object-contain p-6"
                  unoptimized
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section> */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Animated racing line */}
        <div className="absolute top-0 left-0 h-[1px] w-full overflow-hidden">
          <div className="hero-racing-line h-full bg-red" />
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-center">

            <div className="flex-1 min-w-0">

              <p className="fade-rise font-mono text-xs uppercase tracking-[0.3em] text-red mb-4">
                {nextMeeting && meetingStatus(nextMeeting) === "live"
                  ? "Session Live Now"
                  : `Next Up · Round ${meetings.indexOf(nextMeeting) + 1} of ${meetings.length}`}
              </p>


              <h1
                className="hero-title text-6xl sm:text-7xl leading-[0.9] tracking-tight text-white"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                }}
              >
                {nextMeeting?.meeting_name ?? "Season complete"}
              </h1>


              <p
                className="mt-5 flex items-center gap-2 text-sm sm:text-base text-text-muted fade-rise"
                style={{ animationDelay: "0.2s" }}
              >
                <MapPin size={16} className="text-red" />
                {nextMeeting?.circuit_short_name}, {nextMeeting?.location},{" "}
                {nextMeeting?.country_name}
              </p>


              <div className="mt-4 h-[1px] w-24 bg-red hero-line" />


              {raceSession && (
                <div className="mt-8 fade-rise" style={{ animationDelay: "0.35s" }}>
                  <CountdownWrapper targetIso={raceSession.date_start} />

                  <p className="mt-3 text-xs sm:text-sm text-text-muted font-mono uppercase tracking-wider">
                    Race start · {fmtDate(raceSession.date_start)} ·{" "}
                    {fmtTime(raceSession.date_start)}
                  </p>
                </div>
              )}


              {nextMeeting && (
                <Link
                  href={`/races/${nextMeeting.meeting_key}`}
                  className="mt-8 inline-flex items-center gap-3 font-display uppercase tracking-widest text-sm bg-red text-white px-6 py-3 rounded-sm hover:bg-red/90 transition-all group">
                  Weekend Schedule
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}

            </div>



            {nextMeeting?.circuit_image && (
              <div className="
          relative w-full lg:w-[400px]
          h-60
          bg-panel
          border border-line
          rounded-lg
          overflow-hidden
          circuit-card
        ">
                <Image
                  src={nextMeeting.circuit_image}
                  alt={nextMeeting.circuit_short_name}
                  fill
                  className="object-contain p-8"
                  unoptimized
                  priority
                />
                <div className="absolute bottom-0 left-0 h-[2px] bg-red circuit-progress" />

              </div>
            )}

          </div>
        </div>
      </section>
      {/* LIVE BROADCAST TICKER */}
      <BroadcastTicker items={tickerItems} />

      {/* WEEKEND SCHEDULE STRIP */}
      {nextMeeting && sessionsWithStatus.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
          <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight mb-4">
            This Weekend
          </h2>
          <WeekendScheduleStrip sessions={sessionsWithStatus} meetingKey={nextMeeting.meeting_key} />
        </section>
      )}

      {/* LAST RACE RECAP + CHAMPIONSHIP SNAPSHOT */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10 grid gap-6 lg:grid-cols-3">
        {lastRaceMeeting && lastRaceResults.length > 0 && (
          <div className="lg:col-span-1">
            <LastRaceRecap meeting={lastRaceMeeting} results={lastRaceResults} drivers={drivers} />
          </div>
        )}

        {(topDrivers.length > 0 || topTeams.length > 0) && (
          <div className={`grid gap-6 sm:grid-cols-2 ${lastRaceMeeting ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <SnapshotCard title="Drivers' Championship" href="/standings" icon={<Trophy size={16} />}>
              {topDrivers.map((d, i) => {
                const driver = drivers.find((dr) => dr.driver_number === d.driver_number);
                return (
                  <SnapshotRow
                    key={d.driver_number}
                    pos={i + 1}
                    name={driver?.full_name ?? `#${d.driver_number}`}
                    sub={driver?.team_name}
                    logo={getTeamLogo(driver?.team_name)}
                    color={driver ? `#${driver.team_colour}` : undefined}
                    value={`${d.points_current} PTS`}
                  />
                );
              })}
            </SnapshotCard>

            <SnapshotCard title="Constructors' Championship" href="/standings" icon={<Flag size={16} />}>
              {topTeams.map((t, i) => {
                const teamDriver = drivers.find((dr) => dr.team_name === t.team_name);
                return (
                  <SnapshotRow
                    key={t.team_name}
                    pos={i + 1}
                    name={t.team_name}
                    logo={getTeamLogo(teamDriver?.team_name)}
                    color={teamDriver ? `#${teamDriver.team_colour}` : undefined}
                    value={`${t.points_current} PTS`}
                  />
                );
              })}
            </SnapshotCard>
          </div>
        )}
      </section>

      {/* LAP-BY-LAP TELEMETRY */}
      {/* <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-red" />
          Lap-by-Lap Telemetry
        </h2>
        <GpTelemetryExplorer meetings={meetings} />
      </section> */}
      {/* 
      <PaddockChronicle
        entries={[
          {
            round: "Round 01",
            headline: "A season begins under the lights",
            excerpt:
              "Every championship starts the same way — five red lights, twenty engines, and a grid full of promises yet to be kept. This year's opener set the tone for what's to come.",
          },
          {
            round: "Round 04",
            headline: "The gap that wasn't supposed to close",
            excerpt:
              "Nobody expected the midfield to bite this hard, this early. What looked like a comfortable lead in March had shrunk to fractions of a second by the fourth round.",
          },
          {
            round: "Round 09",
            headline: "A wet Sunday changes everything",
            excerpt:
              "Rain has a way of rewriting the script. Strategy calls made in the garage on Saturday night suddenly meant nothing once the sky opened up.",
          },
        ]}
      /> */}

      {/* CALENDAR STRIP */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <CalendarStrip meetings={meetings} season={CURRENT_SEASON} />
      </section>
    </div>
  );
}

function SnapshotCard({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-line bg-panel p-5 hover:border-red/40 transition-colors"
    >
      <div className="mb-4 flex items-center justify-between">
        {/* <h3 className="font-display uppercase tracking-wide text-sm text-text-muted">{title}</h3> */}
        <div>
          {title === "Drivers' Championship" && (
            <p className=" flex items-center gap-1.5 text-xs font-mono text-red">
              <CalendarDays size={12} />
              {new Date().getFullYear()} Title Fight
            </p>
          )}
          <h3 className="font-display uppercase tracking-wide text-lg text-white ">
            {title}
          </h3>
        </div>
        <span className="text-red">{icon}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </Link>
  );
}

function SnapshotRow({
  pos,
  name,
  sub,
  logo,
  color,
  value,
}: {
  pos: number;
  name: string;
  sub?: string;
  logo?: string;
  color?: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line/50 bg-black/20 px-3 py-2.5">
      <span className="w-6 text-center font-mono text-sm text-text-muted">{pos}</span>
      {logo ? (
        <Image src={logo} alt={name} width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full bg-neutral-700" />
      )}
      <span className="h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: color ?? "#444" }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm text-white">{name}</p>
        {sub && <p className="truncate text-xs text-text-muted">{sub}</p>}
      </div>
      <span className="shrink-0 font-mono text-xs text-amber-400">{value}</span>
    </div>
  );
}