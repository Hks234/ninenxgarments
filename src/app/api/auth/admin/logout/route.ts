import { destroyAdminSession } from "@/lib/auth";
import { json } from "@/lib/http";

export async function POST() {
  await destroyAdminSession();
  return json({ ok: true });
}
