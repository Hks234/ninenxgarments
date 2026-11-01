import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getStoreSettings();
  return (
    <article className="mx-auto max-w-3xl space-y-6 reveal-in">
      <p className="text-xs uppercase tracking-[0.4em] text-[#c8b273]">NINE XN GARMENTS</p>
      <h1 className="hero-title font-display text-5xl">About the store</h1>
      <p className="text-lg leading-8 text-[#b4b4ae]">
        {settings.businessName} is a garment exporter and clothing store in Burhanpur, Madhya Pradesh. The collection is
        presented with clear product details, size and colour choice, and checkout through Razorpay online payment.
      </p>
      <p className="leading-8 text-[#b4b4ae]">{settings.businessAddress}</p>
      <p>
        Phone:{" "}
        <a className="text-[#c8b273]" href={`tel:${settings.businessPhone.replace(/\s+/g, "")}`}>
          {settings.businessPhone}
        </a>
      </p>
      <div className="flex flex-wrap gap-4 pt-4">
        <Link href="/shop" className="btn-gold bg-[#c8b273] px-8 py-3 text-sm tracking-[0.2em] text-black">
          SHOP NOW
        </Link>
        <Link href="/contact" className="btn-outline border border-[#c8b273] px-8 py-3 text-sm tracking-[0.2em]">
          CONTACT
        </Link>
      </div>
    </article>
  );
}
