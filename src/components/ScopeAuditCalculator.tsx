"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { SITE_URL } from "@/config/site";
import { SOW_TEMPLATES } from "@/data/templates";
import { trackEvent } from "@/lib/analytics";
import {
  AuditInputs,
  buildAuditScorecardText,
  evaluateScopeAudit,
} from "@/lib/auditMath";

const BUDGET_PRESETS = [2500, 5000, 10000, 20000, 40000];

export function ScopeAuditCalculator() {
  const [inputs, setInputs] = useState<AuditInputs>({
    budgetUsd: 5000,
    templateSlug: "web-development-sow",
    hasUpfrontDeposit: true,
    hasExplicitExclusions: false,
    hasRevisionCap: false,
    hasChangeOrderRate: false,
    hasAcceptanceWindow: true,
    hasIpProtection: false,
  });
  const [copiedCard, setCopiedCard] = useState(false);

  const report = useMemo(() => evaluateScopeAudit(inputs), [inputs]);
  const selectedTemplate = useMemo(
    () => SOW_TEMPLATES.find((t) => t.slug === inputs.templateSlug) ?? SOW_TEMPLATES[0],
    [inputs.templateSlug]
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const handleCopyScorecard = async () => {
    const text = buildAuditScorecardText(report, `${SITE_URL}/audit`);
    trackEvent("share_summary_clicked", { source: "audit_scorecard" });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2200);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Inputs */}
      <div className="lg:col-span-6 bg-paper border border-hairline rounded-lg p-5 sm:p-6 space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            Step 1 · Project Context
          </p>
          <div className="mt-3 space-y-4">
            <div>
              <label
                htmlFor="audit-industry"
                className="block text-xs font-medium text-ink-secondary mb-1.5"
              >
                Service Category / Template
              </label>
              <select
                id="audit-industry"
                value={inputs.templateSlug}
                onChange={(e) =>
                  setInputs({ ...inputs, templateSlug: e.target.value })
                }
                className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
              >
                {SOW_TEMPLATES.map((tpl) => (
                  <option key={tpl.slug} value={tpl.slug}>
                    {tpl.shortName} ({tpl.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="audit-budget"
                  className="text-xs font-medium text-ink-secondary"
                >
                  Quoted Project Value (USD)
                </label>
                <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                  {fmt(inputs.budgetUsd)}
                </span>
              </div>
              <input
                id="audit-budget"
                type="number"
                min={250}
                max={500000}
                step={250}
                value={inputs.budgetUsd}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    budgetUsd: Math.max(250, parseFloat(e.target.value) || 250),
                  })
                }
                className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums focus:outline-none focus:border-forest"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInputs({ ...inputs, budgetUsd: amt })}
                    className={`min-h-[34px] px-2.5 rounded border font-mono text-xs tabular-nums transition-colors ${
                      inputs.budgetUsd === amt
                        ? "border-forest bg-forest-tint text-forest font-semibold"
                        : "border-hairline bg-canvas text-ink-secondary hover:text-ink"
                    }`}
                  >
                    {fmt(amt)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            Step 2 · Which protections are in your current contract?
          </p>
          <div className="space-y-2.5">
            {report.guardrails.map((g) => (
              <label
                key={g.id}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${
                  g.passed
                    ? "border-forest/30 bg-forest-tint/35"
                    : "border-hairline bg-canvas hover:border-ink-muted"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={g.passed}
                    onChange={(e) =>
                      setInputs({ ...inputs, [g.id]: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 accent-forest shrink-0"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-ink">
                      {g.label}
                    </p>
                    <p className="text-[11px] text-ink-secondary mt-0.5 leading-snug">
                      {g.fixCopy}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-mono text-[11px] tabular-nums shrink-0 ${
                    g.passed ? "text-forest font-medium" : "text-amber-800"
                  }`}
                >
                  {g.passed ? "Protected" : `-${fmt(g.exposureUsd)}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Live Risk Scorecard & 1-Click Fix */}
      <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
        <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-7 space-y-5 paper-sheet">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                Your Scope Risk Scorecard
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  data-testid="audit-score"
                  className="font-sans text-4xl sm:text-5xl font-semibold text-ink tabular-nums"
                >
                  {report.protectionScore}
                </span>
                <span className="font-mono text-sm text-ink-muted">/100</span>
                <span
                  className={`ml-2 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    report.protectionScore >= 85
                      ? "bg-forest-tint text-forest"
                      : report.protectionScore >= 55
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {report.passedCount}/{report.totalChecks} Guardrails
                </span>
              </div>
            </div>

            {report.protectionScore >= 85 ? (
              <ShieldCheck className="w-8 h-8 text-forest shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-amber-700 shrink-0" />
            )}
          </div>

          <div className="p-4 rounded-md bg-subtle border border-hairline">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Illustrative Scope-Creep Exposure
            </p>
            <p
              data-testid="audit-exposure"
              className="font-mono text-3xl font-semibold text-ink tabular-nums mt-1"
            >
              {fmt(report.estimatedExposureUsd)}
            </p>
            <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
              {report.estimatedExposureUsd > 0
                ? `Missing ${report.totalChecks - report.passedCount} commercial clause(s) on a ${fmt(
                    report.budgetUsd
                  )} ${selectedTemplate.shortName} leaves roughly ${fmt(
                    report.estimatedExposureUsd
                  )} exposed to unpaid revisions and unbilled favors.`
                : `All 6 commercial guardrails are active for your ${selectedTemplate.shortName}.`}
            </p>
            <p className="text-[10px] text-ink-muted mt-2">
              Illustrative commercial risk estimate based on missing contract clauses — not formal legal advice or a guaranteed loss figure.
            </p>
          </div>

          {report.guardrails.some((g) => !g.passed) && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Missing Clauses to Fix Before Sending
              </p>
              <ul className="space-y-1.5 text-xs text-ink-secondary">
                {report.guardrails
                  .filter((g) => !g.passed)
                  .map((gap) => (
                    <li key={gap.id} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-ink">{gap.label}</strong> — {gap.fixCopy}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="pt-2 space-y-2.5">
            <Link
              href={`/?template=${selectedTemplate.slug}#studio`}
              className="w-full min-h-[48px] px-5 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Fix All Gaps in {selectedTemplate.shortName}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleCopyScorecard}
              className="w-full min-h-[44px] px-4 rounded-md border border-hairline bg-canvas hover:border-forest text-xs font-medium text-ink inline-flex items-center justify-center gap-2"
            >
              {copiedCard ? (
                <>
                  <Check className="w-4 h-4 text-forest" />
                  <span>Scorecard Copied — Share with Client or Team</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Risk Scorecard + Share Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
