import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
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
    const status = String(body.status || "");
    if (!["pending", "approved", "rejected", "delivered"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const updated = await db.submission.update({
      where: { id },
      data: { status },
      include: { tracks: true },
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
