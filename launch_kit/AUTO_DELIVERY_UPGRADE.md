# Auto-Delivery Upgrade Guide (24/7 Automated Keys & Subscriptions)

ScopeCraft currently collects payments immediately via `https://paypal.me/craftappstudio/12USD` (monthly) and `https://paypal.me/craftappstudio/79USD` (annual) and activates Pro using any key from `launch_kit/license_keys_500.txt`.

When you are ready for 100% automated 24/7 key delivery with zero manual emailing:

## Option A — Payhip + Existing PayPal (Fastest, $0 Fixed Cost)
1. Create two digital products in Payhip (free plan, connected to your same PayPal account):
   - **ScopeCraft Pro Monthly ($12/mo)**
   - **ScopeCraft Pro Annual ($79/yr)**
2. Upload/paste the remaining unused keys from `launch_kit/license_keys_500.txt` into Payhip's built-in **License Key Generator / Stock List** so Payhip emails one unique `SC-PRO-...` key immediately after checkout.
3. In **Vercel -> Project Settings -> Environment Variables**, add:
   - `NEXT_PUBLIC_BILLING_PROVIDER=payhip`
   - `NEXT_PUBLIC_PAYHIP_MONTHLY_URL=<your Payhip monthly checkout URL>`
   - `NEXT_PUBLIC_PAYHIP_ANNUAL_URL=<your Payhip annual checkout URL>`
   Redeploy once and every PayPal buyer receives their key automatically in seconds.

## Option B — PayPal Subscriptions API + HMAC Dynamic Keys (Built-In Support)
The backend verifier (`src/app/api/license/verify/route.ts`) already supports dynamic HMAC-signed license keys (`SC-LIVE-<8HEX>-<8SIG>`) via `process.env.LICENSE_HMAC_SECRET`:
1. Create Monthly ($12) and Annual ($79) plans in PayPal Subscriptions.
2. Set `NEXT_PUBLIC_BILLING_PROVIDER=paypal_subscriptions` plus `NEXT_PUBLIC_PAYPAL_SUB_MONTHLY_URL`, `NEXT_PUBLIC_PAYPAL_SUB_ANNUAL_URL`, and `LICENSE_HMAC_SECRET` in Vercel Environment Variables.
3. Issue `SC-LIVE-...` keys from a tiny PayPal webhook route using `LICENSE_HMAC_SECRET`—zero database required.
