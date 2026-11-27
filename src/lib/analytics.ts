"use client";

import { track } from "@vercel/analytics";

export type AnalyticsEvent =
  | "sow_pdf_exported"
  | "sow_markdown_copied"
  | "share_summary_clicked"
  | "scope_autofix_used"
  | "json_backup_exported"
  | "template_loaded"
  | "paypal_checkout_clicked"
  | "pro_license_activated"
  | "change_order_toggled"
  | "upgrade_modal_opened";

const LOCAL_STATS_KEY = "scopecraft_funnel_stats_v1";

export interface LocalFunnelStats {
  pdfExports: number;
  paypalClicks: number;
  templatesLoaded: number;
  proActivated: boolean;
}

export function trackEvent(
  name: AnalyticsEvent,
  props?: Record<string, string | number | boolean>
): void {
  try {
    track(name, props);
  } catch {
    // Analytics must never interrupt user workflow
  }

  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LOCAL_STATS_KEY);
    const stats: LocalFunnelStats = raw
      ? (JSON.parse(raw) as LocalFunnelStats)
      : { pdfExports: 0, paypalClicks: 0, templatesLoaded: 0, proActivated: false };

    if (name === "sow_pdf_exported") stats.pdfExports += 1;
    if (name === "paypal_checkout_clicked") stats.paypalClicks += 1;
    if (name === "template_loaded") stats.templatesLoaded += 1;
    if (name === "pro_license_activated") stats.proActivated = true;

    window.localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}
