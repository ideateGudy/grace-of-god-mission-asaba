# Grace of God Mission Asaba — Monorepo

The official website and administrative portal for **Grace of God Mission Asaba** (No. 33 Arthur Richard Street, Akwuebulu, Cable Point, Asaba, Delta State, Nigeria).

This monorepo is engineered as a high-performance, accessible, and secure digital platform using `pnpm` workspaces, **Next.js 16** (frontend), and **NestJS 12** (backend API), backed by **Neon Serverless PostgreSQL** and **Prisma 7**.

---

## 📁 Monorepo Structure

```text
grace-of-god-mission-asaba/
├── client/              # Next.js 16 frontend (App Router, Tailwind CSS v4, proxy.ts)
├── server/              # NestJS 12 REST API (/api/v1, Prisma 7, Neon Postgres, Cloudinary)
├── packages/
│   └── types/           # Shared TypeScript types & Zod contract schemas (@ggm/types)
├── pnpm-workspace.yaml  # Monorepo workspace configuration
├── gom-asaba-prd.md     # Product Requirement Document (PRD v2.1)
└── README.md            # Monorepo architecture & deployment guide
```

### Workspaces
1. **[`client`](./client)** (`@ggm/client`): Next.js 16 web application featuring the public sanctuary site, sermons library, events calendar, announcements, photo gallery, church fundraising projects, Paystack online giving, visitor planning, and a secure `/admin` management portal.
2. **[`server`](./server)** (`@ggm/server`): NestJS REST API with default-deny role-based authorization, JWT authentication in `httpOnly` cookies, rate-limiting, Cloudinary signed upload signatures, Paystack payment processing & HMAC SHA-512 webhooks, ISR cache revalidation, and Neon Postgres persistence.
3. **[`packages/types`](./packages/types)** (`@ggm/types`): Shared contract defining DTOs, data models, permissions, project schemas, giving schemas, and Zod contracts shared between client and server.

---

## 🌟 Comprehensive Feature Catalog

### 1. Public Church Website (`client`)
- **Sacred Celestial Aesthetics**: Curated midnight and celestial dawn palette (`#0B0D22`, `#141633`, `#D9A441`), glassmorphism, responsive ambient glows, and dark/light mode toggle with WCAG AA contrast compliance.
- **Root Landing Page (`/`)**:
  - Hero banner with sacred sunrise backdrop and direct Google Maps fellowship pill.
  - Quick-info schedule banner (Sunday Services: 7:00 AM; Wednesday Midweek: 5:00 PM).
  - Pinned announcement alerts.
  - Featured sermon showcase with embedded video/audio player.
  - Upcoming events ticker and ministry highlights.
  - Verified bank transfer details with one-click copy buttons.
  - Dedicated interactive **Sanctuary Location & Map** section (`#map`) embedding Google Maps with external navigation links.
- **Plan a Visit (`/visit`)**: Worship schedules, parking availability, first-time guest expectations, FAQ accordion, and interactive church map.
- **About Us (`/about`)**: Church vision, foundational mission, core Biblical beliefs, historical roots, and pastoral leadership profiles.
- **Sermons Library (`/sermons`)**: Media catalog with search, series filter, preacher tags, scripture references, and responsive video/audio streaming.
- **Events & Gatherings (`/events`)**: Tabbed upcoming and past event calendar with dates, times, venues, and one-click `.ics` calendar file downloads.
- **Announcements (`/announcements`)**: Church bulletin with priority badges and pinned alerts.
- **Media Gallery (`/gallery`)**: Photo albums celebrating church milestones, conventions, and worship nights with interactive full-screen image lightbox.
- **Church Projects Hub (`/projects` & `/projects/[slug]`)**:
  - Transparent fundraising showcase for building campaigns, youth centers, and mission outreaches.
  - Real-time progress bars, goal vs. raised amounts in Naira (₦), donor count, and target completion dates.
  - Individual project detail pages with full vision descriptions, embedded contribution widgets, and public supporter feeds (with privacy protection).
