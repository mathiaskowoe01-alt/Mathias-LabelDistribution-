'use client'

import { useState, useMemo } from "react";
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
  User, Calendar, CreditCard, Send, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  ManualCoverInput,
  ManualTracklistInput,
  type ManualTrackDraft,
} from "@/components/shared/manual-media-inputs";

export type PlanId = "single" | "ep" | "album";

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
  { id: "mobile_money", label: "Mobile Money (MTN / Moov)", desc: "Paiement instantané par mobile money" },
  { id: "card", label: "Carte bancaire", desc: "Visa / Mastercard via plateforme sécurisée" },
  { id: "bank", label: "Virement bancaire", desc: "Virement direct sur notre compte" },
  { id: "whatsapp", label: "WhatsApp (organisation manuelle)", desc: "On organise le paiement ensemble" },
];
const STEPS = ["Plan", "Artiste", "Projet", "Titres", "Paiement", "Confirmation"];

function uid() { return Math.random().toString(36).slice(2, 10); }

export function PlanSubmissionDialog({ open, planId, onClose }: { open: boolean; planId: PlanId | null; onClose: () => void }) {
  const plan = planId ? PLANS[planId] : null;
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [artist, setArtist] = useState({ name: "", email: "", phone: "", whatsapp: "", city: "", bio: "", instagram: "", tiktok: "", youtube: "", spotify: "" });
  const [release, setRelease] = useState({ title: "", genre: "", language: "", releaseDate: "", coverArtUrl: "", explicit: false });
  const [tracks, setTracks] = useState<ManualTrackDraft[]>([{ id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
  const [paymentMethod, setPaymentMethod] = useState<string>("mobile_money");

  function resetAll() {
    setStep(0);
    setArtist({ name: "", email: "", phone: "", whatsapp: "", city: "", bio: "", instagram: "", tiktok: "", youtube: "", spotify: "" });
    setRelease({ title: "", genre: "", language: "", releaseDate: "", coverArtUrl: "", explicit: false });
    setTracks([{ id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
    setPaymentMethod("mobile_money");
  }

  function handleClose() { resetAll(); onClose(); }

  const canAddTrack = plan ? tracks.length < plan.maxTracks : false;

  function addTrack() {
    if (!canAddTrack) return;
    setTracks((prev) => [...prev, { id: uid(), title: "", isrc: "", audioUrl: "", featuredArtists: "", duration: "", explicit: false }]);
  }
  function removeTrack(id: string) { if (tracks.length <= 1) return; setTracks((prev) => prev.filter((t) => t.id !== id)); }
  function updateTrack(id: string, patch: Partial<ManualTrackDraft>) { setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))); }

  const stepValid = useMemo(() => {
    if (!plan) return false;
    if (step === 0) return true;
    if (step === 1) return artist.name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(artist.email) && artist.phone.trim().length >= 6;
    if (step === 2) return release.title.trim().length > 0 && release.genre.trim().length > 0;
    if (step === 3) return tracks.every((t) => t.title.trim().length > 0);
    if (step === 4) return Boolean(paymentMethod);
    return true;
  }, [step, artist, release, tracks, paymentMethod, plan]);

  async function submit() {
    if (!plan) return;
    setSubmitting(true);
    try {
      const payload = {
        plan: plan.id,
        artistName: artist.name, artistEmail: artist.email, artistPhone: artist.phone,
        artistWhatsapp: artist.whatsapp, artistBio: artist.bio, artistCity: artist.city,
        socialLinks: { instagram: artist.instagram, tiktok: artist.tiktok, youtube: artist.youtube, spotify: artist.spotify },
        releaseTitle: release.title, releaseGenre: release.genre, releaseLanguage: release.language,
        releaseDate: release.releaseDate, coverArtUrl: release.coverArtUrl, explicit: release.explicit,
        paymentMethod,
        tracks: tracks.map((t, i) => ({ position: i + 1, title: t.title, isrc: t.isrc || null, audioUrl: t.audioUrl || null, featuredArtists: t.featuredArtists || null, duration: t.duration || null, explicit: t.explicit })),
      };
      const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");

      const waText = buildWhatsAppMessage(plan, artist, release, tracks, paymentMethod);
      const waUrl = `https://wa.me/2250157307677?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
      toast({ title: "Soumission envoyée", description: "Nous avons bien reçu votre demande. WhatsApp s'ouvre avec votre récapitulatif." });
      handleClose();
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "La soumission a échoué. Réessayez ou contactez-nous sur WhatsApp.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <DialogHeader className="space-y-1 mb-3">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                {plan.id === "single" && <Music className="h-5 w-5 text-primary" />}
                {plan.id === "ep" && <Disc3 className="h-5 w-5 text-primary" />}
                {plan.id === "album" && <AlbumIcon className="h-5 w-5 text-primary" />}
                Plan — {plan.name}
              </DialogTitle>
              <span className="font-display text-lg font-bold text-gradient-gold">{plan.price.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <DialogDescription className="text-xs">Étape {step + 1} sur {STEPS.length} — {STEPS[step]}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => i < step && setStep(i)} disabled={i > step} className={cn("flex-1 h-1.5 rounded-full transition-colors", i < step && "bg-primary", i === step && "bg-gradient-gold", i > step && "bg-secondary")} aria-label={s} />
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Récapitulatif du plan</h3>
                <p className="mt-1 text-sm text-muted-foreground">Vérifiez les éléments inclus dans le plan <strong>{plan.name}</strong> avant de continuer.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15"><Check className="h-3 w-3 text-primary" strokeWidth={3} /></span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prix (paiement unique)</span>
                  <span className="font-display text-2xl font-bold text-gradient-gold">{plan.price.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"><span className="font-semibold text-primary">À noter :</span> vous allez fournir les informations de l'artiste, du projet et des titres (jusqu'à {plan.maxTracks} titre{plan.maxTracks > 1 ? "s" : ""}).</div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary" />Informations sur l'artiste</h3>
                <p className="mt-1 text-sm text-muted-foreground">Renseignez les coordonnées de l'artiste et un minimum de présence en ligne.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="a-name">Nom d'artiste *</Label><Input id="a-name" value={artist.name} onChange={(e) => setArtist({ ...artist, name: e.target.value })} placeholder="Ex : Mïko Sun" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-email">Email *</Label><Input id="a-email" type="email" value={artist.email} onChange={(e) => setArtist({ ...artist, email: e.target.value })} placeholder="artiste@email.com" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-phone">Téléphone *</Label><Input id="a-phone" value={artist.phone} onChange={(e) => setArtist({ ...artist, phone: e.target.value })} placeholder="+229 00 00 00 00" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-wa">WhatsApp</Label><Input id="a-wa" value={artist.whatsapp} onChange={(e) => setArtist({ ...artist, whatsapp: e.target.value })} placeholder="Si différent du téléphone" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-city">Ville / Pays</Label><Input id="a-city" value={artist.city} onChange={(e) => setArtist({ ...artist, city: e.target.value })} placeholder="Cotonou, Bénin" className="h-11" /></div>
                <div className="space-y-2 sm:col-span-1"><Label htmlFor="a-spotify">Spotify (URL artiste)</Label><Input id="a-spotify" value={artist.spotify} onChange={(e) => setArtist({ ...artist, spotify: e.target.value })} placeholder="https://open.spotify.com/artist/..." className="h-11" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="a-bio">Bio courte (max 500 caractères)</Label><Textarea id="a-bio" value={artist.bio} onChange={(e) => setArtist({ ...artist, bio: e.target.value })} rows={3} maxLength={500} placeholder="Décrivez l'artiste en quelques lignes..." className="resize-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="a-ig">Instagram</Label><Input id="a-ig" value={artist.instagram} onChange={(e) => setArtist({ ...artist, instagram: e.target.value })} placeholder="@artiste" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-tt">TikTok</Label><Input id="a-tt" value={artist.tiktok} onChange={(e) => setArtist({ ...artist, tiktok: e.target.value })} placeholder="@artiste" className="h-11" /></div>
                <div className="space-y-2"><Label htmlFor="a-yt">YouTube</Label><Input id="a-yt" value={artist.youtube} onChange={(e) => setArtist({ ...artist, youtube: e.target.value })} placeholder="Canal YouTube" className="h-11" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Informations sur le projet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Donnez-nous les infos de la sortie : titre, genre, langue, date prévue.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="r-title">Titre du projet *</Label><Input id="r-title" value={release.title} onChange={(e) => setRelease({ ...release, title: e.target.value })} placeholder="Ex : Cotonou Nights (Single) / Soleil Levant (EP) / Renaissance (Album)" className="h-11" /></div>
                <div className="space-y-2">
                  <Label htmlFor="r-genre">Genre principal *</Label>
                  <Select value={release.genre} onValueChange={(v) => setRelease({ ...release, genre: v })}>
                    <SelectTrigger id="r-genre" className="h-11"><SelectValue placeholder="Choisir un genre" /></SelectTrigger>
                    <SelectContent>{GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-lang">Langue principale</Label>
                  <Select value={release.language} onValueChange={(v) => setRelease({ ...release, language: v })}>
                    <SelectTrigger id="r-lang" className="h-11"><SelectValue placeholder="Choisir une langue" /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="r-date">Date de sortie souhaitée</Label><Input id="r-date" type="date" value={release.releaseDate} onChange={(e) => setRelease({ ...release, releaseDate: e.target.value })} className="h-11" /></div>
                <div className="sm:col-span-2">
                  <ManualCoverInput
                    value={release.coverArtUrl}
                    onChange={(url) => setRelease({ ...release, coverArtUrl: url })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30">
                <Checkbox checked={release.explicit} onCheckedChange={(v) => setRelease({ ...release, explicit: Boolean(v) })} />
                <div>
                  <div className="text-sm font-medium">Contenu explicite (Explicit)</div>
                  <div className="text-xs text-muted-foreground">Cochez si le projet contient des paroles explicites (langage, thèmes).</div>
                </div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <ManualTracklistInput
                tracks={tracks}
                maxTracks={plan.maxTracks}
                canAddTrack={canAddTrack}
                onAddTrack={addTrack}
                onRemoveTrack={removeTrack}
                onUpdateTrack={updateTrack}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" />Mode de paiement</h3>
                <p className="mt-1 text-sm text-muted-foreground">Choisissez comment vous souhaitez régler le montant de <strong>{plan.price.toLocaleString("fr-FR")} FCFA</strong>.</p>
              </div>
              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={cn("w-full text-left rounded-2xl border p-4 transition-all", paymentMethod === m.id ? "border-primary bg-primary/5 glow-gold" : "border-border bg-card hover:border-primary/40")}>
                    <div className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", paymentMethod === m.id ? "border-primary bg-primary" : "border-muted-foreground")}>
                        {paymentMethod === m.id && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{m.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">Le paiement se finalise après la soumission. Sur WhatsApp, notre équipe vous enverra les instructions selon le mode choisi.</div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Confirmation</h3>
                <p className="mt-1 text-sm text-muted-foreground">Vérifiez le récapitulatif et envoyez. Votre demande sera enregistrée et WhatsApp s'ouvrira avec le message pré-rempli.</p>
              </div>
              {release.coverArtUrl && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card">
                  <img
                    src={release.coverArtUrl}
                    alt="Pochette"
                    className="h-16 w-16 rounded-lg object-cover border border-border shadow-xs shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-semibold text-sm truncate">{release.title}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Pochette attachée avec succès
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                <SummaryRow label="Plan" value={`${plan.name} · ${plan.price.toLocaleString("fr-FR")} FCFA`} />
                <SummaryRow label="Artiste" value={artist.name} />
                <SummaryRow label="Email" value={artist.email} />
                <SummaryRow label="Téléphone" value={artist.phone} />
                <SummaryRow label="Projet" value={release.title} />
                <SummaryRow label="Genre" value={release.genre} />
                <SummaryRow label="Langue" value={release.language || "—"} />
                <SummaryRow label="Date de sortie" value={release.releaseDate || "À définir"} />
                <SummaryRow label="Nb de titres" value={`${tracks.length} / ${plan.maxTracks}`} />
                <SummaryRow label="Audio" value={tracks.filter(t => t.audioUrl).length > 0 ? `${tracks.filter(t => t.audioUrl).length} fichier(s) joint(s)` : "À transmettre"} />
                <SummaryRow label="Contenu explicite" value={release.explicit ? "Oui" : "Non"} />
                <SummaryRow label="Paiement" value={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod} last />
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">En cliquant sur <strong>« Envoyer la soumission »</strong>, vous acceptez que vos informations soient transmises à l'équipe MR - K Distribution pour le traitement de votre sortie.</div>
            </div>
          )}

          <div className="mt-7 pt-5 border-t border-border flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))} className="rounded-full" disabled={submitting}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />{step === 0 ? "Annuler" : "Précédent"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid} className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold px-6">Continuer <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
            ) : (
              <Button onClick={submit} disabled={submitting || !stepValid} className="rounded-full bg-gradient-gold text-black hover:opacity-90 font-semibold px-6">
                {submitting ? (<><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Envoi...</>) : (<><Send className="h-4 w-4 mr-1.5" /> Envoyer la soumission</>)}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 py-3", last && "rounded-b-2xl")}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function buildWhatsAppMessage(plan: Plan, artist: { name: string; email: string; phone: string; whatsapp: string; city: string }, release: { title: string; genre: string; language: string; releaseDate: string; explicit: boolean; coverArtUrl?: string }, tracks: TrackDraft[], paymentMethod: string): string {
  const lines: string[] = [];
  lines.push(`🎵 *NOUVELLE SOUMISSION — MR - K*`);
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
  if (release.releaseDate) lines.push(`*Date :* ${release.releaseDate}`);
  if (release.coverArtUrl) lines.push(`*Pochette :* Fichier téléversé ✓`);
  lines.push(`*Explicit :* ${release.explicit ? "Oui" : "Non"}`);
  lines.push("");
  const audioCount = tracks.filter((t) => t.audioUrl).length;
  lines.push(`*Titres (${tracks.length}/${plan.maxTracks}) ${audioCount > 0 ? `[${audioCount} audio(s) joint(s)]` : ""} :*`);
  tracks.forEach((t, i) => {
    const hasAudio = t.audioUrl ? " 🎵" : "";
    lines.push(`  ${i + 1}. ${t.title}${t.featuredArtists ? ` (${t.featuredArtists})` : ""}${t.duration ? ` · ${t.duration}` : ""}${hasAudio}`);
  });
  lines.push("");
  lines.push(`*Paiement :* ${paymentMethod}`);
  lines.push("");
  lines.push(`Merci de me confirmer la suite. 🙏`);
  return lines.join("\n");
}
