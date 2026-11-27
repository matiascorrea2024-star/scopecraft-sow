import json
import os
import sys
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

if len(sys.argv) < 2:
    print("Usage: python3 scripts/audit_live.py https://your-live-url.vercel.app")
    sys.exit(1)

BASE_URL = sys.argv[1].rstrip("/")
ROOT = Path(os.getcwd())
SHOTS_DIR = ROOT / "audit_screenshots"
SHOTS_DIR.mkdir(parents=True, exist_ok=True)

keys_file = ROOT / "launch_kit" / "license_keys_500.txt"
FIRST_VALID_KEY = keys_file.read_text(encoding="utf-8").splitlines()[0].strip()

report = {
    "base_url": BASE_URL,
    "console_errors": [],
    "page_errors": [],
    "overflow_checks": [],
    "seo_checks": {},
    "flows": {},
}


def fetch_text(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "ScopeCraftAudit/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.status, resp.read().decode("utf-8", errors="replace")


# 1. SEO HTTP checks
status_sm, xml_sm = fetch_text(f"{BASE_URL}/sitemap.xml")
status_rb, txt_rb = fetch_text(f"{BASE_URL}/robots.txt")
status_t1, html_t1 = fetch_text(f"{BASE_URL}/templates/web-development-sow")
status_t2, html_t2 = fetch_text(f"{BASE_URL}/templates/shopify-store-build-sow")

report["seo_checks"] = {
    "sitemap_status": status_sm,
    "sitemap_template_urls": xml_sm.count("/templates/"),
    "robots_status": status_rb,
    "robots_has_sitemap": "sitemap.xml" in txt_rb.lower(),
    "web_dev_status": status_t1,
    "web_dev_has_jsonld": "application/ld+json" in html_t1,
    "shopify_status": status_t2,
    "shopify_has_jsonld": "application/ld+json" in html_t2,
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # DESKTOP 1440x900
    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        accept_downloads=True,
    )
    page = context.new_page()
    page.on(
        "console",
        lambda msg: report["console_errors"].append(msg.text)
        if msg.type == "error"
        else None,
    )
    page.on("pageerror", lambda err: report["page_errors"].append(str(err)))

    for route in ["/", "/audit", "/view", "/templates", "/templates/web-development-sow", "/pricing"]:
        page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
        dims = page.evaluate(
            "() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth })"
        )
        report["overflow_checks"].append(
            {
                "viewport": "1440x900",
                "route": route,
                "overflow_px": max(0, dims["scrollW"] - dims["innerW"]),
            }
        )

    # Go back to Home for interactive E2E
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    page.screenshot(path=str(SHOTS_DIR / "desktop_home.png"), full_page=False)

    # Free flow: modify project title & rate, check live preview updates
    title_input = page.locator("#project-title-input")
    title_input.fill("Enterprise Next.js SaaS Storefront Rebuild")
    rate_input = page.get_by_label("Deliverable 1 rate")
    rate_input.fill("4000")

    updated_total = page.get_by_test_id("preview-total").inner_text()
    watermark_visible = page.get_by_test_id("viral-watermark").is_visible()

    # Export PDF & verify real file download
    with page.expect_download(timeout=15000) as dl_info:
        page.get_by_role("button", name="Download PDF").first.click()
    download = dl_info.value
    pdf_path = SHOTS_DIR / download.suggested_filename
    download.save_as(str(pdf_path))
    pdf_size = pdf_path.stat().st_size

    page.screenshot(path=str(SHOTS_DIR / "desktop_studio.png"), full_page=False)

    # Open Upgrade Modal and verify PayPal links
    page.get_by_role("button", name="Upgrade to Pro").first.click()
    page.wait_for_selector("#upgrade-modal-title")
    hrefs = page.evaluate(
        "() => Array.from(document.querySelectorAll('a[href*=\"paypal.me\"]')).map(a => a.getAttribute('href'))"
    )
    page.screenshot(path=str(SHOTS_DIR / "desktop_pro_modal.png"), full_page=False)

    # Activate Pro with real key from launch_kit/license_keys_500.txt
    page.locator("#license-key-input").fill(FIRST_VALID_KEY)
    page.get_by_role("button", name="Activate License").click()
    page.wait_for_selector("[data-testid='pro-footer']", timeout=10000)
    page.get_by_role("button", name="Close modal").click()

    pro_badge_visible = page.get_by_role("button", name="PRO ACTIVE").is_visible()
    watermark_gone = page.get_by_test_id("viral-watermark").count() == 0
    pro_footer_visible = page.get_by_test_id("pro-footer").is_visible()

    # Verify reload persistence
    page.reload(wait_until="networkidle")
    pro_persisted = page.get_by_role("button", name="PRO ACTIVE").is_visible()
    page.screenshot(path=str(SHOTS_DIR / "desktop_pro_active.png"), full_page=False)

    # Capture SEO Template page + Audit calculator page
    page.goto(f"{BASE_URL}/templates/web-development-sow", wait_until="networkidle")
    page.screenshot(path=str(SHOTS_DIR / "desktop_seo_template.png"), full_page=False)
    page.goto(f"{BASE_URL}/audit", wait_until="networkidle")
    audit_exposure = page.get_by_test_id("audit-exposure").inner_text()
    page.screenshot(path=str(SHOTS_DIR / "desktop_audit.png"), full_page=False)
    report["flows"]["audit_exposure_default"] = audit_exposure

    report["flows"] = {
        "updated_total": updated_total,
        "watermark_visible_free": watermark_visible,
        "pdf_filename": download.suggested_filename,
        "pdf_size_bytes": pdf_size,
        "paypal_hrefs": hrefs,
        "pro_badge_visible": pro_badge_visible,
        "watermark_gone_pro": watermark_gone,
        "pro_footer_visible": pro_footer_visible,
        "pro_persisted_after_reload": pro_persisted,
    }
    context.close()

    # MOBILE 390x844
    m390 = browser.new_context(viewport={"width": 390, "height": 844})
    mp = m390.new_page()
    mp.on(
        "console",
        lambda msg: report["console_errors"].append(msg.text)
        if msg.type == "error"
        else None,
    )
    for route in ["/", "/audit", "/view", "/templates", "/templates/web-development-sow", "/pricing"]:
        mp.goto(f"{BASE_URL}{route}", wait_until="networkidle")
        dims = mp.evaluate(
            "() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth })"
        )
        report["overflow_checks"].append(
            {
                "viewport": "390x844",
                "route": route,
                "overflow_px": max(0, dims["scrollW"] - dims["innerW"]),
            }
        )
    mp.goto(f"{BASE_URL}/audit", wait_until="networkidle")
    mp.screenshot(path=str(SHOTS_DIR / "mobile_390_audit.png"), full_page=False)
    mp.goto(f"{BASE_URL}/", wait_until="networkidle")
    mp.screenshot(path=str(SHOTS_DIR / "mobile_390_home.png"), full_page=False)
    mp.get_by_role("button", name="Live Document").click()
    mp.wait_for_timeout(300)
    mp.screenshot(path=str(SHOTS_DIR / "mobile_390_preview.png"), full_page=False)
    m390.close()

    # MOBILE 360x800
    m360 = browser.new_context(viewport={"width": 360, "height": 800})
    sp = m360.new_page()
    for route in ["/", "/templates", "/pricing"]:
        sp.goto(f"{BASE_URL}{route}", wait_until="networkidle")
        dims = sp.evaluate(
            "() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth })"
        )
        report["overflow_checks"].append(
            {
                "viewport": "360x800",
                "route": route,
                "overflow_px": max(0, dims["scrollW"] - dims["innerW"]),
            }
        )
    sp.goto(f"{BASE_URL}/", wait_until="networkidle")
    sp.screenshot(path=str(SHOTS_DIR / "mobile_360_home.png"), full_page=False)
    m360.close()

    browser.close()

print(json.dumps(report, indent=2))
