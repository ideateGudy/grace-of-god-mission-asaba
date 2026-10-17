# Grace of God Mission Asaba — Web Client

Next.js 16 frontend for Grace of God Mission Asaba, built with Turbopack, App Router, and Tailwind CSS v4.

---

## 🚀 Features

- **Public Website**:
  - High-impact dawn palette design system with dark/light theme support.
  - **Live Broadcast & Stream Hub (`/live`)**: Responsive 16:9 YouTube and Facebook video player, bulletin notes, countdown, and site-wide pulsating **"Live Now"** indicator in header.
  - **Daily Devotion & Verse of the Day (`/devotion`)**: Today's devotional reading, Scripture anchor, pastoral reflection, closing prayer, archive, and homepage highlight card (normalized to West Africa Time `Africa/Lagos`).
  - **Moderated Community Prayer Wall (`/prayer/wall`)**: Public petitions with debounced, local-storage cached **"I Prayed"** counter and privacy-safe API data stripping.
  - **Praise Reports & Testimonies (`/testimonies`)**: Community praise reports with modal submission dialog (`TestimonyDialog.tsx`).
  - **Interactive Sermons Library (`/sermons`, `/sermons/[slug]`)**: Media catalog with search, series filter, and video streaming.
  - **Events Schedule (`/events`)**: Tabbed calendar with `.ics` downloads.
  - **Church Projects (`/projects`, `/projects/[slug]`)**: Transparent fundraising showcase with live progress bars and donor feed.
  - **Paystack Online Giving (`/give`, `/give/thanks`)**: Cards, bank transfer, USSD, Apple Pay, fund allocation, and instant digital receipt confirmation.
  - **About Us (`/about`)**: Foundational beliefs, history, mission, vision, and dynamic pastoral leadership profiles.
  - **Contact & Prayer Forms**: Interactive forms with honeypot bot trap and WhatsApp resolution.
- **Admin Portal (`/admin`)**:
  - Next.js 16 Network Boundary Proxy ([`proxy.ts`](./proxy.ts)) protecting admin routes.
  - **Livestream Manager (`/admin/live`)**: Single-toggle "We Are Live" instant switch, stream URL, and sermon notes.
  - **Devotions Manager (`/admin/devotions`)**: Author and schedule daily devotions by calendar date.
  - **Testimonies Moderation (`/admin/testimonies`)**: Review queue with one-click approval, rejection, and homepage feature controls.
  - **Prayer Wall Moderation (`/admin/messages`)**: Inbox workflow with wall approval/rejection toggle.
  - **Contributions Ledger (`/admin/contributions`)**: Financial journal with manual "Verify with Paystack" button for recovering dropped webhooks, and CSV export.
  - **Site Settings (`/admin/settings`)**: Super-Admin configuration of church details, social handles, pastoral leadership, and bank accounts with financial integrity warnings.
  - **Two-Factor Authentication (TOTP)**: Authenticator app setup in `/admin/account`.
  - Generic resource management tables with sticky save bars and dirty-state guards.
  - Direct Cloudinary image upload with client-side signatures.
  - Compulsory first-time password reset for newly provisioned admins.
- **Performance & Edge Optimization**:
  - Incremental Static Regeneration (ISR) with stale-while-revalidate (60s–300s).
  - Next.js Edge Image Optimization with AVIF/WebP formats and 1-year immutable cache TTL (`minimumCacheTTL: 31536000`).

---

## 🛠️ Local Development

### 1. Configure Environment Variables
Create a `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL of the website | `http://localhost:3000` |
| `API_INTERNAL_URL` | Internal backend URL for SSR and proxy rewrites | `http://localhost:5000` |
| `REVALIDATE_SECRET` | Secret key for ISR on-demand tag cache purging | *(matches server)* |
| `IMAGE_ALLOWED_HOSTS` | Allowed external image domains for Next.js Image | `images.unsplash.com,res.cloudinary.com` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Public key for Paystack payment processing | `pk_test_...` |
| `USE_MOCK_API` | Set to `false` for real backend API connectivity | `false` |

### 2. Available Scripts

From the repository root:

```bash
# Start development server with Turbopack (port 3000)
pnpm --filter @ggm/client dev

# Typecheck with TypeScript
pnpm --filter @ggm/client typecheck

# Build for production
pnpm --filter @ggm/client build

# Run production build locally
pnpm --filter @ggm/client start

# Run Playwright E2E browser test suite
pnpm --filter @ggm/client test:e2e

# Run isolated styleguide test
pnpm --filter @ggm/client test:styleguide
```

---

## 🌐 API Proxying & Communication

The client proxies all browser calls from `/api/v1/:path*` directly to the backend `${API_INTERNAL_URL}/api/v1/:path*` via `next.config.ts` rewrites:
- Prevents cross-site cookie restrictions.
- Keeps authentication cookies (`gom_session`) scoped cleanly to the site origin.
- Allows direct browser uploads to Cloudinary without overloading Node.js API servers.

---

## 🚢 Deployment to Vercel

When deploying to Vercel:
1. **Root Directory**: Set to `client`.
2. **Framework Preset**: Automatically detected as `Next.js`.
3. **Build Command**: `pnpm --filter @ggm/types build && next build`
4. **Environment Variables**: Add `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`, `REVALIDATE_SECRET`, `IMAGE_ALLOWED_HOSTS`, and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
