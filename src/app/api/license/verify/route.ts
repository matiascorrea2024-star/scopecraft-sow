import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { isValidLicenseFormat, normalizeLicenseKey } from "@/lib/license";
import { LICENSE_HASH_SALT, VALID_LICENSE_HASHES } from "@/lib/licenseHashes";

function hashLicenseServer(normalizedKey: string): string {
  return crypto
    .createHash("sha256")
    .update(`${LICENSE_HASH_SALT}:${normalizedKey}`)
    .digest("hex")
    .slice(0, 20);
}

function verifyDynamicHmacKey(normalizedKey: string): boolean {
  const secret = process.env.LICENSE_HMAC_SECRET;
  if (!secret) return false;
  // Format for future Payhip / PayPal webhook-issued keys: SC-LIVE-<8HEX>-<8SIG>
  const match = /^SC-LIVE-([A-F0-9]{8})-([A-F0-9]{8})$/.exec(normalizedKey);
  if (!match) return false;
  const [, token, sig] = match;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex")
    .toUpperCase()
    .slice(0, 8);
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { key?: unknown };
    const rawKey = typeof body.key === "string" ? body.key : "";
    const normalizedKey = normalizeLicenseKey(rawKey);

    if (!normalizedKey) {
      return NextResponse.json(
        { valid: false, reason: "Please enter a license key." },
        { status: 400 }
      );
    }

    if (verifyDynamicHmacKey(normalizedKey)) {
      return NextResponse.json({ valid: true, key: normalizedKey, tier: "pro" });
    }

    if (!isValidLicenseFormat(normalizedKey)) {
      return NextResponse.json(
        { valid: false, reason: "Invalid format. Expected SC-PRO-XXXX-XXXX-XXXX." },
        { status: 400 }
      );
    }

    const hashPrefix = hashLicenseServer(normalizedKey);
    if (!VALID_LICENSE_HASHES.has(hashPrefix)) {
      return NextResponse.json(
        { valid: false, reason: "License key not recognized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ valid: true, key: normalizedKey, tier: "pro" });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Unable to process license verification request." },
      { status: 400 }
    );
  }
}
