'use client'

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, MessageCircle, Music, Play, Pause,
  ExternalLink, Globe2, Disc3, Radio, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VinylRecord } from "./vinyl-record";
import { cn } from "@/lib/utils";

type PublicArtist = {
  id: string;
  artistName: string;
  artistCity: string;
  artistBio?: string | null;
  releaseTitle: string;
  releaseGenre: string;
  releaseDate?: string | null;
  coverArtUrl?: string | null;
  plan: string;
  status: string;
  social?: Record<string, string>;
  tracks?: Array<{
    id: string;
    title: string;
    duration?: string | null;
    audioUrl?: string | null;
    featuredArtists?: string | null;
  }>;
};

// Exemples de releases phares vitrine si aucune soumission livrée n'existe encore
const CURATED_DEMO_RELEASES: PublicArtist[] = [
  {
    id: "demo-1",
    artistName: "Mïko Sun",
    artistCity: "Cotonou, Bénin",
    artistBio: "Fusion Afropop et sonorités traditionnelles béninoises.",
    releaseTitle: "Soleil Levant (Single)",
    releaseGenre: "Afropop",
    releaseDate: "2026",
    coverArtUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    plan: "single",
    status: "delivered",
    social: { spotify: "https://spotify.com" },
    tracks: [{ id: "t1", title: "Soleil Levant", duration: "3:18", featuredArtists: "feat. Kelyan" }],
  },
  {
    id: "demo-2",
    artistName: "Aura Kpèdji",
    artistCity: "Porto-Novo, Bénin",
    artistBio: "Voix soul & RnB contemporain inspiré des rythmes Fon.",
    releaseTitle: "Nuit Étoilée (EP 5 titres)",
    releaseGenre: "Soul & RnB",
    releaseDate: "2026",
    coverArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    plan: "ep",
    status: "delivered",
    social: { spotify: "https://spotify.com", instagram: "@aurakpedji" },
    tracks: [{ id: "t2", title: "Minon", duration: "3:45" }],
  },
  {
    id: "demo-3",
    artistName: "D-Vibe & The Kings",
    artistCity: "Abidjan, Côte d'Ivoire",
    artistBio: "Collectif Afro-fusion & Drill mélodique.",
    releaseTitle: "Babi to Cotonou (Album Pro)",
    releaseGenre: "Afro-Fusion",
    releaseDate: "2026",
    coverArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    plan: "album",
    status: "delivered",
    social: { spotify: "https://spotify.com", tiktok: "@dvibe_official" },
    tracks: [{ id: "t3", title: "Pont De Gaulle", duration: "3:02" }],
  },
];

export function Artists() {
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchArtists() {
      try {
        const res = await fetch("/api/artists", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.artists) && data.artists.length > 0) {
            setArtists(data.artists);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) {
        // Fallback to curated showcase
        setArtists(CURATED_DEMO_RELEASES);
        setLoading(false);
      }
    }
    fetchArtists();
    return () => { cancelled = true; };
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    artists.forEach((a) => { if (a.releaseGenre) set.add(a.releaseGenre); });
    return ["all", ...Array.from(set)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    if (activeFilter === "all") return artists;
    return artists.filter((a) => a.releaseGenre === activeFilter);
  }, [artists, activeFilter]);

  const togglePlay = (id: string) => {
    setCurrentlyPlaying((prev) => (prev === id ? null : id));
  };

  return (
    <section id="artistes" className="relative py-24 sm:py-32 border-t border-border/60 overflow-hidden">
      {/* Background atmospheric ambient light */}
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Catalogue & Sorties
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Artistes &amp; <span className="text-gradient-gold">Sorties Récentes</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Découvrez les singles, EPs et albums diffusés mondialement avec MR - K Distribution. 100 % de royalties pour l'artiste, 150+ plateformes de streaming.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button asChild size="sm" className="bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-5 shadow-sm">
              <a href="#tarifs" className="inline-flex items-center gap-1.5">
                Sortir ma musique <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Genre filter tags */}
        {genres.length > 2 && (
          <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveFilter(g)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                  activeFilter === g
                    ? "bg-gradient-gold text-black border-transparent shadow-xs"
                    : "bg-card/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {g === "all" ? "Tous les genres" : g}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic artist cards grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          <AnimatePresence mode="popLayout">
            {filteredArtists.map((artist, idx) => {
              const isPlaying = currentlyPlaying === artist.id;
              const track = artist.tracks?.[0];

              return (
                <motion.div
                  key={artist.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="group relative flex flex-col rounded-3xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-xs overflow-hidden"
                >
                  {/* Cover container with vinyl peek out effect */}
                  <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
                    <img
                      src={
                        artist.coverArtUrl ||
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={artist.releaseTitle}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Interactive Vinyl sleeve peek effect */}
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2 h-36 w-36 sm:h-44 sm:w-44 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all duration-500 ease-out pointer-events-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                      <VinylRecord direction="cw" className="h-full w-full" />
                    </div>

                    {/* Top badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
                        <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                        150+ plateformes
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-gold text-black shadow-sm">
                        {artist.plan === "album" ? "Album" : artist.plan === "ep" ? "EP" : "Single"}
                      </span>
                    </div>

                    {/* Play preview button */}
                    <button
                      onClick={() => togglePlay(artist.id)}
                      aria-label={isPlaying ? "Mettre en pause" : "Écouter l'extrait"}
                      className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-black shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200 z-10"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
                    </button>

                    {/* Bottom overlay info on image */}
                    <div className="absolute bottom-4 left-4 right-20 pointer-events-none">
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                        {artist.releaseGenre}
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white truncate drop-shadow-sm">
                        {artist.releaseTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-foreground truncate">
                          {artist.artistName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Globe2 className="h-3 w-3" />
                          {artist.artistCity}
                        </span>
                      </div>

                      {artist.artistBio && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {artist.artistBio}
                        </p>
                      )}

                      {track && (
                        <div className="mt-3.5 p-2.5 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <Disc3 className="h-3.5 w-3.5 text-primary shrink-0 animate-spin-vinyl" />
                            <span className="font-medium text-foreground truncate">{track.title}</span>
                          </div>
                          {track.duration && (
                            <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                              {track.duration}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer card links and distribution confirmation */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        100 % royalties reversées
                      </span>

                      {artist.social?.spotify ? (
                        <a
                          href={artist.social.spotify}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          Spotify <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <a
                          href="#tarifs"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          Distribuer <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom invitation banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 rounded-3xl border border-primary/30 bg-gradient-card p-8 sm:p-10 text-center relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-44 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative max-w-2xl mx-auto">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-black shadow-md mb-4">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Votre projet musical mérite d'être <span className="text-gradient-gold">entendu partout.</span>
            </h3>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Dès la validation de votre single, EP ou album par notre équipe, votre profil et vos morceaux rejoindront automatiquement cette vitrine officielle.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-gold text-black hover:opacity-90 font-semibold rounded-full px-7 h-11 text-sm shadow-md">
                <a href="#tarifs">Lancer ma sortie maintenant</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6 h-11 text-sm border-border bg-card/60">
                <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Parler à l'équipe sur WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
