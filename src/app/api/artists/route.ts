import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const submissions = await db.submission.findMany({
      where: {
        status: { in: ["delivered", "approved"] },
      },
      include: {
        tracks: {
          select: {
            id: true,
            title: true,
            position: true,
            duration: true,
            audioUrl: true,
            featuredArtists: true,
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    });

    // Sanitize for public view — strictly exclude private emails and phone numbers
    const artists = submissions.map((s) => {
      let social: Record<string, string> = {};
      try {
        if (s.socialLinks) social = JSON.parse(s.socialLinks);
      } catch {}

      return {
        id: s.id,
        artistName: s.artistName,
        artistCity: s.artistCity || "Bénin",
        artistBio: s.artistBio,
        artistPhoto: s.artistPhoto,
        releaseTitle: s.releaseTitle,
        releaseGenre: s.releaseGenre,
        releaseDate: s.releaseDate,
        coverArtUrl: s.coverArtUrl,
        plan: s.plan,
        status: s.status,
        social,
        tracks: s.tracks,
        createdAt: s.createdAt,
      };
    });

    return NextResponse.json({ artists });
  } catch (e) {
    console.error("GET /api/artists error", e);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des artistes", artists: [] },
      { status: 500 }
    );
  }
}
