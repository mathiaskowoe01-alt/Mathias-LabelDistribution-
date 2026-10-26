'use client'

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertTriangle, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DragDropCoverProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function DragDropCover({ value, onChange, className }: DragDropCoverProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [meta, setMeta] = useState<{ name?: string; size?: string; width?: number; height?: number } | null>(null);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Ko";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + ["Octets", "Ko", "Mo", "Go"][i];
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format non valide",
        description: "Veuillez glisser une image valide (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    // Inspect dimensions client-side
    const localUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = localUrl;
    img.onload = () => {
      setMeta({
        name: file.name,
        size: formatBytes(file.size),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(50);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de téléversement");
      }

      onChange(data.url);
      setUploadProgress(100);
      toast({
        title: "Pochette chargée !",
        description: `« ${file.name} » a été téléversée avec succès.`,
      });
    } catch (err: any) {
      console.warn("Upload via API failed, using base64 preview:", err);
      // Fallback to data URL if local disk write fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange(dataUrl);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Pochette prête",
        description: "Image chargée localement.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }

  function handleRemove() {
    onChange("");
    setMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isSquare = meta?.width && meta?.height ? Math.abs(meta.width - meta.height) < 10 : true;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-primary" />
          Pochette du projet (Cover Art) *
        </Label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Link2 className="h-3 w-3" />
          {showUrlInput ? "Glisser-déposer une image" : "Ou lien externe"}
        </button>
      </div>

      {showUrlInput ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://exemple.com/pochette.jpg"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Lien direct vers votre image (Google Drive, Dropbox, hébergement externe).
          </p>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />

          {!value ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300",
                "bg-card/40 hover:bg-card/70 hover:border-primary/50",
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/15 glow-gold"
                  : "border-border"
              )}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
                    isDragging
                      ? "bg-gradient-gold text-black scale-110 shadow-md"
                      : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary/25"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (
                    <UploadCloud className="h-7 w-7 transition-transform group-hover:-translate-y-0.5" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-display text-sm font-semibold text-foreground">
                    {isDragging ? "Déposez votre pochette ici !" : "Glissez & déposez la pochette ici"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou <span className="text-primary underline font-medium">parcourez vos fichiers</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    Format carré 3000 × 3000 px
                  </span>
                  <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    JPG, PNG, WEBP • Max 15 Mo
                  </span>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-x-4 bottom-3">
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-gold transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl border border-border bg-card p-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative h-28 w-28 shrink-0 rounded-xl overflow-hidden border border-border/80 shadow-md bg-secondary/50">
                  <img
                    src={value}
                    alt="Pochette du projet"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-black/80 text-white px-2.5 py-1 rounded-full font-medium shadow"
                    >
                      Changer
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="font-display font-semibold text-sm truncate max-w-[220px]">
                      {meta?.name || "Pochette prête"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Téléversée
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                    {meta?.size && <span>Taille : {meta.size}</span>}
                    {meta?.width && meta?.height && (
                      <span>
                        Dimensions : {meta.width} × {meta.height} px
                      </span>
                    )}
                  </div>

                  {!isSquare && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Attention : les plateformes (Spotify, Apple Music) exigent une image carrée (ratio 1:1).
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs rounded-lg"
                    >
                      Changer de fichier
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