- **Online Giving & Tithes (`/give` & `/give/thanks`)**:
  - Secure Paystack integration supporting debit cards, bank transfers, USSD, and Apple Pay.
  - Preset giving amounts (₦1,000, ₦2,500, ₦5,000, ₦10,000, ₦25,000, ₦50,000) with custom input.
  - Fund allocation selector (General Church Giving or specific Church Projects).
  - Anonymity toggle to protect donor identity on public feeds.
  - `/give/thanks`: Digital receipt confirmation screen with real-time Paystack transaction status verification.
  - Direct verified bank account details alongside online giving with one-click copy buttons.
- **Live Broadcast & Sanctuary Stream (`/live`)**:
  - Live broadcast hub supporting responsive 16:9 YouTube and Facebook video streams.
  - Automatic stream URL normalizer (converting watch URLs, short links, and live URLs to privacy-enhanced embeds).
  - Site-wide pulsating **"Live Now"** indicator in both desktop and mobile headers.
  - Interactive service notes, bulletin scripture references, weekly schedule, and quick giving/prayer actions.
  - Graceful offline fallback displaying next service countdown and recent sermons archive.
- **Moderated Community Prayer Wall (`/prayer/wall`)**:
  - Public petitions wall with interactive, debounced **"I Prayed"** counter cached in local storage.
  - Opt-in toggle on the prayer submission form (`/prayer`) allowing members to share anonymized petitions.
  - Privacy-by-design: Public APIs strip all names, phone numbers, and emails at the SQL query level.
- **Praise Reports & Testimonies (`/testimonies`)**:
  - Filterable community testimony gallery with featured cards and author anonymity support.
  - Accessible submission modal (`TestimonyDialog.tsx`) with honeypot bot trap for members to share what God has done.
- **Daily Devotion & Verse of the Day (`/devotion` & `/devotion/[id]`)**:
  - Today's devotional reading with Scripture anchor, pastoral reflection, closing prayer/faith confession, and past devotion archive.
  - Dedicated individual devotion reading view (`/devotion/[id]`) with clean pastoral typography and social sharing.
  - Dynamic daily devotion highlight card on the homepage (`/`).
  - One-click Web Share and clipboard copy with verified canonical domain (`https://ggmasaba.vercel.app/devotion`).
  - Normalized to West Africa Time (`Africa/Lagos`, UTC+1) so devotions strictly align with local congregation calendar days.
- **Broadcast Studio & Live Sanctuary Display (`/studio` & `/studio/live`)**:
  - **Broadcast Switcher Room (`/studio`)**: Vision-mixer-inspired live production console featuring Staged Preview and On-Air Program buses, instantaneous CUT & FADE transitions, and emergency Blackout.
  - **Input Deck Channels**:
    - **1. Countdown Timer**: High-precision sanctuary activity timers and event countdowns with Days, Hours, Minutes, and Seconds (DD:HH:MM:SS), zero-drift epoch synchronization (`targetEndTime`), overtime alerts, and soundboard chimes/warning ticks.
    - **2. Scripture Engine**: Instant Bible verse search and display across KJV, NIV, AMP, NKJV, and Nigerian Pidgin Bible translations.
    - **3. Media Deck**: Slide and liturgical graphic presentations with instant take-to-air.
    - **4. Lower Thirds**: Dynamic speaker names, ministry topics, and liturgical tickers.
    - **5. Camera Feeds**: Integrated webcam, NDI/virtual camera, and smartphone wireless camera feeds via zero-latency WebRTC and high-frequency fallback streams.
  - **Live Sanctuary Output (`/studio/live`)**: Full-screen projector and LED display feed with liturgical theme presets, transparent alpha-keying for downstream overlays, and hardware chroma-green keying.
  - **Multi-Device & Cross-Tab Synchronization**: Zero-latency local cross-window updates via `BroadcastChannel` and resilient multi-device sync via server-sent events (SSE) and HTTP polling.
