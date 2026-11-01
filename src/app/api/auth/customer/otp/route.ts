import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { errorResponse, getClientIp, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { indianMobile } from "@/lib/validation";
import { getStoreSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`otp-ip:${ip}`, 10, 60 * 60 * 1000).ok) {
    return errorResponse("Too many OTP requests from this network.", 429);
  }
  const parsed = indianMobile.safeParse((await request.json().catch(() => ({}))).mobile);
  if (!parsed.success) return errorResponse("Enter a valid Indian mobile number");
  const mobile = parsed.data;
  if (!rateLimit(`otp-mobile:${mobile}`, 4, 10 * 60 * 1000).ok) {
    return errorResponse("Please wait before requesting another OTP.", 429);
  }
  const customer = await prisma.customer.upsert({
    where: { mobile },
    update: {},
    create: { mobile },
  });
  if (!customer.isActive) return errorResponse("This account is not active.", 403);
  const result = await createOtp(mobile);
  const settings = await getStoreSettings();
  const display =
    settings.otpDisplayEnabled &&
    process.env.OTP_DISPLAY_MODE === "true" &&
    process.env.NODE_ENV !== "production";
  return json({
    challengeId: result.challengeId,
    expiresAt: result.expiresAt,
    developmentOtp: display ? result.otp : undefined,
    notice: display
      ? "Development OTP is shown on screen. This does not verify ownership of the mobile number."
      : "OTP generated. Configure an SMS provider to deliver it in production.",
  });
}
