'use client'

import React, { useRef, useState } from "react";
import {
  Link2,
  Image as ImageIcon,
  Trash2,
  Upload,
  Music,
  Sparkles,
  Plus,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  UserPlus,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ==========================================
// 1. MANUEL COVER ART INPUT (SANS DRAG & DROP)
// ==========================================
export interface ManualCoverInputProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ManualCoverInput({ value, onChange, className }: ManualCoverInputProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format non valide",
        description: "Veuillez sélectionner une image (JPG, PNG ou WEBP).",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de téléversement");

      onChange(data.url);
      toast({
        title: "Pochette chargée !",
        description: `Image « ${file.name} » importée avec succès.`,
      });
    } catch (err: any) {
      console.warn("Upload via API failed, using base64 preview:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Pochette prête",
        description: "Image chargée localement.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" /> Pochette HD officielle
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Saisissez un lien direct (Drive, WeTransfer, Dropbox) ou sélectionnez une image locale.
          </p>
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Retirer</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* URL Input */}
        <div className="relative flex-1 w-full">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... (Lien Google Drive, Dropbox, WeTransfer ou URL directe)"
            className="pl-9 h-11 rounded-xl bg-background text-xs"
          />
        </div>

        {/* Local File Picker Button (No Drag and Drop) */}
        <div className="shrink-0 w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-11 w-full sm:w-auto rounded-xl px-4 text-xs font-semibold gap-2 border-border hover:border-primary/50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-primary" />
                <span>Choisir un fichier</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Visual Preview Card if Value Exists */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40 border border-border">
          <img
            src={value}
            alt="Aperçu pochette"
            className="h-14 w-14 rounded-lg object-cover border border-border shadow-xs shrink-0 bg-background"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5 truncate">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Pochette configurée</span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
              {value.startsWith("data:") ? "Fichier importé localement" : value}
            </div>
          </div>
          {value.startsWith("http") && (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0"
              title="Ouvrir le lien"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. MANUEL TRACKLIST INPUT (SANS DRAG & DROP)
// ==========================================
export type ManualTrackDraft = {
  id: string;
  title: string;
  isrc: string;
  audioUrl: string;
  featuredArtists: string;
  duration: string;
  explicit: boolean;
};

export interface ManualTracklistInputProps {
  tracks: ManualTrackDraft[];
  maxTracks: number;
  canAddTrack: boolean;
  onAddTrack: () => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrack: (id: string, patch: Partial<ManualTrackDraft>) => void;
  onAutoIsrc?: () => void;
  className?: string;
}

export function ManualTracklistInput({
  tracks,
  maxTracks,
  canAddTrack,
  onAddTrack,
  onRemoveTrack,
  onUpdateTrack,
  onAutoIsrc,
  className,
}: ManualTracklistInputProps) {
  const { toast } = useToast();
  const [uploadingTrackId, setUploadingTrackId] = useState<string | null>(null);

  async function handleAudioSelect(trackId: string, file: File) {
    setUploadingTrackId(trackId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de téléversement");

      // Auto-populate title if empty
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").trim();
      onUpdateTrack(trackId, {
        audioUrl: data.url,
      });
      toast({
        title: "Audio chargé !",
        description: `Fichier « ${file.name} » associé au morceau.`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur audio",
        description: err.message || "Impossible de charger le fichier.",
        variant: "destructive",
      });
    } finally {
      setUploadingTrackId(null);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Counter and Auto-ISRC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Music className="h-4 w-4 text-primary" /> Tracklist officielle ({tracks.length}/{maxTracks})
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Saisie manuelle des morceaux : titre, lien audio/master, featurings et code ISRC.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onAutoIsrc && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAutoIsrc}
              className="h-8 rounded-xl text-xs gap-1.5 hover:border-primary/40"
              title="Générer automatiquement des codes ISRC uniques conformes"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Générer ISRC</span>
            </Button>
          )}

          {canAddTrack && (
            <Button
              type="button"
              size="sm"
              onClick={onAddTrack}
              className="h-8 rounded-xl text-xs gap-1.5 bg-gradient-gold text-black hover:opacity-90 font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajouter un titre</span>
            </Button>
          )}
        </div>
      </div>

      {/* Track Cards */}
      <div className="space-y-3">
        {tracks.map((track, idx) => (
          <TrackItemCard
            key={track.id}
            index={idx + 1}
            track={track}
            canDelete={tracks.length > 1}
            isUploading={uploadingTrackId === track.id}
            onUpdate={(patch) => onUpdateTrack(track.id, patch)}
            onRemove={() => onRemoveTrack(track.id)}
            onSelectAudio={(file) => handleAudioSelect(track.id, file)}
          />
        ))}
      </div>

      {canAddTrack && (
        <button
          type="button"
          onClick={onAddTrack}
          className="w-full py-3.5 rounded-2xl border border-dashed border-border bg-card/40 hover:border-primary/40 hover:bg-card transition-all flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span>Ajouter une nouvelle piste ({tracks.length + 1}/{maxTracks})</span>
        </button>
      )}
    </div>
  );
}

function TrackItemCard({
  index,
  track,
  canDelete,
  isUploading,
  onUpdate,
  onRemove,
  onSelectAudio,
}: {
  index: number;
  track: ManualTrackDraft;
  canDelete: boolean;
  isUploading: boolean;
  onUpdate: (patch: Partial<ManualTrackDraft>) => void;
  onRemove: () => void;
  onSelectAudio: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3 hover:border-border/80 transition-all">
      {/* Track Header: Position, Title, Explicit, Delete */}
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary font-mono text-xs font-bold border border-border">
          {index}
        </span>

        <div className="flex-1 min-w-0">
          <Input
            required
            value={track.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={`Titre du morceau ${index} *`}
            className="h-10 rounded-xl bg-background font-semibold text-sm"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="hidden sm:flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
            <Checkbox
              checked={track.explicit}
              onCheckedChange={(v) => onUpdate({ explicit: Boolean(v) })}
            />
            <span className="text-[11px] font-medium">Explicit</span>
          </label>

          {canDelete && (
            <button
              type="button"
              onClick={onRemove}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Supprimer cette piste"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Track Details: Audio URL/File, Feat, ISRC, Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-border/50 text-xs">
        {/* Audio URL or Cloud Link */}
        <div className="sm:col-span-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Link2 className="h-3 w-3 text-primary" /> Fichier audio / Lien master
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/flac,audio/mp3"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSelectAudio(f);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-[10px] text-primary hover:underline flex items-center gap-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Chargement...
                </>
              ) : (
                <>
                  <Upload className="h-2.5 w-2.5" /> Fichier local
                </>
              )}
            </button>
          </div>
          <Input
            value={track.audioUrl}
            onChange={(e) => onUpdate({ audioUrl: e.target.value })}
            placeholder="Lien Google Drive, Dropbox, WeTransfer ou URL .wav/.mp3"
            className="h-9 rounded-lg bg-background text-xs"
          />
        </div>

        {/* Featured Artists */}
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <UserPlus className="h-3 w-3 text-primary" /> Feat. (Invités)
          </span>
          <Input
            value={track.featuredArtists}
            onChange={(e) => onUpdate({ featuredArtists: e.target.value })}
            placeholder="Ex : Aura Kpèdji"
            className="h-9 rounded-lg bg-background text-xs"
          />
        </div>

        {/* ISRC Code */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Hash className="h-3 w-3 text-primary" /> Code ISRC
            </span>
            <button
              type="button"
              onClick={() => {
                const year = new Date().getFullYear().toString().slice(-2);
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                onUpdate({ isrc: `BJ-MRK-${year}-${randomNum}` });
              }}
              className="text-[10px] text-primary hover:underline"
              title="Générer un code ISRC"
            >
              Générer
            </button>
          </div>
          <Input
            value={track.isrc}
            onChange={(e) => onUpdate({ isrc: e.target.value })}
            placeholder="BJ-MRK-26-XXXXX"
            className="h-9 rounded-lg bg-background font-mono text-xs"
          />
        </div>
      </div>

      {/* Mobile-only explicit checkbox & duration */}
      <div className="flex sm:hidden items-center justify-between pt-1">
        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
          <Checkbox
            checked={track.explicit}
            onCheckedChange={(v) => onUpdate({ explicit: Boolean(v) })}
          />
          <span className="text-xs font-medium">Contenu explicite</span>
        </label>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <Input
            value={track.duration}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="3:45"
            className="h-7 w-20 rounded-lg bg-background font-mono text-xs text-center p-0"
          />
        </div>
      </div>
    </div>
  );
}