- **Prayer Requests (`/prayer`)**: Confidential prayer petition submission with optional public wall sharing and honeypot spam protection.
- **Contact & Inquiries (`/contact`)**: Interactive inquiry form with honeypot trap, WhatsApp direct chat link, click-to-call phone dialing, and sanctuary address.
- **Privacy Notice (`/privacy`)**: Transparent privacy policy compliant with the Nigeria Data Protection Act (NDPA 2023).
- **Navigation & Mobile Experience**: Fixed header with church emblem, live streaming pulse badge, categorized dropdown navigation, mobile drawer, and floating quick action bar.
- **Production Error Boundaries**:
  - `app/error.tsx`: Sacred recovery card with "Try again", "Return Home", and error reference tracking.
  - `app/global-error.tsx`: Root-level recovery UI ensuring the application never crashes to a white screen.
  - `app/not-found.tsx`: 404 navigation compass with quick links to Sermons, Events, and Visit.

### 2. Administrative Portal (`/admin`)
- **Protected Network Boundary ([`client/proxy.ts`](./client/proxy.ts))**: Next.js 16 proxy guarding all `/admin/*` routes before rendering.
- **Authentication (`/admin/login`)**: Cookie-based JWT sessions with `httpOnly`, `sameSite=lax`, and `secure` flags.
- **Two-Factor Authentication (TOTP)**: Super-Admin optional 2FA support using authenticator apps (Google Authenticator, Microsoft Authenticator) with emergency CLI recovery tools.
- **Enforced First-Time Password Reset**: Newly provisioned admins are required to update their temporary password at `/admin/account` before accessing any admin tools.
- **Overview Dashboard (`/admin`)**: Real-time KPI statistics for published sermons, upcoming events, active announcements, gallery photos, unread messages, and quick action shortcuts.
- **Content Management Modules**:
  - **Livestream Manager (`/admin/live`)**: Single-toggle **"We Are Live"** instant switch, stream URL configuration, service titles, and bulletin sermon notes (`LIVESTREAM_MANAGE`).
  - **Broadcast Studio Switcher (`/studio`)**: Gated broadcast switcher console accessible to media personnel with `LIVESTREAM_MANAGE` permission or `SUPER_ADMIN`.
  - **Devotions Manager (`/admin/devotions`)**: Schedule and publish daily devotions by calendar date with Scripture references and pastoral reflections (`DEVOTIONS_MANAGE`). Includes an intelligent **Smart Paste & Auto-Detect** modal that automatically parses raw text from WhatsApp, Word, or bulletin drafts into structured fields (series, title, scriptures, reflection, prayer, Bible in 365 days, and action points) with one-click direct save.
  - **Testimonies Moderation (`/admin/testimonies`)**: Review queue (`PENDING`, `APPROVED`, `REJECTED`) with one-click approval, rejection, and homepage feature toggles (`TESTIMONIES_MANAGE`).
  - **Sermons Management (`/admin/sermons`)**: Create, edit, and publish sermons with video URLs, audio links, preacher tags, and scriptures.
  - **Events Management (`/admin/events`)**: Schedule upcoming events, set locations, and publish calendar items with `.ics` exports.
  - **Announcements (`/admin/announcements`)**: Broadcast pinned bulletin notices with publication schedules.
  - **Gallery Management (`/admin/gallery`)**: Upload and organize photo albums with automated Cloudinary CDN delivery.
  - **Hero Banner Editor (`/admin/hero`)**: Manage single slide vs. autoplay carousel banners, customize titles, button links, focal points, and overlays.
  - **Church Projects Management (`/admin/projects`)**: Create and edit fundraising campaigns, upload cover imagery, configure targets in ₦, set deadlines, and track real-time progress.
  - **Offline Giving Recording**: Modal workflow allowing administrators to record direct bank transfers, cheques, and cash gifts against specific projects, updating the transparent donor feed.
  - **Giving & Contributions Ledger (`/admin/contributions`)**: Full audit ledger tracking both Paystack online payments and manual offline contributions, filterable by project and status with financial summary cards and a manual **"Verify with Paystack"** button for resolving dropped webhooks.
  - **Financial CSV Export**: One-click download of the complete contributions journal (`/api/v1/admin/contributions/export`) for external church accounting and financial reconciliation.
  - **Dynamic Site Settings (`/admin/settings`) — *Super Admin Only***: Edit church name, address, Google Maps directions URL, social handles (Facebook, TikTok, YouTube, Instagram), mission, vision, doctrinal beliefs, and pastoral leadership profiles on `/about` with financial integrity warning banners.
