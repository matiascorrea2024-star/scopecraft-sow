import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BILLING_PLANS, PAYPAL_ME_BASE } from "@/config/billing";
import { isValidLicenseFormat, verifyLicenseKeyClient } from "@/lib/license";

describe("License Engine & Billing Config", () => {
  it("points monthly and annual checkout strictly to paypal.me/craftappstudio", () => {
    expect(PAYPAL_ME_BASE).toBe("https://paypal.me/craftappstudio");
    expect(BILLING_PLANS.monthly.checkoutUrl).toBe("https://paypal.me/craftappstudio/12USD");
    expect(BILLING_PLANS.annual.checkoutUrl).toBe("https://paypal.me/craftappstudio/79USD");
    expect(JSON.stringify(BILLING_PLANS).toLowerCase()).not.toContain("mercadopago");
  });

  it("validates real keys from launch_kit/license_keys_500.txt and rejects forged keys", async () => {
    const keysPath = path.join(process.cwd(), "launch_kit", "license_keys_500.txt");
    const keys = fs.readFileSync(keysPath, "utf8").trim().split("\n");
    expect(keys.length).toBe(500);

    for (const sample of [keys[0], keys[123], keys[499]]) {
      expect(isValidLicenseFormat(sample)).toBe(true);
      const res = await verifyLicenseKeyClient(sample.toLowerCase());
      expect(res.valid).toBe(true);
    }

    const fake = await verifyLicenseKeyClient("SC-PRO-AAAA-AAAA-AAAA");
    expect(fake.valid).toBe(false);

    const malformed = await verifyLicenseKeyClient("INVALID-KEY");
    expect(malformed.valid).toBe(false);
  });
});
