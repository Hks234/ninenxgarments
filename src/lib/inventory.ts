import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type Tx = Prisma.TransactionClient;

export async function reserveStock(
  tx: Tx,
  orderId: string,
  items: { variantId: string; quantity: number }[],
) {
  for (const item of items) {
    const updated = await tx.productVariant.updateMany({
      where: { id: item.variantId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new Error("One or more items are out of stock");
    }
    await tx.inventoryMovement.create({
      data: {
        variantId: item.variantId,
        type: "RESERVE",
        quantity: -item.quantity,
        orderId,
        note: "Reserved for pending payment",
      },
    });
  }
}

export async function releaseStock(tx: Tx, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order?.stockReserved) return;
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: item.variantId,
        type: "RELEASE",
        quantity: item.quantity,
        orderId,
        note: "Released unpaid/cancelled reservation",
      },
    });
  }
  await tx.order.update({
    where: { id: orderId },
    data: { stockReserved: false },
  });
}

export async function confirmStock(tx: Tx, orderId: string) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.inventoryMovement.create({
      data: {
        variantId: item.variantId,
        type: "CONFIRM",
        quantity: 0,
        orderId,
        note: "Payment confirmed; reservation converted to sale",
      },
    });
  }
}

export async function expireUnpaidOrders() {
  const expired = await prisma.order.findMany({
    where: {
      paymentStatus: { in: ["PENDING", "PROCESSING"] },
      stockReserved: true,
      expiresAt: { lt: new Date() },
    },
    select: { id: true },
  });
  for (const order of expired) {
    await prisma.$transaction(async (tx) => {
      await releaseStock(tx, order.id);
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_FAILED", paymentStatus: "CANCELLED" },
      });
    });
  }
}
