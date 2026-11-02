'use client'

import React, { useState, useEffect, useRef } from "react";
import {
  Pencil, User, Mail, Phone, MapPin, Globe, Sparkles,
  Camera, Upload, Trash2, Loader2, Check, ExternalLink,
  Instagram, Youtube, Music, MessageCircle, AlertCircle, Disc3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface ArtistToEdit {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  city?: string | null;
  bio?: string | null;
  photo?: string | null;
  social?: Record<string, string>;
  releasesCount?: number;
}

export function EditArtistDialog({
  open,
  onClose,
  onSuccess,
  artist,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  artist: ArtistToEdit | null;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [spotify, setSpotify] = useState("");
  const [appleMusic, setAppleMusic] = useState("");

  // Sync state when artist changes
  useEffect(() => {
    if (artist) {
      setName(artist.name || "");
      setEmail(artist.email || "");
      setPhone(artist.phone || "");
      setWhatsapp(artist.whatsapp || "");
      setCity(artist.city || "Cotonou, Bénin");
      setBio(artist.bio || "");
      setPhoto(artist.photo || "");

      const soc = artist.social || {};
      setInstagram(soc.instagram || "");
      setTiktok(soc.tiktok || "");
      setYoutube(soc.youtube || "");
      setSpotify(soc.spotify || "");
      setAppleMusic(soc.appleMusic || soc.apple || "");
    }
  }, [artist, open]);

  if (!artist) return null;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format d'image non valide",
        description: "Veuillez choisir une photo au format JPG, PNG ou WEBP.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur upload");

      setPhoto(data.url);
      toast({
        title: "Photo mise à jour !",
        description: "La photo de l'artiste a été téléversée avec succès.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur téléversement",
        description: err?.message || "Impossible d'uploader la photo.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Champ requis", description: "Le nom d'artiste ne peut pas être vide.", variant: "destructive" });
      return;
    }
    if (!email.trim()) {
      toast({ title: "Champ requis", description: "L'adresse email est requise.", variant: "destructive" });
      return;
    }
    if (!phone.trim()) {
      toast({ title: "Champ requis", description: "Le numéro de téléphone est requis.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const socialLinksObj: Record<string, string> = {};
      if (instagram.trim()) socialLinksObj.instagram = instagram.trim();
      if (tiktok.trim()) socialLinksObj.tiktok = tiktok.trim();
      if (youtube.trim()) socialLinksObj.youtube = youtube.trim();
      if (spotify.trim()) socialLinksObj.spotify = spotify.trim();
      if (appleMusic.trim()) socialLinksObj.appleMusic = appleMusic.trim();

      const res = await fetch("/api/artists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: artist?.email,
          artistName: name.trim(),
          artistEmail: email.trim().toLowerCase(),
          artistPhone: phone.trim(),
          artistWhatsapp: whatsapp.trim() || null,
          artistCity: city.trim() || null,
          artistBio: bio.trim() || null,
          artistPhoto: photo.trim() || null,
          socialLinks: Object.keys(socialLinksObj).length > 0 ? JSON.stringify(socialLinksObj) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors de la modification");

      toast({
        title: "Artiste mis à jour avec succès !",
        description: data.message || `Les informations de ${name} ont été enregistrées.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Erreur de sauvegarde",
        description: err?.message || "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92dvh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-gold text-black shadow-md">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg sm:text-xl font-bold">
                Modifier l'artiste : <span className="text-primary">{artist.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Mettez à jour le profil officiel, les coordonnées et les réseaux sociaux.
                {artist.releasesCount ? ` ${artist.releasesCount} sortie(s) synchronisée(s).` : ""}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section 1 : Photo & Identité */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> Identité & Image de l'artiste
            </h3>

            {/* Photo Avatar Preview & Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-border/80 bg-secondary/15">
              <div className="relative group shrink-0 self-center sm:self-auto">
                {photo ? (
                  <img
                    src={photo}
                    alt={name || "Photo artiste"}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-primary/30 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-gold text-black font-display font-bold text-2xl flex items-center justify-center shadow-md">
                    {(name || artist.name).slice(0, 2).toUpperCase()}
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div className="text-sm font-semibold">Photo de profil / Presse</div>
                <p className="text-xs text-muted-foreground">
                  Format carré recommandé (JPG, PNG ou WEBP, min. 500x500px).
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingPhoto || saving}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 rounded-lg text-xs gap-1.5 hover:border-primary/50"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    <span>Téléverser une image</span>
                  </Button>
                  {photo && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setPhoto("")}
                      className="h-8 rounded-lg text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* URL manuelle de photo (optionnelle) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ou URL directe de l'image (optionnel)</Label>
              <Input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://domaine.com/photo-artiste.jpg"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Nom & Ville */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Nom de scène / Artiste <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Koffi, Ayodele..."
                  className="h-10 rounded-xl text-sm font-medium focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" /> Ville / Pays
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Cotonou, Bénin"
                  className="h-10 rounded-xl text-sm focus-visible:ring-primary/30"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Biographie / Présentation</Label>
              <Textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parcours musical, style, réalisations ou label de l'artiste..."
                className="rounded-xl text-xs resize-none focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {/* Section 2 : Coordonnées de contact */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" /> Coordonnées de contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Mail className="h-3 w-3 text-primary" /> Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artiste@gmail.com"
                  className="h-10 rounded-xl text-xs focus-visible:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground">
                  Identifiant de regroupement
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Phone className="h-3 w-3 text-primary" /> Téléphone <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 01 23 45 67"
                  className="h-10 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-[#25D366]" /> WhatsApp
                </Label>
                <Input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+229 01 23 45 67"
                  className="h-10 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Section 3 : Réseaux sociaux & Streaming */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> Liens Réseaux Sociaux &amp; Streaming
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram
                </Label>
                <Input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@nomartiste ou URL"
                  className="h-9 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <span className="font-bold text-[11px]">TK</span> TikTok
                </Label>
                <Input
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@nomartiste ou URL"
                  className="h-9 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Youtube className="h-3.5 w-3.5 text-red-500" /> YouTube
                </Label>
                <Input
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@chaine"
                  className="h-9 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 text-emerald-500" /> Spotify Artiste
                </Label>
                <Input
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                  className="h-9 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Disc3 className="h-3.5 w-3.5 text-rose-500" /> Apple Music Artiste
                </Label>
                <Input
                  value={appleMusic}
                  onChange={(e) => setAppleMusic(e.target.value)}
                  placeholder="https://music.apple.com/artist/..."
                  className="h-9 rounded-xl text-xs focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
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

