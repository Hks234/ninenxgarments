import { prisma } from "@/lib/prisma";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { errorResponse, getClientIp, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return errorResponse("Too many login attempts. Try again later.", 429);
  }
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("Invalid credentials", 400);
  const admin = await prisma.adminUser.findUnique({ where: { username: body.data.username } });
  if (!admin || !(await verifyPassword(body.data.password, admin.passwordHash))) {
    return errorResponse("Invalid username or password", 401);
  }
  await createAdminSession(admin.id);
  return json({ ok: true });
}
