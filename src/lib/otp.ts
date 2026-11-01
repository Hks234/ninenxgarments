import { prisma } from "./prisma";
import { randomOtp, sha256 } from "./crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function createOtp(mobile: string) {
  const code = randomOtp();
  const challenge = await prisma.otpChallenge.create({
    data: {
      mobile,
      codeHash: sha256(`${mobile}:${code}`),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  const display =
    process.env.OTP_DISPLAY_MODE === "true" && process.env.NODE_ENV !== "production";
  return {
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    otp: display ? code : undefined,
  };
}

export async function verifyOtp(mobile: string, challengeId: string, code: string) {
  const challenge = await prisma.otpChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.mobile !== mobile) {
    return { ok: false as const, error: "Invalid OTP request" };
  }
  if (challenge.consumedAt) {
    return { ok: false as const, error: "This OTP has already been used" };
  }
  if (challenge.expiresAt < new Date()) {
    return { ok: false as const, error: "OTP expired. Request a new one." };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    return { ok: false as const, error: "Too many attempts. Request a new OTP." };
  }
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
  });
  if (challenge.codeHash !== sha256(`${mobile}:${code}`)) {
    return { ok: false as const, error: "Incorrect OTP" };
  }
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true as const };
}
