'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlanSubmissionDialog, type PlanId } from "./plan-submission-dialog";

type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  unit: string;
  features: string[];
  platforms: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    id: "single", name: "Single Start", tagline: "Pour le premier single, on vous lance proprement.", price: "15 000", unit: "FCFA / single",
    features: ["Paiement unique, sans abonnement", "Distribution sur 1 single", "Disponible sur Spotify, Apple Music, Deezer, TikTok, Boomplay", "Royalties 100 % reversées à l'artiste", "Mise en ligne sous 72h", "Support email", "Code ISRC généré gratuitement"],
    platforms: ["Spotify", "Apple Music", "Deezer", "TikTok", "Boomplay", "YouTube Music"],
    cta: "En profiter",
  },
  {
    id: "ep", name: "EP Boost", tagline: "Pour un EP de 4 à 6 titres, avec accompagnement et pré-save.", price: "45 000", unit: "FCFA / EP",
    features: ["Paiement unique, sans abonnement", "Distribution d'un EP (jusqu'à 6 titres)", "Toutes les plateformes (150+ stores)", "Pré-save Spotify + lien smartlink offert", "Accompagnement artistic-label humain", "Soumission aux playlists éditoriales", "Codes ISRC + UPC fournis", "Mise en ligne sous 48h", "Support prioritaire WhatsApp & email", "Rapport de streams mensuel"],
    platforms: ["Spotify", "Apple Music", "Deezer", "TikTok", "Boomplay", "YouTube Music", "+ 5"],
    cta: "En profiter", featured: true, badge: "Le plus choisi",
  },
  {
    id: "album", name: "Album Pro", tagline: "Pour un album complet + stratégie de promotion sur 3 mois.", price: "120 000", unit: "FCFA / album",
    features: ["Paiement unique, sans abonnement", "Distribution d'un album complet (jusqu'à 20 titres)", "150+ plateformes mondiales", "Stratégie de sortie sur 3 mois (premiers singles, EPK)", "Pitch playlists éditoriales Spotify / Apple Music", "Smartlink premium + page artiste dédiée", "Codes ISRC + UPC + ISWC fournis", "Accompagnement artistic-label dédié", "Rapports de streams hebdomadaires", "Conseil stratégie social media", "Support VIP 7j/7", "Option : masterisation -15 %"],
    platforms: ["Spotify", "Apple Music", "Deezer", "TikTok", "Boomplay", "YouTube Music", "+ 7"],
    cta: "En profiter",
  },
];

function PlanCard({ plan, index, onSelect }: { plan: Plan; index: number; onSelect: (id: PlanId) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: index * 0.1 }} className={cn("relative flex flex-col rounded-3xl border p-7 sm:p-8", plan.featured ? "border-primary/60 bg-gradient-card glow-gold" : "border-border bg-card hover:border-primary/30 transition-colors")}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg"><Star className="h-3.5 w-3.5 fill-black" />{plan.badge}</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight">{plan.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{plan.tagline}</p>
        </div>
        {plan.featured && <Sparkles className="h-5 w-5 text-primary shrink-0" />}
      </div>
      <div className="mt-6 flex items-baseline gap-2"><span className="font-display text-4xl sm:text-5xl font-bold text-gradient-gold">{plan.price}</span></div>
      <div className="mt-1 text-sm text-muted-foreground">{plan.unit}</div>
      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15"><Check className="h-3 w-3 text-primary" strokeWidth={3} /></span>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Plateformes incluses</div>
        <div className="flex flex-wrap gap-1.5">
          {plan.platforms.map((p) => (<span key={p} className="rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-xs font-medium text-foreground/80">{p}</span>))}
        </div>
      </div>
      <Button onClick={() => onSelect(plan.id)} className={cn("mt-7 w-full rounded-full h-12 font-semibold text-base", plan.featured ? "bg-gradient-gold text-black hover:opacity-90" : "bg-secondary text-foreground hover:bg-secondary/70 border border-border")}>
        <span className="inline-flex items-center justify-center gap-2">{plan.cta} <ArrowRight className="h-4 w-4" /></span>
      </Button>
    </motion.div>
  );
}

export function Pricing() {
  const [selected, setSelected] = useState<PlanId | null>(null);
  return (
    <section id="tarifs" className="relative py-24 sm:py-32 border-t border-border/60 bg-gradient-card">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">Tarifs</span>
          <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">Des prix clairs, <span className="text-gradient-gold">sans surprise.</span></h2>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">Choisissez votre plan, remplissez les infos demandées, payez en ligne. Nous nous occupons du reste. Cliquez sur un plan pour démarrer.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-stretch">
          {PLANS.map((p, i) => (<PlanCard key={p.id} plan={p} index={i} onSelect={setSelected} />))}
        </div>
        <div className="mt-10 text-center text-sm text-muted-foreground">Tous les plans incluent les codes ISRC, les 100 % de royalties et le support. Paiement mobile money, carte bancaire, virement ou WhatsApp.</div>
      </div>
      <PlanSubmissionDialog open={selected !== null} planId={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
