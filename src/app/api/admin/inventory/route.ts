import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const q = new URL(request.url).searchParams.get("q") || "";
  const variants = await prisma.productVariant.findMany({
    where: {
      product: { deletedAt: null, name: q ? { contains: q } : undefined },
    },
    include: { product: true, size: true, colour: true },
    orderBy: { updatedAt: "desc" },
  });
  const movements = await prisma.inventoryMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { variant: { include: { product: true, size: true, colour: true } } },
  });
  return json({ variants, movements });
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const body = z.object({ variantId: z.string(), stock: z.number().int().min(0), note: z.string().optional() }).safeParse(await request.json());
  if (!body.success) return errorResponse("Invalid stock update");
  const current = await prisma.productVariant.findUnique({ where: { id: body.data.variantId } });
  if (!current) return errorResponse("Variant not found");
  const delta = body.data.stock - current.stock;
  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: current.id }, data: { stock: body.data.stock } }),
    prisma.inventoryMovement.create({
      data: {
        variantId: current.id,
        type: "ADJUSTMENT",
        quantity: delta,
        note: body.data.note || "Admin stock adjustment",
      },
    }),
  ]);
  return json({ ok: true });
}
