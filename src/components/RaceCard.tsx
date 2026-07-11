import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { Meeting, fmtDate, meetingStatus } from "@/lib/openf1";
import StatusPill from "./StatusPill";
import { MapPinned } from "lucide-react";

export default function RaceCard({
  meeting,
  round,
}: {
  meeting: Meeting;
  round: number;
}) {
  const status = meetingStatus(meeting);

  return (
    <Link
      href={`/races/${meeting.meeting_key}`}
      className="group relative overflow-hidden rounded-2xl border border-line bg-panel hover:border-red/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red/10"
    >
      {/* Red Glow */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 p-5">
        {/* Round */}
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-panel-2 border border-line shrink-0">
          <span className="font-display text-lg font-bold text-red">
            {String(round).padStart(2, "0")}
          </span>
        </div>

        {/* Circuit */}
        {/* <div className="relative w-full md:w-40 h-24 rounded-xl bg-panel-2 border border-line overflow-hidden shrink-0">
          {meeting.circuit_image && (
            <Image
              src={meeting.circuit_image}
              alt={meeting.circuit_short_name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
          )}
        </div> */}
        {/* Circuit */}
        <div className="relative w-full md:w-40 h-24 bg-panel-2 border border-line overflow-hidden shrink-0 flex items-center justify-center group">

          {meeting.circuit_image ? (
            <Image
              src={meeting.circuit_image}
              alt={meeting.circuit_short_name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
              <MapPinned
                size={28}
                strokeWidth={1.5}
              />

              <span className="font-mono text-[10px] uppercase tracking-widest">
                No Circuit Data
              </span>
            </div>
          )}

        </div>
        {/* Race Info */}
        <div className="flex-1 w-full">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight group-hover:text-red transition-colors">
                {meeting.meeting_name}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                <MapPin size={15} />
                <span>
                  {meeting.circuit_short_name} • {meeting.location},{" "}
                  {meeting.country_name}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                <CalendarDays size={15} />
                <span>{fmtDate(meeting.date_start)}</span>
              </div>
            </div>

            <ChevronRight
              className="hidden md:block text-text-muted group-hover:text-red transition-all group-hover:translate-x-1"
              size={22}
            />
          </div>

          {/* Bottom */}
          <div className="mt-5 flex items-center justify-between">
            <StatusPill status={status} />

            <span className="font-mono text-xs tracking-widest text-text-muted uppercase">
              Round {round}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}