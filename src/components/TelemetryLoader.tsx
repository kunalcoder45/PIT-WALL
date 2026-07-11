"use client";

import { useEffect, useState } from "react";

interface TelemetryLoaderProps {
    label?: string;
}

const SCAN_LINES = [
    "ACQUIRING GPS LOCK…",
    "SYNCING CAR TELEMETRY…",
    "MAPPING TRACK GEOMETRY…",
    "READING ECU DATA STREAM…",
];

export default function TelemetryLoader({ label = "Loading telemetry" }: TelemetryLoaderProps) {
    const [lineIndex, setLineIndex] = useState(0);
    const [fakeSpeed, setFakeSpeed] = useState(0);

    useEffect(() => {
        const lineTimer = setInterval(() => {
            setLineIndex((i) => (i + 1) % SCAN_LINES.length);
        }, 1400);

        // purely decorative speed readout, ticks pseudo-randomly to feel "live"
        const speedTimer = setInterval(() => {
            setFakeSpeed(Math.floor(80 + Math.random() * 260));
        }, 220);

        return () => {
            clearInterval(lineTimer);
            clearInterval(speedTimer);
        };
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-10">
            {/* faint radar sweep background */}
            <div className="pointer-events-none absolute inset-0 telemetry-radar opacity-20" />

            <div className="relative flex flex-col items-center gap-6">
                {/* Track with a car dot racing along it */}
                <svg viewBox="0 0 200 90" className="h-24 w-full max-w-xs">
                    <path
                        id="loaderTrack"
                        d="M10,60 C10,30 35,15 65,18 L120,22 C150,25 155,45 135,52 C120,57 118,70 135,72 L175,70"
                        fill="none"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10,60 C10,30 35,15 65,18 L120,22 C150,25 155,45 135,52 C120,57 118,70 135,72 L175,70"
                        fill="none"
                        stroke="var(--red, #e10600)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="14 500"
                        className="telemetry-track-trace"
                    />
                    <circle r="3.2" fill="var(--red, #e10600)" className="telemetry-car-glow">
                        <animateMotion
                            dur="2.4s"
                            repeatCount="indefinite"
                            path="M10,60 C10,30 35,15 65,18 L120,22 C150,25 155,45 135,52 C120,57 118,70 135,72 L175,70"
                        />
                    </circle>
                    <circle r="1.6" fill="#fff" className="telemetry-car-core">
                        <animateMotion
                            dur="2.4s"
                            repeatCount="indefinite"
                            path="M10,60 C10,30 35,15 65,18 L120,22 C150,25 155,45 135,52 C120,57 118,70 135,72 L175,70"
                        />
                    </circle>
                </svg>

                {/* Fake live readouts */}
                <div className="flex items-center gap-6 font-mono text-xs">
                    <ReadoutStat label="Speed" value={`${fakeSpeed}`} unit="km/h" />
                    <ReadoutStat label="Signal" value="●●●●" unit="" pulse />
                    {/* <SignalReadout /> */}
                    <ReadoutStat label="Freq" value="3.7" unit="Hz" />
                </div>

                <div className="text-center">
                    <p className="font-display text-sm uppercase tracking-wide text-white">{label}</p>
                    <p className="mt-1 font-mono text-[11px] text-red transition-opacity duration-300">
                        {SCAN_LINES[lineIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ReadoutStat({
    label,
    value,
    unit,
    pulse,
}: {
    label: string;
    value: string;
    unit: string;
    pulse?: boolean;
}) {
    return (
        <div className="flex flex-col items-center">
            <span className={`text-white ${pulse ? "animate-pulse text-red" : ""}`}>
                {value}
                {unit && <span className="ml-0.5 text-text-muted">{unit}</span>}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest text-text-muted">{label}</span>
        </div>
    );
}

// function SignalReadout() {
//     return (
//         <div className="flex flex-col items-center">
//             <div className="flex gap-1.5 h-5 items-center">
//                 <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
//                 <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
//                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
//                 <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
//             </div>

//             <span className="mt-0.5 text-[9px] uppercase tracking-widest text-text-muted">
//                 Signal
//             </span>
//         </div>
//     );
// }