import base64
import os
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(os.getcwd())
SHOTS = ROOT / "audit_screenshots"
OUT_DIR = ROOT / "launch_kit" / "viral_videos"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def b64_img(path: Path) -> str:
    if not path.exists():
        return ""
    return "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


BASE_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #FAFAF8;
  color: #141413;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #0F5C4A;
  font-weight: 600;
}
.serif {
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  line-height: 1.04;
}
.mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
.card {
  background: #FFFFFF;
  border: 2px solid #E5E3DC;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(20,20,19,0.08);
}
.pill {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 999px;
  background: #ECF5F2;
  border: 2px solid rgba(15,92,74,0.28);
  color: #0F5C4A;
  font-weight: 700;
}
.cta-bar {
  background: #0F5C4A;
  color: #FFFFFF;
  border-radius: 16px;
  padding: 26px 32px;
  text-align: center;
}
"""


def make_vertical_slide(eyebrow: str, headline: str, sub: str, badge: str = "", shot_b64: str = "", accent_red: bool = False) -> str:
    eye_color = "#B42318" if accent_red else "#0F5C4A"
    shot_block = (
        f'<div class="card" style="padding:14px;overflow:hidden;max-height:920px;display:flex;justify-content:center;"><img src="{shot_b64}" style="width:100%;height:auto;border-radius:10px;object-fit:contain;" /></div>'
        if shot_b64
        else ""
    )
    badge_html = f'<div class="pill mono" style="font-size:26px;">{badge}</div>' if badge else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"/><style>{BASE_CSS}
    body {{ width: 1080px; height: 1920px; padding: 110px 72px 120px; border-top: 14px solid {eye_color}; }}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="eyebrow" style="font-size:24px;color:{eye_color};">{eyebrow}</span>
        <span class="mono" style="font-size:22px;color:#6E6C64;">ScopeCraft</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:34px;margin:auto 0;">
        {badge_html}
        <h1 class="serif" style="font-size:94px;">{headline}</h1>
        <p style="font-size:38px;line-height:1.38;color:#52514B;">{sub}</p>
        {shot_block}
      </div>
      <div class="cta-bar">
        <div class="mono" style="font-size:28px;font-weight:600;">scopecraft-sow.vercel.app</div>
      </div>
    </body></html>"""


