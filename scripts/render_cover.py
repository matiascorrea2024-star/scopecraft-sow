import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(os.getcwd())
OUT = ROOT / "launch_kit" / "editorial_cover_1280x720.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 720px;
      background: #FAFAF8;
      color: #141413;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      border-top: 8px solid #0F5C4A;
      padding: 54px 64px;
      display: flex;
      gap: 48px;
      align-items: stretch;
      overflow: hidden;
    }
    .left {
      flex: 1.05;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mark {
      width: 38px;
      height: 38px;
      border-radius: 7px;
      background: #0F5C4A;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }
    .brand-name { font-size: 19px; font-weight: 700; letter-spacing: -0.02em; }
    .brand-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6E6C64; letter-spacing: 0.08em; text-transform: uppercase; }
    .eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #0F5C4A;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h1 {
      font-family: 'Instrument Serif', Georgia, serif;
      font-size: 64px;
      line-height: 1.04;
      font-weight: 400;
      letter-spacing: -0.02em;
      color: #141413;
      margin-bottom: 20px;
    }
    .sub {
      font-size: 18px;
      line-height: 1.5;
      color: #52514B;
      max-width: 520px;
    }
    .pills {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 7px 10px;
      border: 1px solid #E5E3DC;
      background: #FFFFFF;
      border-radius: 6px;
      color: #141413;
      white-space: nowrap;
    }
    .pill.accent {
      background: #ECF5F2;
      border-color: rgba(15, 92, 74, 0.28);
      color: #0F5C4A;
      font-weight: 600;
    }
    .right {
      flex: 0.95;
      background: #FFFFFF;
      border: 1px solid #E5E3DC;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(20,20,19,0.04), 0 18px 40px rgba(20,20,19,0.06);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .sheet-top { height: 6px; background: #0F5C4A; }
    .sheet-body { padding: 30px 32px; display: flex; flex-direction: column; gap: 18px; flex: 1; }
    .sheet-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #E5E3DC;
      padding-bottom: 16px;
    }
    .doc-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; color: #0F5C4A; font-weight: 600; }
    .doc-title { font-family: 'Instrument Serif', Georgia, serif; font-size: 26px; margin-top: 4px; }
    .doc-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6E6C64; text-align: right; }
    .score-card {
      background: #ECF5F2;
      border: 1px solid rgba(15,92,74,0.22);
      border-radius: 6px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: #0F5C4A;
    }
    .table { border: 1px solid #E5E3DC; border-radius: 6px; overflow: hidden; }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 11px 14px;
      font-size: 12.5px;
      border-bottom: 1px solid #E5E3DC;
    }
    .row:last-child { border-bottom: none; }
    .row.head { background: #F3F2EE; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6E6C64; text-transform: uppercase; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .excl {
      background: #F3F2EE;
      border: 1px solid #E5E3DC;
      border-radius: 6px;
      padding: 14px;
      font-size: 12px;
      color: #52514B;
      line-height: 1.5;
    }
    .excl-title { font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; color: #6E6C64; margin-bottom: 6px; }
    .sheet-foot {
      margin-top: auto;
      border-top: 1px solid #E5E3DC;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6E6C64;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="left">
    <div class="brand">
      <div class="mark">S</div>
      <div>
        <div class="brand-name">ScopeCraft</div>
        <div class="brand-sub">CraftApp Studio</div>
      </div>
    </div>

    <div>
      <div class="eyebrow">Statement of Work &amp; Change Order Studio</div>
      <h1>Watertight SOWs, ready in 60 seconds.</h1>
      <p class="sub">Stop unpaid scope creep before kickoff. Built-in Scope-Protection scoring, explicit out-of-scope exclusions, milestone deposits, and instant US Letter PDFs.</p>
    </div>

    <div class="pills">
      <span class="pill accent">Scope Score: 100/100</span>
      <span class="pill">30 Industry Templates</span>
      <span class="pill">1-Click Change Orders</span>
      <span class="pill">Zero Signup</span>
    </div>
  </div>

  <div class="right">
    <div class="sheet-top"></div>
    <div class="sheet-body">
      <div class="sheet-head">
        <div>
          <div class="doc-tag">STATEMENT OF WORK</div>
          <div class="doc-title">Custom Web Platform Build</div>
        </div>
        <div class="doc-num">SOW-2026-104<br/>Valid 14 days</div>
      </div>

      <div class="score-card">
        <span>Scope-Protection Guardrails Active</span>
        <span class="mono">100 / 100 WATERTIGHT</span>
      </div>

      <div class="table">
        <div class="row head"><span>Deliverable</span><span>Investment</span></div>
        <div class="row"><span>Architecture &amp; Component System</span><span class="mono">$2,800</span></div>
        <div class="row"><span>Core Pages &amp; CMS Integration</span><span class="mono">$4,200</span></div>
        <div class="row"><span>Technical SEO, QA &amp; Cutover</span><span class="mono">$1,500</span></div>
        <div class="row" style="font-weight:700;color:#0F5C4A;"><span>Total Investment (40 / 30 / 30 Split)</span><span class="mono">$8,500</span></div>
      </div>

      <div class="excl">
        <div class="excl-title">Explicit Out-of-Scope Exclusions</div>
        • Copywriting, brand photography, or paid stock fees.<br/>
        • Undocumented third-party ERP/CRM middleware.<br/>
        • Feature additions after architecture sign-off ($165/hr CO).
      </div>

      <div class="sheet-foot">
        <span>IP Transfers on 100% Payment</span>
        <span>US Letter PDF Ready</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.set_content(HTML, wait_until="networkidle")
    page.screenshot(path=str(OUT))
    browser.close()

print("Saved cover:", OUT, OUT.stat().st_size)
