import { requireCustomer } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { mediaUrl } from "@/lib/storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const { id } = await context.params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
    include: { items: true, payments: true },
  });
  if (!order) return errorResponse("Order not found", 404);
  return json({
    ...order,
    items: order.items.map((item) => ({ ...item, imageUrl: mediaUrl(item.imageKey) })),
  });
}
