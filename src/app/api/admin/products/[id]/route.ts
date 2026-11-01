import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { rupeesToPaise } from "@/lib/money";
import { mediaUrl, saveImage } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      variants: { include: { size: true, colour: true } },
    },
  });
  if (!product) return errorResponse("Product not found", 404);
  return json({
    ...product,
    images: product.images.map((image) => ({ ...image, url: mediaUrl(image.imageKey) })),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return errorResponse("Product not found", 404);
  const form = await request.formData();
  const data: Record<string, unknown> = {};
  if (form.has("name")) data.name = String(form.get("name")).trim();
  if (form.has("description")) data.description = String(form.get("description") || "").trim() || null;
  if (form.has("isActive")) data.isActive = String(form.get("isActive")) === "true";
  if (form.has("isFeatured")) data.isFeatured = String(form.get("isFeatured")) === "true";
  if (form.has("categoryId")) {
    const categoryId = String(form.get("categoryId"));
    const category = await prisma.category.findFirst({ where: { id: categoryId, deletedAt: null } });
    if (!category) return errorResponse("Select a valid category");
    data.categoryId = categoryId;
  }
  if (form.has("priceRupees")) {
    const pricePaise = rupeesToPaise(String(form.get("priceRupees")));
    if (pricePaise <= 0) return errorResponse("Price must be greater than zero");
    data.pricePaise = pricePaise;
  }
  const files = form.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data });
    if (files.length) {
      const start = await tx.productImage.count({ where: { productId: id } });
      for (let i = 0; i < files.length; i += 1) {
        const imageKey = await saveImage(files[i], "products");
        await tx.productImage.create({ data: { productId: id, imageKey, displayOrder: start + i } });
      }
    }
    if (form.has("variants")) {
      const variants = JSON.parse(String(form.get("variants"))) as { sizeId: string; colourId: string; stock: number }[];
      for (const variant of variants) {
        await tx.productVariant.upsert({
          where: { productId_sizeId_colourId: { productId: id, sizeId: variant.sizeId, colourId: variant.colourId } },
          update: { stock: Math.max(0, Number(variant.stock) || 0) },
          create: {
            productId: id,
            sizeId: variant.sizeId,
            colourId: variant.colourId,
            stock: Math.max(0, Number(variant.stock) || 0),
          },
        });
      }
    }
  });
  return json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  return json({ ok: true });
}
