"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LocationPoint, Driver } from "@/lib/openf1";
import type { CarData } from "@/lib/openf1-browser";

interface LiveTrackMapProps {
    points: LocationPoint[];
    carData?: CarData[];
    drivers: Driver[];
    gpName?: string;
    circuitName?: string;
    lapNumber?: number;
    totalLaps?: number;
}

interface CarFrame {
    driver_number: number;
    x: number; // normalized 0-100
    y: number; // normalized 0-100
    z: number; // raw elevation
    speedKmh: number | null;
}

const FRAME_INTERVAL_MS = 270; // ~3.7 Hz, matches OpenF1 sample rate

export default function LiveTrackMap({ points,
    carData = [],
    drivers,
    gpName,
    circuitName,
    lapNumber,
    totalLaps, }: LiveTrackMapProps) {
    const driverMap = useMemo(() => new Map(drivers.map((d) => [d.driver_number, d])), [drivers]);

    // Group + sort samples per driver once
    const byDriver = useMemo(() => {
        const map = new Map<number, LocationPoint[]>();
        for (const p of points) {
            const arr = map.get(p.driver_number) ?? [];
            arr.push(p);
            map.set(p.driver_number, arr);
        }
        for (const arr of map.values()) {
            arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return map;
    }, [points]);

    // Normalize x/y across the whole dataset into a 0-100 viewBox
    const bounds = useMemo(() => {
        if (points.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
            if (p.z < minZ) minZ = p.z;
            if (p.z > maxZ) maxZ = p.z;
        }
        return { minX, maxX, minY, maxY, minZ, maxZ };
    }, [points]);

    const normalize = (x: number, y: number) => {
        const px = ((x - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * 92 + 4;
        const py = ((y - bounds.minY) / (bounds.maxY - bounds.minY || 1)) * 92 + 4;
        return { px, py };
    };

    // Ghost track outline — trace of the driver with the most samples (usually race leader / full lap)
    const trackPath = useMemo(() => {
        let bestDriver: number | null = null;
        let bestCount = 0;
        for (const [num, arr] of byDriver.entries()) {
            if (arr.length > bestCount) {
                bestCount = arr.length;
                bestDriver = num;
            }
        }
        if (bestDriver === null) return "";
        const trace = byDriver.get(bestDriver)!;
        return trace
            .map((p, i) => {
                const { px, py } = normalize(p.x, p.y);
                return `${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`;
            })
            .join(" ");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [byDriver, bounds]);

    // Playback clock — advances through the fetched window on a loop
    const startTime = useMemo(() => {
        if (points.length === 0) return 0;
        return Math.min(...points.map((p) => new Date(p.date).getTime()));
    }, [points]);
    const endTime = useMemo(() => {
        if (points.length === 0) return 0;
        return Math.max(...points.map((p) => new Date(p.date).getTime()));
    }, [points]);

    const [elapsed, setElapsed] = useState(0);
    const rafRef = useRef<number | null>(null);

    // Group car_data by driver, sorted by time — for fast nearest-sample lookup
    const speedByDriver = useMemo(() => {
        const map = new Map<number, CarData[]>();
        for (const c of carData) {
            const arr = map.get(c.driver_number) ?? [];
            arr.push(c);
            map.set(c.driver_number, arr);
        }
        for (const arr of map.values()) {
            arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        return map;
    }, [carData]);
    function nearestSpeed(driverNumber: number, atTime: number): number | null {
        const arr = speedByDriver.get(driverNumber);
        if (!arr || arr.length === 0) return null;

        let i = arr.findIndex((c) => new Date(c.date).getTime() > atTime);

        if (i === -1) {
            // atTime is past every sample — use the last known reading, don't decrement further
            i = arr.length - 1;
        } else if (i === 0) {
            // atTime is before every sample — use the first known reading
            i = 0;
        } else {
            // normal case: step back to the sample just before atTime
            i -= 1;
        }

        const sample = arr[i];
        // If the nearest reading is more than ~2s stale, treat as unknown rather
        // than showing an old/misleading number.
        const gapMs = Math.abs(new Date(sample.date).getTime() - atTime);
        if (gapMs > 2000) return null;

        return sample.speed;
    }
    //   useEffect(() => {
    //     if (endTime <= startTime) return;
    //     const duration = endTime - startTime;
    //     let last = performance.now();

    //     function tick(now: number) {
    //       const dt = now - last;
    //       last = now;
    //       setElapsed((prev) => (prev + dt) % duration);
    //       rafRef.current = requestAnimationFrame(tick);
    //     }
    //     rafRef.current = requestAnimationFrame(tick);
    //     return () => {
    //       if (rafRef.current) cancelAnimationFrame(rafRef.current);
    //     };
    //   }, [startTime, endTime]);
    useEffect(() => {
        if (endTime <= startTime) return;
        const duration = endTime - startTime;
        let last = performance.now();

        function tick(now: number) {
            let dt = now - last;
            last = now;
            // Clamp huge deltas (e.g. tab was backgrounded and rAF resumed after a gap)
            // so playback doesn't jump — cap to a few frame-intervals worth of motion.
            dt = Math.min(dt, FRAME_INTERVAL_MS * 3);
            setElapsed((prev) => (prev + dt) % duration);
            rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [startTime, endTime]);
    const currentTime = startTime + elapsed;

    // Find each car's frame at currentTime, interpolating for smooth motion,
    // and estimate speed from the two nearest samples.
    const frames = useMemo<CarFrame[]>(() => {
        const out: CarFrame[] = [];
        for (const [num, arr] of byDriver.entries()) {
            if (arr.length < 2) continue;
            let i = arr.findIndex((p) => new Date(p.date).getTime() > currentTime);
            if (i === -1) i = arr.length - 1;
            if (i === 0) i = 1;
            const prev = arr[i - 1];
            const next = arr[i];
            const t0 = new Date(prev.date).getTime();
            const t1 = new Date(next.date).getTime();
            const t = t1 > t0 ? (currentTime - t0) / (t1 - t0) : 0;
            const clampedT = Math.max(0, Math.min(1, t));

            const x = prev.x + (next.x - prev.x) * clampedT;
            const y = prev.y + (next.y - prev.y) * clampedT;
            const z = prev.z + (next.z - prev.z) * clampedT;
            const { px, py } = normalize(x, y);

            // Distance between the two real samples ÷ time delta = approx speed.
            // OpenF1 coordinates are treated as metres, consistent with FIA telemetry convention.
            // const dist = Math.hypot(next.x - prev.x, next.y - prev.y);
            // const dtSec = (t1 - t0) / 1000;
            // const speedKmh = dtSec > 0 ? (dist / dtSec) * 3.6 : null;
            const speedKmh = nearestSpeed(num, currentTime);

            out.push({ driver_number: num, x: px, y: py, z, speedKmh });
        }
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [byDriver, currentTime, bounds, speedByDriver]);

    const [selected, setSelected] = useState<number | null>(null);
    const selectedFrame = frames.find((f) => f.driver_number === selected);
    const selectedDriver = selected ? driverMap.get(selected) : undefined;

    const zRange = bounds.maxZ - bounds.minZ || 1;
    const bankingLabel = (z: number) => {
        const pct = (z - bounds.minZ) / zRange;
        if (pct > 0.7) return "High banking / elevation";
        if (pct < 0.3) return "Low ground / flat section";
        return "Mid elevation";
    };

    if (points.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-muted">
                Telemetry not available for this session yet.
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel">
            {/* scanning glow line, purely decorative */}
            <div className="pointer-events-none absolute inset-0 opacity-20 track-scan" />

            <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-red">Lap 1 Replay · Live Telemetry</p>
                <p className="font-mono text-xs text-text-muted">{frames.length} cars tracked</p>
            </div>
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div>
                    <p className="font-display text-sm text-white">
                        {gpName ?? "Session"} {circuitName && <span className="text-text-muted">· {circuitName}</span>}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-red">
                        {lapNumber ? `Lap ${lapNumber}${totalLaps ? ` / ${totalLaps}` : ""}` : "Telemetry"}
                    </p>
                </div>
                <p className="font-mono text-xs text-text-muted">{drivers.length ? `${drivers.length} cars` : ""}</p>
            </div>

            <div className="relative aspect-16/10 w-full">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                    <path
                        d={trackPath}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="0.6"
                        strokeLinecap="round"
                    />
                    <path
                        d={trackPath}
                        fill="none"
                        stroke="var(--red, #e10600)"
                        strokeWidth="0.3"
                        strokeDasharray="2 3"
                        className="track-flow"
                    />

                    {frames.map((f) => {
                        const d = driverMap.get(f.driver_number);
                        const color = d ? `#${d.team_colour}` : "#e10600";
                        const isSelected = selected === f.driver_number;
                        return (
                            <g
                                key={f.driver_number}
                                transform={`translate(${f.x}, ${f.y})`}
                                onClick={() => setSelected(isSelected ? null : f.driver_number)}
                                className="cursor-pointer"
                            >
                                <circle r={isSelected ? 2.6 : 1.6} fill={color} opacity={0.25} className="animate-pulse" />
                                <circle r={isSelected ? 1.6 : 1} fill={color} stroke="#000" strokeWidth="0.15" />
                            </g>
                        );
                    })}
                </svg>

                {/* Telemetry card for the clicked car */}
                {selectedFrame && selectedDriver && (
                    <div
                        className="absolute z-10 w-52 rounded-lg border border-line bg-black/90 p-3 backdrop-blur font-mono text-xs shadow-xl"
                        style={{
                            left: `${Math.min(selectedFrame.x, 78)}%`,
                            top: `${Math.min(selectedFrame.y, 70)}%`,
                        }}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
                            />
                            <span className="font-display text-sm text-white truncate">{selectedDriver.full_name}</span>
                        </div>
                        <p className="text-text-muted">{selectedDriver.team_name}</p>
                        <div className="mt-2 space-y-1 text-text-muted">
                            <p>≈ Speed: <span className="text-white">{selectedFrame.speedKmh ? `${selectedFrame.speedKmh.toFixed(0)} km/h` : "—"}</span></p>
                            <p>Elevation: <span className="text-white">{bankingLabel(selectedFrame.z)}</span></p>
                            <p className="text-[10px] opacity-60">
                                x:{selectedFrame.x.toFixed(1)} y:{selectedFrame.y.toFixed(1)} z:{selectedFrame.z.toFixed(1)}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            className="mt-2 text-[10px] text-red hover:underline"
                        >
                            close
                        </button>
                    </div>
                )}
            </div>

            <p className="border-t border-line px-5 py-2 text-[11px] text-text-muted">
                Car positions replayed from real OpenF1 location telemetry (~3.7 samples/sec). Click any car for live readout.
            </p>
        </div>
    );
}