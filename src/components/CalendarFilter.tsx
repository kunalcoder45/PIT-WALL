"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RaceCard from "./RaceCard";
import { Meeting } from "@/lib/openf1";

type FilterType = "default" | "latest" | "ending";

export default function CalendarStrip({
    meetings,
    season,
}: {
    meetings: Meeting[];
    season: number;
}) {
    const [filter, setFilter] = useState<FilterType>("default");
    const sortedMeetings = [...meetings];
    const [now] = useState(() => Date.now());

    if (filter === "latest") {


        sortedMeetings.length = 0;

        sortedMeetings.push(
            ...meetings
                .filter(
                    (race) =>
                        new Date(race.date_end).getTime() < now
                )
                .sort(
                    (a, b) =>
                        new Date(b.date_end).getTime() -
                        new Date(a.date_end).getTime()
                )
        );
    }
    if (filter === "ending") {
        sortedMeetings.reverse();
    }


    return (
        <section className="mx-auto max-w-6xl px-5 sm:px-8 py-10">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">

                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red mb-1">
                        Race Control
                    </p>

                    <h2 className="font-display font-[800] text-3xl uppercase tracking-tight">
                        {season} Calendar
                    </h2>
                </div>


                <div className="flex flex-wrap items-center gap-2">

                    <button
                        onClick={() => setFilter("latest")}
                        className={`relative px-4 py-2 cursor-pointer text-[11px] font-mono uppercase tracking-widest border transition-all duration-300
        ${filter === "latest"
                                ? "bg-red text-white border-red shadow-[0_0_20px_rgba(255,0,0,0.35)]"
                                : "bg-panel border-line text-text-muted hover:border-red hover:text-red"
                            }`}
                    >
                        <span className="relative z-10">
                            Latest Race
                        </span>
                    </button>


                    <button
                        onClick={() => setFilter("default")}
                        className={`relative px-4 py-2 text-[11px] cursor-pointer font-mono uppercase tracking-widest border transition-all duration-300
        ${filter === "default"
                                ? "bg-red text-white border-red shadow-[0_0_20px_rgba(255,0,0,0.35)]"
                                : "bg-panel border-line text-text-muted hover:border-red hover:text-red"
                            }`}
                    >
                        Championship
                    </button>


                    <button
                        onClick={() => setFilter("ending")}
                        className={`relative px-4 py-2 text-[11px] cursor-pointer font-mono uppercase tracking-widest border transition-all duration-300
        ${filter === "ending"
                                ? "bg-red text-white border-red shadow-[0_0_20px_rgba(255,0,0,0.35)]"
                                : "bg-panel border-line text-text-muted hover:border-red hover:text-red"
                            }`}
                    >
                        Finale
                    </button>

                </div>


                <Link
                    href="/races"
                    className="hidden lg:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted hover:text-red transition-colors"
                >
                    Full Calendar
                    <ArrowRight size={15} />
                </Link>

            </div>



            <div className="grid gap-3">

                {sortedMeetings
                    .slice(0, 6)
                    .map((m, i) => (

                        <RaceCard
                            key={m.meeting_key}
                            meeting={m}
                            round={
                                meetings.findIndex(
                                    x => x.meeting_key === m.meeting_key
                                ) + 1
                            }
                        />

                    ))}

            </div>


        </section>
    );
}