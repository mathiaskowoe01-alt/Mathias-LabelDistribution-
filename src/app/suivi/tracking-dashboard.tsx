'use client'

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Disc3, Music, Sparkles, CheckCircle2, Clock, AlertCircle,
  Copy, Check, ExternalLink, MessageCircle, Plus, Search,
  ArrowRight, ShieldCheck, Radio, Share2, Layers,
  ChevronRight, RefreshCw, FileText, Globe, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VinylRecord } from "@/components/site/vinyl-record";
import { PlanSubmissionDialog, type ArtistProfile } from "@/components/site/plan-submission-dialog";
import {
  type Submission,
  STATUS_LABELS,
  PLAN_LABELS,
  PAYMENT_LABELS,
  formatFCFA,
  formatDate,
  formatDateTime,
} from "@/lib/admin-types";

const DSP_PLATFORMS = [
  { name: "Spotify", category: "Global", icon: "🎧", dspColor: "#1DB954" },
  { name: "Apple Music", category: "Global", icon: "🍎", dspColor: "#FA243C" },
  { name: "Deezer", category: "Global & Francophone", icon: "🎵", dspColor: "#A238FF" },
  { name: "TikTok & Resso", category: "Viral & Social", icon: "⚡", dspColor: "#00F2FE" },
  { name: "Boomplay", category: "Leader Afrique", icon: "🌍", dspColor: "#00B0FF" },
  { name: "Audiomack", category: "Trending Afrique", icon: "🔥", dspColor: "#FFA200" },
  { name: "YouTube Music", category: "Global & Content ID", icon: "▶️", dspColor: "#FF0000" },
  { name: "Amazon Music", category: "Global", icon: "📦", dspColor: "#00A8E1" },
  { name: "Tidal", category: "Hi-Fi Master", icon: "🌊", dspColor: "#000000" },
  { name: "Instagram / FB", category: "Bibliothèque Audio", icon: "📸", dspColor: "#E1306C" },
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
  // Fetch submissions from API
  const loadSubmissions = useCallback(async (targetId?: string | null, targetEmail?: string | null) => {
    try {
      let url = "";
      if (targetId) {
        url = `/api/submissions/track?id=${encodeURIComponent(targetId)}`;
      } else if (targetEmail) {
        url = `/api/submissions/track?email=${encodeURIComponent(targetEmail)}`;
      } else {
        // Fallback to localStorage saved submissions
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

        // Also fetch siblings if email is present to show all releases for this artist
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
    // pending
    return { stepIndex: 1, percent: 35, label: "Audit technique studio en cours" };
  }, [currentSubmission]);

  return (
    <div className="min-h-screen bg-[#07080c] text-foreground selection:bg-primary/20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[35rem] w-[35rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-20 h-[30rem] w-[30rem] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute -bottom-20 left-10 h-[25rem] w-[25rem] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-noise opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0c13]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
              {/* Brand Logo & Title */}
              <div className="flex items-center gap-3">
                <a href="/" className="flex items-center gap-2.5 group">
                  <img
                    src="/brand/logo.png"
                    alt="MR - K Distribution"
                    className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-lg border border-white/10"
                  />
                  <div className="flex flex-col leading-none">
                    <span className="font-display text-base font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                      MR - K
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80">
                      Distribution
                    </span>
                  </div>
                </a>
                <span className="hidden sm:inline-block h-4 w-px bg-white/10" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-white/90">Espace Artiste</span>
                  <span className="text-[11px] text-white/40">· Suivi en direct</span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchModalOpen(true)}
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 px-3.5"
                >
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Rechercher une sortie</span>
                  <span className="sm:hidden">Recherche</span>
                </Button>

                {/* Main Action: Soumettre une nouvelle sortie */}
                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold text-xs sm:text-sm h-9 sm:h-10 px-4 sm:px-5 shadow-lg shadow-primary/20 glow-gold transition-all"
                >
                  <Plus className="h-4 w-4 mr-1.5" strokeWidth={3} />
                  <span className="hidden sm:inline">Distribuer une nouvelle sortie</span>
                  <span className="sm:hidden">Nouvelle sortie</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Welcome Alert for newly created submissions */}
          {isNewlyCreated && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 sm:p-5 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent backdrop-blur-md flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-base text-white">
                  🎉 Félicitations ! Votre demande a été enregistrée avec succès
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">
                  Votre dossier est entre les mains de l&apos;équipe studio MR - K. Vous pouvez suivre chaque étape de son ingestion ci-dessous en temps réel, copier vos codes ISRC dès qu&apos;ils sont assignés et soumettre de futurs projets à tout moment.
                </p>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-white/70">Chargement de votre espace de distribution...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && submissions.length === 0 && (
            <div className="py-16 sm:py-24 max-w-xl mx-auto text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center shadow-xl">
                <Disc3 className="h-10 w-10 text-primary animate-spin-vinyl" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Aucune sortie trouvée pour le moment
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Entrez votre référence de dossier (ex: <code>SUB-XXXXX</code>) ou votre email d&apos;artiste pour afficher l&apos;avancement de votre musique.
                </p>
              </div>

              {/* Quick Search Card */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Email ou référence de sortie..."
                  className="h-12 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30"
                />
                <Button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="h-12 px-5 rounded-xl bg-gradient-gold text-black font-semibold shrink-0"
                >
                  {searching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-white/40 mb-3">Vous n&apos;avez pas encore de sortie chez MR - K ?</p>
                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="rounded-full bg-gradient-gold text-black font-bold px-6 h-11"
                >
                  <Plus className="h-4 w-4 mr-2" /> Distribuer mon premier projet
                </Button>
              </div>
            </div>
          )}

          {/* MAIN DASHBOARD CONTENT */}
          {!loading && currentSubmission && (
            <div className="space-y-8 sm:space-y-10">
              {/* MULTI-RELEASE TAB SWITCHER (if artist has 2+ releases) */}
              {submissions.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-primary" /> Vos projets en distribution ({submissions.length})
                    </span>
                    <button
                      onClick={() => setNewReleaseOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Nouveau projet
                    </button>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {submissions.map((s) => {
                      const isSel = s.id === currentSubmission.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveId(s.id)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all",
                            isSel
                              ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-lg"
                              : "border-white/5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                          )}
                        >
                          {s.coverArtUrl ? (
                            <img
                              src={s.coverArtUrl}
                              alt={s.releaseTitle}
                              className="h-8 w-8 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              <Music className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 pr-1">
                            <div className="font-semibold text-xs text-white truncate max-w-[140px] sm:max-w-[180px]">
                              {s.releaseTitle}
                            </div>
                            <div className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5">
                              <span>{PLAN_LABELS[s.plan] || s.plan}</span>
                              <span>•</span>
                              <span className={cn(
                                "font-medium",
                                s.status === "delivered" && "text-emerald-400",
                                s.status === "approved" && "text-primary",
                                s.status === "pending" && "text-amber-400",
                                s.status === "rejected" && "text-rose-400"
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/5 text-white/60 hover:text-white text-xs font-semibold shrink-0 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      Ajouter une sortie
                    </button>
                  </div>
                </div>
              )}

              {/* HERO COCKPIT CARD */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#141724]/90 to-[#0e1019]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-96 w-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Reference Badge */}
                      <button
                        onClick={() => copyToClipboard(currentSubmission.id, "id")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all group"
                        title="Cliquer pour copier l'identifiant"
                      >
                        <span className="text-white/40">RÉF:</span>
                        <span>#{currentSubmission.id.slice(0, 10)}...</span>
                        {copiedId ? (
                          <Check className="h-3 w-3 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="h-3 w-3 text-white/40 group-hover:text-white ml-1" />
                        )}
                      </button>

                      {/* Plan Tag */}
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                        {PLAN_LABELS[currentSubmission.plan] || currentSubmission.plan}
                      </span>

                      {/* Status Badge */}
                      <StatusPill status={currentSubmission.status} />
                    </div>

                    <div>
                      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        {currentSubmission.releaseTitle}
                      </h1>
                      <p className="mt-1.5 text-base sm:text-lg text-white/70 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{currentSubmission.artistName}</span>
                        <span>·</span>
                        <span className="text-white/50">{currentSubmission.releaseGenre}</span>
                        {currentSubmission.tracks?.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-white/50">{currentSubmission.tracks.length} piste{currentSubmission.tracks.length > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setMetadataModalOpen(true)}
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs h-10 px-4"
                    >
                      <FileText className="h-4 w-4 mr-2 text-primary" /> Fiche Métadonnées
                    </Button>

                    <Button
                      asChild
                      className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm h-10 px-5 shadow-lg shadow-emerald-900/30"
                    >
                      <a
                        href={`https://wa.me/2250157307677?text=${encodeURIComponent(
                          `Bonjour MR - K Distribution ! Je vous contacte au sujet de ma sortie "${currentSubmission.releaseTitle}" par ${currentSubmission.artistName} (Réf : #${currentSubmission.id}). Pouvez-vous me faire un point d'étape ? 🙏`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" /> Support WhatsApp VIP
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Progress Bar & Headline */}
                <div className="mt-6 pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-white/60 font-medium flex items-center gap-2">
                      <Radio className="h-4 w-4 text-primary animate-pulse" />
                      Statut actuel : <strong className="text-white font-semibold">{pipelineState.label}</strong>
                    </span>
                    <span className="font-mono font-bold text-gradient-gold text-base">
                      {pipelineState.percent}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pipelineState.percent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary to-amber-300 shadow-sm shadow-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 4-STEP INTERACTIVE DISTRIBUTION PIPELINE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Pipeline de distribution studio
                  </h2>
                  <span className="text-xs text-white/50">4 étapes clés vers 150+ plateformes</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: VINYL SLEEVE & TRACKLIST (7 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Artwork & Vinyl Sleeve Presentation */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141f]/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* 3D Vinyl Sleeve Component */}
                      <div className="relative group shrink-0">
                        <div className="h-44 w-44 sm:h-52 sm:w-52 rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                          {currentSubmission.coverArtUrl ? (
                            <img
                              src={currentSubmission.coverArtUrl}
                              alt={currentSubmission.releaseTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-black flex flex-col items-center justify-center p-4 text-center">
                              <Music className="h-10 w-10 text-primary mb-2" />
                              <span className="text-xs text-white/50 font-medium">Pochette studio en cours de préparation</span>
                            </div>
                          )}
                          {/* Gloss overlay */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />
                        </div>

                        {/* Spinning vinyl peeking out */}
                        <div className="absolute top-1/2 -right-8 -translate-y-1/2 h-40 w-40 sm:h-48 sm:w-48 z-0 pointer-events-none opacity-80 transition-transform duration-500 group-hover:translate-x-4">
                          <VinylRecord direction="cw" className="h-full w-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]" />
                        </div>
                      </div>

                      {/* Release Quick Specs */}
                      <div className="flex-1 space-y-3 text-center sm:text-left min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-white/70">
                          {currentSubmission.explicit ? "⚠️ Explicit Content" : "✓ Tout public"}
                        </div>
                        <h3 className="font-display text-2xl font-bold text-white truncate">
                          {currentSubmission.releaseTitle}
                        </h3>
                        <p className="text-sm text-white/60">
                          Artiste : <span className="text-white font-medium">{currentSubmission.artistName}</span>
                        </p>
                        <p className="text-xs text-white/50">
                          Date officielle : <span className="text-white/80 font-medium">{currentSubmission.releaseDate || "Sous 48h à 72h"}</span>
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/5 text-white/70">
                            Langue : {currentSubmission.releaseLanguage || "Français"}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/5 text-white/70">
                            Genre : {currentSubmission.releaseGenre}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracklist Table Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141f]/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                          <Music className="h-4 w-4 text-primary" />
                          Tracklist &amp; Codes ISRC
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          Identifiants internationaux de chaque piste audio.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        {currentSubmission.tracks?.length || 0} titre{(currentSubmission.tracks?.length || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-black/30 overflow-hidden">
                      {currentSubmission.tracks && currentSubmission.tracks.length > 0 ? (
                        currentSubmission.tracks.map((t, index) => {
                          const isrcCode = t.isrc || `BJ-MRK-26-${String(index + 1).padStart(5, "0")}`;
                          return (
                            <div
                              key={t.id || index}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="font-mono text-sm font-bold text-white/40 w-6 text-center shrink-0">
                                  {String(t.position ?? index + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm text-white flex items-center gap-2 truncate">
                                    <span>{t.title}</span>
                                    {t.explicit && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                        E
                                      </span>
                                    )}
                                  </div>
                                  {t.featuredArtists && (
                                    <div className="text-xs text-white/50 truncate">
                                      feat. {t.featuredArtists}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-9 sm:pl-0">
                                {/* ISRC Chip with Copy */}
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(isrcCode, "isrc")}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all group"
                                  title="Copier le code ISRC"
                                >
                                  <span className="text-[10px] text-white/40">ISRC:</span>
                                  <span className="font-medium text-amber-300">{isrcCode}</span>
                                  {copiedIsrc === isrcCode ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-white/30 group-hover:text-white" />
                                  )}
                                </button>

                                {t.duration && (
                                  <span className="text-xs font-mono text-white/40">
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
                                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Master OK
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-white/40">
                          Aucun morceau spécifié pour l&apos;instant.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DSPs & STREAMING STORES (5 COLS) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Platforms Grid Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141f]/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          Plateformes &amp; Ingestion DSP
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          Statut de diffusion sur les boutiques mondiales.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
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
                            className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base">{dsp.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{dsp.name}</div>
                                <div className="text-[10px] text-white/40 truncate">{dsp.category}</div>
                              </div>
                            </div>

                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                                isDelivered
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : isApproved
                                  ? "bg-primary/15 text-primary border border-primary/30"
                                  : "bg-white/5 text-white/40 border border-white/5"
                              )}
                            >
                              {isDelivered ? "En ligne ✓" : isApproved ? "Ingestion ⚡" : "Programmé ⏳"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-xs text-white/60 space-y-1">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        100 % des royalties garanties à l&apos;artiste
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed">
                        Chaque stream généré sur l&apos;ensemble de ces plateformes vous appartient intégralement. Les rapports sont audités mensuellement par MR - K Distribution.
                      </p>
                    </div>
                  </div>

                  {/* Direct Contact Card */}
                  <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-[#141724] to-[#0e1019] backdrop-blur-xl p-6 sm:p-7 shadow-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-gold flex items-center justify-center text-black font-bold shadow-md">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-white">
                          Besoin d&apos;ajuster vos morceaux ?
                        </h4>
                        <p className="text-xs text-white/60">
                          Notre équipe studio est disponible 7j/7 pour vous aider.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed">
                      Vous souhaitez remplacer un master audio, modifier le titre ou ajouter des crédits de beatmaker ? Envoyez un message avec votre référence de dossier.
                    </p>

                    <Button
                      asChild
                      className="w-full rounded-2xl bg-gradient-gold text-black hover:opacity-90 font-bold h-11 text-xs sm:text-sm shadow-md"
                    >
                      <a
                        href={`https://wa.me/2250157307677?text=${encodeURIComponent(
                          `Bonjour MR - K Distribution ! Je souhaite des informations au sujet de ma sortie "${currentSubmission.releaseTitle}" (Réf : #${currentSubmission.id}). Pouvez-vous m'accompagner ?`
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
              <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-[#161a29] to-primary/5 p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                    <Sparkles className="h-3.5 w-3.5" /> Continuez à développer votre discographie
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    Vous préparez un nouveau single, EP ou album ?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Vos informations d&apos;artiste sont déjà mémorisées. Soumettez votre prochaine sortie en quelques clics sans devoir tout ressaisir.
                  </p>
                </div>

                <Button
                  onClick={() => setNewReleaseOpen(true)}
                  className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-bold px-8 h-12 text-sm sm:text-base shadow-xl glow-gold shrink-0"
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
        <DialogContent className="max-w-md border-white/10 bg-[#12141f] text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Rechercher une sortie musicale
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Entrez votre adresse email d&apos;artiste ou l&apos;identifiant de votre sortie (ex : SUB-XXXXX).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="space-y-4 pt-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="artiste@email.com ou SUB-..."
              className="h-11 bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/30"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSearchModalOpen(false)}
                className="rounded-full text-white/60 hover:text-white"
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-white/10 bg-[#10121c] text-white p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fiche Métadonnées — {currentSubmission.releaseTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/50">
                Récapitulatif officiel certifié par MR - K Distribution.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs sm:text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
                <MetadataRow label="Référence Dossier" value={`#${currentSubmission.id}`} />
                <MetadataRow label="Titre du projet" value={currentSubmission.releaseTitle} />
                <MetadataRow label="Artiste Principal" value={currentSubmission.artistName} />
                <MetadataRow label="Genre Musical" value={currentSubmission.releaseGenre} />
                <MetadataRow label="Langue" value={currentSubmission.releaseLanguage || "Français"} />
                <MetadataRow label="Date de sortie" value={currentSubmission.releaseDate || "Sous 48h à 72h"} />
                <MetadataRow label="Formule" value={PLAN_LABELS[currentSubmission.plan] || currentSubmission.plan} />
                <MetadataRow label="Nombre de titres" value={`${currentSubmission.tracks?.length || 0} piste(s)`} />
                <MetadataRow label="Contenu explicite" value={currentSubmission.explicit ? "Oui (Explicit)" : "Non"} />
                <MetadataRow label="Label / Distributeur" value="MR - K Distribution (Cotonou, Bénin)" />
                <MetadataRow label="Part des royalties" value="100 % revenant à l'artiste" />
              </div>

              {/* Tracks breakdown */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                  Codes ISRC par morceau :
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 divide-y divide-white/5 font-mono text-xs">
                  {currentSubmission.tracks?.map((t, idx) => (
                    <div key={t.id || idx} className="p-3 flex items-center justify-between">
                      <span className="text-white/80">
                        {idx + 1}. {t.title} {t.featuredArtists ? `(feat. ${t.featuredArtists})` : ""}
                      </span>
                      <span className="text-amber-400 font-bold">
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
                  className="rounded-full bg-gradient-gold text-black font-semibold text-xs h-10 px-5"
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
    delivered: { label: "En ligne", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
    approved: { label: "Ingestion DSP", color: "bg-primary/20 text-primary border-primary/30", dot: "bg-primary" },
    pending: { label: "En vérification studio", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
    rejected: { label: "Correction requise", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", dot: "bg-rose-400" },
  }[status] || { label: status, color: "bg-white/10 text-white/70 border-white/10", dot: "bg-white" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", cfg.color)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)} />
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
        "rounded-2xl border p-5 transition-all relative overflow-hidden flex flex-col justify-between",
        isCompleted
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : isActive
          ? "border-primary/50 bg-primary/[0.06] ring-1 ring-primary/30 shadow-lg"
          : "border-white/5 bg-white/[0.02] opacity-75"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center font-display font-bold text-xs",
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : isActive
                ? "bg-primary text-black font-extrabold"
                : "bg-white/10 text-white/50"
            )}
          >
            {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : `0${number}`}
          </span>

          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isCompleted
                ? "bg-emerald-500/10 text-emerald-400"
                : isActive
                ? "bg-primary/20 text-primary animate-pulse"
                : "bg-white/5 text-white/40"
            )}
          >
            {date}
          </span>
        </div>

        <div>
          <div className="font-display font-bold text-sm text-white">{title}</div>
          <div className="text-xs text-white/50">{subtitle}</div>
        </div>

        <ul className="space-y-1 pt-1 text-[11px] text-white/60">
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
    <div className="p-3.5 flex items-start justify-between gap-4">
      <span className="text-xs uppercase tracking-wider text-white/40 font-medium">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-white text-right max-w-[65%] truncate">{value}</span>
    </div>
  );
}

function buildMetadataText(submission: Submission): string {
  const lines: string[] = [];
  lines.push(`=========================================`);
  lines.push(`FICHE METADONNEES — MR - K DISTRIBUTION`);
  lines.push(`=========================================`);
  lines.push(`Reference : #${submission.id}`);
  lines.push(`Titre : ${submission.releaseTitle}`);
  lines.push(`Artiste : ${submission.artistName}`);
  lines.push(`Genre : ${submission.releaseGenre}`);
  lines.push(`Langue : ${submission.releaseLanguage || "Français"}`);
  lines.push(`Date de sortie : ${submission.releaseDate || "Sous 48h-72h"}`);
  lines.push(`Formule : ${PLAN_LABELS[submission.plan] || submission.plan}`);
  lines.push(`Contenu explicite : ${submission.explicit ? "Oui" : "Non"}`);
  lines.push(`Label : MR - K Distribution (Cotonou, Bénin)`);
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
