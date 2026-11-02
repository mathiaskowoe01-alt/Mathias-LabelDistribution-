'use client'

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Search, Trash2, ChevronRight, ChevronDown, Inbox, Mail,
  MessageCircle, Disc3, Sparkles, PlusCircle, Eye, Download, UserPlus,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageHeader } from "../admin-shell";
import { StatusBadge } from "../shared/ui";
import { type Submission, STATUS_LABELS, PLAN_LABELS, PAYMENT_LABELS, formatFCFA, formatDate } from "@/lib/admin-types";
import { type NotificationType, formatWhatsAppPhone } from "@/lib/whatsapp-notification";

function exportSubmissionsCsv(data: Submission[]) {
  if (data.length === 0) return;
  const headers = [
    "ID",
    "Date",
    "Titre Projet",
    "Artiste",
    "Email",
    "Téléphone",
    "WhatsApp",
    "Ville",
    "Formule",
    "Montant (FCFA)",
    "Statut",
    "Paiement",
    "Genre",
    "Langue",
    "Date Sortie",
    "Nb Titres",
    "Pochette HD",
  ];

  const escapeCell = (cell: any) => {
    const str = String(cell ?? "");
    if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((s) => [
    s.id,
    new Date(s.createdAt).toLocaleDateString("fr-FR"),
    s.releaseTitle,
    s.artistName,
    s.artistEmail,
    s.artistPhone,
    s.artistWhatsapp || "",
    s.artistCity || "",
    PLAN_LABELS[s.plan] || s.plan,
    s.amount,
    STATUS_LABELS[s.status] || s.status,
    PAYMENT_LABELS[s.paymentMethod || ""] || s.paymentMethod || "Non défini",
    s.releaseGenre,
    s.releaseLanguage || "",
    s.releaseDate || "",
    s.tracks.length,
    s.coverArtUrl || "",
  ]);

  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCell).join(";"), ...rows.map((r) => r.map(escapeCell).join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mrk-demandes-distribution-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function DemandesView({
  submissions,
  loading,
  onRefresh,
  onUpdateStatus,
  onDelete,
  onNewRelease,
  onAddProductionArtist,
  onSelectSubmission,
  onOpenNotify,
  onEditSubmission,
  initialStatusFilter = "all",
  initialPlanFilter = "all",
}: {
  submissions: Submission[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onNewRelease?: () => void;
  onAddProductionArtist?: () => void;
  onSelectSubmission: (s: Submission) => void;
  onOpenNotify: (submission: Submission, type: NotificationType) => void;
  onEditSubmission?: (submission: Submission) => void;
  initialStatusFilter?: string;
  initialPlanFilter?: string;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [planFilter, setPlanFilter] = useState(initialPlanFilter);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    setPlanFilter(initialPlanFilter);
  }, [initialPlanFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: submissions.length,
      pending: submissions.filter((s) => s.status === "pending").length,
      approved: submissions.filter((s) => s.status === "approved").length,
      delivered: submissions.filter((s) => s.status === "delivered").length,
      rejected: submissions.filter((s) => s.status === "rejected").length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (planFilter !== "all" && s.plan !== planFilter) return false;
      const pm = s.paymentMethod || "none";
      if (paymentFilter !== "all" && pm !== paymentFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.artistName.toLowerCase().includes(q) ||
          s.releaseTitle.toLowerCase().includes(q) ||
          s.artistEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [submissions, search, statusFilter, planFilter, paymentFilter]);

  function handleExportCsv() {
    if (filtered.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucune demande à exporter pour ces filtres.",
        variant: "destructive",
      });
      return;
    }
    exportSubmissionsCsv(filtered);
    toast({
      title: "Export CSV réussi !",
      description: `${filtered.length} demande(s) exportée(s) au format compatible Excel.`,
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    onDelete(deleteId);
    setDeleteId(null);
    toast({ title: "Demande supprimée", description: "La demande a été retirée." });
  }

  function handleStatusChangeAndNotify(s: Submission, newStatus: "approved" | "delivered" | "rejected") {
    onUpdateStatus(s.id, newStatus);
    onOpenNotify(s, newStatus);
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-9 max-w-7xl mx-auto">
      <PageHeader
        badge="Demandes & Production"
        title="Demandes de"
        titleAccent="distribution"
        subtitle={`${filtered.length} demande${filtered.length > 1 ? "s" : ""} affichée${filtered.length > 1 ? "s" : ""} · Cliquez sur un statut ou un dossier pour accéder aux infos`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onAddProductionArtist && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProductionArtist}
                className="h-9 rounded-xl text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                + Artiste en prod
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

      {/* Interactive Status Quick Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        {[
          { id: "all", label: "Tous les dossiers", count: statusCounts.all, dot: "bg-primary" },
          { id: "pending", label: "En attente", count: statusCounts.pending, dot: "bg-amber-500" },
          { id: "approved", label: "Approuvés", count: statusCounts.approved, dot: "bg-emerald-500" },
          { id: "delivered", label: "Livrés (En ligne)", count: statusCounts.delivered, dot: "bg-sky-500" },
          { id: "rejected", label: "Rejetés", count: statusCounts.rejected, dot: "bg-rose-500" },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "flex items-center justify-between gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer",
                isActive
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", tab.dot)} />
                <span className={cn("text-xs font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
                  {tab.label}
                </span>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-mono font-bold shrink-0",
                  isActive ? "bg-primary text-black" : "bg-secondary text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Filter Bar */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 mb-4 flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par artiste, email, titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-background/60"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[145px] rounded-xl text-xs">
              <SelectValue placeholder="Tous statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="Toutes formules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes formules</SelectItem>
              <SelectItem value="single">Single Start</SelectItem>
              <SelectItem value="ep">EP Boost</SelectItem>
              <SelectItem value="album">Album Pro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[160px] rounded-xl text-xs">
              <SelectValue placeholder="Tous paiements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous paiements</SelectItem>
              <SelectItem value="production_interne">Production Label</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="card">Carte bancaire</SelectItem>
              <SelectItem value="bank">Virement</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            className="h-10 w-full sm:w-auto rounded-xl px-3 text-xs gap-1.5 shrink-0 hover:border-primary/50"
            title="Exporter la liste filtrée au format CSV / Excel"
          >
            <Download className="h-4 w-4 text-primary shrink-0" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* MOBILE CARD VIEW (< md) */}
      <div className="md:hidden space-y-3">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Chargement des demandes...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Inbox className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune demande pour ces filtres.</p>
          </div>
        )}
        {!loading &&
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSubmission(s)}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3.5 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {s.coverArtUrl ? (
                    <img
                      src={s.coverArtUrl}
                      alt={s.releaseTitle}
                      className="h-13 w-13 shrink-0 rounded-xl object-cover border border-border shadow-xs bg-secondary/50"
                    />
                  ) : (
                    <div className="h-13 w-13 shrink-0 rounded-xl bg-gradient-gold/15 border border-primary/20 flex items-center justify-center text-primary">
                      <Disc3 className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-foreground text-sm truncate flex items-center gap-1.5">
                      <span className="truncate">{s.releaseTitle}</span>
                      {s.explicit && (
                        <span className="shrink-0 text-[9px] uppercase px-1 rounded bg-rose-500/20 text-rose-500 font-bold">
                          EXP
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-foreground/80 font-medium truncate">
                      {s.artistName}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {formatDate(s.createdAt)} · {s.tracks.length} piste{s.tracks.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm text-gradient-gold">
                    {formatFCFA(s.amount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {PAYMENT_LABELS[s.paymentMethod || ""] || "—"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  kind={s.plan}
                  label={PLAN_LABELS[s.plan] || s.plan}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSubmission(s);
                  }}
                />
                <StatusBadge
                  kind={s.status}
                  label={STATUS_LABELS[s.status] || s.status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSubmission(s);
                  }}
                />
              </div>

              <div
                className="pt-2.5 border-t border-border flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectSubmission(s)}
                    className="h-8 px-2.5 rounded-lg text-xs gap-1"
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    Infos
                  </Button>
                  {onEditSubmission && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEditSubmission(s)}
                      className="h-8 px-2.5 rounded-lg text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15"
                      title="Modifier les informations de ce projet"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </Button>
                  )}
                  {s.status === "pending" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChangeAndNotify(s, "approved")}
                      className="h-8 px-2.5 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                    >
                      Approuver
                    </Button>
                  )}
                  {s.status === "approved" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChangeAndNotify(s, "delivered")}
                      className="h-8 px-2.5 rounded-lg text-xs text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/5"
                    >
                      Marquer livré
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${formatWhatsAppPhone(s.artistWhatsapp || s.artistPhone)}?text=${encodeURIComponent(`Bonjour ${s.artistName}, concernant votre sortie « ${s.releaseTitle} » sur Mathias Label :`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleteId(s.id)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* DESKTOP TABLE VIEW (md+) */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="w-10 px-3 py-3 text-center"></th>
                <th className="px-4 py-3 font-medium">Projet &amp; Artiste</th>
                <th className="px-4 py-3 font-medium">Formule</th>
                <th className="px-4 py-3 font-medium">Statut (Cliquer pour infos)</th>
                <th className="px-4 py-3 font-medium">Paiement</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="text-right font-medium px-4 py-3">Montant</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    Chargement...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Inbox className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune demande pour ces filtres.</p>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((s) => {
                  const isExpanded = expanded === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        key={`${s.id}-main`}
                        className="cursor-pointer hover:bg-secondary/30 transition-colors"
                        onClick={() => setExpanded(isExpanded ? null : s.id)}
                      >
                        <td className="px-3 py-3 text-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubmission(s);
                          }}
                        >
                          <div className="flex items-center gap-3 group">
                            {s.coverArtUrl ? (
                              <img
                                src={s.coverArtUrl}
                                alt={s.releaseTitle}
                                className="h-11 w-11 shrink-0 rounded-lg object-cover border border-border shadow-xs bg-secondary/50"
                              />
                            ) : (
                              <div className="h-11 w-11 shrink-0 rounded-lg bg-gradient-gold/15 border border-primary/20 flex items-center justify-center text-primary">
                                <Disc3 className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate flex items-center gap-1.5">
                                <span className="truncate">{s.releaseTitle}</span>
                                {s.explicit && (
                                  <span className="shrink-0 text-[9px] uppercase px-1 rounded bg-rose-500/20 text-rose-500 font-bold">
                                    EXP
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-foreground/80 font-medium truncate">
                                {s.artistName}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                {s.artistEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            kind={s.plan}
                            label={PLAN_LABELS[s.plan] || s.plan}
                            title="Cliquer pour voir les informations du projet"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubmission(s);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            kind={s.status}
                            label={STATUS_LABELS[s.status] || s.status}
                            title="Cliquer pour ouvrir la fiche complète"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubmission(s);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            kind="paid"
                            label={PAYMENT_LABELS[s.paymentMethod || ""] || "—"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSubmission(s);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gradient-gold">
                          {formatFCFA(s.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubmission(s);
                              }}
                              className="h-8 px-2.5 rounded-lg text-xs gap-1 hover:border-primary/50 hover:bg-primary/5"
                              title="Voir et inspecter les détails du projet"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span className="hidden xl:inline font-medium">Infos</span>
                            </Button>

                            {onEditSubmission && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditSubmission(s);
                                }}
                                className="h-8 px-2.5 rounded-lg text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15"
                                title="Modifier ce projet et ses informations"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline font-medium">Modifier</span>
                              </Button>
                            )}

                            <a
                              href={`https://wa.me/${formatWhatsAppPhone(s.artistWhatsapp || s.artistPhone)}?text=${encodeURIComponent(`Bonjour ${s.artistName}, concernant votre sortie « ${s.releaseTitle} » sur Mathias Label :`)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-xs"
                              title={`Discuter avec ${s.artistName} sur WhatsApp`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(s.id);
                              }}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Supprimer la demande"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${s.id}-detail`} className="bg-secondary/20">
                          <td></td>
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-start gap-3">
                                {s.coverArtUrl && (
                                  <img
                                    src={s.coverArtUrl}
                                    alt={s.releaseTitle}
                                    className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border shadow-xs"
                                  />
                                )}
                                <div className="space-y-1">
                                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    Projet
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium">{s.releaseTitle}</div>
                                    <div className="text-muted-foreground text-xs mt-0.5">
                                      {s.releaseGenre}
                                      {s.releaseLanguage ? ` · ${s.releaseLanguage}` : ""}
                                    </div>
                                    {s.releaseDate && (
                                      <div className="text-xs text-muted-foreground">
                                        Sortie : {s.releaseDate}
                                      </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                      {s.tracks.length} titre{s.tracks.length > 1 ? "s" : ""}
                                      {s.explicit ? " · Explicit" : ""}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                  Contact &amp; Notification
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <Button asChild size="sm" variant="outline" className="h-8 rounded-full text-xs">
                                    <a href={`mailto:${s.artistEmail}`} onClick={(e) => e.stopPropagation()}>
                                      <Mail className="h-3 w-3 mr-1" /> Email
                                    </a>
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-full text-xs bg-[#25D366] hover:bg-[#1ebd5a] text-white font-medium shadow-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const t: NotificationType =
                                        s.status === "delivered"
                                          ? "delivered"
                                          : s.status === "approved"
                                          ? "approved"
                                          : "payment_reminder";
                                      onOpenNotify(s, t);
                                    }}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5 mr-1" /> Notifier WhatsApp
                                  </Button>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Téléphone : {s.artistPhone}
                                  {s.artistWhatsapp ? ` · WA: ${s.artistWhatsapp}` : ""}
                                </div>
                                {s.artistCity && (
                                  <div className="text-xs text-muted-foreground">{s.artistCity}</div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                  Actions Rapides
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectSubmission(s);
                                    }}
                                  >
                                    Voir toutes les infos
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChangeAndNotify(s, "approved");
                                    }}
                                  >
                                    Approuver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChangeAndNotify(s, "delivered");
                                    }}
                                  >
                                    Marquer livré
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette demande ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La demande sera définitivement retirée de la base.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-col-reverse xs:flex-row justify-end gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button className="rounded-full bg-rose-500 hover:bg-rose-600 text-white" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
