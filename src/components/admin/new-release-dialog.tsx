'use client'

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Loader2,
  Music,
  User,
  Disc3,
  Album as AlbumIcon,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CreditCard,
  ShieldCheck,
  Eye,
  Wand2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  Radio,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ManualCoverInput,
  ManualTracklistInput,
  type ManualTrackDraft,
} from "@/components/shared/manual-media-inputs";
import { StatusBadge } from "./shared/ui";
import {
  PLAN_LABELS,
  STATUS_LABELS,
  PAYMENT_LABELS,
  formatFCFA,
} from "@/lib/admin-types";

const PLAN_CONFIG = {
  single: {
    id: "single",
    name: "Single Start",
    price: 15000,
    maxTracks: 1,
    tag: "Idéal découverte",
    icon: Music,
    desc: "1 titre · 150+ plateformes · 100% royalties",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
  },
  ep: {
    id: "ep",
    name: "EP Boost",
    price: 45000,
    maxTracks: 6,
    tag: "Plus populaire",
    icon: Disc3,
    desc: "Jusqu'à 6 titres · Pitch playlist · Smartlink",
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/30",
  },
  album: {
    id: "album",
    name: "Album Pro",
    price: 120000,
    maxTracks: 20,
    tag: "Recommandé Pro",
    icon: AlbumIcon,
    desc: "Jusqu'à 20 titres · Accompagnement VIP 3 mois",
    gradient: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/30",
  },
} as const;

type PlanKey = keyof typeof PLAN_CONFIG;

const GENRES = [
  "Afropop",
  "Amapiano",
  "Afrobeats",
  "Hip-Hop",
  "Rap",
  "Trap",
  "Soul",
  "R&B",
  "Electronic",
  "Gospel",
  "Traditionnel",
  "Zouk",
  "Coupe-Décalé",
  "Reggae",
  "Dancehall",
  "Jazz",
  "Pop",
  "Autre",
];

const LANGUAGES = [
  "Français",
  "Fon",
  "Yoruba",
  "Anglais",
  "Goun",
  "Bariba",
  "Dendi",
  "Mina",
  "Autre langue africaine",
];

