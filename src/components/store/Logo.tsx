import Link from "next/link";

export const BRAND_LOGO_SRC = "/nine-xn-logo.jpg";

const sizes = {
  header: "h-14 w-14 md:h-16 md:w-16",
  footer: "h-[5.5rem] w-[5.5rem]",
  hero: "h-28 w-28 md:h-36 md:w-36",
  mark: "h-16 w-16",
  admin: "h-12 w-12",
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
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover shadow-[0_0_22px_rgba(200,178,115,0.28)]`}
      />
    </Link>
  );
}
