import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "./prisma";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 6 * 1024 * 1024;

export async function saveImage(file: File, folder: string) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be smaller than 6 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const asset = await prisma.mediaAsset.create({
    data: {
      id: `${folder}-${Date.now()}-${randomBytes(6).toString("hex")}`,
      folder,
      mimeType: "image/jpeg",
      bytes: optimized,
    },
  });
  return asset.id;
}

export async function deleteImage(key?: string | null) {
  if (!key) return;
  await prisma.mediaAsset.deleteMany({ where: { id: key } });
}

export function mediaUrl(key?: string | null) {
  if (!key) return null;
  return `/api/media/${encodeURIComponent(key)}`;
}

export async function readImage(key: string) {
  return prisma.mediaAsset.findUnique({ where: { id: key } });
}

const VIDEO_DIR = path.join(process.cwd(), "storage", "uploads", "videos");
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function videoFilePath(filename: string) {
  const resolved = path.resolve(VIDEO_DIR, path.basename(filename));
  if (!resolved.startsWith(path.resolve(VIDEO_DIR))) {
    throw new Error("Invalid video path");
  }
  return resolved;
}

export async function saveVideoFile(file: File) {
  if (!VIDEO_TYPES.has(file.type)) {
    throw new Error("Use an MP4, WebM, or MOV video in 9:16 portrait.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must be smaller than 40 MB.");
  }
  await mkdir(VIDEO_DIR, { recursive: true });
  const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
  const filename = `video-${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await writeFile(videoFilePath(filename), Buffer.from(await file.arrayBuffer()));
  return { filename, mimeType: file.type };
}

export async function deleteVideoFile(filename?: string | null) {
  if (!filename) return;
  try {
    await unlink(videoFilePath(filename));
  } catch {
    // File may already be gone.
  }
}

export function videoPlaybackUrl(id: string) {
  return `/api/videos/${encodeURIComponent(id)}`;
}
