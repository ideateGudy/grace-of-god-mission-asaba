# Build prompt: Frontend (Next.js client) for Grace of God Mission Asaba

Paste this whole document as the first message to the AI coding agent that builds `apps/web`. Attach `gom-asaba-prd.md` and `SKILL.md` alongside it.

---

## 1. Role and mission

You are a senior frontend engineer and product-minded designer. Build the **Phase 1 web app** described in `gom-asaba-prd.md` (v2.1) and styled strictly by `SKILL.md`: a fast, mobile-first church website plus a permission-aware admin area. It must use **shadcn/ui**, support **light and dark themes**, use **glass cards** where the skill allows, favour **reusable components**, and render an **admin-managed hero** (single image or carousel, custom text and background, scheduled).

You do not build the API. A separate agent builds `apps/api`, the monorepo root, and `packages/types`. You consume them through the contract in section 5.

## 2. Read first, in this order

1. `SKILL.md` in full. It governs every visual, theming, glass, component-architecture, hero, and motion decision.
2. `gom-asaba-prd.md`: sections 0, 1, 2, 4, 5, 6, 10, 13, 15, 16, 17.
3. Section 5 of this document (the API contract).

Precedence: `SKILL.md` wins for anything visual or about motion; the PRD wins for behaviour, routes, and permissions; this prompt wins where it is more specific. Note any conflict you resolve in the README under "Assumptions".

## 3. Ground rules

- **Phase 1 only.** No payments, projects, uploads, member portal, prayer wall.
- **Do not ask questions.** Pick the simplest sensible default and record it in the README.
- **Never invent church facts.** Every church-specific value (name wording, address, times, phone, WhatsApp, bank details, leaders, beliefs) lives in `apps/web/src/config/site.ts` as a clearly marked placeholder such as `"[SERVICE TIME - CONFIRM WITH CHURCH]"`. Never present a placeholder as real content. No lorem ipsum, no stock photos of strangers, no fake testimonials.
- **shadcn/ui first.** Check `components/ui` before writing a primitive. Add components through the CLI one at a time. No other component library.
- **Reusable first.** Extract a pattern the second time it appears. Admin CRUD screens are config-driven from `ResourceTable` and `ResourceForm`, never hand-built per page. Every shared component appears in `/styleguide`.
- **Two themes.** Every themed colour is a semantic token or a light/dark pair (`SKILL.md` 3.5). Fixed surfaces (hero slides, footer) keep one colour in both themes.
- **Glass with discipline.** Only the surfaces listed in `SKILL.md` 3.6, only through `GlassCard` or the `glass` utilities, with the opacity, blur, and layer budgets and the solid fallback.
- **Motion budget.** One hero sequence, one sunrise signature, one word-reveal story; everything else is user-triggered. The only autoplay is an admin-enabled hero carousel under `SKILL.md` 4.3.
- **Performance.** Public first-load JS ≤ 150 KB gzipped. Admin components never ship to public pages (route groups). Carousel and lightbox load on demand.
- Every step ends with: lint clean, type-check clean, tests passing, README updated. Commit after each step.

## 4. Stack and conventions

- Next.js (App Router, TypeScript), Tailwind CSS v4, shadcn/ui (`new-york`, CSS variables, lucide), `next-themes`, `lucide-react` (+ `react-icons/fa6` for brand logos only), `react-hook-form` + `zod`, `sonner`, `class-variance-authority`, `clsx` + `tailwind-merge`, Zustand, `motion` (import from `"motion/react"`). pnpm workspaces. Playwright + axe for tests.
- Import schemas and types from `@/…` re-exports of `packages/types`; do not redefine contract types locally.
- Public pages are server components with ISR (60 to 300 s; longer for About and Visit). Admin pages are client-rendered behind auth.
- Browser talks only to the web origin. Add a rewrite from `/api/v1/*` to `API_INTERNAL_URL`. Server components call the API directly with `fetch` and `next: { revalidate, tags }`.
- Locale `en-NG`, dates in `Africa/Lagos`, currency `Intl.NumberFormat('en-NG')`, `<html lang="en-NG" suppressHydrationWarning>`.
- Env: `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL`, `REVALIDATE_SECRET`, `IMAGE_ALLOWED_HOSTS` (feeds `next.config` `images.remotePatterns`). Validate at startup.
- Zustand holds only: mobile nav and modal state, and the admin session snapshot from `GET /auth/me`. Toasts are `sonner`; theme is `next-themes`.

