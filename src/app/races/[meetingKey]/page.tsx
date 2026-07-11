// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { openf1, fmtDate, fmtTime, sortSessions, meetingStatus } from "@/lib/openf1";
// import StatusPill from "@/components/StatusPill";
// import { RaceResultsTable, QualifyingResultsTable } from "@/components/ResultsTable";
// import { ArrowLeft, Flag, Thermometer, Gauge } from "lucide-react";
// import SessionResults from "@/components/SessionResults";

// export const revalidate = 900;

// export default async function RaceDetailPage({
//   params,
// }: {
//   params: Promise<{ meetingKey: string }>;
// }) {
//   const { meetingKey } = await params;
//   const meetingKeyNum = Number(meetingKey);

//   const meetings = await openf1.meeting(meetingKeyNum);
//   const meeting = meetings[0];
//   if (!meeting) notFound();

//   const sessions = sortSessions(await openf1.sessions(meetingKeyNum));
//   const raceSession = sessions.find((s) => s.session_name === "Race");
//   const qualiSession = sessions.find((s) => s.session_name === "Qualifying");
//   const sprintSession = sessions.find((s) => s.session_name === "Sprint");

//   // eslint-disable-next-line react-hooks/purity -- server component: evaluated once per request fetch, not a re-rendered client component
//   const now = Date.now();
//   const isSessionDone = (dateEnd: string) => new Date(dateEnd).getTime() < now;

//   const raceDone = raceSession && isSessionDone(raceSession.date_end);
//   const qualiDone = qualiSession && isSessionDone(qualiSession.date_end);

//   const [raceResults, qualiResults, qualiGrid, drivers, weather] = await Promise.all([
//     // raceDone ? openf1.sessionResult(raceSession!.session_key) : Promise.resolve([]),
//     const resultSessions = sessions.filter(
//     (s) => [
//       "Practice 1",
//       "Practice 2",
//       "Practice 3",
//       "Sprint Qualifying",
//       "Sprint",
//       "Qualifying",
//       "Race"
//     ].includes(s.session_name)
//   );


//   const resultData: any = {};

//   for (const session of resultSessions) {

//     const done =
//       new Date(session.date_end).getTime() < Date.now();


//     if (done) {
//       resultData[session.session_key] =
//         await openf1.sessionResult(session.session_key);
//     }

//   }
//   qualiDone ? openf1.sessionResult(qualiSession!.session_key) : Promise.resolve([]),
//     qualiDone ? openf1.startingGrid(qualiSession!.session_key) : Promise.resolve([]),
//     openf1.drivers(
//       raceSession?.session_key ?? qualiSession?.session_key ?? sessions[0]?.session_key ?? "latest"
//     ),
//     raceSession ? openf1.weather(meetingKeyNum) : Promise.resolve([]),
//   ]);

//   const latestWeather = weather[weather.length - 1];

//   return (
//     <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
//       <Link href="/races" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-red mb-6">
//         <ArrowLeft size={14} /> Full calendar
//       </Link>

//       {/* HEADER */}
//       <div className="flex flex-col lg:flex-row gap-8 lg:items-center border-b border-line pb-8 mb-8">
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-3">
//             {meeting.country_flag && (
//               <div className="relative w-7 h-5 shrink-0">
//                 <Image src={meeting.country_flag} alt={meeting.country_name} fill className="object-cover rounded-sm" unoptimized />
//               </div>
//             )}
//             <StatusPill status={meetingStatus(meeting)} />
//           </div>
//           <h1 className="font-display font-[800] text-3xl sm:text-5xl tracking-tight leading-tight">
//             {meeting.meeting_name}
//           </h1>
//           <p className="mt-2 text-text-muted">
//             {meeting.circuit_short_name} · {meeting.location}, {meeting.country_name} ·{" "}
//             {fmtDate(meeting.date_start)} – {fmtDate(meeting.date_end)}
//           </p>

//           <div className="mt-5 flex flex-wrap gap-4 text-sm">
//             <InfoPill icon={<Flag size={14} />} label="Circuit type" value={meeting.circuit_type} />
//             {latestWeather && (
//               <>
//                 <InfoPill
//                   icon={<Thermometer size={14} />}
//                   label="Track temp"
//                   value={`${latestWeather.track_temperature.toFixed(0)}°C`}
//                 />
//                 <InfoPill
//                   icon={<Gauge size={14} />}
//                   label="Air temp"
//                   value={`${latestWeather.air_temperature.toFixed(0)}°C`}
//                 />
//               </>
//             )}
//           </div>
//         </div>

