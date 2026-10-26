import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackingDashboard } from "./tracking-dashboard";

export const metadata: Metadata = {
  title: "Espace Artiste & Suivi de Distribution en Direct | MR - K Distribution",
  description:
    "Suivez en direct l'audit studio, l'attribution des codes ISRC et l'ingestion de vos morceaux sur 150+ plateformes (Spotify, Apple Music, Deezer, TikTok) par MR - K Distribution.",
};

export default function SuiviPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-center p-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-medium text-white/70">Chargement de votre cockpit de distribution...</p>
          </div>
        </div>
      }
    >
      <TrackingDashboard />
    </Suspense>
  );
}