## 5. The contract (owned by the backend agent; do not change, consume)

**Envelope.** Success: `{ "data": T }`. Lists: `{ "data": T[], "meta": { "page", "limit", "total" } }`. Errors: `{ "statusCode", "error", "message": string[], "requestId" }`. Hero list: `{ "data": HeroListItem[], "meta": { "liveHeroId": string | null } }`. Cookie `gom_session` is `httpOnly`; the browser never reads it.

```ts
type AdminRole = "SUPER_ADMIN" | "ADMIN";
type Permission =
  | "SERMONS_MANAGE" | "EVENTS_MANAGE" | "ANNOUNCEMENTS_MANAGE" | "GALLERY_MANAGE"
  | "HERO_MANAGE" | "CONTACT_INBOX" | "PRAYER_INBOX";

type SessionUser = {
  id: string; email: string; name: string; role: AdminRole;
  permissions: Permission[];          // SUPER_ADMIN gets the full list
  mustChangePassword: boolean;
};
// POST /auth/login {email,password} -> { data: SessionUser }
// GET  /auth/me -> { data: SessionUser }          POST /auth/logout
// POST /auth/change-password {current,next} -> { data: SessionUser }
// POST /admin/users {name,email,permissions} -> { data: { user: AdminUserDto, temporaryPassword } }
// POST /admin/users/:id/reset-password -> { data: { temporaryPassword } }

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
  status: "LIVE" | "SCHEDULED" | "DRAFT" | "ENDED"; slideCount: number; thumbnailUrl: string | null;
};
// GET /hero -> { data: PublicHero | null }   (null => render DefaultHero)
```

Other endpoints and their permissions are in PRD section 8. **Revalidation route:** implement `POST /api/revalidate` in the web app. It requires header `x-revalidate-secret` equal to `REVALIDATE_SECRET`, accepts `{ "tag": "hero" }`, calls `revalidateTag`, and returns 200; anything else is 401 or 400.

If the backend is not running yet, develop against a local fixture layer (`USE_MOCK_API=true`, static JSON that matches these types) and keep it out of production builds. Remove the dependency on mocks before you finish.

## 6. Build sequence

Complete each step fully before the next. Report after each step using the format in section 9.

### F1. App scaffold, tokens, shadcn, theming, glass
- Create `apps/web` (if the root workspace exists, only add what is missing). Tailwind v4, `shadcn init`, fonts via `next/font` (Newsreader + Figtree, Latin, `display: swap`), env validation.
- `app/globals.css` per `SKILL.md` 3.1.1: static brand tokens, semantic tokens for `:root` and `.dark`, `@theme inline`, the two-radius mapping, glass tokens and `glass`/`glass-strong` utilities with the solid fallbacks.
- `ThemeProvider` (next-themes, class strategy, system default), `viewport.themeColor` for both schemes.
- Install the initial shadcn set from PRD 4.7.
- Done when: a blank page switches light, dark, and system with no flash; contrast of every token pair is checked and recorded.

### F2. Shared components, layout, styleguide
- Build `components/shared` from the inventory in `SKILL.md` 4.1: `GlassCard`, `Section`, `SectionHeading`, `PageHeader`, `MediaRow`, `DateBlock`, `EventRow`, `EmptyState`, `ErrorState`, `ListSkeleton`, `CopyButton`, `ThemeToggle`, `Logo` (light and dark variants, text-wordmark fallback), the form field family, `OptionCardGroup`, `StatusBadge`, `ConfirmDialog`.
- `components/layout`: `SiteHeader` (condenses to `glass-strong` on scroll, theme toggle), `MobileNav` (shadcn `Sheet`), `QuickActionBar` (Call, WhatsApp, Directions, safe-area aware), `SiteFooter`, skip link.
- Dev-only `/styleguide`: tokens, every shared component with its variants and states, theme toggle, and a contrast check list.
- Done when: the styleguide renders correctly at 360, 768, 1280 in both themes; keyboard-only navigation works; reduced motion and reduced transparency fallbacks verified.

