import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { randomToken, sha256 } from "./crypto";

const ADMIN_COOKIE = "nxn_admin";
const CUSTOMER_COOKIE = "nxn_customer";
const ADMIN_TTL_DAYS = 7;
const CUSTOMER_TTL_DAYS = 30;

function cookieOptions(days: number) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: days * 24 * 60 * 60,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(adminId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + ADMIN_TTL_DAYS * 86400000);
  await prisma.adminSession.create({
    data: { adminId, tokenHash: sha256(token), expiresAt },
  });
  (await cookies()).set(ADMIN_COOKIE, token, cookieOptions(ADMIN_TTL_DAYS));
}

export async function createCustomerSession(customerId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + CUSTOMER_TTL_DAYS * 86400000);
  await prisma.customerSession.create({
    data: { customerId, tokenHash: sha256(token), expiresAt },
  });
  (await cookies()).set(CUSTOMER_COOKIE, token, cookieOptions(CUSTOMER_TTL_DAYS));
}

export async function destroyAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function destroyCustomerSession() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (token) {
    await prisma.customerSession.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.admin;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return admin;
}

export async function getCustomer() {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { customer: true },
  });
  if (!session || session.expiresAt < new Date() || !session.customer.isActive) {
    return null;
  }
  return session.customer;
}

export async function requireCustomer() {
  const customer = await getCustomer();
  if (!customer) {
    throw Object.assign(new Error("Login required"), { status: 401 });
  }
  return customer;
}
