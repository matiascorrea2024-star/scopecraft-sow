import { describe, expect, it } from "vitest";
import { buildDocumentFromTemplate, SOW_TEMPLATES } from "@/data/templates";
import {
  calculateMilestones,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  evaluateScopeProtection,
  formatCurrency,
  generateMarkdownExport,
  generateShareableSummary,
} from "@/lib/sowMath";

describe("SOW Financial & Scope Protection Math", () => {
  it("computes subtotal, tax, and total cleanly", () => {
    const doc = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    doc.deliverables = [
      { id: "1", title: "Phase 1", description: "Discovery and design spec", quantity: 2, unitLabel: "sprints", unitPrice: 1250 },
      { id: "2", title: "Phase 2", description: "Build and production QA", quantity: 1, unitLabel: "build", unitPrice: 3500 },
    ];
    doc.taxRate = 8.5;

    const subtotal = calculateSubtotal(doc.deliverables);
    expect(subtotal).toBe(6000);
    expect(calculateTax(subtotal, doc.taxRate)).toBe(510);
    expect(calculateTotal(doc)).toBe(6510);
  });

  it("reconciles milestone rounding so final milestone matches exact total", () => {
    const total = 1000;
    const milestones = [
      { id: "m1", label: "Deposit", percentage: 33.33, dueTrigger: "Sign" },
      { id: "m2", label: "Mid", percentage: 33.33, dueTrigger: "Staging" },
      { id: "m3", label: "Final", percentage: 33.34, dueTrigger: "Launch" },
    ];
    const computed = calculateMilestones(milestones, total);
    const sum = computed.reduce((acc, m) => acc + m.amount, 0);
    expect(Number(sum.toFixed(2))).toBe(1000);
  });

  it("scores watertight SOWs high and exposed SOWs low", () => {
    const watertight = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    const strongReport = evaluateScopeProtection(watertight);
    expect(strongReport.score).toBe(100);
    expect(strongReport.grade).toBe("Watertight");

    const exposed = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    exposed.exclusions = [];
    exposed.changeOrderRate = 0;
    exposed.ipTransferOnFullPayment = false;
    exposed.milestones = [{ id: "m1", label: "End", percentage: 100, dueTrigger: "Launch" }];
    exposed.revisionRounds = 8;

    const weakReport = evaluateScopeProtection(exposed);
    expect(weakReport.score).toBeLessThan(40);
    expect(weakReport.grade).toBe("Exposed");
  });

  it("includes viral badge in free Markdown export and omits it in Pro", () => {
    const doc = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    const freeMd = generateMarkdownExport(doc, false);
    const proMd = generateMarkdownExport(doc, true);

    expect(freeMd).toContain("Prepared with ScopeCraft");
    expect(proMd).not.toContain("Prepared with ScopeCraft");
  });

  it("formats USD currency cleanly", () => {
    expect(formatCurrency(7900, "USD")).toBe("$7,900");
    expect(formatCurrency(125.5, "USD")).toBe("$125.50");
  });

  it("generates shareable scope summary with attribution in free and clean in Pro", () => {
    const doc = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    const freeSummary = generateShareableSummary(doc, false);
    const proSummary = generateShareableSummary(doc, true);

    expect(freeSummary).toContain("Project Scope Summary");
    expect(freeSummary).toContain("Prepared with ScopeCraft");
    expect(proSummary).not.toContain("Prepared with ScopeCraft");
  });
});
