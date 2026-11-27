import { describe, expect, it } from "vitest";
import { buildDocumentFromTemplate, SOW_TEMPLATES } from "@/data/templates";
import { buildAuditScorecardText, evaluateScopeAudit } from "@/lib/auditMath";
import {
  decodeSharePayload,
  encodeSharePayload,
  sharedPayloadToDocument,
} from "@/lib/shareLink";

describe("Scope-Creep Audit Calculator & Client Share Links", () => {
  it("computes illustrative scope-creep exposure accurately", () => {
    const exposed = evaluateScopeAudit({
      budgetUsd: 10000,
      templateSlug: "web-development-sow",
      hasUpfrontDeposit: false,
      hasExplicitExclusions: false,
      hasRevisionCap: false,
      hasChangeOrderRate: false,
      hasAcceptanceWindow: false,
      hasIpProtection: false,
    });

    expect(exposed.passedCount).toBe(0);
    expect(exposed.protectionScore).toBe(0);
    expect(exposed.estimatedExposureUsd).toBe(3500);
    expect(exposed.grade).toBe("High Exposure");

    const protectedAudit = evaluateScopeAudit({
      budgetUsd: 10000,
      templateSlug: "web-development-sow",
      hasUpfrontDeposit: true,
      hasExplicitExclusions: true,
      hasRevisionCap: true,
      hasChangeOrderRate: true,
      hasAcceptanceWindow: true,
      hasIpProtection: true,
    });

    expect(protectedAudit.passedCount).toBe(6);
    expect(protectedAudit.protectionScore).toBe(100);
    expect(protectedAudit.estimatedExposureUsd).toBe(0);
    expect(protectedAudit.grade).toBe("Watertight");

    const cardText = buildAuditScorecardText(exposed, "https://scopecraft-sow.vercel.app/audit");
    expect(cardText).toContain("0/6 guardrails");
    expect(cardText).toContain("$3,500");
  });

  it("encodes and decodes share links while stripping private emails", () => {
    const doc = buildDocumentFromTemplate(SOW_TEMPLATES[0]);
    doc.providerEmail = "secret-provider@example.com";
    doc.clientEmail = "secret-client@example.com";

    const encoded = encodeSharePayload(doc, false);
    expect(encoded.length).toBeGreaterThan(20);

    const decoded = decodeSharePayload(`#d=${encoded}`);
    expect(decoded).not.toBeNull();
    expect(decoded?.projectTitle).toBe(doc.projectTitle);
    expect(decoded?.isProAuthor).toBe(false);

    const reconstructed = sharedPayloadToDocument(decoded!);
    expect(reconstructed.providerEmail).toBe("");
    expect(reconstructed.clientEmail).toBe("");
    expect(JSON.stringify(decoded)).not.toContain("secret-provider@example.com");
    expect(JSON.stringify(decoded)).not.toContain("secret-client@example.com");
  });
});
