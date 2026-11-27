# Reporte Final — ScopeCraft (CraftApp Studio)

**Fecha:** 26 de noviembre de 2026  
**Proyecto:** ScopeCraft — Constructor de Statements of Work (SOW) y Change Orders  
**URL en producción:** https://scopecraft-sow.vercel.app  
**Repositorio público (GitHub):** https://github.com/matiascorrea2024-star/scopecraft-sow  
**Cobro PayPal activo:** `https://paypal.me/craftappstudio/12USD` (Pro Mensual) y `https://paypal.me/craftappstudio/79USD` (Pro Anual)

---

## 1. Qué construimos y por qué gana

Después de analizar 3 nichos B2B/prosumer en EE. UU. (detalle completo en `RESEARCH.md`), elegimos **ScopeCraft**: un estudio web sin registro para que freelancers, consultores, agencias y contratistas armen **Statements of Work (SOW)** y **Change Orders** a prueba de *scope creep* en menos de 60 segundos.

- **Dolor real y frecuente:** Las suites tipo PandaDoc, Proposify o Bonsai cobran USD 24–79+/mes y obligan a usar un CRM pesado. Un solo cambio de alcance mal documentado cuesta USD 500–5.000, lo que hace obvio pagar USD 12/mes o USD 79/año.
- **Bucle viral orgánico:** Cada usuario gratuito exporta un PDF tamaño US Letter profesional para mandarle a su cliente con el pie discreto `Prepared with ScopeCraft · scopecraft-sow.vercel.app`. En Pro desaparece por completo y se reemplaza por logo, color y pie confidencial propios.
- **Motor SEO Programático:** 30 páginas estáticas (`/templates/[slug]`) optimizadas con presupuesto típico en EE. UU., trampas de alcance, entregables precargados, FAQ y `JSON-LD` (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`).
- **Calidad técnica y visual verificada en vivo:**
  - `tsc --noEmit` (0 errores), `vitest` (3 suites, 8/8 tests pasando), `next build` sin errores.
  - Auditoría Playwright sobre la URL viva en `1440x900`, `390x844` y `360x800`: **0 px de overflow horizontal** en todas las rutas, **0 errores de consola**, descarga real de PDF verificada (`ScopeCraft_SOW-2026-104.pdf`, 12.176 bytes), links de PayPal verificados, activación Pro con clave real y persistencia tras recargar página.

---

## 2. Canales y activos ya dejados funcionando automáticamente

1. **App en producción en Vercel (proyecto aislado `scopecraft-sow`):** https://scopecraft-sow.vercel.app (con Vercel Analytics activo).
2. **Motor SEO completo e indexación disparada:**
   - `https://scopecraft-sow.vercel.app/sitemap.xml` (33 URLs: Home, `/templates`, `/pricing` y 30 playbooks verticales).
   - `https://scopecraft-sow.vercel.app/robots.txt` y OpenGraph editorial (`/opengraph-image`).
   - **IndexNow ejecutado vía IPv4:** 33 URLs enviadas con éxito (`HTTP/2 200` en `api.indexnow.org/indexnow` y `HTTP/2 202` en `www.bing.com/indexnow`).
3. **Repositorio público en GitHub:** `https://github.com/matiascorrea2024-star/scopecraft-sow` (verificado que `launch_kit/license_keys_500.txt`, `.env*`, `.vercel/` y `audit_screenshots/` **NO** se subieron).
4. **Kit de licencias y lanzamiento en `launch_kit/`:**
   - `launch_kit/license_keys_500.txt`: 500 claves únicas `SC-PRO-XXXX-XXXX-XXXX` listas para entregar (solo sus hashes SHA-256 con salt viven en el código).
   - `launch_kit/editorial_cover_1280x720.png`: portada editorial `1280x720` lista para Product Hunt.
   - `launch_kit/LAUNCH_COPY.md`: textos exactos listos para copiar y pegar.
   - `launch_kit/AUTO_DELIVERY_UPGRADE.md`: paso a paso para automatizar entrega de claves 24/7.

---

## 3. Los únicos 3 clics que quedan para Matías

1. **Google Search Console (1 min):** Entrá a https://search.google.com/search-console, agregá `https://scopecraft-sow.vercel.app` y enviá el sitemap `https://scopecraft-sow.vercel.app/sitemap.xml`.
2. **Publicar el lanzamiento (5 min):** Abrí `launch_kit/LAUNCH_COPY.md` y pegá los textos + la portada `launch_kit/editorial_cover_1280x720.png` en **Product Hunt**, **Hacker News (Show HN)**, **AlternativeTo** e **IndieHackers**.
3. **Automatizar entrega 24/7 cuando entren los primeros pagos (3 min):** Seguí `launch_kit/AUTO_DELIVERY_UPGRADE.md` para cargar las claves restantes en **Payhip** (conectado a tu mismo PayPal) y setear `NEXT_PUBLIC_BILLING_PROVIDER=payhip` en Vercel. Mientras tanto, si alguien te paga directo a `paypal.me/craftappstudio`, le respondés con una línea de `launch_kit/license_keys_500.txt`.
