"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());

  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export default function CountdownTimer({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();

  const [t, setT] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    done: false,
  });


  useEffect(() => {
    const timer = setInterval(() => {
      setT(getRemaining(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);


  return t.done ? (
    <div className="flex items-center gap-2 text-red font-display text-xl uppercase tracking-widest">
      <span className="h-2.5 w-2.5 rounded-full bg-red pulse-live" />
      Lights out
    </div>
  ) : (
    <div className="flex gap-3 sm:gap-4">
      <Digit value={t.d} label="Days" />
      <Digit value={t.h} label="Hrs" />
      <Digit value={t.m} label="Min" />
      <Digit value={t.s} label="Sec" accent />
    </div>
  );
}


function Digit({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`font-mono text-3xl sm:text-4xl font-bold px-3 py-2 rounded-md border tabular-nums ${
          accent
            ? "border-red/40 text-red bg-red/5"
            : "border-line bg-panel-2 text-text"
        }`}
      >
        {String(value).padStart(2, "0")}
      </div>

      <span className="mt-1 text-[10px] uppercase tracking-widest text-text-muted">
        {label}
      </span>
    </div>
  );
}