import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nine-xn-logo.jpg" alt="NINE XN GARMENTS" className="mb-6 h-20 w-20 rounded-full object-cover" />
      <p className="text-xs uppercase tracking-[0.4em] text-[#c8b273]">NINE XN GARMENTS</p>
      <h1 className="mt-4 font-display text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-[#b4b4ae]">The page you requested is not available. Continue shopping from the collection.</p>
      <Link href="/" className="mt-8 bg-[#c8b273] px-8 py-3 text-sm tracking-[0.2em] text-black">
        Back to home
      </Link>
    </div>
  );
}
