"use client";

import { useScrollReveal } from "./useScrollReveal";

interface ChronicleEntry {
  round: string;
  headline: string;
  excerpt: string;
}

export default function PaddockChronicle({ entries }: { entries: ChronicleEntry[] }) {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="border-y border-line bg-panel/40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
        {/* Header with a hand-drawn-feeling divider line */}
        <div ref={headerRef} className="mb-12 text-center">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-red">
            The Paddock Chronicle
          </p>
          <h2
            className="text-3xl sm:text-4xl text-white"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            Stories from the Season
          </h2>

          <svg
            className={`line-draw-svg mx-auto mt-6 h-4 w-40 ${headerVisible ? "is-visible" : ""}`}
            viewBox="0 0 160 16"
            fill="none"
            style={{ ["--line-length" as string]: 200 }}
          >
            <path
              d="M2,8 C40,2 60,14 80,8 C100,2 120,14 158,8"
              stroke="var(--red, #e10600)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Entries */}
        <div className="space-y-12">
          {entries.map((entry, i) => (
            <ChronicleRow key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChronicleRow({ entry, index }: { entry: ChronicleEntry; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`fade-rise grid gap-4 sm:grid-cols-[100px_1fr] ${visible ? "is-visible" : ""}`}
      style={{ animationDelay: visible ? `${index * 0.1}s` : undefined }}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-text-muted">{entry.round}</p>

      <div>
        <h3
          className="text-xl leading-snug text-white sm:text-2xl"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500 }}
        >
          {entry.headline}
        </h3>

        <div
          className={`underline-reveal mt-2 h-[1.5px] w-16 bg-red ${visible ? "is-visible" : ""}`}
          style={{ animationDelay: visible ? `${index * 0.1 + 0.3}s` : undefined }}
        />

        <p
          className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-muted"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {entry.excerpt}
        </p>
      </div>
    </div>
  );
}