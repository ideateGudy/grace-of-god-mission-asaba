# Build prompt: Backend (NestJS API) for Grace of God Mission Asaba

Paste this whole document as the first message to the AI coding agent that builds `apps/api` (and the monorepo root and `packages/types`). Attach `gom-asaba-prd.md` alongside it.

---

## 1. Role and mission

You are a senior backend engineer. Build the **Phase 1 API** described in `gom-asaba-prd.md` (v2.1): NestJS + Prisma + Neon Postgres, REST under `/api/v1`, role-based admin access (one `SUPER_ADMIN`, many `ADMIN`s with granted permissions), an admin-managed homepage hero, content CRUD, contact and prayer inboxes, and an audit log.

You do not build the frontend. A separate agent builds `apps/web` against the contract in section 5. You also own the monorepo root and `packages/types`, because the frontend depends on them.

## 2. Read first, in this order

1. `gom-asaba-prd.md`: sections 0, 2, 4.1 to 4.3, 7, 8, 9, 10, 14, 15, 16, 17. This is the source of truth for behaviour.
2. Section 5 of this document (the API contract). Where this prompt is more specific than the PRD, follow this prompt and note it in the README.

`SKILL.md` is a frontend document. Read only to understand what the hero and admin screens need from you.

## 3. Ground rules

- **Phase 1 only.** No Paystack, projects, uploads, email, prayer wall. Keep the code modular so they can be added later.
- **Do not ask questions.** Choose the simplest sensible default and record it in `README.md` under "Assumptions".
- **Never invent church facts.** The API stores no church-specific constants; those live in the web app's `site.ts`. Seed data is clearly marked "SAMPLE".
- **Boring and small.** Fewer dependencies. No GraphQL, no CQRS, no event buses.
- **Default-deny authorisation.** Every `/admin/*` route must declare `@RequirePermissions(...)` or `@SuperAdminOnly()`. A test must fail if one does not.
- **Security is not optional:** validated DTOs (`whitelist: true`, `forbidNonWhitelisted: true`), throttling, Helmet, strict CORS, hashed passwords, no secrets or PII in logs.
- Every step ends with: lint clean, type-check clean, tests passing, README updated. Commit after each step.

## 4. Stack and conventions

- NestJS (TypeScript, current stable), Prisma, class-validator and class-transformer, `@nestjs/throttler`, Helmet, `@nestjs/config` with schema validation that fails fast, Pino or Nest Logger, `@nestjs/swagger` in non-production only. pnpm workspaces. Jest + supertest.
- Neon: `DATABASE_URL` (pooled, `-pooler`) for the app, `DIRECT_URL` for migrations, `sslmode=require`. Handle scale-to-zero: generous connect timeout, one retry on the first connect, never crash on a failed first query.
- Cookie `gom_session`: `httpOnly`, `secure` in production, `sameSite=lax`, `path=/`.
- Timestamps ISO-8601 UTC. Emails lowercased. Nigerian phones normalised to `+234...`. Pagination default 12, max 50.
- Env vars (validate at startup): `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`, `PORT`, `SUPER_ADMIN_SEED_EMAIL`, `SUPER_ADMIN_SEED_PASSWORD`, `REVALIDATE_SECRET`, `WEB_REVALIDATE_URL`, `IMAGE_ALLOWED_HOSTS`. Commit `.env.example`, never `.env`.

## 5. The contract (shared with the frontend agent: do not change without updating `packages/types`)

**Envelope.** Success: `{ "data": T }`. Lists: `{ "data": T[], "meta": { "page", "limit", "total" } }`. Errors: `{ "statusCode", "error", "message": string[], "requestId" }`. Hero list is not paginated: `{ "data": HeroListItem[], "meta": { "liveHeroId": string | null } }`.

