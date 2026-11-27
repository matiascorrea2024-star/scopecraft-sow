import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { PricingClient } from "@/components/PricingClient";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing & Pro License Activation",
  description:
    "Start free with zero signup. Upgrade to ScopeCraft Pro ($12/mo or $79/yr via PayPal) for white-label studio PDFs, Change Orders, and 30 industry templates.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <>
      <PricingClient />
      <Footer />
    </>
  );
}