//         {meeting.circuit_image && (
//           <div className="relative w-full lg:w-[360px] h-52 shrink-0 bg-panel border border-line rounded-lg">
//             <Image
//               src={meeting.circuit_image}
//               alt={meeting.circuit_short_name}
//               fill
//               className="object-contain p-6"
//               unoptimized
//             />
//           </div>
//         )}
//       </div>

//       {/* SCHEDULE */}
//       <section className="mb-10">
//         <h2 className="font-display font-[700] text-xl uppercase tracking-tight mb-4">
//           Weekend Schedule
//         </h2>
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
//           {sessions.map((s) => {
//             const done = isSessionDone(s.date_end);
//             const live = !done && new Date(s.date_start).getTime() < now;
//             return (
//               <div
//                 key={s.session_key}
//                 className="rounded-lg border border-line bg-panel p-4 flex items-center justify-between"
//               >
//                 <div>
//                   <p className="font-display font-[700] text-[15px]">{s.session_name}</p>
//                   <p className="text-xs text-text-muted font-mono mt-0.5">
//                     {fmtDate(s.date_start)} · {fmtTime(s.date_start)}
//                   </p>
//                 </div>
//                 <StatusPill status={live ? "live" : done ? "done" : "upcoming"} />
//               </div>
//             );
//           })}
//           {sessions.length === 0 && (
//             <p className="text-text-muted text-sm">Schedule not published yet.</p>
//           )}
//         </div>
//       </section>

//       {/* QUALIFYING */}
//       {qualiSession && (
//         <section className="mb-10">
//           <h2 className="font-display font-[700] text-xl uppercase tracking-tight mb-4">
//             Qualifying Result
//           </h2>
//           {qualiDone ? (
//             <QualifyingResultsTable results={qualiResults} grid={qualiGrid} drivers={drivers} />
//           ) : (
//             <EmptyNotice text="Qualifying hasn't happened yet — check back after the session." />
//           )}
//         </section>
//       )}

//       {/* SPRINT NOTE */}
//       {sprintSession && (
//         <p className="text-sm text-text-muted mb-6 -mt-6">
//           This is a sprint weekend — a Sprint session also runs alongside qualifying.
//         </p>
//       )}

//       {/* RACE RESULTS */}
//       {raceSession && (
//         <section>
//           // <h2 className="font-display font-[700] text-xl uppercase tracking-tight mb-4">
//           //   Race Result
//           // </h2>
//           // {raceDone ? (
//             //   <RaceResultsTable results={raceResults} drivers={drivers} />
//             // ) : (
//             //   <EmptyNotice text="Lights out hasn't happened yet — results will appear once the race finishes." />
//             // )}
//             <SessionResults

//               sessions={resultSessions}

//               results={resultData}

//               qualiGrid={{}}

//               drivers={drivers}

//               raceDefault={raceSession}

//             />
//         </section>
//       )}
//     </div>
//   );
// }

// function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-panel border border-line text-text-muted">
//       {icon}
//       <span className="text-xs uppercase tracking-wide">{label}</span>
//       <span className="font-mono text-text">{value}</span>
//     </div>
//   );
// }

// function EmptyNotice({ text }: { text: string }) {
//   return (
//     <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-text-muted">
//       {text}
//     </div>
//   );
// }
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { openf1, fmtDate, sortSessions, meetingStatus } from "@/lib/openf1";
// import StatusPill from "@/components/StatusPill";
// import SessionResults, {
//   SessionInfo,
//   RaceResultItem,
//   QualiGridItem,
// } from "@/components/SessionResults";
// import { ArrowLeft, Flag, Thermometer, Gauge } from "lucide-react";

// export const revalidate = 900;

// const QUALI_TYPE_SESSIONS = new Set(["Qualifying", "Sprint Qualifying"]);

// export default async function RaceDetailPage({
//   params,
// }: {
//   params: Promise<{ meetingKey: string }>;
// }) {
//   const { meetingKey } = await params;
//   const meetingKeyNum = Number(meetingKey);

//   const meetings = await openf1.meeting(meetingKeyNum);
//   const meeting = meetings[0];
//   if (!meeting) notFound();

//   const sessions: SessionInfo[] = sortSessions(await openf1.sessions(meetingKeyNum));
//   const raceSession = sessions.find((s) => s.session_name === "Race");