```ts
type AdminRole = "SUPER_ADMIN" | "ADMIN";
type Permission =
  | "SERMONS_MANAGE" | "EVENTS_MANAGE" | "ANNOUNCEMENTS_MANAGE" | "GALLERY_MANAGE"
  | "HERO_MANAGE" | "CONTACT_INBOX" | "PRAYER_INBOX";

type SessionUser = {
  id: string; email: string; name: string; role: AdminRole;
  permissions: Permission[];          // SUPER_ADMIN returns the full list
  mustChangePassword: boolean;
};

type AdminUserDto = SessionUser & { isActive: boolean; lastLoginAt: string | null; createdAt: string };

// POST /auth/login {email,password}            -> { data: SessionUser }
// GET  /auth/me                                 -> { data: SessionUser }
// POST /auth/change-password {current,next}     -> { data: SessionUser }
// POST /admin/users {name,email,permissions}    -> { data: { user: AdminUserDto, temporaryPassword: string } }
// POST /admin/users/:id/reset-password          -> { data: { temporaryPassword: string } }

type HeroSlideDto = {
  id?: string; sortOrder: number;
  layout: "FULL_BLEED" | "SPLIT" | "TEXT_ONLY";
  align: "START" | "CENTER" | "END";
  title: string; subtitle: string | null;
  primaryLabel: string | null; primaryUrl: string | null;
  secondaryLabel: string | null; secondaryUrl: string | null;
  bgType: "IMAGE" | "COLOR" | "GRADIENT";
  bgColor: string | null; bgGradient: "dawn" | "daybreak" | "glow" | null;
  imageUrl: string | null; mobileImageUrl: string | null;
  imageAlt: string | null; imageDecorative: boolean;
  focalX: number; focalY: number; overlay: number;     // 0..100, 0..100, 0..80
  textTone: "LIGHT" | "DARK";
};
type HeroDto = {
  id: string; name: string; mode: "SINGLE" | "CAROUSEL";
  autoplay: boolean; intervalSeconds: number;           // 5..15
  published: boolean; startsAt: string | null; endsAt: string | null;
  slides: HeroSlideDto[];                               // 1..6
};
type PublicHero = Omit<HeroDto, "name" | "published" | "startsAt" | "endsAt">;
type HeroListItem = Pick<HeroDto, "id" | "name" | "mode" | "published" | "startsAt" | "endsAt"> & {
  status: "LIVE" | "SCHEDULED" | "DRAFT" | "ENDED";
  slideCount: number; thumbnailUrl: string | null;
};
// GET /hero -> { data: PublicHero | null }
```

**Hero revalidation.** After a hero is created, replaced, published, unpublished, or deleted, `POST ${WEB_REVALIDATE_URL}` with header `x-revalidate-secret: ${REVALIDATE_SECRET}` and body `{ "tag": "hero" }`. Fire-and-forget with a short timeout; a failure is logged and never fails the request.

**Cookies and proxying.** The browser only talks to the web origin; the web app proxies `/api/v1/*` to this API. Treat requests as same-origin from `CORS_ORIGIN`.

## 6. Build sequence

Complete each step fully before the next. Report after each step using the format in section 8.

### B1. Monorepo, tooling, contract package
- pnpm workspace with `apps/api`, `apps/web` (empty placeholder is fine, the frontend agent fills it), `packages/types`.
- ESLint, Prettier, TypeScript project references, GitHub Actions (install, lint, typecheck, test, build for both apps; `pnpm audit` as warning).
- `packages/types`: zod schemas and inferred types for everything in section 5, the `Permission` list, the presets (`CONTENT_EDITOR` = sermons, events, announcements, gallery, hero; `INBOX_ONLY` = contact and prayer inboxes), and the hero layout/background validation matrix (PRD section 7) as a reusable `heroSchema`. Export from the package root. **The frontend imports these; they are the contract.**
- Env validation module that fails fast with clear messages.
- Done when: CI is green on the empty apps and `packages/types` builds.

