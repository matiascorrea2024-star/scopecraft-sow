import { jsPDF } from "jspdf";
import { SITE_URL } from "@/config/site";
import {
  calculateDeliverableLineTotal,
  calculateMilestones,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  roundMoney,
} from "@/lib/sowMath";
import { SowDocument } from "@/types/sow";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  return [15, 92, 74]; // Default Deep Forest #0F5C4A
}

export function exportSowToPdf(doc: SowDocument, isPro: boolean): void {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 612
  const pageHeight = pdf.internal.pageSize.getHeight(); // 792
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 58;

  const accentRgb: [number, number, number] =
    isPro && doc.brand.accentColor ? hexToRgb(doc.brand.accentColor) : [15, 92, 74];

  const subtotal = calculateSubtotal(doc.deliverables);
  const tax = calculateTax(subtotal, doc.taxRate);
  const total = calculateTotal(doc);
  const milestones = calculateMilestones(doc.milestones, total);

  let y = 44;

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) {
      pdf.addPage();
      y = 48;
    }
  };

  // Top accent hairline rule
  pdf.setFillColor(...accentRgb);
  pdf.rect(0, 0, pageWidth, 5, "F");

  // Optional Pro Logo
  let headerTextX = marginX;
  if (isPro && doc.brand.logoDataUrl) {
    try {
      const format = doc.brand.logoDataUrl.includes("image/png") ? "PNG" : "JPEG";
      pdf.addImage(doc.brand.logoDataUrl, format, marginX, y - 4, 34, 34);
      headerTextX = marginX + 44;
    } catch {
      headerTextX = marginX;
    }
  }

  // Document type tag & Document Number
  const docTag = doc.mode === "change_order" ? "CHANGE ORDER ADDENDUM" : "STATEMENT OF WORK";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...accentRgb);
  pdf.text(docTag, headerTextX, y + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(110, 108, 100);
  pdf.text(
    `Doc # ${doc.documentNumber}${
      doc.mode === "change_order" && doc.parentSowNumber
        ? `  |  Parent SOW: ${doc.parentSowNumber}`
        : ""
    }`,
    pageWidth - marginX,
    y + 6,
    { align: "right" }
  );

  y += 22;

  // Project Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.setTextColor(20, 20, 19);
  const titleLines = pdf.splitTextToSize(doc.projectTitle || "Untitled Statement of Work", contentWidth);
  pdf.text(titleLines, headerTextX, y);
  y += titleLines.length * 22 + 4;

  // Meta bar
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(82, 81, 75);
  pdf.text(
    `Issue Date: ${doc.issueDate}    |    Valid Until: ${doc.validUntil}    |    Target Window: ${doc.targetStartDate} to ${doc.targetEndDate}`,
    marginX,
    y
  );
  y += 14;

  // Hairline divider
  pdf.setDrawColor(229, 227, 220);
  pdf.setLineWidth(0.75);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  // Prepared By / Prepared For 2-column block
  const colWidth = (contentWidth - 20) / 2;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(110, 108, 100);
  pdf.text("PREPARED BY (SERVICE PROVIDER)", marginX, y);
  pdf.text("PREPARED FOR (CLIENT)", marginX + colWidth + 20, y);
  y += 13;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(20, 20, 19);
  pdf.text(doc.providerName || "Service Provider", marginX, y);
  pdf.text(doc.clientCompany || "Client Company", marginX + colWidth + 20, y);
  y += 13;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(82, 81, 75);
  pdf.text(
    [doc.providerContact, doc.providerEmail, doc.providerLocation].filter(Boolean).join(" • "),
    marginX,
    y
  );
  pdf.text(
    [doc.clientContact, doc.clientEmail].filter(Boolean).join(" • "),
    marginX + colWidth + 20,
    y
  );
  y += 22;

  // Section 1: Summary
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 19);
  pdf.text("1. Project Overview & Objective", marginX, y);
  y += 14;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(65, 64, 59);
  const summaryLines = pdf.splitTextToSize(doc.summary || "", contentWidth);
  pdf.text(summaryLines, marginX, y);
  y += summaryLines.length * 13 + 10;

  if (doc.mode === "change_order") {
    ensureSpace(52);
    pdf.setFillColor(243, 242, 238);
    pdf.roundedRect(marginX, y, contentWidth, 42, 3, 3, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...accentRgb);
    pdf.text(
      `CHANGE ORDER IMPACT: +${doc.timelineImpactDays} BUSINESS DAYS  |  NET ADDITION: ${formatCurrency(
        total,
        doc.currency
      )}`,
      marginX + 10,
      y + 15
    );
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(65, 64, 59);
    const reasonLines = pdf.splitTextToSize(
      `Reason: ${doc.changeReason || "Client-requested scope expansion."}`,
      contentWidth - 20
    );
    pdf.text(reasonLines[0] ?? "", marginX + 10, y + 30);
    y += 54;
  }

  // Section 2: Deliverables & Investment
  ensureSpace(64);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 19);
  pdf.text("2. Included Deliverables & Investment", marginX, y);
  y += 14;

  // Table header
  pdf.setFillColor(243, 242, 238);
  pdf.rect(marginX, y, contentWidth, 20, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(82, 81, 75);
  pdf.text("DELIVERABLE", marginX + 8, y + 13);
  pdf.text("QTY", marginX + 330, y + 13, { align: "right" });
  pdf.text("RATE", marginX + 415, y + 13, { align: "right" });
  pdf.text("TOTAL", pageWidth - marginX - 8, y + 13, { align: "right" });
  y += 24;

  doc.deliverables.forEach((item) => {
    const descLines = pdf.splitTextToSize(item.description || "", 265);
    const rowHeight = Math.max(28, 16 + descLines.length * 11 + 8);
    ensureSpace(rowHeight + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(20, 20, 19);
    pdf.text(item.title || "Deliverable", marginX + 8, y + 10);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(95, 93, 86);
    pdf.text(descLines, marginX + 8, y + 22);

    const lineTotal = calculateDeliverableLineTotal(item);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(20, 20, 19);
    pdf.text(`${item.quantity} ${item.unitLabel}`, marginX + 330, y + 10, { align: "right" });
    pdf.text(formatCurrency(item.unitPrice, doc.currency), marginX + 415, y + 10, {
      align: "right",
    });
    pdf.setFont("helvetica", "bold");
    pdf.text(formatCurrency(lineTotal, doc.currency), pageWidth - marginX - 8, y + 10, {
      align: "right",
    });

    y += rowHeight;
    pdf.setDrawColor(235, 233, 227);
    pdf.line(marginX, y, pageWidth - marginX, y);
    y += 6;
  });

  // Totals block
  ensureSpace(58);
  y += 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(82, 81, 75);
  pdf.text("Subtotal", pageWidth - marginX - 110, y, { align: "right" });
  pdf.setTextColor(20, 20, 19);
  pdf.text(formatCurrency(subtotal, doc.currency), pageWidth - marginX - 8, y, { align: "right" });
  y += 15;

  if (doc.taxRate > 0) {
    pdf.setTextColor(82, 81, 75);
    pdf.text(`Tax (${doc.taxRate}%)`, pageWidth - marginX - 110, y, { align: "right" });
    pdf.setTextColor(20, 20, 19);
    pdf.text(formatCurrency(tax, doc.currency), pageWidth - marginX - 8, y, { align: "right" });
    y += 15;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...accentRgb);
  pdf.text("Total Investment", pageWidth - marginX - 110, y, { align: "right" });
  pdf.text(formatCurrency(total, doc.currency), pageWidth - marginX - 8, y, { align: "right" });
  y += 22;

  // Optional Pro 3-Option Pricing Table
  if (isPro && doc.includePricingOptions && doc.pricingOptions.length > 0) {
    ensureSpace(88);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(20, 20, 19);
    pdf.text("Optional Engagement Packages", marginX, y);
    y += 12;
    doc.pricingOptions.forEach((opt) => {
      const optPrice = roundMoney(total * opt.priceMultiplier);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(20, 20, 19);
      pdf.text(
        `${opt.name}${opt.recommended ? " (Recommended)" : ""} — ${formatCurrency(
          optPrice,
          doc.currency
        )}`,
        marginX + 8,
        y + 10
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(95, 93, 86);
      pdf.text(opt.summary, marginX + 8, y + 22);
      y += 30;
    });
    y += 6;
  }

  // Section 3: Explicit Out-of-Scope Exclusions
  const exclusionsHeight = Math.max(44, 24 + doc.exclusions.length * 15);
  ensureSpace(exclusionsHeight + 24);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 19);
  pdf.text("3. Explicit Out-of-Scope Exclusions", marginX, y);
  y += 12;

  pdf.setFillColor(243, 242, 238);
  pdf.roundedRect(marginX, y, contentWidth, exclusionsHeight, 3, 3, "F");
  let exY = y + 16;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.8);
  pdf.setTextColor(55, 54, 49);
  doc.exclusions.forEach((ex) => {
    const lines = pdf.splitTextToSize(`•  ${ex}`, contentWidth - 20);
    pdf.text(lines, marginX + 10, exY);
    exY += lines.length * 12 + 2;
  });
  y += Math.max(exclusionsHeight, exY - y + 6) + 14;

  // Section 4: Milestone Payment Schedule
  ensureSpace(40 + milestones.length * 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 19);
  pdf.text("4. Milestone Payment Schedule", marginX, y);
  y += 14;

  milestones.forEach((m) => {
    ensureSpace(22);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(20, 20, 19);
    pdf.text(`${m.label} (${m.percentage}%)`, marginX + 8, y);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(95, 93, 86);
    pdf.text(m.dueTrigger, marginX + 190, y);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(20, 20, 19);
    pdf.text(formatCurrency(m.amount, doc.currency), pageWidth - marginX - 8, y, {
      align: "right",
    });

    y += 16;
  });
  y += 10;

  // Section 5: Commercial & Scope Guardrails
  ensureSpace(110);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 19);
  pdf.text("5. Commercial Terms & Scope Protection", marginX, y);
  y += 14;

  const clauses = [
    `Revisions: Includes up to ${doc.revisionRounds} consolidated revision round(s) per milestone.`,
    `Change Orders: Requests outside Section 2 require a signed Change Order billed at ${formatCurrency(
      doc.changeOrderRate,
      doc.currency
    )}/hr.`,
    `Client Review Window: Client has ${doc.acceptanceBusinessDays} business day(s) to review deliverables; silence constitutes approval.`,
    `Cancellation / Kill Fee: ${doc.killFeePercent}% of remaining unbilled balance applies if cancelled without cause.`,
    `Intellectual Property: ${
      doc.ipTransferOnFullPayment
        ? "All final deliverable rights transfer to Client strictly upon receipt of 100% payment."
        : "Usage license governed by attached Master Services Agreement."
    }`,
    `Late Invoices & Law: Past-due balances accrue ${doc.lateFeeMonthlyPercent}%/month. Governed by the laws of ${doc.governingState}, USA.`,
  ];

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.8);
  pdf.setTextColor(65, 64, 59);
  clauses.forEach((clause) => {
    const lines = pdf.splitTextToSize(`•  ${clause}`, contentWidth - 10);
    ensureSpace(lines.length * 12 + 4);
    pdf.text(lines, marginX + 6, y);
    y += lines.length * 12 + 3;
  });

  // Signatures
  ensureSpace(88);
  y += 18;
  pdf.setDrawColor(229, 227, 220);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(110, 108, 100);
  pdf.text("AUTHORIZED BY PROVIDER", marginX, y);
  pdf.text("ACCEPTED BY CLIENT", marginX + colWidth + 20, y);
  y += 28;

  pdf.setDrawColor(180, 178, 170);
  pdf.line(marginX, y, marginX + colWidth - 10, y);
  pdf.line(marginX + colWidth + 20, y, pageWidth - marginX, y);
  y += 12;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(82, 81, 75);
  pdf.text(`${doc.providerContact || doc.providerName}  •  Date: ____________`, marginX, y);
  pdf.text(
    `${doc.clientContact || doc.clientCompany}  •  Date: ____________`,
    marginX + colWidth + 20,
    y
  );

  // Page footers (viral free badge vs clean Pro white-label footer)
  const pageCount = pdf.getNumberOfPages();
  const displayDomain = SITE_URL.replace(/^https?:\/\//, "");
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(235, 233, 227);
    pdf.line(marginX, pageHeight - 36, pageWidth - marginX, pageHeight - 36);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(110, 108, 100);

    if (!isPro) {
      pdf.text(`Prepared with ScopeCraft  |  ${displayDomain}`, marginX, pageHeight - 22);
    } else {
      const footerNote =
        doc.brand.customFooter.trim() || `Confidential — Prepared by ${doc.providerName}`;
      pdf.text(footerNote, marginX, pageHeight - 22);
    }

    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 22, {
      align: "right",
    });
  }

  const safeDocNum = (doc.documentNumber || "Document").replace(/[^a-zA-Z0-9_-]/g, "_");
  pdf.save(`ScopeCraft_${safeDocNum}.pdf`);
}
