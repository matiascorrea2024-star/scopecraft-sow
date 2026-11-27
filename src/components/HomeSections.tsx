"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCheck2,
  GitBranch,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BILLING_PLANS } from "@/config/billing";
import { SOW_TEMPLATES } from "@/data/templates";
import { trackEvent } from "@/lib/analytics";

export function HomeSections() {
  const featuredTemplates = SOW_TEMPLATES.slice(0, 6);

  return (
    <>
      {/* Bento Feature Architecture */}
      <section className="border-b border-hairline bg-paper">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <p className="font-mono text-xs uppercase tracking-widest text-forest font-semibold">
              Why Agencies &amp; Consultants Switch
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-[-0.03em] mt-2 leading-tight">
              Built to stop unpaid scope creep before project kickoff.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-forest-tint border border-forest/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-forest" />
              </div>
              <p className="font-mono text-xs text-ink-muted tabular-nums">01</p>
              <h3 className="font-display text-lg font-bold text-ink mt-1">
                Live Scope-Protection Scoring
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Every document is scored 0–100 against commercial guardrails: upfront deposit percentage, revision caps, explicit exclusions, review windows, and IP retention until paid.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-forest-tint border border-forest/20 flex items-center justify-center mb-4">
                <GitBranch className="w-5 h-5 text-forest" />
              </div>
              <p className="font-mono text-xs text-ink-muted tabular-nums">02</p>
              <h3 className="font-display text-lg font-bold text-ink mt-1">
                1-Click Change Order Amendments
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Turn casual Slack or email requests into formal Change Orders linked to your parent SOW—documenting exact added cost and business-day schedule impact.
              </p>
            </div>

            <div className="rounded-2xl border border-hairline bg-canvas p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-forest-tint border border-forest/20 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5 text-forest" />
              </div>
              <p className="font-mono text-xs text-ink-muted tabular-nums">03</p>
              <h3 className="font-display text-lg font-bold text-ink mt-1">
                Zero Bloat. $12/mo Instead of $49/mo.
              </h3>
              <p className="text-sm text-ink-secondary mt-2 leading-relaxed">
                Skip bloated enterprise suites and clunky Word docs. Build locally in your browser with zero account friction and export crisp executive US Letter PDFs instantly.
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
              <p className="font-mono text-xs uppercase tracking-widest text-forest font-semibold">
                30 Industry Playbooks
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-[-0.03em] mt-1.5">
                Pre-loaded with real scope-trap exclusions.
              </h2>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-forest-hover"
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
                className="group bg-paper border border-hairline hover:border-forest rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      {tpl.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-forest-tint font-mono text-[11px] font-semibold text-forest">
                      {tpl.isProTemplate ? "Pro" : "Free"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink mt-2.5 group-hover:text-forest transition-colors">
                    {tpl.shortName}
                  </h3>
                  <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                    {tpl.heroSummary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink-muted font-mono tabular-nums">
                  <span>{tpl.typicalBudgetRange}</span>
                  <span className="text-ink group-hover:text-forest inline-flex items-center gap-1 font-sans font-semibold">
                    Inspect
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Free vs Pro PDF Comparison */}
      <section className="border-b border-hairline bg-paper">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-2xl border border-hairline bg-dots-light p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-secondary">
                  Free PDF Export ($0)
                </span>
                <span className="text-xs text-ink-muted">Zero account needed</span>
              </div>
              <div className="bg-white rounded-xl border border-hairline p-5 shadow-sm space-y-3">
                <div className="text-xs font-mono text-ink-muted">SOW-2026-104</div>
                <div className="text-sm font-semibold text-ink">
                  Statement of Work + Exclusions
                </div>
                <div className="h-2 w-4/5 rounded bg-subtle" />
                <div className="pt-3 border-t border-dashed border-hairline flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>Full legal-style structure</span>
                  <span className="px-2 py-0.5 rounded bg-subtle">
                    Prepared with ScopeCraft
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/35 bg-[#090D16] text-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pro White-Label Client PDF
                </span>
                <span className="text-xs text-slate-400">From $12 one-time</span>
              </div>
              <div className="bg-white rounded-xl p-5 text-slate-900 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold">Your Studio Logo &amp; Header</span>
                  <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                    NO WATERMARK
                  </span>
                </div>
                <div className="text-sm font-semibold">
                  Executive SOW + 3-Option Pricing + Change Orders
                </div>
                <div className="h-2 w-4/5 rounded bg-slate-100" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-emerald-700 font-semibold">
                  <span>All 30 Industry Templates</span>
                  <span className="inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Unlimited Saved Drafts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Executive Pricing */}
      <section id="pricing" className="border-b border-hairline bg-canvas">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <p className="font-mono text-xs uppercase tracking-widest text-forest font-semibold">
              Simple Studio Pricing
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-[-0.03em] mt-1.5">
              Free to draft. One avoided scope dispute pays for a decade of Pro.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free */}
            <div className="border border-hairline rounded-2xl p-6 sm:p-7 bg-paper flex flex-col justify-between shadow-sm">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted font-semibold">
                  Free Forever
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-ink tabular-nums">$0</span>
                  <span className="text-sm text-ink-muted">/forever</span>
                </div>
                <p className="text-xs text-ink-secondary mt-2">
                  Instant client-ready SOWs with zero signup required.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-ink-secondary">
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
                className="mt-6 w-full min-h-[46px] rounded-xl border border-hairline bg-canvas hover:border-ink text-sm font-semibold text-ink inline-flex items-center justify-center transition-colors"
              >
                Start Drafting Free
              </a>
            </div>

            {/* Pro Monthly */}
            <div className="border border-hairline rounded-2xl p-6 sm:p-7 bg-paper flex flex-col justify-between shadow-sm">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-ink-muted font-semibold">
                  Pro Monthly
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-ink tabular-nums">
                    ${BILLING_PLANS.monthly.priceUsd}
                  </span>
                  <span className="text-sm text-ink-muted tabular-nums">
                    USD {BILLING_PLANS.monthly.intervalLabel}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-2">
                  {BILLING_PLANS.monthly.description}
                </p>
                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-ink-secondary">
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
                className="mt-6 w-full min-h-[46px] rounded-xl bg-ink hover:bg-slate-800 text-sm font-semibold text-white inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Get Pro Monthly ($12)</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Pro Annual Obsidian Spotlight */}
            <div className="relative rounded-2xl p-6 sm:p-7 bg-[#0B111E] text-white border border-emerald-500/45 shadow-[0_24px_70px_-24px_rgba(16,185,129,0.35)] flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Pro Annual Studio
                  </p>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-semibold">
                    Save 45%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl sm:text-5xl font-bold text-white tabular-nums">
                    ${BILLING_PLANS.annual.priceUsd}
                  </span>
                  <span className="text-sm text-slate-400 tabular-nums">
                    USD {BILLING_PLANS.annual.intervalLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  {BILLING_PLANS.annual.description}
                </p>
                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-slate-200">
                  {[
                    "Everything in Pro Monthly for 12 months",
                    "Equivalent to $6.58/mo — zero seat fees",
                    "Instant license key activation in browser",
                    "Priority custom template requests",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
                className="mt-6 w-full min-h-[46px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-[#031F16] inline-flex items-center justify-center gap-1.5 transition-colors"
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
