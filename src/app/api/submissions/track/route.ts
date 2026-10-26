import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    const email = searchParams.get("email")?.trim();
    const query = searchParams.get("q")?.trim();

    if (!id && !email && !query) {
      return NextResponse.json(
        { error: "Veuillez fournir un identifiant, un email ou un terme de recherche." },
        { status: 400 }
      );
    }

    // 1. Direct ID lookup
    if (id) {
      const submission = await db.submission.findUnique({
        where: { id },
        include: { tracks: { orderBy: { position: "asc" } } },
      });
      if (!submission) {
        return NextResponse.json({ submissions: [] });
      }
      return NextResponse.json({ submissions: [submission] });
    }

    // 2. Direct email lookup
    if (email) {
      const submissions = await db.submission.findMany({
        where: {
          artistEmail: {
            equals: email,
          },
        },
        include: { tracks: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ submissions });
    }

    // 3. Flexible query lookup (id, email, phone, artistName)
    const q = query || "";
    if (q.includes("@")) {
      const submissions = await db.submission.findMany({
        where: {
          artistEmail: {
            equals: q,
          },
        },
        include: { tracks: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ submissions });
    }

    // Try finding by exact ID first
    const byId = await db.submission.findUnique({
      where: { id: q },
      include: { tracks: { orderBy: { position: "asc" } } },
    });
    if (byId) {
      return NextResponse.json({ submissions: [byId] });
    }

    // Otherwise find by phone or artistName
    const matching = await db.submission.findMany({
      where: {
        OR: [
          { artistPhone: { contains: q } },
          { artistWhatsapp: { contains: q } },
          { artistName: { contains: q } },
          { releaseTitle: { contains: q } },
        ],
      },
      include: { tracks: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ submissions: matching });
  } catch (e) {
    console.error("GET /api/submissions/track error", e);
    return NextResponse.json(
      { error: "Erreur serveur lors de la recherche" },
      { status: 500 }
    );
  }
}
