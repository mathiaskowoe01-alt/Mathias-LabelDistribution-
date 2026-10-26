import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyPassword,
  checkRateLimit,
  getClientIP,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Rate limit per IP
    const ip = getClientIP(req);
    const { blocked, remaining } = checkRateLimit(ip);
    if (blocked) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 1 minute." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    const { password } = await req.json();
    if (typeof password !== "string" || !password) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }

    const ok = await verifyPassword(password);
    if (!ok) {
      return NextResponse.json(
        { error: `Mot de passe incorrect. ${remaining - 1} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // Issue signed session token
    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("POST /api/admin/login error", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
