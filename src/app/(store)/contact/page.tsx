import { getStoreSettings } from "@/lib/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const mapsQuery = encodeURIComponent(settings.businessAddress);
  return (
    <div className="grid gap-10 reveal-in lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="font-display text-5xl">Contact</h1>
        <p className="text-[#b4b4ae]">Visit or call NINE XN GARMENTS in Burhanpur, Madhya Pradesh.</p>
        <p className="font-display text-3xl">{settings.businessName}</p>
        <p>{settings.businessAddress}</p>
        <p>
          Phone:{" "}
          <a className="text-[#c8b273]" href={`tel:${settings.businessPhone.replace(/\s+/g, "")}`}>
            {settings.businessPhone}
          </a>
        </p>
        <a href={settings.instagramUrl} className="inline-block text-[#c8b273]" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          className="block border border-[#c8b273] px-5 py-3 text-center text-sm tracking-[0.2em]"
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      </div>
      <div className="space-y-4">
        <iframe
          title="NINE XN GARMENTS on Google Maps"
          src={`https://maps.google.com/maps?q=${mapsQuery}&z=16&output=embed`}
          className="h-80 w-full border border-[#2a2a2a]"
          loading="lazy"
        />
        <div className="luxury-card border border-[#2a2a2a] bg-[#111] p-8">
          <h2 className="font-display text-3xl">Store hours</h2>
          <p className="mt-4 text-[#b4b4ae]">Monday to Saturday, 10:00 AM – 8:00 PM</p>
          <p className="mt-2 text-[#b4b4ae]">Sunday, 11:00 AM – 6:00 PM</p>
          <p className="mt-6 text-sm text-[#b4b4ae]">
            For orders already placed online, include your order number when you call. Online checkout uses Razorpay; cash on delivery is not offered.
          </p>
        </div>
      </div>
    </div>
  );
}
