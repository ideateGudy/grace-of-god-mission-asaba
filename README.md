# Grace of God Mission Asaba — Monorepo

The official website and administrative portal for Grace of God Mission Asaba. Built as a high-performance, accessible, and secure monorepo managed with `pnpm` workspaces.

---

## 📁 Monorepo Structure

```text
grace-of-god-mission-asaba/
├── client/              # Next.js 16 frontend (App Router, Tailwind CSS v4, proxy.ts)
├── server/              # NestJS backend API (/api/v1, Prisma 7, Neon Postgres, Cloudinary)
├── packages/
│   └── types/           # Shared TypeScript types & Zod contract schemas (@ggm/types)
├── pnpm-workspace.yaml  # Monorepo workspace configuration
├── gom-asaba-prd.md     # Product Requirement Document (PRD v2.1)
└── README.md            # Monorepo documentation
```

### Workspaces
1. **[`client`](./client)** (`@ggm/client`): Next.js 16 application featuring the public church site, media galleries, sermon catalog, announcements, event calendars, contact/prayer forms, and a secure `/admin` management portal.
2. **[`server`](./server)** (`@ggm/server`): NestJS API offering default-deny role-based authorization, JWT authentication in `httpOnly` cookies, rate-limiting, Cloudinary signed upload signatures, ISR cache revalidation, and Neon Postgres persistence.
3. **[`packages/types`](./packages/types)** (`@ggm/types`): Shared contract defining DTOs, data models, permissions, and Zod schemas shared between client and server.

---

## ⚡ Prerequisites

- **Node.js**: v22.0.0 or newer
- **pnpm**: v10.0.0 or newer (v12 supported)
- **PostgreSQL**: Neon Postgres (pooled connection for runtime + direct connection for migrations)

---

## 🚀 Quickstart & Local Development

### 1. Install Dependencies
Run from the root directory:
```bash
pnpm install
```

### 2. Configure Environment Files

* **Backend (`server/.env`)**:
  Copy the template and fill in your database credentials and secrets:
  ```bash
  cp server/.env.example server/.env
  ```
  Key values:
  - `DATABASE_URL`: Pooled connection string (`-pooler`) for Prisma runtime.
  - `DIRECT_URL`: Direct connection string for Prisma migrations.
  - `JWT_SECRET`: High-entropy signing secret.
  - `CORS_ORIGIN`: `http://localhost:3000`
  - `SUPER_ADMIN_SEED_EMAIL`: Email for initial super admin (e.g. `admin@example.com`).
  - `SUPER_ADMIN_SEED_PASSWORD`: Temporary password for initial super admin.
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For signed image uploads.
  - `NEON_API_KEY`, `NEON_PROJECT_ID`: Required only for running backend E2E tests (`test:e2e`).

* **Frontend (`client/.env.local`)**:
  ```bash
  cp client/.env.example client/.env.local
  ```
  Key values:
  - `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000`
  - `API_INTERNAL_URL`: `http://localhost:5000`
  - `REVALIDATE_SECRET`: Matches `REVALIDATE_SECRET` in `server/.env`.
  - `IMAGE_ALLOWED_HOSTS`: `images.unsplash.com,res.cloudinary.com`
  - `USE_MOCK_API`: `false`

### 3. Initialize Database & Types

```bash
# 1. Compile shared types
pnpm --filter @ggm/types build

# 2. Generate Prisma Client & apply database migrations
pnpm --filter @ggm/server generate
pnpm --filter @ggm/server migrate:dev

# 3. Seed initial Super Admin account
pnpm --filter @ggm/server seed
```

### 4. Start Development Servers

Open two terminals or run concurrently:

```bash
# Terminal 1: Backend API (runs on port 5000)
pnpm --filter @ggm/server dev

# Terminal 2: Frontend Website (runs on port 3000)
pnpm --filter @ggm/client dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs) *(available in non-production mode)*

---

## 🧪 Testing & Verification

| Workspace | Test Command | Purpose |
| :--- | :--- | :--- |
| **Monorepo** | `pnpm --filter @ggm/* typecheck` | Validates TypeScript across all workspaces |
| **Server** | `pnpm --filter @ggm/server test` | Runs unit tests, upload signature tests, and route authorization audit |
| **Server** | `pnpm --filter @ggm/server test:e2e` | Runs E2E database tests against ephemeral Neon test branches |
| **Client** | `pnpm --filter @ggm/client test:styleguide` | Verifies UI components and design tokens in Playwright |
| **Client** | `pnpm --filter @ggm/client test:e2e` | Production build + Playwright browser e2e testing suite |

---

## 🔒 Security Best Practices

1. **Default-Deny Authorization**: Every `/api/v1/admin/*` endpoint strictly enforces `@RequirePermissions(...)` or `@SuperAdminOnly()`, verified by an automated route scanner test (`route-scan.spec.ts`).
2. **Next.js 16 Proxy Layer**: The Next.js 16 boundary proxy ([`client/proxy.ts`](./client/proxy.ts)) enforces session presence on all `/admin/*` routes before pages render.
3. **Session Cookies**: Signed tokens in `gom_session` cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
4. **Forced Password Reset**: Newly seeded or reset administrator accounts are forced to reset their temporary password at `/admin/account` before gaining access to other admin features.
5. **Signed Cloudinary Uploads**: Binary files are uploaded directly from the browser to Cloudinary using single-use SHA-1 signatures from the API, preventing server memory bottlenecks.
