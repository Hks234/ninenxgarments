import { notFound, redirect } from "next/navigation";
import { requireCustomer } from "@/lib/auth";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { mediaUrl } from "@/lib/storage";

export const metadata = { title: "Order details" };

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) redirect("/login?next=/orders");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: customer.id },
    include: { items: true, payments: true },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl">{order.orderNumber}</h1>
      <p className="text-[#b4b4ae]">{order.status} · Payment {order.paymentStatus}</p>
      <div className="border border-[#2a2a2a] p-5">
        <h2 className="font-display text-2xl">Delivery</h2>
        <p>{order.customerName} · {order.customerMobile}</p>
        <p>{order.houseNumber}, {order.street}, {order.city}, {order.state} {order.pinCode}</p>
      </div>
      {order.items.map((item) => (
        <div key={item.id} className="flex gap-4 border border-[#2a2a2a] p-4">
          {mediaUrl(item.imageKey) && <img src={mediaUrl(item.imageKey) || ""} alt="" className="h-20 w-20 object-cover" />}
          <div>
            <p>{item.productName}</p>
            <p className="text-sm text-[#b4b4ae]">{item.sizeLabel} / {item.colourName} × {item.quantity}</p>
            <p>{formatInr(item.lineTotalPaise)}</p>
          </div>
        </div>
      ))}
      <p className="text-xl">Total {formatInr(order.totalPaise)}</p>
    </div>
  );
}
