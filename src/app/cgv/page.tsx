import type { Metadata } from "next";
import { SubpageHeader } from "@/components/site/subpage-header";
import { Footer } from "@/components/site/footer";
import { FileText, Coins, Clock, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV) — MR - K Distribution",
  description: "Conditions générales de vente et de distribution de MR - K Distribution.",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SubpageHeader title="Conditions Générales de Vente" />

      <main className="flex-1 py-12 sm:py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Contrat & Conditions
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Conditions Générales de <span className="text-gradient-gold">Vente & de Service</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Régissant les relations contractuelles entre MR - K Distribution et les artistes / producteurs indépendants.
            </p>
          </div>

          <div className="space-y-8 text-foreground/90 leading-relaxed">
            {/* 1. Objet */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">1. Objet du Service</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Les présentes Conditions Générales définissent les droits et obligations des parties dans le cadre de la prestation de distribution numérique d'œuvres musicales (singles, EPs, albums) fournie par <strong>MR - K Distribution</strong> auprès des plateformes mondiales de streaming et de téléchargement légal (Spotify, Apple Music, Deezer, TikTok, Boomplay, Audiomack, YouTube Music, etc.).
              </p>
            </section>

            {/* 2. Tarifs et Paiement */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Coins className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">2. Tarifs et Modalités de Règlement</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Les tarifs sont forfaitaires, fermes et exprimés en Francs CFA (XOF / FCFA). Ils correspondent à un <strong>paiement unique sans abonnement récurrent obligatoire</strong> :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-4 rounded-xl border border-border bg-secondary/40 text-center">
                    <div className="font-bold text-foreground">Single Start</div>
                    <div className="font-display text-xl font-bold text-primary mt-1">15 000 FCFA</div>
                    <div className="text-xs text-muted-foreground mt-1">1 titre</div>
                  </div>
                  <div className="p-4 rounded-xl border border-primary/40 bg-secondary/40 text-center">
                    <div className="font-bold text-foreground">EP Boost</div>
                    <div className="font-display text-xl font-bold text-primary mt-1">45 000 FCFA</div>
                    <div className="text-xs text-muted-foreground mt-1">Jusqu'à 6 titres</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/40 text-center">
                    <div className="font-bold text-foreground">Album Pro</div>
                    <div className="font-display text-xl font-bold text-primary mt-1">120 000 FCFA</div>
                    <div className="text-xs text-muted-foreground mt-1">Jusqu'à 20 titres</div>
                  </div>
                </div>
                <p>
                  Le règlement s'effectue par Mobile Money (MTN, Moov, Wave), Carte bancaire, Virement ou via arrangement WhatsApp validé par l'équipe MR - K. Le traitement de la commande débute dès confirmation de la réception du règlement.
                </p>
              </div>
            </section>

            {/* 3. Garantie 100% Royalties */}
            <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold text-black">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">3. Garantie 100 % Royalties</h2>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                MR - K Distribution s'engage solennellement à ne prélever <strong>aucune commission ni pourcentage</strong> sur les revenus de streaming et de téléchargement générés par les œuvres de l'artiste.
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                100 % des royalties perçues par MR - K en provenance des DSP pour le compte de l'artiste sont reversées à ce dernier selon les périodicités de reddition de comptes des plateformes.
              </p>
            </section>

            {/* 4. Délais de mise en ligne */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">4. Délais d'Exécution & Ingestion DSP</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Après validation de la conformité des fichiers audio (formats WAV/FLAC ou MP3 320kbps de haute qualité) et du visuel de pochette (minimum 3000x3000px, sans logos non autorisés ni prix), MR - K livre les fichiers aux plateformes sous un délai indicatif de <strong>48 à 72 heures ouvrées</strong>. Les délais d'affichage effectif dépendent des processus d'ingestion propres à chaque plateforme (Spotify, Apple Music, etc.).
              </p>
            </section>

            {/* 5. Responsabilité & Droits des Samples */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">5. Responsabilité et Droits d'Auteur de l'Artiste</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L'artiste garantit être le créateur et titulaire exclusif des droits d'exploitation des enregistrements, compositions et pochettes soumis, ou détenir les autorisations / licences formelles (notamment concernant les samples, beats ou featurings).
                MR - K Distribution décline toute responsabilité en cas de litige relatif à une contrefaçon ou atteinte aux droits d'un tiers commise par l'artiste.
              </p>
            </section>

            {/* 6. Retrait & Takedown */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <RefreshCcw className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">6. Retrait des Plateformes (Takedown)</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L'artiste peut à tout moment demander le retrait de tout ou partie de ses titres des plateformes de streaming par simple notification écrite par email ou WhatsApp. Le processus de suppression est enclenché sous 5 jours ouvrés.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
