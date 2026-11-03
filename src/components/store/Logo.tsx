import Link from "next/link";

export const BRAND_LOGO_SRC = "/nine-xn-logo.png";

const sizes = {
  header: "h-10 w-auto max-w-[168px] md:h-12 md:max-w-[200px]",
  footer: "h-14 w-auto max-w-[220px]",
  hero: "h-20 w-auto max-w-[280px] md:h-28 md:max-w-[360px]",
  mark: "h-14 w-auto max-w-[220px]",
  admin: "h-10 w-auto max-w-[160px]",
};

export function Logo({
  name,
  url,
  size = "header",
  className = "",
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const src = url || BRAND_LOGO_SRC;

  return (
    <Link href="/" className={`inline-flex shrink-0 items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className={`${sizes[size]} object-contain`} />
    </Link>
  );
}