//   const now = Date.now();
//   const isSessionDone = (dateEnd: string) => new Date(dateEnd).getTime() < now;

//   const drivers = await openf1.drivers(
//     raceSession?.session_key ?? sessions[0]?.session_key ?? "latest"
//   );

//   // Fetch results for EVERY completed session, not just race/quali
//   const resultEntries = await Promise.all(
//     sessions.map(async (s) => {
//       if (!isSessionDone(s.date_end)) return [s.session_key, []] as const;
//       const res: RaceResultItem[] = await openf1.sessionResult(s.session_key);
//       return [s.session_key, res] as const;
//     })
//   );
//   const results: Record<number, RaceResultItem[]> = Object.fromEntries(resultEntries);

//   // Starting grid only applies to Qualifying / Sprint Qualifying sessions
//   const gridEntries = await Promise.all(
//     sessions
//       .filter((s) => QUALI_TYPE_SESSIONS.has(s.session_name) && isSessionDone(s.date_end))
//       .map(async (s) => {
//         const grid: QualiGridItem[] = await openf1.startingGrid(s.session_key);
//         return [s.session_key, grid] as const;
//       })
//   );
//   const qualiGrid: Record<number, QualiGridItem[]> = Object.fromEntries(gridEntries);

//   const weather = raceSession ? await openf1.weather(meetingKeyNum) : [];
//   const latestWeather = weather[weather.length - 1];

//   return (
//     <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
//       <Link href="/races" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-red mb-6">
//         <ArrowLeft size={14} /> Full calendar
//       </Link>

//       {/* HEADER */}
//       <div className="flex flex-col lg:flex-row gap-8 lg:items-center border-b border-line pb-8 mb-8">
//         <div className="flex-1">
//           <div className="flex items-center gap-3 mb-3">
//             {meeting.country_flag && (
//               <div className="relative w-7 h-5 shrink-0">
//                 <Image src={meeting.country_flag} alt={meeting.country_name} fill className="object-cover rounded-sm" unoptimized />
//               </div>
//             )}
//             <StatusPill status={meetingStatus(meeting)} />
//           </div>
//           <h1 className="font-display font-[800] text-3xl sm:text-5xl tracking-tight leading-tight">
//             {meeting.meeting_name}
//           </h1>
//           <p className="mt-2 text-text-muted">
//             {meeting.circuit_short_name} · {meeting.location}, {meeting.country_name} ·{" "}
//             {fmtDate(meeting.date_start)} – {fmtDate(meeting.date_end)}
//           </p>

//           <div className="mt-5 flex flex-wrap gap-4 text-sm">
//             <InfoPill icon={<Flag size={14} />} label="Circuit type" value={meeting.circuit_type} />
//             {latestWeather && (
//               <>
//                 <InfoPill icon={<Thermometer size={14} />} label="Track temp" value={`${latestWeather.track_temperature.toFixed(0)}°C`} />
//                 <InfoPill icon={<Gauge size={14} />} label="Air temp" value={`${latestWeather.air_temperature.toFixed(0)}°C`} />
//               </>
//             )}
//           </div>
//         </div>

//         {meeting.circuit_image && (
//           <div className="relative w-full lg:w-[360px] h-52 shrink-0 bg-panel border border-line rounded-lg">
//             <Image src={meeting.circuit_image} alt={meeting.circuit_short_name} fill className="object-contain p-6" unoptimized />
//           </div>
//         )}
//       </div>

//       {/* SESSIONS + RESULTS — ek hi jagah, Race default open, click se switch */}
//       <section>
//         <SessionResults
//           sessions={sessions}
//           results={results}
//           qualiGrid={qualiGrid}
//           drivers={drivers}
//           raceDefault={raceSession}
//         />
//       </section>
//     </div>
//   );
// }

// function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-panel border border-line text-text-muted">
//       {icon}
//       <span className="text-xs uppercase tracking-wide">{label}</span>
//       <span className="font-mono text-text">{value}</span>
//     </div>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { openf1, fmtDate, sortSessions, meetingStatus } from "@/lib/openf1";
import type { Session, SessionResult, StartingGridEntry } from "@/lib/openf1";
import StatusPill from "@/components/StatusPill";
import SessionResults, { SessionWithStatus } from "@/components/SessionResults";
import { ArrowLeft, Flag, Thermometer, Gauge } from "lucide-react";

export const revalidate = 900;

