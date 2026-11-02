'use client'

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Disc3, Music, Sparkles,
  Copy, Check, ExternalLink, MessageCircle, Plus, Search,
  ArrowRight, ShieldCheck, Radio, Layers,
  RefreshCw, FileText, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VinylRecord } from "@/components/site/vinyl-record";
import { PlatformIcon, type PlatformId } from "@/components/site/platform-icons";
import { PlanSubmissionDialog, type ArtistProfile } from "@/components/site/plan-submission-dialog";
import {
  type Submission,
  STATUS_LABELS,
  PLAN_LABELS,
  PAYMENT_LABELS,
  formatFCFA,
  formatDate,
} from "@/lib/admin-types";

const DSP_PLATFORMS: { id: PlatformId; name: string; category: string }[] = [
  { id: "spotify", name: "Spotify", category: "Global" },
  { id: "apple", name: "Apple Music", category: "Global" },
  { id: "deezer", name: "Deezer", category: "Global & Francophone" },
  { id: "tiktok", name: "TikTok & Resso", category: "Viral & Social" },
  { id: "boomplay", name: "Boomplay", category: "Leader Afrique" },
  { id: "audiomack", name: "Audiomack", category: "Trending Afrique" },
  { id: "youtube", name: "YouTube Music", category: "Global & Content ID" },
  { id: "amazon", name: "Amazon Music", category: "Global" },
  { id: "tidal", name: "Tidal", category: "Hi-Fi Master" },
  { id: "facebook", name: "Facebook", category: "Bibliothèque Audio & Reels" },
  { id: "instagram", name: "Instagram", category: "Stories & Reels Audio" },
  { id: "whatsapp", name: "WhatsApp", category: "Statuts & Partage Audio" },
  { id: "whatsapp_business", name: "WhatsApp Business", category: "Catalogue & Diffusion Pro" },
];

