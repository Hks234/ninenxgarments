"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Customer Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Header({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () => fetch("/api/cart").then((r) => r.json()).then((d) => setCount(d.count || 0)).catch(() => {});
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
        <Logo name={name} url={logoUrl} />
        <nav className="hidden items-center gap-6 text-sm tracking-wide uppercase text-[#b4b4ae] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/search" className="hover:text-[#c8b273]">
            Search
          </Link>
          <Link href="/account" className="hover:text-[#c8b273]">
            Account
          </Link>
          <Link href="/cart" className="relative hover:text-[#c8b273]">
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-[#c8b273] px-1.5 text-[10px] text-black">
                {count}
              </span>
            )}
          </Link>
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
            Menu
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-[#2a2a2a] bg-black px-4 py-4 lg:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/search" onClick={() => setOpen(false)}>
            Search
          </Link>
          <Link href="/account" onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link href="/cart" onClick={() => setOpen(false)}>
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      )}
    </header>
  );
}
