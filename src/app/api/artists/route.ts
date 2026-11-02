import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

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

export async function PATCH(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      currentEmail,
      artistName,
      artistEmail,
      artistPhone,
      artistWhatsapp,
      artistCity,
      artistBio,
      artistPhoto,
      socialLinks,
    } = body;

    if (!currentEmail || typeof currentEmail !== "string") {
      return NextResponse.json(
        { error: "L'adresse email de référence de l'artiste est requise" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (typeof artistName === "string" && artistName.trim().length > 0) {
      updateData.artistName = artistName.trim();
    }
    if (typeof artistEmail === "string" && artistEmail.trim().length > 0) {
      updateData.artistEmail = artistEmail.trim().toLowerCase();
    }
    if (typeof artistPhone === "string") {
      updateData.artistPhone = artistPhone.trim();
    }
    if (artistWhatsapp !== undefined) {
      updateData.artistWhatsapp = artistWhatsapp ? String(artistWhatsapp).trim() : null;
    }
    if (artistCity !== undefined) {
      updateData.artistCity = artistCity ? String(artistCity).trim() : null;
    }
    if (artistBio !== undefined) {
      updateData.artistBio = artistBio ? String(artistBio).trim() : null;
    }
    if (artistPhoto !== undefined) {
      updateData.artistPhoto = artistPhoto ? String(artistPhoto).trim() : null;
    }
    if (socialLinks !== undefined) {
      updateData.socialLinks =
        typeof socialLinks === "string" ? socialLinks : JSON.stringify(socialLinks);
    }

    // In Prisma with PostgreSQL, update all submissions for this artist
    const res = await db.submission.updateMany({
      where: {
        artistEmail: {
          equals: currentEmail.trim(),
          mode: "insensitive",
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      count: res.count,
      message: `${res.count} sortie(s) synchronisée(s) pour cet artiste`,
    });
  } catch (e: any) {
    console.error("PATCH /api/artists error", e);
    return NextResponse.json(
      { error: e?.message || "Erreur lors de la mise à jour de l'artiste" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "L'adresse email de l'artiste à supprimer est requise" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();

    // Cascades delete to Track records via foreign key onDelete: Cascade
    const res = await db.submission.deleteMany({
      where: {
        artistEmail: {
          equals: trimmedEmail,
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      ok: true,
      count: res.count,
      message: `Artiste et ${res.count} projet(s) supprimés définitivement`,
    });
  } catch (e: any) {
    console.error("DELETE /api/artists error", e);
    return NextResponse.json(
      { error: e?.message || "Erreur lors de la suppression de l'artiste" },
      { status: 500 }
    );
  }
}
