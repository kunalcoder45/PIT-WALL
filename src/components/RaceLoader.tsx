// "use client";

// import { useEffect, useState } from "react";

// const SCAN_MESSAGES = [
//     "WARMING UP TYRES…",
//     "SYNCING TELEMETRY…",
//     "LOADING TRACK DATA…",
//     "CHECKING GRID POSITIONS…",
// ];

// export default function RaceLoader() {
//     const [msgIndex, setMsgIndex] = useState(0);
//     const [rpm, setRpm] = useState(4200);

//     useEffect(() => {
//         const msgTimer = setInterval(() => {
//             setMsgIndex((i) => (i + 1) % SCAN_MESSAGES.length);
//         }, 1100);

//         // decorative ticking RPM, purely visual
//         const rpmTimer = setInterval(() => {
//             setRpm(4000 + Math.floor(Math.random() * 8000));
//         }, 180);

//         return () => {
//             clearInterval(msgTimer);
//             clearInterval(rpmTimer);
//         };
//     }, []);

//     return (
//         <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black ">
//             {/* faint carbon-fibre grid backdrop, reuse existing texture class if present */}
//             <div
//                 className="pointer-events-none absolute inset-0 opacity-40"
//                 // style={{
//                 //     backgroundImage:
//                 //         "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('/images/f1.png')",
//                 //     backgroundSize: "cover",
//                 //     backgroundPosition: "center",
//                 // }}
//             />

//             {/* corner checkered-flag accent, top-right */}
//             <div
//                 className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 opacity-20 bg-no-repeat bg-contain"
//                 style={{
//                     backgroundImage: "url('/images/f1.png')",
//                     backgroundPosition: "center",
//                 }}
//             />

//             {/* Brand wordmark */}
//             <p className="loader-brand-pulse mb-10 font-display text-2xl font-extrabold tracking-tight text-white">
//                 PIT<span className="text-red">WALL</span>
//             </p>

//             {/* 5 Lights Out sequence */}
//             <div className="relative flex items-center gap-4">
//                 {[1, 2, 3, 4, 5].map((n) => (
//                     <div
//                         key={n}
//                         className={`loader-light-${n} h-6 w-6 rounded-full sm:h-8 sm:w-8`}
//                         style={{
//                             backgroundColor: "var(--red, #e10600)",
//                             boxShadow: "0 0 18px 4px rgba(225,6,0,0.55)",
//                         }}
//                     />
//                 ))}

//                 {/* "LIGHTS OUT" flash, centered over the light rig */}
//                 <div className="loader-flash-text pointer-events-none absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap">
//                     <span className="font-display text-lg font-extrabold uppercase tracking-[0.3em] text-white">
//                         Lights Out
//                     </span>
//                 </div>
//             </div>

//             {/* Car launch strip */}
//             <div className="relative mt-24 h-10 w-full max-w-md overflow-hidden">
//                 {/* speed lines */}
//                 {[0, 1, 2].map((i) => (
//                     <div
//                         key={i}
//                         className="loader-speed-line absolute top-1/2 h-[2px] bg-white/40"
//                         style={{
//                             left: 0,
//                             width: `${28 - i * 6}%`,
//                             top: `${50 + (i - 1) * 14}%`,
//                             animationDelay: `${i * 0.06}s`,
//                         }}
//                     />
//                 ))}

//                 <svg
//                     viewBox="0 0 64 24"
//                     className="loader-car absolute top-1/2 h-8 w-16 -translate-y-1/2"
//                     fill="none"
//                 >
//                     {/* Original stylized car silhouette — not a photo, not any specific team's livery */}
//                     <path
//                         d="M4,16 L10,16 C11,12 15,9 21,9 L40,9 C46,9 50,12 52,16 L60,16 C61,16 62,17 62,18 L62,19 C62,20 61,21 60,21 L4,21 C3,21 2,20 2,19 L2,18 C2,17 3,16 4,16 Z"
//                         fill="var(--red, #e10600)"
//                     />
//                     <path d="M23,9 L26,4 L37,4 L40,9 Z" fill="rgba(255,255,255,0.85)" />
//                     <circle cx="14" cy="21" r="3" fill="#111" />
//                     <circle cx="50" cy="21" r="3" fill="#111" />
//                 </svg>
//             </div>

//             {/* Telemetry readout */}
//             <div className="mt-10 flex items-center gap-8 font-mono text-xs">
//                 <div className="flex flex-col items-center">
//                     <span className="text-white">{rpm.toLocaleString()}</span>
//                     <span className="mt-0.5 text-[9px] uppercase tracking-widest text-text-muted">RPM</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                     <span className="animate-pulse text-red">●●●●</span>
//                     <span className="mt-0.5 text-[9px] uppercase tracking-widest text-text-muted">Signal</span>
//                 </div>
//                 <div className="flex flex-col items-center">
//                     <span className="text-white">3.7</span>
//                     <span className="mt-0.5 text-[9px] uppercase tracking-widest text-text-muted">Hz</span>
//                 </div>
//             </div>

//             <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-text-muted transition-opacity duration-300">
//                 {SCAN_MESSAGES[msgIndex]}
//             </p>

//             {/* Progress bar */}
//             <div className="relative mt-6 h-1 w-56 overflow-hidden rounded-full bg-white/10">
//                 <div className="loader-progress-sweep absolute inset-y-0 w-1/4 bg-red" />
//             </div>
//         </div>
//     );
// }



"use client";

import { useEffect, useState } from "react";

export default function RaceLoader() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(timer);
    };
  }, []);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black">
      <div className="relative flex flex-col items-center px-6">
        {/* Wordmark */}
        <div className="relative mb-1">
          <p className="font-display text-2xl font-extrabold tracking-tight text-white">
            PIT<span className="text-red">WALL</span>
            <span className="ml-1 rounded-md bg-yellow-400 px-2 py-0.5 text-lg font-bold uppercase tracking-wide text-black shadow-sm">
              HUB
            </span>
          </p>

          <div className="loader-header-sweep absolute -bottom-1 left-0 h-[2px] w-full bg-red" />
        </div>
      </div>
    </div>
  );
}