import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MR - K Distribution — Distribution musicale indépendante",
  description:
    "MR - K Distribution — diffuse votre musique sur Spotify, Apple Music, Deezer, TikTok et 150+ plateformes. Tarifs transparents, accompagnement artiste, paiement direct.",
  keywords: [
    "distribution musicale",
    "label indépendant",
    "Spotify",
    "Apple Music",
    "Deezer",
    "TikTok",
    "Afrique",
    "Bénin",
    "Cotonou",
    "royalties 100%",
  ],
  authors: [{ name: "MR - K Distribution" }],
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
  openGraph: {
    title: "MR - K Distribution",
    description:
      "Votre musique partout. Vos royalties à 100 %. Distribution sur 150+ plateformes.",
    siteName: "MR - K Distribution",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MR - K Distribution",
    description: "Votre musique partout. Vos royalties à 100 %.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
