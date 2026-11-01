import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/shop",
    "/categories",
    "/about",
    "/reviews",
    "/contact",
    "/search",
    "/privacy",
    "/terms",
    "/shipping",
    "/cancellation",
  ].map((path) => ({ url: `${base}${path || "/"}` }));
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ where: { isActive: true, deletedAt: null }, select: { slug: true, updatedAt: true } }),
    ]);
    return staticRoutes.concat(
      products.map((product) => ({ url: `${base}/product/${product.slug}`, lastModified: product.updatedAt })),
      categories.map((category) => ({ url: `${base}/category/${category.slug}`, lastModified: category.updatedAt })),
    );
  } catch {
    return staticRoutes;
  }
}
