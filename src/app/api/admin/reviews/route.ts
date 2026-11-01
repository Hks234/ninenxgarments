import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { mediaUrl, saveImage } from "@/lib/storage";

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const reviews = await prisma.review.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return json(reviews.map((review) => ({ ...review, photoUrl: mediaUrl(review.photoKey) })));
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const displayName = String(form.get("displayName") || "").trim();
  const body = String(form.get("body") || "").trim();
  const rating = Number(form.get("rating") || 5);
  if (!displayName || body.length < 8) return errorResponse("Name and review text are required");
  if (rating < 1 || rating > 5) return errorResponse("Rating must be 1 to 5 stars");
  const file = form.get("photo");
  let photoKey: string | undefined;
  if (file instanceof File && file.size > 0) photoKey = await saveImage(file, "reviews");
  const review = await prisma.review.create({
    data: {
      displayName,
      body,
      rating,
      photoKey,
      isApproved: String(form.get("isApproved") || "true") === "true",
      isVisible: String(form.get("isVisible") || "true") === "true",
      displayOrder: Number(form.get("displayOrder") || 0),
      reviewDate: form.get("reviewDate") ? new Date(String(form.get("reviewDate"))) : new Date(),
    },
  });
  return json(review);
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const id = String(form.get("id") || "");
  const file = form.get("photo");
  const data: Record<string, unknown> = {};
  if (form.has("displayName")) data.displayName = String(form.get("displayName")).trim();
  if (form.has("body")) data.body = String(form.get("body")).trim();
  if (form.has("rating")) data.rating = Number(form.get("rating"));
  if (form.has("isApproved")) data.isApproved = String(form.get("isApproved")) === "true";
  if (form.has("isVisible")) data.isVisible = String(form.get("isVisible")) === "true";
  if (form.has("displayOrder")) data.displayOrder = Number(form.get("displayOrder") || 0);
  if (file instanceof File && file.size > 0) data.photoKey = await saveImage(file, "reviews");
  return json(await prisma.review.update({ where: { id }, data }));
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = (await request.json()) as { id?: string };
  await prisma.review.delete({ where: { id: id as string } });
  return json({ ok: true });
}
