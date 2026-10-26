'use client'

import { cn } from "@/lib/utils";

type PlatformId =
  | "spotify" | "apple" | "deezer" | "tiktok" | "youtube"
  | "boomplay" | "amazon" | "tidal" | "napster" | "anghami"
  | "audiomack" | "pandora" | "shazam" | "iheart" | "facebook"
  | "qobuz" | "soundcloud";

const ICONS: Record<PlatformId, { name: string; bg: string; glyph: React.ReactNode }> = {
  spotify: { name: "Spotify", bg: "#1DB954", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/></svg>) },
  apple: { name: "Apple Music", bg: "#FA243C", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.703.169c-.517-.087-1.038-.114-1.564-.133-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.083 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.193 1.612.517 2.365.74 1.7 2.01 2.78 3.79 3.265.392.106.795.13 1.2.17.517.05 1.038.075 1.555.075 5.62 0 11.24-.005 16.86.005.413 0 .8-.083 1.143-.34.488-.36.755-.85.815-1.45.013-.13.013-.26.013-.39V6.124z"/></svg>) },
  deezer: { name: "Deezer", bg: "#A238FF", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M18.81 4.16v3.03H24V4.16h-5.19zm0 4.42v3.03H24V8.58h-5.19zm-6.49 0v3.03h5.19V8.58h-5.19zm-6.48 0v3.03h5.19V8.58H5.84zM0 13v3.03h5.19V13H0zm6.49 0v3.03h5.19V13H6.49zm6.49 0v3.03h5.19V13h-5.19zm6.5 0v3.03H24V13h-5.02zM0 17.42V20.5h5.19v-3.08H0zm6.49 0v3.08h5.19v-3.08H6.49zm6.49 0v3.08h5.19v-3.08h-5.19zm6.5 0v3.08H24v-3.08h-5.02z"/></svg>) },
  tiktok: { name: "TikTok", bg: "#000000", glyph: (<svg viewBox="0 0 24 24" className="h-1/2 w-1/2"><path fill="#25F4EE" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.005.595.04.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.44z"/><path fill="#FE2C55" d="M21.75 9.01V5.6a4.83 4.83 0 0 1-3.77-4.25h-3.45v.44a8.27 8.27 0 0 0 3.77 7.22z"/><path fill="#fff" d="M15.86 9.01V7.16a8.16 8.16 0 0 1-4.77-1.52v8.34a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.005.595.04.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43z"/></svg>) },
  youtube: { name: "YouTube Music", bg: "#FF0000", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 4.8c3.96 0 7.2 3.24 7.2 7.2s-3.24 7.2-7.2 7.2-7.2-3.24-7.2-7.2 3.24-7.2 7.2-7.2zM9.6 8.4v7.2l6-3.6-6-3.6z"/></svg>) },
  boomplay: { name: "Boomplay", bg: "#FF6B00", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.4 8.4l-1.8 1.2c-.6-1.2-1.8-2.4-3.6-2.4-2.4 0-4.2 1.8-4.2 4.2 0 2.4 1.8 4.2 4.2 4.2 1.8 0 3-1.2 3.6-2.4l1.8 1.2c-.6 2.4-3 4.2-5.4 4.2-3.6 0-6-2.4-6-6s2.4-6 6-6c2.4 0 4.8 1.8 5.4 4.2z"/><circle cx="12" cy="12" r="2.4"/></svg>) },
  amazon: { name: "Amazon Music", bg: "#25D1DA", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.4 16.4c-.4.6-1 .8-1.6.8-.4 0-.8-.2-1.2-.4-2-1.2-4.4-1.6-7.2-1.2-.4.2-.8 0-1-.4-.2-.4 0-.8.4-1 3.2-.6 6 0 8.4 1.4.4.2.6.6.4 1z"/><path d="M7 11l1.6-3.2L10 11l3-2-1.5 4 3 1-3.5.8L10 17l-1-2.5L5.5 14l3-1z"/></svg>) },
  tidal: { name: "Tidal", bg: "#000000", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12.004 8.523l-3.375 3.375-3.375-3.375L0 11.897l3.375 3.375L5.4 13.248l-2.025-2.025L5.4 9.197l2.025 2.026L8.25 9.197 12.004 8.523zm-3.375 0L12.004 5.148 15.38 8.523 12.004 11.897 8.629 8.523zm6.75 0l3.375 3.375L24 11.897l-3.375-3.374L17.25 11.897l3.375 3.375L17.25 18.622 13.875 15.247l3.375-3.375z"/></svg>) },
  napster: { name: "Napster", bg: "#1A6EDE", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.142 0 7.5 3.358 7.5 7.5S16.142 19.5 12 19.5 4.5 16.142 4.5 12 7.858 4.5 12 4.5zm-2 3v6h1v-6h-1zm3.5 0v6h1v-6h-1zM9 9v1h6V9H9zm0 3v1h6v-1H9z"/></svg>) },
  anghami: { name: "Anghami", bg: "#7E22CE", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>) },
  audiomack: { name: "Audiomack", bg: "#FFA200", glyph: (<svg viewBox="0 0 24 24" fill="#000" className="h-1/2 w-1/2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-2-7 2 1.5 1-3 1 3 2-1.5-2 7-1-3-1 3z"/></svg>) },
  pandora: { name: "Pandora", bg: "#3668FF", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M1.882 0v24h7.986V14.4h4.275c5.471 0 8.018-3.314 8.018-7.2C24.16 3.314 21.613 0 16.143 0H1.882zm7.986 5.4h3.974c2.07 0 3.314.81 3.314 1.8s-1.244 1.8-3.314 1.8H9.868V5.4z"/></svg>) },
  shazam: { name: "Shazam", bg: "#0066FF", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M14.36 7.93l-2.18 2.13 1.66 1.66-1.66 1.66-1.66-1.66 2.18-2.13-1.66-1.66 1.66-1.66 1.66 1.66zm-4.72 0L7.46 10.06l1.66 1.66-1.66 1.66-1.66-1.66 2.18-2.13-1.66-1.66 1.66-1.66 1.66 1.66zm7.07 1.66L18.78 11l-3.13 3.13 1.42 1.41L17 16.45l-1.41-1.41-3.13 3.13L11.05 17l3.13-3.13L11 10.69l1.41-1.41L11 7.86 12.41 6.45 14 8.04l1.41-1.41L16.83 8.04 18.24 6.62 19.66 8.04 17 10.69l1.41 1.41z"/></svg>) },
  iheart: { name: "iHeartRadio", bg: "#C62264", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>) },
  facebook: { name: "Facebook", bg: "#1877F2", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
  qobuz: { name: "Qobuz", bg: "#0070D8", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.142 0 7.5 3.358 7.5 7.5S16.142 19.5 12 19.5 4.5 16.142 4.5 12 7.858 4.5 12 4.5zm-2 4v7l5.5-3.5L10 8.5z"/></svg>) },
  soundcloud: { name: "SoundCloud", bg: "#FF5500", glyph: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2"><path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.418 3.169h-8.108a.55.55 0 0 1-.55-.55V8.391a.61.61 0 0 1 .367-.566s.69-.508 1.969-.508a4.5 4.5 0 0 1 2.47.744 4.5 4.5 0 0 1 1.926 2.05 2.62 2.62 0 0 1 1.515.143 2.62 2.62 0 0 1 1.492 1.412 2.62 2.62 0 0 1 .237 1.018 2.6 2.6 0 0 1-.106 1.063 3.4 3.4 0 0 1 1.176 1.654c.137.401.197.815.18 1.232v-.016z"/></svg>) },
};

export type { PlatformId };

export function PlatformIcon({ id, className, size = "md" }: { id: PlatformId; className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const icon = ICONS[id];
  if (!icon) return null;
  const sizes = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14", xl: "h-20 w-20" };
  return (
    <span className={cn("inline-flex items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/10", sizes[size], className)} style={{ backgroundColor: icon.bg }} title={icon.name} aria-label={icon.name}>
      {icon.glyph}
    </span>
  );
}

export function PlatformLogoCard({ id, className }: { id: PlatformId; className?: string }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <div className={cn("group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 min-w-fit hover:border-primary/50 hover:bg-secondary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-default", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ring-1 ring-white/10 transition-transform group-hover:scale-110" style={{ backgroundColor: icon.bg }}>
        {icon.glyph}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-foreground text-sm">{icon.name}</span>
        <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">distribué</span>
      </div>
    </div>
  );
}

export { ICONS };