- **Community Submissions**:
  - **Contact Messages (`/admin/messages`)**: Review, filter, and archive visitor inquiries with instant automated Resend email alerts.
  - **Prayer Requests**: Dedicated view for pastoral intercession with read status flags and **"Approve for Prayer Wall"** toggle.
- **User & Role Management (`/admin/users`) — *Super Admin Only***:
  - Create administrative users with temporary passwords.
  - Assign roles: `ADMIN` (content manager) or `SUPER_ADMIN` (full platform authority).
  - Assign granular permissions: `SERMONS_MANAGE`, `EVENTS_MANAGE`, `ANNOUNCEMENTS_MANAGE`, `GALLERY_MANAGE`, `HERO_MANAGE`, `PROJECTS_MANAGE`, `GIVING_MANAGE`, `TESTIMONIES_MANAGE`, `DEVOTIONS_MANAGE`, `LIVESTREAM_MANAGE`, `CONTACT_INBOX`, `PRAYER_INBOX`.
  - Deactivate/activate accounts and trigger password resets.
- **Audit Logging (`/admin/audit`) — *Super Admin Only***:
  - Immutable audit trail recording actor, action, entity, entity ID, timestamp, and IP with CSV export.

### 3. Backend REST API (`server`)
- **Prefix & Documentation**: All endpoints versioned under `/api/v1`. Swagger interactive documentation at `/api/docs` in development.
- **Role-Based Access Control (RBAC)**: Strict default-deny policy verified by automated route scanner tests (`@RequirePermissions()`, `@SuperAdminOnly()`).
- **Database & ORM**: Prisma 7 Client with Neon Serverless Postgres adapter, connection pooling (`DATABASE_URL`), and direct connection (`DIRECT_URL`).
- **Cloudinary Signed Uploads**: Generates single-use signed upload parameters (`/api/v1/admin/uploads/signature`) allowing the browser to upload directly to Cloudinary without server memory overhead.
- **Cache Invalidation (ISR)**: On-demand HTTP webhook triggers to Next.js (`/api/revalidate`) using shared secret HMAC validation whenever content is created, updated, or deleted.
- **Resilience & Production Error Handling**:
  - Global `HttpExceptionFilter` with automatic Prisma error code mapping (`P2002` → 409 Conflict, `P2025` → 404 Not Found, `P2003` → 400 Bad Request, `P1001` → 503 Unavailable).
  - Structured request logging with Pino, assigning a unique `x-request-id` to every transaction.
  - Process-level `unhandledRejection` and `uncaughtException` logging.
  - Graceful shutdown hooks (`app.enableShutdownHooks()`).
  - Public health check endpoint at `/api/v1/health` with live database query execution.

### 4. Shared Contract Package (`packages/types`)
- Single source of truth for DTOs, schemas, pagination interfaces, role definitions, and permission flags.
- Full runtime validation via Zod schemas and compile-time TypeScript type safety.

---

## ⚡ Prerequisites

