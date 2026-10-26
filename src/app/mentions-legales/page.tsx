import type { Metadata } from "next";
import { SubpageHeader } from "@/components/site/subpage-header";
import { Footer } from "@/components/site/footer";
import { Building2, ShieldCheck, Mail, MapPin, Server, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales — MR - K Distribution",
  description: "Mentions légales, informations éditeur et hébergement de MR - K Distribution.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SubpageHeader title="Mentions Légales" />

      <main className="flex-1 py-12 sm:py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Informations Juridiques
            </span>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Mentions <span className="text-gradient-gold">Légales</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Dernière mise à jour : 26 octobre 2026. Conformément aux dispositions légales régissant les services numériques et le commerce électronique.
            </p>
          </div>

          <div className="space-y-8 text-foreground/90 leading-relaxed">
            {/* Section 1 : Éditeur */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">1. Éditeur de la Plateforme</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Le site web et la plateforme <strong>MR - K Distribution</strong> sont édités et exploités par le label et distributeur indépendant MR - K :
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border">
                  <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><strong>Dénomination :</strong> MR - K Distribution</div>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><strong>Siège social :</strong> Cotonou, République du Bénin</div>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><strong>Contact électronique :</strong> contact@mr-kdistribution.com</div>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border">
                  <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div><strong>Directeur de la publication :</strong> Direction MR - K</div>
                </li>
              </ul>
            </section>

            {/* Section 2 : Hébergement */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Server className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">2. Hébergement Technique</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plateforme est hébergée sur l'infrastructure cloud haute disponibilité de :
              </p>
              <div className="mt-3 p-4 rounded-xl bg-secondary/40 border border-border text-sm space-y-1">
                <p><strong>Vercel Inc.</strong></p>
                <p className="text-muted-foreground">440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
                <p className="text-muted-foreground">Site web : <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">https://vercel.com</a></p>
              </div>
            </section>

            {/* Section 3 : Propriété intellectuelle */}
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="font-display text-xl font-bold">3. Propriété Intellectuelle & Droits des Artistes</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong>Droits sur le site :</strong> L'ensemble des éléments graphiques, marques, logos, animations, code source et contenus du présent site sont la propriété exclusive de MR - K Distribution ou de ses partenaires.
                </p>
                <p>
                  <strong>Propriété des œuvres musicales :</strong> Les artistes utilisant le service MR - K Distribution demeurent <strong>à 100 % propriétaires exclusifs</strong> de leurs enregistrements sonores (masters), compositions, paroles, pochettes et métadonnées. MR - K Distribution agit exclusivement en qualité de mandataire technique de distribution auprès des plateformes de streaming et téléchargement (DSP).
                </p>
              </div>
            </section>

            {/* Section 4 : Contact */}
            <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold">4. Réclamations & Signalements</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pour toute question, réclamation relative à des droits d'auteur ou signalement de contenu contrefaisant, veuillez nous contacter directement :
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                <a href="mailto:contact@mr-kdistribution.com" className="inline-flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" /> contact@mr-kdistribution.com
                </a>
                <a href="https://wa.me/2250157307677" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                  WhatsApp : +225 01 57 30 76 77
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
