import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "./prisma";
import { confirmStock, releaseStock } from "./inventory";
import { safeEqual } from "./crypto";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay() {
  if (!razorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
}

export function publicKeyId() {
  return razorpayConfigured() ? process.env.RAZORPAY_KEY_ID : null;
}

export function verifyCheckoutSignature(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(expected, input.razorpay_signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export async function markOrderPaid(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: params.orderId } });
    if (!order) throw new Error("Order not found");
    if (order.razorpayOrderId !== params.razorpayOrderId) {
      throw new Error("Razorpay order mismatch");
    }
    if (order.paymentStatus === "PAID") {
      return order;
    }

    const existingPayment = await tx.paymentTransaction.findUnique({
      where: { razorpayPaymentId: params.razorpayPaymentId },
    });
    if (existingPayment) {
      return order;
    }

    await tx.paymentTransaction.create({
      data: {
        orderId: order.id,
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        amountPaise: order.totalPaise,
        status: "PAID",
        processedAt: new Date(),
      },
    });

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paidAt: new Date(),
      },
    });
    await confirmStock(tx, order.id);
    return updated;
  });
}

export async function markOrderFailed(orderId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentStatus === "PAID") return order;
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "PAYMENT_FAILED",
        paymentFailedAt: new Date(),
        paymentFailureInfo: reason,
      },
    });
    await releaseStock(tx, orderId);
    await tx.paymentTransaction.create({
      data: {
        orderId,
        razorpayOrderId: order.razorpayOrderId || "",
        amountPaise: order.totalPaise,
        status: "FAILED",
        failureReason: reason,
        processedAt: new Date(),
      },
    });
  });
}
