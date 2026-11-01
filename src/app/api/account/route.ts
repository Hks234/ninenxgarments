import { getCustomer, requireCustomer } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return json({ customer: null });
  const [addresses, orders] = await Promise.all([
    prisma.customerAddress.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { items: true },
    }),
  ]);
  return json({
    customer: { id: customer.id, name: customer.name, mobile: customer.mobile },
    addresses,
    orders,
  });
}

export async function PATCH(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const body = z.object({ name: z.string().trim().min(2).max(80) }).safeParse(await request.json());
  if (!body.success) return errorResponse("Enter your name");
  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: { name: body.data.name },
  });
  return json({ customer: { id: updated.id, name: updated.name, mobile: updated.mobile } });
}
