import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { deleteImage, saveImage } from "@/lib/storage";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const form = await request.formData();
  const data: Record<string, unknown> = {};
  if (form.has("name")) data.name = String(form.get("name")).trim();
  if (form.has("description")) data.description = String(form.get("description") || "").trim() || null;
  if (form.has("isActive")) data.isActive = String(form.get("isActive")) === "true";
  if (form.has("displayOrder")) data.displayOrder = Number(form.get("displayOrder") || 0);
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    const existing = await prisma.category.findUnique({ where: { id } });
    data.imageKey = await saveImage(file, "categories");
    await deleteImage(existing?.imageKey);
  }
  const category = await prisma.category.update({ where: { id }, data });
  return json(category);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const count = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (count > 0) {
    return errorResponse("Reassign or remove products in this category before deleting it.");
  }
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  return json({ ok: true });
}
