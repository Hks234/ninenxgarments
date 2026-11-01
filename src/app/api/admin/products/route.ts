import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { rupeesToPaise } from "@/lib/money";
import { uniqueSlug } from "@/lib/slug";
import { mediaUrl, saveImage } from "@/lib/storage";

export async function GET(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      name: q ? { contains: q } : undefined,
      categoryId: categoryId || undefined,
    },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      variants: { include: { size: true, colour: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return json(
    products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({ ...image, url: mediaUrl(image.imageKey) })),
    })),
  );
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const categoryId = String(form.get("categoryId") || "");
  const description = String(form.get("description") || "").trim();
  const priceRupees = String(form.get("priceRupees") || "");
  const isActive = String(form.get("isActive") || "true") === "true";
  const isFeatured = String(form.get("isFeatured") || "false") === "true";
  const variants = JSON.parse(String(form.get("variants") || "[]")) as { sizeId: string; colourId: string; stock: number }[];
  const files = form.getAll("images").filter((file): file is File => file instanceof File && file.size > 0);

  if (!name) return errorResponse("Product name is required");
  if (!categoryId) return errorResponse("Select a valid category");
  const category = await prisma.category.findFirst({ where: { id: categoryId, deletedAt: null } });
  if (!category) return errorResponse("Select an existing category. Create the category first if it does not exist.");
  if (!files.length) return errorResponse("At least one product photograph is required");
  let pricePaise = 0;
  try {
    pricePaise = rupeesToPaise(priceRupees);
  } catch {
    return errorResponse("Enter a valid price greater than zero");
  }
  if (pricePaise <= 0) return errorResponse("Price must be greater than zero");
  if (!variants.length) return errorResponse("Configure size and colour stock combinations");

  const sizeIds = [...new Set(variants.map((v) => v.sizeId))];
  const colourIds = [...new Set(variants.map((v) => v.colourId))];
  const [sizes, colours] = await Promise.all([
    prisma.sizeOption.findMany({ where: { id: { in: sizeIds } } }),
    prisma.colourOption.findMany({ where: { id: { in: colourIds } } }),
  ]);
  if (sizes.length !== sizeIds.length || colours.length !== colourIds.length) {
    return errorResponse("Sizes and colours must be created in Size Management and Colour Management first.");
  }

  const slug = await uniqueSlug(name, async (s) => Boolean(await prisma.product.findUnique({ where: { slug: s } })));
  const imageKeys = [];
  for (const file of files) imageKeys.push(await saveImage(file, "products"));

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      pricePaise,
      categoryId,
      isActive,
      isFeatured,
      images: { create: imageKeys.map((imageKey, index) => ({ imageKey, displayOrder: index })) },
      variants: {
        create: variants.map((variant) => ({
          sizeId: variant.sizeId,
          colourId: variant.colourId,
          stock: Math.max(0, Number(variant.stock) || 0),
        })),
      },
    },
  });
  return json(product);
}
