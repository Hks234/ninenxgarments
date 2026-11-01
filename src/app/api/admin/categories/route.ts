import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/storage";
import { uniqueSlug } from "@/lib/slug";
import { mediaUrl } from "@/lib/storage";

async function guard() {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return null;
  return admin;
}

export async function GET(request: Request) {
  if (!(await guard())) return errorResponse("Unauthorized", 401);
  const q = new URL(request.url).searchParams.get("q") || "";
  const categories = await prisma.category.findMany({
    where: { deletedAt: null, name: q ? { contains: q } : undefined },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return json(categories.map((c) => ({ ...c, imageUrl: mediaUrl(c.imageKey) })));
}

export async function POST(request: Request) {
  if (!(await guard())) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const isActive = String(form.get("isActive") || "true") === "true";
  const displayOrder = Number(form.get("displayOrder") || 0);
  const file = form.get("image");
  if (!name) return errorResponse("Category name is required");
  if (!(file instanceof File) || file.size === 0) return errorResponse("Category image is required");
  const imageKey = await saveImage(file, "categories");
  const slug = await uniqueSlug(name, async (s) => Boolean(await prisma.category.findUnique({ where: { slug: s } })));
  const category = await prisma.category.create({
    data: { name, slug, description: description || null, isActive, displayOrder, imageKey },
  });
  return json(category);
}
