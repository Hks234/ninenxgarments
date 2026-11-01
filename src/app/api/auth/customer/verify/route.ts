import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";
import { errorResponse, getClientIp, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { indianMobile, otpSchema } from "@/lib/validation";
import { z } from "zod";

const schema = z.object({
  mobile: indianMobile,
  challengeId: z.string().min(1),
  otp: otpSchema,
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`otp-verify:${ip}`, 20, 15 * 60 * 1000).ok) {
    return errorResponse("Too many verification attempts.", 429);
  }
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("Invalid verification details");
  const result = await verifyOtp(body.data.mobile, body.data.challengeId, body.data.otp);
  if (!result.ok) return errorResponse(result.error, 400);
  const customer = await prisma.customer.findUnique({ where: { mobile: body.data.mobile } });
  if (!customer || !customer.isActive) return errorResponse("Account unavailable", 403);
  await createCustomerSession(customer.id);
  return json({ ok: true, customer: { id: customer.id, mobile: customer.mobile, name: customer.name } });
}
