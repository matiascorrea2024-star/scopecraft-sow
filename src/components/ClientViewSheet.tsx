"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, ShieldCheck } from "lucide-react";
import { exportSowToPdf } from "@/lib/pdfExport";
import { decodeSharePayload, sharedPayloadToDocument } from "@/lib/shareLink";
import {
  calculateDeliverableLineTotal,
  calculateMilestones,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
} from "@/lib/sowMath";
import { SowDocument } from "@/types/sow";

export function ClientViewSheet() {
  const [doc, setDoc] = useState<SowDocument | null>(null);
  const [isProAuthor, setIsProAuthor] = useState(false);
  const [checkedHash, setCheckedHash] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "";
    const parsed = decodeSharePayload(hash);
    if (parsed) {
      setDoc(sharedPayloadToDocument(parsed));
      setIsProAuthor(Boolean(parsed.isProAuthor));
    }
    setCheckedHash(true);
  }, []);

  if (!checkedHash) {
    return (
      <div className="max-w-[820px] mx-auto px-4 py-16 text-center text-sm text-ink-muted">
        Loading shared scope document...
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-16 text-center space-y-4">
        <p className="font-mono text-xs uppercase tracking-wider text-forest">
          Client Scope View
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink">
          Open a Statement of Work link to view it here.
        </h1>
        <p className="text-sm text-ink-secondary">
          This read-only viewer renders shared ScopeCraft links directly in your browser with zero account required.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#studio"
            className="min-h-[44px] px-5 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-medium inline-flex items-center gap-2"
          >
            <span>Open ScopeCraft Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/audit"
            className="min-h-[44px] px-4 rounded-md border border-hairline bg-paper text-sm font-medium text-ink inline-flex items-center"
          >
            Run Free Scope Check
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal(doc.deliverables);
  const tax = calculateTax(subtotal, doc.taxRate);
  const total = calculateTotal(doc);
  const milestones = calculateMilestones(doc.milestones, total);
  const accentHex = doc.brand.accentColor || "#0F5C4A";

  return (
    <div className="max-w-[840px] mx-auto px-4 sm:px-6 py-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <ShieldCheck className="w-4 h-4 text-forest" />
          <span>Read-only client presentation link (contact emails omitted for privacy).</span>
        </div>
        <button
          type="button"
          onClick={() => exportSowToPdf(doc, isProAuthor)}
          className="min-h-[44px] px-4 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-medium inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      <article className="bg-paper border border-hairline rounded-md paper-sheet overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: accentHex }} />
        <div className="p-6 sm:p-10 space-y-6 text-[13px] leading-relaxed text-ink">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-hairline">
            <div>
              <p
                className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: accentHex }}
              >
                {doc.mode === "change_order" ? "Change Order Addendum" : "Statement of Work"}
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl text-ink leading-tight mt-1">
                {doc.projectTitle}
              </h1>
            </div>
            <div className="sm:text-right font-mono text-[11px] text-ink-muted shrink-0 tabular-nums space-y-0.5">
              <p className="text-ink font-medium">{doc.documentNumber}</p>
              <p>Issued: {doc.issueDate}</p>
              <p>Valid until: {doc.validUntil}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Prepared By
              </p>
              <p className="font-semibold text-ink mt-1">{doc.providerName}</p>
              <p className="text-xs text-ink-secondary">{doc.providerContact}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Prepared For
              </p>
              <p className="font-semibold text-ink mt-1">{doc.clientCompany}</p>
              <p className="text-xs text-ink-secondary">{doc.clientContact}</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
              1. Project Overview
            </p>
            <p className="text-sm text-ink-secondary">{doc.summary}</p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              2. Deliverables &amp; Investment
            </p>
            <div className="border border-hairline rounded overflow-hidden">
              <div className="grid grid-cols-12 bg-subtle px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                <span className="col-span-7">Deliverable</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-3 text-right">Amount</span>
              </div>
              <div className="divide-y divide-hairline">
                {doc.deliverables.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 px-3 py-2.5 gap-2 items-start"
                  >
                    <div className="col-span-7">
                      <p className="font-medium text-ink text-xs">{item.title}</p>
                      <p className="text-[11px] text-ink-secondary mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <div className="col-span-2 text-right font-mono text-[11px] text-ink-secondary tabular-nums">
                      {item.quantity} {item.unitLabel}
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs font-medium text-ink tabular-nums">
                      {formatCurrency(calculateDeliverableLineTotal(item), doc.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col items-end space-y-1 text-xs tabular-nums">
              <div className="flex items-center justify-between w-48 text-ink-secondary">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal, doc.currency)}</span>
              </div>
              {doc.taxRate > 0 && (
                <div className="flex items-center justify-between w-48 text-ink-secondary">
                  <span>Tax ({doc.taxRate}%)</span>
                  <span className="font-mono">{formatCurrency(tax, doc.currency)}</span>
                </div>
              )}
              <div
                className="flex items-center justify-between w-48 pt-1.5 border-t border-hairline font-semibold text-sm"
                style={{ color: accentHex }}
              >
                <span>Total</span>
                <span className="font-mono">{formatCurrency(total, doc.currency)}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded bg-subtle border border-hairline">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">
              3. Explicit Out-of-Scope Exclusions
            </p>
            <ul className="space-y-1 text-xs text-ink-secondary list-disc list-inside">
              {doc.exclusions.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              4. Milestone Payment Schedule
            </p>
            <div className="divide-y divide-hairline border border-hairline rounded">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-ink">{m.label}</span>
                    <span className="text-ink-muted ml-2">({m.dueTrigger})</span>
                  </div>
                  <span className="font-mono font-medium text-ink tabular-nums shrink-0">
                    {m.percentage}% · {formatCurrency(m.amount, doc.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            {!isProAuthor ? (
              <>
                <span>Prepared with ScopeCraft</span>
                <Link href="/#studio" className="font-medium text-forest hover:underline">
                  Create your own free SOW with ScopeCraft →
                </Link>
              </>
            ) : (
              <span>
                {doc.brand.customFooter.trim() || `Confidential — Prepared by ${doc.providerName}`}
              </span>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
