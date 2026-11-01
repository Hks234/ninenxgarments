import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { mediaUrl } from "@/lib/storage";
import { OrderStatus } from "@prisma/client";

const ALLOWED: Record<string, OrderStatus[]> = {
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  PAYMENT_FAILED: ["CANCELLED"],
  PENDING_PAYMENT: ["CANCELLED"],
  PAYMENT_PROCESSING: ["CANCELLED"],
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true, customer: true },
  });
  if (!order) return errorResponse("Order not found", 404);
  return json({
    ...order,
    customer: { id: order.customer.id, name: order.customer.name, mobile: order.customer.mobile },
    items: order.items.map((item) => ({ ...item, imageUrl: mediaUrl(item.imageKey) })),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus; internalNotes?: string };
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return errorResponse("Order not found", 404);
  if (body.status) {
    if (body.status === "CONFIRMED" && order.paymentStatus !== "PAID") {
      return errorResponse("Paid status is determined by verified Razorpay payment, not order fulfilment.");
    }
    const allowed = ALLOWED[order.status] || [];
    if (!allowed.includes(body.status)) {
      return errorResponse("This fulfilment status change is not allowed.");
    }
  }
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: body.status || undefined,
      internalNotes: body.internalNotes ?? undefined,
    },
  });
  return json(updated);
}
