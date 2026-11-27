import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScopeAuditCalculator } from "@/components/ScopeAuditCalculator";
import { SITE_NAME, SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Free Scope-Creep Risk Calculator & SOW Audit",
  description:
    "Check how much unpaid scope creep your project proposal is exposed to in 20 seconds, then generate a watertight Statement of Work PDF with one click.",
  alternates: {
    canonical: `${SITE_URL}/audit`,
  },
};

export default function ScopeAuditPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-canvas">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="max-w-2xl pb-6 border-b border-hairline">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
              {SITE_NAME} · 20-Second Commercial Scope Check
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-ink mt-2 leading-tight">
              How much unpaid work is your proposal exposed to?
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary mt-3 leading-relaxed">
              Toggle the commercial guardrails missing from your current quote or SOW to quantify scope-creep risk and load a pre-protected template in one click.
            </p>
          </div>

          <ScopeAuditCalculator />
        </div>
      </main>
      <Footer />
    </>
  );
}
