'use client'

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Music,
  UploadCloud,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Loader2,
  Link2,
  FileAudio,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type TrackDraft = {
  id: string;
  title: string;
  isrc: string;
  audioUrl: string;
  featuredArtists: string;
  duration: string;
  explicit: boolean;
  fileName?: string;
  fileSize?: string;
  uploading?: boolean;
};

interface DragDropTracksProps {
  tracks: TrackDraft[];
  setTracks: React.Dispatch<React.SetStateAction<TrackDraft[]>>;
  maxTracks: number;
  canAddTrack: boolean;
  onAddTrack: () => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrack: (id: string, patch: Partial<TrackDraft>) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 Ko";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + ["Octets", "Ko", "Mo", "Go"][i];
}

function cleanFilename(raw: string): { title: string; feat?: string } {
  // Strip extension
  let base = raw.replace(/\.[^/.]+$/, "");
  // Strip leading track numbers like "01 - ", "1.", "02_"
  base = base.replace(/^(\d+[\s._-]+)+/, "");
  // Replace underscores with spaces
  base = base.replace(/_/g, " ").trim();

  // Check for feat/ft
  const featMatch = base.match(/(?:\(|\[)?\s*(?:feat\.?|ft\.?)\s+([^\])]+)(?:\)|\])?/i);
  let feat: string | undefined;
  if (featMatch) {
    feat = featMatch[1].trim();
    base = base.replace(featMatch[0], "").trim();
  }

  return { title: base || raw, feat };
}

/** Helper to extract audio duration client-side */
function getAudioDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = url;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(formatDuration(audio.duration));
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("");
      };
    } catch {
      resolve("");
    }
  });
}

