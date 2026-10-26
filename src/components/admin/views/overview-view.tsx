'use client'

import { motion } from "framer-motion";
import { Disc3, Clock, TrendingUp, ArrowRight, Music2, Trophy, Inbox, PlusCircle, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard, SectionCard, StatusBadge } from "../shared/ui";
import { PageHeader } from "../admin-shell";
import { type Submission, STATUS_LABELS, formatFCFA } from "@/lib/admin-types";

export function OverviewView({
  submissions,
  onNewRelease,
  onSimulate,
  onSyncShowcase,
  isSeeding = false,
}: {
  submissions: Submission[];
  onNewRelease?: () => void;
  onSimulate?: () => void;
  onSyncShowcase?: () => void;
  isSeeding?: boolean;
}) {
  const total = submissions.length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const delivered = submissions.filter((s) => s.status === "delivered").length;
  const totalRevenue = submissions.filter((s) => s.status === "approved" || s.status === "delivered").reduce((sum, s) => sum + s.amount, 0);
  const pendingRevenue = submissions.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.amount, 0);
  const uniqueArtists = new Set(submissions.map((s) => s.artistEmail.toLowerCase())).size;
  const totalTracks = submissions.reduce((sum, s) => sum + s.tracks.length, 0);

  const artistMap = new Map<string, { name: string; revenue: number; tracks: number; count: number }>();
  submissions.forEach((s) => {
    const key = s.artistEmail.toLowerCase();
    const existing = artistMap.get(key) || { name: s.artistName, revenue: 0, tracks: 0, count: 0 };
    existing.revenue += s.amount;
    existing.tracks += s.tracks.length;
    existing.count += 1;
    artistMap.set(key, existing);
  });
  const topArtists = Array.from(artistMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const latest = submissions.slice(0, 5);

  // Plan distribution (real data)
  const planCounts: Record<string, number> = { single: 0, ep: 0, album: 0 };
  submissions.forEach((s) => { if (planCounts[s.plan] !== undefined) planCounts[s.plan]++; });
  const maxPlan = Math.max(1, ...Object.values(planCounts));

  // Payment method distribution (real data)
  const paymentCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    const pm = s.paymentMethod || "none";
    paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
  });
  const totalPayments = submissions.length || 1;
  const PAYMENT_LABELS_LOCAL: Record<string, string> = {
    mobile_money: "Mobile Money", card: "Carte bancaire", bank: "Virement", whatsapp: "WhatsApp", none: "Non défini",
  };
  const PAYMENT_COLORS: Record<string, string> = {
    mobile_money: "#10B981", card: "#F59E0B", bank: "#A855F7", whatsapp: "#25D366", none: "#6b7280",
  };

  // Genre distribution (real data)
  const genreCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    if (s.releaseGenre) genreCounts[s.releaseGenre] = (genreCounts[s.releaseGenre] || 0) + 1;
  });
  const topGenres = Object.entries(genreCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const maxGenre = topGenres.length > 0 ? topGenres[0].count : 1;

  const PLAN_LABELS_LOCAL: Record<string, string> = { single: "Single Start", ep: "EP Boost", album: "Album Pro" };
  const PLAN_COLORS: Record<string, string> = { single: "#FB7185", ep: "#A855F7", album: "#F59E0B" };

  const isEmpty = total === 0;

  return (
    <div className="px-5 sm:px-8 py-7 sm:py-9 max-w-7xl mx-auto">
      <PageHeader
        badge="Vue d'ensemble"
        title="Bonjour, voici votre"
        titleAccent="activité"
        subtitle={isEmpty ? "Espace prêt pour vos premières distributions" : `${total} projet${total > 1 ? "s" : ""} géré${total > 1 ? "s" : ""} · ${uniqueArtists} artiste${uniqueArtists > 1 ? "s" : ""}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onSyncShowcase && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSyncShowcase}
                disabled={isSeeding}
                className="h-9 rounded-xl text-xs"
                title="Synchroniser les 3 artistes de la page d'accueil vers la base de données"
              >
                {isSeeding ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
                Sync Vitrine
              </Button>
            )}
            {onSimulate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSimulate}
                disabled={isSeeding}
                className="h-9 rounded-xl text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Simuler demande
              </Button>
            )}
            {onNewRelease && (
              <Button
                size="sm"
                onClick={onNewRelease}
                className="h-9 rounded-xl text-xs bg-gradient-gold text-black hover:opacity-90 font-semibold shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                + Nouvelle sortie
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Disc3} label="Sorties totales" value={total} accent="orange" />
        <KpiCard icon={Clock} label="En attente" value={pending} accent="gold" />
        <KpiCard icon={TrendingUp} label="Revenus validés" value={formatFCFA(totalRevenue)} accent="green" />
        <KpiCard icon={Music2} label="Titres distribués" value={totalTracks} accent="purple" />
      </div>

      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Trophy} label="Artistes" value={uniqueArtists} accent="gold" />
        <KpiCard icon={Disc3} label="Approuvés" value={approved} accent="green" />
        <KpiCard icon={ArrowRight} label="Livrés" value={delivered} accent="purple" />
        <KpiCard icon={Clock} label="En attente (FCFA)" value={formatFCFA(pendingRevenue)} accent="orange" />
      </div>

      {isEmpty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-8 sm:p-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 ring-1 ring-border mb-4">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Aucune donnée pour le moment</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Pour synchroniser le dashboard avec les 3 artistes phares de la vitrine (Mïko Sun, Aura Kpèdji, D-Vibe), ou simuler une commande de test :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onSyncShowcase && (
              <Button
                onClick={onSyncShowcase}
                disabled={isSeeding}
                className="rounded-full bg-gradient-gold text-black font-semibold hover:opacity-90 px-5"
              >
                {isSeeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Synchroniser les 3 artistes de la vitrine
              </Button>
            )}
            {onSimulate && (
              <Button
                variant="outline"
                onClick={onSimulate}
                disabled={isSeeding}
                className="rounded-full px-5"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Simuler une demande de test
              </Button>
            )}
            {onNewRelease && (
              <Button
                variant="outline"
                onClick={onNewRelease}
                className="rounded-full px-5"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                + Nouvelle sortie manuelle
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* By plan — real data */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Répartition par formule" icon={Disc3}>
              <div className="space-y-4">
                {Object.entries(planCounts).map(([plan, count]) => (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[plan] }} />
                        <span className="text-sm font-medium">{PLAN_LABELS_LOCAL[plan]}</span>
                      </div>
                      <span className="text-sm font-semibold">{count} sortie{count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / maxPlan) * 100}%`, backgroundColor: PLAN_COLORS[plan] }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Payment methods — real data */}
            <SectionCard title="Méthodes de paiement" icon={TrendingUp}>
              <div className="space-y-3">
                {Object.entries(paymentCounts).map(([pm, count]) => (
                  <div key={pm}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[pm] }} />
                        <span className="text-sm font-medium">{PAYMENT_LABELS_LOCAL[pm] || pm}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{count} ({Math.round((count / totalPayments) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / totalPayments) * 100}%`, backgroundColor: PAYMENT_COLORS[pm] }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Latest + Top artists */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Dernières releases" icon={Music2} action={<span className="text-xs text-primary hover:underline inline-flex items-center gap-1">Tout voir <ArrowRight className="h-3 w-3" /></span>}>
              <div className="space-y-2">
                {latest.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/40 transition-colors">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-black font-display font-bold text-xs">{s.artistName.slice(0, 2).toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{s.releaseTitle}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.artistName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm text-gradient-gold">{formatFCFA(s.amount)}</div>
                      <div className="mt-0.5"><StatusBadge kind={s.status} label={STATUS_LABELS[s.status] || s.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Top artistes" icon={Trophy} action={<span className="text-xs text-primary hover:underline inline-flex items-center gap-1">Tout voir <ArrowRight className="h-3 w-3" /></span>}>
              <div className="space-y-2">
                {topArtists.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/40 transition-colors">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-400 font-display font-bold text-xs">{i + 1}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border font-display font-bold text-xs">{a.name.slice(0, 2).toUpperCase()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.tracks} titres · {a.count} sortie{a.count > 1 ? "s" : ""}</div>
                    </div>
                    <div className="font-semibold text-sm text-violet-400 shrink-0">{formatFCFA(a.revenue)}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Top genres — real data */}
          {topGenres.length > 0 && (
            <div className="mt-4">
              <SectionCard title="Top genre musical" icon={Music2}>
                <div className="space-y-3">
                  {topGenres.map((g) => (
                    <div key={g.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{g.name}</span>
                        <span className="text-xs text-muted-foreground">{g.count} sortie{g.count > 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${(g.count / maxGenre) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
