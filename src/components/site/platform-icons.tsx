'use client'

import { cn } from "@/lib/utils";

export type PlatformId =
  | "spotify" | "apple" | "deezer" | "tiktok" | "youtube"
  | "boomplay" | "amazon" | "tidal" | "napster" | "anghami"
  | "audiomack" | "pandora" | "shazam" | "iheart" | "facebook"
  | "qobuz" | "soundcloud" | "instagram" | "whatsapp" | "whatsapp_business";

const ICONS: Record<PlatformId, { name: string; bg: string; src: string }> = {
  spotify: { name: "Spotify", bg: "#000000", src: "/platforms/spotify.jpg" },
  apple: { name: "Apple Music", bg: "#FA243C", src: "/platforms/apple.svg" },
  deezer: { name: "Deezer", bg: "#000000", src: "/platforms/deezer.jpg" },
  tiktok: { name: "TikTok", bg: "#000000", src: "/platforms/tiktok.jpg" },
  youtube: { name: "YouTube Music", bg: "#FFFFFF", src: "/platforms/youtube.jpg" },
  boomplay: { name: "Boomplay", bg: "#121212", src: "/platforms/boomplay.jpg" },
  amazon: { name: "Amazon Music", bg: "#25D1DA", src: "/platforms/amazon.jpg" },
  tidal: { name: "Tidal", bg: "#000000", src: "/platforms/tidal.jpg" },
  napster: { name: "Napster", bg: "#1B0B2E", src: "/platforms/napster.jpg" },
  anghami: { name: "Anghami", bg: "#000000", src: "/platforms/anghami.jpg" },
  audiomack: { name: "Audiomack", bg: "#0E0E0E", src: "/platforms/audiomack.jpg" },
  pandora: { name: "Pandora", bg: "#FFFFFF", src: "/platforms/pandora.jpg" },
  shazam: { name: "Shazam", bg: "#FFFFFF", src: "/platforms/shazam.jpg" },
  iheart: { name: "iHeartRadio", bg: "#C6002B", src: "/platforms/iheart.jpg" },
  facebook: { name: "Facebook", bg: "#0866FF", src: "/platforms/facebook.jpg" },
  qobuz: { name: "Qobuz", bg: "#000000", src: "/platforms/qobuz.jpg" },
  soundcloud: { name: "SoundCloud", bg: "#FF5500", src: "/platforms/soundcloud.jpg" },
  instagram: { name: "Instagram", bg: "#E1306C", src: "/platforms/instagram.jpg" },
  whatsapp: { name: "WhatsApp", bg: "#25D366", src: "/platforms/whatsapp.jpg" },
  whatsapp_business: { name: "WhatsApp Business", bg: "#128C7E", src: "/platforms/whatsapp_business.svg" },
};

export function PlatformIcon({
  id,
  className,
  size = "md",
}: {
  id: PlatformId;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const icon = ICONS[id];
  if (!icon) return null;

  const sizes = {
    xs: "h-7 w-7 rounded-lg",
    sm: "h-9 w-9 rounded-xl",
    md: "h-11 w-11 rounded-2xl",
    lg: "h-14 w-14 rounded-2xl",
    xl: "h-18 w-18 sm:h-20 sm:w-20 rounded-[22px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/15 shrink-0 select-none",
        sizes[size],
        className
      )}
      style={{ backgroundColor: icon.bg }}
      title={icon.name}
      aria-label={icon.name}
    >
      <img
        src={icon.src}
        alt={icon.name}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function PlatformLogoCard({ id, className }: { id: PlatformId; className?: string }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 min-w-fit hover:border-primary/50 hover:bg-secondary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-default",
        className
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/15 transition-transform group-hover:scale-110 shrink-0"
        style={{ backgroundColor: icon.bg }}
      >
        <img
          src={icon.src}
          alt={icon.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-foreground text-sm">{icon.name}</span>
        <span className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">distribué</span>
      </div>
    </div>
  );
}

export { ICONS };
