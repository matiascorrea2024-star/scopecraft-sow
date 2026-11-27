"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { SOW_TEMPLATES, TEMPLATE_CATEGORIES } from "@/data/templates";
import { TemplateCategory } from "@/types/sow";

export function TemplatesCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | TemplateCategory>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SOW_TEMPLATES.filter((t) => {
      if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.heroSummary.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`min-h-[40px] px-3 rounded-md border text-xs font-medium transition-colors ${
              selectedCategory === "All"
                ? "border-forest bg-forest-tint text-forest"
                : "border-hairline bg-paper text-ink-secondary hover:text-ink"
            }`}
          >
            All ({SOW_TEMPLATES.length})
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3 rounded-md border text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "border-forest bg-forest-tint text-forest"
                  : "border-hairline bg-paper text-ink-secondary hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter templates..."
            aria-label="Filter templates"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-md border border-hairline bg-paper text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl) => (
          <div
            key={tpl.slug}
            className="bg-paper border border-hairline hover:border-forest rounded-md p-5 flex flex-col justify-between transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                  {tpl.category}
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    tpl.isProTemplate ? "text-ink-muted" : "text-forest font-semibold"
                  }`}
                >
                  {tpl.isProTemplate ? "Pro" : "Free"}
                </span>
              </div>
              <h2 className="text-base font-semibold text-ink mt-2">
                <Link href={`/templates/${tpl.slug}`} className="hover:text-forest transition-colors">
                  {tpl.shortName}
                </Link>
              </h2>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                {tpl.heroSummary}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-hairline flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-ink-muted tabular-nums">
                {tpl.typicalBudgetRange}
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/templates/${tpl.slug}`}
                  className="text-ink-secondary hover:text-ink font-medium"
                >
                  Guide
                </Link>
                <Link
                  href={`/?template=${tpl.slug}#studio`}
                  className="text-forest hover:text-forest-hover font-medium inline-flex items-center gap-1"
                >
                  <span>Use</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
