import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const q = new URL(request.url).searchParams.get("q") || "";
  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [{ name: { contains: q } }, { mobile: { contains: q } }],
        }
      : {},
    include: {
      orders: { select: { id: true, orderNumber: true, totalPaise: true, paymentStatus: true, createdAt: true } },
      addresses: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return json(
    customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      addresses: customer.addresses,
      orders: customer.orders,
      orderTotalPaise: customer.orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce((sum, order) => sum + order.totalPaise, 0),
    })),
  );
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id, isActive } = (await request.json()) as { id?: string; isActive?: boolean };
  if (!id) return errorResponse("Missing customer");
  await prisma.customer.update({ where: { id }, data: { isActive: Boolean(isActive) } });
  return json({ ok: true });
}
