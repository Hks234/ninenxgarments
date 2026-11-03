import { prisma } from "./prisma";
import { mediaUrl } from "./storage";

export const DEFAULT_SETTINGS = {
  businessName: "NINE XN GARMENTS",
  businessPhone: "099931 22660",
  businessAddress: "Old Nagar Nigam Road, Goti Maholla, Burhanpur, Madhya Pradesh 450331, India.",
  instagramUrl: "https://www.instagram.com/ninexngarmentsburhanpur/",
  lowStockThreshold: 5,
  otpDisplayEnabled: true,
};

export const DEFAULT_HOMEPAGE = {
  heroHeadline: "STYLE THAT DEFINES YOU",
  heroSubtext: "Discover your style with NINE XN GARMENTS.",
  heroPrimaryCta: "SHOP NOW",
  heroSecondaryCta: "EXPLORE COLLECTION",
  introTitle: "Garments from Burhanpur",
  introBody:
    "NINE XN GARMENTS is a garment exporter and clothing store in Burhanpur, Madhya Pradesh. Explore the collection, choose your size and colour, and shop a carefully presented range of clothing.",
  showReviews: true,
  showCategories: true,
  showInstagram: true,
  showBenefits: true,
  showVideos: true,
  featuredProductIds: [] as string[],
};

export async function getStoreSettings() {
  const row = await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ...DEFAULT_SETTINGS,
    },
  });
  return {
    ...row,
    logoUrl: mediaUrl(row.logoKey) || "/nine-xn-logo.png",
    faviconUrl: mediaUrl(row.faviconKey || row.logoKey) || "/nine-xn-logo.png",
  };
}

export async function getHomepageConfig() {
  const row = await prisma.homepageConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ...DEFAULT_HOMEPAGE,
      featuredProductIds: [],
    },
  });
  const featuredProductIds = Array.isArray(row.featuredProductIds)
    ? (row.featuredProductIds as string[])
    : [];
  return {
    ...row,
    featuredProductIds,
    heroImageUrl: mediaUrl(row.heroImageKey),
  };
}
