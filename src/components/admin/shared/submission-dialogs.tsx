'use client'

import React, { useState, useMemo } from "react";
import {
  Disc3, Music, Album as AlbumIcon, Mail, MessageCircle,
  ExternalLink, Download, Copy, Check, Eye, Inbox,
  ArrowRight, User, MapPin, Phone, Globe, CheckCircle2, Clock,
  Pencil,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./ui";
import {
  type Submission,
  STATUS_LABELS,
  PLAN_LABELS,
  PAYMENT_LABELS,
  formatFCFA,
  formatDate,
  formatDateTime,
} from "@/lib/admin-types";
import {
  type NotificationType,
  formatWhatsAppPhone,
  buildWhatsAppNotificationMessage,
  openWhatsAppNotification,
} from "@/lib/whatsapp-notification";

const PLAN_ICONS: Record<string, typeof Music> = {
  single: Music,
  ep: Disc3,
  album: AlbumIcon,
};

export function SubmissionDetailDialog({
  submission,
  onClose,
  onUpdateStatus,
  onOpenNotify,
  onEditSubmission,
  onEditArtist,
}: {
  submission: Submission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenNotify: (submission: Submission, type: NotificationType) => void;
  onEditSubmission?: (submission: Submission) => void;
  onEditArtist?: (artist: any) => void;
}) {
  const [copiedMeta, setCopiedMeta] = useState(false);
  if (!submission) return null;

  let social: Record<string, string> = {};
  try {
    if (submission.socialLinks) social = JSON.parse(submission.socialLinks);
  } catch {
    // ignore
  }
  const PIcon = PLAN_ICONS[submission.plan] || Music;

  function handleCopyMetadata() {
    if (!submission) return;
    const lines = [
      `🎵 MÉTADONNÉES DE SORTIE — MATHIAS LABEL`,
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
      <DialogContent className="max-w-2xl max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
                <PIcon className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{submission.releaseTitle}</span>
              </DialogTitle>
              <DialogDescription className="mt-1">
                Soumis le {formatDateTime(submission.createdAt)} · ID : {submission.id.slice(0, 8)}
              </DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind={submission.status} label={STATUS_LABELS[submission.status] || submission.status} />
              {onEditSubmission && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEditSubmission(submission);
                  }}
                  className="h-7 text-xs rounded-lg gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15"
                  title="Modifier les détails de cette sortie"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Modifier la sortie</span>
                </Button>
              )}
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
                  href={`https://wa.me/${formatWhatsAppPhone(submission.artistWhatsapp || submission.artistPhone)}?text=${encodeURIComponent(`Bonjour ${submission.artistName}, concernant votre projet « ${submission.releaseTitle} » sur Mathias Label :`)}`}
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
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Formule</div>
              <div className="font-display text-base sm:text-lg font-bold mt-0.5">
                {PLAN_LABELS[submission.plan]} ·{" "}
                <span className="text-gradient-gold font-mono">{formatFCFA(submission.amount)}</span>
              </div>
            </div>
            {submission.paymentMethod && (
              <div className="xs:text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Paiement</div>
                <div className="text-sm font-medium mt-0.5">
                  {PAYMENT_LABELS[submission.paymentMethod] || submission.paymentMethod}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Informations artiste</h3>
              {onEditArtist && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEditArtist({
                      name: submission.artistName,
                      email: submission.artistEmail,
                      phone: submission.artistPhone,
                      whatsapp: submission.artistWhatsapp,
                      city: submission.artistCity,
                      bio: submission.artistBio,
                      photo: submission.artistPhoto,
                      social,
                    });
                  }}
                  className="h-7 px-2.5 text-xs gap-1.5 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 rounded-lg"
                  title="Modifier les coordonnées et informations de cet artiste"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Modifier l'artiste</span>
                </Button>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
              <DetailRow label="Nom" value={submission.artistName} />
              <DetailRow label="Email" value={submission.artistEmail} />
              <DetailRow label="Téléphone" value={submission.artistPhone} />
              {submission.artistWhatsapp && <DetailRow label="WhatsApp" value={submission.artistWhatsapp} />}
              {submission.artistCity && <DetailRow label="Ville" value={submission.artistCity} />}
              {submission.artistBio && <DetailRow label="Bio" value={submission.artistBio} />}
              {social.instagram && <DetailRow label="Instagram" value={social.instagram} />}
              {social.tiktok && <DetailRow label="TikTok" value={social.tiktok} />}
              {social.youtube && <DetailRow label="YouTube" value={social.youtube} />}
              {social.spotify && <DetailRow label="Spotify" value={social.spotify} link />}
              {(social.appleMusic || social.apple) && <DetailRow label="Apple Music" value={social.appleMusic || social.apple} link />}
            </div>
          </div>

          <DetailSection title="Informations projet">
            {submission.coverArtUrl && (
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card/60">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={submission.coverArtUrl}
                    alt={submission.releaseTitle}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-border shadow-sm shrink-0"
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
                            <span className="ml-2 text-[10px] uppercase text-rose-500">Explicit</span>
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
                    className={cn("rounded-xl h-10 justify-center gap-1.5 text-xs", isActive && "opacity-50")}
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

export function WhatsAppNotifyDialog({
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
      <DialogContent className="max-w-xl max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white">
              <MessageCircle className="h-4 w-4" />
            </span>
            <span className="truncate">Notifier {submission.artistName} sur WhatsApp</span>
          </DialogTitle>
          <DialogDescription>
            Numéro destinataire : <strong>+{phone}</strong> · Projet : <em>{submission.releaseTitle}</em>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
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

          {type === "delivered" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Lien(s) d&apos;écoute / Smartlink</Label>
                <Input
                  value={dspLinks}
                  onChange={(e) => setDspLinks(e.target.value)}
                  placeholder="https://spotify.link/..."
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Codes ISRC / UPC</Label>
                <Input
                  value={isrcCodes}
                  onChange={(e) => setIsrcCodes(e.target.value)}
                  placeholder="BJ-XXX-26-00001"
                  className="h-10 text-xs rounded-xl"
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
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
              <span>Aperçu du message WhatsApp</span>
              <span className="text-[10px] text-muted-foreground lowercase">prêt à l&apos;envoi</span>
            </Label>
            <div className="rounded-xl border border-border bg-[#0b141a]/95 text-[#e9edef] p-3.5 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-[#25D366]/30">
              {previewMessage}
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2">
            <Button variant="outline" className="rounded-full text-xs h-10" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              className="rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-semibold text-xs px-5 h-10 shadow-md gap-2"
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

/**
 * Interactive Modal listing submissions for a clicked KPI card / Status ("En attente", "Approuvé", "Livré", etc.)
 */
export function SubmissionsListModal({
  open,
  title,
  subtitle,
  badgeKind,
  submissions,
  onClose,
  onSelectSubmission,
  onUpdateStatus,
  onOpenNotify,
  onGoToDemandes,
  onEditSubmission,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  badgeKind?: string;
  submissions: Submission[];
  onClose: () => void;
  onSelectSubmission: (s: Submission) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenNotify: (submission: Submission, type: NotificationType) => void;
  onGoToDemandes?: () => void;
  onEditSubmission?: (submission: Submission) => void;
}) {
  const totalAmount = useMemo(
    () => submissions.reduce((sum, s) => sum + s.amount, 0),
    [submissions]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="shrink-0 px-4 sm:px-6 pt-5 pb-4 border-b border-border bg-card/90 pr-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {badgeKind && (
                  <StatusBadge kind={badgeKind} label={STATUS_LABELS[badgeKind] || PLAN_LABELS[badgeKind] || title} />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {submissions.length} dossier{submissions.length > 1 ? "s" : ""} ·{" "}
                  <strong className="text-gradient-gold">{formatFCFA(totalAmount)}</strong>
                </span>
              </div>
              <DialogTitle className="font-display text-lg sm:text-xl font-bold">
                {title}
              </DialogTitle>
              {subtitle && (
                <DialogDescription className="text-xs sm:text-sm">
                  {subtitle}
                </DialogDescription>
              )}
            </div>

            {onGoToDemandes && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onGoToDemandes();
                }}
                className="rounded-full text-xs h-8 px-3 gap-1.5 hover:border-primary/50"
              >
                <span>Filtrer dans Demandes</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
          {submissions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div className="font-display font-semibold text-base">Aucun dossier dans cette catégorie</div>
              <p className="text-xs text-muted-foreground">
                Les sorties correspondant à ce statut apparaîtront automatiquement ici.
              </p>
            </div>
          ) : (
            submissions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSubmission(s)}
                className="group rounded-2xl border border-border bg-gradient-card p-3.5 sm:p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.coverArtUrl ? (
                      <img
                        src={s.coverArtUrl}
                        alt={s.releaseTitle}
                        className="h-14 w-14 rounded-xl object-cover border border-border shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Disc3 className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display font-bold text-sm sm:text-base text-foreground truncate">
                          {s.releaseTitle}
                        </span>
                        <StatusBadge kind={s.plan} label={PLAN_LABELS[s.plan] || s.plan} />
                        <StatusBadge kind={s.status} label={STATUS_LABELS[s.status] || s.status} />
                      </div>
                      <div className="text-xs font-medium text-foreground/85 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{s.artistName}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{s.artistEmail}</span>
                        {s.artistPhone && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{s.artistPhone}</span>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Soumis le {formatDate(s.createdAt)} · {s.releaseGenre} · {s.tracks.length} titre{s.tracks.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-bold text-sm sm:text-base text-gradient-gold">
                        {formatFCFA(s.amount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {PAYMENT_LABELS[s.paymentMethod || ""] || "Paiement non défini"}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectSubmission(s)}
                        className="h-8 px-2.5 rounded-lg text-xs gap-1 hover:border-primary/50"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Infos complètes</span>
                      </Button>

                      {onEditSubmission && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onClose();
                            onEditSubmission(s);
                          }}
                          className="h-8 px-2.5 rounded-lg text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15"
                          title="Modifier les informations de cette demande"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Modifier</span>
                        </Button>
                      )}

                      {s.status === "pending" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onUpdateStatus(s.id, "approved");
                            onOpenNotify(s, "approved");
                          }}
                          className="h-8 px-2.5 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approuver
                        </Button>
                      )}

                      {s.status === "approved" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onUpdateStatus(s.id, "delivered");
                            onOpenNotify(s, "delivered");
                          }}
                          className="h-8 px-2.5 rounded-lg text-xs text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20"
                        >
                          Livrer
                        </Button>
                      )}

                      <a
                        href={`https://wa.me/${formatWhatsAppPhone(s.artistWhatsapp || s.artistPhone)}?text=${encodeURIComponent(`Bonjour ${s.artistName}, concernant votre sortie « ${s.releaseTitle} » sur Mathias Label :`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
                        title="Contacter sur WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Interactive Modal for an Artist's full profile and their submissions (filterable by En attente / Approuvé / Livré)
 */
export function ArtistDetailModal({
  artistEmail,
  initialStatusFilter = "all",
  submissions,
  onClose,
  onSelectSubmission,
  onUpdateStatus,
  onOpenNotify,
  onAddProjectForArtist,
  onEditArtist,
}: {
  artistEmail: string | null;
  initialStatusFilter?: string;
  submissions: Submission[];
  onClose: () => void;
  onSelectSubmission: (s: Submission) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenNotify: (submission: Submission, type: NotificationType) => void;
  onAddProjectForArtist?: (email: string) => void;
  onEditArtist?: (artist: any) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || "all");

  // Update statusFilter when initialStatusFilter changes
  React.useEffect(() => {
    setStatusFilter(initialStatusFilter || "all");
  }, [initialStatusFilter, artistEmail]);

  const artistSubmissions = useMemo(() => {
    if (!artistEmail) return [];
    return submissions.filter((s) => s.artistEmail.toLowerCase() === artistEmail.toLowerCase());
  }, [submissions, artistEmail]);

  const filteredSubmissions = useMemo(() => {
    if (statusFilter === "all") return artistSubmissions;
    return artistSubmissions.filter((s) => s.status === statusFilter);
  }, [artistSubmissions, statusFilter]);

  if (!artistEmail || artistSubmissions.length === 0) return null;

  const primary = artistSubmissions[0];
  const totalRevenue = artistSubmissions.reduce((sum, s) => sum + s.amount, 0);
  const totalTracks = artistSubmissions.reduce((sum, s) => sum + s.tracks.length, 0);
  const pendingCount = artistSubmissions.filter((s) => s.status === "pending").length;
  const approvedCount = artistSubmissions.filter((s) => s.status === "approved").length;
  const deliveredCount = artistSubmissions.filter((s) => s.status === "delivered").length;

  let social: Record<string, string> = {};
  try {
    if (primary.socialLinks) social = JSON.parse(primary.socialLinks);
  } catch {
    // ignore
  }

  return (
    <Dialog open={!!artistEmail} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 pt-5 pb-4 border-b border-border bg-card/90 pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold text-black font-display font-bold text-base shadow-md">
                {primary.artistName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <DialogTitle className="font-display text-lg sm:text-xl font-bold truncate">
                  {primary.artistName}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3 text-primary" /> {primary.artistEmail}
                  </span>
                  {primary.artistPhone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3 text-primary" /> {primary.artistPhone}
                    </span>
                  )}
                  {primary.artistCity && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> {primary.artistCity}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onEditArtist && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    onEditArtist({
                      name: primary.artistName,
                      email: primary.artistEmail,
                      phone: primary.artistPhone,
                      whatsapp: primary.artistWhatsapp,
                      city: primary.artistCity,
                      bio: primary.artistBio,
                      photo: primary.artistPhoto,
                      social,
                      releasesCount: artistSubmissions.length,
                    });
                  }}
                  className="h-8 rounded-full text-xs gap-1.5 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15"
                  title="Modifier les coordonnées et profil de cet artiste"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Modifier l'artiste</span>
                </Button>
              )}
              {onAddProjectForArtist && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onAddProjectForArtist(primary.artistEmail);
                  }}
                  className="h-8 rounded-full text-xs bg-gradient-gold text-black font-semibold hover:opacity-90"
                >
                  + Ajouter un projet
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="h-8 rounded-full text-xs">
                <a href={`mailto:${primary.artistEmail}`}>
                  <Mail className="h-3.5 w-3.5 mr-1" /> Email
                </a>
              </Button>
              {social.spotify && (
                <Button asChild size="sm" variant="outline" className="h-8 rounded-full text-xs text-[#1DB954] border-[#1DB954]/30 hover:bg-[#1DB954]/10">
                  <a href={social.spotify} target="_blank" rel="noreferrer">
                    <Music className="h-3.5 w-3.5 mr-1" /> Spotify
                  </a>
                </Button>
              )}
              {(social.appleMusic || social.apple) && (
                <Button asChild size="sm" variant="outline" className="h-8 rounded-full text-xs text-[#FA2D48] border-[#FA2D48]/30 hover:bg-[#FA2D48]/10">
                  <a href={social.appleMusic || social.apple} target="_blank" rel="noreferrer">
                    <Disc3 className="h-3.5 w-3.5 mr-1" /> Apple Music
                  </a>
                </Button>
              )}
              <Button asChild size="sm" className="h-8 rounded-full text-xs bg-[#25D366] hover:bg-[#1ebd5a] text-white">
                <a
                  href={`https://wa.me/${formatWhatsAppPhone(primary.artistWhatsapp || primary.artistPhone)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {primary.artistBio && (
            <p className="mt-3 text-xs text-muted-foreground bg-secondary/40 p-2.5 rounded-xl border border-border/60">
              {primary.artistBio}
            </p>
          )}

          {/* Filter pills by status */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: `Toutes (${artistSubmissions.length})` },
                { id: "pending", label: `En attente (${pendingCount})` },
                { id: "approved", label: `Approuvées (${approvedCount})` },
                { id: "delivered", label: `Livrées (${deliveredCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    statusFilter === tab.id
                      ? "bg-gradient-gold text-black border-transparent shadow-xs"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-muted-foreground">
              {totalTracks} titre{totalTracks > 1 ? "s" : ""} ·{" "}
              <strong className="text-gradient-gold">{formatFCFA(totalRevenue)}</strong>
            </div>
          </div>
        </div>

        {/* Releases list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredSubmissions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Aucune sortie pour ce filtre.
            </div>
          ) : (
            filteredSubmissions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSubmission(s)}
                className="rounded-2xl border border-border bg-gradient-card p-3.5 sm:p-4 hover:border-primary/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {s.coverArtUrl ? (
                    <img
                      src={s.coverArtUrl}
                      alt={s.releaseTitle}
                      className="h-13 w-13 rounded-xl object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-13 w-13 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Disc3 className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display font-bold text-sm sm:text-base truncate">
                        {s.releaseTitle}
                      </span>
                      <StatusBadge kind={s.plan} label={PLAN_LABELS[s.plan] || s.plan} />
                      <StatusBadge kind={s.status} label={STATUS_LABELS[s.status] || s.status} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.releaseGenre} · {s.tracks.length} piste{s.tracks.length > 1 ? "s" : ""} · Soumis le {formatDate(s.createdAt)}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-mono font-bold text-sm text-gradient-gold mr-1">
                    {formatFCFA(s.amount)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectSubmission(s)}
                    className="h-8 px-2.5 rounded-lg text-xs gap-1"
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Voir infos</span>
                  </Button>
                  {s.status === "pending" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onUpdateStatus(s.id, "approved");
                        onOpenNotify(s, "approved");
                      }}
                      className="h-8 px-2.5 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    >
                      Approuver
                    </Button>
                  )}
                  {s.status === "approved" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onUpdateStatus(s.id, "delivered");
                        onOpenNotify(s, "delivered");
                      }}
                      className="h-8 px-2.5 rounded-lg text-xs text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/10"
                    >
                      Livrer
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</h3>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 sm:px-4 py-2.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5 shrink-0">{label}</span>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-xs sm:text-sm text-primary hover:underline break-all text-right max-w-[65%]"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs sm:text-sm font-medium text-right max-w-[65%] break-words">{value}</span>
      )}
    </div>
  );
}
