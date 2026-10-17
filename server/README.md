# Grace of God Mission Asaba — Backend API

NestJS backend REST API for Grace of God Mission Asaba. All endpoints are versioned under `/api/v1`. Swagger documentation is available at `/api/docs` outside production. Public health check endpoint is at `/api/v1/health`.

---

## 🚀 Features

- **Database & ORM**: PostgreSQL via Neon, using Prisma 7 with pooled connection strings (`DATABASE_URL`) for runtime traffic and direct connection strings (`DIRECT_URL`) for schema migrations.
- **Default-Deny Authorization**: Strict role-based access control with granular permission checks (`@RequirePermissions(...)`, `@SuperAdminOnly()`).
- **Authentication & Security**: JWT tokens stored in `httpOnly`, `sameSite=lax`, `secure` cookies (`gom_session`) with `tokenVersion` revocation support and optional TOTP 2FA.
- **Distributed Rate Limiting**: NestJS Throttler with optional Redis storage (`@nest-lab/throttler-storage-redis` + `ioredis`) for autoscaling multi-instance deployments, with automatic in-memory fallback when `REDIS_URL` is omitted.
- **Church Projects & Online Giving**: Public projects showcase (`/api/v1/projects`), Paystack payment initialization & verification (`/api/v1/giving`), HMAC SHA-512 webhook handler (`/api/v1/webhooks/paystack`), offline gift recording, and financial ledger CSV export (`/api/v1/admin/contributions/export`).
- **Live Broadcast & Stream API (`/api/v1/livestream`)**: Stream management, service titles, bulletin notes, and manual "We Are Live" instant switch.
- **Daily Devotion Engine (`/api/v1/devotions`)**: Daily Scripture reading and pastoral reflection, with automatic West Africa Time (`Africa/Lagos`) calendar day normalization.
- **Community Testimonies Hub (`/api/v1/testimonies`)**: Public submission with honeypot bot trap, status lifecycle (`PENDING`, `APPROVED`, `REJECTED`), and homepage featuring.
- **Moderated Public Prayer Wall (`/api/v1/prayer-wall`)**: Community petitions with interactive "I Prayed" increments, wall moderation toggles, and strict API-level privacy stripping (names, phones, and emails never exposed).
- **Automated Email Notifications**: Direct dispatch via Resend on new member contact inquiries and confidential prayer requests.
- **Append-Only Financial Ledger**: Immutable `Contribution` transaction journal with database-level `@unique` reference constraints, deriving campaign totals on-demand via SQL aggregations with zero ledger drift.
- **Media Uploads**: Secure Cloudinary signed upload generation (`/api/v1/admin/uploads/signature`) ensuring binary payloads never block backend worker threads.
- **Cache Invalidation**: On-demand ISR revalidation requests to the Next.js frontend with shared HMAC secrets.
- **Security & Logging**: Helmet headers, multi-origin CORS with credentials, Pino structured access logging with sensitive header redaction (`cookie`, `authorization`).

---

## 🛠️ Local Setup

### 1. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | **Yes** | `development`, `production`, or `test` |
| `PORT` | **Yes** | API listener port (default `5000`) |
| `DATABASE_URL` | **Yes** | Pooled PostgreSQL URL (`-pooler`) for query execution |
| `DIRECT_URL` | **Yes** | Direct non-pooled PostgreSQL URL for Prisma migrations |
| `JWT_SECRET` | **Yes** | High-entropy random signing key |
| `JWT_ACCESS_EXPIRES_IN` | **Yes** | Short-lived access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | **Yes** | Long-lived refresh token lifetime (e.g. `7d`) |
| `CORS_ORIGIN` | **Yes** | Allowed frontend origins (e.g. `http://localhost:3000,https://ggmasaba.vercel.app`) |
| `SUPER_ADMIN_SEED_EMAIL` | **Yes** | Email for the initial seed super admin |
| `SUPER_ADMIN_SEED_PASSWORD` | **Yes** | Temporary password for the initial seed super admin |
| `REVALIDATE_SECRET` | **Yes** | Secret sent in `x-revalidate-secret` to trigger frontend ISR cache purging |
| `WEB_REVALIDATE_URL` | **Yes** | Full URL to frontend revalidation route (e.g. `http://localhost:3000/api/revalidate`) |
| `IMAGE_ALLOWED_HOSTS` | **Yes** | Comma-separated list of allowed image hosts |
| `PAYSTACK_SECRET_KEY` | Optional* | Paystack Secret API Key (*required for live payment verification & webhooks) |
| `PAYSTACK_PUBLIC_KEY` | Optional | Paystack Public API Key |
| `CLOUDINARY_CLOUD_NAME` | Optional* | Cloudinary cloud identifier (*required for image uploads) |
| `CLOUDINARY_API_KEY` | Optional* | Cloudinary API key (*required for image uploads) |
| `CLOUDINARY_API_SECRET` | Optional* | Cloudinary API secret (*required for image uploads) |
| `RESEND_API_KEY` | Optional* | Resend API key for automated admin email alerts |
| `RESEND_FROM_EMAIL` | Optional* | Verified sending domain email (e.g. `noreply@graceofgodasaba.org`) |
| `NOTIFICATION_EMAIL` | Optional* | Church office inbox to receive alerts |
| `REDIS_URL` | Optional | Upstash or Redis connection string for distributed rate limiting |
| `THROTTLE_LIMIT` | Optional | Max requests per minute threshold (default `2000`) |
| `NEON_API_KEY` | Optional** | Neon API key (**required only for running `test:e2e`) |
| `NEON_PROJECT_ID` | Optional** | Neon project ID (**required only for running `test:e2e`) |
| `NEON_PARENT_BRANCH_ID` | Optional | Branch to fork test schemas from (defaults to `main`) |
| `NEON_DATABASE_NAME` | Optional | Source database for test branch creation |

---

## 📜 Database Management & CLI Tools

```bash
# 1. Generate Prisma Client
pnpm --filter @ggm/server generate

# 2. Run Prisma migrations (uses DIRECT_URL)
pnpm --filter @ggm/server migrate:dev

# 3. Seed initial Super Admin
pnpm --filter @ggm/server seed

# 4. Emergency: Reset Super Admin password via CLI
pnpm --filter @ggm/server cli:reset-super-admin

# 5. Emergency: Reset 2FA status for locked-out administrator via CLI
pnpm --filter @ggm/server cli:reset-2fa [optional-email]
```

---

## 🏃 Running the Server

```bash
# Start in watch mode for development (port 5000)
pnpm --filter @ggm/server dev

# Compile production bundle
pnpm --filter @ggm/server build

# Start production server
pnpm --filter @ggm/server start:prod
```

---

## 🧪 Testing

### Unit & Route Security Tests
Runs Vitest for unit tests, upload signature verification, and the automated route scan:
```bash
pnpm --filter @ggm/server test
```

### Integration E2E Tests (with Neon Branching)
Uses `neon-testing` to automatically create an isolated, ephemeral branch in Neon, runs migrations, executes database tests, and deletes the branch:
```bash
pnpm --filter @ggm/server test:e2e
```
