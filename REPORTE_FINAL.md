# Reporte Final — ScopeCraft (CraftApp Studio)

**Fecha:** 27 de noviembre de 2026  
**Proyecto:** ScopeCraft — Constructor de Statements of Work (SOW) y Change Orders  
**URL en producción:** https://scopecraft-sow.vercel.app  
**Lanzamiento Product Hunt (Programado):** https://www.producthunt.com/products/scopecraft-2/scopecraft-2/prelaunch (Viernes 27 nov, 12:01am PT / 05:01am ART)  
**Repositorio público (GitHub):** https://github.com/matiascorrea2024-star/scopecraft-sow  
**Cobro PayPal activo:** `https://paypal.me/craftappstudio/12USD` (Pass 30 días) y `https://paypal.me/craftappstudio/79USD` (Pass 365 días)

---

## 1. Qué construimos y qué validamos con ChatGPT en equipo

Después de investigar 3 nichos B2B/prosumer en EE. UU. (`RESEARCH.md`), construimos **ScopeCraft** y realizamos una **auditoría iterativa en vivo con ChatGPT** (`https://chatgpt.com/c/6b090735-9eec-83e9-8d05-1013e876b7cf`) sobre el producto real desplegado en Vercel:

- **Estudio arriba del pliegue sin registro:** Constructor de *Statements of Work* y *Change Orders* con exportación PDF US Letter cliente-side (`jspdf`), pie viral discreto en Free (`Prepared with ScopeCraft`) y marca blanca en Pro.
- **Mejoras implementadas tras la auditoría con ChatGPT:**
  1. **Upgrade contextual post-export:** Banner no intrusivo al exportar PDF gratis (`PDF Exported — Ready to Send`) para pasar a Pro sin frenar ni romper la versión gratis.
  2. **Viral loop `Share Summary`:** Botón junto a `Download PDF` que genera un resumen listo para enviar por WhatsApp/Slack/email (Web Share API en celular + portapapeles en compu) con atribución viral en Free.
  3. **Transparencia del Score (`7/7`):** Desglose expandible de las 7 protecciones comerciales y aclaración explícita de alcance comercial (no asesoría legal).
  4. **Claridad de datos demo y cobro PayPal:** Aviso `SAMPLE DATA` + botón `Clear sample parties`, distinción explícita de **pase de 30 días ($12) / 365 días ($79) sin renovación automática sorpresa**, e import/export JSON no destructivo en `Saved`.
- **Verificación técnica y visual en vivo:** `tsc --noEmit` (0 errores), Vitest (`3` suites, `9/9` tests pasando), auditoría Playwright (`1440x900`, `390x844`, `360x800`) con **0 px de overflow**, **0 errores de consola**, descarga real de PDF (`12.176` bytes), links de PayPal verificados y activación Pro persistente.

---

## 2. Estado de todos los canales de distribución

| Canal / Activo | Estado | Evidencia / Resultado |
| :--- | :--- | :--- |
| **App en producción (Vercel `scopecraft-sow`)** | Activo | https://scopecraft-sow.vercel.app (Vercel Analytics + PayPal conectado) |
| **Product Hunt** | **Programado** | `https://www.producthunt.com/products/scopecraft-2/scopecraft-2/prelaunch` — sale hoy Viernes 27 nov 12:01am PT (05:01am ART) con portada `1280x720`, 3 tags (`Productivity`, `Freelance`, `SaaS`), `Free Options` y Maker First Comment guardado |
| **Google Search Console** | **Verificado + Sitemap enviado** | Propiedad verificada por HTML (`googleeeadd0343e341097.html` + meta tag); `/sitemap.xml` en estado **Correcto** con **33 páginas descubiertas** |
| **IndexNow (Bing / DuckDuckGo / Yandex)** | **Enviado** | `HTTP/2 200` en `api.indexnow.org/indexnow` y `HTTP/2 202` en `www.bing.com/indexnow` (33 URLs) |
| **GitHub público** | **Publicado** | `https://github.com/matiascorrea2024-star/scopecraft-sow` (cero secretos ni claves en texto plano) |
| **IndieHackers** | Sesión iniciada (`CraftApp`), restringido por antigüedad | `/new-post` pide dejar algunos comentarios útiles antes de habilitar publicación (o IH+) |
| **AlternativeTo** | Requiere login manual | `Sign in` usa Google OAuth bloqueado por sandbox (`accounts.google.com`) |
| **Hacker News / Payhip** | Requieren login manual | HN usa usuario/contraseña; Payhip requiere login + vincular tu PayPal |

---

## 3. Cuando te despiertes (solo lo que depende de tu cuenta personal)

1. **Product Hunt (ya sale solo a las 05:01am ART):** Durante el día respondé comentarios en `https://www.producthunt.com/products/scopecraft-2?launch=scopecraft-2` usando tu cuenta `@matias_correa`.
2. **IndieHackers / AlternativeTo / Show HN (5 min):** En IndieHackers dejá 2–3 comentarios útiles con tu cuenta `CraftApp` para destrabar `/new-post`, y en AlternativeTo / Hacker News pegá el copy de `launch_kit/LAUNCH_COPY.md`.
3. **Primeras ventas y entrega automática:** Si entra un pago por `paypal.me/craftappstudio`, respondés con una línea de `launch_kit/license_keys_500.txt`. Para automatizar 24/7, seguí los 3 pasos de `launch_kit/AUTO_DELIVERY_UPGRADE.md` con Payhip.