### B2. Database
- Prisma schema exactly as PRD section 7 (Phase 1 models: `AdminUser` with role, permissions, `isActive`, `mustChangePassword`, `tokenVersion`; content models; `ContactMessage`; `PrayerRequest`; `Hero`; `HeroSlide`; `AuditLog`). Do not migrate Phase 2 models.
- Hand-written SQL in the first migration: the partial unique index guaranteeing a single `SUPER_ADMIN` (PRD section 7).
- Seed script (idempotent): creates the single `SUPER_ADMIN` from `SUPER_ADMIN_SEED_EMAIL`/`PASSWORD` with `mustChangePassword = true`; does nothing if one exists. Optional `--sample` flag adds SAMPLE sermons, events, an announcement, gallery rows, and one SAMPLE hero (unpublished), all clearly labelled.
- Done when: migrate and seed run on a clean Neon branch or local Postgres; inserting a second `SUPER_ADMIN` fails at the database level (test it).

### B3. Auth, RBAC, audit
- `POST /auth/login` (throttled 5/min/IP, generic errors, updates `lastLoginAt`), `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password` (verifies current password, enforces min length 10 or 12 for super-admin, clears `mustChangePassword`, bumps `tokenVersion`, issues a fresh cookie).
- JWT payload only `{ sub, role, tv }`. Expiry: `ADMIN` per `JWT_EXPIRES_IN` (8 to 12h), `SUPER_ADMIN` at most 4h.
- Guards in order: `JwtAuthGuard`, `ActiveUserGuard` (user exists, `isActive`, `tv === tokenVersion`), `PermissionsGuard` with `@RequirePermissions(...)` and `@SuperAdminOnly()`. Permissions are read from the DB on every request, never from the token. `SUPER_ADMIN` passes every permission check.
- A route-scan test that fails if any `/admin/*` handler lacks an authorisation decorator.
- `AuditService.log({ actor, action, entity, entityId, meta })`, safe to call anywhere, never throws into the request, never stores secrets or message bodies. Log sign-ins and password changes.
- A `must-change-password` rule: while `mustChangePassword` is true, every admin route except `/auth/me`, `/auth/logout`, and `/auth/change-password` returns 403 with a clear message.
- Done when: e2e tests cover login success and failure, throttling, cookie flags, 401 vs 403, deactivation and password change invalidating an existing session immediately, and the forced-password-change rule.

### B4. Users and permissions (super-admin only)
- `GET/POST /admin/users`, `GET/PATCH/DELETE /admin/users/:id`, `POST /admin/users/:id/reset-password`, `GET /admin/audit`.
- Create: server generates a strong one-time temporary password, returns it once, stores only the hash, sets `mustChangePassword = true`, role `ADMIN`. Reject creating a `SUPER_ADMIN`.
- Edit: name, permissions (validated against the `Permission` enum), `isActive`. Deactivate and reset bump `tokenVersion`.
- Protect the super-admin: no edit, deactivate, demote, or delete through these endpoints (403 with a clear message).
- Audit every action here.
- Done when: e2e tests prove an `ADMIN` gets 403 on all of these, the super-admin cannot be altered, and permission changes take effect on the very next request.

### B5. Content modules
- Public: `GET /sermons`, `/sermons/:slug`, `/events`, `/events/:slug`, `/announcements`, `/gallery`. Drafts never appear. Announcements respect `publishFrom` and `expiresAt` and sort pinned first. Events `?scope=upcoming|past`. Sermons `?q&series`.
- Admin CRUD for sermons, events, announcements, gallery (with reorder), each guarded by its permission. Auto-generate unique slugs (editable). URL normalisation helpers for YouTube, Facebook, and audio URLs. Validate URLs as http(s).
- Audit publish and delete.
- Done when: e2e tests cover public reads, draft hiding, pagination limits, permission enforcement per resource, and slug uniqueness.

