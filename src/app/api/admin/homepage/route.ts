import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { getHomepageConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/storage";

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  return json(await getHomepageConfig());
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const file = form.get("heroImage");
  let heroImageKey: string | undefined;
  if (file instanceof File && file.size > 0) heroImageKey = await saveImage(file, "homepage");
  const featuredProductIds = JSON.parse(String(form.get("featuredProductIds") || "[]")) as string[];
  const config = await prisma.homepageConfig.update({
    where: { id: 1 },
    data: {
      heroHeadline: String(form.get("heroHeadline") || ""),
      heroSubtext: String(form.get("heroSubtext") || ""),
      heroPrimaryCta: String(form.get("heroPrimaryCta") || "SHOP NOW"),
      heroSecondaryCta: String(form.get("heroSecondaryCta") || "EXPLORE COLLECTION"),
      introTitle: String(form.get("introTitle") || ""),
      introBody: String(form.get("introBody") || ""),
      showReviews: form.get("showReviews") === "true",
      showCategories: form.get("showCategories") === "true",
      showInstagram: form.get("showInstagram") === "true",
      showBenefits: form.get("showBenefits") === "true",
      showVideos: form.get("showVideos") === "true",
      featuredProductIds: featuredProductIds.slice(0, 20),
      ...(heroImageKey ? { heroImageKey } : {}),
    },
  });
  return json(config);
}
