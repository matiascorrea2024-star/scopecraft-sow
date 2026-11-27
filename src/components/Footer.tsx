import Link from "next/link";
import { SITE_NAME, SITE_PARENT } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-ink">
            {SITE_NAME} <span className="text-ink-muted font-normal">by {SITE_PARENT}</span>
          </p>
          <p className="text-xs text-ink-muted mt-1 max-w-md">
            Watertight Statements of Work, explicit exclusions, and Change Orders for US freelancers, consultants, and boutique agencies. Commercial templates are not formal legal advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs text-ink-secondary">
          <Link href="/#studio" className="hover:text-ink">
            SOW Builder
          </Link>
          <Link href="/audit" className="hover:text-ink">
            Scope-Creep Check
          </Link>
          <Link href="/templates" className="hover:text-ink">
            30 Industry Templates
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing &amp; License
          </Link>
        </div>
      </div>
    </footer>
  );
}
