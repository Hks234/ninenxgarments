import Link from "next/link";
import { HomepageVideos } from "@/components/store/HomepageVideos";
import { Logo } from "@/components/store/Logo";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal } from "@/components/store/Reveal";
import { getHomepageConfig, getStoreSettings } from "@/lib/settings";
import { getActiveCategories, getHomepageProducts, getHomepageVideos, getPublicReviews } from "@/lib/storefront";

export default async function HomePage() {
  let settings;
  let homepage;
  let products: Awaited<ReturnType<typeof getHomepageProducts>> = [];
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  let reviews: Awaited<ReturnType<typeof getPublicReviews>> = [];
  let videos: Awaited<ReturnType<typeof getHomepageVideos>> = [];
  try {
    [settings, homepage, products, categories, reviews, videos] = await Promise.all([
      getStoreSettings(),
      getHomepageConfig(),
      getHomepageProducts(),
      getActiveCategories(),
      getPublicReviews(),
      getHomepageVideos(),
    ]);
  } catch {
    return (
      <div className="border border-[#2a2a2a] p-10 text-center">
        <h1 className="font-display text-5xl">NINE XN GARMENTS</h1>
        <p className="mt-4 text-[#b4b4ae]">
          The storefront is ready, but MySQL is not connected yet. Start this project&apos;s database with npm run setup, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-[32px] border border-[#2a2a2a] bg-[#0b0b0b]">
        {homepage.heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={homepage.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 kenburns" />
        )}
        <div className="hero-glow" />
        <div className="relative px-6 py-24 text-center md:py-40">
          <div className="mb-8 flex justify-center reveal-in">
            <Logo name={settings.businessName} url={settings.logoUrl} size="hero" />
          </div>
          <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[#c8b273] reveal-in">NINE XN GARMENTS</p>
          <h1 className="hero-title font-display text-5xl md:text-8xl">{homepage.heroHeadline}</h1>
          <div className="gold-rule mx-auto my-8 w-40" />
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#d7d7d0]">{homepage.heroSubtext}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-gold bg-[#c8b273] px-8 py-3 text-sm tracking-[0.2em] text-black">
              {homepage.heroPrimaryCta}
            </Link>
            <Link href="/categories" className="btn-outline border border-[#c8b273] px-8 py-3 text-sm tracking-[0.2em]">
              {homepage.heroSecondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {homepage.showVideos && videos.length > 0 && (
        <Reveal>
          <HomepageVideos videos={videos} />
        </Reveal>
      )}

      <Reveal>
        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">{homepage.introTitle}</h2>
            <div className="gold-rule my-4" />
          </div>
          <p className="text-lg leading-8 text-[#b4b4ae]">{homepage.introBody}</p>
        </section>
      </Reveal>

      {homepage.showCategories && (
        <Reveal>
          <section>
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-4xl">Categories</h2>
              <Link href="/categories" className="text-sm text-[#c8b273]">
                View all
              </Link>
            </div>
            {categories.length === 0 ? (
              <p className="border border-[#2a2a2a] p-8 text-[#b4b4ae]">Categories will appear here once they are added in the admin dashboard.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`} className="luxury-card group overflow-hidden border border-[#2a2a2a]">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={category.imageUrl} alt={category.name} className="h-56 w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-56 bg-[#111]" />
                    )}
                    <div className="flex items-center justify-between p-4">
                      <span className="font-display text-2xl">{category.name}</span>
                      <span className="text-xs uppercase tracking-wider text-[#c8b273]">Shop Category</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </Reveal>
      )}

      <Reveal>
        <section>
          <h2 className="mb-8 font-display text-4xl">Featured Products</h2>
          {products.length === 0 ? (
            <p className="border border-[#2a2a2a] p-8 text-[#b4b4ae]">Products will appear here after they are published from the admin dashboard.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link href="/shop" className="btn-outline inline-block border border-[#c8b273] px-10 py-3 tracking-[0.25em]">
              SHOW MORE
            </Link>
          </div>
        </section>
      </Reveal>

      {homepage.showBenefits && (
        <Reveal>
          <section className="grid gap-6 md:grid-cols-3">
            {["Tailored presentation", "Size and colour choice", "Secure online payment"].map((item) => (
              <div key={item} className="luxury-card border border-[#2a2a2a] bg-[#111] p-6">
                <h3 className="font-display text-2xl">{item}</h3>
                <p className="mt-3 text-sm leading-7 text-[#b4b4ae]">
                  {item === "Secure online payment"
                    ? "Checkout uses Razorpay. Cash on Delivery is not offered."
                    : item === "Size and colour choice"
                      ? "Choose from sizes and colours configured for each garment."
                      : "A focused clothing collection presented with clear product details."}
                </p>
              </div>
            ))}
          </section>
        </Reveal>
      )}

      {homepage.showReviews && (
        <Reveal>
          <section>
            <h2 className="mb-8 font-display text-4xl">WHAT CUSTOMERS SAY</h2>
            {reviews.length === 0 ? (
              <p className="border border-[#2a2a2a] p-8 text-[#b4b4ae]">Approved reviews added in the admin dashboard will appear here.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {reviews.map((review) => (
                  <article key={review.id} className="luxury-card border border-[#2a2a2a] bg-[#111] p-6">
                    {review.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={review.photoUrl} alt="" className="mb-4 h-16 w-16 rounded-full object-cover" />
                    )}
                    <p className="text-[#c8b273]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                    <p className="mt-4 text-[#e8e8e2]">{review.body}</p>
                    <p className="mt-6 text-sm uppercase tracking-wider">{review.displayName}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </Reveal>
      )}

      {homepage.showInstagram && (
        <Reveal>
          <section className="overflow-hidden rounded-[28px] border border-[#2a2a2a] bg-[#0b0b0b] px-6 py-14 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#c8b273]">Social</p>
            <h2 className="mt-3 font-display text-4xl">Follow the collection</h2>
            <p className="mt-3 text-[#b4b4ae]">See new pieces from {settings.businessName} on Instagram.</p>
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="btn-gold mt-6 inline-block bg-[#c8b273] px-8 py-3 text-black">
              Instagram
            </a>
          </section>
        </Reveal>
      )}
    </div>
  );
}
