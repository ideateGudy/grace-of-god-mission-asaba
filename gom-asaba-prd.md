# PRD and Build Prompt: Grace of God Mission Asaba Website

Version 2.1 · Stack: Next.js (Tailwind v4 + shadcn/ui) + NestJS + Neon Postgres · Hosting: Vercel (web), Render (API), Neon (database)

**Revision notes (v2.1)**
- UI is built on shadcn/ui with a reusable-first component architecture (section 4.7).
- Light and dark themes and glass surfaces are Phase 1 (sections 4.7, 6; `SKILL.md` 3.5 and 3.6).
- Roles: one `SUPER_ADMIN` who manages admins and permissions, plus `ADMIN`s with granted permissions (sections 2, 6.12.6, 7, 9).
- The homepage hero is managed in the admin: layouts, single or carousel, scheduling, custom text and background (sections 6.1, 6.12.5, 7, 8; `SKILL.md` 4.3).
- The audit log moves from Phase 2 to Phase 1.
- Decisions made without asking (record them in the README under "Assumptions"): Tailwind v4; `lucide-react` is the UI icon family with `react-icons/fa6` for brand logos only; new admins default to the "Content editor" preset, which includes `HERO_MANAGE`; a hero is replaced as a whole document on save; admin-entered image URLs must come from an allow-listed host list until Phase 2 uploads exist.

---

## 0. Instructions to the AI builder (read first)

You are a senior full-stack engineer and product-minded designer. Build the product described here in phases. Rules:

1. **Build Phase 1 (MVP) only** unless told otherwise. Phases 2 and 3 are specified so the code stays modular, not so you build them now.
2. **Do not ask questions.** Where something is unspecified, choose the simplest sensible default and record it in `README.md` under "Assumptions".
3. **Never invent facts** about the church: names, history, addresses, phone numbers, service times, bank details, doctrine, leaders. Put every church-specific value in `apps/web/src/config/site.ts` as clearly marked placeholders, e.g. `"[SERVICE TIME - CONFIRM WITH CHURCH]"`. Never present a placeholder as real content. Sample seed content (including sample hero slides) must be labelled "SAMPLE" in the admin.
4. **Follow the frontend skill** in `SKILL.md` (premium UI, theming, glass, reusable components, hero, scroll animation) for every visual and motion decision.
5. **Use shadcn/ui first and build reusable.** Check `components/ui` before writing a primitive, compose shared components from it, and extract a pattern the second time it appears (`SKILL.md` 4.1). Admin CRUD screens are built from generic `ResourceTable` and `ResourceForm` components, not hand-built per page.
6. Prefer boring, proven solutions. Fewer dependencies, smaller bundles, simpler code.
7. Every phase ends with: lint clean, type-check clean, tests passing, README updated.

---

## 1. Product overview

**Church:** Grace of God Mission Asaba, Asaba, Delta State, Nigeria.
**Facebook:** https://www.facebook.com/people/Grace-of-God-mission-Asaba-Division/61594831403921/
(The page name includes "Division", so the church may be part of a larger body. Do not state or imply any parent organisation unless it appears in `site.ts`.)

**Problem.** The church's online presence lives on social media. Visitors cannot easily find service times, location, sermons, or events; announcements get lost; there is no owned, searchable home.

**Goal.** A fast, mobile-first, trustworthy website that is the church's digital front door, plus a small admin area so non-technical staff can update content without a developer.

**Primary audience.** Congregants and first-time visitors in and around Asaba, mostly on mid-range Android phones with slow or costly mobile data. Secondary: diaspora members and relatives.

**Primary jobs to be done**
- A visitor finds when and where the church meets, and can get directions in one tap.
- A member watches or listens to a sermon they missed.
- A member sees upcoming events and announcements.
- Anyone can send a prayer request or a message privately.
- Anyone can find the church's giving details.
- Staff can publish a sermon or event in under two minutes from a phone.
- Staff can change the homepage hero (a carousel one day, a single image the next, with their own text and background) without a developer.
- The pastor (super-admin) can give staff access to exactly the tasks they need and take it away instantly.

**Non-goals (MVP).** Payment processing, public member accounts (admin accounts exist), file uploads, livestream hosting, mobile app, multi-branch management, email marketing.

**Success metrics (first 90 days)**
- Home page Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- Admin can publish content without developer help.
- Church name + "Asaba" appears in search results with correct service info.
- Contact and prayer forms work end to end with zero lost submissions.

---

## 2. Users and roles

Two admin roles and a granular permission list. **Basic tasks** are day-to-day content and inbox work. **System-level** is everything about who has access and the integrity of the data.

| Capability | Visitor | `ADMIN` | `SUPER_ADMIN` |
|---|---|---|---|
| Read public pages, submit contact and prayer forms | yes | yes | yes |
| Sign in to `/admin`, view dashboard (counts limited to what they may access) | no | yes | yes |
| Sermons, events, announcements, gallery: create, edit, unpublish, delete | no | if granted | yes |
| Homepage hero: create, edit, schedule, publish | no | if granted (`HERO_MANAGE`) | yes |
| Contact inbox and prayer inbox: read, mark read, archive | no | if granted | yes |
| Change own password, choose theme | no | yes | yes |
| Create, edit, deactivate, delete admins; reset their passwords | no | no | yes |
| Grant and revoke permissions | no | no | yes |
| View the audit log | no | no | yes |
| Permanently delete a contact message or prayer request (data-deletion requests) | no | no | yes |
| Site settings (Phase 2) | no | no | yes |

Rules:
- Exactly **one** `SUPER_ADMIN` exists. It is created by the seed script, enforced by a partial unique index in the database and by a service check. It cannot be created, deactivated, demoted, or deleted through the API.
- Permissions (`SERMONS_MANAGE`, `EVENTS_MANAGE`, `ANNOUNCEMENTS_MANAGE`, `GALLERY_MANAGE`, `HERO_MANAGE`, `CONTACT_INBOX`, `PRAYER_INBOX`) are stored per `ADMIN` and checked by the API on every request. `SUPER_ADMIN` implicitly holds all of them. `PRAYER_INBOX` is separate from `CONTACT_INBOX` because prayer requests are sensitive.
- Presets for the create-admin form: **Content editor** (sermons, events, announcements, gallery, hero), **Inbox only** (contact and prayer inboxes), **Custom**.
- There is no public sign-up. Only the super-admin creates admins.

## 3. Scope and phases

### Phase 1: MVP (build now)

