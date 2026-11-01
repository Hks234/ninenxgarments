import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";

const schema = z.object({
  label: z.string().trim().min(1).max(30),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  return json(await prisma.sizeOption.findMany({ orderBy: { displayOrder: "asc" } }));
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const body = schema.safeParse(await request.json());
  if (!body.success) return errorResponse("Size label is required");
  const slug = await uniqueSlug(body.data.label, async (s) => Boolean(await prisma.sizeOption.findUnique({ where: { slug: s } })));
  return json(await prisma.sizeOption.create({ data: { ...body.data, slug } }));
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const body = z.object({ id: z.string(), label: z.string().optional(), isActive: z.boolean().optional(), displayOrder: z.number().int().optional() }).safeParse(await request.json());
  if (!body.success) return errorResponse("Invalid size");
  const { id, ...data } = body.data;
  return json(await prisma.sizeOption.update({ where: { id }, data }));
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = (await request.json()) as { id?: string };
  if (!id) return errorResponse("Missing size");
  const used = await prisma.productVariant.count({ where: { sizeId: id } });
  if (used) return errorResponse("This size is used by products or orders and cannot be deleted. Deactivate it instead.");
  await prisma.sizeOption.delete({ where: { id } });
  return json({ ok: true });
}
