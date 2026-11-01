import Link from "next/link";

export function Logo({
  name,
  url,
  className = "",
}: {
  name: string;
  url?: string | null;
  className?: string;
}) {
  if (url) {
    return (
      <Link href="/" className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="h-10 w-auto max-w-[180px] object-contain md:h-12" />
      </Link>
    );
  }
  return (
    <Link href="/" className={`font-display text-xl tracking-[0.2em] md:text-2xl ${className}`}>
      {name}
    </Link>
  );
}
