import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  deleteImage,
  isAllowedBlobUrl,
  mediaUrl,
  saveImage,
  saveVideoFile,
  videoPlaybackUrl,
  videoStorageMode,
} from "@/lib/storage";

function serialize(video: {
  id: string;
  title: string;
  caption: string;
  videoKey: string;
  posterKey: string | null;
  displayOrder: number;
  isActive: boolean;
  mimeType: string;
  createdAt: Date;
}) {
  return {
    ...video,
    videoUrl: videoPlaybackUrl(video.id, video.videoKey),
    posterUrl: mediaUrl(video.posterKey),
  };
}

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const videos = await prisma.homepageVideo.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return json({
    videos: videos.map(serialize),
    storage: videoStorageMode(),
  });
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  try {
    const form = await request.formData();
    const remoteUrl = String(form.get("videoUrl") || "").trim();
    const file = form.get("video");
    let saved: { filename: string; mimeType: string };

    if (remoteUrl) {
      if (!isAllowedBlobUrl(remoteUrl)) {
        return errorResponse("That video URL is not from the store Blob.");
      }
      saved = {
        filename: remoteUrl,
        mimeType: String(form.get("mimeType") || "video/mp4"),
      };
    } else if (file instanceof File && file.size > 0) {
      if (videoStorageMode() !== "local") {
        return errorResponse(
          "Connect a Vercel Blob store in the Vercel dashboard (Storage → Blob), then redeploy. Large videos cannot be uploaded through the Vercel server.",
        );
      }
      saved = await saveVideoFile(file);
    } else {
      return errorResponse("Choose a 9:16 portrait video to upload.");
    }

    const poster = form.get("poster");
    let posterKey: string | undefined;
    if (poster instanceof File && poster.size > 0) {
      posterKey = await saveImage(poster, "homepage-video");
    }
    const count = await prisma.homepageVideo.count();
    const video = await prisma.homepageVideo.create({
      data: {
        title: String(form.get("title") || "").trim().slice(0, 80),
        caption: String(form.get("caption") || "").trim().slice(0, 160),
        videoKey: saved.filename,
        mimeType: saved.mimeType,
        posterKey,
        displayOrder: Number(form.get("displayOrder") || count) || count,
        isActive: form.get("isActive") === "true",
      },
    });
    return json(serialize(video), 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not save video");
  }
}
