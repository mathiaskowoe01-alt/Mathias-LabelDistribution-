'use client'

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight, ArrowLeft, Check, Loader2, Music, Disc3, Album as AlbumIcon,
  User, Calendar, CreditCard, Send, Sparkles, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ManualCoverInput,
  ManualTracklistInput,
  type ManualTrackDraft,
} from "@/components/shared/manual-media-inputs";

export type PlanId = "single" | "ep" | "album";

export type ArtistProfile = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  bio: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  spotify: string;
  appleMusic: string;
};

type Plan = {
  id: PlanId;
  name: string;
  price: number;
  unit: string;
  maxTracks: number;
  features: string[];
};

const PLANS: Record<PlanId, Plan> = {
  single: { id: "single", name: "Single Start", price: 15000, unit: "FCFA / single", maxTracks: 1, features: ["Distribution sur 1 single", "150+ plateformes", "Royalties 100 % à l'artiste", "Mise en ligne sous 72h", "Code ISRC généré gratuitement"] },
  ep: { id: "ep", name: "EP Boost", price: 45000, unit: "FCFA / EP", maxTracks: 6, features: ["Distribution d'un EP (jusqu'à 6 titres)", "150+ plateformes", "Pré-save Spotify + smartlink offert", "Soumission playlists éditoriales", "Codes ISRC + UPC fournis", "Mise en ligne sous 48h"] },
  album: { id: "album", name: "Album Pro", price: 120000, unit: "FCFA / album", maxTracks: 20, features: ["Distribution d'un album complet (jusqu'à 20 titres)", "150+ plateformes mondiales", "Stratégie de sortie sur 3 mois", "Pitch playlists éditoriales", "Smartlink premium + page artiste dédiée", "Codes ISRC + UPC + ISWC fournis", "Support VIP 7j/7"] },
};

const GENRES = ["Afropop", "Hip-Hop", "Rap", "Soul", "R&B", "Electronic", "House", "Gospel", "Traditionnel", "Jazz", "Reggae", "Dancehall", "Coupe-Décalé", "Afrobeat", "Folk", "Pop", "Rock", "Autre"];
const LANGUAGES = ["Français", "Anglais", "Fon", "Yoruba", "Goun", "Bariba", "Dendi", "Wèmè", "Idaasha", "Nagot", "Autre langue africaine", "Autre"];
const PAYMENT_METHODS = [
  { id: "mobile_money", label: "Mobile Money (MTN / Moov / Wave)", desc: "Paiement instantané par mobile money sécurisé" },
  { id: "card", label: "Carte bancaire (Visa / Mastercard)", desc: "Paiement par carte en ligne sécurisé" },
  { id: "bank", label: "Virement bancaire direct", desc: "Virement direct sur notre compte bancaire" },
  { id: "whatsapp", label: "WhatsApp (finalisation directe)", desc: "Assistance personnalisée avec notre équipe" },
];
const STEPS = ["Formule", "Artiste", "Projet", "Titres", "Paiement", "Confirmation"];

function uid() { return Math.random().toString(36).slice(2, 10); }

