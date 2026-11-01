import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { deleteImage, deleteVideoFile, mediaUrl, saveImage, videoPlaybackUrl } from "@/lib/storage";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const existing = await prisma.homepageVideo.findUnique({ where: { id } });
  if (!existing) return errorResponse("Video not found", 404);

  try {
    const form = await request.formData();
    const poster = form.get("poster");
    let posterKey = existing.posterKey;
    if (poster instanceof File && poster.size > 0) {
      posterKey = await saveImage(poster, "homepage-video");
      await deleteImage(existing.posterKey);
    }
    const video = await prisma.homepageVideo.update({
      where: { id },
      data: {
        title: form.has("title") ? String(form.get("title") || "").trim().slice(0, 80) : existing.title,
        caption: form.has("caption") ? String(form.get("caption") || "").trim().slice(0, 160) : existing.caption,
        displayOrder: form.has("displayOrder") ? Number(form.get("displayOrder") || 0) : existing.displayOrder,
        isActive: form.has("isActive") ? form.get("isActive") === "true" : existing.isActive,
        posterKey,
      },
    });
    return json({
      ...video,
      videoUrl: videoPlaybackUrl(video.id),
      posterUrl: mediaUrl(video.posterKey),
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not update video");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const existing = await prisma.homepageVideo.findUnique({ where: { id } });
  if (!existing) return errorResponse("Video not found", 404);
  await prisma.homepageVideo.delete({ where: { id } });
  await deleteVideoFile(existing.videoKey);
  await deleteImage(existing.posterKey);
  return json({ ok: true });
}
