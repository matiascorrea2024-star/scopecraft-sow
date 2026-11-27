import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TemplatesCatalog } from "@/components/TemplatesCatalog";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "30 Statement of Work & Change Order Templates",
  description:
    "Browse 30 industry-specific Statement of Work (SOW) and Change Order templates built for US agencies, developers, designers, consultants, and contractors.",
  alternates: {
    canonical: `${SITE_URL}/templates`,
  },
};

export default function TemplatesIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-canvas">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="max-w-2xl pb-6 border-b border-hairline">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
              {SITE_NAME} Industry Library
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-ink mt-2 leading-tight">
              30 Statement of Work &amp; Change Order Templates
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary mt-3 leading-relaxed">
              Every template ships with itemized deliverables, milestone deposit splits, explicit out-of-scope exclusions, and industry-specific scope-trap checklists.
            </p>
          </div>

          <TemplatesCatalog />
        </div>
      </main>
      <Footer />
    </>
  );
}
