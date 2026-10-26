'use client'

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VinylRecord } from "./vinyl-record";

export function Hero() {
  return (
    <section id="accueil" className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden bg-noise">
      <div className="pointer-events-none absolute -top-20 -left-20 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[140px]" />

      <VinylRecord direction="cw" className="hidden lg:block absolute left-[-6rem] xl:left-[-2rem] top-1/2 -translate-y-1/2 h-56 w-56 xl:h-72 xl:w-72 opacity-30 drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]" />
      <VinylRecord direction="cw" className="lg:hidden absolute left-[-3rem] top-24 h-24 w-24 opacity-20" />

      <VinylRecord direction="ccw" className="hidden lg:block absolute right-[-6rem] xl:right-[-2rem] top-1/2 -translate-y-1/2 h-56 w-56 xl:h-72 xl:w-72 opacity-30 drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]" labelColor="#FB7185" labelAccent="#FDA4AF" />
      <VinylRecord direction="ccw" className="lg:hidden absolute right-[-3rem] bottom-12 h-24 w-24 opacity-20" labelColor="#FB7185" labelAccent="#FDA4AF" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 backdrop-blur px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Ta musique, notre mission · Distribution 150+ plateformes · Afrique &amp; monde
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="mt-7 text-center font-display font-bold tracking-tight text-balance text-4xl sm:text-6xl lg:text-7xl leading-[1.05]">
          Votre musique partout.
          <br />
          <span className="text-gradient-gold">Vos royalties à 100 %.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg text-muted-foreground leading-relaxed">
          MR - K Distribution diffuse vos singles, EPs et albums sur Spotify, Apple Music, Deezer, TikTok et 150+ plateformes. Tarifs transparents, accompagnement humain, paiement direct.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-7 h-12 text-base shadow-lg glow-gold">
            <a href="#tarifs" className="inline-flex items-center gap-2">En profiter <ArrowRight className="h-4 w-4" /></a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 text-base border-border bg-secondary/40 hover:bg-secondary">
            <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Me contacter</a>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="mt-14 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
          {[
            { k: "150+", v: "plateformes" },
            { k: "100%", v: "royalties artiste" },
            { k: "48h", v: "mise en ligne" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-border bg-card/60 backdrop-blur px-3 sm:px-5 py-4 sm:py-5 text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold">{s.k}</div>
              <div className="mt-1 text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </motion.div>

        <div className="mt-16 flex justify-center">
          <a href="#apropos" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-[11px] uppercase tracking-[0.3em]">Scroll</span>
            <span className="h-10 w-6 rounded-full border border-border flex items-start justify-center p-1.5">
              <motion.span animate={{ y: [0, 10, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
