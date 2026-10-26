'use client'

import { Fragment, useMemo, useState } from "react";
import {
  Search, Trash2, ChevronRight, ChevronDown, Inbox, Mail,
  MessageCircle, ExternalLink, Disc3, Music, Album as AlbumIcon,
  Sparkles, CheckCircle2, AlertCircle, Send, PlusCircle,
  Eye, Download, Copy, Check, FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PageHeader } from "../admin-shell";
import { StatusBadge } from "../shared/ui";
import { type Submission, STATUS_LABELS, PLAN_LABELS, PAYMENT_LABELS, formatFCFA, formatDate, formatDateTime } from "@/lib/admin-types";
import {
  type NotificationType,
  formatWhatsAppPhone,
  buildWhatsAppNotificationMessage,
  openWhatsAppNotification,
} from "@/lib/whatsapp-notification";

const PLAN_ICONS: Record<string, typeof Music> = { single: Music, ep: Disc3, album: AlbumIcon };

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
  onSimulate,
}: {
  submissions: Submission[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onNewRelease?: () => void;
  onSimulate?: () => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<{ submission: Submission; type: NotificationType } | null>(null);

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
    setNotifyTarget({ submission: s, type: newStatus });
  }

  return (
    <div className="px-5 sm:px-8 py-7 sm:py-9 max-w-7xl mx-auto">
      <PageHeader
        badge="Demandes"
        title="Demandes de"
        titleAccent="distribution"
        subtitle={`${filtered.length} demande${filtered.length > 1 ? "s" : ""} · ${submissions.length} au total`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onSimulate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSimulate}
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
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[140px] rounded-xl text-xs">
              <SelectValue placeholder="Tous statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="pending">Nouveau</SelectItem>
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
            <SelectTrigger className="h-10 w-full sm:w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="Tous paiements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous paiements</SelectItem>
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
            className="h-10 rounded-xl px-3 text-xs gap-1.5 shrink-0 hover:border-primary/50"
            title="Exporter la liste filtrée au format CSV / Excel"
          >
            <Download className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Exporter</span> CSV
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="w-10 px-3 py-3 text-center"></th>
                <th className="px-4 py-3 font-medium">Projet & Artiste</th>
                <th className="px-4 py-3 font-medium">Formule</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Paiement</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
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
                              <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                {s.artistEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge kind={s.plan} label={PLAN_LABELS[s.plan] || s.plan} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge kind={s.status} label={STATUS_LABELS[s.status] || s.status} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <StatusBadge
                            kind="paid"
                            label={PAYMENT_LABELS[s.paymentMethod || ""] || "—"}
                          />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gradient-gold">
                          {formatFCFA(s.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Bouton Inspecter */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetail(s);
                              }}
                              className="h-8 px-2.5 rounded-lg text-xs gap-1 hover:border-primary/50 hover:bg-primary/5"
                              title="Voir et inspecter les détails du projet"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                              <span className="hidden xl:inline font-medium">Inspecter</span>
                            </Button>

                            {/* Raccourci WhatsApp direct */}
                            <a
                              href={`https://wa.me/${formatWhatsAppPhone(s.artistWhatsapp || s.artistPhone)}?text=${encodeURIComponent(`Bonjour ${s.artistName}, concernant votre sortie « ${s.releaseTitle} » sur MR - K Distribution :`)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-xs"
                              title={`Discuter avec ${s.artistName} sur WhatsApp (${s.artistWhatsapp || s.artistPhone})`}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>

                            {/* Supprimer */}
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
                                  Contact & Notification
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
                                      setNotifyTarget({ submission: s, type: t });
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
                                      setDetail(s);
                                    }}
                                  >
                                    Voir détail
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

      <SubmissionDetailDialog
        submission={detail}
        onClose={() => setDetail(null)}
        onUpdateStatus={onUpdateStatus}
        onOpenNotify={(s, type) => setNotifyTarget({ submission: s, type })}
      />

      <WhatsAppNotifyDialog
        key={notifyTarget ? `${notifyTarget.submission.id}-${notifyTarget.type}` : "none"}
        target={notifyTarget}
        onClose={() => setNotifyTarget(null)}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer cette demande ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. La demande sera définitivement retirée de la base.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
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

function WhatsAppNotifyDialog({
  target,
  onClose,
}: {
  target: { submission: Submission; type: NotificationType } | null;
  onClose: () => void;
}) {
  const [type, setType] = useState<NotificationType>(target?.type || "approved");
  const [customNote, setCustomNote] = useState("");
  const [dspLinks, setDspLinks] = useState("");
  const [isrcCodes, setIsrcCodes] = useState("");

  const submission = target?.submission;

  if (!submission) return null;

  const phone = formatWhatsAppPhone(submission.artistPhone, submission.artistWhatsapp);
  const previewMessage = buildWhatsAppNotificationMessage(submission, type, {
    customNote,
    dspLinks,
    isrcCodes,
  });

  const handleSend = () => {
    openWhatsAppNotification(submission, type, { customNote, dspLinks, isrcCodes });
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366] text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            Notifier {submission.artistName} sur WhatsApp
          </DialogTitle>
          <DialogDescription>
            Numéro destinataire : <strong>+{phone}</strong> · Projet : <em>{submission.releaseTitle}</em>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Template selector */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Modèle de message
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "approved" as NotificationType, label: "✅ Validé" },
                { id: "delivered" as NotificationType, label: "🚀 En ligne" },
                { id: "rejected" as NotificationType, label: "⚠️ Ajustement" },
                { id: "payment_reminder" as NotificationType, label: "💳 Paiement" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setType(m.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                    type === m.id
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional inputs */}
          {type === "delivered" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Lien(s) d'écoute / Smartlink</Label>
                <Input
                  value={dspLinks}
                  onChange={(e) => setDspLinks(e.target.value)}
                  placeholder="https://spotify.link/..."
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Codes ISRC / UPC</Label>
                <Input
                  value={isrcCodes}
                  onChange={(e) => setIsrcCodes(e.target.value)}
                  placeholder="BJ-XXX-26-00001"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">
              {type === "rejected" ? "Raison de l'ajustement requis *" : "Note personnalisée (optionnelle)"}
            </Label>
            <Input
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={
                type === "rejected"
                  ? "Pochette de mauvaise résolution, WAV requis..."
                  : "Ex : Votre titre est aussi sélectionné pour notre playlist éditoriale..."
              }
              className="h-9 text-xs"
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
              <span>Aperçu du message WhatsApp</span>
              <span className="text-[10px] text-muted-foreground lowercase">prêt à l'envoi</span>
            </Label>
            <div className="rounded-xl border border-border bg-[#0b141a]/95 text-[#e9edef] p-3.5 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-[#25D366]/30">
              {previewMessage}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button variant="outline" className="rounded-full text-xs" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              className="rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-xs px-5 shadow-md gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Envoyer sur WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubmissionDetailDialog({
  submission,
  onClose,
  onUpdateStatus,
  onOpenNotify,
}: {
  submission: Submission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenNotify: (submission: Submission, type: NotificationType) => void;
}) {
  const [copiedMeta, setCopiedMeta] = useState(false);
  if (!submission) return null;
  let social: Record<string, string> = {};
  try {
    if (submission.socialLinks) social = JSON.parse(submission.socialLinks);
  } catch {}
  const PIcon = PLAN_ICONS[submission.plan] || Music;

  function handleCopyMetadata() {
    if (!submission) return;
    const lines = [
      `🎵 MÉTADONNÉES DE SORTIE — MR - K DISTRIBUTION`,
      `----------------------------------------------`,
      `Projet : ${submission.releaseTitle}`,
      `Artiste : ${submission.artistName}`,
      `Genre : ${submission.releaseGenre}`,
      `Date de sortie : ${submission.releaseDate || "Non définie"}`,
      `Langue : ${submission.releaseLanguage || "Non spécifiée"}`,
      `Formule : ${PLAN_LABELS[submission.plan] || submission.plan}`,
      `Explicit : ${submission.explicit ? "Oui" : "Non"}`,
      `Email contact : ${submission.artistEmail}`,
      `Téléphone : ${submission.artistPhone}`,
      submission.artistWhatsapp ? `WhatsApp : ${submission.artistWhatsapp}` : "",
      `----------------------------------------------`,
      `TITRES (${submission.tracks.length}) :`,
      ...submission.tracks
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(
          (t) =>
            `  ${t.position}. ${t.title}${t.featuredArtists ? ` (feat. ${t.featuredArtists})` : ""}${t.duration ? ` [${t.duration}]` : ""}${t.isrc ? ` · ISRC: ${t.isrc}` : ""}`
        ),
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2200);
  }

  return (
    <Dialog open={!!submission} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <PIcon className="h-5 w-5 text-primary" />
                {submission.releaseTitle}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Soumis le {formatDateTime(submission.createdAt)} · ID : {submission.id.slice(0, 8)}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind={submission.status} label={STATUS_LABELS[submission.status] || submission.status} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyMetadata}
                className="h-7 text-xs rounded-lg gap-1"
                title="Copier les métadonnées pour Spotify / Apple Music / Distributeur"
              >
                {copiedMeta ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-primary" />}
                {copiedMeta ? "Copié !" : "Copier métadonnées"}
              </Button>
              <Button asChild size="sm" className="h-7 text-xs rounded-lg bg-[#25D366] hover:bg-[#1ebd5a] text-white font-medium gap-1 shadow-xs">
                <a
                  href={`https://wa.me/${formatWhatsAppPhone(submission.artistWhatsapp || submission.artistPhone)}?text=${encodeURIComponent(`Bonjour ${submission.artistName}, concernant votre projet « ${submission.releaseTitle} » sur MR - K Distribution :`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-current" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Formule</div>
              <div className="font-display text-lg font-bold mt-0.5">
                {PLAN_LABELS[submission.plan]} ·{" "}
                <span className="text-gradient-gold">{formatFCFA(submission.amount)}</span>
              </div>
            </div>
            {submission.paymentMethod && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Paiement</div>
                <div className="text-sm font-medium mt-0.5">
                  {PAYMENT_LABELS[submission.paymentMethod] || submission.paymentMethod}
                </div>
              </div>
            )}
          </div>

          <DetailSection title="Informations artiste">
            <DetailRow label="Nom" value={submission.artistName} />
            <DetailRow label="Email" value={submission.artistEmail} />
            <DetailRow label="Téléphone" value={submission.artistPhone} />
            {submission.artistWhatsapp && <DetailRow label="WhatsApp" value={submission.artistWhatsapp} />}
            {submission.artistCity && <DetailRow label="Ville" value={submission.artistCity} />}
            {submission.artistBio && <DetailRow label="Bio" value={submission.artistBio} />}
            {social.instagram && <DetailRow label="Instagram" value={social.instagram} />}
            {social.tiktok && <DetailRow label="TikTok" value={social.tiktok} />}
            {social.youtube && <DetailRow label="YouTube" value={social.youtube} />}
            {social.spotify && <DetailRow label="Spotify" value={social.spotify} />}
          </DetailSection>

          <DetailSection title="Informations projet">
            {submission.coverArtUrl && (
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card/60">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={submission.coverArtUrl}
                    alt={submission.releaseTitle}
                    className="h-20 w-20 rounded-xl object-cover border border-border shadow-sm shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{submission.releaseTitle}</div>
                    <div className="text-xs text-muted-foreground">Pochette officielle téléversée</div>
                    <a
                      href={submission.coverArtUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Ouvrir dans un nouvel onglet
                    </a>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1.5 shrink-0 hover:border-primary/50">
                  <a
                    href={submission.coverArtUrl}
                    download={`${submission.releaseTitle.toLowerCase().replace(/[^a-z0-9]/gi, "_")}_cover.jpg`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" /> Télécharger HD
                  </a>
                </Button>
              </div>
            )}
            <DetailRow label="Titre" value={submission.releaseTitle} />
            <DetailRow label="Genre" value={submission.releaseGenre} />
            {submission.releaseLanguage && <DetailRow label="Langue" value={submission.releaseLanguage} />}
            {submission.releaseDate && <DetailRow label="Date de sortie" value={submission.releaseDate} />}
            {submission.coverArtUrl && <DetailRow label="Pochette" value={submission.coverArtUrl} link />}
            <DetailRow label="Explicit" value={submission.explicit ? "Oui" : "Non"} />
          </DetailSection>

          <DetailSection title={`Titres (${submission.tracks.length})`}>
            <div className="space-y-2.5 mt-2">
              {submission.tracks
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((t) => (
                  <div key={t.id} className="rounded-xl border border-border bg-background/50 p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-gold text-black font-display font-bold text-sm">
                        {t.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {t.title}
                          {t.explicit && (
                            <span className="ml-2 text-[10px] uppercase text-rose-400">Explicit</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          {t.featuredArtists && <span>feat. {t.featuredArtists}</span>}
                          {t.duration && <span>· {t.duration}</span>}
                          {t.isrc && <span>· ISRC: {t.isrc}</span>}
                        </div>
                        {t.audioUrl && (
                          <div className="mt-2 space-y-1.5">
                            <audio controls preload="none" src={t.audioUrl} className="h-8 w-full max-w-md rounded" />
                            <div>
                              <a
                                href={t.audioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" /> Ouvrir le fichier audio dans un nouvel onglet
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DetailSection>

          <div className="pt-3 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Modifier le statut</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["pending", "approved", "rejected", "delivered"] as const).map((st) => {
                const isActive = submission.status === st;
                return (
                  <Button
                    key={st}
                    variant="outline"
                    size="sm"
                    disabled={isActive}
                    onClick={() => {
                      onUpdateStatus(submission.id, st);
                      if (st === "approved" || st === "delivered" || st === "rejected") {
                        onOpenNotify(submission, st);
                      }
                    }}
                    className={cn("rounded-xl h-10 justify-center gap-1.5", isActive && "opacity-50")}
                  >
                    {STATUS_LABELS[st]}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a href={`mailto:${submission.artistEmail}`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <a
                  href={`https://wa.me/${formatWhatsAppPhone(submission.artistWhatsapp || submission.artistPhone)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Chat direct
                </a>
              </Button>
            </div>
            <Button
              size="sm"
              className="rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-medium gap-1.5 shadow-sm"
              onClick={() => {
                const t: NotificationType =
                  submission.status === "delivered"
                    ? "delivered"
                    : submission.status === "approved"
                    ? "approved"
                    : "payment_reminder";
                onOpenNotify(submission, t);
              }}
            >
              <MessageCircle className="h-4 w-4" /> Notifier via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</h3>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{label}</span>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline break-all text-right max-w-[60%]"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-right max-w-[65%]">{value}</span>
      )}
    </div>
  );
}
