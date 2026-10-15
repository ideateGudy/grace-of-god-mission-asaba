# Grace of God Mission Asaba — Backend API

NestJS backend REST API for Grace of God Mission Asaba. All endpoints are versioned under `/api/v1`. Swagger documentation is available at `/api/docs` outside production. Public health check endpoint is at `/api/v1/health`.

---

## 🚀 Features

- **Database & ORM**: PostgreSQL via Neon, using Prisma 7 with pooled connection strings (`DATABASE_URL`) for runtime traffic and direct connection strings (`DIRECT_URL`) for schema migrations.
- **Default-Deny Authorization**: Strict role-based access control with granular permission checks (`@RequirePermissions(...)`, `@SuperAdminOnly()`).
- **Authentication**: JWT tokens stored in `httpOnly`, `sameSite=lax`, `secure` cookies (`gom_session`) with `tokenVersion` revocation support.
- **Media Uploads**: Secure Cloudinary signed upload generation (`/api/v1/admin/uploads/signature`) ensuring binary payloads never block backend worker threads.
- **Cache Invalidation**: On-demand ISR revalidation requests to the Next.js frontend with shared HMAC secrets.
- **Security & Logging**: Helmet headers, CORS with credentials, Pino structured access logging with sensitive header redaction (`cookie`, `authorization`).

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
| `JWT_EXPIRES_IN` | **Yes** | Standard admin token lifetime (e.g. `10h`, `1d`) |
| `CORS_ORIGIN` | **Yes** | Frontend origin (e.g. `http://localhost:3000`) |
| `SUPER_ADMIN_SEED_EMAIL` | **Yes** | Email for the initial seed super admin |
| `SUPER_ADMIN_SEED_PASSWORD` | **Yes** | Temporary password for the initial seed super admin |
| `REVALIDATE_SECRET` | **Yes** | Secret sent in `x-revalidate-secret` to trigger frontend ISR cache purging |
| `WEB_REVALIDATE_URL` | **Yes** | Full URL to frontend revalidation route (e.g. `http://localhost:3000/api/revalidate`) |
| `IMAGE_ALLOWED_HOSTS` | **Yes** | Comma-separated list of allowed image hosts |
| `CLOUDINARY_CLOUD_NAME` | Optional* | Cloudinary cloud identifier (*required for image uploads) |
| `CLOUDINARY_API_KEY` | Optional* | Cloudinary API key (*required for image uploads) |
| `CLOUDINARY_API_SECRET` | Optional* | Cloudinary API secret (*required for image uploads) |
| `NEON_API_KEY` | Optional** | Neon API key (**required only for running `test:e2e`) |
| `NEON_PROJECT_ID` | Optional** | Neon project ID (**required only for running `test:e2e`) |
| `NEON_PARENT_BRANCH_ID` | Optional | Branch to fork test schemas from (defaults to `main`) |
| `NEON_DATABASE_NAME` | Optional | Source database for test branch creation |

---

## 📜 Database Management & Seeding

```bash
# 1. Generate Prisma Client
pnpm --filter @ggm/server generate

# 2. Run Prisma migrations (uses DIRECT_URL)
pnpm --filter @ggm/server migrate:dev

# 3. Seed initial Super Admin
pnpm --filter @ggm/server seed

# 4. Optional: Reset Super Admin credentials via CLI
pnpm --filter @ggm/server cli:reset-super-admin
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
