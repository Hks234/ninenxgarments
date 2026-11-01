import { prisma } from "./prisma";
import { multiplyPaise, addPaise } from "./money";
import { mediaUrl } from "./storage";

export async function getOrCreateCart(customerId: string) {
  return prisma.cart.upsert({
    where: { customerId },
    update: {},
    create: { customerId },
  });
}

export async function getCartSummary(customerId: string) {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { displayOrder: "asc" }, take: 1 } } },
          variant: { include: { size: true, colour: true } },
        },
      },
    },
  });
  if (!cart) {
    return { items: [], totalPaise: 0, count: 0 };
  }
  const items = cart.items.map((item) => {
    const unitPricePaise = item.product.pricePaise;
    const lineTotalPaise = multiplyPaise(unitPricePaise, item.quantity);
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: item.product.slug,
      imageKey: item.product.images[0]?.imageKey || null,
      imageUrl: mediaUrl(item.product.images[0]?.imageKey),
      size: item.variant.size.label,
      colour: item.variant.colour.name,
      quantity: item.quantity,
      stock: item.variant.stock,
      unitPricePaise,
      lineTotalPaise,
      active: item.product.isActive && !item.product.deletedAt,
    };
  });
  return {
    items,
    totalPaise: addPaise(items.map((item) => item.lineTotalPaise)),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
