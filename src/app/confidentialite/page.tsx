import type { Metadata } from "next";
import { SubpageHeader } from "@/components/site/subpage-header";
import { Footer } from "@/components/site/footer";
import { Lock, Eye, Database, UserCheck, Trash2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — MR - K Distribution",
  description: "Protection des données personnelles et respect de la vie privée chez MR - K Distribution.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SubpageHeader title="Politique de Confidentialité" />

      <main className="flex-1 py-12 sm:py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Vie Privée & Données
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Politique de <span className="text-gradient-gold">Confidentialité</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Chez MR - K Distribution, la confiance des artistes est fondamentale. Nous protégeons rigoureusement vos données et vos créations.
            </p>
          </div>

          <div className="space-y-8 text-foreground/90 leading-relaxed">
            {/* 1. Données collectées */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Database className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">1. Données collectées</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Dans le cadre de l'enregistrement et de la distribution de vos œuvres musicales, nous recueillons uniquement les informations indispensables :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li><strong>Identité de l'artiste :</strong> Nom d'artiste, nom civil (le cas échéant), biographie, ville et pays de résidence.</li>
                <li><strong>Coordonnées de contact :</strong> Adresse email, numéro de téléphone, numéro WhatsApp.</li>
                <li><strong>Métadonnées musicales :</strong> Titres des morceaux, genres musicaux, codes ISRC/UPC, crédits artistiques, contributeurs et paroles.</li>
                <li><strong>Fichiers médias :</strong> Fichiers audio (WAV/MP3), pochettes d'albums (visuels JPG/PNG) et liens de prévisualisation.</li>
                <li><strong>Informations de paiement :</strong> Mode de paiement choisi (Mobile Money, Virement, Carte bancaire) et justificatif de règlement. <em>(Nous ne stockons jamais de données bancaires brutes).</em></li>
              </ul>
            </section>

            {/* 2. Finalités */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">2. Utilisation de vos données</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vos informations personnelles et métadonnées ne sont utilisées que pour :
              </p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <li className="p-3.5 rounded-xl bg-secondary/40 border border-border text-muted-foreground">
                  Livrer vos titres aux plateformes partenaires (Spotify, Apple Music, Deezer, TikTok, etc.).
                </li>
                <li className="p-3.5 rounded-xl bg-secondary/40 border border-border text-muted-foreground">
                  Assurer le suivi administratif, la génération des codes ISRC et l'assistance WhatsApp/email.
                </li>
                <li className="p-3.5 rounded-xl bg-secondary/40 border border-border text-muted-foreground">
                  Générer vos rapports de diffusion, de streams et faciliter le reversement de vos royalties.
                </li>
                <li className="p-3.5 rounded-xl bg-secondary/40 border border-border text-muted-foreground">
                  Vous informer des nouveautés et opportunités de playlists (avec votre consentement).
                </li>
              </ul>
            </section>

            {/* 3. Sécurité & Non-revente */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">3. Sécurité & Engagement de non-cession</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Nous ne vendons, ne louons et ne cédons AUCUNE donnée personnelle à des tiers à des fins publicitaires.</strong> Vos données sont stockées sur des serveurs sécurisés et ne sont transmises aux distributeurs techniques et DSP que dans la stricte mesure nécessaire à l'indexation de vos œuvres.
              </p>
            </section>

            {/* 4. Vos droits */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">4. Vos droits (Accès, Rectification, Suppression)</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Vous disposez d'un droit permanent d'accès, de modification, de portabilité et de suppression de vos données personnelles, ainsi que du retrait de vos œuvres des plateformes (takedown).
              </p>
              <div className="p-4 rounded-xl bg-secondary/40 border border-border text-sm flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Pour exercer vos droits, écrivez-nous à :</span>
                <a href="mailto:contact@mr-kdistribution.com" className="font-semibold text-primary hover:underline shrink-0">
                  contact@mr-kdistribution.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
