import Link from "next/link";
import { SITE_NAME, SITE_PARENT } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-[#090D16] text-slate-300 border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display text-sm font-bold text-white">
            {SITE_NAME}{" "}
            <span className="text-slate-400 font-normal font-mono text-xs">
              by {SITE_PARENT}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">
            Structured Statements of Work, explicit exclusions, and Change Orders for US freelancers, consultants, and boutique agencies. Commercial templates are not formal legal advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
          <Link href="/#studio" className="hover:text-white">
            SOW Builder
          </Link>
          <Link href="/audit" className="hover:text-white">
            Scope-Creep Check
          </Link>
          <Link href="/templates" className="hover:text-white">
            30 Industry Templates
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing &amp; License
          </Link>
          <a
            href="https://ratecraft-app.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            RateCraft Pricing
          </a>
          <a
            href="https://craftapp-hub.vercel.app/invoice-followup"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            InvoiceFollowUp
          </a>
          <a
            href="https://craftapp-hub.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            CraftApp Hub
          </a>
        </div>
      </div>
    </footer>
  );
}
