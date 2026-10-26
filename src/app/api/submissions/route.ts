import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const submissions = await db.submission.findMany({
      include: { tracks: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (e) {
    console.error("GET /api/submissions error", e);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des soumissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const plan = String(body.plan || "");
    if (!["single", "ep", "album"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const PLAN_PRICES: Record<string, number> = {
      single: 15000,
      ep: 45000,
      album: 120000,
    };

    const artistName = String(body.artistName || "").trim();
    const artistEmail = String(body.artistEmail || "").trim();
    const artistPhone = String(body.artistPhone || "").trim();
    const releaseTitle = String(body.releaseTitle || "").trim();
    const releaseGenre = String(body.releaseGenre || "").trim();

    if (!artistName || !artistEmail || !artistPhone || !releaseTitle || !releaseGenre) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const tracks: Array<{
      position: number;
      title: string;
      isrc?: string | null;
      audioUrl?: string | null;
      featuredArtists?: string | null;
      duration?: string | null;
      explicit?: boolean;
    }> = Array.isArray(body.tracks) ? body.tracks : [];

    const submission = await db.submission.create({
      data: {
        plan,
        status: body.status && ["pending", "approved", "delivered", "rejected"].includes(body.status) ? body.status : "pending",
        amount: PLAN_PRICES[plan],
        artistName,
        artistEmail,
        artistPhone,
        artistWhatsapp: body.artistWhatsapp ? String(body.artistWhatsapp) : null,
        artistBio: body.artistBio ? String(body.artistBio) : null,
        artistCity: body.artistCity ? String(body.artistCity) : null,
        artistPhoto: body.artistPhoto ? String(body.artistPhoto) : null,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        releaseTitle,
        releaseGenre,
        releaseDate: body.releaseDate ? String(body.releaseDate) : null,
        releaseLanguage: body.releaseLanguage ? String(body.releaseLanguage) : null,
        coverArtUrl: body.coverArtUrl ? String(body.coverArtUrl) : null,
        explicit: Boolean(body.explicit),
        paymentMethod: body.paymentMethod ? String(body.paymentMethod) : null,
        tracks: {
          create: tracks.map((t, i) => ({
            position: t.position ?? i + 1,
            title: String(t.title || "").trim(),
            isrc: t.isrc ? String(t.isrc) : null,
            audioUrl: t.audioUrl ? String(t.audioUrl) : null,
            featuredArtists: t.featuredArtists ? String(t.featuredArtists) : null,
            duration: t.duration ? String(t.duration) : null,
            explicit: Boolean(t.explicit),
          })),
        },
      },
      include: { tracks: true },
    });

    return NextResponse.json({ submission });
  } catch (e) {
    console.error("POST /api/submissions error", e);
    return NextResponse.json(
      { error: "Erreur lors de la soumission" },
      { status: 500 }
    );
  }
}
