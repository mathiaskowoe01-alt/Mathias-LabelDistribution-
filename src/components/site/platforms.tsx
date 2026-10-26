'use client'

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Plus } from "lucide-react";
import { PlatformLogoCard, PlatformIcon, type PlatformId } from "./platform-icons";

const PLATFORMS: PlatformId[] = [
  "spotify", "apple", "deezer", "tiktok", "youtube",
  "boomplay", "amazon", "tidal", "napster", "anghami",
  "audiomack", "pandora", "shazam", "iheart", "facebook",
  "qobuz", "soundcloud",
];

const GRID_PLATFORMS: PlatformId[] = [
  "spotify", "apple", "deezer", "tiktok", "youtube", "boomplay",
  "amazon", "tidal", "napster", "anghami", "audiomack", "pandora",
];

const PLATFORM_NAMES: Record<PlatformId, string> = {
  spotify: "Spotify", apple: "Apple Music", deezer: "Deezer", tiktok: "TikTok",
  youtube: "YouTube Music", boomplay: "Boomplay", amazon: "Amazon Music",
  tidal: "Tidal", napster: "Napster", anghami: "Anghami", audiomack: "Audiomack",
  pandora: "Pandora", shazam: "Shazam", iheart: "iHeart", facebook: "Facebook",
  qobuz: "Qobuz", soundcloud: "SoundCloud",
};

export function Platforms() {
  const loop = [...PLATFORMS, ...PLATFORMS];
  const loopReverse = [...PLATFORMS].reverse().concat([...PLATFORMS].reverse());

  return (
    <section id="plateformes" className="relative py-24 sm:py-32 border-t border-border/60 bg-gradient-card overflow-hidden">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[40rem] w-[60rem] rounded-full bg-primary/8 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">Plateformes</span>
          <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">Une sortie, <span className="text-gradient-gold">partout.</span></h2>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Votre musique est livrée à plus de 150 plateformes en une seule soumission. Voici les principales — et plus de 140 plateformes régionales et mondiales incluses sur tous les plans.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative rounded-3xl border border-border bg-card/40 p-6 sm:p-10 mb-10">
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
            {GRID_PLATFORMS.map((id, i) => (
              <motion.div key={id} initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="flex flex-col items-center gap-3 group">
                <PlatformIcon id={id} size="xl" className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ring-2 ring-white/5 shadow-xl shadow-black/40" />
                <span className="text-xs sm:text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors text-center">{PLATFORM_NAMES[id]}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-sm">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-foreground/80 font-medium"><span className="text-gradient-gold font-bold">+ 138 autres</span> plateformes régionales &amp; mondiales</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {[
            "Mise en ligne simultanée sur toutes les plateformes en une seule soumission",
            "Codes ISRC / UPC fournis gratuitement sur tous les plans",
            "Statistiques de streams et rapports détaillés inclus",
            "Distribution sur Spotify, Apple Music, Deezer, TikTok, Boomplay, Audiomack, Anghami...",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-sm rounded-xl border border-border bg-card/60 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground/90">{item}</span>
            </div>
          ))}
        </div>

        <div className="marquee-paused relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex gap-3 animate-marquee w-max">
            {loop.map((id, i) => (<PlatformLogoCard key={`r1-${i}`} id={id} />))}
          </div>
        </div>

        <div className="marquee-paused relative mt-3 overflow-hidden" style={{ direction: "rtl" }}>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex gap-3 animate-marquee w-max" style={{ direction: "ltr" }}>
            {loopReverse.map((id, i) => (<PlatformLogoCard key={`r2-${i}`} id={id} />))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            + 140 autres plateformes régionales et mondiales incluses sur tous les plans.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