### B6. Hero module
- `GET /hero`: live selection exactly as PRD 6.12.5: published, window contains now, latest `startsAt` wins (empty counts as `createdAt`), tie goes to latest `updatedAt`, none returns `{ data: null }`. Return `PublicHero` only.
- Admin (`HERO_MANAGE`): `GET /admin/hero` (list with computed `status`, `slideCount`, `thumbnailUrl`, and `meta.liveHeroId`), `GET /admin/hero/:id`, `POST /admin/hero`, `PUT /admin/hero/:id` (replace settings and slides in one transaction, preserving order), `PATCH /admin/hero/:id/publish`, `POST /admin/hero/:id/duplicate` (copy as an unpublished draft), `DELETE /admin/hero/:id`.
- Validate with the shared `heroSchema` from `packages/types` plus server-only checks: layout and background matrix; 1 to 6 slides; carousel needs at least 2 to publish; title ≤ 80, subtitle ≤ 200; `#RRGGBB` only; gradient must be a preset key; CTA links are `/` paths (not `//`) or `https://` only; image URLs `https://` on an allowed host from `IMAGE_ALLOWED_HOSTS`; alt text required unless `imageDecorative`; overlay 0 to 80; focal 0 to 100; interval 5 to 15; **WCAG contrast of `bgColor` against the text tone must be at least 4.5:1 to publish** (drafts may save).
- Revalidation call and audit entries (`hero.create`, `hero.update`, `hero.publish`, `hero.unpublish`, `hero.delete`).
- Done when: unit tests cover live selection (window edges, ties, none live, unpublished ignored) and the full validation matrix; e2e tests cover permission enforcement and the atomic replace.

### B7. Inboxes, stats
- `POST /contact` and `POST /prayer-requests` (public, throttled 5/min/IP and 30/hour/IP, honeypot field rejected silently, consent required, text caps). Never log bodies.
- Admin: list and status update for contact (`CONTACT_INBOX`) and prayer (`PRAYER_INBOX`); `DELETE` for both is `SUPER_ADMIN` only and audited.
- `GET /admin/stats`: counts filtered by the caller's permissions (omit fields they cannot access), plus the live hero summary when they have `HERO_MANAGE`.
- Done when: e2e tests cover throttling, honeypot, validation messages, permission separation of the two inboxes, and super-admin-only deletion.

### B8. Hardening and operations
- Helmet, CORS limited to `CORS_ORIGIN`, global `ValidationPipe`, consistent error filter with `requestId`, structured logs, `GET /health` (cheap DB check), Swagger in non-production only, Neon cold-start retry.
- CLI `pnpm --filter api run cli:reset-super-admin`: sets a new temporary password for the super-admin, sets `mustChangePassword`, bumps `tokenVersion`, writes an audit entry. Needs DB access; never exposed over HTTP.
- Done when: smoke e2e passes against a cold database, and the error shape is uniform across all failure types.

### B9. Documentation and handover
- README: local setup, env vars, migrate and seed, running tests, deploy steps for Render and Neon (build: install + `prisma generate` + build; start: `prisma migrate deploy` + start; health check `/health`), secret rotation, super-admin recovery CLI, backup procedure, "Assumptions", fraud warning about bank details staying in web config.
- Done when: a new developer can run, test, and deploy from the README alone.

## 7. Definition of done (whole backend)

- All PRD section 16 acceptance criteria that concern the API pass.
- Exactly one `SUPER_ADMIN` can exist; admins cannot reach `/admin/users` or `/admin/audit`; revocation is immediate.
- Default-deny route-scan test passes. Lint, type-check, unit and e2e tests all pass in CI.
- No secrets in the repo; no PII or message bodies in logs; no `any` in public contracts.
- `packages/types` matches section 5 exactly.

## 8. How to report

After each step, reply with: what you built (a few lines), the commands to verify it, any deviation from this prompt or the PRD with the reason, and assumptions you recorded in the README. Do not start the next step until the current step's checks pass. If something in the PRD conflicts with this prompt, follow this prompt, say so, and continue; do not stop to ask.

## 9. Out of scope (do not build)

Paystack, projects and contributions, file uploads, email sending, Turnstile, public prayer wall, devotion, livestream, site settings in the database, password reset by email, two-factor.
