"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  FilePlus2,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Header } from "@/components/Header";
import { UpgradeModal } from "@/components/UpgradeModal";
import { SITE_URL } from "@/config/site";
import {
  buildDocumentFromTemplate,
  COMMON_EXCLUSIONS,
  getTemplateBySlug,
  SCOPE_BLOCKS,
  SOW_TEMPLATES,
} from "@/data/templates";
import { trackEvent } from "@/lib/analytics";
import {
  clearStoredLicense,
  getStoredLicense,
  saveStoredLicense,
  verifyLicenseKeyClient,
} from "@/lib/license";
import { exportSowToPdf } from "@/lib/pdfExport";
import {
  calculateDeliverableLineTotal,
  calculateMilestonePercentageSum,
  calculateMilestones,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  evaluateScopeProtection,
  formatCurrency,
  generateMarkdownExport,
  generateShareableSummary,
  roundMoney,
} from "@/lib/sowMath";
import { CurrencyCode, SavedProject, SowDocument } from "@/types/sow";

type EditorTab = "parties" | "scope" | "terms" | "history";
type MobilePane = "editor" | "preview";

const DRAFTS_STORAGE_KEY = "scopecraft_saved_drafts_v1";
const FREE_PRESET_SLUGS = [
  "web-development-sow",
  "shopify-store-build-sow",
  "ui-ux-design-sow",
  "seo-retainer-sow",
  "software-development-change-order",
];

const ACCENT_SWATCHES = ["#0F5C4A", "#1E3A5F", "#7C2D12", "#312E81", "#141413"];

interface SowStudioProps {
  initialTemplateSlug?: string;
}

