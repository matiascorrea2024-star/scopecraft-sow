import { CurrencyCode, DeliverableItem, MilestoneItem, SowDocument } from "@/types/sow";

export interface CalculatedMilestone extends MilestoneItem {
  amount: number;
}

export interface ScopeCheck {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  fixHint: string;
}

export interface ScopeProtectionReport {
  score: number;
  grade: "Watertight" | "Solid" | "Exposed";
  checks: ScopeCheck[];
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateDeliverableLineTotal(item: DeliverableItem): number {
  const qty = Number.isFinite(item.quantity) ? Math.max(0, item.quantity) : 0;
  const price = Number.isFinite(item.unitPrice) ? Math.max(0, item.unitPrice) : 0;
  return roundMoney(qty * price);
}

export function calculateSubtotal(deliverables: DeliverableItem[]): number {
  return roundMoney(
    deliverables.reduce((acc, item) => acc + calculateDeliverableLineTotal(item), 0)
  );
}

export function calculateTax(subtotal: number, taxRate: number): number {
  const safeRate = Number.isFinite(taxRate) ? Math.max(0, Math.min(50, taxRate)) : 0;
  return roundMoney(subtotal * (safeRate / 100));
}

export function calculateTotal(doc: Pick<SowDocument, "deliverables" | "taxRate">): number {
  const subtotal = calculateSubtotal(doc.deliverables);
  const tax = calculateTax(subtotal, doc.taxRate);
  return roundMoney(subtotal + tax);
}

export function calculateMilestones(
  milestones: MilestoneItem[],
  total: number
): CalculatedMilestone[] {
  if (milestones.length === 0) return [];
  const totalPct = milestones.reduce((sum, m) => sum + (Number.isFinite(m.percentage) ? m.percentage : 0), 0);
  if (totalPct <= 0) {
    return milestones.map((m) => ({ ...m, amount: 0 }));
  }

  let runningSum = 0;
  return milestones.map((m, idx) => {
    if (idx === milestones.length - 1) {
      const remainder = roundMoney(Math.max(0, total - runningSum));
      return { ...m, amount: remainder };
    }
    const rawAmount = roundMoney((total * m.percentage) / 100);
    runningSum = roundMoney(runningSum + rawAmount);
    return { ...m, amount: rawAmount };
  });
}

export function calculateMilestonePercentageSum(milestones: MilestoneItem[]): number {
  return roundMoney(
    milestones.reduce((sum, m) => sum + (Number.isFinite(m.percentage) ? m.percentage : 0), 0)
  );
}

export function evaluateScopeProtection(doc: SowDocument): ScopeProtectionReport {
  const firstMilestone = doc.milestones[0];
  const isEndOnly =
    doc.milestones.length === 1 &&
    Boolean(firstMilestone) &&
    /(launch|final|end|completion|delivery)/i.test(
      `${firstMilestone.label} ${firstMilestone.dueTrigger}`
    );
  const firstDeposit = isEndOnly ? 0 : (firstMilestone?.percentage ?? 0);
  const pctSum = calculateMilestonePercentageSum(doc.milestones);
  const hasDescriptions =
    doc.deliverables.length > 0 &&
    doc.deliverables.every((d) => d.title.trim().length > 0 && d.description.trim().length >= 8);

  const checks: ScopeCheck[] = [
    {
      id: "exclusions",
      label: "Explicit out-of-scope exclusions (2+)",
      passed: doc.exclusions.length >= 2,
      points: doc.exclusions.length >= 2 ? 22 : doc.exclusions.length === 1 ? 10 : 0,
      maxPoints: 22,
      fixHint: "Add at least 2 explicit out-of-scope exclusions.",
    },
    {
      id: "deposit",
      label: "Upfront kickoff deposit (>= 30%)",
      passed: firstDeposit >= 30,
      points: firstDeposit >= 30 ? 18 : firstDeposit > 0 ? 8 : 0,
      maxPoints: 18,
      fixHint: "Require at least a 30% kickoff deposit.",
    },
    {
      id: "revisions",
      label: "Capped revision rounds (1-3 rounds)",
      passed: doc.revisionRounds >= 1 && doc.revisionRounds <= 3,
      points: doc.revisionRounds >= 1 && doc.revisionRounds <= 3 ? 15 : 4,
      maxPoints: 15,
      fixHint: "Cap revisions at 2 rounds per milestone.",
    },
    {
      id: "change_order_rate",
      label: "Out-of-scope hourly Change Order rate set",
      passed: doc.changeOrderRate > 0,
      points: doc.changeOrderRate > 0 ? 15 : 0,
      maxPoints: 15,
      fixHint: "Set an hourly Change Order billing rate (e.g. $150/hr).",
    },
    {
      id: "acceptance_window",
      label: "Client sign-off window defined (<= 10 days)",
      passed: doc.acceptanceBusinessDays >= 1 && doc.acceptanceBusinessDays <= 10,
      points: doc.acceptanceBusinessDays >= 1 && doc.acceptanceBusinessDays <= 10 ? 10 : 0,
      maxPoints: 10,
      fixHint: "Set a 5-business-day acceptance window.",
    },
    {
      id: "ip_transfer",
      label: "IP transfers only upon full payment",
      passed: doc.ipTransferOnFullPayment,
      points: doc.ipTransferOnFullPayment ? 10 : 0,
      maxPoints: 10,
      fixHint: "Protect IP ownership until final invoice clears.",
    },
    {
      id: "milestones_and_details",
      label: "Deliverable specs & 100% milestone allocation",
      passed: hasDescriptions && Math.abs(pctSum - 100) < 0.01,
      points:
        (hasDescriptions ? 5 : 0) + (Math.abs(pctSum - 100) < 0.01 ? 5 : 0),
      maxPoints: 10,
      fixHint: "Ensure deliverables have descriptions and milestones sum to 100%.",
    },
  ];

  const score = Math.min(
    100,
    checks.reduce((sum, c) => sum + c.points, 0)
  );
  const grade = score >= 85 ? "Watertight" : score >= 65 ? "Solid" : "Exposed";

  return { score, grade, checks };
}

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  const locale = currency === "EUR" ? "en-IE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateMarkdownExport(doc: SowDocument, isPro: boolean): string {
  const subtotal = calculateSubtotal(doc.deliverables);
  const tax = calculateTax(subtotal, doc.taxRate);
  const total = calculateTotal(doc);
  const milestones = calculateMilestones(doc.milestones, total);
  const docLabel = doc.mode === "change_order" ? "CHANGE ORDER" : "STATEMENT OF WORK";

