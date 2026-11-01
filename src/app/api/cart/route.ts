import { getCustomer, requireCustomer } from "@/lib/auth";
import { getCartSummary, getOrCreateCart } from "@/lib/cart";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1).max(20),
});

export async function GET() {
  const customer = await getCustomer();
  if (!customer) return json({ items: [], totalPaise: 0, count: 0, loggedIn: false });
  const summary = await getCartSummary(customer.id);
  return json({ ...summary, loggedIn: true });
}

export async function POST(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required to add items to your cart.", 401);
  const body = addSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return errorResponse("Select a valid size and colour.");
  const variant = await prisma.productVariant.findUnique({
    where: { id: body.data.variantId },
    include: { product: true },
  });
  if (!variant || variant.productId !== body.data.productId) {
    return errorResponse("Invalid product variant");
  }
  if (!variant.product.isActive || variant.product.deletedAt) {
    return errorResponse("This product is unavailable");
  }
  if (variant.stock < body.data.quantity) {
    return errorResponse("Requested quantity is not in stock");
  }
  const cart = await getOrCreateCart(customer.id);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });
  const nextQty = (existing?.quantity || 0) + body.data.quantity;
  if (nextQty > variant.stock) return errorResponse("Not enough stock for this size and colour");
  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    update: { quantity: nextQty },
    create: {
      cartId: cart.id,
      productId: variant.productId,
      variantId: variant.id,
      quantity: body.data.quantity,
    },
  });
  return json(await getCartSummary(customer.id));
}

export async function PATCH(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const body = z.object({ itemId: z.string(), quantity: z.number().int().min(1).max(20) }).safeParse(await request.json());
  if (!body.success) return errorResponse("Invalid quantity");
  const item = await prisma.cartItem.findFirst({
    where: { id: body.data.itemId, cart: { customerId: customer.id } },
    include: { variant: true },
  });
  if (!item) return errorResponse("Cart item not found", 404);
  if (body.data.quantity > item.variant.stock) return errorResponse("Not enough stock");
  await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: body.data.quantity } });
  return json(await getCartSummary(customer.id));
}

export async function DELETE(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const { itemId } = (await request.json().catch(() => ({}))) as { itemId?: string };
  if (!itemId) return errorResponse("Missing item");
  await prisma.cartItem.deleteMany({ where: { id: itemId, cart: { customerId: customer.id } } });
  return json(await getCartSummary(customer.id));
}
