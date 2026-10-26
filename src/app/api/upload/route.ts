import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60 MB (covers WAV / high quality audio & images)

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (limite : 60 Mo)" },
        { status: 400 }
      );
    }

    // MIME type sanity check (allow if matches audio or image)
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name);

    if (!isImage && !isAudio && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Veuillez déposer une image (JPG, PNG, WEBP) ou un fichier audio (WAV, MP3, FLAC)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "upload";
    const ext = path.extname(originalName) || (isImage ? ".jpg" : ".mp3");
    const cleanBase = path
      .basename(originalName, ext)
      .slice(0, 40)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const randomSuffix = crypto.randomBytes(6).toString("hex");
    const filename = `${Date.now()}_${randomSuffix}_${cleanBase}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      filename,
      originalName,
      size: file.size,
      mimeType: file.type || (isImage ? "image/jpeg" : "audio/mpeg"),
      category: isImage ? "image" : "audio",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l'enregistrement du fichier" },
      { status: 500 }
    );
  }
}
