export interface AuditInputs {
  budgetUsd: number;
  templateSlug: string;
  hasUpfrontDeposit: boolean;
  hasExplicitExclusions: boolean;
  hasRevisionCap: boolean;
  hasChangeOrderRate: boolean;
  hasAcceptanceWindow: boolean;
  hasIpProtection: boolean;
}

export interface AuditGuardrailResult {
  id: keyof Omit<AuditInputs, "budgetUsd" | "templateSlug">;
  label: string;
  passed: boolean;
  riskPercent: number;
  exposureUsd: number;
  fixCopy: string;
}

export interface ScopeAuditReport {
  budgetUsd: number;
  passedCount: number;
  totalChecks: number;
  protectionScore: number;
  grade: "Watertight" | "Moderate Risk" | "High Exposure";
  estimatedExposureUsd: number;
  guardrails: AuditGuardrailResult[];
}

const GUARDRAIL_DEFS: Array<{
  id: keyof Omit<AuditInputs, "budgetUsd" | "templateSlug">;
  label: string;
  points: number;
  riskPercent: number;
  fixCopy: string;
}> = [
  {
    id: "hasExplicitExclusions",
    label: "Explicit out-of-scope exclusions list",
    points: 22,
    riskPercent: 9,
    fixCopy: "Itemize what is NOT included so 'quick favors' trigger a Change Order.",
  },
  {
    id: "hasUpfrontDeposit",
    label: "Upfront kickoff deposit (>= 30%)",
    points: 20,
    riskPercent: 7,
    fixCopy: "Collect 30–50% upon signing before reserving calendar capacity.",
  },
  {
    id: "hasRevisionCap",
    label: "Capped revision rounds (1–3 rounds)",
    points: 18,
    riskPercent: 7,
    fixCopy: "Cap revisions at 2 consolidated rounds per milestone.",
  },
  {
    id: "hasChangeOrderRate",
    label: "Written out-of-scope hourly Change Order rate",
    points: 16,
    riskPercent: 6,
    fixCopy: "Set an hourly addendum rate ($125–$185/hr) before kickoff.",
  },
  {
    id: "hasAcceptanceWindow",
    label: "Client review / silent-approval window",
    points: 12,
    riskPercent: 3,
    fixCopy: "Add a 5-business-day sign-off window so projects do not stall.",
  },
  {
    id: "hasIpProtection",
    label: "IP transfers strictly on 100% final payment",
    points: 12,
    riskPercent: 3,
    fixCopy: "Retain copyright & source ownership until the final invoice clears.",
  },
];

export function evaluateScopeAudit(inputs: AuditInputs): ScopeAuditReport {
  const safeBudget = Number.isFinite(inputs.budgetUsd)
    ? Math.max(250, Math.min(500_000, inputs.budgetUsd))
    : 5000;

  let protectionScore = 0;
  let totalRiskPercent = 0;
  let passedCount = 0;

  const guardrails: AuditGuardrailResult[] = GUARDRAIL_DEFS.map((def) => {
    const passed = Boolean(inputs[def.id]);
    if (passed) {
      protectionScore += def.points;
      passedCount += 1;
    } else {
      totalRiskPercent += def.riskPercent;
    }

    return {
      id: def.id,
      label: def.label,
      passed,
      riskPercent: passed ? 0 : def.riskPercent,
      exposureUsd: passed ? 0 : Math.round((safeBudget * def.riskPercent) / 100),
      fixCopy: def.fixCopy,
    };
  });

  const estimatedExposureUsd = Math.round((safeBudget * totalRiskPercent) / 100);
  const grade: ScopeAuditReport["grade"] =
    protectionScore >= 85
      ? "Watertight"
      : protectionScore >= 55
      ? "Moderate Risk"
      : "High Exposure";

  return {
    budgetUsd: safeBudget,
    passedCount,
    totalChecks: GUARDRAIL_DEFS.length,
    protectionScore,
    grade,
    estimatedExposureUsd,
    guardrails,
  };
}

export function buildAuditScorecardText(
  report: ScopeAuditReport,
  shareUrl: string
): string {
  const missing = report.guardrails.filter((g) => !g.passed);
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const lines = [
    `Scope Risk Scorecard: ${report.passedCount}/${report.totalChecks} guardrails (${report.protectionScore}/100 — ${report.grade})`,
    `Project Budget: ${fmt(report.budgetUsd)} | Illustrative Scope-Creep Exposure: ${fmt(
      report.estimatedExposureUsd
    )}`,
    ...(missing.length > 0
      ? ["", "Gaps found:", ...missing.map((m) => `- ${m.label} (~${m.riskPercent}% risk)`)]
      : ["", "All 6 commercial scope guardrails active."]),
    "",
    `Run your free 20-second scope check: ${shareUrl}`,
  ];

  return lines.join("\n");
}
