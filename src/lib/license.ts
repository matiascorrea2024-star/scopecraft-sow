import { LICENSE_HASH_SALT, VALID_LICENSE_HASHES } from "./licenseHashes";

const LICENSE_STORAGE_KEY = "scopecraft_pro_license_v1";
const KEY_REGEX = /^SC-PRO-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

export function normalizeLicenseKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidLicenseFormat(key: string): boolean {
  const normalized = normalizeLicenseKey(key);
  if (!KEY_REGEX.test(normalized)) return false;

  const parts = normalized.replace("SC-PRO-", "").replace(/-/g, "");
  if (parts.length !== 12) return false;

  const body = parts.slice(0, 11);
  const checksumChar = parts[11];

  for (const ch of parts) {
    if (!ALPHABET.includes(ch)) return false;
  }

  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum = (sum * 31 + body.charCodeAt(i)) % ALPHABET.length;
  }
  return ALPHABET[sum] === checksumChar;
}

export async function hashLicenseKeyClient(normalizedKey: string): Promise<string> {
  const data = new TextEncoder().encode(`${LICENSE_HASH_SALT}:${normalizedKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

export async function verifyLicenseKeyClient(
  rawKey: string
): Promise<{ valid: boolean; normalizedKey: string; reason?: string }> {
  const normalizedKey = normalizeLicenseKey(rawKey);
  if (!isValidLicenseFormat(normalizedKey)) {
    return {
      valid: false,
      normalizedKey,
      reason: "Invalid format. Expected SC-PRO-XXXX-XXXX-XXXX.",
    };
  }

  const hashPrefix = await hashLicenseKeyClient(normalizedKey);
  if (VALID_LICENSE_HASHES.has(hashPrefix)) {
    return { valid: true, normalizedKey };
  }

  return {
    valid: false,
    normalizedKey,
    reason: "License key not recognized. Check for typos or contact CraftApp Studio.",
  };
}

export function getStoredLicense(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LICENSE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveStoredLicense(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LICENSE_STORAGE_KEY, normalizeLicenseKey(key));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearStoredLicense(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LICENSE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
