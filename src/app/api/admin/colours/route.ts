import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  hex: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  return json(await prisma.colourOption.findMany({ orderBy: { displayOrder: "asc" } }));
}

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const body = schema.safeParse(await request.json());
  if (!body.success) return errorResponse("Colour name is required");
  const slug = await uniqueSlug(body.data.name, async (s) => Boolean(await prisma.colourOption.findUnique({ where: { slug: s } })));
  return json(await prisma.colourOption.create({ data: { ...body.data, hex: body.data.hex || null, slug } }));
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const body = z.object({ id: z.string(), name: z.string().optional(), hex: z.string().nullable().optional(), isActive: z.boolean().optional(), displayOrder: z.number().int().optional() }).safeParse(await request.json());
  if (!body.success) return errorResponse("Invalid colour");
  const { id, ...data } = body.data;
  return json(await prisma.colourOption.update({ where: { id }, data }));
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const { id } = (await request.json()) as { id?: string };
  if (!id) return errorResponse("Missing colour");
  const used = await prisma.productVariant.count({ where: { colourId: id } });
  if (used) return errorResponse("This colour is used by products or orders and cannot be deleted. Deactivate it instead.");
  await prisma.colourOption.delete({ where: { id } });
  return json({ ok: true });
}
