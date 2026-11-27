import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { getTemplateBySlug, SOW_TEMPLATES } from "@/data/templates";
import { calculateDeliverableLineTotal, formatCurrency } from "@/lib/sowMath";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SOW_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tpl = getTemplateBySlug(slug);
  if (!tpl) return {};

  const url = `${SITE_URL}/templates/${tpl.slug}`;
  return {
    title: tpl.metaTitle,
    description: tpl.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: tpl.metaTitle,
      description: tpl.metaDescription,
      url,
      type: "article",
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tpl = getTemplateBySlug(slug);
  if (!tpl) notFound();

  const related = SOW_TEMPLATES.filter(
    (t) => t.slug !== tpl.slug && t.category === tpl.category
  ).slice(0, 3);
  const fallbackRelated =
    related.length >= 3
      ? related
      : [
          ...related,
          ...SOW_TEMPLATES.filter((t) => t.slug !== tpl.slug).slice(
            0,
            3 - related.length
          ),
        ];

  const pageUrl = `${SITE_URL}/templates/${tpl.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${SITE_NAME} — ${tpl.shortName}`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: pageUrl,
        offers: {
          "@type": "Offer",
          price: tpl.isProTemplate ? "12.00" : "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: `${SITE_URL}/templates`,
          },
          { "@type": "ListItem", position: 3, name: tpl.shortName, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: tpl.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-canvas">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-10 space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span>/</span>
            <Link href="/templates" className="hover:text-ink">
              Templates
            </Link>
            <span>/</span>
            <span className="text-ink font-medium">{tpl.shortName}</span>
          </nav>

          {/* Hero */}
          <section className="pb-8 border-b border-hairline flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-forest font-medium">
                  {tpl.category}
                </span>
                <span className="text-hairline">•</span>
                <span className="font-mono text-[11px] text-ink-muted">
                  {tpl.isProTemplate ? "Pro Template (Free Preview)" : "Free Core Template"}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-ink mt-2 leading-tight">
                {tpl.title}
              </h1>
              <p className="text-sm sm:text-base text-ink-secondary mt-3 leading-relaxed">
                {tpl.heroSummary}
              </p>

              <div className="mt-5 flex flex-wrap gap-6 text-xs font-mono tabular-nums">
                <div>
                  <span className="block text-ink-muted uppercase text-[10px]">
                    Typical US Budget
                  </span>
                  <span className="text-ink font-medium mt-0.5 block">
                    {tpl.typicalBudgetRange}
                  </span>
                </div>
                <div>
                  <span className="block text-ink-muted uppercase text-[10px]">
                    Standard Timeline
                  </span>
                  <span className="text-ink font-medium mt-0.5 block">
                    {tpl.typicalTimeline}
                  </span>
                </div>
                <div>
                  <span className="block text-ink-muted uppercase text-[10px]">
                    Change Order Rate
                  </span>
                  <span className="text-ink font-medium mt-0.5 block">
                    ${tpl.presetDocument.changeOrderRate}/hr
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={`/?template=${tpl.slug}#studio`}
                className="min-h-[48px] px-6 rounded-md bg-forest hover:bg-forest-hover text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open in ScopeCraft Builder</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Deliverables & Exclusions Preview */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-paper border border-hairline rounded-lg p-6 space-y-4">
              <h2 className="font-serif text-2xl text-ink">
                Pre-Built Deliverables Breakdown
              </h2>
              <div className="divide-y divide-hairline border border-hairline rounded">
                {tpl.presetDocument.deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{d.title}</p>
                      <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                        {d.description}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs text-ink tabular-nums shrink-0">
                      {formatCurrency(
                        calculateDeliverableLineTotal(d),
                        tpl.presetDocument.currency
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-paper border border-hairline rounded-lg p-6 space-y-3">
                <h2 className="font-serif text-2xl text-ink flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-forest" />
                  <span>Common Scope Traps</span>
                </h2>
                <ul className="space-y-2.5 text-xs text-ink-secondary">
                  {tpl.commonScopeTraps.map((trap) => (
                    <li key={trap} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-subtle border border-hairline rounded-lg p-6 space-y-3">
                <h3 className="text-sm font-semibold text-ink">
                  Included Out-of-Scope Exclusions
                </h3>
                <ul className="space-y-1.5 text-xs text-ink-secondary list-disc list-inside">
                  {tpl.presetDocument.exclusions.map((ex) => (
                    <li key={ex}>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-hairline">
              {tpl.faqs.map((faq) => (
                <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-semibold text-ink">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1.5 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-ink">Related SOW Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {fallbackRelated.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/templates/${rel.slug}`}
                  className="bg-paper border border-hairline hover:border-forest rounded-md p-4 transition-colors"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                    {rel.category}
                  </p>
                  <p className="text-sm font-semibold text-ink mt-1">{rel.shortName}</p>
                  <p className="text-xs text-ink-secondary mt-1 line-clamp-2">
                    {rel.heroSummary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
