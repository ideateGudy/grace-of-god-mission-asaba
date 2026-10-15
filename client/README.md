# Grace of God Mission Asaba — Web Client

Next.js 16 frontend for Grace of God Mission Asaba, built with Turbopack, App Router, and Tailwind CSS v4.

---

## 🚀 Features

- **Public Website**:
  - High-impact dawn palette design system with dark/light theme support.
  - Interactive sermons media catalog with search and series filters.
  - Events schedule with calendar integration (`.ics` downloads).
  - Categorized church photo gallery.
  - Church announcements and visitor planning guide.
  - Contact and Prayer Request forms with honeypot spam protection.
- **Admin Portal (`/admin`)**:
  - Next.js 16 Network Boundary Proxy ([`proxy.ts`](./proxy.ts)) protecting admin routes.
  - Permission-filtered administration shell (`usePermissions`, `<Can>`).
  - Hero banner manager (single slide vs. autoplay carousel with focal points and overlays).
  - Generic resource management tables with sticky save bars and dirty-state guards.
  - Direct Cloudinary image upload with client-side signatures.
  - Compulsory first-time password reset for newly provisioned admins.

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
4. **Environment Variables**: Add `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`, `REVALIDATE_SECRET`, and `IMAGE_ALLOWED_HOSTS`.
