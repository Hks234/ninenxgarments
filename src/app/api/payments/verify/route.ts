import { requireCustomer } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { markOrderPaid, verifyCheckoutSignature } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("Invalid payment payload");
  const order = await prisma.order.findFirst({
    where: { id: body.data.orderId, customerId: customer.id },
  });
  if (!order) return errorResponse("Order not found", 404);
  if (!verifyCheckoutSignature(body.data)) {
    return errorResponse("Payment signature verification failed", 400);
  }
  const paid = await markOrderPaid({
    orderId: order.id,
    razorpayOrderId: body.data.razorpay_order_id,
    razorpayPaymentId: body.data.razorpay_payment_id,
    razorpaySignature: body.data.razorpay_signature,
  });
  return json({ ok: true, orderNumber: paid.orderNumber, paymentStatus: paid.paymentStatus });
}
