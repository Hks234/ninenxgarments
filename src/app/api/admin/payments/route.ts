import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { razorpayConfigured } from "@/lib/razorpay";

export async function GET() {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  return json({
    configured: razorpayConfigured(),
    keyIdPreview: keyId ? `${keyId.slice(0, 8)}…` : "",
    webhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    message: razorpayConfigured()
      ? "Razorpay keys are loaded from server environment variables."
      : "Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET to the server environment. Secrets are never shown here.",
  });
}
