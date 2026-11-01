import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).max(72),
});

export async function POST(request: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return errorResponse("Unauthorized", 401);
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("Password must be at least 10 characters.");
  if (!(await verifyPassword(body.data.currentPassword, admin.passwordHash))) {
    return errorResponse("Current password is incorrect", 400);
  }
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(body.data.newPassword) },
  });
  return json({ ok: true });
}
