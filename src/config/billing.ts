export type BillingProvider = "paypal_me" | "payhip" | "paypal_subscriptions";

export type PlanId = "monthly" | "annual";

export interface BillingPlan {
  id: PlanId;
  name: string;
  priceUsd: number;
  intervalLabel: string;
  badge?: string;
  description: string;
  checkoutUrl: string;
  paypalNoteTemplate: string;
}

export const PAYPAL_ME_BASE = "https://paypal.me/craftappstudio";

export const BILLING_PROVIDER: BillingProvider =
  (process.env.NEXT_PUBLIC_BILLING_PROVIDER as BillingProvider | undefined) ??
  "paypal_me";

const PAYHIP_MONTHLY_URL =
  process.env.NEXT_PUBLIC_PAYHIP_MONTHLY_URL ?? `${PAYPAL_ME_BASE}/12USD`;
const PAYHIP_ANNUAL_URL =
  process.env.NEXT_PUBLIC_PAYHIP_ANNUAL_URL ?? `${PAYPAL_ME_BASE}/79USD`;

const PAYPAL_SUB_MONTHLY_URL =
  process.env.NEXT_PUBLIC_PAYPAL_SUB_MONTHLY_URL ?? `${PAYPAL_ME_BASE}/12USD`;
const PAYPAL_SUB_ANNUAL_URL =
  process.env.NEXT_PUBLIC_PAYPAL_SUB_ANNUAL_URL ?? `${PAYPAL_ME_BASE}/79USD`;

function resolveCheckoutUrl(plan: PlanId): string {
  if (BILLING_PROVIDER === "payhip") {
    return plan === "monthly" ? PAYHIP_MONTHLY_URL : PAYHIP_ANNUAL_URL;
  }
  if (BILLING_PROVIDER === "paypal_subscriptions") {
    return plan === "monthly" ? PAYPAL_SUB_MONTHLY_URL : PAYPAL_SUB_ANNUAL_URL;
  }
  return plan === "monthly"
    ? `${PAYPAL_ME_BASE}/12USD`
    : `${PAYPAL_ME_BASE}/79USD`;
}

export const BILLING_PLANS: Record<PlanId, BillingPlan> = {
  monthly: {
    id: "monthly",
    name: "ScopeCraft Pro Monthly",
    priceUsd: 12,
    intervalLabel: "/mo",
    description: "Zero watermark, custom studio branding, Change Orders, and all 30 templates.",
    checkoutUrl: resolveCheckoutUrl("monthly"),
    paypalNoteTemplate: "ScopeCraft Pro Monthly ($12) - your@email.com",
  },
  annual: {
    id: "annual",
    name: "ScopeCraft Pro Annual",
    priceUsd: 79,
    intervalLabel: "/yr",
    badge: "Save 45%",
    description: "Full annual license for studios & agencies. Less than one hour of billable work.",
    checkoutUrl: resolveCheckoutUrl("annual"),
    paypalNoteTemplate: "ScopeCraft Pro Annual ($79) - your@email.com",
  },
};

export const SUPPORT_EMAIL = "craftappstudio@gmail.com";
