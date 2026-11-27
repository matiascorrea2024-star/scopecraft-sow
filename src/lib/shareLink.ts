import { SowDocument } from "@/types/sow";

export interface SharedSowPayload {
  v: 1;
  isProAuthor: boolean;
  mode: SowDocument["mode"];
  documentNumber: string;
  parentSowNumber: string;
  projectTitle: string;
  summary: string;
  issueDate: string;
  validUntil: string;
  targetStartDate: string;
  targetEndDate: string;
  currency: SowDocument["currency"];
  taxRate: number;
  providerName: string;
  providerContact: string;
  clientCompany: string;
  clientContact: string;
  deliverables: SowDocument["deliverables"];
  exclusions: string[];
  milestones: SowDocument["milestones"];
  revisionRounds: number;
  changeOrderRate: number;
  acceptanceBusinessDays: number;
  killFeePercent: number;
  ipTransferOnFullPayment: boolean;
  lateFeeMonthlyPercent: number;
  governingState: string;
  timelineImpactDays: number;
  changeReason: string;
  accentColor: string;
  customFooter: string;
}

function toBase64Url(utf8Str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(utf8Str, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(utf8Str);
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64Url: string): string {
  const padded = b64Url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64Url.length + 3) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Serializes a sanitized SOW into a URL-safe payload.
 * Intentionally omits providerEmail, clientEmail, and base64 logos to keep links compact and privacy-safe.
 */
export function encodeSharePayload(doc: SowDocument, isPro: boolean): string {
  const payload: SharedSowPayload = {
    v: 1,
    isProAuthor: isPro,
    mode: doc.mode,
    documentNumber: doc.documentNumber,
    parentSowNumber: doc.parentSowNumber,
    projectTitle: doc.projectTitle,
    summary: doc.summary,
    issueDate: doc.issueDate,
    validUntil: doc.validUntil,
    targetStartDate: doc.targetStartDate,
    targetEndDate: doc.targetEndDate,
    currency: doc.currency,
    taxRate: doc.taxRate,
    providerName: doc.providerName,
    providerContact: doc.providerContact,
    clientCompany: doc.clientCompany,
    clientContact: doc.clientContact,
    deliverables: doc.deliverables,
    exclusions: doc.exclusions,
    milestones: doc.milestones,
    revisionRounds: doc.revisionRounds,
    changeOrderRate: doc.changeOrderRate,
    acceptanceBusinessDays: doc.acceptanceBusinessDays,
    killFeePercent: doc.killFeePercent,
    ipTransferOnFullPayment: doc.ipTransferOnFullPayment,
    lateFeeMonthlyPercent: doc.lateFeeMonthlyPercent,
    governingState: doc.governingState,
    timelineImpactDays: doc.timelineImpactDays,
    changeReason: doc.changeReason,
    accentColor: isPro ? doc.brand.accentColor : "#0F5C4A",
    customFooter: isPro ? doc.brand.customFooter : "",
  };

  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharePayload(encoded: string): SharedSowPayload | null {
  try {
    const clean = encoded.replace(/^#?d=/, "").trim();
    if (!clean) return null;
    const parsed = JSON.parse(fromBase64Url(clean)) as SharedSowPayload;
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.deliverables)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function sharedPayloadToDocument(payload: SharedSowPayload): SowDocument {
  return {
    id: `shared-${payload.documentNumber}`,
    mode: payload.mode,
    templateSlug: "web-development-sow",
    documentNumber: payload.documentNumber,
    parentSowNumber: payload.parentSowNumber,
    projectTitle: payload.projectTitle,
    summary: payload.summary,
    issueDate: payload.issueDate,
    validUntil: payload.validUntil,
    targetStartDate: payload.targetStartDate,
    targetEndDate: payload.targetEndDate,
    currency: payload.currency,
    taxRate: payload.taxRate,
    providerName: payload.providerName,
    providerContact: payload.providerContact,
    providerEmail: "",
    providerLocation: "",
    clientCompany: payload.clientCompany,
    clientContact: payload.clientContact,
    clientEmail: "",
    deliverables: payload.deliverables,
    exclusions: payload.exclusions,
    milestones: payload.milestones,
    revisionRounds: payload.revisionRounds,
    changeOrderRate: payload.changeOrderRate,
    acceptanceBusinessDays: payload.acceptanceBusinessDays,
    killFeePercent: payload.killFeePercent,
    ipTransferOnFullPayment: payload.ipTransferOnFullPayment,
    lateFeeMonthlyPercent: payload.lateFeeMonthlyPercent,
    governingState: payload.governingState,
    includePricingOptions: false,
    pricingOptions: [],
    timelineImpactDays: payload.timelineImpactDays,
    changeReason: payload.changeReason,
    brand: {
      accentColor: payload.accentColor || "#0F5C4A",
      logoDataUrl: "",
      customFooter: payload.customFooter || "",
    },
  };
}
