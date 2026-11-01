import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { markOrderFailed, markOrderPaid, verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return new Response("invalid signature", { status: 400 });
  }
  const event = JSON.parse(raw) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string; status: string; error_description?: string } } };
  };
  const payment = event.payload?.payment?.entity;
  const eventId = `${event.event}:${payment?.id || createHash("sha256").update(raw).digest("hex")}`;
  const existing = await prisma.paymentWebhookEvent.findUnique({ where: { eventId } });
  if (existing?.processedAt) return new Response("ok");
  const record = await prisma.paymentWebhookEvent.upsert({
    where: { eventId },
    update: {},
    create: {
      eventId,
      eventType: event.event,
      payloadHash: createHash("sha256").update(raw).digest("hex"),
    },
  });
  if (payment?.order_id) {
    const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
    if (order) {
      if (event.event === "payment.captured" || payment.status === "captured") {
        await markOrderPaid({
          orderId: order.id,
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
        });
      }
      if (event.event === "payment.failed") {
        await markOrderFailed(order.id, payment.error_description || "Payment failed");
      }
      await prisma.paymentWebhookEvent.update({
        where: { id: record.id },
        data: { orderId: order.id, processedAt: new Date() },
      });
    }
  } else {
    await prisma.paymentWebhookEvent.update({
      where: { id: record.id },
      data: { processedAt: new Date() },
    });
  }
  return new Response("ok");
}
