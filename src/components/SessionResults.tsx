"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";
import { RaceResultsTable, QualifyingResultsTable } from "./ResultsTable";
import type { Session, SessionResult, StartingGridEntry, Driver } from "@/lib/openf1";


// Server passes each session with a precomputed `done` flag —
// keeps this client component free of any Date.now() calls (purity-safe).
export type SessionWithStatus = Session & { done: boolean };

interface SessionResultsProps {
  sessions: SessionWithStatus[];
  results: Record<number, SessionResult[]>;
  qualiGrid: Record<number, StartingGridEntry[]>;
  drivers: Driver[];
  raceDefault?: SessionWithStatus;
}

const SESSION_ORDER: Record<string, number> = {
  "Practice 1": 0,
  "Practice 2": 1,
  "Practice 3": 2,
  "Sprint Qualifying": 3,
  Sprint: 4,
  Qualifying: 5,
  Race: 6,
};

const QUALI_TYPE_SESSIONS = new Set(["Qualifying", "Sprint Qualifying"]);

export default function SessionResults({
  sessions,
  results,
  qualiGrid,
  drivers,
  raceDefault,
}: SessionResultsProps) {
  const orderedSessions = [...sessions].sort(
    (a, b) => (SESSION_ORDER[a.session_name] ?? 99) - (SESSION_ORDER[b.session_name] ?? 99)
  );

  const defaultKey =
    raceDefault?.session_key ??
    orderedSessions.find((s) => s.session_name === "Race")?.session_key ??
    orderedSessions[0]?.session_key;

  const [activeSessionKey, setActiveSessionKey] = useState<number | undefined>(defaultKey);

  const active = orderedSessions.find((s) => s.session_key === activeSessionKey);
  const activeResult = activeSessionKey !== undefined ? results[activeSessionKey] ?? [] : [];
  const activeGrid = activeSessionKey !== undefined ? qualiGrid[activeSessionKey] ?? [] : [];

  return (
    <div>
      {/* SESSION SELECTOR — sirf ek hi active, click se switch */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {orderedSessions.map((s) => {
          const isActive = activeSessionKey === s.session_key;
          return (
            <button
              key={s.session_key}
              type="button"
              onClick={() => setActiveSessionKey(s.session_key)}
              className={`text-left rounded-xl border p-4 transition-all ${
                isActive ? "border-red bg-red/10" : "border-line bg-panel hover:border-red/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold">{s.session_name}</p>
                  <p className="text-xs text-text-muted font-mono">
                    {new Date(s.date_start).toLocaleDateString()}
                  </p>
                </div>
                <StatusPill status={s.done ? "done" : "upcoming"} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE RESULT — sirf ek result table render hota hai */}
      {active ? (
        <>
          <h2 className="font-display font-bold text-xl uppercase mb-4">
            {active.session_name} Result
          </h2>

          {!active.done ? (
            <EmptyNotice
              text={`${active.session_name} hasn't happened yet — check back once the session finishes.`}
            />
          ) : QUALI_TYPE_SESSIONS.has(active.session_name) ? (
            <QualifyingResultsTable results={activeResult} grid={activeGrid} drivers={drivers} />
          ) : (
            <RaceResultsTable results={activeResult} drivers={drivers} />
          )}
        </>
      ) : (
        <p className="text-text-muted text-sm">Schedule not published yet.</p>
      )}
    </div>
  );
}

function EmptyNotice({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-text-muted">
      {text}
    </div>
  );
}