import { requireCustomer } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart";
import { errorResponse, json } from "@/lib/http";
import { expireUnpaidOrders, reserveStock } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import { getRazorpay, publicKeyId, razorpayConfigured } from "@/lib/razorpay";
import { addressInput } from "@/lib/validation";
import { orderNumber } from "@/lib/crypto";

export async function POST(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required before checkout.", 401);
  await expireUnpaidOrders();
  const body = addressInput.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse(body.error.issues[0]?.message || "Invalid address");
  const cart = await getCartSummary(customer.id);
  if (!cart.items.length) return errorResponse("Your cart is empty");
  for (const item of cart.items) {
    if (!item.active) return errorResponse(`${item.name} is no longer available`);
    if (item.quantity > item.stock) return errorResponse(`${item.name} does not have enough stock`);
  }

  let addressId: string | undefined;
  if (body.data.saveAddress) {
    const address = await prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        fullName: body.data.fullName,
        mobile: body.data.mobile,
        houseNumber: body.data.houseNumber,
        street: body.data.street,
        city: body.data.city,
        state: body.data.state,
        pinCode: body.data.pinCode,
        landmark: body.data.landmark || null,
      },
    });
    addressId = address.id;
  }

  if (!razorpayConfigured()) {
    return json({
      configured: false,
      message: "Online payment is not configured yet. Add Razorpay keys on the server to accept orders.",
      totalPaise: cart.totalPaise,
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: customer.id,
        addressId,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        totalPaise: cart.totalPaise,
        customerName: body.data.fullName,
        customerMobile: body.data.mobile,
        houseNumber: body.data.houseNumber,
        street: body.data.street,
        city: body.data.city,
        state: body.data.state,
        pinCode: body.data.pinCode,
        landmark: body.data.landmark || null,
        stockReserved: true,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            imageKey: item.imageKey,
            sizeLabel: item.size,
            colourName: item.colour,
            quantity: item.quantity,
            unitPricePaise: item.unitPricePaise,
            lineTotalPaise: item.lineTotalPaise,
          })),
        },
      },
    });
    await reserveStock(
      tx,
      order.id,
      cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    );
    return order;
  });

  const razorpay = getRazorpay();
  const rzpOrder = await razorpay.orders.create({
    amount: created.totalPaise,
    currency: "INR",
    receipt: created.orderNumber,
    notes: { orderId: created.id },
  });
  await prisma.order.update({
    where: { id: created.id },
    data: { razorpayOrderId: rzpOrder.id, paymentStatus: "PROCESSING", status: "PAYMENT_PROCESSING" },
  });
  await prisma.paymentTransaction.create({
    data: {
      orderId: created.id,
      razorpayOrderId: rzpOrder.id,
      amountPaise: created.totalPaise,
      status: "PROCESSING",
    },
  });
  await prisma.cartItem.deleteMany({ where: { cart: { customerId: customer.id } } });

  return json({
    configured: true,
    keyId: publicKeyId(),
    razorpayOrderId: rzpOrder.id,
    amountPaise: created.totalPaise,
    orderId: created.id,
    orderNumber: created.orderNumber,
    customerName: body.data.fullName,
    customerMobile: body.data.mobile,
  });
}