export function TrackingDashboard() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const urlId = searchParams.get("id");
  const urlEmail = searchParams.get("email");
  const isNewlyCreated = searchParams.get("new") === "1";

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeId, setActiveId] = useState<string | null>(urlId);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [newReleaseOpen, setNewReleaseOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedIsrc, setCopiedIsrc] = useState<string | null>(null);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);

  // Active submission
  const currentSubmission = useMemo(() => {
    if (!activeId) return submissions[0] || null;
    return submissions.find((s) => s.id === activeId) || submissions[0] || null;
  }, [submissions, activeId]);

  // Extract artist profile for prefilling new submissions
  const artistProfileForPrefill: Partial<ArtistProfile> = useMemo(() => {
    if (!currentSubmission) return {};
    let socials: { instagram?: string; tiktok?: string; youtube?: string; spotify?: string } = {};
    try {
      if (currentSubmission.socialLinks) {
        socials = JSON.parse(currentSubmission.socialLinks);
      }
    } catch {
      // ignore
    }
    return {
      name: currentSubmission.artistName || "",
      email: currentSubmission.artistEmail || "",
      phone: currentSubmission.artistPhone || "",
      whatsapp: currentSubmission.artistWhatsapp || "",
      city: currentSubmission.artistCity || "",
      bio: currentSubmission.artistBio || "",
      instagram: socials.instagram || "",
      tiktok: socials.tiktok || "",
      youtube: socials.youtube || "",
      spotify: socials.spotify || "",
    };
  }, [currentSubmission]);

  // Fetch submissions from API
  const loadSubmissions = useCallback(async (targetId?: string | null, targetEmail?: string | null) => {
    try {
      let url = "";
      if (targetId) {
        url = `/api/submissions/track?id=${encodeURIComponent(targetId)}`;
      } else if (targetEmail) {
        url = `/api/submissions/track?email=${encodeURIComponent(targetEmail)}`;
      } else {
        const savedTracksRaw = typeof window !== "undefined" ? localStorage.getItem("mrk_tracked_submissions") : null;
        const savedTracks: string[] = savedTracksRaw ? JSON.parse(savedTracksRaw) : [];
        const latestId = typeof window !== "undefined" ? localStorage.getItem("mrk_latest_submission") : null;

        if (latestId) {
          url = `/api/submissions/track?id=${encodeURIComponent(latestId)}`;
        } else if (savedTracks.length > 0) {
          url = `/api/submissions/track?id=${encodeURIComponent(savedTracks[0])}`;
        }
      }

      if (!url) {
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data?.submissions && Array.isArray(data.submissions) && data.submissions.length > 0) {
        setSubmissions(data.submissions);
        setActiveId(targetId || data.submissions[0].id);

        const primaryEmail = data.submissions[0].artistEmail;
        if (primaryEmail && (!targetEmail || targetId)) {
          fetch(`/api/submissions/track?email=${encodeURIComponent(primaryEmail)}`)
            .then((r) => r.json())
            .then((siblingData) => {
              if (siblingData?.submissions?.length > 1) {
                setSubmissions(siblingData.submissions);
              }
            })
            .catch(() => {});
        }
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les détails de la sortie.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      loadSubmissions(urlId, urlEmail);
    });
  }, [urlId, urlEmail, loadSubmissions]);

  // Search handler
  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/submissions/track?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data?.submissions && data.submissions.length > 0) {
        setSubmissions(data.submissions);
        setActiveId(data.submissions[0].id);
        setSearchModalOpen(false);
        toast({
          title: "Sortie trouvée !",
          description: `${data.submissions.length} projet(s) chargé(s) pour votre recherche.`,
        });
      } else {
        toast({
          title: "Aucune sortie trouvée",
          description: "Vérifiez votre référence ou email et réessayez.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur de recherche",
        description: "Un problème est survenu. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  }

  function copyToClipboard(text: string, type: "id" | "isrc") {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "id") {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedIsrc(text);
        setTimeout(() => setCopiedIsrc(null), 2000);
      }
      toast({
        title: "Copié dans le presse-papiers",
        description: text,
      });
    }
  }

  // Distribution pipeline progression calculation
  const pipelineState = useMemo(() => {
    if (!currentSubmission) {
      return { stepIndex: 0, percent: 0, label: "En attente" };
    }
    const st = currentSubmission.status;
    if (st === "delivered") {
      return { stepIndex: 3, percent: 100, label: "En ligne dans le monde entier" };
    }
    if (st === "approved") {
      return { stepIndex: 2, percent: 65, label: "Ingestion DSPs en cours" };
    }
    if (st === "rejected") {
      return { stepIndex: 1, percent: 25, label: "Action requise sur les fichiers" };
    }
    return { stepIndex: 1, percent: 35, label: "Audit technique studio en cours" };
  }, [currentSubmission]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[35rem] w-[35rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-20 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute -bottom-20 left-10 h-[25rem] w-[25rem] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-noise opacity-50 dark:opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
              {/* Brand Logo & Title */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <a href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
                  <img
                    src="/brand/logo-mathias.jpg"
                    alt="Mathias Label"
                    className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-xl bg-black border border-border shrink-0"
                  />
                  <div className="flex flex-col leading-none min-w-0">
                    <span className="font-display text-xs sm:text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                      Mathias Label
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-primary/80 mt-0.5">
                      Distribution Musicale
                    </span>
                  </div>
                </a>
                <span className="hidden md:inline-block h-4 w-px bg-border" />
                <div className="hidden md:flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-foreground/90">Espace Artiste</span>
                  <span className="text-[11px] text-muted-foreground">· Suivi en direct</span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                <ThemeToggle />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchModalOpen(true)}
                  className="rounded-full border-border bg-card/70 hover:bg-secondary text-foreground/80 hover:text-foreground text-xs h-9 px-3 sm:px-3.5"
                >
                  <Search className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Rechercher une sortie</span>
                  <span className="sr-only sm:hidden">Recherche</span>
                </Button>

                {/* Main Action: Soumettre une nouvelle sortie */}
                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold text-xs sm:text-sm h-9 sm:h-10 px-3.5 sm:px-5 shadow-lg shadow-primary/20 glow-gold transition-all"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-1.5 shrink-0" strokeWidth={3} />
                  <span className="hidden sm:inline">Distribuer une nouvelle sortie</span>
                  <span className="sm:hidden">Nouvelle sortie</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {/* Welcome Alert for newly created submissions */}
          {isNewlyCreated && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent backdrop-blur-md flex items-start gap-3.5 sm:gap-4"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                  🎉 Félicitations ! Votre demande a été enregistrée avec succès
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Votre dossier est entre les mains de l&apos;équipe studio Mathias Label. Vous pouvez suivre chaque étape de son ingestion ci-dessous en temps réel, copier vos codes ISRC dès qu&apos;ils sont assignés et soumettre de futurs projets à tout moment.
                </p>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Chargement de votre espace de distribution...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && submissions.length === 0 && (
            <div className="py-12 sm:py-24 max-w-xl mx-auto text-center space-y-6">
              <div className="mx-auto h-18 w-18 sm:h-20 sm:w-20 rounded-3xl border border-border bg-card flex items-center justify-center shadow-lg">
                <Disc3 className="h-9 w-9 sm:h-10 sm:w-10 text-primary animate-spin-vinyl" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Aucune sortie trouvée pour le moment
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Entrez votre référence de dossier (ex: <code>SUB-XXXXX</code>) ou votre email d&apos;artiste pour afficher l&apos;avancement de votre musique.
                </p>
              </div>

              {/* Quick Search Card */}
              <form onSubmit={handleSearch} className="flex flex-col xs:flex-row gap-2 max-w-md mx-auto">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Email ou référence de sortie..."
                  className="h-12 bg-card border-border text-foreground rounded-xl placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="h-12 px-5 rounded-xl bg-gradient-gold text-black font-semibold shrink-0"
                >
                  {searching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1.5 xs:mr-0" />}
                  <span className="xs:hidden">Rechercher</span>
                </Button>
              </form>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">Vous n&apos;avez pas encore de sortie chez Mathias Label ?</p>
                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="w-full xs:w-auto rounded-full bg-gradient-gold text-black font-bold px-6 h-11"
                >
                  <Plus className="h-4 w-4 mr-2" /> Distribuer mon premier projet
                </Button>
              </div>
            </div>
          )}

          {/* MAIN DASHBOARD CONTENT */}
          {!loading && currentSubmission && (
            <div className="space-y-7 sm:space-y-10">
              {/* MULTI-RELEASE TAB SWITCHER (if artist has 2+ releases) */}
              {submissions.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-primary shrink-0" /> Vos projets ({submissions.length})
                    </span>
                    <button
                      onClick={() => setNewReleaseOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3 w-3" /> Nouveau projet
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {submissions.map((s) => {
                      const isSel = s.id === currentSubmission.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveId(s.id)}
                          className={cn(
                            "flex items-center gap-3 px-3.5 sm:px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all",
                            isSel
                              ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-md"
                              : "border-border bg-card/70 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {s.coverArtUrl ? (
                            <img
                              src={s.coverArtUrl}
                              alt={s.releaseTitle}
                              className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <Music className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 pr-1">
                            <div className="font-semibold text-xs text-foreground truncate max-w-[130px] sm:max-w-[180px]">
                              {s.releaseTitle}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{PLAN_LABELS[s.plan] || s.plan}</span>
                              <span>•</span>
                              <span className={cn(
                                "font-medium",
                                s.status === "delivered" && "text-emerald-600 dark:text-emerald-400",
                                s.status === "approved" && "text-primary",
                                s.status === "pending" && "text-amber-600 dark:text-amber-400",
                                s.status === "rejected" && "text-rose-600 dark:text-rose-400"
                              )}>
                                {STATUS_LABELS[s.status] || s.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setNewReleaseOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-dashed border-border bg-card/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground text-xs font-semibold shrink-0 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      Ajouter une sortie
                    </button>
                  </div>
                </div>
              )}

              {/* HERO COCKPIT CARD */}
              <div className="rounded-3xl border border-border bg-gradient-card p-4 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 pb-5 sm:pb-6 border-b border-border">
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Reference Badge */}
                      <button
                        onClick={() => copyToClipboard(currentSubmission.id, "id")}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono font-semibold bg-secondary/70 hover:bg-secondary border border-border text-foreground transition-all group"
                        title="Cliquer pour copier l'identifiant"
                      >
                        <span className="text-muted-foreground">RÉF:</span>
                        <span>#{currentSubmission.id.slice(0, 10)}...</span>
                        {copiedId ? (
                          <Check className="h-3 w-3 text-emerald-500 ml-1" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground ml-1" />
                        )}
                      </button>

                      {/* Plan Tag */}
                      <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                        {PLAN_LABELS[currentSubmission.plan] || currentSubmission.plan}
                      </span>

                      {/* Status Badge */}
                      <StatusPill status={currentSubmission.status} />
                    </div>

                    <div>
                      <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight break-words">
                        {currentSubmission.releaseTitle}
                      </h1>
                      <p className="mt-1.5 text-sm sm:text-lg text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-foreground">{currentSubmission.artistName}</span>
                        <span>·</span>
                        <span>{currentSubmission.releaseGenre}</span>
                        {currentSubmission.tracks?.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{currentSubmission.tracks.length} piste{currentSubmission.tracks.length > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setMetadataModalOpen(true)}
                      className="flex-1 sm:flex-initial rounded-full border-border bg-card hover:bg-secondary text-foreground text-xs h-10 px-4"
                    >
                      <FileText className="h-4 w-4 mr-1.5 text-primary shrink-0" /> Fiche Métadonnées
                    </Button>

                    <Button
                      asChild
                      className="flex-1 sm:flex-initial rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm h-10 px-4 sm:px-5 shadow-lg shadow-emerald-900/20"
                    >
                      <a
                        href={`https://wa.me/2250157307677?text=${encodeURIComponent(
                          `Bonjour Mathias Label ! Je vous contacte au sujet de ma sortie "${currentSubmission.releaseTitle}" par ${currentSubmission.artistName} (Réf : #${currentSubmission.id}). Pouvez-vous me faire un point d'étape ? 🙏`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5 shrink-0" /> Support WhatsApp VIP
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Progress Bar & Headline */}
                <div className="mt-5 sm:mt-6 pt-1 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-muted-foreground font-medium flex items-center gap-2 min-w-0">
                      <Radio className="h-4 w-4 text-primary animate-pulse shrink-0" />
                      <span className="truncate">Statut : <strong className="text-foreground font-semibold">{pipelineState.label}</strong></span>
                    </span>
                    <span className="font-mono font-bold text-gradient-gold text-sm sm:text-base shrink-0">
                      {pipelineState.percent}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pipelineState.percent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary to-amber-300 shadow-xs shadow-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 4-STEP INTERACTIVE DISTRIBUTION PIPELINE */}
              <div className="space-y-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    Pipeline de distribution studio
                  </h2>
                  <span className="text-xs text-muted-foreground">4 étapes clés vers 150+ plateformes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Step 1: Dépôt & Paiement */}
                  <PipelineStepCard
                    number={1}
                    title="Paiement & Dépôt"
                    subtitle="Dossier réceptionné"
                    isCompleted={true}
                    isActive={false}
                    date={formatDate(currentSubmission.createdAt)}
                    details={[
                      `Formule : ${PLAN_LABELS[currentSubmission.plan] || currentSubmission.plan}`,
                      `Montant : ${formatFCFA(currentSubmission.amount)}`,
                      `Règlement : ${PAYMENT_LABELS[currentSubmission.paymentMethod || ""] || "Validé"}`,
                    ]}
                  />

                  {/* Step 2: Audit Qualité & ISRC */}
                  <PipelineStepCard
                    number={2}
                    title="Audit Studio & ISRC"
                    subtitle="Conformité DSPs & Codes"
                    isCompleted={currentSubmission.status === "approved" || currentSubmission.status === "delivered"}
                    isActive={currentSubmission.status === "pending"}
                    date={currentSubmission.status !== "pending" ? "Validé" : "En cours"}
                    details={[
                      "Vérification WAV 24-bit 44.1kHz",
                      "Contrôle pochette 3000x3000px",
                      "Attribution ISRC internationaux",
                    ]}
                  />

                  {/* Step 3: Ingestion DSPs */}
                  <PipelineStepCard
                    number={3}
                    title="Ingestion DSPs"
                    subtitle="Envoi aux plateformes"
                    isCompleted={currentSubmission.status === "delivered"}
                    isActive={currentSubmission.status === "approved"}
                    date={currentSubmission.status === "delivered" ? "Terminé" : currentSubmission.status === "approved" ? "En cours" : "En attente"}
                    details={[
                      "Spotify, Apple Music, Deezer",
                      "TikTok, Boomplay, Audiomack",
                      "Contrôle métadonnées & crédits",
                    ]}
                  />

                  {/* Step 4: En Ligne & Smartlink */}
                  <PipelineStepCard
                    number={4}
                    title="En Ligne Mondial"
                    subtitle="Disponible dans 150+ pays"
                    isCompleted={currentSubmission.status === "delivered"}
                    isActive={false}
                    date={currentSubmission.releaseDate || (currentSubmission.status === "delivered" ? "En direct" : "À venir")}
                    details={[
                      "Diffusion streaming & téléchargement",
                      "Royalties 100 % actives",
                      "Smartlink de promotion généré",
                    ]}
                  />
                </div>
              </div>

              {/* TWO COLUMN STUDIO DOSSIER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* LEFT COLUMN: VINYL SLEEVE & TRACKLIST (7 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Artwork & Vinyl Sleeve Presentation */}
                  <div className="rounded-3xl border border-border bg-card/85 backdrop-blur-xl p-5 sm:p-7 shadow-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* 3D Vinyl Sleeve Component */}
                      <div className="relative group shrink-0 pr-6 sm:pr-8">
                        <div className="h-40 w-40 sm:h-52 sm:w-52 rounded-2xl overflow-hidden border border-border bg-secondary shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                          {currentSubmission.coverArtUrl ? (
                            <img
                              src={currentSubmission.coverArtUrl}
                              alt={currentSubmission.releaseTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-card flex flex-col items-center justify-center p-4 text-center">
                              <Music className="h-10 w-10 text-primary mb-2" />
                              <span className="text-xs text-muted-foreground font-medium">Pochette studio en cours de préparation</span>
                            </div>
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />
                        </div>

                        {/* Spinning vinyl peeking out */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 h-36 w-36 sm:h-48 sm:w-48 z-0 pointer-events-none opacity-85 transition-transform duration-500 group-hover:translate-x-3">
                          <VinylRecord direction="cw" className="h-full w-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]" />
                        </div>
                      </div>

                      {/* Release Quick Specs */}
                      <div className="flex-1 space-y-3 text-center sm:text-left min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-secondary/70 border border-border text-foreground/80">
                          {currentSubmission.explicit ? "⚠️ Explicit Content" : "✓ Tout public"}
                        </div>
                        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground break-words">
                          {currentSubmission.releaseTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Artiste : <span className="text-foreground font-medium">{currentSubmission.artistName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Date officielle : <span className="text-foreground/90 font-medium">{currentSubmission.releaseDate || "Sous 48h à 72h"}</span>
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-secondary/60 border border-border text-foreground/80">
                            Langue : {currentSubmission.releaseLanguage || "Français"}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-secondary/60 border border-border text-foreground/80">
                            Genre : {currentSubmission.releaseGenre}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracklist Table Card */}
                  <div className="rounded-3xl border border-border bg-card/85 backdrop-blur-xl p-5 sm:p-7 shadow-lg space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                          <Music className="h-4 w-4 text-primary shrink-0" />
                          Tracklist &amp; Codes ISRC
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Identifiants internationaux de chaque piste audio.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                        {currentSubmission.tracks?.length || 0} titre{(currentSubmission.tracks?.length || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="divide-y divide-border rounded-2xl border border-border bg-secondary/20 overflow-hidden">
                      {currentSubmission.tracks && currentSubmission.tracks.length > 0 ? (
                        currentSubmission.tracks.map((t, index) => {
                          const isrcCode = t.isrc || `BJ-MRK-26-${String(index + 1).padStart(5, "0")}`;
                          return (
                            <div
                              key={t.id || index}
                              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-secondary/40 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-mono text-xs sm:text-sm font-bold text-muted-foreground w-6 text-center shrink-0">
                                  {String(t.position ?? index + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm text-foreground flex items-center gap-2 truncate">
                                    <span className="truncate">{t.title}</span>
                                    {t.explicit && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                                        E
                                      </span>
                                    )}
                                  </div>
                                  {t.featuredArtists && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      feat. {t.featuredArtists}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pl-9 sm:pl-0">
                                {/* ISRC Chip with Copy */}
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(isrcCode, "isrc")}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-card hover:bg-secondary border border-border text-foreground/90 transition-all group"
                                  title="Copier le code ISRC"
                                >
                                  <span className="text-[10px] text-muted-foreground">ISRC:</span>
                                  <span className="font-semibold text-amber-600 dark:text-amber-300">{isrcCode}</span>
                                  {copiedIsrc === isrcCode ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                                  )}
                                </button>

                                <div className="flex items-center gap-2">
                                  {t.duration && (
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {t.duration}
                                    </span>
                                  )}

                                  {t.audioUrl ? (
                                    <a
                                      href={t.audioUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs flex items-center gap-1 transition-colors"
                                      title="Ouvrir le master audio"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                      Master OK
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                          Aucun morceau spécifié pour l&apos;instant.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DSPs & STREAMING STORES (5 COLS) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Platforms Grid Card */}
                  <div className="rounded-3xl border border-border bg-card/85 backdrop-blur-xl p-5 sm:p-7 shadow-lg space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary shrink-0" />
                          Plateformes &amp; Ingestion DSP
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Statut de diffusion sur les boutiques mondiales.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                        150+ stores
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {DSP_PLATFORMS.map((dsp) => {
                        const isDelivered = currentSubmission.status === "delivered";
                        const isApproved = currentSubmission.status === "approved";
                        return (
                          <div
                            key={dsp.name}
                            className="p-3 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <PlatformIcon id={dsp.id} size="xs" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate">{dsp.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{dsp.category}</div>
                              </div>
                            </div>

                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                                isDelivered
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                  : isApproved
                                  ? "bg-primary/15 text-primary border border-primary/30"
                                  : "bg-secondary text-muted-foreground border border-border"
                              )}
                            >
                              {isDelivered ? "En ligne ✓" : isApproved ? "Ingestion ⚡" : "Programmé ⏳"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-secondary/20 text-xs text-muted-foreground space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        100 % des royalties garanties à l&apos;artiste
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Chaque stream généré sur l&apos;ensemble de ces plateformes vous appartient intégralement. Les rapports sont audités mensuellement par Mathias Label.
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Card */}
                  <div className="rounded-3xl border border-primary/30 bg-gradient-card p-5 sm:p-7 shadow-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-gold flex items-center justify-center text-black font-bold shadow-md shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-foreground">
                          Besoin d&apos;ajuster vos morceaux ?
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Notre équipe studio est disponible 7j/7 pour vous aider.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Vous souhaitez remplacer un master audio, modifier le titre ou ajouter des crédits de beatmaker ? Envoyez un message avec votre référence de dossier.
                    </p>

                    <Button
                      asChild
                      className="w-full rounded-2xl bg-gradient-gold text-black hover:opacity-90 font-bold h-11 text-xs sm:text-sm shadow-md"
                    >
                      <a
                        href={`https://wa.me/2250157307677?text=${encodeURIComponent(
                          `Bonjour Mathias Label ! Je souhaite des informations au sujet de ma sortie "${currentSubmission.releaseTitle}" (Réf : #${currentSubmission.id}). Pouvez-vous m'accompagner ?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" /> Contacter l&apos;ingénieur studio
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* BOTTOM CTA: SOUMETTRE UNE NOUVELLE SORTIE */}
              <div className="rounded-3xl border border-primary/30 bg-gradient-card p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                    <Sparkles className="h-3.5 w-3.5" /> Continuez à développer votre discographie
                  </div>
                  <h3 className="font-display text-xl sm:text-3xl font-extrabold text-foreground">
                    Vous préparez un nouveau single, EP ou album ?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Vos informations d&apos;artiste sont déjà mémorisées. Soumettez votre prochaine sortie en quelques clics sans devoir tout ressaisir.
                  </p>
                </div>

                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="w-full md:w-auto rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold px-8 h-12 text-sm sm:text-base shadow-xl glow-gold shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" strokeWidth={3} />
                  Distribuer un autre projet
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SEARCH LOOKUP MODAL */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="max-w-md border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Search className="h-4 w-4 text-primary shrink-0" />
              Rechercher une sortie musicale
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Entrez votre adresse email d&apos;artiste ou l&apos;identifiant de votre sortie (ex : SUB-XXXXX).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="space-y-4 pt-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="artiste@email.com ou SUB-..."
              className="h-11 bg-background border-border text-foreground rounded-xl placeholder:text-muted-foreground"
              autoFocus
            />

            <div className="flex flex-col-reverse xs:flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSearchModalOpen(false)}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="rounded-full bg-gradient-gold text-black font-semibold px-5"
              >
                {searching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>Rechercher <ArrowRight className="h-4 w-4 ml-1.5" /></>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* METADATA SHEET MODAL */}
      {currentSubmission && (
        <Dialog open={metadataModalOpen} onOpenChange={setMetadataModalOpen}>
          <DialogContent className="max-w-2xl max-h-[88dvh] overflow-y-auto border-border bg-card text-foreground p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">Fiche Métadonnées — {currentSubmission.releaseTitle}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Récapitulatif officiel certifié par Mathias Label.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs sm:text-sm">
              <div className="rounded-2xl border border-border bg-secondary/20 divide-y divide-border overflow-hidden">
                <MetadataRow label="Référence Dossier" value={`#${currentSubmission.id}`} />
                <MetadataRow label="Titre du projet" value={currentSubmission.releaseTitle} />
                <MetadataRow label="Artiste Principal" value={currentSubmission.artistName} />
                <MetadataRow label="Genre Musical" value={currentSubmission.releaseGenre} />
                <MetadataRow label="Langue" value={currentSubmission.releaseLanguage || "Français"} />
                <MetadataRow label="Date de sortie" value={currentSubmission.releaseDate || "Sous 48h à 72h"} />
                <MetadataRow label="Formule" value={PLAN_LABELS[currentSubmission.plan] || currentSubmission.plan} />
                <MetadataRow label="Nombre de titres" value={`${currentSubmission.tracks?.length || 0} piste(s)`} />
                <MetadataRow label="Contenu explicite" value={currentSubmission.explicit ? "Oui (Explicit)" : "Non"} />
                <MetadataRow label="Label / Distributeur" value="Mathias Label (Cotonou, Bénin)" />
                <MetadataRow label="Part des royalties" value="100 % revenant à l'artiste" />
              </div>

              {/* Tracks breakdown */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Codes ISRC par morceau :
                </div>
                <div className="rounded-2xl border border-border bg-secondary/30 divide-y divide-border font-mono text-xs overflow-hidden">
                  {currentSubmission.tracks?.map((t, idx) => (
                    <div key={t.id || idx} className="p-3 flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                      <span className="text-foreground/90 truncate">
                        {idx + 1}. {t.title} {t.featuredArtists ? `(feat. ${t.featuredArtists})` : ""}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                        {t.isrc || `BJ-MRK-26-${String(idx + 1).padStart(5, "0")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => {
                    const text = buildMetadataText(currentSubmission);
                    if (navigator?.clipboard) {
                      navigator.clipboard.writeText(text);
                      toast({
                        title: "Fiche copiée !",
                        description: "Toutes les métadonnées ont été copiées dans le presse-papiers.",
                      });
                    }
                  }}
                  className="w-full xs:w-auto rounded-full bg-gradient-gold text-black font-semibold text-xs h-10 px-5"
                >
                  <Copy className="h-3.5 w-3.5 mr-2" /> Copier le texte complet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PLAN SUBMISSION DIALOG WITH PREFILLED ARTIST PROFILE */}
      <PlanSubmissionDialog
        open={newReleaseOpen}
        planId={null}
        defaultArtist={artistProfileForPrefill}
        onClose={() => setNewReleaseOpen(false)}
        onSuccessRedirect={(newId) => {
          setActiveId(newId);
          loadSubmissions(newId);
        }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = {
    delivered: { label: "En ligne", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
    approved: { label: "Ingestion DSP", color: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary" },
    pending: { label: "En vérification studio", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
    rejected: { label: "Correction requise", color: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30", dot: "bg-rose-500" },
  }[status] || { label: status, color: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border", cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function PipelineStepCard({
  number,
  title,
  subtitle,
  isCompleted,
  isActive,
  date,
  details,
}: {
  number: number;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isActive: boolean;
  date: string;
  details: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5 transition-all relative overflow-hidden flex flex-col justify-between",
        isCompleted
          ? "border-emerald-500/30 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.04]"
          : isActive
          ? "border-primary/50 bg-primary/[0.08] ring-1 ring-primary/30 shadow-md"
          : "border-border bg-card/60 opacity-80"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center font-display font-bold text-xs",
              isCompleted
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                : isActive
                ? "bg-primary text-black font-extrabold"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : `0${number}`}
          </span>

          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isCompleted
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : isActive
                ? "bg-primary/20 text-primary animate-pulse"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {date}
          </span>
        </div>

        <div>
          <div className="font-display font-bold text-sm text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>

        <ul className="space-y-1 pt-1 text-[11px] text-muted-foreground">
          {details.map((d) => (
            <li key={d} className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 sm:p-3.5 flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-foreground text-right max-w-[65%] break-words">{value}</span>
    </div>
  );
}

function buildMetadataText(submission: Submission): string {
  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`FICHE METADONNEES — MATHIAS LABEL`);
  lines.push(`=========================================`);
  lines.push(`Reference : #${submission.id}`);
  lines.push(`Titre : ${submission.releaseTitle}`);
  lines.push(`Artiste : ${submission.artistName}`);
  lines.push(`Genre : ${submission.releaseGenre}`);
  lines.push(`Langue : ${submission.releaseLanguage || "Français"}`);
  lines.push(`Date de sortie : ${submission.releaseDate || "Sous 48h-72h"}`);
  lines.push(`Formule : ${PLAN_LABELS[submission.plan] || submission.plan}`);
  lines.push(`Contenu explicite : ${submission.explicit ? "Oui" : "Non"}`);
  lines.push(`Label : Mathias Label (Cotonou, Bénin)`);
  lines.push(`Distribution : 150+ plateformes (Spotify, Apple, Deezer, TikTok...)`);
  lines.push(`Royalties : 100 % revenant à l'artiste`);
  lines.push(``);
  lines.push(`TRACKLIST & CODES ISRC :`);
  submission.tracks?.forEach((t, i) => {
    const isrc = t.isrc || `BJ-MRK-26-${String(i + 1).padStart(5, "0")}`;
    lines.push(`  ${i + 1}. ${t.title}${t.featuredArtists ? ` (feat. ${t.featuredArtists})` : ""} | ISRC: ${isrc}`);
  });
  lines.push(``);
  lines.push(`Contact Support : WhatsApp +225 01 57 30 76 77`);
  return lines.join("\n");
}
