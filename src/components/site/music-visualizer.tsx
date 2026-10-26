'use client'

import { motion } from "framer-motion";
import { Music4, Heart, Star, Sparkles } from "lucide-react";
import { VinylRecord } from "./vinyl-record";

export function MusicVisualizer() {
  const notes = [
    { icon: Music4, x: "8%",  y: "20%", delay: 0,   duration: 6 },
    { icon: Music4, x: "85%", y: "15%", delay: 1.2, duration: 7 },
    { icon: Heart,  x: "78%", y: "75%", delay: 0.6, duration: 5.5 },
    { icon: Star,   x: "12%", y: "78%", delay: 2.1, duration: 6.8 },
    { icon: Music4, x: "50%", y: "8%",  delay: 1.8, duration: 6.2 },
    { icon: Sparkles, x: "92%", y: "50%", delay: 0.9, duration: 7.4 },
  ];

  const bars = Array.from({ length: 11 }).map((_, i) => ({
    id: i,
    delay: i * 0.08,
    duration: 0.6 + (i % 3) * 0.15,
    heights: [40, 70, 100, 60, 85, 30, 95, 50, 75, 45, 90],
  }));

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute inset-8 rounded-full bg-accent/10 blur-[60px]" />

      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <VinylRecord direction="cw" className="h-full w-full drop-shadow-2xl" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="px-4 py-1.5 rounded-full border border-primary/40 bg-card/80 backdrop-blur text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Live preview
        </motion.div>

        <div className="flex items-end gap-1.5 h-24 sm:h-28">
          {bars.map((bar) => (
            <motion.span key={bar.id} className="w-1.5 sm:w-2 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-300 shadow-lg shadow-primary/30"
              animate={{ height: [`${bar.heights[0] * 0.3}%`, `${bar.heights[0]}%`, `${bar.heights[0] * 0.5}%`, `${bar.heights[0] * 0.9}%`, `${bar.heights[0] * 0.3}%`] }}
              transition={{ duration: bar.duration, delay: bar.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/80 backdrop-blur">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-black text-xs font-bold">%</span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold text-gradient-gold">100 %</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">royalties</span>
          </div>
        </motion.div>
      </div>

      {notes.map((note, i) => (
        <motion.div key={i} className="absolute text-primary/70" style={{ left: note.x, top: note.y }}
          animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4], rotate: [0, 8, -8, 0] }}
          transition={{ duration: note.duration, delay: note.delay, repeat: Infinity, ease: "easeInOut" }}>
          <note.icon className="h-5 w-5" />
        </motion.div>
      ))}

      <motion.div className="absolute inset-2 rounded-full border border-primary/20" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-6 rounded-full border border-dashed border-accent/15" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}
