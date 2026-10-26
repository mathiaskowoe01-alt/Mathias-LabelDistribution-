'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Heart, Globe2, Coins, Zap, Quote } from "lucide-react";
import { MusicVisualizer } from "./music-visualizer";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v).toLocaleString("fr-FR")}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const STATS = [
  { value: 8.4, suffix: "M+", label: "Streams générés" },
  { value: 120, suffix: "+", label: "Artistes distribués" },
  { value: 150, suffix: "+", label: "Plateformes" },
  { value: 100, suffix: "%", label: "Royalties aux artistes" },
];

const VALUES = [
  { icon: Heart, title: "Accompagnement humain", text: "Une équipe qui parle à un artiste, pas à un ticket. Chaque sortie est suivie par un humain dédié, du premier upload au rapport de streams." },
  { icon: Globe2, title: "Distribution mondiale", text: "Vos titres sur 150+ plateformes : Spotify, Apple Music, Deezer, TikTok, Boomplay, Audiomack, Anghami, et bien d'autres en Afrique et dans le monde." },
  { icon: Coins, title: "Royalties 100 % à l'artiste", text: "Pas de commission sur vos revenus. Ce que vous gagnez vous appartient, intégralement. Vous payez une fois à la sortie, c'est tout." },
  { icon: Zap, title: "Mise en ligne rapide", text: "Sous 48 à 72h après validation, votre musique est en route vers les plateformes. Codes ISRC et UPC fournis gratuitement sur tous les plans." },
];

export function About() {
  return (
    <section id="apropos" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">À propos</span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Un label pensé pour l'artiste,
              <br />
              <span className="text-gradient-gold">pas pour la plateforme.</span>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              MR - K Distribution est né d'un constat simple : trop d'artistes africains talentueux restent invisibles faute d'accès propre aux plateformes. Nous avons construit un pont — transparent, rapide, sans commission sur vos royalties. Notre rôle : mettre votre musique partout où elle mérite d'être entendue, et vous laisser libre de créer.
            </p>

            <div className="mt-7 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <Quote className="h-5 w-5 text-primary mb-2" />
              <p className="font-display text-lg sm:text-xl font-semibold text-foreground italic">« Ta musique, notre mission. »</p>
              <p className="mt-1 text-sm text-muted-foreground">Ton son, ta vision, on le rend visible.</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative">
            <MusicVisualizer />
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-2xl border border-border bg-gradient-card p-6 sm:p-8">
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-gold">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: i * 0.08 }} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 sm:p-8 hover:border-primary/40 transition-colors">
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-black shadow-lg">
                  <v.icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{v.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