| Area | Feature |
|---|---|
| Public site | Home (with admin-managed hero), About, Services and Location, Sermons (list + detail), Events (list + detail), Announcements, Gallery, Contact, Prayer Request, Give (bank details display), Privacy, 404; light and dark themes |
| Admin | Secure login; single `SUPER_ADMIN` who manages admin users, permissions, and the audit log; `ADMIN`s with granted permissions do CRUD for sermons, events, announcements, gallery, and the homepage hero (layouts, carousel, scheduling); inbox for contact messages and prayer requests with read/archive; dashboard counts; forced password change on first login |
| Platform | shadcn/ui design system with reusable shared components, light/dark theming, glass surfaces, scroll animation, SEO, sitemap and robots, rate limiting, input validation, RBAC guards, audit log, health check, seed script, CI |

### Phase 2: Growth (spec included, do not build yet)

- Project fundraising: public project cards with goal and progress bar; admin records offline (bank transfer/cash) contributions; transparent contribution feed with opt-in naming.
- Online giving with Paystack (cards, bank transfer, USSD) feeding the same projects and general giving.
- Email notifications to admin on new prayer/contact messages.
- Image uploads (Cloudinary or S3-compatible) replacing pasted URLs, including hero images.
- Site settings editable in admin (super-admin only), audit-log filters and CSV export, password reset by email, optional two-factor for the super-admin.
- Bot protection on public forms (Turnstile or similar).

### Phase 3: Engagement (outline only)

- Moderated public prayer wall with "I prayed" counter.
- Testimony submissions (text first, voice notes later) with approval.
- Daily devotion/verse of the day.
- Livestream page with manual "We are live" toggle.
- Newsletter, WhatsApp broadcast integration, member directory/portal, multi-branch.

**Principle:** every Phase 2 and 3 feature must be addable without rewriting Phase 1 (new modules, new tables, additive migrations).

---

## 4. Tech stack and architecture

### 4.1 Stack (fixed)

- **Web:** Next.js (App Router, TypeScript, current stable), Tailwind CSS v4, **shadcn/ui** (Radix primitives, `new-york` style, CSS variables), `next-themes`, `lucide-react` (plus `react-icons/fa6` for brand logos only), `react-hook-form` + `zod`, `sonner`, `class-variance-authority`, `clsx` + `tailwind-merge`, Zustand, `motion` (import from `"motion/react"`). Embla comes with the shadcn `carousel`.
- **API:** NestJS (TypeScript), REST under `/api/v1`, Prisma ORM, class-validator/class-transformer, `@nestjs/throttler`, Helmet, `@nestjs/config`, Pino or Nest Logger.
- **Database:** Neon serverless Postgres.
  - `DATABASE_URL`: pooled connection (host contains `-pooler`) for the running app.
  - `DIRECT_URL`: direct connection for Prisma migrations.
  - Add `sslmode=require`. Handle scale-to-zero cold starts: connect timeout generous, one retry on first connect, never crash the API on a failed first query.
- **Hosting:** Vercel for `apps/web`; Render Web Service for `apps/api`; Neon for the database.
- **Tooling:** pnpm workspaces (default), ESLint, Prettier, Husky + lint-staged (optional), GitHub Actions CI.

### 4.2 Repository layout

```
/apps/web                 Next.js app
  src/app/(public)/         public routes (server components, ISR)
  src/app/(admin)/          admin routes (client, auth-gated)
  src/components/ui/        shadcn/ui primitives (CLI-generated)
  src/components/shared/    reusable composites (GlassCard, Section, PageHeader, form fields, ThemeToggle, ...)
  src/components/layout/    site header/footer, mobile sheet, quick-action bar, admin shell
  src/components/hero/      HeroRenderer, HeroSlideView, HeroCarousel, DefaultHero
  src/components/features/  sermons, events, announcements, gallery (public, props only)
  src/components/admin/     ResourceTable, ResourceForm, HeroEditor, UserForm, PermissionPicker
  src/components/motion/    motion wrappers (SKILL.md section 5)
  src/lib/  src/store/  src/config/site.ts
/apps/api                 NestJS app (modules: auth, users, hero, sermons, events, announcements,
                          gallery, messages, audit, health)
/packages/types           shared zod schemas and types (Permission list, presets, hero schema),
                          so web and API validate identically (recommended)
README.md
SKILL.md                  frontend design skill
```

### 4.3 Rendering and data strategy

- Public pages are **server components** that fetch from the API with revalidation (ISR, 60 to 300 seconds; longer for About/Services). If the API is cold or down, serve the last cached page and show a graceful message for uncached ones.
- Admin pages are client-rendered behind auth; they call the API through same-origin routes.
- **Cookies and domains:** the web (Vercel) and API (Render) live on different domains, which breaks cookies in Safari and with third-party cookie blocking. Therefore proxy the API through Next.js rewrites so the browser only talks to `/api/v1/*` on the web origin. Cookies are `httpOnly`, `secure`, `sameSite=lax`. If a custom domain exists, an `api.` subdomain is an acceptable alternative.
- Forms post to the API through the same proxy. Use Next.js server actions or route handlers only if they reduce complexity; otherwise plain `fetch`.
- The hero is fetched with `GET /hero`, `revalidate: 60`, cache tag `hero`. After a hero is published, unpublished, edited, or deleted, the API calls a secret-protected web route (`/api/revalidate`, `REVALIDATE_SECRET`) to refresh the tag immediately; if that call fails, the 60 second window still applies.

### 4.4 State management (Zustand rules)

Zustand holds **client UI state only**:
- mobile nav open/closed and active modal (`useUiStore`);
- admin session snapshot (`user`, `role`, `permissions`, `status`) hydrated from `GET /auth/me`, read by `Can` and `usePermissions`;
- ephemeral form wizard state.

Toasts use `sonner`, not Zustand. Theme is owned by `next-themes`. Do **not** put server data (sermons, events, hero) in Zustand. Fetch on the server or use plain fetch + local state in admin tables. Keep stores small, one per concern, in `src/store/`.

### 4.5 Icons

