import { describe, expect, it } from "vitest";
import { SOW_TEMPLATES } from "@/data/templates";
import { calculateMilestonePercentageSum } from "@/lib/sowMath";

describe("Programmatic SEO Templates Catalog", () => {
  it("contains exactly 30 unique templates with valid SEO and SOW data", () => {
    expect(SOW_TEMPLATES).toHaveLength(30);

    const slugs = new Set<string>();
    const metaTitles = new Set<string>();
    const metaDescriptions = new Set<string>();

    for (const tpl of SOW_TEMPLATES) {
      expect(tpl.slug.length).toBeGreaterThan(5);
      expect(slugs.has(tpl.slug)).toBe(false);
      slugs.add(tpl.slug);

      expect(metaTitles.has(tpl.metaTitle)).toBe(false);
      metaTitles.add(tpl.metaTitle);

      expect(metaDescriptions.has(tpl.metaDescription)).toBe(false);
      metaDescriptions.add(tpl.metaDescription);

      expect(tpl.presetDocument.deliverables.length).toBeGreaterThanOrEqual(2);
      expect(tpl.presetDocument.exclusions.length).toBeGreaterThanOrEqual(2);
      expect(tpl.faqs.length).toBeGreaterThanOrEqual(3);
      expect(tpl.commonScopeTraps.length).toBe(3);

      const pctSum = calculateMilestonePercentageSum(tpl.presetDocument.milestones);
      expect(pctSum).toBe(100);
    }
  });
});
