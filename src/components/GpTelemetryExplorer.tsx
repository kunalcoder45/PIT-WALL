"use client";

import { useEffect, useMemo, useState } from "react";
import type { Meeting, Session, Driver, Lap, LocationPoint } from "@/lib/openf1";
import { openf1Browser, type CarData } from "@/lib/openf1-browser";
import LiveTrackMap from "./LiveTrackMap";
import TelemetryLoader from "./TelemetryLoader";

interface GpTelemetryExplorerProps {
    meetings: Meeting[]; // season's GP list, passed from a server page
}

interface StandingRow {
    position: number;
    driver_number: number;
    cumulativeSeconds: number;
    gapToLeader: number;
}

interface StandingsResult {
    rows: StandingRow[];
    hasPartialData: boolean;
}

function computeStandingsAtLap(laps: Lap[], lapNumber: number): StandingsResult {
    const cumulative = new Map<number, number>();
    let anyMissing = false;

    for (const l of laps) {
        if (l.lap_number <= lapNumber && !l.is_pit_out_lap) {
            if (l.lap_duration == null) {
                anyMissing = true;
                continue;
            }
            cumulative.set(l.driver_number, (cumulative.get(l.driver_number) ?? 0) + l.lap_duration);
        }
    }

    const sorted = [...cumulative.entries()].sort((a, b) => a[1] - b[1]);
    const leaderTime = sorted[0]?.[1] ?? 0;

    const rows = sorted.map(([driver_number, time], i) => ({
        position: i + 1,
        driver_number,
        cumulativeSeconds: time,
        gapToLeader: time - leaderTime,
    }));

    return { rows, hasPartialData: anyMissing };
}


