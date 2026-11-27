# Phase 1 Market Research & Niche Selection — CraftApp Studio

**Date:** November 26, 2026  
**Objective:** Select a $0-fixed-cost US B2B/prosumer web SaaS with recurring weekly usage, strong willingness to pay ($12/mo or $79/yr), 30+ organic Programmatic SEO entry points, and an organic viral distribution loop.

---

## 1. Candidate Comparison (Real US Demand Signals)

Research across Reddit (`r/SaaS`, `r/freelance`, `r/projectmanagement`, `r/msp`), Product Hunt, and AlternativeTo revealed three primary recurring workflows in US freelance and boutique agency operations:

### Candidate A (WINNER): Statement of Work (SOW) & Change Order Scope Builder — **ScopeCraft**
- **Core Pain Point:** Independent consultants, web/Shopify developers, designers, and boutique agencies lose thousands of dollars per project to *scope creep* ("Can you just add this page?") and waste hours copying messy Google Docs/Word templates because enterprise CPQ/proposal suites (PandaDoc, Proposify, Bonsai, HoneyBook) cost **$24–$79+/month** and lock teams into bloated CRM workflows.
- **Proximity to Money:** Very High. Sits directly before project kickoff and deposit collection, and governs out-of-scope Change Orders. One prevented $500–$5,000 scope dispute pays for years of a $12/mo or $79/yr subscription.
- **Frequency of Use:** Weekly/bi-weekly for active consultants and agencies pitching new retainers, milestones, and Change Orders.
- **Programmatic SEO Opportunity:** Massive US search demand across `"statement of work template"` and `"scope of work template"` paired with specific verticals (Web Development, Shopify Store Build, SEO Retainer, UI/UX Design, Fractional CMO, Cybersecurity Assessment, Commercial Video, Residential Remodeling, Software Change Order, etc.) — 30+ distinct high-intent commercial keywords.
- **Built-In Viral Loop:** Every free user exports a polished, client-ready PDF SOW and sends it to their client, stakeholder, or procurement lead. A subtle, high-craft footer (`Prepared with ScopeCraft`) acts as continuous zero-cost B2B referral distribution. Removing that badge + unlocking white-label studio branding, Change Order conversion, 3-tier option tables, and unlimited saved history cleanly motivates Pro upgrades.
- **Zero-Cost Architecture:** 100% client-side PDF generation (`jspdf`), local browser persistence (`localStorage`), static SEO pages on Vercel Hobby ($0), and stateless license verification.

### Candidate B (Eliminated): Standalone Freelance Invoice Generator
- **Core Pain Point:** Generating formatted invoices at the end of a billing cycle.
- **Why Eliminated:** Severely commoditized. Wave, Invoice Ninja, Zoho Books, Stripe Invoicing, and Square already offer free invoicing tiers. Willingness to pay for a standalone PDF invoice generator is **$0–$10/mo** with near-zero conversion unless tied to regulated payment processing / ACH take-rates.

### Candidate C (Eliminated): Weekly Client Status Report Generator
- **Core Pain Point:** Friday afternoon summaries of tasks completed across Jira, Slack, GitHub, and Toggl.
- **Why Eliminated:** Low proximity to revenue (viewed as administrative chore rather than revenue protection), near-zero standalone willingness to pay among freelancers, high churn, and requires fragile paid OAuth/API integrations across 5+ third-party platforms to deliver real value.

---

## 2. Decision Matrix

| Criterion (Weight) | ScopeCraft (SOW + Change Order) | Standalone Invoice Generator | Weekly Status Report Tool |
| :--- | :--- | :--- | :--- |
| **Willingness to Pay ($12/mo, $79/yr)** | High — prevents $500–$5k scope creep | Low — free Stripe/Wave alternatives | Very Low — perceived admin chore |
| **Competitor Price Gap** | Undercuts $24–$79/mo suites cleanly | Competes against $0 tools | Competes against Slack/Notion |
| **30+ Long-Tail SEO Intent** | Strong (`[industry] SOW template`) | Saturated by accounting giants | Weak commercial search intent |
| **Client-Facing Viral Loop** | High — sent to every new client | Moderate — accounting commodity | Low — internal/skimmed emails |
| **Infrastructure Cost** | $0/mo (stateless + client PDF) | $0/mo | High (OAuth/API sync + DB) |

---

## 3. Product & Monetization Blueprint

- **Product Name:** **ScopeCraft** (by CraftApp Studio)
- **Free Tier ($0, No Signup):** Full interactive SOW builder usable in <30 seconds above the fold, live Scope-Protection Score (0–100), 5 core industry presets, explicit Out-of-Scope Exclusions builder, Milestone Schedule calculator, up to 2 saved local drafts, Markdown export, and instant US Letter PDF export with subtle `"Prepared with ScopeCraft"` footer.
- **Pro Tier ($12/mo or $79/yr via `https://paypal.me/craftappstudio`):**
  1. **Zero Watermark & White-Label Studio Branding** (upload custom logo, pick custom brand accent color, replace ScopeCraft footer with your own firm's confidential footer).
  2. **1-Click Change Order Mode** (convert any SOW or draft into a formal Change Order with net investment delta and timeline impact).
  3. **All 30 Industry Templates & Pro Clause Library** (IP transfer on full payment, kill fee, late-fee interest, warranty window).
  4. **3-Option Value Pricing Table** (Good / Better / Best packages on the SOW).
  5. **Unlimited Local Project History & JSON Backup**.
