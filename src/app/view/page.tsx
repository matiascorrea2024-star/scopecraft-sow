import type { Metadata } from "next";
import { ClientViewSheet } from "@/components/ClientViewSheet";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Shared Statement of Work — Client Presentation View",
  description:
    "Read-only client presentation view for a Statement of Work or Change Order created in ScopeCraft.",
  alternates: {
    canonical: `${SITE_URL}/view`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ClientViewPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-canvas">
        <ClientViewSheet />
      </main>
      <Footer />
    </>
  );
}
