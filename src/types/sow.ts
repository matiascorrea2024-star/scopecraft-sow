export type DocumentMode = "sow" | "change_order";

export type CurrencyCode = "USD" | "CAD" | "EUR" | "GBP";

export interface DeliverableItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitLabel: string;
  unitPrice: number;
}

export interface MilestoneItem {
  id: string;
  label: string;
  percentage: number;
  dueTrigger: string;
}

export interface PricingTierOption {
  id: string;
  name: string;
  summary: string;
  priceMultiplier: number;
  recommended?: boolean;
}

export interface BrandSettings {
  accentColor: string;
  logoDataUrl: string;
  customFooter: string;
}

export interface SowDocument {
  id: string;
  mode: DocumentMode;
  templateSlug: string;
  documentNumber: string;
  parentSowNumber: string;
  projectTitle: string;
  summary: string;
  issueDate: string;
  validUntil: string;
  targetStartDate: string;
  targetEndDate: string;
  currency: CurrencyCode;
  taxRate: number;
  providerName: string;
  providerContact: string;
  providerEmail: string;
  providerLocation: string;
  clientCompany: string;
  clientContact: string;
  clientEmail: string;
  deliverables: DeliverableItem[];
  exclusions: string[];
  milestones: MilestoneItem[];
  revisionRounds: number;
  changeOrderRate: number;
  acceptanceBusinessDays: number;
  killFeePercent: number;
  ipTransferOnFullPayment: boolean;
  lateFeeMonthlyPercent: number;
  governingState: string;
  includePricingOptions: boolean;
  pricingOptions: PricingTierOption[];
  timelineImpactDays: number;
  changeReason: string;
  brand: BrandSettings;
}

export interface SavedProject {
  id: string;
  savedAt: string;
  document: SowDocument;
}

export interface ScopeBlock {
  id: string;
  category: string;
  title: string;
  description: string;
  unitLabel: string;
  unitPrice: number;
}

export interface TemplateFaq {
  question: string;
  answer: string;
}

export type TemplateCategory =
  | "Engineering & Dev"
  | "Design & Creative"
  | "Marketing & Growth"
  | "Consulting & Advisory"
  | "Operations & Trades"
  | "Change Orders";

export interface SowTemplate {
  slug: string;
  title: string;
  shortName: string;
  category: TemplateCategory;
  isProTemplate: boolean;
  metaTitle: string;
  metaDescription: string;
  heroSummary: string;
  typicalBudgetRange: string;
  typicalTimeline: string;
  commonScopeTraps: [string, string, string];
  presetDocument: Omit<
    SowDocument,
    | "id"
    | "issueDate"
    | "validUntil"
    | "targetStartDate"
    | "targetEndDate"
    | "providerName"
    | "providerContact"
    | "providerEmail"
    | "providerLocation"
    | "clientCompany"
    | "clientContact"
    | "clientEmail"
    | "brand"
  >;
  faqs: [TemplateFaq, TemplateFaq, TemplateFaq];
}