export default function GpTelemetryExplorer({ meetings }: GpTelemetryExplorerProps) {
    const [meetingKey, setMeetingKey] = useState<number | undefined>(meetings[0]?.meeting_key);
    const [raceSession, setRaceSession] = useState<Session | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [laps, setLaps] = useState<Lap[]>([]);
    const [lapNumber, setLapNumber] = useState(1);
    const [telemetryPoints, setTelemetryPoints] = useState<LocationPoint[]>([]);
    const [loadingSession, setLoadingSession] = useState(false);
    const [loadingLap, setLoadingLap] = useState(false);

    const selectedMeeting = meetings.find((m) => m.meeting_key === meetingKey);

    // When GP changes: find its Race session, load drivers + full lap data once
    useEffect(() => {
        if (!meetingKey) return; // yeh already tha, but TS ko andar bhi propagate karna hoga
        const currentMeetingKey = meetingKey; // narrowed, definitely `number` ab
        let cancelled = false;

        async function load() {
            setLoadingSession(true);
            setRaceSession(null);
            setLaps([]);
            setTelemetryPoints([]);

            const sessions = await openf1Browser.sessions(currentMeetingKey);
            const race = sessions.find((s) => s.session_name === "Race") ?? null;
            if (cancelled) return;
            setRaceSession(race);

            if (race) {
                const [driverList, lapList] = await Promise.all([
                    openf1Browser.drivers(race.session_key),
                    openf1Browser.laps(race.session_key),
                ]);
                if (cancelled) return;
                setDrivers(driverList);
                setLaps(lapList);
                setLapNumber(1);
            }
            setLoadingSession(false);
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [meetingKey]);

    const maxLap = useMemo(() => {
        if (laps.length === 0) return 1;
        return Math.max(...laps.map((l) => l.lap_number));
    }, [laps]);

    const driverNumbers = useMemo(
        () => drivers.map((d) => d.driver_number),
        [drivers]
    );

    const [carData, setCarData] = useState<CarData[]>([]);
    // When lap changes: compute this lap's real time-window (drivers cross the
    // line at slightly different moments) and fetch location for that window.
    useEffect(() => {
        if (!raceSession || laps.length === 0) return;
        const currentSession = raceSession;
        let cancelled = false;

        async function loadLapTelemetry() {
            setLoadingLap(true);
            const lapEntries = laps.filter((l) => l.lap_number === lapNumber && l.date_start);
            if (lapEntries.length === 0) {
                setTelemetryPoints([]);
                setCarData([]);
                setLoadingLap(false);
                return;
            }

            const starts = lapEntries.map((l) => new Date(l.date_start).getTime());
            const ends = lapEntries.map(
                (l) => new Date(l.date_start).getTime() + (l.lap_duration ?? 90) * 1000
            );
            const windowStart = new Date(Math.min(...starts) - 1000).toISOString();
            const windowEnd = new Date(Math.max(...ends) + 1000).toISOString();

            const [points, speedData] = await Promise.all([
                openf1Browser.location(currentSession.session_key, windowStart, windowEnd),
                openf1Browser.carData(
                    currentSession.session_key,
                    windowStart,
                    windowEnd,
                    // drivers.map((d) => d.driver_number)
                    driverNumbers
                ),
            ]);

            if (!cancelled) {
                setTelemetryPoints(points);
                setCarData(speedData);
                setLoadingLap(false);
            }
        }

        loadLapTelemetry();
        return () => {
            cancelled = true;
        };
    }, [raceSession, laps, lapNumber, driverNumbers]);
    // const standings = useMemo(() => computeStandingsAtLap(laps, lapNumber), [laps, lapNumber]);
    const { rows: standings, hasPartialData } = useMemo(
        () => computeStandingsAtLap(laps, lapNumber),
        [laps, lapNumber]
    );
    const driverMap = useMemo(() => new Map(drivers.map((d) => [d.driver_number, d])), [drivers]);



    return (
        <div className="space-y-5">
            {/* GP + Lap selectors */}
            <div className="flex flex-col sm:flex-row gap-3">
                <select
                    value={meetingKey}
                    onChange={(e) => setMeetingKey(Number(e.target.value))}
                    className="flex-1 rounded-sm border border-line bg-panel px-3 py-2 font-mono text-sm text-text"
                >
                    {meetings.map((m) => (
                        <option key={m.meeting_key} value={m.meeting_key}>
                            {m.meeting_name} — {m.circuit_short_name}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2 rounded-sm border border-line bg-panel px-3 py-2">
                    <button
                        onClick={() => setLapNumber((n) => Math.max(1, n - 1))}
                        className="font-mono text-sm text-text-muted hover:text-red disabled:opacity-30"
                        disabled={lapNumber <= 1}
                    >
                        ‹
                    </button>
                    <span className="font-mono text-sm w-24 text-center">
                        Lap {lapNumber} / {maxLap}
                    </span>
                    <button
                        onClick={() => setLapNumber((n) => Math.min(maxLap, n + 1))}
                        className="font-mono text-sm text-text-muted hover:text-red disabled:opacity-30"
                        disabled={lapNumber >= maxLap}
                    >
                        ›
                    </button>
                </div>
            </div>

            {loadingSession ? (
                //     <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-muted">
                //         Loading session data…
                //     </div>
                // ) : !raceSession ? (
                //     <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-muted">
                //         No Race session found for this GP.
                //     </div>
                // ) : (
                <TelemetryLoader label="Loading session data" />
            ) : !raceSession ? (
                <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-muted">
                    No Race session found for this GP.
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                        {loadingLap ? (
                            <TelemetryLoader label={`Loading lap ${lapNumber} telemetry`} />
                        ) : (
                            <LiveTrackMap
                                points={telemetryPoints}
                                carData={carData}
                                drivers={drivers}
                                gpName={selectedMeeting?.meeting_name}
                                circuitName={selectedMeeting?.circuit_short_name}
                                lapNumber={lapNumber}
                                totalLaps={maxLap}
                            />
                        )}
                    </div>
                    {/* "Kaun aage tha" leaderboard for this lap */}
                    <div className="rounded-2xl border border-line bg-panel p-4">
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red mb-3">
                            Order after Lap {lapNumber}
                            {hasPartialData && (
                                <span className="ml-2 text-text-muted normal-case tracking-normal">(partial data)</span>
                            )}
                        </p>
                        {standings.length === 0 ? (
                            <p className="text-xs text-text-muted">Lap data not available for this GP.</p>
                        ) : (
                            <ol className="space-y-1.5 font-mono text-sm">
                                {standings.map((row) => {
                                    const d = driverMap.get(row.driver_number);
                                    return (
                                        <li key={row.driver_number} className="flex items-center gap-2">
                                            <span className="w-5 text-text-muted">{row.position}</span>
                                            <span
                                                className="h-2 w-2 rounded-full shrink-0"
                                                style={{ backgroundColor: d ? `#${d.team_colour}` : "#666" }}
                                            />
                                            <span className="flex-1 truncate">{d?.name_acronym ?? row.driver_number}</span>
                                            <span className="text-text-muted text-xs">
                                                {row.position === 1 ? "Leader" : `+${row.gapToLeader.toFixed(1)}s`}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}