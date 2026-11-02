'use client'

import React, { useState, useEffect } from "react";
import {
  Pencil, Disc3, Music, Calendar, DollarSign,
  Loader2, Check, ExternalLink, Globe, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ManualCoverInput } from "@/components/shared/manual-media-inputs";
import {
  type Submission,
  STATUS_LABELS,
  PLAN_LABELS,
  PAYMENT_LABELS,
  formatFCFA
} from "@/lib/admin-types";

const GENRES = [
  "Afrobeats", "Afropop", "Afro-Fusion", "Amapiano", "Coupé-Décalé",
  "Hip-Hop / Rap", "Drill", "RnB / Soul", "Gospel", "Zouk / Kompa",
  "Highlife", "Musique Traditionnelle", "Reggae / Dancehall", "Pop", "Électro"
];

const LANGUAGES = ["Français", "Fon", "Yoruba", "Anglais", "Mina", "Goun", "Lingala", "Instrumental"];

export function EditSubmissionDialog({
  open,
  onClose,
  onSuccess,
  submission,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: Submission | null;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Form states
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseGenre, setReleaseGenre] = useState("Afrobeats");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseLanguage, setReleaseLanguage] = useState("Français");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [status, setStatus] = useState("pending");
  const [plan, setPlan] = useState("single");
  const [amount, setAmount] = useState(15000);
  const [paymentMethod, setPaymentMethod] = useState("production_interne");

  // Artist fields on this submission
  const [artistName, setArtistName] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [artistPhone, setArtistPhone] = useState("");
  const [artistWhatsapp, setArtistWhatsapp] = useState("");
  const [artistCity, setArtistCity] = useState("");

  useEffect(() => {
    if (submission) {
      setReleaseTitle(submission.releaseTitle || "");
      setReleaseGenre(submission.releaseGenre || "Afrobeats");
      setReleaseDate(submission.releaseDate || "");
      setReleaseLanguage(submission.releaseLanguage || "Français");
      setCoverArtUrl(submission.coverArtUrl || "");
      setExplicit(Boolean(submission.explicit));
      setStatus(submission.status || "pending");
      setPlan(submission.plan || "single");
      setAmount(submission.amount || 15000);
      setPaymentMethod(submission.paymentMethod || "production_interne");

      setArtistName(submission.artistName || "");
      setArtistEmail(submission.artistEmail || "");
      setPhoneState(submission.artistPhone || "");
      setArtistWhatsapp(submission.artistWhatsapp || "");
      setArtistCity(submission.artistCity || "");
    }
  }, [submission, open]);

  function setPhoneState(val: string) {
    setArtistPhone(val);
  }

  if (!submission) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submission) return;

    if (!releaseTitle.trim()) {
      toast({ title: "Champ requis", description: "Le titre du projet est requis.", variant: "destructive" });
      return;
    }
    if (!artistName.trim()) {
      toast({ title: "Champ requis", description: "Le nom d'artiste est requis.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseTitle: releaseTitle.trim(),
          releaseGenre,
          releaseDate: releaseDate || null,
          releaseLanguage: releaseLanguage || null,
          coverArtUrl: coverArtUrl || null,
          explicit,
          status,
          plan,
          amount: Number(amount) || 0,
          paymentMethod,
          artistName: artistName.trim(),
          artistEmail: artistEmail.trim().toLowerCase(),
          artistPhone: artistPhone.trim(),
          artistWhatsapp: artistWhatsapp.trim() || null,
          artistCity: artistCity.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de modification");

      toast({
        title: "Projet mis à jour !",
        description: `Les modifications de « ${releaseTitle} » ont été enregistrées.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'enregistrer les modifications.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92dvh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold text-black shadow-md">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg sm:text-xl font-bold">
                Modifier le projet : <span className="text-primary">{submission.releaseTitle}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Artiste : {submission.artistName} · ID : {submission.id.slice(0, 8)}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section Pochette & Métadonnées projet */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Disc3 className="h-3.5 w-3.5 text-primary" /> Détails de la sortie
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pochette officielle</Label>
              <ManualCoverInput value={coverArtUrl} onChange={setCoverArtUrl} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Titre du projet / Album <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  className="h-10 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Genre musical</Label>
                <Select value={releaseGenre} onValueChange={setReleaseGenre}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue placeholder="Choisir un genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date de sortie prévue</Label>
                <Input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Langue</Label>
                <Select value={releaseLanguage} onValueChange={setReleaseLanguage}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue placeholder="Langue" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l} className="text-xs">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Statut actuel</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="text-xs">En attente</SelectItem>
                    <SelectItem value="approved" className="text-xs">Approuvé (En production)</SelectItem>
                    <SelectItem value="delivered" className="text-xs">Livré (En ligne)</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Rejeté / Ajustement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
              <div>
                <Label className="text-xs font-semibold cursor-pointer">Contenu explicite (Explicit Lyrics)</Label>
                <p className="text-[11px] text-muted-foreground">Paroles contenant un langage explicite</p>
              </div>
              <Switch checked={explicit} onCheckedChange={setExplicit} />
            </div>
          </div>

          {/* Section Artiste sur ce projet */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-primary" /> Informations artiste sur ce projet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nom de l'artiste</Label>
                <Input
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="h-10 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Ville</Label>
                <Input
                  value={artistCity}
                  onChange={(e) => setArtistCity(e.target.value)}
                  placeholder="Cotonou, Bénin"
                  className="h-10 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email</Label>
                <Input
                  type="email"
                  required
                  value={artistEmail}
                  onChange={(e) => setArtistEmail(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Téléphone</Label>
                <Input
                  type="tel"
                  required
                  value={artistPhone}
                  onChange={(e) => setArtistPhone(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">WhatsApp</Label>
                <Input
                  type="tel"
                  value={artistWhatsapp}
                  onChange={(e) => setArtistWhatsapp(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="shrink-0 px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Annuler
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-gold text-black hover:opacity-90 font-semibold px-5 text-xs shadow-md gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

