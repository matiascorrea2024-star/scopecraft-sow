# Reporte Final — ScopeCraft (CraftApp Studio)

**Fecha:** 27 de noviembre de 2026  
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

| Canal / Activo | Estado | Evidencia verificada |
| :--- | :--- | :--- |
| **App en producción (Vercel `scopecraft-sow`)** | Activo | https://scopecraft-sow.vercel.app (con Vercel Analytics y PayPal conectado) |
| **Google Search Console** | Verificado + Sitemap enviado | Propiedad verificada por archivo HTML (`googleeeadd0343e341097.html` + meta tag); `/sitemap.xml` en estado **Correcto** con **33 páginas descubiertas** |
| **IndexNow (Bing / DuckDuckGo / Yandex)** | Enviado | `HTTP/2 200` en `api.indexnow.org/indexnow` y `HTTP/2 202` en `www.bing.com/indexnow` (33 URLs) |
| **Repositorio público en GitHub** | Publicado | `https://github.com/matiascorrea2024-star/scopecraft-sow` (`launch_kit/license_keys_500.txt`, `.env*`, `.vercel/` y `audit_screenshots/` excluidos) |
| **Kit de licencias y lanzamiento (`launch_kit/`)** | Listo | 500 claves en `license_keys_500.txt`, portada `editorial_cover_1280x720.png`, copy en `LAUNCH_COPY.md`, guía Payhip en `AUTO_DELIVERY_UPGRADE.md` |

---

## 3. Estado de directorios externos (chequeados en navegador interno)

Se revisaron los 5 portales en el navegador interno; ninguno tenía sesión iniciada (`LOGIN_REQUIRED`) y no se crearon cuentas ni se saltearon accesos:
- **Hacker News (Show HN):** `https://news.ycombinator.com/submit` — requiere login.
- **Product Hunt:** `https://www.producthunt.com/posts/new` — redirige a login/signup.
- **AlternativeTo:** `https://alternativeto.net/` — `Suggest new application` requiere iniciar sesión.
- **IndieHackers:** `https://www.indiehackers.com/new-post` — redirige a `/sign-in`.
- **Payhip:** `https://payhip.com/` — sin sesión iniciada (`Login` visible).

---

## 4. Los únicos 2 pasos que te quedan (cuando quieras)

1. **Publicar el lanzamiento (5 min):** Iniciá sesión en Product Hunt, Hacker News (`news.ycombinator.com/submit`), AlternativeTo e IndieHackers y pegá los textos de `launch_kit/LAUNCH_COPY.md` junto con `launch_kit/editorial_cover_1280x720.png`.
2. **Automatizar entrega 24/7 al entrar las primeras ventas (3 min):** Seguí `launch_kit/AUTO_DELIVERY_UPGRADE.md` para cargar las claves de `launch_kit/license_keys_500.txt` en Payhip (conectado a tu mismo PayPal) y setear `NEXT_PUBLIC_BILLING_PROVIDER=payhip` en Vercel. Mientras tanto, si te pagan directo por `paypal.me/craftappstudio`, entregás una línea de `launch_kit/license_keys_500.txt`.
