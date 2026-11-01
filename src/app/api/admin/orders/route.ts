import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { mediaUrl } from "@/lib/storage";

export async function GET(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const exportCsv = searchParams.get("export") === "csv";
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { orderNumber: { contains: q } },
                { customerName: { contains: q } },
                { customerMobile: { contains: q } },
              ],
            }
          : {},
        status ? { status: status as never } : {},
        paymentStatus ? { paymentStatus: paymentStatus as never } : {},
        from || to
          ? {
              createdAt: {
                gte: from ? new Date(from) : undefined,
                lte: to ? new Date(to) : undefined,
              },
            }
          : {},
      ],
    },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: exportCsv ? 5000 : 100,
  });
  if (exportCsv) {
    const header = "Order Number,Date,Customer,Mobile,City,PIN,Status,Payment,Total Paise\n";
    const rows = orders
      .map((order) =>
        [order.orderNumber, order.createdAt.toISOString(), order.customerName, order.customerMobile, order.city, order.pinCode, order.status, order.paymentStatus, order.totalPaise].join(","),
      )
      .join("\n");
    return new Response(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=orders.csv",
      },
    });
  }
  return json(
    orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item, imageUrl: mediaUrl(item.imageKey) })),
    })),
  );
}