const STEPS = [
  { id: 0, title: "Formule & Statut", subtitle: "Offre & tarification" },
  { id: 1, title: "Artiste & Contact", subtitle: "Coordonnées de l'auteur" },
  { id: 2, title: "Projet & Pochette", subtitle: "Métadonnées & visuel" },
  { id: 3, title: "Morceaux & Audio", subtitle: "Tracklist & fichiers" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function generateIsrcCode() {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BJ-MRK-${year}-${randomNum}`;
}

export function NewReleaseDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Form states
  const [plan, setPlan] = useState<PlanKey>("single");
  const [status, setStatus] = useState<"pending" | "approved" | "delivered">("approved");
  const [artistName, setArtistName] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [artistPhone, setArtistPhone] = useState("");
  const [artistWhatsapp, setArtistWhatsapp] = useState("");
  const [artistCity, setArtistCity] = useState("Cotonou, Bénin");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseGenre, setReleaseGenre] = useState("Afropop");
  const [releaseLanguage, setReleaseLanguage] = useState("Français");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [tracks, setTracks] = useState<ManualTrackDraft[]>([
    {
      id: uid(),
      title: "",
      isrc: generateIsrcCode(),
      audioUrl: "",
      featuredArtists: "",
      duration: "",
      explicit: false,
    },
  ]);

  function resetForm() {
    setCurrentStep(0);
    setPlan("single");
    setStatus("approved");
    setArtistName("");
    setArtistEmail("");
    setArtistPhone("");
    setArtistWhatsapp("");
    setArtistCity("Cotonou, Bénin");
    setReleaseTitle("");
    setReleaseGenre("Afropop");
    setReleaseLanguage("Français");
    setReleaseDate(new Date().toISOString().split("T")[0]);
    setCoverArtUrl("");
    setExplicit(false);
    setPaymentMethod("whatsapp");
    setTracks([
      {
        id: uid(),
        title: "",
        isrc: generateIsrcCode(),
        audioUrl: "",
        featuredArtists: "",
        duration: "",
        explicit: false,
      },
    ]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const maxTracks = PLAN_CONFIG[plan].maxTracks;
  const canAddTrack = tracks.length < maxTracks;

  function addTrack() {
    if (!canAddTrack) return;
    setTracks((prev) => [
      ...prev,
      {
        id: uid(),
        title: "",
        isrc: generateIsrcCode(),
        audioUrl: "",
        featuredArtists: "",
        duration: "",
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
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        isrc: t.isrc?.trim() ? t.isrc : generateIsrcCode(),
      }))
    );
    toast({
      title: "Codes ISRC générés !",
      description: "Chaque morceau possède désormais un identifiant standard officiel.",
    });
  }

  function applyDemoData() {
    setPlan("single");
    setStatus("approved");
    setArtistName("Mïko Sun");
    setArtistEmail("contact@mikosun-music.com");
    setArtistPhone("+229 97 12 34 56");
    setArtistWhatsapp("+229 97 12 34 56");
    setArtistCity("Cotonou, Bénin");
    setReleaseTitle("Soleil Levant (Afro-Fusion)");
    setReleaseGenre("Afropop");
    setReleaseLanguage("Français / Fon");
    setReleaseDate(new Date().toISOString().split("T")[0]);
    setCoverArtUrl("/brand/logo.png");
    setExplicit(false);
    setPaymentMethod("mobile_money");
    setTracks([
      {
        id: uid(),
        title: "Soleil Levant",
        isrc: generateIsrcCode(),
        audioUrl: "",
        featuredArtists: "Aura Kpèdji",
        duration: "3:24",
        explicit: false,
      },
    ]);
    toast({
      title: "Exemple chargé !",
      description: "Les informations de démonstration sont pré-remplies.",
    });
  }

  // Quick date shortcuts
  function setReleaseDateOffset(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setReleaseDate(d.toISOString().split("T")[0]);
  }

  // Validation per step
  const isStep0Valid = Boolean(plan && status && paymentMethod);
  const isStep1Valid = Boolean(
    artistName.trim().length >= 2 &&
      artistEmail.trim().includes("@") &&
      artistPhone.trim().length >= 6
  );
  const isStep2Valid = Boolean(releaseTitle.trim().length >= 1 && releaseGenre.trim());
  const isStep3Valid = tracks.length > 0 && tracks.some((t) => t.title.trim().length > 0);

  function canProceedToNext() {
    if (currentStep === 0) return isStep0Valid;
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!artistName.trim() || !artistEmail.trim() || !releaseTitle.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez renseigner le nom d'artiste, l'email et le titre du projet.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plan,
        amount: PLAN_CONFIG[plan].price,
        status,
        artistName: artistName.trim(),
        artistEmail: artistEmail.trim(),
        artistPhone: artistPhone.trim() || "+229 00 00 00 00",
        artistWhatsapp: artistWhatsapp.trim() || null,
        artistCity: artistCity.trim() || null,
        releaseTitle: releaseTitle.trim(),
        releaseGenre,
        releaseLanguage,
        releaseDate,
        coverArtUrl: coverArtUrl || null,
        explicit,
        paymentMethod,
        tracks: tracks
          .filter((t) => t.title.trim().length > 0)
          .map((t, i) => ({
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
      if (!res.ok) throw new Error(data?.error || "Erreur lors de l'enregistrement");

      toast({
        title: "Sortie créée avec succès !",
        description: `« ${releaseTitle} » pour ${artistName} a été enregistrée.`,
      });

      handleClose();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la sortie.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const activePlanCfg = PLAN_CONFIG[plan];
  const filledTracks = tracks.filter((t) => t.title.trim().length > 0).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[96vw] sm:w-[94vw] max-w-5xl h-[94vh] sm:h-[88vh] max-h-[94vh] p-0 gap-0 overflow-hidden flex flex-col rounded-2xl border-border bg-background shadow-2xl">
        {/* Top Header */}
        <div className="shrink-0 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-black shadow-xs font-bold">
              <PlusCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-display text-base sm:text-lg font-bold truncate flex items-center gap-2">
                Nouvelle sortie studio
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-3 w-3" /> Distribution directe
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                Enregistrez un artiste et configurez sa livraison sur les plateformes.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyDemoData}
              className="h-8 rounded-lg text-xs gap-1.5 hidden md:inline-flex hover:border-primary/40"
              title="Pré-remplir avec un exemple concret pour tester"
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span>Données de test</span>
            </Button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="shrink-0 bg-secondary/30 border-b border-border px-4 sm:px-6 py-2.5">
          {/* Mobile Step indicator */}
          <div className="sm:hidden flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">
              Étape {currentStep + 1}/4 :{" "}
              <span className="text-primary font-bold">{STEPS[currentStep].title}</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              {Math.round(((currentStep + 1) / 4) * 100)}%
            </span>
          </div>
          <div className="sm:hidden w-full h-1.5 rounded-full bg-secondary overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-gold transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            />
          </div>

          {/* Tablet & Desktop Step Buttons */}
          <div className="hidden sm:grid grid-cols-4 gap-2">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === idx;
              const isDone = currentStep > idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 border",
                    isActive
                      ? "bg-primary/10 border-primary/40 text-primary shadow-xs ring-1 ring-primary/20"
                      : isDone
                      ? "bg-card/60 border-border text-foreground hover:bg-card"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      isActive
                        ? "bg-primary text-black"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate leading-tight">{step.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate hidden md:block">
                      {step.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Live Preview Toggle Bar */}
        <div className="lg:hidden shrink-0 bg-card border-b border-border px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {coverArtUrl ? (
              <img
                src={coverArtUrl}
                alt="Miniature"
                className="h-7 w-7 rounded-md object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-primary shrink-0">
                <Disc3 className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 truncate">
              <span className="font-semibold text-foreground truncate">
                {releaseTitle || "Titre du projet"}
              </span>
              <span className="text-muted-foreground ml-1.5 truncate">
                · {artistName || "Artiste"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono font-bold text-gradient-gold">
              {formatFCFA(activePlanCfg.price)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
              className="h-7 px-2 text-[11px] gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              {mobilePreviewOpen ? "Masquer" : "Aperçu"}
              {mobilePreviewOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Mobile Preview Drawer */}
        {mobilePreviewOpen && (
          <div className="lg:hidden shrink-0 max-h-56 overflow-y-auto bg-secondary/30 border-b border-border p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              {coverArtUrl ? (
                <img
                  src={coverArtUrl}
                  alt="Aperçu mobile"
                  className="h-20 w-20 rounded-xl object-cover border border-border shadow-md shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center text-muted-foreground shrink-0">
                  <Disc3 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-bold text-base truncate">
                  {releaseTitle || "Titre de sortie"}
                </h4>
                <p className="text-xs text-muted-foreground truncate">{artistName || "Nom d'artiste"}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <StatusBadge kind={plan} label={PLAN_LABELS[plan]} />
                  <StatusBadge kind={status} label={STATUS_LABELS[status]} />
                </div>
                <div className="text-xs font-semibold text-gradient-gold mt-1.5 font-mono">
                  {formatFCFA(activePlanCfg.price)} · {filledTracks}/{maxTracks} titre(s)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Body: Form (Left) & Studio Live Preview (Right on lg) */}
        <div className="flex-1 min-h-0 overflow-y-auto lg:grid lg:grid-cols-12 lg:divide-x lg:divide-border">
          {/* Form Scrollable Area (7 cols on Desktop) */}
          <form
            id="new-release-form"
            onSubmit={handleSubmit}
            className="lg:col-span-7 xl:col-span-8 p-4 sm:p-6 space-y-6"
          >
            {/* STEP 0: FORMULE & STATUT */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="font-display text-base font-bold flex items-center gap-2">
                    <Disc3 className="h-4 w-4 text-primary" /> Choisissez la formule de distribution
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chaque formule inclut une présence mondiale sur 150+ plateformes et 100% des royalties.
                  </p>
                </div>

                {/* Formula Visual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(PLAN_CONFIG) as PlanKey[]).map((key) => {
                    const cfg = PLAN_CONFIG[key];
                    const Icon = cfg.icon;
                    const isSelected = plan === key;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setPlan(key);
                          if (tracks.length > cfg.maxTracks) {
                            setTracks((prev) => prev.slice(0, cfg.maxTracks));
                          }
                        }}
                        className={cn(
                          "group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 -translate-y-0.5"
                            : "border-border bg-card/60 hover:border-primary/40 hover:bg-card hover:-translate-y-0.5"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-colors",
                                isSelected
                                  ? "bg-primary text-black ring-primary/30"
                                  : "bg-secondary text-primary ring-border"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            {cfg.tag && (
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                  isSelected
                                    ? "bg-primary text-black border-primary"
                                    : "bg-secondary text-muted-foreground border-border"
                                )}
                              >
                                {cfg.tag}
                              </span>
                            )}
                          </div>
                          <div className="font-display font-bold text-sm sm:text-base text-foreground">
                            {cfg.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 leading-snug">
                            {cfg.desc}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-baseline justify-between">
                          <span className="font-mono text-base font-bold text-gradient-gold">
                            {formatFCFA(cfg.price)}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Max {cfg.maxTracks} titre{cfg.maxTracks > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" /> Statut initial de la sortie *
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "approved", label: "Approuvé", desc: "Validé", color: "emerald" },
                        { id: "delivered", label: "Livré", desc: "En ligne", color: "sky" },
                        { id: "pending", label: "En attente", desc: "Attente", color: "amber" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStatus(st.id as any)}
                          className={cn(
                            "py-2 px-2 rounded-xl border text-center transition-all text-xs font-medium flex flex-col items-center justify-center gap-0.5",
                            status === st.id
                              ? "bg-card border-primary text-foreground shadow-xs ring-1 ring-primary/20"
                              : "border-transparent text-muted-foreground hover:bg-card/50"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              st.id === "approved" && "bg-emerald-500",
                              st.id === "delivered" && "bg-sky-500",
                              st.id === "pending" && "bg-amber-500"
                            )}
                          />
                          <span className="font-bold text-[11px] leading-tight">{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-primary" /> Mode de règlement convenu
                    </Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-10 rounded-xl bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money">Mobile Money (MTN / Moov)</SelectItem>
                        <SelectItem value="whatsapp">Espèces / WhatsApp</SelectItem>
                        <SelectItem value="card">Carte bancaire</SelectItem>
                        <SelectItem value="bank">Virement bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: ARTISTE & CONTACT */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="font-display text-base font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Coordonnées de l'artiste ou label
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Informations nécessaires pour la création du compte artiste et les déclarations de droits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold">Nom d'artiste / Groupe *</Label>
                    <Input
                      required
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Ex : Mïko Sun, D-Vibe, Orchestre Poly-Rythmo"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email officiel *</Label>
                    <Input
                      required
                      type="email"
                      value={artistEmail}
                      onChange={(e) => setArtistEmail(e.target.value)}
                      placeholder="artiste@gmail.com"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Téléphone direct *</Label>
                    <Input
                      required
                      value={artistPhone}
                      onChange={(e) => setArtistPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Numéro WhatsApp</Label>
                    <Input
                      value={artistWhatsapp}
                      onChange={(e) => setArtistWhatsapp(e.target.value)}
                      placeholder="+229 97 00 00 00 (optionnel si identique)"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Ville & Pays</Label>
                    <Input
                      value={artistCity}
                      onChange={(e) => setArtistCity(e.target.value)}
                      placeholder="Cotonou, Bénin"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    La distribution se fera sous l'étiquette <strong className="text-foreground">MR - K Distribution</strong>. L'artiste conserve 100 % de la propriété intellectuelle de ses masters.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: PROJET & POCHETTE */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="font-display text-base font-bold flex items-center gap-2">
                    <Disc3 className="h-4 w-4 text-primary" /> Titre & Pochette officielle
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Détails du projet musical affichés sur Spotify, Apple Music, Deezer et TikTok.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold">Titre du projet / single / album *</Label>
                    <Input
                      required
                      value={releaseTitle}
                      onChange={(e) => setReleaseTitle(e.target.value)}
                      placeholder="Ex : Soleil Levant, Renaissance, Afro-Vibe Vol. 1"
                      className="h-10 rounded-xl bg-card font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Genre musical principal *</Label>
                    <Select value={releaseGenre} onValueChange={setReleaseGenre}>
                      <SelectTrigger className="h-10 rounded-xl bg-card">
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
                      <SelectTrigger className="h-10 rounded-xl bg-card">
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

                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Date de mise en ligne souhaitée</Label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setReleaseDateOffset(0)}
                          className="text-[10px] text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10"
                        >
                          Immédiate
                        </button>
                        <button
                          type="button"
                          onClick={() => setReleaseDateOffset(7)}
                          className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-secondary"
                        >
                          +7 jours
                        </button>
                        <button
                          type="button"
                          onClick={() => setReleaseDateOffset(14)}
                          className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-secondary"
                        >
                          +14j (Recommandé)
                        </button>
                      </div>
                    </div>
                    <Input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                </div>

                {/* Explicit content switch */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <div className="text-xs font-semibold">Contenu explicite (Explicit)</div>
                    <div className="text-[11px] text-muted-foreground">
                      Cochez si les paroles contiennent des termes réservés aux adultes.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={explicit}
                    onChange={(e) => setExplicit(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                {/* Pochette Manuelle (sans drag-and-drop) */}
                <div className="pt-2">
                  <ManualCoverInput value={coverArtUrl} onChange={setCoverArtUrl} />
                </div>
              </div>
            )}

            {/* STEP 3: MORCEAUX & AUDIO MANUEL (sans drag-and-drop) */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <ManualTracklistInput
                  tracks={tracks}
                  maxTracks={maxTracks}
                  canAddTrack={canAddTrack}
                  onAddTrack={addTrack}
                  onRemoveTrack={removeTrack}
                  onUpdateTrack={updateTrack}
                  onAutoIsrc={autoFillIsrcs}
                />
              </div>
            )}
          </form>

          {/* Right Column: Studio Live Preview (Sticky on lg) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 p-6 bg-secondary/20 overflow-y-auto">
            <div className="sticky top-0 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" /> Aperçu Studio Live
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {PLAN_LABELS[plan]}
                </span>
              </div>

              {/* 3D Vinyl Mockup Preview */}
              <div className="relative group mx-auto max-w-[260px] aspect-square">
                {/* Vinyl Disc poking out */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-[90%] rounded-full bg-zinc-950 border-4 border-zinc-900 shadow-xl flex items-center justify-center translate-x-7 group-hover:translate-x-10 transition-transform duration-300">
                  <div className="h-10 w-10 rounded-full bg-gradient-gold/30 border border-primary/40 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-black" />
                  </div>
                  {/* Subtle vinyl groove lines */}
                  <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
                </div>

                {/* Jacket Cover */}
                <div className="relative z-10 h-full w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
                  {coverArtUrl ? (
                    <img
                      src={coverArtUrl}
                      alt={releaseTitle || "Pochette"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-card flex flex-col items-center justify-center p-4 text-center">
                      <Disc3 className="h-14 w-14 text-primary mb-2 opacity-80" />
                      <span className="text-xs text-muted-foreground font-medium">
                        Pochette en attente
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">
                        Glissez une image à l'étape 3
                      </span>
                    </div>
                  )}

                  {/* Explicit Badge */}
                  {explicit && (
                    <span className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border border-white/20">
                      EXPLICIT
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Artist */}
              <div className="text-center pt-1">
                <h4 className="font-display font-bold text-lg text-foreground truncate">
                  {releaseTitle || "Titre du projet"}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {artistName || "Nom d'artiste"}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <StatusBadge kind={status} label={STATUS_LABELS[status]} />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {releaseGenre}
                  </span>
                </div>
              </div>

              {/* Metadata Checklist */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2 text-xs">
                <div className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
                  Contrôle avant enregistrement
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Formule choisie</span>
                  <span className="font-medium text-foreground">{PLAN_LABELS[plan]}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Pochette HD</span>
                  <span className={cn("font-medium", coverArtUrl ? "text-emerald-500 font-semibold" : "text-amber-500")}>
                    {coverArtUrl ? "✓ Prête" : "En attente"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Pistes renseignées</span>
                  <span className="font-mono font-medium text-foreground">
                    {filledTracks} / {maxTracks} titre{maxTracks > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Date estimée</span>
                  <span className="font-medium text-foreground">{releaseDate || "Immédiate"}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-baseline justify-between">
                  <span className="font-semibold text-foreground">Montant</span>
                  <span className="font-mono text-base font-bold text-gradient-gold">
                    {formatFCFA(activePlanCfg.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Sticky & Responsive) */}
        <div className="shrink-0 bg-card/90 backdrop-blur-md border-t border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div>
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                className="h-10 rounded-xl px-4 gap-1.5 text-xs font-semibold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-10 rounded-xl px-4 text-xs text-muted-foreground"
              >
                Annuler
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (canProceedToNext()) {
                    setCurrentStep((prev) => prev + 1);
                  } else {
                    toast({
                      title: "Informations requises",
                      description: "Complétez les champs nécessaires avant de passer à l'étape suivante.",
                      variant: "destructive",
                    });
                  }
                }}
                className="h-10 rounded-xl px-5 gap-1.5 text-xs font-bold bg-gradient-gold text-black hover:opacity-90 shadow-xs"
              >
                <span>Continuer</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="new-release-form"
                disabled={submitting}
                className="h-10 rounded-xl px-6 gap-2 text-xs font-bold bg-gradient-gold text-black hover:opacity-90 shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Créer la sortie officielle
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
