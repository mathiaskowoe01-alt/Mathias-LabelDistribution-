'use client'

import { Wallet, TrendingDown, Coins, TrendingUp, CreditCard, Inbox, ArrowRight } from "lucide-react";
import { KpiCard, SectionCard, EmptyStateCard } from "../shared/ui";
import { PageHeader } from "../admin-shell";
import { type Submission, formatFCFA } from "@/lib/admin-types";

export function RevenueView({
  submissions,
  onInspectStatus,
  onInspectPlan,
  onInspectPayment,
}: {
  submissions: Submission[];
  onInspectStatus?: (status: "all" | "pending" | "approved" | "delivered" | "rejected" | "validated") => void;
  onInspectPlan?: (plan: string) => void;
  onInspectPayment?: (paymentMethod: string) => void;
}) {
  const totalRevenue = submissions.filter((s) => s.status === "approved" || s.status === "delivered").reduce((sum, s) => sum + s.amount, 0);
  const pendingRevenue = submissions.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.amount, 0);
  const rejectedRevenue = submissions.filter((s) => s.status === "rejected").reduce((sum, s) => sum + s.amount, 0);
  const avgRevenue = submissions.length > 0 ? Math.round(submissions.reduce((sum, s) => sum + s.amount, 0) / submissions.length) : 0;

  // Revenue by plan (real data)
  const planRevenue: Record<string, number> = { single: 0, ep: 0, album: 0 };
  submissions.forEach((s) => { if (planRevenue[s.plan] !== undefined) planRevenue[s.plan] += s.amount; });
  const maxPlanRev = Math.max(1, ...Object.values(planRevenue));
  const PLAN_LABELS_LOCAL: Record<string, string> = { single: "Single Start", ep: "EP Boost", album: "Album Pro" };
  const PLAN_COLORS: Record<string, string> = { single: "#FB7185", ep: "#A855F7", album: "#F59E0B" };

  // Payment method revenue (real data)
  const paymentRevenue: Record<string, number> = {};
  submissions.forEach((s) => {
    const pm = s.paymentMethod || "none";
    paymentRevenue[pm] = (paymentRevenue[pm] || 0) + s.amount;
  });
  const totalPayRev = Object.values(paymentRevenue).reduce((a, b) => a + b, 0) || 1;
  const PAYMENT_LABELS_LOCAL: Record<string, string> = {
    production_interne: "Production Label",
    mobile_money: "Mobile Money",
    card: "Carte bancaire",
    bank: "Virement",
    whatsapp: "WhatsApp",
    none: "Non défini",
  };
  const PAYMENT_COLORS: Record<string, string> = {
    production_interne: "#EAB308",
    mobile_money: "#10B981",
    card: "#F59E0B",
    bank: "#A855F7",
    whatsapp: "#25D366",
    none: "#6b7280",
  };

  const isEmpty = submissions.length === 0;
  const conversionRate = submissions.length > 0 ? Math.round(((submissions.filter((s) => s.status === "approved" || s.status === "delivered").length) / submissions.length) * 100) : 0;

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-9 max-w-7xl mx-auto">
      <PageHeader
        badge="Dashboard Financier"
        title="Analyse des"
        titleAccent="revenus"
        subtitle="Cliquez sur une carte ou une ligne pour inspecter les dossiers correspondants"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={Wallet}
          label="Revenus validés"
          value={formatFCFA(totalRevenue)}
          accent="green"
          ctaLabel="Voir les dossiers validés"
          onClick={() => onInspectStatus?.("validated")}
        />
        <KpiCard
          icon={TrendingDown}
          label="Revenus en attente"
          value={formatFCFA(pendingRevenue)}
          accent="orange"
          ctaLabel="Voir les dossiers en attente"
          onClick={() => onInspectStatus?.("pending")}
        />
        <KpiCard
          icon={Coins}
          label="Revenu moyen / sortie"
          value={formatFCFA(avgRevenue)}
          accent="gold"
          ctaLabel="Voir toutes les sorties"
          onClick={() => onInspectStatus?.("all")}
        />
        <KpiCard
          icon={TrendingUp}
          label="Taux de validation"
          value={`${conversionRate}%`}
          accent="purple"
          ctaLabel="Voir les sorties approuvées"
          onClick={() => onInspectStatus?.("approved")}
        />
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyStateCard
            icon={Inbox}
            title="Aucune donnée financière"
            description="L'analyse des revenus apparaîtra ici dès que les premières soumissions seront reçues et traitées."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue by plan — real data (clickable) */}
          <SectionCard title="Revenus par formule" icon={Coins}>
            <div className="space-y-3 mt-1">
              {Object.entries(planRevenue).map(([plan, rev]) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => onInspectPlan?.(plan)}
                  className="w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[plan] }} />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{PLAN_LABELS_LOCAL[plan]}</span>
                    </div>
                    <span className="text-sm font-semibold font-mono inline-flex items-center gap-1">
                      {formatFCFA(rev)}
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(rev / maxPlanRev) * 100}%`, backgroundColor: PLAN_COLORS[plan] }} />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Payment method revenue — real data (clickable) */}
          <SectionCard title="Revenus par méthode de paiement" icon={CreditCard}>
            <div className="space-y-2.5">
              {Object.entries(paymentRevenue).map(([pm, rev]) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => onInspectPayment?.(pm)}
                  className="w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[pm] || "#6b7280" }} />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{PAYMENT_LABELS_LOCAL[pm] || pm}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono inline-flex items-center gap-1">
                      {formatFCFA(rev)} ({Math.round((rev / totalPayRev) * 100)}%)
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(rev / totalPayRev) * 100}%`, backgroundColor: PAYMENT_COLORS[pm] || "#6b7280" }} />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {rejectedRevenue > 0 && (
        <div className="mt-4">
          <SectionCard title="Revenus rejetés" icon={TrendingDown}>
            <button
              type="button"
              onClick={() => onInspectStatus?.("rejected")}
              className="w-full text-left p-2 rounded-xl hover:bg-secondary/50 transition-colors flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                Montant total des soumissions rejetées :{" "}
                <strong className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{formatFCFA(rejectedRevenue)}</strong>
              </span>
              <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
                Voir les dossiers <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
