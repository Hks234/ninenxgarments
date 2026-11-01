import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let settings = {
    businessName: "NINE XN GARMENTS",
    businessAddress: "Old Nagar Nigam Road, Goti Maholla, Burhanpur, Madhya Pradesh 450331, India.",
    businessPhone: "099931 22660",
    instagramUrl: "https://www.instagram.com/ninexngarmentsburhanpur/",
    logoUrl: null as string | null,
    footerText: "Clothing from Burhanpur, Madhya Pradesh. Browse the collection and complete purchases through secure online payment." as string | null,
  };
  try {
    settings = await getStoreSettings();
  } catch {
    // Storefront still renders if MySQL is briefly unavailable.
  }
  return (
    <>
      <Header name={settings.businessName} logoUrl={settings.logoUrl} />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-10">{children}</main>
      <Footer
        name={settings.businessName}
        address={settings.businessAddress}
        phone={settings.businessPhone}
        instagram={settings.instagramUrl}
        logoUrl={settings.logoUrl}
        footerText={settings.footerText}
      />
    </>
  );
}