def make_landscape_slide(eyebrow: str, headline: str, sub: str, shot_b64: str = "") -> str:
    right = (
        f'<div class="card" style="flex:1.15;padding:14px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><img src="{shot_b64}" style="width:100%;height:auto;border-radius:8px;" /></div>'
        if shot_b64
        else ""
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"/><style>{BASE_CSS}
    body {{ width: 1280px; height: 720px; padding: 52px 64px; border-top: 8px solid #0F5C4A; flex-direction: row; gap: 44px; align-items: center; }}
    </style></head><body>
      <div style="flex:0.85;display:flex;flex-direction:column;gap:22px;">
        <span class="eyebrow" style="font-size:15px;">{eyebrow}</span>
        <h1 class="serif" style="font-size:62px;">{headline}</h1>
        <p style="font-size:22px;line-height:1.45;color:#52514B;">{sub}</p>
        <div class="mono" style="font-size:16px;color:#0F5C4A;font-weight:600;">scopecraft-sow.vercel.app</div>
      </div>
      {right}
    </body></html>"""


def encode_video(slides: list[tuple[str, float]], width: int, height: int, out_mp4: Path):
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        img_paths = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": width, "height": height})
            for idx, (html, _) in enumerate(slides):
                page.set_content(html, wait_until="networkidle")
                img_path = tmp / f"scene_{idx}.png"
                page.screenshot(path=str(img_path))
                img_paths.append(img_path)
            browser.close()

        # Build ffmpeg filter_complex with smooth 0.35s fade transitions
        cmd = ["nice", "-n", "15", "ffmpeg", "-y"]
        for idx, (_, dur) in enumerate(slides):
            cmd += ["-loop", "1", "-t", f"{dur:.2f}", "-i", str(img_paths[idx])]

        fade = 0.35
        filters = []
        cur_label = "[0:v]"
        offset = slides[0][1] - fade
        for idx in range(1, len(slides)):
            nxt = f"[{idx}:v]"
            out_lbl = f"[v{idx}]" if idx < len(slides) - 1 else "[vout]"
            filters.append(
                f"{cur_label}{nxt}xfade=transition=fade:duration={fade}:offset={offset:.2f}{out_lbl}"
            )
            cur_label = out_lbl
            offset += slides[idx][1] - fade

        cmd += [
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[vout]",
            "-r",
            "30",
            "-c:v",
            "libx264",
            "-preset",
            "faster",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(out_mp4),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("Rendered:", out_mp4.name, out_mp4.stat().st_size, "bytes")


audit_mob = b64_img(SHOTS / "mobile_390_audit.png")
preview_mob = b64_img(SHOTS / "mobile_390_preview.png")
home_mob = b64_img(SHOTS / "mobile_360_home.png")
home_desk = b64_img(SHOTS / "desktop_home.png")
audit_desk = b64_img(SHOTS / "desktop_audit.png")
studio_desk = b64_img(SHOTS / "desktop_studio.png")
modal_desk = b64_img(SHOTS / "desktop_pro_modal.png")

# Video 1: Scope-Creep Hook (9:16, ~18s)
encode_video(
    [
        (make_vertical_slide("SCOPE CREEP ALERT", "“Can you just add one quick thing?”", "Congratulations — if it wasn't excluded in your SOW, you just started working for free.", "COST: $1,200–$3,500", accent_red=True), 4.0),
        (make_vertical_slide("THE 3 SILENT TRAPS", "No revision cap. No deposit. No exclusions.", "Most freelancers send vague quotes that invite endless unpaid tweaks.", "RISK AUDIT", accent_red=True), 4.5),
        (make_vertical_slide("FREE 20-SECOND CHECK", "See your exact $ exposure before sending.", "Run the Scope-Creep Risk Calculator and fix every missing clause in 1 click.", "LIVE CALCULATOR", shot_b64=audit_mob), 5.5),
        (make_vertical_slide("PROTECT YOUR MARGIN", "Run your free Scope Check now.", "Zero signup. Instant US Letter SOW PDF. Link in bio.", "FREE TOOL · /audit"), 4.0),
    ],
    1080,
    1920,
    OUT_DIR / "01_scope_creep_hook_9x16.mp4",
)

# Video 2: The $5,000 Mistake (9:16, ~19s)
encode_video(
    [
        (make_vertical_slide("FREELANCE PRICING", "You quoted $5,000 for the build.", "Did you actually define what those $5,000 include — and what costs extra?", "SCOPE GAP", accent_red=True), 4.0),
        (make_vertical_slide("SCOPE-PROTECTION SCORE", "100/100 Watertight in 60 seconds.", "Exclusions, 50% deposit, 2 revision rounds, IP on payment, and Change Order rate.", "AUTO-FIX ENGINE", shot_b64=home_mob), 5.5),
        (make_vertical_slide("ONE-CLICK CHANGE ORDER", "Turn extra requests into billable addenda.", "Document exact added fee and business-day timeline impact in seconds.", "PAID SCOPE PROTECTION", shot_b64=preview_mob), 5.5),
        (make_vertical_slide("TRY IT FREE", "Stop absorbing free work.", "Build your next Statement of Work in 60 seconds. Link in bio.", "CRAFTAPP STUDIO"), 4.0),
    ],
    1080,
    1920,
    OUT_DIR / "02_change_order_script_9x16.mp4",
)

# Video 3: Stop Sending Ugly Docs (9:16, ~18s)
encode_video(
    [
        (make_vertical_slide("CLIENT PRESENTATION", "Stop sending clients messy Word docs.", "And stop paying $49/mo for bloated contract suites just to export a PDF.", "ZERO SUBSCRIPTION", accent_red=True), 4.0),
        (make_vertical_slide("EXECUTIVE WEB + PDF", "Share a clean client presentation link.", "Itemized deliverables, explicit exclusions, and milestone splits ready to sign.", "BUILT-IN SHARE LINK", shot_b64=preview_mob), 5.5),
        (make_vertical_slide("30 INDUSTRY PLAYBOOKS", "Web Dev, Shopify, SEO, Design & Trades.", "Pre-loaded with real industry scope-trap clauses.", "30 TEMPLATES", shot_b64=audit_mob), 5.0),
        (make_vertical_slide("START FREE TODAY", "Zero signup. Export PDF instantly.", "Optional Pro white-label studio for $12. Link in bio.", "SCOPECRAFT FREE"), 3.5),
    ],
    1080,
    1920,
    OUT_DIR / "03_stop_paying_50mo_9x16.mp4",
)

# Video 4: Product Hunt Horizontal Demo (16:9, ~24s)
encode_video(
    [
        (make_landscape_slide("SCOPECRAFT · CRAFTAPP STUDIO", "Watertight Statements of Work in 60s.", "No-signup SOW & Change Order workbench with live Scope-Protection scoring.", shot_b64=home_desk), 6.0),
        (make_landscape_slide("STEP 1 · SCOPE-CREEP AUDIT", "Quantify missing contract guardrails.", "Calculate estimated exposure on /audit and load a pre-protected template in 1 click.", shot_b64=audit_desk), 6.0),
        (make_landscape_slide("STEP 2 · LIVE WORKBENCH & PDF", "Edit scope, milestones, and export PDF.", "Share read-only Client Links (/view), Share Summaries, or US Letter PDFs.", shot_b64=studio_desk), 6.5),
        (make_landscape_slide("PRO WHITE-LABEL STUDIO", "Zero watermark. Your logo & brand color.", "All 30 industry templates & Change Order branching for $12 (30-day pass).", shot_b64=modal_desk), 5.5),
    ],
    1280,
    720,
    OUT_DIR / "04_product_hunt_demo_16x9.mp4",
)
