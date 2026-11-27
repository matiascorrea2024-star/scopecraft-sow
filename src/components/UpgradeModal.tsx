"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, KeyRound, ShieldCheck, X } from "lucide-react";
import { BILLING_PLANS, PlanId, SUPPORT_EMAIL } from "@/config/billing";
import { trackEvent } from "@/lib/analytics";
import { verifyLicenseKeyClient } from "@/lib/license";

interface UpgradeModalProps {
  open: boolean;
  isPro: boolean;
  activeKey: string | null;
  onClose: () => void;
  onActivated: (normalizedKey: string) => void;
  onDeactivate?: () => void;
}

export function UpgradeModal({
  open,
  isPro,
  activeKey,
  onClose,
  onActivated,
  onDeactivate,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("annual");
  const [licenseInput, setLicenseInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  if (!open) return null;

  const activePlan = BILLING_PLANS[selectedPlan];

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(activePlan.paypalNoteTemplate);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setVerifying(true);

    try {
      let valid = false;
      let normalized = licenseInput.trim().toUpperCase();
      let reason = "";

      try {
        const res = await fetch("/api/license/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: licenseInput }),
        });
        const data = (await res.json()) as {
          valid?: boolean;
          key?: string;
          reason?: string;
        };
        valid = Boolean(data.valid);
        if (data.key) normalized = data.key;
        if (data.reason) reason = data.reason;
      } catch {
        const localCheck = await verifyLicenseKeyClient(licenseInput);
        valid = localCheck.valid;
        normalized = localCheck.normalizedKey;
        reason = localCheck.reason ?? "";
      }

      if (valid) {
        trackEvent("pro_license_activated", { plan: selectedPlan });
        setStatusMessage({
          type: "success",
          text: "ScopeCraft Pro unlocked. Watermarks removed and all Pro tools are now active.",
        });
        onActivated(normalized);
      } else {
        setStatusMessage({
          type: "error",
          text: reason || "Invalid license key. Verify the SC-PRO-XXXX-XXXX-XXXX code.",
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="w-full max-w-2xl bg-paper border border-hairline rounded-lg shadow-xl overflow-hidden my-auto">
        <div className="px-6 py-5 border-b border-hairline flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-forest font-medium">
              ScopeCraft Pro License
            </p>
            <h2
              id="upgrade-modal-title"
              className="font-serif text-2xl sm:text-3xl text-ink mt-1 leading-tight"
            >
              White-label SOWs &amp; instant Change Orders
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isPro ? (
            <div className="p-4 rounded-md bg-forest-tint border border-forest/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Pro License Active
                  </p>
                  <p className="font-mono text-xs text-ink-secondary mt-0.5">
                    {activeKey}
                  </p>
                </div>
              </div>
              {onDeactivate && (
                <button
                  type="button"
                  onClick={onDeactivate}
                  className="min-h-[44px] px-3 text-xs font-medium text-ink-secondary hover:text-ink border border-hairline bg-paper rounded-md"
                >
                  Remove Key from Browser
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["monthly", "annual"] as PlanId[]).map((planId) => {
                  const plan = BILLING_PLANS[planId];
                  const isSelected = selectedPlan === planId;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`cursor-pointer rounded-md p-4 border transition-colors ${
                        isSelected
                          ? "border-forest bg-forest-tint/40"
                          : "border-hairline bg-canvas hover:border-ink-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                          {planId === "annual" ? "Annual Studio" : "Monthly"}
                        </span>
                        {plan.badge && (
                          <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-forest text-white">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-sans text-3xl font-semibold text-ink tabular-nums">
                          ${plan.priceUsd}
                        </span>
                        <span className="text-sm text-ink-muted tabular-nums">
                          USD {plan.intervalLabel}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                        {plan.description}
                      </p>
                      <a
                        href={plan.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackEvent("paypal_checkout_clicked", {
                            plan: plan.id,
                            priceUsd: plan.priceUsd,
                          });
                        }}
                        className={`mt-4 w-full min-h-[44px] px-4 rounded-md inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                          planId === "annual"
                            ? "bg-forest hover:bg-forest-hover text-white"
                            : "bg-paper border border-hairline hover:border-ink text-ink"
                        }`}
                      >
                        <span>Pay ${plan.priceUsd} via PayPal</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md bg-subtle border border-hairline p-4 space-y-2">
                <p className="text-xs font-semibold text-ink">
                  2-Step Activation Flow
                </p>
                <ol className="text-xs text-ink-secondary space-y-1 list-decimal list-inside leading-relaxed">
                  <li>
                    Complete payment at{" "}
                    <span className="font-mono text-ink">paypal.me/craftappstudio</span>{" "}
                    and paste your email in the PayPal note so we send your{" "}
                    <span className="font-mono text-ink">SC-PRO-...</span> license key.
                  </li>
                  <li>
                    Enter your license key below to unlock zero-watermark PDFs, custom logo &amp; accent color, Change Order mode, 3-tier options, and all 30 templates.
                  </li>
                </ol>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <code className="text-[11px] font-mono bg-paper border border-hairline px-2.5 py-1.5 rounded text-ink">
                    {activePlan.paypalNoteTemplate}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyNote}
                    className="min-h-[44px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-ink-secondary hover:text-ink inline-flex items-center gap-1.5"
                  >
                    {copiedNote ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-forest" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleActivate} className="pt-2 border-t border-hairline space-y-3">
            <label
              htmlFor="license-key-input"
              className="block text-xs font-semibold text-ink"
            >
              Already have a ScopeCraft Pro license key?
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="license-key-input"
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="SC-PRO-XXXX-XXXX-XXXX"
                  className="w-full min-h-[44px] pl-9 pr-3 rounded-md border border-hairline bg-canvas font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-forest"
                />
              </div>
              <button
                type="submit"
                disabled={verifying || !licenseInput.trim()}
                className="min-h-[44px] px-5 rounded-md bg-ink hover:bg-ink/90 disabled:opacity-45 text-white text-sm font-medium transition-colors shrink-0"
              >
                {verifying ? "Verifying..." : "Activate License"}
              </button>
            </div>
            {statusMessage && (
              <p
                className={`text-xs font-medium ${
                  statusMessage.type === "success" ? "text-forest" : "text-red-700"
                }`}
              >
                {statusMessage.text}
              </p>
            )}
            <p className="text-[11px] text-ink-muted">
              Need help with an existing key? Reach CraftApp Studio at {SUPPORT_EMAIL}.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
