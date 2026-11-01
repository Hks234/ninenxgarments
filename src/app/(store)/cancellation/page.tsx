export const metadata = { title: "Cancellation and Refund Policy" };

export default function CancellationPage() {
  return (
    <article className="max-w-3xl space-y-4 text-[#b4b4ae]">
      <h1 className="font-display text-5xl text-white">Cancellation and Refund Policy</h1>
      <p>
        Orders are accepted only after online payment through Razorpay. Cash on Delivery is not offered. A request to
        cancel an unpaid or incomplete payment attempt is handled automatically when the payment window expires.
      </p>
      <p>
        After payment is verified, cancellation and refund requests are reviewed against the order status. If an item
        has already been packed or shipped, a refund may not be possible. Approved refunds are returned through the
        original Razorpay payment method.
      </p>
      <p>
        Contact NINE XN GARMENTS in Burhanpur with the order number for any cancellation or refund request. This policy
        does not promise automatic refunds for change of mind after dispatch.
      </p>
    </article>
  );
}