### F3. Motion and hero components
- `components/motion`: `MotionProvider` (`reducedMotion="user"`), `HeroSequence`, `Reveal`, `ScrollProgress`, `ParallaxImage`, `SunriseBackdrop` (theme-aware version from the skill), `WordReveal`. Obey the motion budget and reduced-motion rules.
- `components/hero`: `HeroRenderer` (server), `HeroSlideView` (three layouts, alignment, focal point, overlay, text tone, gradient presets as token classes), `HeroCarousel` (client island on shadcn `Carousel`, loaded with `next/dynamic` only for carousels; autoplay rules, pause button, glass controls, ARIA, `inert` off-screen slides, fixed shared height), `DefaultHero` (from `site.ts`).
- Styleguide gets a hero gallery: every layout, single, carousel with and without autoplay, both themes, mobile and desktop.
- Done when: all combinations render at 360px without layout shift; the first slide image uses `priority`; autoplay is off under reduced motion; Single heroes ship no carousel JS.

### F4. API client and public pages
- Typed `lib/api` client (server fetch with revalidate and tags; client fetch through the proxy), consistent error handling, "waking up" state with one automatic retry for cold starts.
- Pages per PRD section 6 and `SKILL.md` section 9: Home (hero from `GET /hero` or `DefaultHero`, service times, latest sermon, events, pinned announcement, about blurb, prayer and give CTAs), About, Visit, Sermons (list, search, series filter, detail with YouTube facade and audio fallback), Events (list, detail, `.ics`), Announcements, Gallery (masonry plus accessible lightbox, loaded on demand), Give (copy buttons), Privacy, 404, error boundaries.
- Use each content type's fitted form from `SKILL.md` section 4 (date-led event rows, media rows, typographic announcements, mosaic gallery). Use `GlassCard` only where the skill allows.
- SEO: Metadata API, canonical, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (`Church`/`Organization`, `Event`, `VideoObject`).
- Done when: every page renders at 360px in both themes with no horizontal scroll; empty and error states exist; a draft or missing API degrades gracefully.

### F5. Public forms
- Contact and Prayer: shadcn `Form` with the shared zod schemas, honeypot, consent line linking to Privacy, inline validation on blur, helpful error text, disabled-while-submitting, success panel, throttling message shown kindly. Prayer "keep private" checked and locked.
- Done when: submissions reach the API once; the friendly rate-limit message appears when throttled; both forms pass axe in both themes.

### F6. Admin foundation
- `(admin)` route group, proxy (cookie presence), login page (`GlassCard`), session hydration from `GET /auth/me` into the Zustand store, `usePermissions` and `<Can>`, `AdminShell` (sidebar from 1024px, compact nav on mobile, theme toggle, sign out). Nav items appear only for permitted areas. Direct URL access to a forbidden area shows a clear "not allowed" state, not a blank page.
- Forced change-password: if `mustChangePassword`, redirect everything to `/admin/account` until done.
- Build the generic kit: `ResourceTable` (search, status badge, row actions, cards under 640px, loading and empty states) and `ResourceForm` (RHF + zod, sticky save bar, dirty-state guard). Both are configured per resource.
- Done when: login, logout, session expiry handling, and forced password change all work; the kit is in the styleguide.

### F7. Admin content, inbox, dashboard
- Sermons, events, announcements, gallery: each is a thin config over `ResourceTable` and `ResourceForm` (slug auto-generation, `datetime-local` inputs in `Africa/Lagos`, preview link, confirm-delete). No custom table or form markup per resource.
- Inbox with Contact and Prayer tabs shown per permission; unread first; mark read, archive, copy details. Super-admin only: "Delete permanently" with `ConfirmDialog`.
- Dashboard: counts and quick-adds filtered by permission; "what visitors see now" hero summary; super-admin extras.
- Done when: a sermon can be published from a phone in under two minutes; a user lacking a permission sees neither the nav item nor the actions.

### F8. Hero manager
- `/admin/hero` list: status badges (Live now, Scheduled for…, Draft, Ended), thumbnail, "what visitors see now" banner (from `meta.liveHeroId`), actions edit, duplicate, publish/unpublish, delete.
- `HeroEditor` per PRD 6.12.5: settings (name, mode via `OptionCardGroup`, autoplay and interval, schedule in `Africa/Lagos`, publish switch), slides (add up to 6, move up/down, duplicate, delete), slide form (layout option cards, alignment, text, two buttons with a site-page picker or custom `https://` URL, background: image with alt, focal and overlay sliders and optional mobile image, or colour swatches plus hex, or gradient preset; text tone), live preview using the real `HeroRenderer` with Mobile and Desktop toggles.
- Client-side validation with the shared `heroSchema`, plus a live contrast badge for colour backgrounds and an overlay warning for images. Show server validation errors on the right fields. Save replaces the whole hero via `PUT`.
- Done when: staff can create a three-slide carousel, then create a scheduled single-image hero for tomorrow, preview both on mobile and desktop, publish, and see the live one on Home after revalidation; invalid combinations cannot be published.

