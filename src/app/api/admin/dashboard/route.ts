import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";

export async function GET() {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return errorResponse("Unauthorized", 401);
  const settings = await getStoreSettings();
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    totalCustomers,
    totalOrders,
    pendingOrders,
    paidOrders,
    failedPayments,
    paidSum,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAYMENT_PROCESSING"] } } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { paymentStatus: "FAILED" } }),
    prisma.order.aggregate({ _sum: { totalPaise: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.productVariant.findMany({
      where: { stock: { lte: settings.lowStockThreshold }, product: { deletedAt: null } },
      include: { product: true, size: true, colour: true },
      take: 12,
      orderBy: { stock: "asc" },
    }),
  ]);
  return json({
    totalProducts,
    activeProducts,
    totalCategories,
    totalCustomers,
    totalOrders,
    pendingOrders,
    paidOrders,
    failedPayments,
    totalPaidPaise: paidSum._sum.totalPaise || 0,
    recentOrders,
    lowStock,
  });
}
