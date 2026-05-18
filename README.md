# ABC Centre — Web

Sitio web oficial de ABC Centre (abccentre.es).  
Desarrollado por **Rankova**.

## Stack
- Next.js 15 · App Router
- Tailwind CSS 3
- next-intl (ES/CA)
- Google Calendar API (stub — ver configuración)

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).  
La ruta raíz redirige a `/es` (castellano por defecto).

## Estructura

```
src/
  app/
    [locale]/       ← Todas las páginas (12)
    api/contact/    ← API route para formulario
    sitemap.ts
    robots.ts
  components/       ← Navbar, Footer, ServiceLanding, BookingForm...
  i18n/             ← Configuración next-intl
  messages/
    es.json         ← Todos los textos en castellano
    ca.json         ← Todos los textos en catalán
  lib/
    google-calendar.ts  ← Integración Google Calendar (stub)
public/
  logos/            ← Logos del Manual d'Estil ABC
  images/           ← Fotos del centro
```

## Google Calendar — Activación

1. Crea un Service Account en Google Cloud Console
2. Comparte los calendarios de las especialistas con el email del Service Account
3. Copia `.env.local.example` a `.env.local` y rellena:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID_*` por cada servicio
4. En `src/lib/google-calendar.ts`, descomenta el código marcado con `// TODO`
5. En `src/app/api/contact/route.ts`, activa la llamada a `createBooking`

## Internacionalización

- **Castellano** `/es` — primario, SEO principal
- **Catalán** `/ca` — secundario, con slugs propios (ver `src/i18n/routing.ts`)
- Todos los textos en `src/messages/{locale}.json`

## Despliegue (Coolify / Hetzner)

```bash
npm run build
npm run start
```

Variables de entorno necesarias en producción: ver `.env.local.example`.

## Logos disponibles

| Archivo | Uso |
|---|---|
| `logos/logo-horizontal.png` | Navbar (fondo claro) |
| `logos/logo-horizontal-white.jpg` | OG image |
| `logos/logo-vertical.png` | Espacios verticales |
| `logos/logo-round.png` | Favicon, redes sociales |
| `logos/logo-simple.png` | Sin subtítulo de servicios |
