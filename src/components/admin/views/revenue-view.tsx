'use client'

import { Wallet, TrendingDown, Coins, TrendingUp, CreditCard, Inbox } from "lucide-react";
import { KpiCard, SectionCard, EmptyStateCard } from "../shared/ui";
import { PageHeader } from "../admin-shell";
import { type Submission, formatFCFA } from "@/lib/admin-types";

export function RevenueView({ submissions }: { submissions: Submission[] }) {
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
    mobile_money: "Mobile Money", card: "Carte bancaire", bank: "Virement", whatsapp: "WhatsApp", none: "Non défini",
  };
  const PAYMENT_COLORS: Record<string, string> = {
    mobile_money: "#10B981", card: "#F59E0B", bank: "#A855F7", whatsapp: "#25D366", none: "#6b7280",
  };

  const isEmpty = submissions.length === 0;
  const conversionRate = submissions.length > 0 ? Math.round(((submissions.filter((s) => s.status === "approved" || s.status === "delivered").length) / submissions.length) * 100) : 0;

  return (
    <div className="px-5 sm:px-8 py-7 sm:py-9 max-w-7xl mx-auto">
      <PageHeader badge="Dashboard" title="Analyse des" titleAccent="revenus" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Wallet} label="Revenus totaux" value={formatFCFA(totalRevenue)} accent="green" />
        <KpiCard icon={TrendingDown} label="Revenus en attente" value={formatFCFA(pendingRevenue)} accent="orange" />
        <KpiCard icon={Coins} label="Revenu moyen / sortie" value={formatFCFA(avgRevenue)} accent="gold" />
        <KpiCard icon={TrendingUp} label="Taux de conversion" value={`${conversionRate}%`} accent="purple" />
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
          {/* Revenue by plan — real data */}
          <SectionCard title="Revenus par formule" icon={Coins}>
            <div className="space-y-4 mt-2">
              {Object.entries(planRevenue).map(([plan, rev]) => (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[plan] }} />
                      <span className="text-sm font-medium">{PLAN_LABELS_LOCAL[plan]}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatFCFA(rev)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(rev / maxPlanRev) * 100}%`, backgroundColor: PLAN_COLORS[plan] }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Payment method revenue — real data */}
          <SectionCard title="Revenus par méthode de paiement" icon={CreditCard}>
            <div className="space-y-3">
              {Object.entries(paymentRevenue).map(([pm, rev]) => (
                <div key={pm}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[pm] }} />
                      <span className="text-sm font-medium">{PAYMENT_LABELS_LOCAL[pm] || pm}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatFCFA(rev)} ({Math.round((rev / totalPayRev) * 100)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(rev / totalPayRev) * 100}%`, backgroundColor: PAYMENT_COLORS[pm] }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {rejectedRevenue > 0 && (
        <div className="mt-4">
          <SectionCard title="Revenus rejetés" icon={TrendingDown}>
            <p className="text-sm text-muted-foreground">Montant total des soumissions rejetées : <span className="font-semibold text-rose-400">{formatFCFA(rejectedRevenue)}</span></p>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
