import Link from "next/link";
import { Logo } from "./Logo";

export function Footer({
  name,
  address,
  phone,
  instagram,
  logoUrl,
  footerText,
}: {
  name: string;
  address: string;
  phone: string;
  instagram: string;
  logoUrl?: string | null;
  footerText?: string | null;
}) {
  return (
    <footer className="mt-24 border-t border-[#2a2a2a] bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo name={name} url={logoUrl} />
          <p className="font-display text-2xl tracking-[0.18em]">{name}</p>
          <p className="text-sm text-[#b4b4ae]">{address}</p>
          <p className="text-sm">Phone: {phone}</p>
          <a className="text-sm text-[#c8b273]" href={instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 uppercase tracking-[0.2em] text-[#c8b273]">Shop</p>
          <Link className="block" href="/">Home</Link>
          <Link className="block" href="/shop">Shop</Link>
          <Link className="block" href="/categories">Categories</Link>
          <Link className="block" href="/about">About</Link>
          <Link className="block" href="/reviews">Customer Reviews</Link>
          <Link className="block" href="/contact">Contact</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 uppercase tracking-[0.2em] text-[#c8b273]">Policies</p>
          <Link className="block" href="/privacy">Privacy Policy</Link>
          <Link className="block" href="/terms">Terms and Conditions</Link>
          <Link className="block" href="/shipping">Shipping Policy</Link>
          <Link className="block" href="/cancellation">Cancellation and Refund Policy</Link>
        </div>
        <div className="text-sm text-[#b4b4ae]">
          {footerText || "Clothing from Burhanpur, Madhya Pradesh. Browse the collection and complete purchases through secure online payment."}
        </div>
      </div>
      <div className="border-t border-[#2a2a2a] py-5 text-center text-xs text-[#b4b4ae]">
        Made by HKS Web Development Company | 9406112110
      </div>
    </footer>
  );
}