  const lines: string[] = [
    `# ${docLabel}: ${doc.projectTitle}`,
    `**Document #:** ${doc.documentNumber}${
      doc.mode === "change_order" && doc.parentSowNumber
        ? ` | **Parent SOW:** ${doc.parentSowNumber}`
        : ""
    }`,
    `**Prepared By:** ${doc.providerName} (${doc.providerEmail})`,
    `**Prepared For:** ${doc.clientCompany} (${doc.clientContact})`,
    `**Issue Date:** ${doc.issueDate} | **Valid Until:** ${doc.validUntil}`,
    "",
    "## 1. Executive Summary",
    doc.summary,
    "",
  ];

  if (doc.mode === "change_order") {
    lines.push(
      "## Change Order Justification & Schedule Impact",
      `- **Reason for Scope Modification:** ${doc.changeReason || "Client-requested expansion beyond baseline SOW."}`,
      `- **Timeline Impact:** +${doc.timelineImpactDays} business days`,
      ""
    );
  }

  lines.push("## 2. Included Deliverables & Investment");
  doc.deliverables.forEach((d, idx) => {
    const lineTotal = calculateDeliverableLineTotal(d);
    lines.push(
      `${idx + 1}. **${d.title}** — ${d.quantity} ${d.unitLabel} @ ${formatCurrency(
        d.unitPrice,
        doc.currency
      )} = **${formatCurrency(lineTotal, doc.currency)}**\n   ${d.description}`
    );
  });

  lines.push(
    "",
    `- **Subtotal:** ${formatCurrency(subtotal, doc.currency)}`,
    ...(doc.taxRate > 0 ? [`- **Tax (${doc.taxRate}%):** ${formatCurrency(tax, doc.currency)}`] : []),
    `- **Total Investment:** ${formatCurrency(total, doc.currency)}`,
    ""
  );

  lines.push("## 3. Explicit Out-of-Scope Exclusions");
  doc.exclusions.forEach((ex) => lines.push(`- ${ex}`));

  lines.push("", "## 4. Payment Schedule");
  milestones.forEach((m) => {
    lines.push(
      `- **${m.label}** (${m.percentage}% — ${formatCurrency(m.amount, doc.currency)}): ${m.dueTrigger}`
    );
  });

  lines.push(
    "",
    "## 5. Commercial & Scope Guardrails",
    `- **Included Revisions:** Up to ${doc.revisionRounds} consolidated round(s) per milestone.`,
    `- **Out-of-Scope Rate:** ${formatCurrency(doc.changeOrderRate, doc.currency)}/hr via written Change Order.`,
    `- **Acceptance Window:** ${doc.acceptanceBusinessDays} business days from delivery; silent approval applies thereafter.`,
    `- **Cancellation / Kill Fee:** ${doc.killFeePercent}% of remaining unbilled balance upon client cancellation without cause.`,
    `- **Intellectual Property:** ${
      doc.ipTransferOnFullPayment
        ? "All final deliverables transfer upon receipt of 100% payment."
        : "Licensed per attached Master Services Agreement."
    }`,
    `- **Governing Law:** State of ${doc.governingState}, USA.`,
    ""
  );

  if (!isPro) {
    lines.push("---", "*Prepared with ScopeCraft — https://scopecraft-sow.vercel.app*");
  } else if (doc.brand.customFooter.trim()) {
    lines.push("---", `*${doc.brand.customFooter.trim()}*`);
  }

  return lines.join("\n");
}

export function generateShareableSummary(doc: SowDocument, isPro: boolean): string {
  const total = calculateTotal(doc);
  const milestones = calculateMilestones(doc.milestones, total);
  const header =
    doc.mode === "change_order"
      ? `Change Order Summary — ${doc.projectTitle}`
      : `Project Scope Summary — ${doc.projectTitle}`;

  const lines: string[] = [
    header,
    `Doc #: ${doc.documentNumber} | Total: ${formatCurrency(total, doc.currency)}`,
    "",
    "Included Deliverables:",
    ...doc.deliverables.map(
      (d) =>
        `- ${d.title} (${formatCurrency(calculateDeliverableLineTotal(d), doc.currency)})`
    ),
    "",
    "Explicit Exclusions:",
    ...doc.exclusions.map((ex) => `- ${ex}`),
    "",
    "Payment Schedule:",
    ...milestones.map(
      (m) => `- ${m.label}: ${m.percentage}% (${formatCurrency(m.amount, doc.currency)})`
    ),
    "",
    `Revisions: ${doc.revisionRounds} round(s) | Out-of-scope rate: ${formatCurrency(
      doc.changeOrderRate,
      doc.currency
    )}/hr`,
  ];

  if (!isPro) {
    lines.push("", "Prepared with ScopeCraft · https://scopecraft-sow.vercel.app");
  } else if (doc.brand.customFooter.trim()) {
    lines.push("", doc.brand.customFooter.trim());
  }

  return lines.join("\n");
}