`lucide-react` is the single UI icon family (shadcn/ui's default), imported per icon (never whole packs). Brand logos Lucide does not ship (Facebook, YouTube, WhatsApp, Instagram) come from `react-icons/fa6`, per icon, in social and contact links only. No emoji as UI icons.

### 4.6 Animation

Use `motion/react` per `SKILL.md`. Motion components need `"use client"`; wrap them in small reusable components so pages stay server components. Menus, dialogs, accordions, and toasts use the built-in animation of shadcn/Radix rather than custom motion code.

### 4.7 UI system (shadcn/ui, theming, glass, reuse)

Full detail is in `SKILL.md` sections 3.1 to 3.6 and 4.1. Summary:

- **shadcn/ui** is initialised with `pnpm dlx shadcn@latest init` (style `new-york`, CSS variables on, icon library lucide). Components are added one at a time as needed. Initial set: `button`, `card`, `badge`, `input`, `textarea`, `label`, `form`, `select`, `checkbox`, `switch`, `radio-group`, `slider`, `tabs`, `dialog`, `alert-dialog`, `sheet`, `dropdown-menu`, `accordion`, `table`, `skeleton`, `separator`, `sonner`, `carousel`, `tooltip`, `pagination`.
- **Theming:** `next-themes` (class strategy, system default, no flash). Brand tokens are static; shadcn semantic tokens flip between light and dark. Every themed colour is a semantic token or a light/dark pair (`SKILL.md` 3.5). A `ThemeToggle` sits in the public header, the mobile sheet, and the admin shell.
- **Glass:** `glass` and `glass-strong` utilities and a `GlassCard` component, used only on the surfaces listed in `SKILL.md` 3.6, with contrast, blur, and layer budgets and a solid fallback.
- **Reuse:** `components/ui` (vendor layer) then `components/shared` then `features`/`admin`. Rule of two for extraction. Admin CRUD is built from `ResourceTable` and `ResourceForm` driven by per-resource config. Every shared component appears in `/styleguide` in both themes.
- **Bundle discipline:** public routes never import admin-only components (route groups); form libraries load only on pages with forms; the carousel and lightbox load on demand.

## 5. Information architecture

```
/                       Home
/about                  About (story, vision, beliefs, leadership)
/visit                  Services and location (times, map, directions, what to expect)
/sermons                Sermon list (search, filter by preacher/series)
/sermons/[slug]         Sermon detail
/events                 Upcoming events (past events collapsed)
/events/[slug]          Event detail
/announcements          Announcements
/gallery                Photo gallery
/contact                Contact form + details
/prayer                 Prayer request form
/give                   Giving details (bank transfer info)
/privacy                Privacy notice
/admin                  Dashboard (protected; content depends on permissions)
/admin/login
/admin/account          change own password (forced on first login), theme
/admin/sermons          list/new/[id]            needs SERMONS_MANAGE
/admin/events           list/new/[id]            needs EVENTS_MANAGE
/admin/announcements    list/new/[id]            needs ANNOUNCEMENTS_MANAGE
/admin/gallery                                   needs GALLERY_MANAGE
/admin/hero             list/new/[id]            needs HERO_MANAGE
/admin/messages         contact + prayer inbox (tabs shown per CONTACT_INBOX / PRAYER_INBOX)
/admin/users            list/new/[id]            SUPER_ADMIN only
/admin/audit            audit log                SUPER_ADMIN only
```

Primary navigation: Home, About, Visit, Sermons, Events, Give, plus a theme toggle; "Contact" and "Prayer" as header actions or in the footer and a persistent mobile quick-action bar (Call, WhatsApp, Directions).

---

## 6. Page specifications (Phase 1)

For every page: semantic landmarks, unique `<title>` and meta description, Open Graph image, loading skeletons for client fetches, friendly empty and error states, no layout shift, correct in both light and dark themes, built from shared components.

### 6.1 Home
1. **Hero:** rendered by `HeroRenderer` from the live hero managed in the admin (6.12.5): single or carousel, layouts full-bleed, split, or text only, custom text and background. When no hero is live it renders the built-in default: church name, one welcoming line, primary CTA "Plan your visit" (to `/visit`), secondary CTA "Watch latest sermon", logo/cover image once supplied. The first slide carries the single orchestrated animation moment (see `SKILL.md` 4.3 and 5.4).
2. **Service times** strip from `site.ts`, with address and "Get directions" button.
3. **Latest sermon** card (thumbnail, title, preacher, date).
4. **Upcoming events** (next 3).
5. **Pinned announcement** (if any).
6. **About blurb** with link.
7. **Prayer CTA** and **Give CTA** (quiet, not pushy).
8. **Footer:** address, phone, WhatsApp, email, social links, quick links, privacy link, copyright.

### 6.2 About
Story/vision/beliefs as editable placeholder text; leadership cards render only for entries present in `site.ts`; photo area; link to Visit.

### 6.3 Visit (Services and location)
Service/meeting days and times; address; "Get directions" button (Google Maps link, not a heavy iframe); click-to-call; WhatsApp click-to-chat (`https://wa.me/234...`); short "What to expect" (dress, kids, duration) as placeholders; parking/landmarks placeholder.

### 6.4 Sermons
- List: newest first, cards with thumbnail, title, preacher, date, scripture. Search by title/preacher and filter by series. Pagination ("Load more" or numbered).
- Detail: title, meta, YouTube embed using a **click-to-load facade** (thumbnail + play button; load iframe only on click) to save data; or audio player if only `audioUrl` is given; description; share buttons (copy link, WhatsApp); related sermons.
- Support YouTube, Facebook video links (open externally), and direct audio URLs.

### 6.5 Events
Upcoming list (chronological) with date badge, title, venue, time; detail page with description, map link, "Add to calendar" (.ics download); past events in a collapsed section. All times shown in `Africa/Lagos`.

### 6.6 Announcements
Reverse-chronological list; pinned first; respect `publishFrom` and `expiresAt`.

### 6.7 Gallery
Responsive masonry or uniform grid; lazy-loaded; click opens an accessible lightbox (keyboard, swipe, focus trap, ESC); optional album filter.

### 6.8 Contact
Form: name, email or phone (at least one), message, honeypot field, consent line linking to Privacy. Validation client + server. Success state. Also shows address, phone, email, social links.

### 6.9 Prayer request
Form: name (optional), contact (optional), request, "keep my request private" (checked and locked in MVP, since nothing is public), consent line. Message after submit: warm, brief, sets expectation ("Our prayer team will read your request"). Do not promise a reply unless the church confirms one.

### 6.10 Give
Displays bank transfer details from `site.ts` (account name, bank, account number) with **copy-to-clipboard** buttons, a short note on purpose of giving, and a line "Online giving is coming soon". No payment processing. Never hard-code real account numbers in the repo; read from config and flag as placeholder until supplied.

### 6.11 Privacy
Plain-language privacy notice aligned with the Nigeria Data Protection Act 2023: what is collected (contact, prayer data), why, who sees it, retention, how to request deletion, contact for data questions. Mark as "draft for the church to review with a legal adviser".

### 6.12 Admin

Shell: `AdminShell` (sidebar from 1024px, compact nav on mobile). Navigation items appear only for what the signed-in user may do; the API enforces this regardless. Theme toggle and sign out in the shell. Usable on a phone: stacked tables become cards under 640px.

#### 6.12.1 Login
Email + password; generic error messages; throttled. If `mustChangePassword` is true, the user is sent to `/admin/account` and cannot use any other admin page until the password is changed.

#### 6.12.2 Dashboard
Counts limited to what the user may access: published sermons, upcoming events, unread contact messages, unread prayer requests, and a "what visitors see now" summary of the live hero. Quick-add buttons per permission. The super-admin also sees active admin count and the last five audit entries.

#### 6.12.3 Content CRUD (sermons, events, announcements, gallery)
Built from `ResourceTable` and `ResourceForm`. Table with search, status badge (draft/published), create/edit form with validation, delete with `ConfirmDialog`, "Preview" link. Auto-generate slugs; allow edit.

#### 6.12.4 Inbox
Tabs for Contact and Prayer (each shown only with its permission); unread first; open to read; mark read, archive; copy contact details; export CSV (optional). The super-admin alone sees a "Delete permanently" action (data-deletion requests), with confirmation and an audit entry.

#### 6.12.5 Hero manager (`HERO_MANAGE`)
Purpose: staff control the homepage hero without a developer. Design rules are in `SKILL.md` 4.3.

- **List:** each hero with name, mode, slide count, first-slide thumbnail, and a status badge: *Live now*, *Scheduled for [date]*, *Draft*, *Ended*. A banner at the top shows what visitors see right now (the live hero, or "Default hero"). Actions: edit, duplicate (to reuse yesterday's), publish/unpublish, delete (confirm).
- **Which hero is live:** the published hero whose window contains now (`startsAt` empty or in the past, `endsAt` empty or in the future). If several qualify, the one with the latest `startsAt` (empty counts as `createdAt`) wins; ties go to the latest `updatedAt`. If none qualify, the built-in default hero shows.
- **Editor (one page):**
  1. *Settings:* internal name (never shown publicly), mode (Single or Carousel) as `OptionCardGroup`, autoplay on/off and interval (carousel only, off by default), optional schedule start and end (shown and entered in `Africa/Lagos`), publish switch.
  2. *Slides:* ordered list with move up/down, duplicate, delete; add up to 6; Single mode edits one slide (switching from Carousel keeps the others but warns that only the first shows).
  3. *Slide form:* layout (full-bleed, split, text only) as visual option cards; alignment; title (≤ 80, required); subtitle (≤ 200); up to two buttons, each with a label and a link chosen from site pages (Visit, Sermons, Events, Give, Prayer, Contact) or a custom `https://` URL; background: image (URL, alt text or "decorative", focal point sliders, overlay slider 0 to 80, optional mobile image), colour (brand swatches or custom hex), or gradient preset; text tone (light or dark).
  4. *Live preview:* the real `HeroRenderer`, with Mobile and Desktop toggles, updating as the form changes.
- **Validation (client and server, same shared zod schema):** layout and background combinations must be valid (full-bleed needs an image; split and text only use colour or gradient; split needs an image); carousel needs 2 to 6 slides; publishing needs at least one valid slide; a published solid-colour slide must reach 4.5:1 between text tone and colour (draft saves allow a warning); image slides warn below 25% overlay; CTA links are `/` paths (not `//`) or `https://` URLs; image URLs must be `https://` from an allowed host; gradient is a preset key; hex is `#RRGGBB`.
- **Effects:** saving replaces the whole hero (settings plus slides) in one transaction. Publish, unpublish, edit, and delete trigger on-demand revalidation of the `hero` tag and write audit entries (`hero.create`, `hero.update`, `hero.publish`, `hero.unpublish`, `hero.delete`).

#### 6.12.6 Users and permissions (`SUPER_ADMIN` only)
- **List:** name, email, role badge, permission chips, status (Active, Deactivated, Must change password), last login. The super-admin's own row is shown first and is read-only here.
- **Create admin:** name, email, preset picker (Content editor, Inbox only, Custom) and a `PermissionPicker` grouped as Content (sermons, events, announcements, gallery, homepage hero) and Inbox (contact messages, prayer requests, marked sensitive). The server generates a one-time temporary password, shown once with a copy button; the admin must change it at first login.
- **Edit admin:** name, permissions, active/deactivated. **Reset password** generates a new temporary password (shown once) and signs the admin out everywhere. **Delete** removes the admin (their past content stays).
- **Guards:** no second `SUPER_ADMIN` can be created; the super-admin cannot be edited, deactivated, or deleted here. Destructive actions use `ConfirmDialog`. Every action writes an audit entry.

#### 6.12.7 Audit log (`SUPER_ADMIN` only)
Read-only list, newest first: when, who, action, entity. Filter by actor and entity. Never contains message bodies, passwords, or other secrets.

#### 6.12.8 Account (any admin)
Change own password (current, new, confirm; minimum length per section 9); choose theme. Changing the password signs out other sessions.

## 7. Data model (Prisma, Phase 1)

```prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum AdminRole { SUPER_ADMIN ADMIN }
enum Permission {
  SERMONS_MANAGE
  EVENTS_MANAGE
  ANNOUNCEMENTS_MANAGE
  GALLERY_MANAGE
  HERO_MANAGE
  CONTACT_INBOX
  PRAYER_INBOX
}
enum MessageStatus { NEW READ ARCHIVED }

model AdminUser {
  id                 String       @id @default(cuid())
  email              String       @unique
  name               String
  passwordHash       String
  role               AdminRole    @default(ADMIN)
  permissions        Permission[]                       // ignored for SUPER_ADMIN (holds all)
  isActive           Boolean      @default(true)
  mustChangePassword Boolean      @default(true)
  tokenVersion       Int          @default(0)           // bump to invalidate every session
  createdById        String?
  lastLoginAt        DateTime?
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
}

model Sermon {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        String
  preacher     String
  preachedAt   DateTime
  scripture    String?
  series       String?
  videoUrl     String?
  audioUrl     String?
  thumbnailUrl String?
  description  String?
  published    Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([published, preachedAt])
  @@index([series])
}

model Event {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  startsAt    DateTime
  endsAt      DateTime?
  venue       String
  address     String?
  mapUrl      String?
  description String?
  imageUrl    String?
  published   Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([published, startsAt])
}

model Announcement {
  id          String    @id @default(cuid())
  title       String
  body        String
  pinned      Boolean   @default(false)
  publishFrom DateTime?
  expiresAt   DateTime?
  published   Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([published, pinned, createdAt])
}

model GalleryImage {
  id        String   @id @default(cuid())
  imageUrl  String
  caption   String?
  album     String?
  width     Int?
  height    Int?
  sortOrder Int      @default(0)
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  @@index([album, sortOrder])
}

model ContactMessage {
  id        String        @id @default(cuid())
  name      String
  email     String?
  phone     String?
  message   String
  status    MessageStatus @default(NEW)
  createdAt DateTime      @default(now())
  @@index([status, createdAt])
}

model PrayerRequest {
  id        String        @id @default(cuid())
  name      String?
  email     String?
  phone     String?
  request   String
  status    MessageStatus @default(NEW)
  createdAt DateTime      @default(now())
  @@index([status, createdAt])
}

enum HeroMode { SINGLE CAROUSEL }
enum HeroLayout { FULL_BLEED SPLIT TEXT_ONLY }
enum HeroAlign { START CENTER END }
enum HeroTextTone { LIGHT DARK }
enum HeroBgType { IMAGE COLOR GRADIENT }

model Hero {
  id              String      @id @default(cuid())
  name            String                              // internal label, never public
  mode            HeroMode    @default(SINGLE)
  autoplay        Boolean     @default(false)         // carousel only
  intervalSeconds Int         @default(7)             // 5 to 15
  published       Boolean     @default(false)
  startsAt        DateTime?
  endsAt          DateTime?
  slides          HeroSlide[]
  createdById     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  @@index([published, startsAt, endsAt])
}

model HeroSlide {
  id             String       @id @default(cuid())
  heroId         String
  hero           Hero         @relation(fields: [heroId], references: [id], onDelete: Cascade)
  sortOrder      Int          @default(0)
  layout         HeroLayout   @default(FULL_BLEED)
  align          HeroAlign    @default(START)
  title          String                               // <= 80
  subtitle       String?                              // <= 200
  primaryLabel   String?
  primaryUrl     String?                              // "/path" or https URL
  secondaryLabel String?
  secondaryUrl   String?
  bgType         HeroBgType   @default(IMAGE)
  bgColor        String?                              // #RRGGBB when COLOR
  bgGradient     String?                              // preset key: dawn | daybreak | glow
  imageUrl       String?
  mobileImageUrl String?
  imageAlt       String?
  imageDecorative Boolean     @default(false)
  focalX         Int          @default(50)            // 0 to 100
  focalY         Int          @default(50)
  overlay        Int          @default(40)            // 0 to 80
  textTone       HeroTextTone @default(LIGHT)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  @@index([heroId, sortOrder])
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  actorName  String?                                  // snapshot, survives admin deletion
  action     String                                   // e.g. "user.create", "hero.publish"
  entity     String
  entityId   String?
  meta       Json?                                    // never message bodies or secrets
  createdAt  DateTime @default(now())
  @@index([createdAt])
  @@index([entity, entityId])
}
```

**Single super-admin guarantee.** Prisma cannot express a partial unique index, so add it in a hand-written SQL migration:

```sql
CREATE UNIQUE INDEX "AdminUser_single_super_admin" ON "AdminUser" ("role") WHERE "role" = 'SUPER_ADMIN';
```

**Hero layout and background matrix** (validated in the shared zod schema and the API):

| Layout | `bgType` | Image | Notes |
|---|---|---|---|
| `FULL_BLEED` | `IMAGE` (or `COLOR`/`GRADIENT` with no image) | required when `IMAGE` | overlay applies |
| `SPLIT` | `COLOR` or `GRADIENT` | required (side media) | text sits on the colour |
| `TEXT_ONLY` | `COLOR` or `GRADIENT` | none | typographic |

Rules: store emails lowercased; normalise Nigerian phone numbers to `+234...`; cap text lengths (message/request ≤ 2000 chars, title ≤ 160, hero title ≤ 80, hero subtitle ≤ 200); a hero has at most 6 slides; soft limits enforced in DTOs.

### Phase 2 models (do not migrate yet; keep naming consistent)

```prisma
enum ProjectStatus { DRAFT ACTIVE COMPLETED }
enum ContributionSource { ONLINE OFFLINE }
enum ContributionStatus { PENDING SUCCESS FAILED }

model Project {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  description String
  imageUrl    String?
  goalKobo    BigInt
  status      ProjectStatus @default(DRAFT)
  deadline    DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  contributions Contribution[]
}

model Contribution {
  id            String             @id @default(cuid())
  projectId     String?            // null = general giving
  project       Project?           @relation(fields: [projectId], references: [id])
  amountKobo    BigInt
  donorName     String?
  donorEmail    String?
  donorPhone    String?
  displayName   String?            // what may be shown publicly
  isAnonymous   Boolean            @default(true)
  message       String?
  source        ContributionSource
  status        ContributionStatus @default(PENDING)
  paystackRef   String?            @unique
  recordedById  String?            // admin who logged offline gift
  createdAt     DateTime           @default(now())
  @@index([projectId, status])
}

// AuditLog moved to Phase 1 (see the Phase 1 schema above).
```

---

## 8. API specification (Phase 1)

Base: `/api/v1`. JSON only. Consistent error shape:
`{ "statusCode": 400, "error": "Bad Request", "message": ["field: reason"], "requestId": "..." }`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Liveness (also checks DB cheaply) |
| GET | `/sermons` | public | List published; `?page&limit&q&series` |
| GET | `/sermons/:slug` | public | Detail |
| GET | `/events` | public | `?scope=upcoming\|past&page&limit` |
| GET | `/events/:slug` | public | Detail |
| GET | `/announcements` | public | Active (within publish window) |
| GET | `/gallery` | public | `?album&page&limit` |
| GET | `/hero` | public | The live hero with slides, or `{ data: null }` (web then shows the default hero) |
| POST | `/contact` | public, throttled | Create contact message |
| POST | `/prayer-requests` | public, throttled | Create prayer request |
| POST | `/auth/login` | public, throttled | Sets httpOnly cookie; response includes `mustChangePassword` |
| POST | `/auth/logout` | any admin | Clears cookie |
| GET | `/auth/me` | any admin | Current admin: role, permissions, flags |
| POST | `/auth/change-password` | any admin | Current + new password; clears `mustChangePassword`; bumps `tokenVersion` |
| GET/POST/PATCH/DELETE | `/admin/sermons[/:id]` | `SERMONS_MANAGE` | CRUD (includes drafts) |
| GET/POST/PATCH/DELETE | `/admin/events[/:id]` | `EVENTS_MANAGE` | CRUD |
| GET/POST/PATCH/DELETE | `/admin/announcements[/:id]` | `ANNOUNCEMENTS_MANAGE` | CRUD |
| GET/POST/PATCH/DELETE | `/admin/gallery[/:id]` | `GALLERY_MANAGE` | CRUD + reorder |
| GET | `/admin/hero`, `/admin/hero/:id` | `HERO_MANAGE` | List with status (live, scheduled, draft, ended); one hero with slides |
| POST | `/admin/hero` | `HERO_MANAGE` | Create a hero with its slides (one transaction) |
| PUT | `/admin/hero/:id` | `HERO_MANAGE` | Replace settings and slides atomically |
| PATCH | `/admin/hero/:id/publish` | `HERO_MANAGE` | `{ published: boolean }` |
| POST | `/admin/hero/:id/duplicate` | `HERO_MANAGE` | Copy as a draft |
| DELETE | `/admin/hero/:id` | `HERO_MANAGE` | Delete |
| GET | `/admin/contact` | `CONTACT_INBOX` | List with `?status&page` |
| PATCH | `/admin/contact/:id` | `CONTACT_INBOX` | Update status |
| GET | `/admin/prayer-requests` | `PRAYER_INBOX` | List with `?status&page` |
| PATCH | `/admin/prayer-requests/:id` | `PRAYER_INBOX` | Update status |
| DELETE | `/admin/contact/:id`, `/admin/prayer-requests/:id` | `SUPER_ADMIN` | Permanent delete (audited) |
| GET | `/admin/stats` | any admin | Dashboard counts, filtered by the caller's permissions |
| GET/POST | `/admin/users` | `SUPER_ADMIN` | List admins; create (returns one-time temporary password) |
| GET/PATCH/DELETE | `/admin/users/:id` | `SUPER_ADMIN` | Read; edit name, permissions, `isActive`; delete |
| POST | `/admin/users/:id/reset-password` | `SUPER_ADMIN` | New one-time temporary password; bumps `tokenVersion` |
| GET | `/admin/audit` | `SUPER_ADMIN` | `?page&limit&entity&actor` |

Conventions: DTO validation on every route (`whitelist: true`, `forbidNonWhitelisted: true`); pagination default 12, max 50; ISO-8601 UTC timestamps; list responses `{ data, meta: { page, limit, total } }`; URL fields validated as http(s); YouTube/Facebook/audio URL normalisation helpers; OpenAPI (Swagger) docs enabled in non-production only.

**Authorisation.** Guards run in order: `JwtAuthGuard` (valid cookie) then `ActiveUserGuard` (user exists, `isActive`, `tokenVersion` matches) then `PermissionsGuard` (`@RequirePermissions(...)` or `@SuperAdminOnly()`). The permission guard is **default-deny**: every `/admin/*` route must carry one of the decorators, and a unit test iterates all routes and fails if one does not. Permissions are read from the database on each request, never from the token. Errors: 401 for no or invalid session, 403 for missing permission.

---

## 9. Security and privacy

- Passwords: bcrypt (cost ≥ 12) or argon2. Minimum length 10 (12 for the super-admin). The seed script creates the single `SUPER_ADMIN` from env vars; no public registration route exists. Admins are created only by the super-admin with a one-time temporary password (shown once, stored hashed, `mustChangePassword = true`).
- Auth: signed JWT in `httpOnly`, `secure`, `sameSite=lax` cookie; payload only `{ sub, role, tv }`; short expiry (ADMIN 8 to 12 hours, SUPER_ADMIN at most 4 hours); logout clears cookie. On every request the API loads the user and rejects if `!isActive` or `tv !== tokenVersion`, so deactivation, password reset, and password change sign the user out everywhere at once. `/admin` pages are gated by Next.js middleware (cookie presence) **and** enforced in the API by guards (the real authorisation). The UI hides what a user cannot do but never relies on that.
- Least privilege: default-deny guards (section 8), permissions loaded from the database per request, the super-admin cannot be created, demoted, deactivated, or deleted through the API, and admins cannot touch `/admin/users` or `/admin/audit`. Recovery if the super-admin loses access: a documented CLI (`pnpm --filter api run cli:reset-super-admin`) that needs server and database access, sets a new temporary password, bumps `tokenVersion`, and writes an audit entry.
- Audit: sign-ins, password changes, admin create/edit/deactivate/delete/reset, permission changes, hero changes, permanent deletions, and content publish/delete are logged with actor and entity. Never log message bodies, passwords, or tokens.
- Throttling: login 5/min/IP; public POST 5/min/IP and 30/hour/IP; global default sensible. Honeypot field on forms. (Phase 2: Turnstile.)
- Input: validate and trim everything; escape on output (React does by default); never render HTML from admin input unless sanitised; announcement/event/about text is plain text or a constrained Markdown subset.
- Hero input: stored only as plain text, enums, validated `#RRGGBB`, and preset keys. No HTML or CSS from admin input is ever rendered. Button links must be `/` paths (not `//`) or `https://` URLs; `javascript:` and other schemes are rejected. Image URLs must be `https://` on an allow-listed host (`IMAGE_ALLOWED_HOSTS`, mirrored in `next.config` `images.remotePatterns`).
- Headers: Helmet on API; strict CSP on web where practical; HSTS via platform; `X-Content-Type-Options`, `Referrer-Policy`.
- CORS: only the web origin (env). Proxying through Next rewrites keeps the browser same-origin.
- Secrets: env only; `.env.example` committed, real `.env` never. No secrets in `NEXT_PUBLIC_*`.
- Data protection (NDPA 2023): collect the minimum; show consent line on forms; retention policy (e.g. delete archived messages after 12 months, configurable); a documented way to delete a person's data on request (super-admin hard-delete endpoints); do not log message bodies; prayer requests are never shown publicly in Phase 1.
- Bank details are public information by design but must be sourced from config the church confirms; warn in README about fraud: only the church's confirmed accounts, changes require a developer review.
- Dependency hygiene: lockfile committed; `pnpm audit` in CI (warn).

---

## 10. Non-functional requirements

### Performance (mid-range Android, 4G; assume bursts of 3G)
- LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on Home and Sermons.
- Public page first-load JS target ≤ 150 KB gzipped (excluding images); motion code-split where possible; shadcn components imported individually; admin-only components confined to the `(admin)` route group; the carousel loads only when the live hero is a carousel; bundle analyzer in CI, investigate anything over 130 KB.
- Theme: `next-themes` with no flash; glass surfaces fall back to solid under reduced transparency or reduced data, and where unsupported.
- Images: `next/image`, AVIF/WebP, explicit dimensions, `sizes` set, hero priority only; no autoplay video; YouTube facade.
- Fonts: `next/font`, max two families, `display: swap`, subset to Latin.
- No render-blocking third-party scripts; analytics (Vercel Web Analytics or Plausible) loaded after interaction/idle.

### Reliability
- Render and Neon free tiers can sleep: ISR keeps public pages up; admin and form submissions show a "waking up, please wait" state and retry once automatically.
- Optional uptime monitor pinging `/health` every 10 to 14 minutes reduces cold starts. Check each provider's current free-tier policy.
- Backups: use Neon's restore window (verify retention on the chosen plan) plus a documented weekly `pg_dump` procedure.

### Accessibility (WCAG 2.2 AA)
Semantic HTML, skip link, visible focus rings, colour contrast ≥ 4.5:1 for text in both light and dark themes and over glass surfaces, accessible carousel semantics with a pause control when autoplay is on, labels on all inputs, error messages tied to fields (`aria-describedby`), keyboard-operable nav/lightbox/dialogs, touch targets ≥ 44px, `prefers-reduced-motion` honoured, meaningful `alt` text, language attribute `en-NG`.

### SEO and discoverability
Metadata API per page; canonical URLs; Open Graph/Twitter cards; `sitemap.xml` and `robots.txt` generated; JSON-LD (`Church` or `Organization`, `Event` on event pages, `VideoObject` on sermons when video exists); clean slugs; proper heading hierarchy. (Off-code tasks for the church: claim Google Business Profile, keep name/address/phone identical everywhere.)

### Localisation
Locale `en-NG`; currency `₦` via `Intl.NumberFormat('en-NG')`; dates via `Africa/Lagos`; phone inputs accept `0803...` and `+234803...`. Copy in plain, warm English; leave i18n hooks out of MVP.

### Observability
Structured logs with request IDs; no PII in logs; error boundary pages; optional Sentry (free tier) for web and API.

### Testing and CI
- API: unit tests for services; e2e (supertest) for auth, public GETs, form posts, throttling, admin guard.
- Web: Playwright smoke tests (home loads, sermons list, contact form submit, admin login and create sermon); axe check on key pages.
- API e2e adds: a second `SUPER_ADMIN` cannot be created (including at the database level); an `ADMIN` without a permission gets 403 on its routes and on `/admin/users` and `/admin/audit`; deactivation and password reset invalidate an existing session immediately; every `/admin/*` route carries an authorisation decorator; hero live-selection (window, tie-break, none live returns null); hero validation (layout and background matrix, link and URL rules, contrast rule, 6-slide cap).
- Web adds: Playwright flows for super-admin creating an admin and limiting permissions, an admin publishing a carousel hero then replacing it with a single-slide hero, forced password change on first login; axe checks on key pages in **both themes**; a styleguide page rendering every shared component in both themes.
- GitHub Actions: install, lint, typecheck, test, build for both apps on every PR.

---

## 11. Phase 2 specification: projects and online giving (reference)

### 11.1 Projects and transparency
- Public project cards: title, image, description, goal (₦), raised (₦), percent, progress bar, deadline, "Give to this project".
- Raised amount = sum of `SUCCESS` contributions (online + offline). Amounts stored in **kobo** as integers; formatted for display only.
- Public contribution feed shows only what the donor opted into: display name or "Anonymous", amount (or ranges if the church prefers), optional moderated message, relative time. Default is anonymous.
- Admin records **offline** contributions (bank transfer/cash): amount, name (optional), phone (optional), source, project, anonymous toggle, date; stored with `recordedById` and an `AuditLog` entry. Edits and deletions are logged.

### 11.2 Paystack flow (correct order)
1. Visitor chooses project/general, amount (min ₦100 or per Paystack rules), email, optional name, **display preference (name or anonymous) and message before paying**.
2. `POST /giving/initialize` validates input, creates a `PENDING` contribution with a unique `reference`, calls Paystack Initialize, returns `authorization_url` (or access code for the inline popup).
3. Visitor pays on Paystack (cards, bank transfer, USSD as enabled on the church's account).
4. **Webhook** `POST /webhooks/paystack`: verify `x-paystack-signature` (HMAC SHA-512 of the raw body with the secret key) using the raw body; respond 200 quickly; look up by reference; **call Paystack Verify** and confirm status, amount, currency (NGN) match the pending record; update to `SUCCESS` idempotently (ignore repeats); mark `FAILED` on failure events.
5. Callback page `/give/thanks?reference=...` shows status by querying the API (not by trusting the URL).
6. Receipts by email (Phase 2 email service). Reconcile weekly: export Paystack transactions vs contributions.

Operational notes (verify before launch): Paystack requires a verified business account for live payments, which for a church typically means its registration documents (e.g. Incorporated Trustees) and a corporate bank account; settlement timing and fee schedule must be confirmed on Paystack's current pricing page. The web must never expose the secret key; only the public key is used client-side.

### 11.3 Phase 2 endpoints (sketch)
`GET /projects`, `GET /projects/:slug`, `GET /projects/:slug/contributions`, `POST /giving/initialize`, `GET /giving/status/:reference`, `POST /webhooks/paystack`, `POST /admin/projects`, `PATCH /admin/projects/:id`, `POST /admin/projects/:id/contributions` (offline), `GET /admin/contributions` (+ CSV export).

---

## 12. Phase 3 outline

- **Prayer wall:** public list of approved, anonymised requests; "I prayed" button with per-device throttle (cookie + IP hash) to limit spam; admin moderation queue; auto-hide on reports; never display names or contacts.
- **Testimonies:** text first; moderation queue; voice notes later (size limit, storage, moderation cost).
- **Devotion:** daily verse from an admin-managed schedule (avoid licensing issues: use public-domain translations or confirm licences).
- **Live:** `/live` page with YouTube/Facebook live embed and an admin "We are live" toggle (no API polling).
- **Notifications:** email first; WhatsApp Business API only if the church accepts its approval process and per-message costs.

---

## 13. Content and asset plan

Client inputs needed (all enter via `site.ts` or the admin; mark missing ones as placeholders):

| Item | Notes |
|---|---|
| Official name and any parent body/"Division" wording | Confirm exact wording |
| Logo (SVG/PNG, transparent) with a light-on-dark version for dark mode, and cover/hero photos | Download from the church's own Facebook page or request originals. Place in `apps/web/public/brand/`. Get permission for photos of people, especially children |
| Brand colours | Extract from logo; ask the church if there is an official palette |
| Address, Google Maps link, landmarks | |
| Service/meeting days and times | |
| Phone, WhatsApp, email | |
| Pastor/leadership names, titles, photos | Only with consent |
| About, vision, statement of beliefs | Church-written; AI may polish, not invent |
| Bank details | Confirmed by church officers in writing |
| Social links | Facebook (above), YouTube, Instagram, etc. |
| Sermon links | Start with the latest 5 to 10 |
| Domain | e.g. a `.org`, `.com` or `.org.ng`; DNS access |

Until assets arrive: text wordmark, neutral placeholder imagery generated as CSS gradients/patterns (no stock photos of identifiable people, no fake testimonials).

---

## 14. Environments and deployment

| Env | Web | API | DB |
|---|---|---|---|
| Local | `next dev` | `nest start --watch` | Neon dev branch or local Postgres |
| Preview | Vercel preview deployments | Render (optional) | Neon branch |
| Production | Vercel | Render | Neon main |

**Env vars**
- web: `NEXT_PUBLIC_SITE_URL`, `API_INTERNAL_URL` (used by rewrites/server fetch), `REVALIDATE_SECRET` (same value as the API), `IMAGE_ALLOWED_HOSTS` (comma-separated hosts for admin-entered image URLs), optional analytics keys.
- api: `DATABASE_URL` (pooled), `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV`, `PORT`, `SUPER_ADMIN_SEED_EMAIL`, `SUPER_ADMIN_SEED_PASSWORD`, `REVALIDATE_SECRET`, `WEB_REVALIDATE_URL`, `IMAGE_ALLOWED_HOSTS`.
- Validate all env at startup and fail fast with clear messages.

**Deploy steps (document in README)**
1. Neon: create project (region near Render), copy pooled and direct strings.
2. Render: Web Service for `apps/api`; build: install + `prisma generate` + build; start: `prisma migrate deploy` + start; health check `/health`; set env vars.
3. Run seed once to create the single super-admin (idempotent: it does nothing if one exists), then remove the seed credentials from env. The super-admin creates all other admins from `/admin/users`.
4. Vercel: import repo, root directory `apps/web`, set env vars, add the API rewrite.
5. Add custom domain, enable HTTPS, update `CORS_ORIGIN` and `NEXT_PUBLIC_SITE_URL`.
6. Post-deploy checklist: submit both forms, log in, publish a sermon and event, check sitemap, run Lighthouse, test on a real Android phone.

---

## 15. Build plan (Phase 1)

| Step | Deliverable | Definition of done |
|---|---|---|
| 1 | Monorepo, tooling, CI, env validation, shared `packages/types` | CI green on empty app |
| 2 | Design tokens (light and dark), shadcn/ui init and initial set, `next-themes`, `glass` utilities, `GlassCard`, shared components, layout, nav, footer, motion wrappers (per `SKILL.md`) | `/styleguide` renders every shared component in both themes; contrast check passes; reduced-motion works |
| 3 | Prisma schema (roles, permissions, hero, audit), migrations including the single-super-admin index, seed, Nest modules, auth, RBAC guards, audit service | e2e auth, RBAC, and public GET tests pass; default-deny route test passes |
| 4 | Hero module: API, `GET /hero`, `HeroRenderer` family, `DefaultHero`, revalidation | Single, carousel, scheduled, and none-live cases render correctly at 360px |
| 5 | Public pages with ISR and real API | All pages in section 6 render on 360px in both themes |
| 6 | Forms (contact, prayer) with throttling and honeypot | Submissions appear in DB; abuse test blocked |
| 7 | Admin: login, shell, `ResourceTable`/`ResourceForm`, content CRUD, inbox, dashboard, hero manager with live preview | Publish a sermon from a phone in under 2 minutes; staff swap a carousel for a single hero without help |
| 8 | Admin: users and permissions, presets, forced password change, audit log, account page | Super-admin creates a limited admin; limits are enforced by the API; second super-admin impossible |
| 9 | SEO, a11y, perf pass, legal page, README | Lighthouse targets met; axe clean in both themes; bundle budget met |
| 10 | Deploy, smoke test, handover notes | Checklist in section 14 complete |

---

## 16. Acceptance criteria

- Every public page works at 360px width with no horizontal scroll and passes keyboard-only navigation.
- Visitor can submit a contact message and a prayer request; admin sees each in the inbox exactly once; spam attempts beyond the limit are rejected with a friendly message.
- Admin can create, edit, unpublish, and delete a sermon, event, announcement, and gallery image; changes appear on the public site within the revalidation window.
- Draft content never appears publicly; admin routes return 401/403 without a valid session.
- No placeholder text is presented as fact; all church-specific data comes from `site.ts` or the database.
- No console errors; no TypeScript errors; lint and tests pass in CI.
- Lighthouse mobile targets in section 1 are met on the production URL.
- Exactly one `SUPER_ADMIN` exists and cannot be duplicated, demoted, deactivated, or deleted through the API; only the super-admin can manage admins, permissions, and the audit log.
- An `ADMIN` can do only what its permissions allow; revoking a permission or deactivating the admin takes effect on their next request.
- Staff with `HERO_MANAGE` can create a carousel hero, schedule a single-image hero for the next day, set custom text and background, preview it on mobile and desktop, and see it live on Home within the revalidation window; with no live hero, the default hero shows.
- Every page and every admin screen is usable and passes axe in both light and dark themes; glass surfaces meet contrast and fall back to solid.
- No copy-pasted CRUD screens: admin lists and forms come from `ResourceTable` and `ResourceForm`; every shared component appears in `/styleguide`.
- README lets a new developer run, test, deploy, and rotate secrets without help.

---

## 17. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Free-tier cold starts hurt admin/forms | ISR for public pages, retry + "waking up" UI, optional uptime ping, upgrade path |
| Church content/assets arrive late | Placeholder system in `site.ts`; launch checklist |
| Spam on public forms | Throttling, honeypot, Turnstile in Phase 2 |
| Wrong bank details published | Config-only, church sign-off, change review |
| Privacy complaints about prayer/contact data | Private by default, NDPA-aligned notice, retention + deletion process |
| Staff cannot operate admin | Phone-friendly admin, short handover guide with screenshots |
| Scope creep | Phase gates; anything not in Phase 1 table waits |
| Hero set up with unreadable text or a broken image | Shared validation, contrast rule for solid colours, overlay warning, live preview, drafts and scheduling, default hero fallback |
| Hotlinked image URLs expire or are blocked | Allow-listed hosts, guidance to use stable hosts, Phase 2 uploads, default hero fallback |
| Admin given too much access, or super-admin locked out | Presets with least privilege, default-deny guards, immediate revocation via `tokenVersion`, documented CLI recovery, audit log |
| Glass effect hurts contrast or performance on low-end phones | Opacity floors, blur and layer budgets, solid fallbacks, 4x CPU test |
| shadcn/Radix grows the public bundle | Per-component imports, route-group split, on-demand carousel and lightbox, bundle analyzer in CI |
| Payment fraud/reconciliation errors (Phase 2) | Signature verification, server-side verify, idempotency, audit log, weekly reconciliation |

---

## 18. Upgrade roadmap (summary)

Phase 2 projects and Paystack giving → uploads, email alerts, roles, audit log → Phase 3 prayer wall, testimonies, devotion, live page → member portal, groups, multi-branch, PWA.