export function SowStudio({ initialTemplateSlug }: SowStudioProps) {
  const initialTemplate =
    (initialTemplateSlug ? getTemplateBySlug(initialTemplateSlug) : undefined) ??
    SOW_TEMPLATES[0];

  const [doc, setDoc] = useState<SowDocument>(() =>
    buildDocumentFromTemplate(initialTemplate)
  );
  const [activeTab, setActiveTab] = useState<EditorTab>("scope");
  const [mobilePane, setMobilePane] = useState<MobilePane>("editor");
  const [isPro, setIsPro] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<SavedProject[]>([]);
  const [newExclusion, setNewExclusion] = useState("");
  const [copiedMd, setCopiedMd] = useState(false);
  const [sharedSummary, setSharedSummary] = useState(false);
  const [showPostExportUpgrade, setShowPostExportUpgrade] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Restore Pro license & saved drafts on mount + sync URL ?template=
  useEffect(() => {
    const stored = getStoredLicense();
    if (stored) {
      verifyLicenseKeyClient(stored).then((res) => {
        if (res.valid) {
          setIsPro(true);
          setActiveKey(res.normalizedKey);
        }
      });
    }

    try {
      const rawDrafts = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (rawDrafts) {
        const parsed = JSON.parse(rawDrafts) as SavedProject[];
        if (Array.isArray(parsed)) setSavedDrafts(parsed);
      }
    } catch {
      // Ignore parse errors
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tplSlug = params.get("template");
      if (tplSlug) {
        const tpl = getTemplateBySlug(tplSlug);
        if (tpl) {
          setDoc((prev) => buildDocumentFromTemplate(tpl, prev.brand));
          trackEvent("template_loaded", { slug: tpl.slug, source: "url" });
        }
      }
    }
  }, []);

  const subtotal = useMemo(() => calculateSubtotal(doc.deliverables), [doc.deliverables]);
  const tax = useMemo(() => calculateTax(subtotal, doc.taxRate), [subtotal, doc.taxRate]);
  const total = useMemo(() => calculateTotal(doc), [doc]);
  const calculatedMilestones = useMemo(
    () => calculateMilestones(doc.milestones, total),
    [doc.milestones, total]
  );
  const milestonePctSum = useMemo(
    () => calculateMilestonePercentageSum(doc.milestones),
    [doc.milestones]
  );
  const scopeReport = useMemo(() => evaluateScopeProtection(doc), [doc]);
  const firstFailedCheck = useMemo(
    () => scopeReport.checks.find((c) => !c.passed),
    [scopeReport]
  );

  const activeTemplateMeta = useMemo(
    () => getTemplateBySlug(doc.templateSlug),
    [doc.templateSlug]
  );

  const handleLoadTemplate = (slug: string) => {
    const tpl = getTemplateBySlug(slug);
    if (!tpl) return;
    setDoc((prev) => buildDocumentFromTemplate(tpl, prev.brand));
    trackEvent("template_loaded", { slug: tpl.slug, isProTemplate: tpl.isProTemplate });
    showToast(`Loaded ${tpl.shortName}`);
  };

  const handleToggleMode = (mode: "sow" | "change_order") => {
    setDoc((prev) => ({
      ...prev,
      mode,
      documentNumber:
        mode === "change_order"
          ? prev.documentNumber.startsWith("CO-")
            ? prev.documentNumber
            : `CO-${prev.documentNumber.replace(/^SOW-/, "")}`
          : prev.documentNumber.startsWith("SOW-")
          ? prev.documentNumber
          : `SOW-${prev.documentNumber.replace(/^CO-/, "")}`,
      parentSowNumber:
        mode === "change_order" && !prev.parentSowNumber
          ? prev.documentNumber.startsWith("SOW-")
            ? prev.documentNumber
            : "SOW-2026-104"
          : prev.parentSowNumber,
    }));
    trackEvent("change_order_toggled", { mode });
  };

  const handleDownloadPdf = () => {
    exportSowToPdf(doc, isPro);
    trackEvent("sow_pdf_exported", {
      mode: doc.mode,
      isPro,
      total,
      templateSlug: doc.templateSlug,
    });
    if (!isPro) {
      setShowPostExportUpgrade(true);
    }
    showToast(isPro ? "Clean white-label PDF exported." : "PDF exported — ready to send.");
  };

  const handleShareSummary = async () => {
    const summaryText = generateShareableSummary(doc, isPro);
    trackEvent("share_summary_clicked", { isPro, mode: doc.mode });

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: doc.projectTitle || "ScopeCraft Project Summary",
          text: summaryText,
        });
        showToast("Scope summary shared.");
        return;
      } catch {
        // Fallback to clipboard if user cancels native share sheet
      }
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      setSharedSummary(true);
      setTimeout(() => setSharedSummary(false), 2200);
      showToast("Client-ready scope summary copied.");
    } catch {
      showToast("Clipboard blocked by browser.");
    }
  };

  const handleExportJsonBackup = () => {
    const payload = JSON.stringify({ current: doc, drafts: savedDrafts }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scopecraft-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("json_backup_exported", { draftCount: savedDrafts.length });
    showToast("JSON backup downloaded.");
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          current?: SowDocument;
          drafts?: SavedProject[];
        };
        if (parsed.current && parsed.current.projectTitle) {
          setDoc(parsed.current);
        }
        if (Array.isArray(parsed.drafts)) {
          setSavedDrafts((prev) => {
            const seen = new Set(parsed.drafts!.map((d) => d.id));
            const merged = [...parsed.drafts!, ...prev.filter((d) => !seen.has(d.id))];
            const allowed = isPro ? merged : merged.slice(0, 2);
            window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(allowed));
            return allowed;
          });
        }
        showToast("Backup restored.");
      } catch {
        showToast("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownExport(doc, isPro);
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      trackEvent("sow_markdown_copied", { isPro });
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      showToast("Clipboard blocked by browser.");
    }
  };

  const handleSaveDraft = () => {
    if (!isPro && savedDrafts.length >= 2 && !savedDrafts.some((d) => d.id === doc.id)) {
      trackEvent("upgrade_modal_opened", { trigger: "draft_limit" });
      setUpgradeOpen(true);
      return;
    }

    const updated: SavedProject[] = [
      {
        id: doc.id,
        savedAt: new Date().toISOString(),
        document: doc,
      },
      ...savedDrafts.filter((d) => d.id !== doc.id),
    ];

    setSavedDrafts(updated);
    try {
      window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
      showToast("Draft saved to this browser.");
    } catch {
      showToast("Unable to save draft (storage full).");
    }
  };

  const handleDeleteDraft = (id: string) => {
    const updated = savedDrafts.filter((d) => d.id !== id);
    setSavedDrafts(updated);
    try {
      window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleConvertDraftToChangeOrder = (source: SowDocument) => {
    if (!isPro) {
      trackEvent("upgrade_modal_opened", { trigger: "convert_change_order" });
      setUpgradeOpen(true);
      return;
    }
    setDoc({
      ...source,
      id: `doc-${Date.now()}`,
      mode: "change_order",
      parentSowNumber: source.documentNumber,
      documentNumber: `CO-${source.documentNumber.replace(/^(SOW-|CO-)/, "")}`,
      projectTitle: `Change Order: ${source.projectTitle}`,
      timelineImpactDays: 5,
      changeReason: "Client-requested expansion beyond baseline SOW.",
    });
    setActiveTab("scope");
    showToast("Converted draft into a linked Change Order.");
  };

  const handleQuickFixGuardrail = (checkId: string) => {
    setDoc((prev) => {
      if (checkId === "exclusions") {
        const additions = COMMON_EXCLUSIONS.filter((e) => !prev.exclusions.includes(e)).slice(0, 2);
        return { ...prev, exclusions: [...prev.exclusions, ...additions] };
      }
      if (checkId === "deposit") {
        return {
          ...prev,
          milestones: [
            { id: "m1", label: "Kickoff Deposit", percentage: 50, dueTrigger: "Upon signing" },
            { id: "m2", label: "Midpoint Review", percentage: 25, dueTrigger: "Upon staging delivery" },
            { id: "m3", label: "Final Handoff", percentage: 25, dueTrigger: "Prior to final launch" },
          ],
        };
      }
      if (checkId === "revisions") return { ...prev, revisionRounds: 2 };
      if (checkId === "change_order_rate") return { ...prev, changeOrderRate: 150 };
      if (checkId === "acceptance_window") return { ...prev, acceptanceBusinessDays: 5 };
      if (checkId === "ip_transfer") return { ...prev, ipTransferOnFullPayment: true };
      return prev;
    });
    trackEvent("scope_autofix_used", { checkId });
    showToast(
      isPro
        ? "Applied Scope Guardrail."
        : "Scope tightened. Ready to white-label your studio PDF?"
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 400_000) {
      showToast("Logo file must be under 400 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDoc((prev) => ({
          ...prev,
          brand: { ...prev.brand, logoDataUrl: reader.result as string },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const accentHex = isPro && doc.brand.accentColor ? doc.brand.accentColor : "#0F5C4A";
  const displayDomain = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <>
      <Header
        isPro={isPro}
        onOpenUpgrade={() => {
          trackEvent("upgrade_modal_opened", { trigger: "header" });
          setUpgradeOpen(true);
        }}
      />

      <main className="flex-1">
        {/* Compact Editorial Hero + Interactive Workbench */}
        <section id="studio" className="border-b border-hairline bg-canvas">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-7 pb-10">
            {/* Editorial Headline & Mode Strip */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-hairline">
              <div className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase tracking-widest text-forest font-medium">
                  No-Signup SOW &amp; Change Order Studio
                </p>
                <h1 className="font-serif text-3xl sm:text-5xl text-ink tracking-tight leading-[1.08] mt-2">
                  Watertight Statements of Work, ready in 60 seconds.
                </h1>
                <p className="text-sm sm:text-base text-ink-secondary mt-2.5 leading-relaxed">
                  Lock down deliverables, explicit out-of-scope exclusions, milestone deposits, and Change Order rates in a single US Letter PDF.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div
                  className="inline-flex rounded-md border border-hairline bg-subtle p-1"
                  role="group"
                  aria-label="Document mode"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleMode("sow")}
                    className={`min-h-[44px] px-3.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                      doc.mode === "sow"
                        ? "bg-paper text-ink shadow-sm"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    Statement of Work
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMode("change_order")}
                    className={`min-h-[44px] px-3.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                      doc.mode === "change_order"
                        ? "bg-paper text-ink shadow-sm"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    Change Order
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Preset Selector Bar */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted mr-1">
                  Quick Presets:
                </span>
                {FREE_PRESET_SLUGS.map((slug) => {
                  const tpl = getTemplateBySlug(slug);
                  if (!tpl) return null;
                  const active = doc.templateSlug === tpl.slug;
                  return (
                    <button
                      key={tpl.slug}
                      type="button"
                      onClick={() => handleLoadTemplate(tpl.slug)}
                      className={`min-h-[44px] sm:min-h-[36px] px-3 rounded-md border text-xs font-medium transition-colors ${
                        active
                          ? "border-forest bg-forest-tint text-forest"
                          : "border-hairline bg-paper text-ink-secondary hover:text-ink hover:border-ink-muted"
                      }`}
                    >
                      {tpl.shortName}
                    </button>
                  );
                })}
              </div>

              <Link
                href="/templates"
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[36px] px-3 text-xs font-medium text-forest hover:text-forest-hover"
              >
                <span>Browse all 30 industry templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeTemplateMeta?.isProTemplate && !isPro && (
              <div className="mb-4 px-4 py-3 rounded-md bg-forest-tint/70 border border-forest/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-ink-secondary">
                  Previewing Pro template <strong className="text-ink">{activeTemplateMeta.shortName}</strong>. Edit freely below—Pro removes the ScopeCraft footer and unlocks custom branding.
                </p>
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="text-xs font-semibold text-forest hover:underline shrink-0 text-left sm:text-right"
                >
                  Unlock Pro ($12/mo)
                </button>
              </div>
            )}

            {/* Mobile Pane Switcher (< lg) */}
            <div className="lg:hidden sticky top-16 z-30 bg-canvas py-2.5 border-b border-hairline mb-4 flex items-center gap-2">
              <div className="grid grid-cols-2 flex-1 rounded-md border border-hairline bg-subtle p-1">
                <button
                  type="button"
                  onClick={() => setMobilePane("editor")}
                  className={`min-h-[44px] rounded text-xs font-semibold transition-colors ${
                    mobilePane === "editor" ? "bg-paper text-ink shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  Edit Scope
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePane("preview")}
                  className={`min-h-[44px] rounded text-xs font-semibold transition-colors ${
                    mobilePane === "preview" ? "bg-paper text-ink shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  Live Document
                </button>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="min-h-[44px] px-3.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>

            {/* Split Workbench Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Guided Editor */}
              <div
                className={`lg:col-span-6 space-y-4 ${
                  mobilePane === "editor" ? "block" : "hidden lg:block"
                }`}
              >
                {/* Scope-Protection Score Card */}
                <div className="bg-paper border border-hairline rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck
                        className={`w-5 h-5 shrink-0 ${
                          scopeReport.score >= 85
                            ? "text-forest"
                            : scopeReport.score >= 65
                            ? "text-amber-700"
                            : "text-red-700"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-ink">
                          Scope-Protection Score:{" "}
                          <span className="font-mono tabular-nums">
                            {scopeReport.score}/100
                          </span>{" "}
                          <span className="text-ink-muted font-normal">
                            ({scopeReport.grade})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {firstFailedCheck && (
                        <button
                          type="button"
                          onClick={() => handleQuickFixGuardrail(firstFailedCheck.id)}
                          className="min-h-[36px] px-2.5 rounded border border-forest/30 bg-forest-tint text-forest text-xs font-medium hover:bg-forest hover:text-white transition-colors"
                        >
                          Auto-fix
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowScoreDetails((v) => !v)}
                        aria-expanded={showScoreDetails}
                        className="min-h-[36px] px-2 rounded border border-hairline bg-canvas text-[11px] font-medium text-ink-secondary hover:text-ink inline-flex items-center gap-1"
                      >
                        <span>
                          {scopeReport.checks.filter((c) => c.passed).length}/{scopeReport.checks.length}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            showScoreDetails ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full bg-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${scopeReport.score}%`,
                        backgroundColor:
                          scopeReport.score >= 85
                            ? "#0F5C4A"
                            : scopeReport.score >= 65
                            ? "#B45309"
                            : "#B42318",
                      }}
                    />
                  </div>
                  {firstFailedCheck && (
                    <p className="mt-2 text-xs text-ink-secondary flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{firstFailedCheck.fixHint}</span>
                    </p>
                  )}
                  {showScoreDetails && (
                    <div className="mt-3 pt-3 border-t border-hairline space-y-1.5">
                      {scopeReport.checks.map((chk) => (
                        <div
                          key={chk.id}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span
                            className={
                              chk.passed ? "text-ink-secondary" : "text-amber-800 font-medium"
                            }
                          >
                            {chk.passed ? "✓" : "•"} {chk.label}
                          </span>
                          <span className="font-mono text-ink-muted tabular-nums shrink-0">
                            {chk.points}/{chk.maxPoints}
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 text-[10px] text-ink-muted">
                        Measures commercial scope completeness, not formal legal counsel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Editor Panel */}
                <div className="bg-paper border border-hairline rounded-lg overflow-hidden">
                  {/* Editor Tabs */}
                  <div className="grid grid-cols-4 border-b border-hairline bg-subtle/60">
                    {(
                      [
                        { id: "parties", label: "Parties" },
                        { id: "scope", label: "Scope" },
                        { id: "terms", label: "Terms" },
                        { id: "history", label: "Saved" },
                      ] as { id: EditorTab; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`min-h-[44px] px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-forest text-ink bg-paper"
                            : "border-transparent text-ink-secondary hover:text-ink"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 sm:p-5 space-y-5">
                    {activeTab === "parties" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Document #
                            </label>
                            <input
                              type="text"
                              value={doc.documentNumber}
                              onChange={(e) =>
                                setDoc({ ...doc, documentNumber: e.target.value })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink focus:outline-none focus:border-forest"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Currency
                            </label>
                            <select
                              value={doc.currency}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  currency: e.target.value as CurrencyCode,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="CAD">CAD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Tax Rate (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={50}
                              step={0.5}
                              value={doc.taxRate}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  taxRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums focus:outline-none focus:border-forest"
                            />
                          </div>
                        </div>

                        {doc.mode === "change_order" && (
                          <div className="p-3.5 rounded-md bg-subtle border border-hairline space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-ink-secondary mb-1">
                                  Parent SOW Reference #
                                </label>
                                <input
                                  type="text"
                                  value={doc.parentSowNumber}
                                  onChange={(e) =>
                                    setDoc({ ...doc, parentSowNumber: e.target.value })
                                  }
                                  className="w-full min-h-[44px] px-3 rounded border border-hairline bg-paper font-mono text-sm text-ink focus:outline-none focus:border-forest"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-ink-secondary mb-1">
                                  Timeline Extension (Business Days)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={doc.timelineImpactDays}
                                  onChange={(e) =>
                                    setDoc({
                                      ...doc,
                                      timelineImpactDays: parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                  className="w-full min-h-[44px] px-3 rounded border border-hairline bg-paper font-mono text-sm text-ink tabular-nums focus:outline-none focus:border-forest"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-ink-secondary mb-1">
                                Change Justification
                              </label>
                              <input
                                type="text"
                                value={doc.changeReason}
                                onChange={(e) =>
                                  setDoc({ ...doc, changeReason: e.target.value })
                                }
                                className="w-full min-h-[44px] px-3 rounded border border-hairline bg-paper text-sm text-ink focus:outline-none focus:border-forest"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-hairline">
                          <span className="text-[11px] text-ink-muted">
                            Pre-filled with sample studio &amp; client placeholders.
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDoc((prev) => ({
                                ...prev,
                                providerName: "",
                                providerContact: "",
                                providerEmail: "",
                                clientCompany: "",
                                clientContact: "",
                                clientEmail: "",
                              }))
                            }
                            className="text-xs font-medium text-forest hover:underline shrink-0"
                          >
                            Clear sample parties
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2.5">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                              Your Studio / Firm
                            </p>
                            <input
                              type="text"
                              value={doc.providerName}
                              onChange={(e) =>
                                setDoc({ ...doc, providerName: e.target.value })
                              }
                              placeholder="Studio or LLC Name"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                            <input
                              type="text"
                              value={doc.providerContact}
                              onChange={(e) =>
                                setDoc({ ...doc, providerContact: e.target.value })
                              }
                              placeholder="Signer Name & Title"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                            <input
                              type="email"
                              value={doc.providerEmail}
                              onChange={(e) =>
                                setDoc({ ...doc, providerEmail: e.target.value })
                              }
                              placeholder="Billing Email"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                          </div>

                          <div className="space-y-2.5">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                              Client Details
                            </p>
                            <input
                              type="text"
                              value={doc.clientCompany}
                              onChange={(e) =>
                                setDoc({ ...doc, clientCompany: e.target.value })
                              }
                              placeholder="Client Company Name"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                            <input
                              type="text"
                              value={doc.clientContact}
                              onChange={(e) =>
                                setDoc({ ...doc, clientContact: e.target.value })
                              }
                              placeholder="Client Signer & Title"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                            <input
                              type="email"
                              value={doc.clientEmail}
                              onChange={(e) =>
                                setDoc({ ...doc, clientEmail: e.target.value })
                              }
                              placeholder="Client Email"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink focus:outline-none focus:border-forest"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-hairline">
                          <div>
                            <label className="block text-[11px] text-ink-muted mb-1">
                              Issue Date
                            </label>
                            <input
                              type="date"
                              value={doc.issueDate}
                              onChange={(e) =>
                                setDoc({ ...doc, issueDate: e.target.value })
                              }
                              className="w-full min-h-[44px] px-2 rounded border border-hairline bg-canvas font-mono text-xs text-ink"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-ink-muted mb-1">
                              Valid Until
                            </label>
                            <input
                              type="date"
                              value={doc.validUntil}
                              onChange={(e) =>
                                setDoc({ ...doc, validUntil: e.target.value })
                              }
                              className="w-full min-h-[44px] px-2 rounded border border-hairline bg-canvas font-mono text-xs text-ink"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-ink-muted mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={doc.targetStartDate}
                              onChange={(e) =>
                                setDoc({ ...doc, targetStartDate: e.target.value })
                              }
                              className="w-full min-h-[44px] px-2 rounded border border-hairline bg-canvas font-mono text-xs text-ink"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-ink-muted mb-1">
                              Target Launch
                            </label>
                            <input
                              type="date"
                              value={doc.targetEndDate}
                              onChange={(e) =>
                                setDoc({ ...doc, targetEndDate: e.target.value })
                              }
                              className="w-full min-h-[44px] px-2 rounded border border-hairline bg-canvas font-mono text-xs text-ink"
                            />
                          </div>
                        </div>

                        {/* White-Label Studio Branding (Pro) */}
                        <div className="p-4 rounded-md border border-hairline bg-subtle/60 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {!isPro && <Lock className="w-3.5 h-3.5 text-ink-muted" />}
                              <p className="text-xs font-semibold text-ink">
                                White-Label Studio Branding
                              </p>
                            </div>
                            {!isPro && (
                              <button
                                type="button"
                                onClick={() => setUpgradeOpen(true)}
                                className="text-xs font-medium text-forest hover:underline"
                              >
                                Unlock Pro
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs text-ink-secondary">Accent:</span>
                            {ACCENT_SWATCHES.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                aria-label={`Select brand color ${hex}`}
                                onClick={() => {
                                  if (!isPro) {
                                    setUpgradeOpen(true);
                                    return;
                                  }
                                  setDoc((prev) => ({
                                    ...prev,
                                    brand: { ...prev.brand, accentColor: hex },
                                  }));
                                }}
                                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                  doc.brand.accentColor === hex
                                    ? "border-ink scale-110"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}

                            <label className="ml-auto min-h-[40px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-ink-secondary hover:text-ink inline-flex items-center gap-1.5 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{doc.brand.logoDataUrl ? "Change Logo" : "Upload Logo"}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleLogoUpload}
                                className="sr-only"
                              />
                            </label>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={doc.brand.customFooter}
                              onFocus={() => {
                                if (!isPro) setUpgradeOpen(true);
                              }}
                              onChange={(e) => {
                                if (!isPro) return;
                                setDoc((prev) => ({
                                  ...prev,
                                  brand: { ...prev.brand, customFooter: e.target.value },
                                }));
                              }}
                              placeholder="Custom confidential PDF footer (Pro)"
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-paper text-xs text-ink focus:outline-none focus:border-forest"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "scope" && (
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor="project-title-input"
                              className="block text-xs font-medium text-ink-secondary mb-1"
                            >
                              Project Title
                            </label>
                            <input
                              id="project-title-input"
                              type="text"
                              value={doc.projectTitle}
                              onChange={(e) =>
                                setDoc({ ...doc, projectTitle: e.target.value })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm font-medium text-ink focus:outline-none focus:border-forest"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="project-summary-input"
                              className="block text-xs font-medium text-ink-secondary mb-1"
                            >
                              Executive Summary
                            </label>
                            <textarea
                              id="project-summary-input"
                              rows={2}
                              value={doc.summary}
                              onChange={(e) =>
                                setDoc({ ...doc, summary: e.target.value })
                              }
                              className="w-full p-3 rounded border border-hairline bg-canvas text-sm text-ink leading-relaxed focus:outline-none focus:border-forest"
                            />
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-3 pt-2 border-t border-hairline">
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                              Included Deliverables ({doc.deliverables.length})
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setDoc((prev) => ({
                                  ...prev,
                                  deliverables: [
                                    ...prev.deliverables,
                                    {
                                      id: `d-${Date.now()}`,
                                      title: "New Deliverable",
                                      description: "Specific acceptance criteria and output format.",
                                      quantity: 1,
                                      unitLabel: "phase",
                                      unitPrice: 1000,
                                    },
                                  ],
                                }))
                              }
                              className="min-h-[36px] px-2.5 rounded border border-hairline bg-paper text-xs font-medium text-ink hover:border-ink inline-flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Line</span>
                            </button>
                          </div>

                          <div className="space-y-3">
                            {doc.deliverables.map((item, idx) => (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-md border border-hairline bg-canvas space-y-2.5"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    aria-label={`Deliverable ${idx + 1} title`}
                                    value={item.title}
                                    onChange={(e) => {
                                      const next = [...doc.deliverables];
                                      next[idx] = { ...item, title: e.target.value };
                                      setDoc({ ...doc, deliverables: next });
                                    }}
                                    className="flex-1 min-h-[40px] px-2.5 rounded border border-hairline bg-paper text-sm font-medium text-ink focus:outline-none focus:border-forest"
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Remove deliverable ${idx + 1}`}
                                    disabled={doc.deliverables.length <= 1}
                                    onClick={() =>
                                      setDoc({
                                        ...doc,
                                        deliverables: doc.deliverables.filter(
                                          (d) => d.id !== item.id
                                        ),
                                      })
                                    }
                                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded text-ink-muted hover:text-red-700 disabled:opacity-30"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <textarea
                                  rows={2}
                                  aria-label={`Deliverable ${idx + 1} description`}
                                  value={item.description}
                                  onChange={(e) => {
                                    const next = [...doc.deliverables];
                                    next[idx] = { ...item, description: e.target.value };
                                    setDoc({ ...doc, deliverables: next });
                                  }}
                                  className="w-full p-2.5 rounded border border-hairline bg-paper text-xs text-ink-secondary focus:outline-none focus:border-forest"
                                />

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[11px] text-ink-muted mb-0.5">
                                      Qty
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      step={1}
                                      aria-label={`Deliverable ${idx + 1} quantity`}
                                      value={item.quantity}
                                      onChange={(e) => {
                                        const next = [...doc.deliverables];
                                        next[idx] = {
                                          ...item,
                                          quantity: Math.max(0, parseFloat(e.target.value) || 0),
                                        };
                                        setDoc({ ...doc, deliverables: next });
                                      }}
                                      className="w-full min-h-[40px] px-2.5 rounded border border-hairline bg-paper font-mono text-xs text-ink tabular-nums"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] text-ink-muted mb-0.5">
                                      Unit
                                    </label>
                                    <input
                                      type="text"
                                      value={item.unitLabel}
                                      onChange={(e) => {
                                        const next = [...doc.deliverables];
                                        next[idx] = { ...item, unitLabel: e.target.value };
                                        setDoc({ ...doc, deliverables: next });
                                      }}
                                      className="w-full min-h-[40px] px-2.5 rounded border border-hairline bg-paper text-xs text-ink"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] text-ink-muted mb-0.5">
                                      Unit Rate ({doc.currency})
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      step={50}
                                      aria-label={`Deliverable ${idx + 1} rate`}
                                      value={item.unitPrice}
                                      onChange={(e) => {
                                        const next = [...doc.deliverables];
                                        next[idx] = {
                                          ...item,
                                          unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                                        };
                                        setDoc({ ...doc, deliverables: next });
                                      }}
                                      className="w-full min-h-[40px] px-2.5 rounded border border-hairline bg-paper font-mono text-xs text-ink tabular-nums"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quick Scope Blocks */}
                          <div className="pt-2">
                            <p className="text-[11px] font-medium text-ink-muted mb-2">
                              Quick-insert standard blocks:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {SCOPE_BLOCKS.map((blk) => (
                                <button
                                  key={blk.id}
                                  type="button"
                                  onClick={() =>
                                    setDoc((prev) => ({
                                      ...prev,
                                      deliverables: [
                                        ...prev.deliverables,
                                        {
                                          id: `${blk.id}-${Date.now()}`,
                                          title: blk.title,
                                          description: blk.description,
                                          quantity: 1,
                                          unitLabel: blk.unitLabel,
                                          unitPrice: blk.unitPrice,
                                        },
                                      ],
                                    }))
                                  }
                                  className="min-h-[34px] px-2.5 rounded border border-hairline bg-paper text-xs text-ink-secondary hover:text-ink hover:border-forest transition-colors"
                                >
                                  + {blk.category}: {blk.title.split(" ")[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Out-of-Scope Exclusions */}
                        <div className="space-y-3 pt-3 border-t border-hairline">
                          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                            Explicit Out-of-Scope Exclusions ({doc.exclusions.length})
                          </p>
                          <div className="space-y-2">
                            {doc.exclusions.map((ex, idx) => (
                              <div
                                key={`${idx}-${ex.slice(0, 12)}`}
                                className="flex items-start justify-between gap-2 p-2.5 rounded border border-hairline bg-canvas text-xs text-ink-secondary"
                              >
                                <span className="leading-relaxed">{ex}</span>
                                <button
                                  type="button"
                                  aria-label={`Remove exclusion ${idx + 1}`}
                                  onClick={() =>
                                    setDoc({
                                      ...doc,
                                      exclusions: doc.exclusions.filter((_, i) => i !== idx),
                                    })
                                  }
                                  className="min-w-[32px] min-h-[32px] flex items-center justify-center text-ink-muted hover:text-red-700 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newExclusion}
                              onChange={(e) => setNewExclusion(e.target.value)}
                              placeholder="Add custom out-of-scope exclusion..."
                              className="flex-1 min-h-[44px] px-3 rounded border border-hairline bg-canvas text-xs text-ink focus:outline-none focus:border-forest"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newExclusion.trim()) return;
                                setDoc((prev) => ({
                                  ...prev,
                                  exclusions: [...prev.exclusions, newExclusion.trim()],
                                }));
                                setNewExclusion("");
                              }}
                              className="min-h-[44px] px-4 rounded border border-hairline bg-paper text-xs font-medium text-ink hover:border-forest"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "terms" && (
                      <div className="space-y-5">
                        {/* Payment Milestones */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                              Milestone Payment Split ({milestonePctSum}%)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: "50/25/25", vals: [50, 25, 25] },
                                { label: "40/30/30", vals: [40, 30, 30] },
                                { label: "50/50", vals: [50, 50] },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    const labels =
                                      preset.vals.length === 2
                                        ? ["Kickoff Deposit", "Final Handoff"]
                                        : ["Kickoff Deposit", "Midpoint Review", "Final Handoff"];
                                    const triggers =
                                      preset.vals.length === 2
                                        ? ["Upon signing", "Upon final delivery"]
                                        : ["Upon signing", "Upon staging delivery", "Prior to production launch"];
                                    setDoc({
                                      ...doc,
                                      milestones: preset.vals.map((pct, i) => ({
                                        id: `mp-${i}`,
                                        label: labels[i],
                                        percentage: pct,
                                        dueTrigger: triggers[i],
                                      })),
                                    });
                                  }}
                                  className="min-h-[32px] px-2.5 rounded border border-hairline bg-canvas text-[11px] font-mono text-ink-secondary hover:text-ink"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {doc.milestones.map((m, idx) => (
                              <div
                                key={m.id}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded border border-hairline bg-canvas"
                              >
                                <input
                                  type="text"
                                  value={m.label}
                                  onChange={(e) => {
                                    const next = [...doc.milestones];
                                    next[idx] = { ...m, label: e.target.value };
                                    setDoc({ ...doc, milestones: next });
                                  }}
                                  className="sm:col-span-5 min-h-[40px] px-2.5 rounded border border-hairline bg-paper text-xs font-medium text-ink"
                                />
                                <input
                                  type="text"
                                  value={m.dueTrigger}
                                  onChange={(e) => {
                                    const next = [...doc.milestones];
                                    next[idx] = { ...m, dueTrigger: e.target.value };
                                    setDoc({ ...doc, milestones: next });
                                  }}
                                  className="sm:col-span-5 min-h-[40px] px-2.5 rounded border border-hairline bg-paper text-xs text-ink-secondary"
                                />
                                <div className="sm:col-span-2 flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={m.percentage}
                                    onChange={(e) => {
                                      const next = [...doc.milestones];
                                      next[idx] = {
                                        ...m,
                                        percentage: Math.max(0, parseFloat(e.target.value) || 0),
                                      };
                                      setDoc({ ...doc, milestones: next });
                                    }}
                                    className="w-full min-h-[40px] px-2 rounded border border-hairline bg-paper font-mono text-xs text-ink tabular-nums"
                                  />
                                  <span className="text-xs text-ink-muted">%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Guardrail Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-hairline">
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Included Revision Rounds
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={doc.revisionRounds}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  revisionRounds: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Out-of-Scope Rate ({doc.currency}/hr)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={10}
                              value={doc.changeOrderRate}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  changeOrderRate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Client Review Window (Business Days)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={doc.acceptanceBusinessDays}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  acceptanceBusinessDays: parseInt(e.target.value, 10) || 5,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Cancellation / Kill Fee (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={doc.killFeePercent}
                              onChange={(e) =>
                                setDoc({
                                  ...doc,
                                  killFeePercent: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas font-mono text-sm text-ink tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-secondary mb-1">
                              Governing Law (US State)
                            </label>
                            <input
                              type="text"
                              value={doc.governingState}
                              onChange={(e) =>
                                setDoc({ ...doc, governingState: e.target.value })
                              }
                              className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas text-sm text-ink"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="w-full min-h-[44px] px-3 rounded border border-hairline bg-canvas flex items-center gap-2.5 cursor-pointer text-xs font-medium text-ink">
                              <input
                                type="checkbox"
                                checked={doc.ipTransferOnFullPayment}
                                onChange={(e) =>
                                  setDoc({
                                    ...doc,
                                    ipTransferOnFullPayment: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 accent-forest"
                              />
                              <span>IP transfers only upon 100% payment</span>
                            </label>
                          </div>
                        </div>

                        {/* Pro 3-Option Value Pricing Table */}
                        <div className="p-4 rounded-md border border-hairline bg-subtle/60 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {!isPro && <Lock className="w-3.5 h-3.5 text-ink-muted" />}
                              <p className="text-xs font-semibold text-ink">
                                Include 3-Option Value Packages Table
                              </p>
                            </div>
                            <p className="text-xs text-ink-secondary mt-0.5">
                              Present Core, Accelerated + QA, and Partner options side-by-side to anchor deal size.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isPro) {
                                setUpgradeOpen(true);
                                return;
                              }
                              setDoc((prev) => ({
                                ...prev,
                                includePricingOptions: !prev.includePricingOptions,
                              }));
                            }}
                            className={`min-h-[40px] px-3.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                              isPro && doc.includePricingOptions
                                ? "bg-forest text-white"
                                : "border border-hairline bg-paper text-ink"
                            }`}
                          >
                            {isPro && doc.includePricingOptions ? "Enabled" : "Enable (Pro)"}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-ink">
                              Browser Project History
                            </p>
                            <p className="text-xs text-ink-secondary">
                              {isPro
                                ? "Unlimited local drafts & 1-click Change Order branching active."
                                : `Free tier stores up to 2 drafts (${savedDrafts.length}/2 used).`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="min-h-[44px] px-3.5 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium inline-flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Current</span>
                          </button>
                        </div>

                        {savedDrafts.length === 0 ? (
                          <div className="p-6 rounded-md border border-dashed border-hairline text-center text-xs text-ink-muted">
                            No saved drafts yet. Click &ldquo;Save Current&rdquo; to store this SOW locally in your browser.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {savedDrafts.map((saved) => (
                              <div
                                key={saved.id}
                                className="p-3.5 rounded-md border border-hairline bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-ink truncate">
                                    {saved.document.projectTitle}
                                  </p>
                                  <p className="font-mono text-[11px] text-ink-muted mt-0.5">
                                    {saved.document.documentNumber} • {saved.document.clientCompany}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDoc(saved.document);
                                      showToast("Draft loaded.");
                                    }}
                                    className="min-h-[36px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-ink hover:border-forest"
                                  >
                                    Load
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleConvertDraftToChangeOrder(saved.document)}
                                    className="min-h-[36px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-forest hover:border-forest inline-flex items-center gap-1"
                                  >
                                    <FilePlus2 className="w-3.5 h-3.5" />
                                    <span>Change Order</span>
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Delete draft"
                                    onClick={() => handleDeleteDraft(saved.id)}
                                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-ink-muted hover:text-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11px] text-ink-muted">
                            Drafts live in your browser only — export JSON anytime for backup.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleExportJsonBackup}
                              className="min-h-[36px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-ink hover:border-forest"
                            >
                              Export JSON
                            </button>
                            <label className="min-h-[36px] px-3 rounded border border-hairline bg-paper text-xs font-medium text-ink hover:border-forest inline-flex items-center cursor-pointer">
                              <span>Restore JSON</span>
                              <input
                                type="file"
                                accept="application/json"
                                onChange={handleImportJsonBackup}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Sticky Live Paper Preview + Toolbar */}
              <div
                className={`lg:col-span-6 lg:sticky lg:top-20 space-y-3 ${
                  mobilePane === "preview" ? "block" : "hidden lg:block"
                }`}
              >
                {/* Action Toolbar */}
                <div className="bg-paper border border-hairline rounded-lg p-2 flex items-center justify-between gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="hidden lg:inline-flex min-h-[44px] px-4 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-medium items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareSummary}
                      className="min-h-[44px] px-2.5 sm:px-3 rounded-md border border-hairline bg-canvas hover:border-forest text-xs font-medium text-ink inline-flex items-center gap-1.5"
                    >
                      {sharedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-forest" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Summary</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="min-h-[44px] px-2.5 sm:px-3 rounded-md border border-hairline bg-canvas hover:border-ink-muted text-xs font-medium text-ink inline-flex items-center gap-1.5"
                    >
                      {copiedMd ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-forest" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Markdown</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="hidden sm:inline-flex min-h-[44px] px-2.5 sm:px-3 rounded-md border border-hairline bg-canvas hover:border-ink-muted text-xs font-medium text-ink items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const tpl = getTemplateBySlug(doc.templateSlug) ?? SOW_TEMPLATES[0];
                      setDoc((prev) => buildDocumentFromTemplate(tpl, prev.brand));
                      showToast("Reset to template baseline.");
                    }}
                    title="Reset to template defaults"
                    className="min-h-[44px] px-2.5 sm:px-3 rounded-md text-xs font-medium text-ink-muted hover:text-ink inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {showPostExportUpgrade && !isPro && (
                  <div
                    data-testid="post-export-upgrade"
                    className="rounded-lg border border-forest/30 bg-forest-tint p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-forest font-semibold">
                          PDF Exported — Ready to Send
                        </p>
                        <p className="text-sm font-semibold text-ink mt-0.5">
                          Make every client SOW look like your own studio.
                        </p>
                        <p className="text-xs text-ink-secondary mt-1">
                          Remove the ScopeCraft footer, add your logo and brand color, and unlock all 30 templates ($12/mo).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPostExportUpgrade(false)}
                        className="text-xs text-ink-muted hover:text-ink px-1.5 py-0.5"
                        aria-label="Dismiss upgrade banner"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setUpgradeOpen(true)}
                        className="min-h-[40px] px-4 rounded-md bg-forest hover:bg-forest-hover text-white text-xs font-medium"
                      >
                        Unlock Studio Pro — $12/mo
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpgradeOpen(true)}
                        className="min-h-[40px] px-3 rounded-md border border-hairline bg-paper text-xs font-medium text-ink hover:border-forest"
                      >
                        Already have a license key?
                      </button>
                    </div>
                  </div>
                )}

                {toast && (
                  <div
                    role="status"
                    className="px-3.5 py-2 rounded-md bg-ink text-white text-xs font-medium flex items-center justify-between"
                  >
                    <span>{toast}</span>
                  </div>
                )}

                {doc.providerName === "Northstar Digital Studio LLC" && (
                  <div className="px-3.5 py-2 rounded-md border border-hairline bg-subtle text-[11px] text-ink-secondary flex items-center justify-between gap-2">
                    <span>
                      <strong className="text-ink font-mono">SAMPLE DATA:</strong> Replace Northstar / Acme details in the Parties tab before sending.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("parties");
                        setMobilePane("editor");
                      }}
                      className="text-forest font-medium hover:underline shrink-0"
                    >
                      Edit parties
                    </button>
                  </div>
                )}

                {/* Live US Letter Document Sheet */}
                <article
                  aria-label="Live Statement of Work preview"
                  className="bg-paper border border-hairline rounded-md paper-sheet overflow-hidden"
                >
                  <div className="h-1.5 w-full" style={{ backgroundColor: accentHex }} />

                  <div className="p-6 sm:p-8 space-y-6 text-[13px] leading-relaxed text-ink">
                    {/* Doc Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-hairline">
                      <div className="flex items-start gap-3">
                        {isPro && doc.brand.logoDataUrl && (
                          <img
                            src={doc.brand.logoDataUrl}
                            alt="Studio logo"
                            className="w-10 h-10 object-contain rounded border border-hairline shrink-0"
                          />
                        )}
                        <div>
                          <p
                            className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                            style={{ color: accentHex }}
                          >
                            {doc.mode === "change_order"
                              ? "Change Order Addendum"
                              : "Statement of Work"}
                          </p>
                          <h2 className="font-serif text-2xl sm:text-[26px] text-ink leading-tight mt-1">
                            {doc.projectTitle || "Untitled Statement of Work"}
                          </h2>
                        </div>
                      </div>

                      <div className="sm:text-right font-mono text-[11px] text-ink-muted shrink-0 tabular-nums space-y-0.5">
                        <p className="text-ink font-medium">{doc.documentNumber}</p>
                        {doc.mode === "change_order" && doc.parentSowNumber && (
                          <p>Parent: {doc.parentSowNumber}</p>
                        )}
                        <p>Issued: {doc.issueDate}</p>
                        <p>Valid until: {doc.validUntil}</p>
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Prepared By
                        </p>
                        <p className="font-semibold text-ink mt-1">{doc.providerName}</p>
                        <p className="text-xs text-ink-secondary">
                          {[doc.providerContact, doc.providerEmail].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          Prepared For
                        </p>
                        <p className="font-semibold text-ink mt-1">{doc.clientCompany}</p>
                        <p className="text-xs text-ink-secondary">
                          {[doc.clientContact, doc.clientEmail].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                        1. Project Overview
                      </p>
                      <p className="text-xs sm:text-[13px] text-ink-secondary leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    {doc.mode === "change_order" && (
                      <div className="p-3 rounded bg-subtle border border-hairline text-xs space-y-1">
                        <p className="font-mono text-[11px] font-semibold" style={{ color: accentHex }}>
                          CHANGE IMPACT: +{doc.timelineImpactDays} BUSINESS DAYS • NET ADDITION{" "}
                          {formatCurrency(total, doc.currency)}
                        </p>
                        <p className="text-ink-secondary">{doc.changeReason}</p>
                      </div>
                    )}

                    {/* Deliverables Table */}
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                        2. Deliverables &amp; Investment
                      </p>
                      <div className="border border-hairline rounded overflow-hidden">
                        <div className="grid grid-cols-12 bg-subtle px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          <span className="col-span-7">Deliverable</span>
                          <span className="col-span-2 text-right">Qty</span>
                          <span className="col-span-3 text-right">Amount</span>
                        </div>
                        <div className="divide-y divide-hairline">
                          {doc.deliverables.map((item) => {
                            const lineTotal = calculateDeliverableLineTotal(item);
                            return (
                              <div
                                key={item.id}
                                className="grid grid-cols-12 px-3 py-2.5 gap-2 items-start"
                              >
                                <div className="col-span-7">
                                  <p className="font-medium text-ink text-xs">{item.title}</p>
                                  <p className="text-[11px] text-ink-secondary mt-0.5 leading-snug">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="col-span-2 text-right font-mono text-[11px] text-ink-secondary tabular-nums">
                                  {item.quantity} {item.unitLabel}
                                </div>
                                <div className="col-span-3 text-right font-mono text-xs font-medium text-ink tabular-nums">
                                  {formatCurrency(lineTotal, doc.currency)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="mt-3 flex flex-col items-end space-y-1 text-xs tabular-nums">
                        <div className="flex items-center justify-between w-48 text-ink-secondary">
                          <span>Subtotal</span>
                          <span className="font-mono">{formatCurrency(subtotal, doc.currency)}</span>
                        </div>
                        {doc.taxRate > 0 && (
                          <div className="flex items-center justify-between w-48 text-ink-secondary">
                            <span>Tax ({doc.taxRate}%)</span>
                            <span className="font-mono">{formatCurrency(tax, doc.currency)}</span>
                          </div>
                        )}
                        <div
                          className="flex items-center justify-between w-48 pt-1.5 border-t border-hairline font-semibold text-sm"
                          style={{ color: accentHex }}
                        >
                          <span>Total</span>
                          <span className="font-mono" data-testid="preview-total">
                            {formatCurrency(total, doc.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Optional Pro 3-Option Packages */}
                    {isPro && doc.includePricingOptions && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                          Engagement Package Options
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {doc.pricingOptions.map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded border text-xs ${
                                opt.recommended
                                  ? "border-forest bg-forest-tint/40"
                                  : "border-hairline bg-canvas"
                              }`}
                            >
                              <p className="font-semibold text-ink">{opt.name}</p>
                              <p className="font-mono text-sm font-semibold mt-1 tabular-nums" style={{ color: accentHex }}>
                                {formatCurrency(roundMoney(total * opt.priceMultiplier), doc.currency)}
                              </p>
                              <p className="text-[11px] text-ink-secondary mt-1 leading-snug">
                                {opt.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exclusions */}
                    <div className="p-3.5 rounded bg-subtle border border-hairline">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">
                        3. Explicit Out-of-Scope Exclusions
                      </p>
                      <ul className="space-y-1 text-xs text-ink-secondary list-disc list-inside">
                        {doc.exclusions.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Milestones */}
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                        4. Milestone Payment Schedule
                      </p>
                      <div className="divide-y divide-hairline border border-hairline rounded">
                        {calculatedMilestones.map((m) => (
                          <div
                            key={m.id}
                            className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-medium text-ink">{m.label}</span>
                              <span className="text-ink-muted ml-2">({m.dueTrigger})</span>
                            </div>
                            <span className="font-mono font-medium text-ink tabular-nums shrink-0">
                              {m.percentage}% • {formatCurrency(m.amount, doc.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guardrails Summary */}
                    <div className="text-[11px] text-ink-secondary space-y-1 pt-2 border-t border-hairline">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                        5. Scope Guardrails &amp; Terms
                      </p>
                      <p>
                        Includes up to <strong className="text-ink">{doc.revisionRounds}</strong> consolidated revision round(s). Out-of-scope requests require a signed Change Order at{" "}
                        <strong className="text-ink font-mono">
                          {formatCurrency(doc.changeOrderRate, doc.currency)}/hr
                        </strong>
                        . Client sign-off window: {doc.acceptanceBusinessDays} business days. Kill fee: {doc.killFeePercent}%.{" "}
                        {doc.ipTransferOnFullPayment
                          ? "IP transfers strictly upon 100% payment."
                          : "Licensed per Master Services Agreement."}{" "}
                        Governed by the State of {doc.governingState}.
                      </p>
                    </div>

                    {/* Signature Block */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-hairline text-[11px] text-ink-muted">
                      <div>
                        <div className="h-7 border-b border-hairline" />
                        <p className="mt-1.5">Provider: {doc.providerContact || doc.providerName}</p>
                      </div>
                      <div>
                        <div className="h-7 border-b border-hairline" />
                        <p className="mt-1.5">Client: {doc.clientContact || doc.clientCompany}</p>
                      </div>
                    </div>

                    {/* Viral Free Footer vs White-Label Pro Footer */}
                    <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                      {!isPro ? (
                        <>
                          <span data-testid="viral-watermark">
                            Prepared with ScopeCraft · {displayDomain}
                          </span>
                          <button
                            type="button"
                            onClick={() => setUpgradeOpen(true)}
                            className="inline-flex items-center gap-1 font-medium text-forest hover:underline shrink-0"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Remove watermark</span>
                          </button>
                        </>
                      ) : (
                        <span data-testid="pro-footer">
                          {doc.brand.customFooter.trim() ||
                            `Confidential — Prepared by ${doc.providerName}`}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      <UpgradeModal
        open={upgradeOpen}
        isPro={isPro}
        activeKey={activeKey}
        onClose={() => setUpgradeOpen(false)}
        onActivated={(normalizedKey) => {
          saveStoredLicense(normalizedKey);
          setIsPro(true);
          setActiveKey(normalizedKey);
          showToast("ScopeCraft Pro activated.");
        }}
        onDeactivate={() => {
          clearStoredLicense();
          setIsPro(false);
          setActiveKey(null);
          showToast("License removed from browser.");
        }}
      />
    </>
  );
}
