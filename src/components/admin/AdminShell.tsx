"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/sizes", label: "Sizes" },
  { href: "/admin/colours", label: "Colours" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/password", label: "Password" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#2a2a2a] bg-black lg:border-b-0 lg:border-r">
        <div className="px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c8b273]">Admin</p>
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nine-xn-logo.png" alt="NINE XN GARMENTS" className="h-10 w-auto max-w-[160px] object-contain" />
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 px-4 pb-4 lg:flex-col">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm ${active ? "bg-[#111] text-[#c8b273]" : "text-[#b4b4ae] hover:text-white"}`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            className="px-3 py-2 text-left text-sm text-[#c8b273]"
            onClick={async () => {
              await fetch("/api/auth/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="px-4 py-8 lg:px-10">{children}</main>
    </div>
  );
}
