import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// Les 3 artistes de la vitrine publique pour assurer une parfaite synchronisation
const SHOWCASE_ARTISTS = [
  {
    plan: "single",
    amount: 15000,
    status: "delivered",
    artistName: "Mïko Sun",
    artistEmail: "miko.sun@afropop.bj",
    artistPhone: "+229 97 12 34 56",
    artistWhatsapp: "+229 97 12 34 56",
    artistCity: "Cotonou, Bénin",
    artistBio: "Fusion Afropop et sonorités traditionnelles béninoises.",
    releaseTitle: "Soleil Levant (Single)",
    releaseGenre: "Afropop",
    releaseDate: "2026-03-15",
    releaseLanguage: "Fon & Français",
    coverArtUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    paymentMethod: "mobile_money",
    explicit: false,
    socialLinks: JSON.stringify({ spotify: "https://spotify.com" }),
    tracks: [
      { position: 1, title: "Soleil Levant", duration: "3:18", featuredArtists: "feat. Kelyan", explicit: false },
    ],
  },
  {
    plan: "ep",
    amount: 45000,
    status: "delivered",
    artistName: "Aura Kpèdji",
    artistEmail: "aura.kpedji@music.bj",
    artistPhone: "+229 95 88 77 66",
    artistWhatsapp: "+229 95 88 77 66",
    artistCity: "Porto-Novo, Bénin",
    artistBio: "Voix soul & RnB contemporain inspiré des rythmes Fon.",
    releaseTitle: "Nuit Étoilée (EP 5 titres)",
    releaseGenre: "Soul & RnB",
    releaseDate: "2026-02-20",
    releaseLanguage: "Français & Fon",
    coverArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    paymentMethod: "card",
    explicit: false,
    socialLinks: JSON.stringify({ spotify: "https://spotify.com", instagram: "@aurakpedji" }),
    tracks: [
      { position: 1, title: "Minon", duration: "3:45", featuredArtists: null, explicit: false },
      { position: 2, title: "Lueur Nocturne", duration: "3:12", featuredArtists: null, explicit: false },
      { position: 3, title: "Porto Memories", duration: "4:05", featuredArtists: "feat. DJ Zeph", explicit: false },
      { position: 4, title: "Douce Voix", duration: "2:58", featuredArtists: null, explicit: false },
      { position: 5, title: "Agbaza", duration: "3:30", featuredArtists: null, explicit: false },
    ],
  },
  {
    plan: "album",
    amount: 120000,
    status: "approved",
    artistName: "D-Vibe & The Kings",
    artistEmail: "dvibe.kings@drill.ci",
    artistPhone: "+225 07 44 33 22",
    artistWhatsapp: "+225 07 44 33 22",
    artistCity: "Abidjan, Côte d'Ivoire",
    artistBio: "Collectif Afro-fusion & Drill mélodique.",
    releaseTitle: "Babi to Cotonou (Album Pro)",
    releaseGenre: "Afro-Fusion",
    releaseDate: "2026-04-01",
    releaseLanguage: "Français & Nouchi",
    coverArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    paymentMethod: "bank",
    explicit: true,
    socialLinks: JSON.stringify({ spotify: "https://spotify.com", tiktok: "@dvibe_official" }),
    tracks: [
      { position: 1, title: "Pont De Gaulle", duration: "3:02", featuredArtists: null, explicit: true },
      { position: 2, title: "Lagune Flow", duration: "3:24", featuredArtists: "feat. Blacky", explicit: false },
      { position: 3, title: "Zone 4 Anthem", duration: "2:45", featuredArtists: null, explicit: true },
      { position: 4, title: "Dantokpa Convoi", duration: "3:50", featuredArtists: "feat. MC Benin", explicit: false },
      { position: 5, title: "Abidjan By Night", duration: "3:15", featuredArtists: null, explicit: false },
      { position: 6, title: "Renaissance 225", duration: "4:10", featuredArtists: null, explicit: false },
    ],
  },
];

const MOCK_SIMULATIONS = [
  {
    plan: "single",
    amount: 15000,
    status: "pending",
    artistName: "K-Mellow",
    artistEmail: "k.mellow@music.bj",
    artistPhone: "+229 96 11 22 33",
    artistWhatsapp: "+229 96 11 22 33",
    artistCity: "Parakou, Bénin",
    artistBio: "Nouvelle voix de l'Afro-Gospel urbain.",
    releaseTitle: "Grâce Infinie",
    releaseGenre: "Gospel",
    releaseDate: "2026-05-10",
    releaseLanguage: "Français & Bariba",
    coverArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    paymentMethod: "mobile_money",
    explicit: false,
    tracks: [
      { position: 1, title: "Grâce Infinie", duration: "3:52", featuredArtists: null, explicit: false },
    ],
  },
  {
    plan: "ep",
    amount: 45000,
    status: "pending",
    artistName: "Naya Bloom",
    artistEmail: "naya.bloom@vibes.com",
    artistPhone: "+229 61 44 55 66",
    artistWhatsapp: "+229 61 44 55 66",
    artistCity: "Cotonou, Bénin",
    artistBio: "RnB alt contemporain et guitare acoustique.",
    releaseTitle: "Fleurs d'Oranger",
    releaseGenre: "R&B",
    releaseDate: "2026-06-01",
    releaseLanguage: "Français & Anglais",
    coverArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    paymentMethod: "whatsapp",
    explicit: false,
    tracks: [
      { position: 1, title: "Prélude", duration: "1:45", featuredArtists: null, explicit: false },
      { position: 2, title: "Fleurs d'Oranger", duration: "3:30", featuredArtists: null, explicit: false },
      { position: 3, title: "Sous la Pluie", duration: "3:15", featuredArtists: "feat. Joël Keys", explicit: false },
    ],
  },
];

export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { action } = await req.json().catch(() => ({ action: "sync_showcase" }));

    if (action === "sync_showcase") {
      let createdCount = 0;
      for (const item of SHOWCASE_ARTISTS) {
        const existing = await db.submission.findFirst({
          where: { artistEmail: item.artistEmail },
        });

        if (!existing) {
          const { tracks, ...subData } = item;
          await db.submission.create({
            data: {
              ...subData,
              tracks: {
                create: tracks,
              },
            },
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        ok: true,
        message: `${createdCount} sortie(s) synchronisée(s) depuis la vitrine.`,
        createdCount,
      });
    }

    if (action === "simulate_one") {
      // Pick a random mock or cycle
      const mock = MOCK_SIMULATIONS[Math.floor(Math.random() * MOCK_SIMULATIONS.length)];
      const randomSuffix = Math.floor(Math.random() * 900 + 100);
      const { tracks, ...subData } = mock;

      const created = await db.submission.create({
        data: {
          ...subData,
          artistName: `${mock.artistName} #${randomSuffix}`,
          artistEmail: `${mock.artistEmail.replace("@", `+${randomSuffix}@`)}`,
          tracks: {
            create: tracks,
          },
        },
        include: { tracks: true },
      });

      return NextResponse.json({
        ok: true,
        message: `Nouvelle demande de test « ${created.releaseTitle} » simulée avec succès.`,
        submission: created,
      });
    }

    if (action === "clear_all") {
      await db.submission.deleteMany({});
      return NextResponse.json({ ok: true, message: "Toutes les données ont été réinitialisées." });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e: any) {
    console.error("POST /api/submissions/seed error", e);
    return NextResponse.json(
      { error: e?.message || "Erreur lors de la synchronisation des données" },
      { status: 500 }
    );
  }
}
