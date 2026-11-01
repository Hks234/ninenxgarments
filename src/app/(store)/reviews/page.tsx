import { getPublicReviews } from "@/lib/storefront";

export const metadata = { title: "Customer Reviews" };

export default async function ReviewsPage() {
  const reviews = await getPublicReviews();
  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">WHAT CUSTOMERS SAY</h1>
      {reviews.length === 0 ? (
        <p className="text-[#b4b4ae]">No approved reviews are published yet.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="luxury-card border border-[#2a2a2a] p-6">
              {review.photoUrl && <img src={review.photoUrl} alt="" className="mb-4 h-16 w-16 rounded-full object-cover" />}
              <p className="text-[#c8b273]">{"★".repeat(review.rating)}</p>
              <p className="mt-3">{review.body}</p>
              <p className="mt-4 text-sm uppercase tracking-wider">{review.displayName}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
