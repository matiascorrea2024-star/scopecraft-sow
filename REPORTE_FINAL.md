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

## 3. Directorios externos probados con Google OAuth en navegador interno

Intentamos iniciar sesión con tu cuenta `matiascorrea2024@gmail.com` en **Product Hunt**, **AlternativeTo** e **IndieHackers** desde el navegador interno:
- En los tres portales existe el botón **Continue with Google / Google**, pero al hacer clic el entorno de seguridad del navegador interno bloquea la navegación automática del agente hacia `accounts.google.com` (`NAVIGATION_NEEDS_PERMISSION` / host de autenticación protegido).
- **Hacker News** (`https://news.ycombinator.com/submit`) no tiene login con Google (solo usuario/contraseña).
- **Payhip** (`https://payhip.com/`) requiere registro/login y vinculación directa de tu PayPal.

---

## 4. Lo único que queda para que hagas en 5 minutos cuando te despiertes

1. **Publicar con tu clic de Google Login (Product Hunt, AlternativeTo, IndieHackers y Show HN):** Abrí esos sitios en tu navegador, tocá **Continue with Google** con `matiascorrea2024@gmail.com`, y pegá los textos exactos de `launch_kit/LAUNCH_COPY.md` junto con la portada `launch_kit/editorial_cover_1280x720.png`.
2. **Automatizar entrega 24/7 al entrar las primeras ventas:** Seguí `launch_kit/AUTO_DELIVERY_UPGRADE.md` para cargar las claves de `launch_kit/license_keys_500.txt` en Payhip (conectado a tu mismo PayPal) y setear `NEXT_PUBLIC_BILLING_PROVIDER=payhip` en Vercel. Mientras tanto, si te pagan directo por `paypal.me/craftappstudio`, entregás una línea de `launch_kit/license_keys_500.txt`.
