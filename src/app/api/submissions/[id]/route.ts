import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = await db.submission.findUnique({
      where: { id },
      include: { tracks: { orderBy: { position: "asc" } } },
    });
    if (!submission) {
      return NextResponse.json({ error: "Sortie introuvable" }, { status: 404 });
    }
    return NextResponse.json({ submission });
  } catch (e) {
    console.error("GET /api/submissions/[id] error", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "status",
      "plan",
      "amount",
      "artistName",
      "artistEmail",
      "artistPhone",
      "artistWhatsapp",
      "artistBio",
      "artistCity",
      "artistPhoto",
      "socialLinks",
      "releaseTitle",
      "releaseGenre",
      "releaseDate",
      "releaseLanguage",
      "coverArtUrl",
      "explicit",
      "paymentMethod",
    ];

    const data: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }

    if (data.status && !["pending", "approved", "rejected", "delivered"].includes(data.status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    if (data.artistEmail && typeof data.artistEmail === "string") {
      data.artistEmail = data.artistEmail.trim().toLowerCase();
    }

    const updated = await db.submission.update({
      where: { id },
      data,
      include: { tracks: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json({ submission: updated });
  } catch (e) {
    console.error("PATCH /api/submissions/[id] error", e);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.submission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/submissions/[id] error", e);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
