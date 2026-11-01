import { requireCustomer } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { addressInput } from "@/lib/validation";

export async function POST(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const body = addressInput.safeParse(await request.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message || "Invalid address");
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
  return json({ address });
}

export async function DELETE(request: Request) {
  const customer = await requireCustomer().catch(() => null);
  if (!customer) return errorResponse("Login required", 401);
  const { id } = (await request.json()) as { id?: string };
  await prisma.customerAddress.deleteMany({ where: { id, customerId: customer.id } });
  return json({ ok: true });
}
