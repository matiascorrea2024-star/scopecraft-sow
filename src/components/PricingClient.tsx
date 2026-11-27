"use client";

import { useState } from "react";
import { ArrowUpRight, Check, KeyRound, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { BILLING_PLANS, PlanId } from "@/config/billing";
import { trackEvent } from "@/lib/analytics";
import { saveStoredLicense, verifyLicenseKeyClient } from "@/lib/license";

export function PricingClient() {
  const [licenseInput, setLicenseInput] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPro, setIsPro] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    let valid = false;
    let normalized = licenseInput.trim().toUpperCase();
    let reason = "";

    try {
      const res = await fetch("/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseInput }),
      });
      const data = (await res.json()) as { valid?: boolean; key?: string; reason?: string };
      valid = Boolean(data.valid);
      if (data.key) normalized = data.key;
      if (data.reason) reason = data.reason;
    } catch {
      const fallback = await verifyLicenseKeyClient(licenseInput);
      valid = fallback.valid;
      normalized = fallback.normalizedKey;
      reason = fallback.reason ?? "";
    }

    if (valid) {
      saveStoredLicense(normalized);
      setIsPro(true);
      trackEvent("pro_license_activated", { source: "pricing_page" });
      setMessage({
        type: "ok",
        text: `License ${normalized} activated. Return to the SOW Builder to export clean white-label PDFs.`,
      });
    } else {
      setMessage({ type: "err", text: reason || "Invalid license key." });
    }
  };

  return (
    <>
      <Header isPro={isPro} />
      <main className="flex-1 bg-canvas">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-12 space-y-12">
          <div className="max-w-2xl pb-6 border-b border-hairline">
            <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
              ScopeCraft Pro Pricing
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-ink mt-2 leading-tight">
              Pay once per month or year. Keep 100% of your scope margin.
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary mt-3">
              Start free with zero signup. Upgrade via PayPal when you want white-label studio PDFs, Change Order branching, and all 30 vertical templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["monthly", "annual"] as PlanId[]).map((planId) => {
              const plan = BILLING_PLANS[planId];
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg p-6 bg-paper flex flex-col justify-between ${
                    planId === "annual"
                      ? "border-2 border-forest"
                      : "border border-hairline"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                        {plan.name}
                      </span>
                      {plan.badge && (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-forest text-white">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold text-ink tabular-nums">
                        ${plan.priceUsd}
                      </span>
                      <span className="text-sm text-ink-muted tabular-nums">
                        USD {plan.intervalLabel}
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                    <ul className="mt-5 space-y-2 text-xs text-ink-secondary">
                      {[
                        "Zero ScopeCraft footer watermark",
                        "Custom studio logo, brand color & confidential footer",
                        "All 30 industry templates unlocked",
                        "3-Option Value Pricing Table & Change Order branching",
                        "Unlimited browser project history",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={plan.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("paypal_checkout_clicked", {
                        plan: plan.id,
                        priceUsd: plan.priceUsd,
                      })
                    }
                    className={`mt-6 w-full min-h-[46px] rounded-md inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                      planId === "annual"
                        ? "bg-forest hover:bg-forest-hover text-white"
                        : "border border-ink bg-paper hover:bg-subtle text-ink"
                    }`}
                  >
                    <span>Checkout ${plan.priceUsd} via PayPal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>

          <section
            id="activate"
            className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 max-w-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest" />
              <h2 className="font-serif text-2xl text-ink">Activate License Key</h2>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Pay via <span className="font-mono text-ink">paypal.me/craftappstudio</span> (one-time monthly or annual pass, no unexpected auto-rebilling) and include your preferred email in the PayPal note. Once you receive your{" "}
              <span className="font-mono text-ink">SC-PRO-XXXX-XXXX-XXXX</span> key, paste it below to unlock Pro on this browser. Save your key email if you switch devices.
            </p>
            <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="SC-PRO-XXXX-XXXX-XXXX"
                  className="w-full min-h-[44px] pl-9 pr-3 rounded-md border border-hairline bg-canvas font-mono text-sm text-ink focus:outline-none focus:border-forest"
                />
              </div>
              <button
                type="submit"
                disabled={!licenseInput.trim()}
                className="min-h-[44px] px-5 rounded-md bg-ink hover:bg-ink/90 disabled:opacity-45 text-white text-sm font-medium"
              >
                Activate
              </button>
            </form>
            {message && (
              <p
                className={`text-xs font-medium ${
                  message.type === "ok" ? "text-forest" : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