export function PlanSubmissionDialog({
  open,
  planId,
  onClose,
  defaultArtist,
  onSuccessRedirect,
}: {
  open: boolean;
  planId: PlanId | null;
  onClose: () => void;
  defaultArtist?: Partial<ArtistProfile>;
  onSuccessRedirect?: (id: string) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(planId || "single");
  const plan = PLANS[selectedPlanId];

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [artist, setArtist] = useState<ArtistProfile>({
    name: "", email: "", phone: "", whatsapp: "", city: "", bio: "", instagram: "", tiktok: "", youtube: "", spotify: "", appleMusic: "",
  });
  const [release, setRelease] = useState({ title: "", genre: "", language: "", releaseDate: "", coverArtUrl: "", explicit: false });
  const [tracks, setTracks] = useState<ManualTrackDraft[]>([{ id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
  const [paymentMethod, setPaymentMethod] = useState<string>("mobile_money");

  // Sync plan and prefill artist info when dialog opens
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (planId) {
        setSelectedPlanId(planId);
      }
      if (defaultArtist && Object.keys(defaultArtist).length > 0) {
        setArtist((prev) => ({ ...prev, ...defaultArtist }));
        setHasPrefilled(true);
        return;
      }
      try {
        const saved = localStorage.getItem("mrk_artist_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          setArtist((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
            phone: parsed.phone || prev.phone,
            whatsapp: parsed.whatsapp || prev.whatsapp,
            city: parsed.city || prev.city,
            bio: parsed.bio || prev.bio,
            instagram: parsed.instagram || prev.instagram,
            tiktok: parsed.tiktok || prev.tiktok,
            youtube: parsed.youtube || prev.youtube,
            spotify: parsed.spotify || prev.spotify,
            appleMusic: parsed.appleMusic || prev.appleMusic || "",
          }));
          setHasPrefilled(true);
        }
      } catch (e) {
        console.error("Failed to load saved artist profile", e);
      }
    });
  }, [open, planId, defaultArtist]);

  function resetAll() {
    setStep(0);
    setShowErrors(false);
    setRelease({ title: "", genre: "", language: "", releaseDate: "", coverArtUrl: "", explicit: false });
    setTracks([{ id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
    setPaymentMethod("mobile_money");
  }

  function handleClose() {
    resetAll();
    onClose();
  }

  const canAddTrack = plan ? tracks.length < plan.maxTracks : false;

  function addTrack() {
    if (!canAddTrack) return;
    setTracks((prev) => [...prev, { id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
  }
  function removeTrack(id: string) {
    if (tracks.length <= 1) return;
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }
  function updateTrack(id: string, patch: Partial<ManualTrackDraft>) {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function autoFillIsrcs() {
    const year = new Date().getFullYear().toString().slice(-2);
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        isrc: t.isrc?.trim() ? t.isrc : `BJ-MRK-${year}-${Math.floor(10000 + Math.random() * 90000)}`,
      }))
    );
    toast({
      title: "Codes ISRC générés !",
      description: "Un code ISRC unique a été attribué à chaque piste.",
    });
  }

  // Field-level validations
  const nameError = artist.name.trim().length <= 1 ? "Veuillez entrer votre nom d'artiste (min. 2 caractères)." : "";
  const emailError = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(artist.email.trim()) ? "Veuillez entrer une adresse email valide." : "";
  const phoneError = artist.phone.trim().length < 6 ? "Veuillez entrer un numéro de téléphone valide (min. 6 chiffres)." : "";
  const titleError = release.title.trim().length === 0 ? "Le titre officiel du projet est requis." : "";
  const genreError = release.genre.trim().length === 0 ? "Veuillez sélectionner un genre musical." : "";
  const tracksError = !tracks.every((t) => t.title.trim().length > 0) ? "Chaque piste doit avoir un titre renseigné." : "";

  const stepValid = useMemo(() => {
    if (!plan) return false;
    if (step === 0) return true;
    if (step === 1) return !nameError && !emailError && !phoneError;
    if (step === 2) return !titleError && !genreError;
    if (step === 3) return !tracksError;
    if (step === 4) return Boolean(paymentMethod);
    return true;
  }, [step, nameError, emailError, phoneError, titleError, genreError, tracksError, paymentMethod, plan]);

  function handleNextStep() {
    if (!stepValid) {
      setShowErrors(true);
      toast({
        title: "Champs requis manquants",
        description: "Veuillez compléter les champs obligatoires mis en évidence.",
        variant: "destructive",
      });
      return;
    }
    setShowErrors(false);
    setStep((s) => s + 1);
  }

  async function submit() {
    if (!plan) return;
    if (!stepValid) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        plan: plan.id,
        artistName: artist.name.trim(),
        artistEmail: artist.email.trim(),
        artistPhone: artist.phone.trim(),
        artistWhatsapp: artist.whatsapp.trim(),
        artistBio: artist.bio.trim(),
        artistCity: artist.city.trim(),
        socialLinks: { instagram: artist.instagram, tiktok: artist.tiktok, youtube: artist.youtube, spotify: artist.spotify, appleMusic: artist.appleMusic },
        releaseTitle: release.title.trim(),
        releaseGenre: release.genre,
        releaseLanguage: release.language,
        releaseDate: release.releaseDate,
        coverArtUrl: release.coverArtUrl,
        explicit: release.explicit,
        paymentMethod,
        tracks: tracks.map((t, i) => ({
          position: i + 1,
          title: t.title.trim(),
          isrc: t.isrc || null,
          audioUrl: t.audioUrl || null,
          featuredArtists: t.featuredArtists || null,
          duration: t.duration || null,
          explicit: t.explicit,
        })),
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de soumission");

      // Save to localStorage for artist persistence & tracking
      try {
        localStorage.setItem("mrk_artist_profile", JSON.stringify(artist));
        const raw = localStorage.getItem("mrk_tracked_submissions");
        const list = raw ? JSON.parse(raw) : [];
        if (data?.submission?.id && !list.includes(data.submission.id)) {
          localStorage.setItem("mrk_tracked_submissions", JSON.stringify([data.submission.id, ...list]));
        }
        localStorage.setItem("mrk_latest_submission", data.submission.id);
      } catch (err) {
        console.error("Local storage error:", err);
      }

      // WhatsApp direct message trigger
      const waText = buildWhatsAppMessage(plan, artist, release, tracks, paymentMethod, data?.submission?.id);
      const waUrl = `https://wa.me/2250157307677?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");

      toast({
        title: "🎉 Sortie enregistrée avec succès !",
        description: "Redirection vers votre espace de suivi en direct...",
      });

      handleClose();

      const newId = data?.submission?.id;
      if (onSuccessRedirect && newId) {
        onSuccessRedirect(newId);
      } else if (newId) {
        router.push(`/suivi?id=${newId}&new=1`);
      }
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: `${msg}. Réessayez ou contactez-nous sur WhatsApp.`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-[calc(100vw-2.5rem)] max-w-3xl max-h-[92dvh] p-0 gap-0 overflow-hidden flex flex-col border-border bg-card shadow-2xl rounded-2xl">
        {/* Sticky Header */}
        <div className="shrink-0 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3.5 sm:py-4">
          <DialogHeader className="space-y-1 mb-3 pr-9">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DialogTitle className="font-display text-base sm:text-xl font-bold flex items-center gap-2 min-w-0">
                {plan.id === "single" && <Music className="h-5 w-5 text-primary shrink-0" />}
                {plan.id === "ep" && <Disc3 className="h-5 w-5 text-primary shrink-0" />}
                {plan.id === "album" && <AlbumIcon className="h-5 w-5 text-primary shrink-0" />}
                <span className="truncate">Nouvelle Sortie — {plan.name}</span>
              </DialogTitle>
              <span className="font-mono text-sm sm:text-lg font-bold text-gradient-gold shrink-0">
                {plan.price.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <DialogDescription className="text-xs flex items-center justify-between">
              <span>Étape {step + 1} sur {STEPS.length} — <strong className="text-foreground">{STEPS[step]}</strong></span>
              <span className="sm:hidden font-mono text-[11px] text-primary font-semibold">
                {Math.round(((step + 1) / STEPS.length) * 100)}%
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Stepper */}
          <div className="hidden sm:grid grid-cols-6 gap-1.5">
            {STEPS.map((s, i) => {
              const isCompleted = i < step;
              const isCurrent = i === step;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex flex-col gap-1.5 text-left transition-all group",
                    i < step ? "cursor-pointer" : "cursor-default"
                  )}
                  aria-label={s}
                >
                  <div
                    className={cn(
                      "w-full h-1.5 rounded-full transition-colors",
                      isCompleted && "bg-primary group-hover:bg-primary/80",
                      isCurrent && "bg-gradient-gold",
                      !isCompleted && !isCurrent && "bg-secondary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-medium truncate flex items-center gap-1",
                      isCurrent ? "text-primary font-bold" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {isCompleted && <Check className="h-3 w-3 text-primary shrink-0" strokeWidth={3} />}
                    <span className="truncate">{s}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile progress bar */}
          <div className="sm:hidden flex gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-colors",
                  i < step && "bg-primary",
                  i === step && "bg-gradient-gold",
                  i > step && "bg-secondary"
                )}
                aria-label={s}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  Sélectionnez votre formule
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Choisissez la formule adaptée à votre projet musical.
                </p>
              </div>

              {/* Formula selector cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["single", "ep", "album"] as PlanId[]).map((pKey) => {
                  const p = PLANS[pKey];
                  const isCur = selectedPlanId === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(pKey);
                        if (tracks.length > p.maxTracks) {
                          setTracks(tracks.slice(0, p.maxTracks));
                        }
                      }}
                      className={cn(
                        "text-left p-4 rounded-2xl border transition-all relative hover:-translate-y-0.5",
                        isCur
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                          : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {p.maxTracks} titre{p.maxTracks > 1 ? "s max" : ""}
                        </span>
                        {isCur && <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <div className="font-display font-bold text-base text-foreground">{p.name}</div>
                      <div className="mt-1.5 font-mono text-sm font-bold text-gradient-gold">
                        {p.price.toLocaleString("fr-FR")} FCFA
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                  Ce qui est inclus dans le pack {plan.name} :
                </div>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total à régler (paiement unique)</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-gradient-gold">{plan.price.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed">
                <span className="font-semibold text-primary">Pratique :</span> après votre soumission et le paiement, vous aurez un <strong>espace de suivi en direct</strong> pour suivre chaque étape d&apos;ingestion et gérer toutes vos futures sorties.
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    Informations sur l&apos;artiste
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Coordonnées de l&apos;artiste ou du représentant.
                  </p>
                </div>
                {hasPrefilled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                    <Check className="h-3.5 w-3.5" /> Profil pré-rempli
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="a-name">Nom d&apos;artiste *</Label>
                  <Input
                    id="a-name"
                    value={artist.name}
                    onChange={(e) => setArtist({ ...artist, name: e.target.value })}
                    placeholder="Ex : Mïko Sun"
                    aria-invalid={showErrors && !!nameError}
                    className="h-11 rounded-xl"
                  />
                  {showErrors && nameError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {nameError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-email">Email professionnel *</Label>
                  <Input
                    id="a-email"
                    type="email"
                    value={artist.email}
                    onChange={(e) => setArtist({ ...artist, email: e.target.value })}
                    placeholder="artiste@email.com"
                    aria-invalid={showErrors && !!emailError}
                    className="h-11 rounded-xl"
                  />
                  {showErrors && emailError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {emailError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-phone">Téléphone *</Label>
                  <Input
                    id="a-phone"
                    type="tel"
                    value={artist.phone}
                    onChange={(e) => setArtist({ ...artist, phone: e.target.value })}
                    placeholder="+229 01 00 00 00 00"
                    aria-invalid={showErrors && !!phoneError}
                    className="h-11 rounded-xl"
                  />
                  {showErrors && phoneError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {phoneError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-wa">WhatsApp (si différent)</Label>
                  <Input
                    id="a-wa"
                    type="tel"
                    value={artist.whatsapp}
                    onChange={(e) => setArtist({ ...artist, whatsapp: e.target.value })}
                    placeholder="+229 01 00 00 00 00"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-city">Ville &amp; Pays</Label>
                  <Input
                    id="a-city"
                    value={artist.city}
                    onChange={(e) => setArtist({ ...artist, city: e.target.value })}
                    placeholder="Cotonou, Bénin"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="a-spotify">Profil Spotify (optionnel)</Label>
                  <Input
                    id="a-spotify"
                    value={artist.spotify}
                    onChange={(e) => setArtist({ ...artist, spotify: e.target.value })}
                    placeholder="https://open.spotify.com/artist/..."
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-apple">Profil Apple Music (optionnel)</Label>
                  <Input
                    id="a-apple"
                    value={artist.appleMusic}
                    onChange={(e) => setArtist({ ...artist, appleMusic: e.target.value })}
                    placeholder="https://music.apple.com/artist/..."
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="a-bio">Biographie de l&apos;artiste (courte)</Label>
                  <span className="text-[11px] font-mono text-muted-foreground">{artist.bio.length}/500</span>
                </div>
                <Textarea
                  id="a-bio"
                  value={artist.bio}
                  onChange={(e) => setArtist({ ...artist, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="Présentation, style, parcours artistique..."
                  className="resize-none rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="a-ig">Instagram</Label>
                  <Input id="a-ig" value={artist.instagram} onChange={(e) => setArtist({ ...artist, instagram: e.target.value })} placeholder="@artiste" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-tt">TikTok</Label>
                  <Input id="a-tt" value={artist.tiktok} onChange={(e) => setArtist({ ...artist, tiktok: e.target.value })} placeholder="@artiste" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-yt">Chaîne YouTube</Label>
                  <Input id="a-yt" value={artist.youtube} onChange={(e) => setArtist({ ...artist, youtube: e.target.value })} placeholder="youtube.com/@artiste" className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  Informations sur le projet musical
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Donnez-nous les métadonnées officielles de cette sortie.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="r-title">Titre officiel du projet *</Label>
                  <Input
                    id="r-title"
                    value={release.title}
                    onChange={(e) => setRelease({ ...release, title: e.target.value })}
                    placeholder="Ex : Cotonou Nights / Soleil Levant / Renaissance"
                    aria-invalid={showErrors && !!titleError}
                    className="h-11 rounded-xl"
                  />
                  {showErrors && titleError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {titleError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-genre">Genre musical principal *</Label>
                  <Select value={release.genre} onValueChange={(v) => setRelease({ ...release, genre: v })}>
                    <SelectTrigger id="r-genre" aria-invalid={showErrors && !!genreError} className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choisir un genre" />
                    </SelectTrigger>
                    <SelectContent>{GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  {showErrors && genreError && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {genreError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="r-lang">Langue principale chantée</Label>
                  <Select value={release.language} onValueChange={(v) => setRelease({ ...release, language: v })}>
                    <SelectTrigger id="r-lang" className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Choisir une langue" />
                    </SelectTrigger>
                    <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="r-date">Date de sortie souhaitée</Label>
                  <Input
                    id="r-date"
                    type="date"
                    value={release.releaseDate}
                    onChange={(e) => setRelease({ ...release, releaseDate: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ManualCoverInput
                    value={release.coverArtUrl}
                    onChange={(url) => setRelease({ ...release, coverArtUrl: url })}
                  />
                </div>
              </div>

              <label className="flex items-start sm:items-center gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4 cursor-pointer hover:border-primary/30 transition-colors">
                <Checkbox checked={release.explicit} onCheckedChange={(v) => setRelease({ ...release, explicit: Boolean(v) })} className="mt-0.5 sm:mt-0" />
                <div>
                  <div className="text-sm font-medium">Contenu explicite (Explicit Content)</div>
                  <div className="text-xs text-muted-foreground">Cochez si les textes contiennent des expressions ou thèmes réservés à un public averti.</div>
                </div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <ManualTracklistInput
                tracks={tracks}
                maxTracks={plan.maxTracks}
                canAddTrack={canAddTrack}
                onAddTrack={addTrack}
                onRemoveTrack={removeTrack}
                onUpdateTrack={updateTrack}
                onAutoIsrc={autoFillIsrcs}
              />
              {showErrors && tracksError && (
                <p className="text-xs text-rose-500 flex items-center gap-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {tracksError}
                </p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  Mode de règlement
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Choisissez comment vous souhaitez régler le montant de <strong className="font-mono text-foreground">{plan.price.toLocaleString("fr-FR")} FCFA</strong>.
                </p>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border p-3.5 sm:p-4 transition-all",
                      paymentMethod === m.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        paymentMethod === m.id ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {paymentMethod === m.id && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{m.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 sm:p-4 text-xs text-muted-foreground leading-relaxed">
                Dès la validation, votre commande est créée et vous accéderez instantanément à votre <strong>espace de suivi en direct</strong> avec référence unique et récapitulatif WhatsApp.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  Récapitulatif &amp; Envoi
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Vérifiez vos données avant de finaliser. Vous serez redirigé directement vers votre espace de suivi.
                </p>
              </div>

              {release.coverArtUrl && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card">
                  <img
                    src={release.coverArtUrl}
                    alt="Pochette"
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover border border-border shadow-xs shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-sm truncate">{release.title}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Pochette attachée avec succès
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
                <SummaryRow label="Formule" value={`${plan.name} · ${plan.price.toLocaleString("fr-FR")} FCFA`} />
                <SummaryRow label="Artiste" value={artist.name} />
                <SummaryRow label="Email" value={artist.email} />
                <SummaryRow label="Téléphone" value={artist.phone} />
                <SummaryRow label="Projet" value={release.title} />
                <SummaryRow label="Genre" value={release.genre} />
                <SummaryRow label="Langue" value={release.language || "—"} />
                <SummaryRow label="Date de sortie" value={release.releaseDate || "À définir"} />
                <SummaryRow label="Nb de titres" value={`${tracks.length} / ${plan.maxTracks}`} />
                <SummaryRow label="Fichiers Audio" value={tracks.filter(t => t.audioUrl).length > 0 ? `${tracks.filter(t => t.audioUrl).length} master(s) renseigné(s)` : "À transmettre"} />
                <SummaryRow label="Contenu explicite" value={release.explicit ? "Oui" : "Non"} />
                <SummaryRow label="Paiement" value={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod} last />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowErrors(false);
              if (step === 0) handleClose();
              else setStep((s) => s - 1);
            }}
            className="rounded-full h-10 px-3.5 sm:px-4 text-xs sm:text-sm shrink-0"
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {step === 0 ? "Annuler" : "Précédent"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className={cn(
                "rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold h-10 px-5 sm:px-6 text-xs sm:text-sm shadow-md transition-all",
                !stepValid && "opacity-90"
              )}
            >
              Continuer <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={submitting || !stepValid}
              className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold h-10 px-4 sm:px-7 text-xs sm:text-sm shadow-lg glow-gold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin shrink-0" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5 shrink-0" />
                  <span className="hidden xs:inline">Valider &amp; Accéder au suivi</span>
                  <span className="xs:hidden">Valider la sortie</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3", last && "rounded-b-2xl")}>
      <span className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs sm:text-sm font-medium text-right max-w-[65%] break-words">{value}</span>
    </div>
  );
}

function buildWhatsAppMessage(
  plan: Plan,
  artist: ArtistProfile,
  release: { title: string; genre: string; language: string; releaseDate: string; explicit: boolean; coverArtUrl?: string },
  tracks: ManualTrackDraft[],
  paymentMethod: string,
  submissionId?: string
): string {
  const lines: string[] = [];
  lines.push(`🎵 *NOUVELLE SOUMISSION — MATHIAS LABEL*`);
  if (submissionId) lines.push(`*Référence Dossier :* #${submissionId}`);
  lines.push("");
  lines.push(`*Plan :* ${plan.name} (${plan.price.toLocaleString("fr-FR")} FCFA)`);
  lines.push("");
  lines.push(`*Artiste :* ${artist.name}`);
  lines.push(`*Email :* ${artist.email}`);
  lines.push(`*Téléphone :* ${artist.phone}`);
  if (artist.whatsapp) lines.push(`*WhatsApp :* ${artist.whatsapp}`);
  if (artist.city) lines.push(`*Ville :* ${artist.city}`);
  lines.push("");
  lines.push(`*Projet :* ${release.title}`);
  lines.push(`*Genre :* ${release.genre}`);
  if (release.language) lines.push(`*Langue :* ${release.language}`);
  if (release.releaseDate) lines.push(`*Date souhaitée :* ${release.releaseDate}`);
  if (release.coverArtUrl) lines.push(`*Pochette :* ${release.coverArtUrl}`);
  lines.push(`*Explicit :* ${release.explicit ? "Oui" : "Non"}`);
  lines.push("");
  const audioCount = tracks.filter((t) => t.audioUrl).length;
  lines.push(`*Titres (${tracks.length}/${plan.maxTracks}) ${audioCount > 0 ? `[${audioCount} audio(s) joint(s)]` : ""} :*`);
  tracks.forEach((t, i) => {
    const hasAudio = t.audioUrl ? " 🎵" : "";
    lines.push(`  ${i + 1}. ${t.title}${t.featuredArtists ? ` (${t.featuredArtists})` : ""}${t.duration ? ` · ${t.duration}` : ""}${hasAudio}`);
  });
  lines.push("");
  lines.push(`*Mode de paiement :* ${paymentMethod}`);
  lines.push("");
  lines.push(`Merci de confirmer la réception de ma sortie et les prochaines étapes de distribution ! 🙏`);
  return lines.join("\n");
}
