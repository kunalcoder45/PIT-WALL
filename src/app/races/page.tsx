import { openf1, CURRENT_SEASON } from "@/lib/openf1";
import RaceCard from "@/components/RaceCard";

export const revalidate = 1800;

export default async function RacesPage() {
  const meetings = (await openf1.meetings(CURRENT_SEASON)).sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red mb-2">
        {CURRENT_SEASON} Season
      </p>
      <h1 className="font-display font-[800] text-4xl sm:text-5xl tracking-tight mb-8">
        Race Calendar
      </h1>
      <div className="grid gap-3">
        {meetings.map((m, i) => (
          <RaceCard key={m.meeting_key} meeting={m} round={i + 1} />
        ))}
      </div>
      {meetings.length === 0 && (
        <p className="text-text-muted">No meetings found for {CURRENT_SEASON} yet.</p>
      )}
    </div>
  );
}
