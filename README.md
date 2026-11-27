# ScopeCraft — Watertight Statements of Work & Change Orders

**Live Production App:** [https://scopecraft-sow.vercel.app](https://scopecraft-sow.vercel.app)

Built by **CraftApp Studio**, ScopeCraft is a zero-signup Statement of Work (SOW) and Change Order studio designed for independent engineers, designers, consultants, agencies, and trade contractors.

## Key Capabilities

- **Instant Workbench Above the Fold:** Draft deliverables, hourly/flat rates, tax, payment milestones, and explicit out-of-scope exclusions in under 60 seconds with live US Letter document preview.
- **Deterministic Scope-Protection Score (0–100):** Scores every SOW against real commercial guardrails:
  - Upfront kickoff deposit (`>= 30%`)
  - Explicit out-of-scope exclusions (`2+`)
  - Capped revision rounds (`1–3`)
  - Out-of-scope Change Order hourly billing rate
  - Client review / silent-approval window (`<= 10 business days`)
  - IP transfer strictly upon 100% final payment
  - Complete deliverable specs and 100% milestone split
- **Client-Side US Letter PDF Export:** Generates crisp, multi-page editorial PDFs locally in the browser using `jspdf` with zero server latency.
- **30 Industry SOW & Change Order Playbooks:** Static SSG template guides covering Web Development, Shopify Store Builds, UI/UX Design, SEO Retainers, SaaS MVPs, Fractional CMO/CFO, AI Workflow Automation, Residential Remodeling, and Change Orders (`/templates/[slug]`), complete with JSON-LD Schema, XML Sitemap, and OpenGraph cards.
- **Pro White-Label Studio & Licensing:** Unlock custom logo upload, brand accent colors, confidential PDF footers, 3-Option Value Pricing Tables, unlimited browser history, and all 30 templates via PayPal checkout (`src/config/billing.ts`) and salted SHA-256 license verification (`src/lib/license.ts`).

## Local Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

## Architecture

- `src/app/` — Next.js App Router pages, `/templates/[slug]` static generation, `/pricing`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, and `/api/license/verify`.
- `src/components/` — Split-screen `SowStudio` workbench, `UpgradeModal`, `TemplatesCatalog`, and editorial landing sections.
- `src/data/templates.ts` — 30 industry-specific SOW and Change Order presets with scope-trap checklists and FAQs.
- `src/lib/` — Pure financial & Scope-Protection math (`sowMath.ts`), client PDF engine (`pdfExport.ts`), and license verification (`license.ts`).
- `src/config/billing.ts` — Centralized PayPal / Payhip / PayPal Subscriptions billing configuration.
