import { destroyCustomerSession } from "@/lib/auth";
import { json } from "@/lib/http";

export async function POST() {
  await destroyCustomerSession();
  return json({ ok: true });
}