const QUALI_TYPE_SESSIONS = new Set(["Qualifying", "Sprint Qualifying"]);

export default async function RaceDetailPage({
  params,
}: {
  params: Promise<{ meetingKey: string }>;
}) {
  const { meetingKey } = await params;
  const meetingKeyNum = Number(meetingKey);

  const meetings = await openf1.meeting(meetingKeyNum);
  const meeting = meetings[0];
  if (!meeting) notFound();

  const sessions: Session[] = sortSessions(await openf1.sessions(meetingKeyNum));
  const raceSession = sessions.find((s) => s.session_name === "Race");

  // Computed once per request in a Server Component — not a re-rendered client
  // component, so this is a legitimate, deliberate exception to the purity rule.
  // eslint-disable-next-line react-hooks/purity -- server-only, evaluated once per request
  const now = Date.now();
  const isDone = (dateEnd: string) => new Date(dateEnd).getTime() < now;

  // Attach a stable `done` flag to each session so the client component
  // never needs to call Date.now() itself.
  const sessionsWithStatus: SessionWithStatus[] = sessions.map((s) => ({
    ...s,
    done: isDone(s.date_end),
  }));
  const raceSessionWithStatus = sessionsWithStatus.find((s) => s.session_name === "Race");

  const drivers = await openf1.drivers(
    raceSession?.session_key ?? sessions[0]?.session_key ?? "latest"
  );

  // Results for every completed session (Practice included, not just Quali/Race)
  const resultEntries = await Promise.all(
    sessionsWithStatus.map(async (s) => {
      if (!s.done) return [s.session_key, []] as const;
      const res: SessionResult[] = await openf1.sessionResult(s.session_key);
      return [s.session_key, res] as const;
    })
  );
  const results: Record<number, SessionResult[]> = Object.fromEntries(resultEntries);

  // Starting grid only applies to Qualifying / Sprint Qualifying sessions
  const gridEntries = await Promise.all(
    sessionsWithStatus
      .filter((s) => QUALI_TYPE_SESSIONS.has(s.session_name) && s.done)
      .map(async (s) => {
        const grid: StartingGridEntry[] = await openf1.startingGrid(s.session_key);
        return [s.session_key, grid] as const;
      })
  );
  const qualiGrid: Record<number, StartingGridEntry[]> = Object.fromEntries(gridEntries);

  const weather = raceSession ? await openf1.weather(meetingKeyNum) : [];
  const latestWeather = weather[weather.length - 1];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <Link href="/races" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-red mb-6">
        <ArrowLeft size={14} /> Full calendar
      </Link>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center border-b border-line pb-8 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {meeting.country_flag && (
              <div className="relative w-7 h-5 shrink-0">
                <Image src={meeting.country_flag} alt={meeting.country_name} fill className="object-cover rounded-sm" unoptimized />
              </div>
            )}
            <StatusPill status={meetingStatus(meeting)} />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
            {meeting.meeting_name}
          </h1>
          <p className="mt-2 text-text-muted">
            {meeting.circuit_short_name} · {meeting.location}, {meeting.country_name} ·{" "}
            {fmtDate(meeting.date_start)} – {fmtDate(meeting.date_end)}
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <InfoPill icon={<Flag size={14} />} label="Circuit type" value={meeting.circuit_type} />
            {latestWeather && (
              <>
                <InfoPill icon={<Thermometer size={14} />} label="Track temp" value={`${latestWeather.track_temperature.toFixed(0)}°C`} />
                <InfoPill icon={<Gauge size={14} />} label="Air temp" value={`${latestWeather.air_temperature.toFixed(0)}°C`} />
              </>
            )}
          </div>
        </div>

        {meeting.circuit_image && (
          <div className="relative w-full lg:w-90 h-52 shrink-0 bg-panel border border-line rounded-lg">
            <Image src={meeting.circuit_image} alt={meeting.circuit_short_name} fill className="object-contain p-6" unoptimized />
          </div>
        )}
      </div>

      {/* SESSIONS + RESULTS — Race default open, click se switch, ek time me ek hi result */}
      <section>
        <SessionResults
          sessions={sessionsWithStatus}
          results={results}
          qualiGrid={qualiGrid}
          drivers={drivers}
          raceDefault={raceSessionWithStatus}
        />
      </section>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-panel border border-line text-text-muted">
      {icon}
      <span className="text-xs uppercase tracking-wide">{label}</span>
      <span className="font-mono text-text">{value}</span>
    </div>
  );
}