- **Node.js**: v22.0.0 or newer
- **pnpm**: v10.0.0 or newer
- **PostgreSQL**: Neon Serverless Postgres account ([neon.tech](https://neon.tech))
- **Cloudinary**: Cloudinary account for media uploads ([cloudinary.com](https://cloudinary.com))

---

## 🚀 Local Development Setup

### 1. Install Monorepo Dependencies
Run from the root directory:
```bash
pnpm install
```

### 2. Configure Local Environment Files

#### A. Backend Environment (`server/.env`)
```bash
cp server/.env.example server/.env
```
Key configuration values:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:pass@ep-xyz-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
JWT_SECRET="replace-with-a-random-secret-key-at-least-32-chars-long"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN="http://localhost:3000"
SUPER_ADMIN_SEED_EMAIL="admin@graceofgodasaba.org"
SUPER_ADMIN_SEED_PASSWORD="TemporaryPassword123!"
REVALIDATE_SECRET="replace-with-a-long-random-revalidation-secret"
WEB_REVALIDATE_URL="http://localhost:3000/api/revalidate"
IMAGE_ALLOWED_HOSTS="images.unsplash.com,res.cloudinary.com"
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
PRISMA_HIDE_UPDATE_MESSAGE=true
```

#### B. Frontend Environment (`client/.env.local`)
```bash
cp client/.env.example client/.env.local
```
Key configuration values:
```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
API_INTERNAL_URL="http://localhost:5000"
REVALIDATE_SECRET="replace-with-a-long-random-revalidation-secret"
IMAGE_ALLOWED_HOSTS="images.unsplash.com,res.cloudinary.com"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
USE_MOCK_API=false
```

### 3. Initialize Database & Compile Types
```bash
# 1. Compile shared types
pnpm build:types

# 2. Generate Prisma Client and apply migrations
pnpm --filter @ggm/server generate
pnpm --filter @ggm/server migrate:dev

# 3. Seed initial Super Admin account
pnpm --filter @ggm/server seed

# 4. (Optional) Compile all workspaces for production
pnpm build
```

### 4. Start Development Servers
Run concurrently in two terminals:
```bash
# Terminal 1: Backend API (port 5000)
pnpm --filter @ggm/server dev

# Terminal 2: Frontend Client (port 3000)
pnpm --filter @ggm/client dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 🌐 Production Deployment Guide (Vercel & Render)

```mermaid
flowchart LR
    User["Website Visitors & Admins"] -->|"HTTPS Requests"| Vercel["Vercel (Next.js 16 Client)"]
    Vercel -->|"API Proxy /api/v1/*"| Render["Render (NestJS 12 Server)"]
    Render -->|"Pooled Queries (Port 5432)"| Neon[("Neon Serverless Postgres")]
    Vercel -->|"Direct Image Loads"| Cloudinary[("Cloudinary CDN")]
    Render -->|"Signed Upload Signatures"| Cloudinary
```

---

### Phase 1: Database Setup on Neon

1. Log in to [neon.tech](https://neon.tech) and create a project named `grace-of-god-mission-asaba`.
2. From the project dashboard, locate the **Connection Details** widget:
   - Select **Pooled connection**: Copy the connection string. This is your `DATABASE_URL`.
   - Select **Direct connection**: Copy the connection string. This is your `DIRECT_URL`.

---

### Phase 2: Deploy Backend API on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository: `grace-of-god-mission-asaba`.
3. Configure the service settings:
   - **Name**: `ggm-asaba-api` (or your preferred name)
   - **Region**: Choose Frankfurt (EU) or Oregon (US)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (runs from repository root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     pnpm install && pnpm --filter @ggm/types build && pnpm --filter @ggm/server build && pnpm --filter @ggm/server migrate:deploy && pnpm --filter @ggm/server seed
     ```
   - **Start Command**:
     ```bash
     pnpm --filter @ggm/server start:prod
     ```
   - **Plan**: Starter or Free
4. Add the **Environment Variables** in the Render Dashboard:

| Variable | Example / Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production security & optimizations |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz-pooler.neon.tech/neondb?sslmode=require` | Neon Pooled string |
| `DIRECT_URL` | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` | Neon Direct string for Prisma migrations |
| `JWT_SECRET` | *(Random 64-char string)* | E.g. generate via `openssl rand -hex 32` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Short-lived access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Long-lived refresh token lifetime |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (no trailing slash) |
| `SUPER_ADMIN_SEED_EMAIL` | `admin@graceofgodasaba.org` | Initial Super Admin login email |
| `SUPER_ADMIN_SEED_PASSWORD` | *(Strong initial password)* | Seeded on initial deployment |
| `REVALIDATE_SECRET` | *(Random 32-char string)* | Must match frontend `REVALIDATE_SECRET` |
| `WEB_REVALIDATE_URL` | `https://your-frontend.vercel.app/api/revalidate` | On-demand cache invalidation route |
| `IMAGE_ALLOWED_HOSTS` | `images.unsplash.com,res.cloudinary.com` | Allowed remote image hosts |
| `CLOUDINARY_CLOUD_NAME` | *(Your Cloudinary cloud name)* | For sermon/event media uploads |
| `CLOUDINARY_API_KEY` | *(Your Cloudinary API key)* | |
| `CLOUDINARY_API_SECRET` | *(Your Cloudinary API secret)* | |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` (or `sk_test_...`) | Secret key for Paystack transaction initialization and verification |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` (or `pk_test_...`) | Public key for Paystack operations |
| `RESEND_API_KEY` | `re_...` | API key from Resend for email alerts |
| `RESEND_FROM_EMAIL` | `noreply@graceofgodasaba.org` | Verified sending domain email |
| `NOTIFICATION_EMAIL` | `office@graceofgodasaba.org` | Church administration inbox to receive member alerts |
| `REDIS_URL` | `rediss://...` (e.g. Upstash) | Distributed rate limiting across autoscaled instances |
| `THROTTLE_LIMIT` | `2000` | Rate limiting threshold |
| `PRISMA_HIDE_UPDATE_MESSAGE` | `true` | Suppresses RC update notice |

5. Under **Advanced Settings**:
   - **Health Check Path**: `/api/v1/health`
6. Click **Create Web Service**. Once deployed, copy your service URL (e.g., `https://ggm-asaba-api.onrender.com`).
7. **Configure Paystack Webhooks**:
   In your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer) under **Settings → API Keys & Webhooks**:
   - Set **Live/Test Webhook URL** to: `https://<your-render-app>.onrender.com/api/v1/webhooks/paystack`

---

### Phase 3: Deploy Frontend on Vercel

1. Log in to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Import the `grace-of-god-mission-asaba` GitHub repository.
3. Configure the project settings using either of the two standard deployment approaches:

#### Option A: Deploy from Monorepo Root (Recommended)
- **Framework Preset**: `Next.js`
- **Root Directory**: `./` (leave default at repository root)
- **Build and Output Settings**:
  - **Build Command**: Turn toggle **ON** and set to:
    ```bash
    pnpm build:client
    ```
    *(or `pnpm --filter @ggm/client build` — automatically compiles `@ggm/types` first, then runs `next build`)*
  - **Output Directory**: Turn toggle **ON** and set to:
    ```text
    client/.next
    ```
  - **Install Command**: Leave default (`pnpm install`)

#### Option B: Deploy with Root Directory set to `client`
- **Framework Preset**: `Next.js`
- **Root Directory**: Click **Edit** and select **`client`**
- ⚠️ **CRITICAL**: Ensure **"Include source files outside of the Root Directory in the Build Step"** is **CHECKED** (required so Vercel can access `@ggm/types` in `packages/types` and `pnpm-workspace.yaml`).
- **Build and Output Settings**:
  - **Build Command**: Leave toggle **OFF** (Vercel automatically executes `pnpm run build`), OR set to:
    ```bash
    pnpm run build
    ```
    > ⚠️ **Warning**: Do NOT enter `next build` or `pnpm --filter @ggm/types build && next build` directly into the override box. Running bare `next build` bypasses the pnpm executable environment and causes `command not found: next`.
  - **Install Command**: Leave default (`pnpm install`)

4. Add the **Environment Variables** in the Vercel Dashboard:

| Variable | Example / Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://your-frontend.vercel.app` | Canonical production site URL |
| `API_INTERNAL_URL` | `https://ggm-asaba-api.onrender.com` | Your deployed Render backend URL (no trailing slash) |
| `REVALIDATE_SECRET` | *(Same secret set on Render)* | Authenticates on-demand cache purges |
| `IMAGE_ALLOWED_HOSTS` | `images.unsplash.com,res.cloudinary.com` | Allowed domains for Next/Image |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_...` (or `pk_test_...`) | Public Paystack key for browser transactions |
| `USE_MOCK_API` | `false` | Connects frontend to live backend API |

6. Click **Deploy**.

---

### Phase 4: Production Verification & Initial Login

1. **Verify API Health**:
   Visit `https://ggm-asaba-api.onrender.com/api/v1/health` in your browser. It should return:
   ```json
   { "status": "ok", "timestamp": "2026-..." }
   ```
2. **Access Admin Portal**:
   - Navigate to `https://your-frontend.vercel.app/admin/login`.
   - Log in with your `SUPER_ADMIN_SEED_EMAIL` and `SUPER_ADMIN_SEED_PASSWORD`.
   - On first login, you will be automatically prompted to set a permanent, secure password at `/admin/account`.
3. **Emergency Super-Admin Password & 2FA Recovery**:
   - **Password Reset**: If the super-admin password is ever lost in production, open the **Render Shell** and run:
     ```bash
     pnpm --filter @ggm/server cli:reset-super-admin
     ```
     This generates a secure temporary password, clears any active 2FA restrictions, invalidates existing sessions, and sets `mustChangePassword: true`.
   - **2FA Lockout Recovery**: If the administrator loses their authenticator app device, run:
     ```bash
     pnpm --filter @ggm/server cli:reset-2fa [optional-email]
     ```
     This immediately disables 2FA, invalidates tokens, and allows password-only login.
4. **Custom Domain & CORS**:
   If you connect a custom domain (e.g., `https://graceofgodasaba.org`):
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel.
   - Update `CORS_ORIGIN` in Render to match your exact custom domain.
   - Update `WEB_REVALIDATE_URL` in Render to `https://graceofgodasaba.org/api/revalidate`.

---

## 🧪 Testing & Verification

| Command | Workspace | Description |
| :--- | :--- | :--- |
| `pnpm --filter @ggm/* typecheck` | Monorepo | Validates TypeScript across all workspaces |
| `pnpm --filter @ggm/server test` | Server | Runs unit tests and route authorization scanner |
| `pnpm --filter @ggm/server test:e2e` | Server | Runs end-to-end database tests against Neon test branches |
| `pnpm --filter @ggm/client test:styleguide` | Client | Verifies UI components and design tokens in Playwright |
| `pnpm --filter @ggm/client test:e2e` | Client | Full Next.js production build and browser E2E test suite |

---

## 🔒 Security Best Practices

1. **Strict Default-Deny Authorization**: Every `/api/v1/admin/*` endpoint strictly enforces `@RequirePermissions(...)` or `@SuperAdminOnly()`, verified by an automated route scanner test (`route-scan.spec.ts`).
2. **Next.js 16 Network Proxy**: The boundary proxy ([`client/proxy.ts`](./client/proxy.ts)) enforces session presence on all `/admin/*` routes before pages render.
3. **Session Cookies**: Signed tokens in `gom_session` cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
4. **Forced Password Reset**: Newly seeded or reset administrator accounts are forced to reset their temporary password at `/admin/account` before gaining access to other admin features.
5. **Signed Cloudinary Uploads**: Binary files are uploaded directly from the browser to Cloudinary using single-use SHA-1 signatures from the API, preventing server memory bottlenecks.
6. **Graceful Error Recovery**: Client and server global error filters prevent application crashes, scrub sensitive internal messages from 500 responses, and log structured stack traces for diagnostics.
7. **Append-Only Financial Ledger**: Church project fundraising balances are never stored as mutable accumulators; they are derived on-demand via SQL aggregations over the immutable `Contribution` journal (`status = 'SUCCESS'`), guaranteeing zero ledger drift.
8. **Idempotent Payment Reconciliation**: Paystack transaction references enforce a database-level `@unique` constraint in PostgreSQL. Dual reconciliation channels (HMAC SHA-512 signed webhooks and status callbacks) execute idempotent updates protected against race conditions and duplicate delivery. Kobo amounts and currency (`NGN`) are cryptographically reconciled against Paystack's API before status transitions.

---

## 📄 License & Credits

Built for **Grace of God Mission Asaba**.  
Copyright &copy; 2026 Grace of God Mission Asaba. All rights reserved.
