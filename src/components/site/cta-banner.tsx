'use client'

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="relative py-20 sm:py-24 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl border border-border bg-gradient-card p-8 sm:p-14 text-center">
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[40rem] rounded-full bg-primary/20 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-72 rounded-full bg-accent/15 blur-[100px]" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight max-w-2xl mx-auto">Prêt à sortir <span className="text-gradient-gold">votre musique ?</span></h2>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">Rejoignez les artistes qui nous font confiance. Choisissez un plan, remplissez les infos, payez en ligne. On s'occupe du reste.</p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-7 h-12 text-base shadow-lg glow-gold">
                <a href="#tarifs" className="inline-flex items-center gap-2">En profiter maintenant <ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 text-base border-border bg-secondary/40 hover:bg-secondary">
                <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Me contacter sur WhatsApp</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
