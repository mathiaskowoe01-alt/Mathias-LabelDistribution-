'use client'

import { cn } from "@/lib/utils";

type VinylProps = {
  className?: string;
  direction?: "cw" | "ccw";
  labelColor?: string;
  labelAccent?: string;
};

export function VinylRecord({
  className,
  direction = "cw",
  labelColor = "#F59E0B",
  labelAccent = "#FCD34D",
}: VinylProps) {
  const spinClass = direction === "cw" ? "animate-spin-vinyl" : "animate-spin-vinyl-reverse";

  return (
    <div className={cn("pointer-events-none select-none", className)} aria-hidden="true">
      <svg viewBox="0 0 200 200" className={cn("h-full w-full", spinClass)} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="vinylBody" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="60%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id="vinylShine" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vinylLabel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={labelAccent} />
            <stop offset="70%" stopColor={labelColor} />
            <stop offset="100%" stopColor={labelColor} stopOpacity="0.85" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="98" fill="url(#vinylBody)" />

        {Array.from({ length: 24 }).map((_, i) => {
          const r = 38 + i * 2.4;
          return (
            <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="#ffffff" strokeOpacity={i % 2 === 0 ? 0.04 : 0.02} strokeWidth="0.5" />
          );
        })}

        <circle cx="100" cy="100" r="98" fill="url(#vinylShine)" />

        <circle cx="100" cy="100" r="34" fill="url(#vinylLabel)" />
        <circle cx="100" cy="100" r="34" fill="none" stroke="#000000" strokeOpacity="0.25" strokeWidth="1" />
        <circle cx="100" cy="100" r="28" fill="none" stroke="#000000" strokeOpacity="0.18" strokeWidth="0.6" />

        <text x="100" y="96" textAnchor="middle" fontFamily="var(--font-space-grotesk), sans-serif" fontSize="14" fontWeight="700" fill="#1a1a1a" letterSpacing="0.5">MR-K</text>
        <text x="100" y="110" textAnchor="middle" fontFamily="var(--font-jakarta), sans-serif" fontSize="5" fontWeight="600" fill="#1a1a1a" opacity="0.7" letterSpacing="2">DISTRIBUTION</text>

        <circle cx="100" cy="100" r="2.5" fill="#000000" />
      </svg>
    </div>
  );
}
