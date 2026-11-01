import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { getStoreSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { deleteImage, mediaUrl, saveImage } from "@/lib/storage";

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const settings = await getStoreSettings();
  return json({ logoKey: settings.logoKey, logoUrl: settings.logoUrl });
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const form = await request.formData();
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) return errorResponse("Choose a logo image");
  const current = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  const logoKey = await saveImage(file, "brand");
  await prisma.storeSettings.update({ where: { id: 1 }, data: { logoKey, faviconKey: logoKey } });
  await deleteImage(current?.logoKey);
  return json({ logoUrl: mediaUrl(logoKey), logoKey });
}

export async function DELETE() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const current = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  await prisma.storeSettings.update({ where: { id: 1 }, data: { logoKey: null, faviconKey: null } });
  await deleteImage(current?.logoKey);
  return json({ ok: true, logoUrl: null });
}