export function DragDropTracks({
  tracks,
  setTracks,
  maxTracks,
  canAddTrack,
  onAddTrack,
  onRemoveTrack,
  onUpdateTrack,
}: DragDropTracksProps) {
  const { toast } = useToast();
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [isBulkDragging, setIsBulkDragging] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [activeAudio, setActiveAudio] = useState<{ id: string; playing: boolean } | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking inputs
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTracks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Audio Playback
  function togglePlayTrack(id: string, url: string) {
    if (!url) return;

    if (activeAudio?.id === id && activeAudio.playing) {
      audioPlayerRef.current?.pause();
      setActiveAudio({ id, playing: false });
      return;
    }

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.onended = () => setActiveAudio(null);
    }

    audioPlayerRef.current.src = url;
    audioPlayerRef.current.play().catch((err) => {
      console.warn("Audio play error", err);
    });
    setActiveAudio({ id, playing: true });
  }

  // Upload single audio file
  async function uploadAudioFile(file: File): Promise<{ url: string; size: string; duration: string }> {
    const duration = await getAudioDuration(file);
    const size = formatBytes(file.size);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur de téléversement");
    }

    const data = await res.json();
    return { url: data.url, size, duration };
  }

  // Handle Bulk Drop
  async function handleBulkFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(f.name)
    );

    if (files.length === 0) {
      toast({
        title: "Aucun fichier audio détecté",
        description: "Veuillez déposer des fichiers MP3, WAV, FLAC ou M4A.",
        variant: "destructive",
      });
      return;
    }

    const availableSlots = maxTracks;
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast({
        title: "Limite du plan atteinte",
        description: `Ce plan accepte jusqu'à ${maxTracks} titre(s). Les ${filesToProcess.length} premiers fichiers ont été sélectionnés.`,
      });
    }

    setIsBulkUploading(true);

    try {
      const newTracksList: TrackDraft[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const { title, feat } = cleanFilename(file.name);
        const trackId = uid();

        // Temporary draft to show immediate feedback
        const draft: TrackDraft = {
          id: trackId,
          title,
          isrc: "",
          audioUrl: "",
          featuredArtists: feat || "",
          duration: "",
          explicit: false,
          fileName: file.name,
          uploading: true,
        };

        newTracksList.push(draft);
      }

      // Replace or append according to current state
      setTracks((prev) => {
        // If current tracks have only 1 empty track, replace it
        if (prev.length === 1 && !prev[0].title.trim() && !prev[0].audioUrl) {
          return newTracksList;
        }
        // Otherwise append up to maxTracks
        const combined = [...prev, ...newTracksList].slice(0, maxTracks);
        return combined;
      });

      // Upload files sequentially or in small parallel batches
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const trackId = newTracksList[i].id;
        try {
          const { url, size, duration } = await uploadAudioFile(file);
          onUpdateTrack(trackId, {
            audioUrl: url,
            fileSize: size,
            duration: duration,
            uploading: false,
          });
        } catch (err: any) {
          console.error("Bulk upload error for file", file.name, err);
          onUpdateTrack(trackId, { uploading: false });
          toast({
            title: `Échec pour ${file.name}`,
            description: err?.message || "Erreur de téléversement",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Morceaux importés !",
        description: `${filesToProcess.length} fichier(s) audio ajouté(s) à votre sortie.`,
      });
    } finally {
      setIsBulkUploading(false);
      if (bulkInputRef.current) bulkInputRef.current.value = "";
    }
  }

  function onBulkDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsBulkDragging(true);
  }

  function onBulkDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsBulkDragging(false);
  }

  function onBulkDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsBulkDragging(false);
    if (e.dataTransfer.files) {
      handleBulkFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-5">
      {/* Bulk Dropzone */}
      <input
        ref={bulkInputRef}
        type="file"
        multiple
        accept="audio/mpeg,audio/wav,audio/flac,audio/aac,audio/m4a,audio/x-wav"
        className="hidden"
        onChange={(e) => e.target.files && handleBulkFiles(e.target.files)}
      />

      <div
        onDragOver={onBulkDragOver}
        onDragLeave={onBulkDragLeave}
        onDrop={onBulkDrop}
        onClick={() => bulkInputRef.current?.click()}
        className={cn(
          "group relative border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-300",
          "bg-card/40 hover:bg-card/70 hover:border-primary/50",
          isBulkDragging
            ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/15 glow-gold"
            : "border-border"
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
              isBulkDragging
                ? "bg-gradient-gold text-black scale-110 shadow-md"
                : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary/25"
            )}
          >
            {isBulkUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6 transition-transform group-hover:-translate-y-0.5" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-foreground">
              {isBulkDragging
                ? "Déposez vos morceaux audio ici !"
                : "Glissez vos fichiers audio ici (dépôt multiple)"}
            </p>
            <p className="text-xs text-muted-foreground">
              ou <span className="text-primary underline font-medium">parcourez vos fichiers</span> • MP3, WAV, FLAC, M4A
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border">
            <Sparkles className="h-3 w-3 text-primary" />
            Détection automatique du titre, des featurings et de la durée
          </div>
        </div>
      </div>

      {/* Track list header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Music className="h-4 w-4 text-primary" />
            Tracklist ({tracks.length}/{maxTracks})
          </Label>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            • Glissez la poignée ⠿ pour réordonner les morceaux
          </span>
        </div>
        {canAddTrack && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTrack}
            className="h-8 text-xs rounded-full"
          >
            + Ajouter manuellement
          </Button>
        )}
      </div>

      {/* Sortable Track list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tracks.map((t, index) => (
              <SortableTrackCard
                key={t.id}
                track={t}
                index={index}
                total={tracks.length}
                isPlaying={activeAudio?.id === t.id && activeAudio.playing}
                onTogglePlay={() => togglePlayTrack(t.id, t.audioUrl)}
                onRemove={() => onRemoveTrack(t.id)}
                onUpdate={(patch) => onUpdateTrack(t.id, patch)}
                onUploadSingle={uploadAudioFile}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canAddTrack && (
        <Button
          type="button"
          variant="outline"
          onClick={onAddTrack}
          className="w-full h-11 rounded-xl border-dashed hover:border-primary/50 text-xs sm:text-sm"
        >
          + Ajouter un autre titre ({tracks.length}/{maxTracks})
        </Button>
      )}
    </div>
  );
}

interface SortableTrackCardProps {
  track: TrackDraft;
  index: number;
  total: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<TrackDraft>) => void;
  onUploadSingle: (file: File) => Promise<{ url: string; size: string; duration: string }>;
}

function SortableTrackCard({
  track,
  index,
  total,
  isPlaying,
  onTogglePlay,
  onRemove,
  onUpdate,
  onUploadSingle,
}: SortableTrackCardProps) {
  const { toast } = useToast();
  const singleFileRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [isSingleDragging, setIsSingleDragging] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.75 : 1,
  };

  async function handleSingleFile(file: File) {
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name)) {
      toast({
        title: "Format non valide",
        description: "Veuillez choisir un fichier audio (WAV, MP3, FLAC).",
        variant: "destructive",
      });
      return;
    }

    onUpdate({ uploading: true, fileName: file.name });
    try {
      const { url, size, duration } = await onUploadSingle(file);
      const { title, feat } = cleanFilename(file.name);
      onUpdate({
        title: track.title || title,
        featuredArtists: track.featuredArtists || feat || "",
        audioUrl: url,
        fileSize: size,
        duration: duration || track.duration,
        uploading: false,
      });
      toast({
        title: "Audio attaché",
        description: `« ${file.name} » assigné au titre #${index + 1}.`,
      });
    } catch (err: any) {
      onUpdate({ uploading: false });
      toast({
        title: "Erreur téléversement",
        description: err?.message || "Impossible d'envoyer l'audio.",
        variant: "destructive",
      });
    }
  }

  function onTrackDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsSingleDragging(true);
  }

  function onTrackDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsSingleDragging(false);
  }

  function onTrackDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsSingleDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSingleFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border bg-card p-4 transition-all duration-200",
        isDragging
          ? "border-primary shadow-xl shadow-primary/20 glow-gold scale-[1.02]"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Hidden file input for this track */}
      <input
        ref={singleFileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files && handleSingleFile(e.target.files[0])}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border/70">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground rounded transition-colors touch-none"
            title="Glisser pour réordonner"
            aria-label="Réordonner ce titre"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-gold text-black font-display font-bold text-xs">
            {index + 1}
          </span>
          <span className="font-semibold text-sm">
            {track.title ? track.title : `Titre #${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden sm:inline">Retirer</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio Drop Area / Mini Player */}
      <div
        onDragOver={onTrackDragOver}
        onDragLeave={onTrackDragLeave}
        onDrop={onTrackDrop}
        className={cn(
          "mb-3 rounded-xl border p-2.5 transition-all text-xs",
          isSingleDragging
            ? "border-primary bg-primary/10 glow-gold"
            : track.audioUrl
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-dashed border-border bg-secondary/30 hover:bg-secondary/50"
        )}
      >
        {track.uploading ? (
          <div className="flex items-center justify-center gap-2 py-1 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Téléversement du fichier en cours...</span>
          </div>
        ) : track.audioUrl ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={onTogglePlay}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:scale-105 transition-transform"
                title={isPlaying ? "Mettre en pause" : "Écouter l'extrait"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                  <FileAudio className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{track.fileName || "Fichier audio prêt"}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {track.duration && <span>{track.duration}</span>}
                  {track.fileSize && <span>• {track.fileSize}</span>}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3 inline" /> Associé
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => singleFileRef.current?.click()}
                className="h-7 text-[11px] px-2 rounded"
              >
                Changer
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ audioUrl: "", fileName: "", fileSize: "" })}
                className="h-7 text-[11px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded"
              >
                Détacher
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => singleFileRef.current?.click()}
            className="flex items-center justify-between py-1 px-1 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileAudio className="h-4 w-4 text-primary" />
              <span>
                {isSingleDragging
                  ? "Déposez le fichier audio ici !"
                  : "Glissez le fichier audio de ce morceau ici (ou cliquez)"}
              </span>
            </div>
            <span className="text-[11px] text-primary font-medium underline">
              Choisir un fichier
            </span>
          </div>
        )}
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`t-${track.id}-title`} className="text-xs">
            Titre du morceau *
          </Label>
          <Input
            id={`t-${track.id}-title`}
            value={track.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ex : Cotonou Nights"
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`t-${track.id}-dur`} className="text-xs">
            Durée (auto ou manuelle)
          </Label>
          <Input
            id={`t-${track.id}-dur`}
            value={track.duration}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="3:45"
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`t-${track.id}-isrc`} className="text-xs">
            ISRC (laisser vide si nouveau)
          </Label>
          <Input
            id={`t-${track.id}-isrc`}
            value={track.isrc}
            onChange={(e) => onUpdate({ isrc: e.target.value })}
            placeholder="BJXXX2400001"
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`t-${track.id}-feat`} className="text-xs">
            Artistes invités (featurings)
          </Label>
          <Input
            id={`t-${track.id}-feat`}
            value={track.featuredArtists}
            onChange={(e) => onUpdate({ featuredArtists: e.target.value })}
            placeholder="Ex : feat. Nadia K."
            className="h-10 text-sm"
          />
        </div>

        {/* Link input toggle if audio file not dragged */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`t-${track.id}-url`} className="text-xs text-muted-foreground">
              Lien audio externe (optionnel si non téléversé)
            </Label>
            <button
              type="button"
              onClick={() => setShowUrl(!showUrl)}
              className="text-[11px] text-primary hover:underline"
            >
              {showUrl ? "Masquer le champ lien" : "Ajouter lien Drive / Dropbox"}
            </button>
          </div>
          {showUrl && (
            <Input
              id={`t-${track.id}-url`}
              value={track.audioUrl}
              onChange={(e) => onUpdate({ audioUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="h-9 text-xs"
            />
          )}
        </div>

        <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer pt-1">
          <Checkbox
            checked={track.explicit}
            onCheckedChange={(v) => onUpdate({ explicit: Boolean(v) })}
          />
          <span className="text-xs text-muted-foreground">
            Contenu explicite sur ce titre (paroles explicites)
          </span>
        </label>
      </div>
    </div>
  );
}
