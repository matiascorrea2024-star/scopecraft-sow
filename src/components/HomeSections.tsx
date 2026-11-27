"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { BILLING_PLANS } from "@/config/billing";
import { SOW_TEMPLATES } from "@/data/templates";
import { trackEvent } from "@/lib/analytics";

export function HomeSections() {
  const featuredTemplates = SOW_TEMPLATES.slice(0, 6);

  return (
    <>
      {/* 3-Column Editorial Value Architecture (1px hairlines, no thick card borders) */}
      <section className="border-b border-hairline bg-paper">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-xl mb-10">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
              Why Agencies &amp; Consultants Switch
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2 leading-tight">
              Built to stop unpaid scope creep before kickoff.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-hairline divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="py-6 md:pr-8">
              <p className="font-mono text-xs text-ink-muted tabular-nums">01</p>
              <h3 className="text-base font-semibold text-ink mt-2">
                Live Scope-Protection Scoring
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Every document is scored 0–100 against commercial guardrails: upfront deposit percentage, revision caps, explicit exclusions, silent-approval windows, and IP retention until paid.
              </p>
            </div>
            <div className="py-6 md:px-8">
              <p className="font-mono text-xs text-ink-muted tabular-nums">02</p>
              <h3 className="text-base font-semibold text-ink mt-2">
                1-Click Change Order Amendments
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Turn casual Slack or email requests into formal Change Orders linked to your parent SOW—documenting exact added cost and business-day schedule impact.
              </p>
            </div>
            <div className="py-6 md:pl-8">
              <p className="font-mono text-xs text-ink-muted tabular-nums">03</p>
              <h3 className="text-base font-semibold text-ink mt-2">
                Zero Bloat. $12/mo Instead of $49/mo.
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Skip bloated enterprise CPQ suites and clunky Word docs. Build locally in your browser with zero account friction and export crisp executive US Letter PDFs instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Templates Showcase */}
      <section className="border-b border-hairline bg-canvas">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
                30 Industry Playbooks
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2">
                Pre-loaded with real scope-trap exclusions.
              </h2>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-hover"
            >
              <span>View all 30 templates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.map((tpl) => (
              <Link
                key={tpl.slug}
                href={`/templates/${tpl.slug}`}
                className="group bg-paper border border-hairline hover:border-forest rounded-md p-5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      {tpl.category}
                    </span>
                    <span className="font-mono text-[11px] text-forest">
                      {tpl.isProTemplate ? "Pro" : "Free"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-ink mt-2 group-hover:text-forest transition-colors">
                    {tpl.shortName}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                    {tpl.heroSummary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink-muted font-mono tabular-nums">
                  <span>{tpl.typicalBudgetRange}</span>
                  <span className="text-ink group-hover:text-forest inline-flex items-center gap-1 font-sans font-medium">
                    Inspect
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Pricing */}
      <section id="pricing" className="border-b border-hairline bg-paper">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-xl mb-10">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
              Simple Studio Pricing
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2">
              Free to draft. One scope dispute pays for a decade of Pro.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Free */}
            <div className="border border-hairline rounded-lg p-6 bg-canvas flex flex-col justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                  Free Forever
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-ink tabular-nums">$0</span>
                  <span className="text-sm text-ink-muted">/forever</span>
                </div>
                <p className="text-xs text-ink-secondary mt-2">
                  Instant client-ready SOWs with zero signup required.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-secondary">
                  {[
                    "Full interactive SOW studio & live score",
                    "5 core industry presets",
                    "Unlimited US Letter PDF & Markdown exports",
                    "Includes subtle ScopeCraft footer badge",
                    "Up to 2 saved local browser drafts",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#studio"
                className="mt-6 w-full min-h-[44px] rounded-md border border-hairline bg-paper hover:border-ink text-sm font-medium text-ink inline-flex items-center justify-center"
              >
                Start Drafting Free
              </a>
            </div>

            {/* Pro Monthly */}
            <div className="border border-hairline rounded-lg p-6 bg-paper flex flex-col justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                  Pro Monthly
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-ink tabular-nums">
                    ${BILLING_PLANS.monthly.priceUsd}
                  </span>
                  <span className="text-sm text-ink-muted tabular-nums">
                    USD {BILLING_PLANS.monthly.intervalLabel}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-2">
                  {BILLING_PLANS.monthly.description}
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-secondary">
                  {[
                    "Zero ScopeCraft watermark on all PDFs",
                    "Custom studio logo, brand color & footer",
                    "All 30 industry templates & clause library",
                    "1-click Change Order branching from drafts",
                    "3-Option Value Pricing Table & unlimited history",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={BILLING_PLANS.monthly.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("paypal_checkout_clicked", { plan: "monthly", priceUsd: 12 })
                }
                className="mt-6 w-full min-h-[44px] rounded-md border border-ink bg-paper hover:bg-subtle text-sm font-medium text-ink inline-flex items-center justify-center gap-1.5"
              >
                <span>Get Pro Monthly ($12)</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Pro Annual */}
            <div className="border-2 border-forest rounded-lg p-6 bg-paper flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-wider text-forest font-semibold">
                    Pro Annual Studio
                  </p>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-forest text-white">
                    Save 45%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-ink tabular-nums">
                    ${BILLING_PLANS.annual.priceUsd}
                  </span>
                  <span className="text-sm text-ink-muted tabular-nums">
                    USD {BILLING_PLANS.annual.intervalLabel}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-2">
                  {BILLING_PLANS.annual.description}
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-ink-secondary">
                  {[
                    "Everything in Pro Monthly for 12 months",
                    "Equivalent to $6.58/mo — zero seat fees",
                    "Instant license key activation in browser",
                    "Priority custom template requests",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={BILLING_PLANS.annual.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("paypal_checkout_clicked", { plan: "annual", priceUsd: 79 })
                }
                className="mt-6 w-full min-h-[44px] rounded-md bg-forest hover:bg-forest-hover text-sm font-medium text-white inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Get Pro Annual ($79)</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
