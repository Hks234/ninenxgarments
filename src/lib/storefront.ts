import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { mediaUrl, videoPlaybackUrl } from "./storage";
import { getHomepageConfig } from "./settings";

const HOMEPAGE_PRODUCT_LIMIT = 20;

export function serializeProduct<
  T extends {
    pricePaise: number;
    images: { imageKey: string; altText: string | null }[];
    variants: {
      id: string;
      stock: number;
      size: { id: string; label: string; isActive: boolean };
      colour: { id: string; name: string; hex: string | null; isActive: boolean };
    }[];
    category: { name: string; slug: string; isActive: boolean };
  },
>(product: T) {
  const images = product.images.map((image) => ({
    url: mediaUrl(image.imageKey),
    alt: image.altText,
  }));
  const variants = product.variants
    .filter((variant) => variant.size.isActive && variant.colour.isActive)
    .map((variant) => ({
      id: variant.id,
      stock: variant.stock,
      size: variant.size,
      colour: variant.colour,
    }));
  const { images: _images, variants: _variants, ...rest } = product;
  return {
    ...rest,
    imageUrl: images[0]?.url || null,
    images,
    availableSizes: [...new Map(variants.map((v) => [v.size.id, v.size])).values()],
    availableColours: [...new Map(variants.map((v) => [v.colour.id, v.colour])).values()],
    inStock: variants.some((variant) => variant.stock > 0),
    variants,
  };
}

const productInclude = {
  images: { orderBy: { displayOrder: "asc" as const } },
  category: true,
  variants: {
    include: { size: true, colour: true },
  },
} satisfies Prisma.ProductInclude;

export async function getHomepageProducts() {
  const homepage = await getHomepageConfig();
  const featuredIds = homepage.featuredProductIds.slice(0, HOMEPAGE_PRODUCT_LIMIT);
  if (featuredIds.length) {
    const featured = await prisma.product.findMany({
      where: { id: { in: featuredIds }, isActive: true, deletedAt: null, category: { isActive: true, deletedAt: null } },
      include: productInclude,
    });
    featured.sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
    if (featured.length >= HOMEPAGE_PRODUCT_LIMIT) {
      return featured.slice(0, HOMEPAGE_PRODUCT_LIMIT).map(serializeProduct);
    }
    const extra = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        id: { notIn: featured.map((p) => p.id) },
        category: { isActive: true, deletedAt: null },
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: HOMEPAGE_PRODUCT_LIMIT - featured.length,
    });
    return [...featured, ...extra].slice(0, HOMEPAGE_PRODUCT_LIMIT).map(serializeProduct);
  }
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null, category: { isActive: true, deletedAt: null } },
    include: productInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: HOMEPAGE_PRODUCT_LIMIT,
  });
  return products.map(serializeProduct);
}

export type ShopFilters = {
  q?: string;
  category?: string;
  size?: string;
  colour?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

export async function getShopProducts(filters: ShopFilters, pageSize = 12) {
  const page = Math.max(1, Number(filters.page || 1) || 1);
  const minPaise = filters.min ? Math.round(Number(filters.min) * 100) : undefined;
  const maxPaise = filters.max ? Math.round(Number(filters.max) * 100) : undefined;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
    category: { isActive: true, deletedAt: null },
  };
  if (filters.q) {
    where.name = { contains: filters.q };
  }
  if (filters.category) {
    where.category = { is: { slug: filters.category, isActive: true, deletedAt: null } };
  }
  if (minPaise || maxPaise) {
    where.pricePaise = {
      gte: minPaise || undefined,
      lte: maxPaise || undefined,
    };
  }
  if (filters.size || filters.colour) {
    where.variants = {
      some: {
        stock: { gt: 0 },
        size: filters.size ? { slug: filters.size, isActive: true } : { isActive: true },
        colour: filters.colour ? { slug: filters.colour, isActive: true } : { isActive: true },
      },
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { pricePaise: "asc" }
      : filters.sort === "price-desc"
        ? { pricePaise: "desc" }
        : { createdAt: "desc" };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    products: products.map(serializeProduct),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null, category: { isActive: true, deletedAt: null } },
    include: productInclude,
  });
  return product ? serializeProduct(product) : null;
}

export async function getActiveCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  return categories.map((category) => ({
    ...category,
    imageUrl: mediaUrl(category.imageKey),
  }));
}

export async function getHomepageVideos() {
  const videos = await prisma.homepageVideo.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return videos.map((video) => ({
    ...video,
    videoUrl: videoPlaybackUrl(video.id, video.videoKey),
    posterUrl: mediaUrl(video.posterKey),
  }));
}

export async function getPublicReviews() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true, isVisible: true },
    orderBy: [{ displayOrder: "asc" }, { reviewDate: "desc" }],
    take: 12,
  });
  return reviews.map((review) => ({
    ...review,
    photoUrl: mediaUrl(review.photoKey),
  }));
}

export async function getFilterOptions() {
  const [sizes, colours] = await Promise.all([
    prisma.sizeOption.findMany({
      where: { isActive: true, variants: { some: { product: { isActive: true, deletedAt: null } } } },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.colourOption.findMany({
      where: { isActive: true, variants: { some: { product: { isActive: true, deletedAt: null } } } },
      orderBy: { displayOrder: "asc" },
    }),
  ]);
  return { sizes, colours };
}
