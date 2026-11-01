import Link from "next/link";

export const metadata = { title: "Payment result" };

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>;
}) {
  const { status, order } = await searchParams;
  const success = status === "success";
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-5xl">{success ? "Payment received" : "Payment not completed"}</h1>
      <p className="mt-4 text-[#b4b4ae]">
        {success
          ? `Order ${order} will appear in your account after verified payment confirmation.`
          : "The order remains unpaid until Razorpay payment is verified on the server."}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/orders" className="border border-[#c8b273] px-5 py-2">My orders</Link>
        <Link href="/shop" className="bg-[#c8b273] px-5 py-2 text-black">Continue shopping</Link>
      </div>
    </div>
  );
}