### F9. Users, permissions, audit, account
- `/admin/users` (super-admin only): list with status and permission chips, create (name, email, preset picker, `PermissionPicker`), one-time temporary password dialog with `CopyButton` (shown once, then gone), edit permissions and active state, reset password, delete, all behind `ConfirmDialog` where destructive. The super-admin's own row is read-only.
- `/admin/audit` (super-admin only): paginated, filter by actor and entity.
- `/admin/account`: change password; theme choice.
- Done when: a super-admin creates a limited admin; that admin signs in, is forced to change the password, and sees only permitted areas; revoking a permission removes access on the next request.

### F10. Quality pass and handover
- Accessibility: WCAG 2.2 AA, axe clean on key public and admin pages **in both themes**; keyboard-only flows; focus management in sheet, dialogs, lightbox; touch targets ≥ 44px.
- Performance: Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility and SEO on Home; public bundle ≤ 150 KB gzipped (bundle analyzer, investigate over 130 KB); verified at 4x CPU slowdown and Slow 4G; the `SKILL.md` pre-ship review (section 12) answered in writing in `docs/design-plan.md`.
- Tests: Playwright smoke tests (home loads, sermons list, contact submit, admin login, create sermon, super-admin creates admin with limited permissions, hero carousel replaced by single hero, forced password change), axe checks in light and dark, a styleguide render test.
- README: run, test, build, env vars, deploy on Vercel (root `apps/web`, env vars, API rewrite), `site.ts` placeholder checklist for the church, brand-asset swap guide, "Assumptions".
- Done when: all checks above pass in CI and a new developer can run and deploy from the README.

## 7. Easy-to-miss requirements (verify before finishing)

- A `dark:` utility never appears without its light counterpart, and no raw `text-white`, `bg-white`, `text-black`, `bg-black`, or `[#hex]` sits on a themed surface without its pair. Hero slides and the footer are the only fixed surfaces.
- `indigo` is never used for text or UI on the dark background; use `indigo-soft` or `primary`.
- Focus ring is indigo in light and gold in dark (the `ring` token).
- Glass: at most three blurred layers on a phone, no blur on list rows or scroll-animated elements, solid fallback under reduced transparency and reduced data.
- The first hero slide title is the page `h1`; later slides use `h2`. Carousel region, slide labels, and pause control follow `SKILL.md` 4.3.
- Hero image alt text is required unless marked decorative; hero images use `sizes="100vw"` and the focal point as `object-position`.
- Admin UI hides what the user cannot do, but never assume the UI is the security boundary; handle 401 (sign-in) and 403 (not allowed) from the API everywhere.
- Public pages never import admin-only components; forms libraries load only where forms exist.
- All times shown in `Africa/Lagos`; phone inputs accept `0803…` and `+234803…`.

## 8. Definition of done (whole frontend)

- All PRD section 16 criteria that concern the web app pass, on 360px, with keyboard-only navigation, in light and dark.
- Every shared component is in `/styleguide`; admin lists and forms come from `ResourceTable` and `ResourceForm`.
- Hero works for single, carousel, scheduled, and none-live cases, with the default hero fallback.
- Lint, type-check, and tests pass in CI; no console errors; no hard-coded church facts outside `site.ts`.

## 9. How to report

After each step, reply with: what you built (a few lines), how to verify it (commands and routes), screenshots or notes for 360px light and dark if you can produce them, any deviation from this prompt, the PRD, or `SKILL.md` with the reason, and assumptions recorded in the README. Do not start the next step until the current step's checks pass. If documents conflict, apply the precedence in section 2, say so, and continue; do not stop to ask.

## 10. Out of scope (do not build)

Online giving, project fundraising, uploads, member accounts or portal, public prayer wall, devotion, livestream page, newsletter, site settings editor, password reset by email, two-factor, internationalisation.
