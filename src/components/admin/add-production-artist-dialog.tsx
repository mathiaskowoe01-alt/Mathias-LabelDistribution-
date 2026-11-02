'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus, Disc3, Music, Album as AlbumIcon, Sparkles,
  Check, ChevronRight, ChevronLeft, Loader2, AlertCircle,
  Globe2, ShieldCheck, Wand2, Radio, Clock,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ManualCoverInput,
  ManualTracklistInput,
  type ManualTrackDraft,
} from "@/components/shared/manual-media-inputs";
import { type Submission, formatFCFA } from "@/lib/admin-types";

const GENRES = [
  "Afrobeats",
  "Afropop",
  "Afro-Fusion",
  "Amapiano",
  "Coupé-Décalé",
  "Hip-Hop / Rap",
  "Drill",
  "RnB / Soul",
  "Gospel",
  "Zouk / Kompa",
  "Highlife",
  "Musique Traditionnelle",
  "Reggae / Dancehall",
  "Pop",
  "Électro",
];

const LANGUAGES = ["Français", "Fon", "Yoruba", "Anglais", "Mina", "Goun", "Lingala", "Instrumental"];

type PlanKey = "single" | "ep" | "album";
type ProductionFinanceMode = "internal" | "standard" | "custom";

const PLAN_STD_PRICES: Record<PlanKey, { name: string; price: number; maxTracks: number; icon: typeof Music }> = {
  single: { name: "Single (1 titre)", price: 15000, maxTracks: 1, icon: Music },
  ep: { name: "EP (2 à 6 titres)", price: 45000, maxTracks: 6, icon: Disc3 },
  album: { name: "Album (7 à 20 titres)", price: 120000, maxTracks: 20, icon: AlbumIcon },
};

function generateMRKIsrc(index: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `BJ-MRK-${year}-${String(rand).slice(0, 4)}${index + 1}`;
}

