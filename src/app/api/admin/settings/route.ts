import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { getStoreSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  return json(await getStoreSettings());
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const schema = z.object({
    businessName: z.string().min(2),
    businessPhone: z.string().min(8),
    businessAddress: z.string().min(8),
    instagramUrl: z.string().url(),
    lowStockThreshold: z.number().int().min(0),
    otpDisplayEnabled: z.boolean(),
    footerText: z.string().optional(),
  });
  const body = schema.safeParse(await request.json());
  if (!body.success) return errorResponse("Invalid store settings");
  const settings = await prisma.storeSettings.update({ where: { id: 1 }, data: body.data });
  return json(settings);
}
