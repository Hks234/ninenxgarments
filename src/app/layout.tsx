import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { getStoreSettings } from "@/lib/settings";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getStoreSettings();
    return {
      title: {
        default: `${settings.businessName} | Clothing Store in Burhanpur`,
        template: `%s | ${settings.businessName}`,
      },
      description: `${settings.businessName} is a garment exporter and clothing store in Burhanpur, Madhya Pradesh.`,
      metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
      icons: [{ rel: "icon", url: settings.faviconUrl || "/nine-xn-logo.jpg" }],
      openGraph: {
        title: settings.businessName,
        description: `Discover your style with ${settings.businessName}.`,
      },
    };
  } catch {
    return {
      title: "NINE XN GARMENTS | Clothing Store in Burhanpur",
      description: "NINE XN GARMENTS is a garment exporter and clothing store in Burhanpur, Madhya Pradesh.",
      icons: [{ rel: "icon", url: "/nine-xn-logo.jpg" }],
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-[#050505] text-[#f5f5f0] antialiased">{children}</body>
    </html>
  );
}