export function AddProductionArtistDialog({
  open,
  onClose,
  onSuccess,
  existingSubmissions = [],
  prefillArtistEmail = null,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingSubmissions?: Submission[];
  prefillArtistEmail?: string | null;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Extract unique existing artists so the admin can pick one in 1 click
  const existingArtists = useMemo(() => {
    const map = new Map<string, Submission>();
    existingSubmissions.forEach((s) => {
      const key = s.artistEmail.toLowerCase();
      if (!map.has(key)) map.set(key, s);
    });
    return Array.from(map.values());
  }, [existingSubmissions]);

  // Step 0: Artist Identity
  const [artistName, setArtistName] = useState("");
  const [artistCity, setArtistCity] = useState("Cotonou, Bénin");
  const [artistBio, setArtistBio] = useState("");
  const [managedByLabel, setManagedByLabel] = useState(false);
  const [artistEmail, setArtistEmail] = useState("");
  const [artistPhone, setArtistPhone] = useState("");
  const [artistWhatsapp, setArtistWhatsapp] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Step 1: Production Project & Tracks
  const [status, setStatus] = useState<"delivered" | "approved" | "pending">("delivered");
  const [plan, setPlan] = useState<PlanKey>("single");
  const [financeMode, setFinanceMode] = useState<ProductionFinanceMode>("internal");
  const [customAmount, setCustomAmount] = useState<string>("0");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseGenre, setReleaseGenre] = useState("Afrobeats");
  const [releaseLanguage, setReleaseLanguage] = useState("Français");
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [tracks, setTracks] = useState<ManualTrackDraft[]>([
    {
      id: "trk-1",
      title: "",
      duration: "03:20",
      featuredArtists: "",
      isrc: generateMRKIsrc(0),
      audioUrl: "",
      explicit: false,
    },
  ]);

  const maxTracks = PLAN_STD_PRICES[plan].maxTracks;

  // Apply prefill if opened for a specific existing artist
  useEffect(() => {
    if (open && prefillArtistEmail) {
      const found = existingSubmissions.find(
        (s) => s.artistEmail.toLowerCase() === prefillArtistEmail.toLowerCase()
      );
      if (found) {
        selectExistingArtist(found);
      }
    }
  }, [open, prefillArtistEmail, existingSubmissions]);

  function selectExistingArtist(s: Submission) {
    setArtistName(s.artistName);
    setArtistEmail(s.artistEmail);
    setArtistPhone(s.artistPhone);
    setArtistWhatsapp(s.artistWhatsapp || s.artistPhone);
    setArtistCity(s.artistCity || "Cotonou, Bénin");
    setArtistBio(s.artistBio || "");
    setManagedByLabel(false);
    try {
      if (s.socialLinks) {
        const parsed = JSON.parse(s.socialLinks);
        setSpotifyUrl(parsed.spotify || "");
        setInstagramUrl(parsed.instagram || "");
        setTiktokUrl(parsed.tiktok || "");
        setYoutubeUrl(parsed.youtube || "");
      }
    } catch {
      // ignore
    }
    toast({
      title: `Profil de ${s.artistName} chargé`,
      description: "Les informations de l'artiste ont été pré-remplies.",
    });
  }

  function handleToggleManagedByLabel(checked: boolean) {
    setManagedByLabel(checked);
    if (checked) {
      const slug =
        artistName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "") || "artiste";
      if (!artistEmail.trim()) setArtistEmail(`${slug}@mr-kdistribution.com`);
      if (!artistPhone.trim()) setArtistPhone("+225 01 57 30 76 77");
      if (!artistWhatsapp.trim()) setArtistWhatsapp("+225 01 57 30 76 77");
    }
  }

  function fillDemoProductionArtist() {
    const demos = [
      {
        name: "Sèna K.",
        city: "Cotonou, Bénin",
        bio: "Nouvelle étoile Afro-Soul & RnB signée en production chez Mathias Label.",
        email: "sena.k@mr-kdistribution.com",
        phone: "+229 01 97 45 12 88",
        title: "Étoile du Golfe",
        genre: "Afropop",
        plan: "single" as PlanKey,
        status: "delivered" as const,
        cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
        tracks: [
          {
            id: "demo-1",
            title: "Étoile du Golfe",
            duration: "03:14",
            featuredArtists: "",
            isrc: generateMRKIsrc(0),
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            explicit: false,
          },
        ],
      },
      {
        name: "King Zinsou",
        city: "Porto-Novo, Bénin",
        bio: "Artiste Afro-Fusion & Amapiano en production exclusive chez Mathias Label.",
        email: "king.zinsou@mr-kdistribution.com",
        phone: "+229 01 96 33 21 09",
        title: "Royaume de Danxomè (EP)",
        genre: "Amapiano",
        plan: "ep" as PlanKey,
        status: "approved" as const,
        cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
        tracks: [
          {
            id: "demo-2a",
            title: "Intro Danxomè",
            duration: "02:42",
            featuredArtists: "",
            isrc: generateMRKIsrc(0),
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            explicit: false,
          },
          {
            id: "demo-2b",
            title: "Zémidjan Night",
            duration: "03:28",
            featuredArtists: "Mïko Sun",
            isrc: generateMRKIsrc(1),
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            explicit: false,
          },
        ],
      },
    ];
    const pick = demos[Math.floor(Math.random() * demos.length)];
    setArtistName(pick.name);
    setArtistCity(pick.city);
    setArtistBio(pick.bio);
    setArtistEmail(pick.email);
    setArtistPhone(pick.phone);
    setArtistWhatsapp(pick.phone);
    setSpotifyUrl("https://open.spotify.com");
    setInstagramUrl(`@${pick.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
    setPlan(pick.plan);
    setStatus(pick.status);
    setFinanceMode("internal");
    setReleaseTitle(pick.title);
    setReleaseGenre(pick.genre);
    setCoverArtUrl(pick.cover);
    setTracks(pick.tracks);
    setShowErrors(false);
    toast({
      title: "Exemple d'artiste en production chargé",
      description: `${pick.name} — « ${pick.title} » est prêt à être ajouté.`,
    });
  }

  function resetForm() {
    setStep(0);
    setShowErrors(false);
    setArtistName("");
    setArtistCity("Cotonou, Bénin");
    setArtistBio("");
    setManagedByLabel(false);
    setArtistEmail("");
    setArtistPhone("");
    setArtistWhatsapp("");
    setSpotifyUrl("");
    setInstagramUrl("");
    setTiktokUrl("");
    setYoutubeUrl("");
    setStatus("delivered");
    setPlan("single");
    setFinanceMode("internal");
    setCustomAmount("0");
    setReleaseTitle("");
    setReleaseGenre("Afrobeats");
    setReleaseLanguage("Français");
    setCoverArtUrl("");
    setExplicit(false);
    setTracks([
      {
        id: `trk-${Date.now()}`,
        title: "",
        duration: "03:20",
        featuredArtists: "",
        isrc: generateMRKIsrc(0),
        audioUrl: "",
        explicit: false,
      },
    ]);
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  // Compute effective email/phone if managedByLabel is checked
  const effectiveEmail = useMemo(() => {
    if (artistEmail.trim().includes("@")) return artistEmail.trim();
    if (managedByLabel && artistName.trim()) {
      const slug =
        artistName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "") || "artiste";
      return `${slug}@mr-kdistribution.com`;
    }
    return artistEmail.trim();
  }, [artistEmail, managedByLabel, artistName]);

  const effectivePhone = useMemo(() => {
    if (artistPhone.trim().length >= 6) return artistPhone.trim();
    if (managedByLabel) return "+225 01 57 30 76 77";
    return artistPhone.trim();
  }, [artistPhone, managedByLabel]);

  const isStep0Valid =
    artistName.trim().length >= 2 &&
    effectiveEmail.includes("@") &&
    effectivePhone.length >= 6;

  const isStep1Valid =
    releaseTitle.trim().length >= 1 &&
    releaseGenre.trim().length >= 1 &&
    tracks.some((t) => t.title.trim().length > 0);

  const computedAmount = useMemo(() => {
    if (financeMode === "internal") return 0;
    if (financeMode === "standard") return PLAN_STD_PRICES[plan].price;
    const parsed = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [financeMode, plan, customAmount]);

  function addTrack() {
    if (tracks.length >= maxTracks) return;
    setTracks((prev) => [
      ...prev,
      {
        id: `trk-${Date.now()}-${prev.length}`,
        title: "",
        duration: "03:15",
        featuredArtists: "",
        isrc: generateMRKIsrc(prev.length),
        audioUrl: "",
        explicit: false,
      },
    ]);
  }

  function removeTrack(id: string) {
    if (tracks.length <= 1) return;
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTrack(id: string, patch: Partial<ManualTrackDraft>) {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function autoFillIsrcs() {
    setTracks((prev) => prev.map((t, i) => ({ ...t, isrc: t.isrc || generateMRKIsrc(i) })));
  }

  async function handleSubmit() {
    if (!isStep0Valid) {
      setShowErrors(true);
      setStep(0);
      return;
    }
    if (!isStep1Valid) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    try {
      const validTracks = tracks
        .filter((t) => t.title.trim().length > 0)
        .map((t, idx) => ({
          position: idx + 1,
          title: t.title.trim(),
          duration: t.duration.trim() || "03:20",
          featuredArtists: t.featuredArtists.trim() || null,
          isrc: t.isrc.trim() || generateMRKIsrc(idx),
          audioUrl: t.audioUrl.trim() || null,
          explicit: Boolean(t.explicit),
        }));

      const socialLinks: Record<string, string> = {};
      if (spotifyUrl.trim()) socialLinks.spotify = spotifyUrl.trim();
      if (instagramUrl.trim()) socialLinks.instagram = instagramUrl.trim();
      if (tiktokUrl.trim()) socialLinks.tiktok = tiktokUrl.trim();
      if (youtubeUrl.trim()) socialLinks.youtube = youtubeUrl.trim();

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          status,
          amount: computedAmount,
          artistName: artistName.trim(),
          artistEmail: effectiveEmail,
          artistPhone: effectivePhone,
          artistWhatsapp: artistWhatsapp.trim() || effectivePhone,
          artistCity: artistCity.trim() || "Cotonou, Bénin",
          artistBio: artistBio.trim() || null,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          releaseTitle: releaseTitle.trim(),
          releaseGenre,
          releaseLanguage,
          releaseDate: releaseDate || null,
          coverArtUrl: coverArtUrl.trim() || null,
          explicit,
          paymentMethod: financeMode === "internal" ? "production_interne" : "mobile_money",
          tracks: validTracks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Impossible d'ajouter l'artiste");

      toast({
        title: "Artiste en production ajouté !",
        description: `${artistName} (« ${releaseTitle} ») est maintenant enregistré${status === "delivered" || status === "approved" ? " et visible sur la vitrine publique" : ""}.`,
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[92dvh] p-0 gap-0 overflow-hidden border-border bg-background flex flex-col">
        {/* Sticky Header */}
        <div className="shrink-0 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 pr-12 sm:pr-14">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-black shadow-md">
                <UserPlus className="h-5 w-5" strokeWidth={2.3} />
              </span>
              <div className="min-w-0">
                <DialogTitle className="font-display text-base sm:text-xl font-bold tracking-tight truncate">
                  Ajouter un artiste en production
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Intégrez un artiste déjà produit ou signé chez Mathias Label dans votre catalogue et sur la vitrine.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillDemoProductionArtist}
              className="h-8 rounded-lg text-xs gap-1.5 px-2.5 sm:px-3 hover:border-primary/40 shrink-0"
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span>Exemple</span>
            </Button>
          </div>

          {/* 2-Step Switcher */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            {[
              { id: 0 as const, label: "1. Profil Artiste & Réseaux" },
              { id: 1 as const, label: "2. Projet en Prod & Pistes" },
            ].map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === 1 && !isStep0Valid) {
                      setShowErrors(true);
                      return;
                    }
                    setShowErrors(false);
                    setStep(s.id);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all",
                    active
                      ? "bg-primary/15 border-primary/50 text-primary shadow-xs"
                      : done
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {done && <Check className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {step === 0 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Quick select from existing artists if any */}
              {existingArtists.length > 0 && (
                <div className="rounded-2xl border border-border bg-secondary/20 p-3.5 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                    <span>Artiste déjà présent chez Mathias Label ? (1 clic pour pré-remplir)</span>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-primary hover:underline lowercase font-normal"
                    >
                      réinitialiser
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {existingArtists.map((a) => (
                      <button
                        key={a.artistEmail}
                        type="button"
                        onClick={() => selectExistingArtist(a)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                          artistEmail.toLowerCase() === a.artistEmail.toLowerCase()
                            ? "bg-gradient-gold text-black border-transparent font-semibold shadow-xs"
                            : "bg-card border-border text-foreground/80 hover:border-primary/40"
                        )}
                      >
                        <span>{a.artistName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nom d&apos;artiste / Groupe *</Label>
                  <Input
                    value={artistName}
                    onChange={(e) => {
                      setArtistName(e.target.value);
                      if (managedByLabel) {
                        const slug =
                          e.target.value
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, ".")
                            .replace(/^\.+|\.+$/g, "") || "artiste";
                        setArtistEmail(`${slug}@mr-kdistribution.com`);
                      }
                    }}
                    placeholder="Ex : Mïko Sun, Sèna K., D-Vibe..."
                    aria-invalid={showErrors && artistName.trim().length < 2}
                    className="h-11 rounded-xl bg-card"
                  />
                  {showErrors && artistName.trim().length < 2 && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> Nom d&apos;artiste requis.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Ville &amp; Pays</Label>
                  <Input
                    value={artistCity}
                    onChange={(e) => setArtistCity(e.target.value)}
                    placeholder="Cotonou, Bénin"
                    className="h-11 rounded-xl bg-card"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold">
                    Biographie / Présentation de l&apos;artiste (affichée sur la vitrine du site)
                  </Label>
                  <Textarea
                    rows={2}
                    value={artistBio}
                    onChange={(e) => setArtistBio(e.target.value)}
                    placeholder="Ex : Artiste Afropop & Soul produit par Mathias Label, mêlant rythmes traditionnels et sonorités urbaines..."
                    className="rounded-xl bg-card"
                  />
                </div>
              </div>

              {/* Contact block with 1-click Label Management toggle */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                  <div>
                    <div className="text-xs font-bold text-foreground">Coordonnées de suivi</div>
                    <div className="text-[11px] text-muted-foreground">
                      Renseignez les coordonnées de l&apos;artiste ou cochez « Géré en interne par le label ».
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer bg-primary/10 px-3 py-1.5 rounded-full border border-primary/25 shrink-0">
                    <input
                      type="checkbox"
                      checked={managedByLabel}
                      onChange={(e) => handleToggleManagedByLabel(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-primary"
                    />
                    <span>Géré en interne par Mathias Label</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Email *</Label>
                    <Input
                      type="email"
                      value={effectiveEmail}
                      onChange={(e) => {
                        setManagedByLabel(false);
                        setArtistEmail(e.target.value);
                      }}
                      placeholder="artiste@email.com"
                      aria-invalid={showErrors && !effectiveEmail.includes("@")}
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Téléphone *</Label>
                    <Input
                      type="tel"
                      value={effectivePhone}
                      onChange={(e) => {
                        setManagedByLabel(false);
                        setArtistPhone(e.target.value);
                      }}
                      placeholder="+229 01 97 00 00 00"
                      aria-invalid={showErrors && effectivePhone.length < 6}
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">WhatsApp</Label>
                    <Input
                      type="tel"
                      value={artistWhatsapp}
                      onChange={(e) => setArtistWhatsapp(e.target.value)}
                      placeholder="Identique au téléphone"
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Social & DSP Links */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-primary" />
                  Liens Streaming &amp; Réseaux Sociaux (optionnel)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Lien Spotify Artiste / Sortie</Label>
                    <Input
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      placeholder="https://open.spotify.com/artist/..."
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Instagram</Label>
                    <Input
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="@artiste"
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">TikTok</Label>
                    <Input
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="@artiste"
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">YouTube</Label>
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@artiste"
                      className="h-10 rounded-xl bg-background/70 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Production Status Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  État actuel de la production *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "delivered" as const,
                      title: "En ligne / Distribué",
                      desc: "Visible sur la vitrine d'accueil + stores",
                      icon: Radio,
                      badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                    },
                    {
                      id: "approved" as const,
                      title: "En production / Validé",
                      desc: "En cours d'ingestion + visible vitrine",
                      icon: Sparkles,
                      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      id: "pending" as const,
                      title: "En studio / Préparation",
                      desc: "Enregistrement ou mixage en cours",
                      icon: Clock,
                      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    },
                  ].map((st) => {
                    const active = status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id)}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2",
                          active
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                            : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn("p-1.5 rounded-lg", st.badge)}>
                            <st.icon className="h-4 w-4" />
                          </span>
                          {active && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm text-foreground">
                            {st.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {st.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format & Finance Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-border bg-secondary/20">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Format du projet *</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(PLAN_STD_PRICES) as PlanKey[]).map((k) => {
                      const cfg = PLAN_STD_PRICES[k];
                      const active = plan === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setPlan(k);
                            if (tracks.length > cfg.maxTracks) {
                              setTracks((prev) => prev.slice(0, cfg.maxTracks));
                            }
                          }}
                          className={cn(
                            "py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center",
                            active
                              ? "border-primary bg-primary text-black shadow-xs"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {k === "single" ? "Single" : k === "ep" ? "EP" : "Album"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Cadre de production</Label>
                  <Select
                    value={financeMode}
                    onValueChange={(v) => setFinanceMode(v as ProductionFinanceMode)}
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl bg-card text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">
                        Production Interne Label (0 FCFA / Signé Mathias Label)
                      </SelectItem>
                      <SelectItem value="standard">
                        Forfait Standard ({formatFCFA(PLAN_STD_PRICES[plan].price)})
                      </SelectItem>
                      <SelectItem value="custom">Montant contrat personnalisé (FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                  {financeMode === "custom" && (
                    <Input
                      type="number"
                      min={0}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Montant en FCFA (ex: 75000)"
                      className="h-9 rounded-xl bg-card text-xs mt-1.5"
                    />
                  )}
                </div>
              </div>

              {/* Project Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label className="text-xs font-semibold">Titre du Single / EP / Album *</Label>
                  <Input
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="Ex : Soleil Levant, Nuit Étoilée, Babi to Cotonou..."
                    aria-invalid={showErrors && releaseTitle.trim().length < 1}
                    className="h-11 rounded-xl bg-card font-medium"
                  />
                  {showErrors && releaseTitle.trim().length < 1 && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> Titre du projet requis.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Genre musical *</Label>
                  <Select value={releaseGenre} onValueChange={setReleaseGenre}>
                    <SelectTrigger className="h-11 w-full rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Langue principale</Label>
                  <Select value={releaseLanguage} onValueChange={setReleaseLanguage}>
                    <SelectTrigger className="h-11 w-full rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date de sortie</Label>
                  <Input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="h-11 rounded-xl bg-card"
                  />
                </div>
              </div>

              {/* Cover Art */}
              <ManualCoverInput value={coverArtUrl} onChange={setCoverArtUrl} />

              {/* Tracklist */}
              <ManualTracklistInput
                tracks={tracks}
                maxTracks={maxTracks}
                canAddTrack={tracks.length < maxTracks}
                onAddTrack={addTrack}
                onRemoveTrack={removeTrack}
                onUpdateTrack={updateTrack}
                onAutoIsrc={autoFillIsrcs}
              />
              {showErrors && !tracks.some((t) => t.title.trim().length > 0) && (
                <p className="text-xs text-rose-500 flex items-center gap-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" /> Veuillez renseigner le titre d&apos;au moins un morceau.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 bg-card/95 backdrop-blur-md border-t border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2.5">
          {step === 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="rounded-full h-10 px-4 text-xs"
            >
              Annuler
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowErrors(false);
                setStep(0);
              }}
              className="rounded-full h-10 px-4 text-xs gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Profil artiste
            </Button>
          )}

          {step === 0 ? (
            <Button
              type="button"
              onClick={() => {
                if (!isStep0Valid) {
                  setShowErrors(true);
                  toast({
                    title: "Champs requis",
                    description: "Renseignez le nom d'artiste (et cochez « Géré en interne » ou saisissez email/téléphone).",
                    variant: "destructive",
                  });
                  return;
                }
                setShowErrors(false);
                setStep(1);
              }}
              className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold h-10 px-6 text-xs sm:text-sm gap-1.5 shadow-md"
            >
              <span>Continuer vers le projet</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold h-10 px-5 sm:px-7 text-xs sm:text-sm gap-2 shadow-lg glow-gold"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Enregistrer l&apos;artiste en production</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

