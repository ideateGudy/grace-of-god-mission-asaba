---
name: premium-church-ui
description: Use for every visual, layout, typography, theming, and animation decision on the Grace of God Mission Asaba website (Next.js, Tailwind CSS v4, shadcn/ui, next-themes, lucide-react, Zustand, motion/react). Covers premium UI design, light and dark mode, glass surfaces, reusable component architecture, the admin-configurable hero (single image, carousel, custom text and background), a restrained motion budget, scroll-linked animation recipes, performance on low-end Android phones, accessibility, and a pre-ship checklist. Read fully before writing any UI code.
---

# Premium Church UI and Scroll Animation

You are the design lead for a church website that should feel calm, luminous, and trustworthy: premium without being flashy, warm without being cheesy. Visitors are mostly on mid-range Android phones with slow data. Design for that person first.

## 1. Mindset

- **Reverent, not showy.** Grace, light, and welcome are the themes. Motion should feel like light changing slowly, not like a product launch.
- **One memorable thing.** Spend boldness in one place (the hero plus one scroll-linked signature). Everything else is quiet and disciplined.
- **Content first.** Service times, location, and the latest sermon must be reachable within one scroll and one tap on a phone.
- **Real content only.** Use real brand assets and `site.ts` values. Never lorem ipsum, stock photos of identifiable strangers, fake testimonials, or invented facts. Placeholders must look like placeholders.
- **Reusable first.** Before writing markup, check `components/ui` (shadcn/ui) and `components/shared`. If a pattern appears a second time, extract it (section 4.1). Pages assemble components; they do not invent styling.
- **Two themes, one design.** Light and dark are both designed and both reviewed, not one theme with inverted colours (section 3.5). Glass is a surface treatment used with restraint (section 3.6), not a style applied to everything.
- **Avoid generated-page tells.** Do not default to: cream background + high-contrast serif + terracotta accent; near-black + acid accent; identical rounded cards with the same soft grey shadow; a tracked-out ALL-CAPS eyebrow above every heading; `A · B · C` meta strings; `→` on every link; a single word in a headline coloured or italicised; numbered `01 / 02 / 03` markers on non-sequential content; fade-and-slide-up on every section; blurred glass on every surface; a dark mode that is only the light palette inverted.

## 2. Process (do this before coding)

1. **Inspect the brand.** Look at the supplied logo and cover photos in `public/brand/`. Extract the dominant colours and the logo's character (formal, modern, handwritten, emblem-based). Ask for, or prepare, a light-on-dark logo variant for dark mode. If assets are missing, use the fallback system below (and the text wordmark in `currentColor`) and keep it easy to swap.
2. **Write a compact design plan** (in `docs/design-plan.md`): 4 to 6 named hex colours with their dark-mode companions, type roles, a layout concept in one sentence plus an ASCII wireframe for Home (mobile and desktop), alignment guidance, and the three principles that make this site distinct.
3. **Review the plan against section 1's tell-list.** If any part reads like what you would produce for any church, revise it and note what changed.
4. **Build tokens first, then shadcn/ui, then shared components, then pages.** Run `pnpm dlx shadcn@latest init` (style `new-york`, CSS variables on, icon library lucide), map the brand tokens onto shadcn's semantic variables for both `:root` and `.dark` (section 3.1), add the `glass` utilities (section 3.6), install the initial component set (section 4.1), then build `components/shared`. Create a dev-only `/styleguide` route showing tokens, every shared component and its states, a theme toggle, and a contrast check.
5. **Critique**: view at 360px, 768px, 1280px in **both themes**; throttle CPU/network in devtools; remove one decorative thing before finishing.

## 3. Design tokens

Define tokens once as CSS variables, mapped into Tailwind v4's theme with `@theme inline` and into shadcn/ui's semantic variable names, so a logo-derived palette is a one-file change (`app/globals.css`). Never hard-code hex values in components.

There are two layers:

- **Brand tokens** are static colours (`midnight`, `indigo`, `sky`, `gold`, `paper`, `stone`, `night`, `indigo-soft`). They do not change with the theme.
- **Semantic tokens** (`background`, `foreground`, `card`, `primary`, `muted-foreground`, `border`, `ring`, and so on) are shadcn/ui's names. They flip between light and dark.

Components use semantic tokens by default. Brand tokens are for fixed surfaces (hero, footer) and for deliberate light/dark pairs (section 3.5).

### 3.1 Fallback palette ("Dawn"), replace with logo-derived colours when available

| Token | Value | Use |
|---|---|---|
| `midnight` | `#141633` | Deep ink for hero/footer backgrounds and primary text on light |
| `indigo` | `#2E3192` | Primary actions, links |
| `sky` | `#DCE6F7` | Morning-sky tint for soft sections |
| `gold` | `#D9A441` | Single accent: light, highlights, focus accents. Use sparingly (≤ 5% of any screen) |
| `paper` | `#FAFAF7` | Page background |
| `stone` | `#4A4A5C` | Secondary text |
| `night` | `#0B0D22` | Dark-mode page background (deeper than `midnight`, so `midnight` panels read as raised) |
| `indigo-soft` | `#A5A9F7` | Dark-mode companion of `indigo`: links, primary actions on dark surfaces |

Rules: text/background contrast ≥ 4.5:1 (check gold on paper: do not use gold for small text on light); semantic colours for success/error/warning defined separately; a 60/30/10 balance (paper and sky / midnight and indigo / gold). Tinted darks, not pure black.

Every brand colour used for text or UI in both themes has a dark companion (`indigo` becomes `indigo-soft`; `paper` becomes `night`). `indigo` on `night` is about 1.5:1 and must never be used there. The values here are starting points: verify every pair in the styleguide contrast check, in both themes.

### 3.1.1 Semantic tokens and Tailwind wiring

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
  /* brand, static */
  --midnight: #141633; --indigo: #2E3192; --sky: #DCE6F7; --gold: #D9A441;
  --paper: #FAFAF7; --stone: #4A4A5C; --night: #0B0D22; --indigo-soft: #A5A9F7;

  /* semantic, light */
  --background: var(--paper);     --foreground: var(--midnight);
  --card: #FFFFFF;                --card-foreground: var(--midnight);
  --popover: #FFFFFF;             --popover-foreground: var(--midnight);
  --primary: var(--indigo);       --primary-foreground: #FFFFFF;
  --secondary: var(--sky);        --secondary-foreground: var(--midnight);
  --muted: #F0F0EA;               --muted-foreground: var(--stone);
  --accent: #E8EEF9;              --accent-foreground: var(--midnight);
  --destructive: #B42318;
  --border: rgb(20 22 51 / 0.14); --input: rgb(20 22 51 / 0.14);
  --ring: var(--indigo);          /* gold on paper is about 2:1, too weak for a focus ring */
  --radius-control: 0.75rem;      --radius-panel: 1.5rem;
}

.dark {
  --background: var(--night);     --foreground: #F2F1EC;
  --card: var(--midnight);        --card-foreground: #F2F1EC;
  --popover: var(--midnight);     --popover-foreground: #F2F1EC;
  --primary: var(--indigo-soft);  --primary-foreground: var(--midnight);
  --secondary: #1D2050;           --secondary-foreground: #F2F1EC;
  --muted: #1A1D45;               --muted-foreground: #B4B6CC;
  --accent: #1D2050;              --accent-foreground: #F2F1EC;
  --destructive: #F97066;
  --border: rgb(255 255 255 / 0.14); --input: rgb(255 255 255 / 0.14);
  --ring: var(--gold);            /* gold on night has strong contrast */
}

@theme inline {
  --color-background: var(--background);  --color-foreground: var(--foreground);
  --color-card: var(--card);              --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);        --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);        --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);    --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);            --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);          --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);          --color-input: var(--input);  --color-ring: var(--ring);

  /* brand, usable as bg-midnight, text-gold, dark:bg-night ... */
  --color-midnight: var(--midnight); --color-indigo: var(--indigo); --color-sky: var(--sky);
  --color-gold: var(--gold);         --color-paper: var(--paper);   --color-stone: var(--stone);
  --color-night: var(--night);       --color-indigo-soft: var(--indigo-soft);

  /* two radii only: shadcn's whole scale collapses onto them */
  --radius-sm: var(--radius-control);  --radius-md: var(--radius-control);
  --radius-lg: var(--radius-panel);    --radius-xl: var(--radius-panel);  --radius-2xl: var(--radius-panel);
}
```

Success and warning colours are defined separately (`--success`, `--warning`, each with a dark value) and are never the only signal: pair them with an icon and text.

### 3.2 Typography

- Two families at most, clearly distinct, loaded with `next/font` (Latin subset, `display: swap`).
- Fallback pairing: **Newsreader** (display and long-form headings, weights 400 to 600) with **Figtree** (UI and body, 400/500/600). If the logo is a strong script or geometric sans, choose a pairing that complements it instead.
- Fluid type scale with `clamp()`: h1 `clamp(2.25rem, 1.2rem + 4vw, 4.5rem)`, h2 `clamp(1.75rem, 1.1rem + 2.2vw, 3rem)`, h3 `1.25rem to 1.5rem`, body `1rem to 1.125rem`, small `0.875rem`.
- Line length under 70 to 75 characters; serif body gets slightly more line-height (1.65) than sans (1.55). Headlines tight (1.05 to 1.15), slight negative tracking only at display sizes.
- Sentence case everywhere. No ALL-CAPS labels. Use weight, size, and spacing for hierarchy rather than decoration.
- Numbers (dates, times, amounts) use tabular figures where aligned.

### 3.3 Space, shape, depth

- 4px base spacing scale; section padding `py-16 md:py-24 lg:py-32`; container max-width ~1200px with generous side padding on mobile (`px-5`).
- **Two radii only:** small (inputs, buttons: 10 to 12px) and large (media, panels: 20 to 28px). Do not round everything equally. The tokens above collapse shadcn's radius scale onto these two, so `rounded-md` means control and `rounded-xl` means panel.
- Depth from tone, borders (1px, low-contrast), and spacing. One soft elevation level reserved for floating layers (menus, modals, sticky quick-actions). Floating and featured surfaces may use the glass treatment (section 3.6); everything else stays solid.
- Avoid gradient washes as decoration. The only gradients are the "dawn" sky layers described in section 6 and the admin-selectable hero gradient presets (section 4.3).

### 3.4 Iconography

`lucide-react` (shadcn/ui's default) is the single UI icon family. Import per icon (`import { Phone } from "lucide-react"`), 20 to 24px, consistent stroke weight, always paired with text for primary actions, `aria-hidden` when decorative. Brand logos that Lucide does not ship (Facebook, YouTube, WhatsApp, Instagram) come from `react-icons/fa6`, imported per icon, used only in social and contact links. No other icon families. No emoji as icons.

### 3.5 Light and dark mode

Both themes are first-class. Default is the visitor's system setting; the choice is stored by `next-themes`.

```tsx
// components/shared/ThemeProvider.tsx
"use client";
import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
// app/layout.tsx: <html lang="en-NG" suppressHydrationWarning> ... <ThemeProvider> ...
```

- **No flash.** `next-themes` injects a tiny blocking script that sets the class before paint. Do not build a custom one.
- **Toggle.** `ThemeToggle` (shared): a 44px icon button opening a shadcn `DropdownMenu` with Light, Dark, and System, labelled "Change theme". Placed in the header, at the bottom of the mobile sheet, and in the admin shell.
- **Browser chrome.** Set `viewport.themeColor` for both schemes (`#FAFAF7` light, `#0B0D22` dark) and `color-scheme` so form controls and scrollbars match.
- **Logos.** The shared `Logo` renders the light and dark variants together and swaps them with CSS (`dark:hidden` and `hidden dark:block`), so there is no JS and no flash.
- **Photos.** Do not tint photographs. Optionally `dark:brightness-90` on large non-hero photos to reduce glare.

**Pairing rule.** Every colour decision is made for both themes:

1. **Prefer semantic tokens.** `text-foreground`, `bg-card`, `border-border` flip automatically and need no `dark:` prefix.
2. **When a colour must be explicit, write the pair together** in the same `className`: the light utility, then its `dark:` utility.
3. **Fixed surfaces keep one colour in both themes.** Text on a hero photo, a hero slide, or the midnight footer is `text-white` in light and dark, because the background does not change. A `dark:text-white` beside it is redundant and should be removed.
4. **Never use a `dark:` utility without its light counterpart**, and never leave a raw colour utility (`text-white`, `bg-white`, `text-black`, `bg-black`, any `[#hex]`) on a themed surface without its pair.

| Intent | Light | Dark | Or use the token |
|---|---|---|---|
| Page background | `bg-paper` | `dark:bg-night` | `bg-background` |
| Headline and body text | `text-midnight` | `dark:text-white` | `text-foreground` |
| Secondary text | `text-stone` | `dark:text-white/70` | `text-muted-foreground` |
| Links, primary action | `text-indigo` | `dark:text-indigo-soft` | `text-primary` |
| Highlight text (not small text on light) | `text-indigo` | `dark:text-gold` | none |
| Soft section | `bg-sky` | `dark:bg-midnight` | `bg-secondary` |
| Hairline border | `border-midnight/15` | `dark:border-white/15` | `border-border` |
| Text on a hero photo or the footer (fixed surface) | `text-white` | `text-white` (same, no `dark:` needed) | none |
| Floating panel | `glass` | `glass` (the utility reads both themes) | none |

Gold is an accent, never a text colour on light backgrounds.

### 3.6 Glass surfaces

A frosted, translucent surface that lets the backdrop show through. Glass only works when something visible sits behind it, and it costs GPU time on low-end phones, so it is reserved for the surfaces below and degrades to solid wherever it would hurt.

```css
:root {
  --glass-bg: rgb(255 255 255 / 0.72);
  --glass-bg-strong: rgb(255 255 255 / 0.88);
  --glass-border: rgb(255 255 255 / 0.65);
  --glass-shadow: 0 8px 32px rgb(20 22 51 / 0.10);
  --glass-blur: 12px;
}
.dark {
  --glass-bg: rgb(20 22 51 / 0.62);
  --glass-bg-strong: rgb(20 22 51 / 0.84);
  --glass-border: rgb(255 255 255 / 0.10);
  --glass-shadow: 0 8px 32px rgb(0 0 0 / 0.35);
}
@media (min-width: 768px) { :root { --glass-blur: 18px; } }

@utility glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
}
@utility glass-strong {
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
}

/* Degrade to solid: unsupported browsers, reduced transparency, data saver */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .glass-strong { background: var(--card); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@media (prefers-reduced-transparency: reduce), (prefers-reduced-data: reduce) {
  .glass, .glass-strong { background: var(--card); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```

**Where glass is used**

| Surface | Treatment |
|---|---|
| Condensed sticky header, mobile bottom quick-action bar | `glass-strong` |
| Sheet, dropdown, popover, dialog surfaces | `glass-strong` |
| Hero carousel arrows, dots, pause button (over any photo) | small `glass` pills, 44px targets |
| Featured sermon card, give details, contact and prayer form panels | `GlassCard` |
| Admin dashboard stat cards, login card | `GlassCard` |

**Where glass is not used:** long reading text, table rows, event and announcement rows (a single glass panel may hold the whole list, but rows inside have no card chrome), admin data tables and forms with many fields (solid `bg-card`), and anything nested inside another glass surface.

**Rules**

- **Contrast first.** Text on glass must meet 4.5:1 against the worst backdrop behind it, in both themes, at every scroll position (the sunrise backdrop moves). Opacity never drops below 0.70 (light) or 0.55 (dark) for body text; use `glass-strong` for anything text-heavy. Glass counts as a semi-solid surface for the rule in section 6.
- **Budget.** At most three blurred layers visible at once on a phone. Blur is capped at 12px on mobile and 18px from `md`. Never put `backdrop-filter` on an element that is itself animated by scroll, and never blur many list items.
- **Degrade.** Unsupported browsers, `prefers-reduced-transparency`, and `prefers-reduced-data` get solid `bg-card` (above). Test the solid fallback as carefully as the glass.
- **One shared component.** Use `GlassCard`, never hand-written blur classes in pages.

```tsx
// components/shared/GlassCard.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const glassCard = cva("rounded-xl border-0 text-card-foreground shadow-none", {
  variants: {
    surface: { glass: "glass", strong: "glass-strong", solid: "border border-border bg-card" },
    padding: { none: "py-0", md: "gap-4 py-5 md:py-6", lg: "gap-6 py-6 md:py-8" },
  },
  defaultVariants: { surface: "glass", padding: "md" },
});

export function GlassCard({
  surface, padding, className, ...props
}: React.ComponentProps<typeof Card> & VariantProps<typeof glassCard>) {
  return <Card className={cn(glassCard({ surface, padding }), className)} {...props} />;
}
```

## 4. Layout and components

### 4.1 Component architecture (reusable first)

shadcn/ui (Radix primitives) is the component foundation. Components are copied into the repo by the CLI, so we own them, but we treat `components/ui` as a vendor layer: change its tokens and variants, not its behaviour.

```
src/components/
  ui/        shadcn/ui primitives (CLI-generated; edit sparingly, note any edit in a comment)
  shared/    our reusable composites, app-agnostic (GlassCard, Section, PageHeader, form fields, ...)
  layout/    SiteHeader, SiteFooter, MobileNav, QuickActionBar, AdminShell, AdminSidebar
  hero/      HeroRenderer, HeroSlideView, HeroCarousel, DefaultHero (section 4.3)
  features/  sermons/, events/, announcements/, gallery/ (public presentation, props only)
  admin/     ResourceTable, ResourceForm, HeroEditor, UserForm, PermissionPicker
  motion/    motion wrappers (section 5)
```

**Initial shadcn/ui set** (add through the CLI on first use, never the whole library): `button`, `card`, `badge`, `input`, `textarea`, `label`, `form`, `select`, `checkbox`, `switch`, `radio-group`, `slider`, `tabs`, `dialog`, `alert-dialog`, `sheet`, `dropdown-menu`, `accordion`, `table`, `skeleton`, `separator`, `sonner`, `carousel`, `tooltip`, `pagination`. Date and time fields use the native `datetime-local` input styled with `Input` (lighter and friendlier on phones than a calendar popover).

**Rules**

1. **Rule of two.** The second time a pattern appears, extract it into `components/shared` (or `admin/`). Three near-identical blocks is a review failure.
2. **Compose, do not fork.** Build shared components by wrapping shadcn primitives. Do not copy a primitive to make a variant; add a variant with `cva`.
3. **Variants, not class overrides.** Differences between uses are props (`surface="strong"`), not ad-hoc `className` strings in pages.
4. **Presentational by default.** Components in `shared/`, `features/`, and `hero/` take data as props. Data fetching lives in the page or a loader, so the same component serves the public page, the admin preview, and the styleguide.
5. **Typed and predictable.** One component per file, named export, typed props, `className` merged through `cn()`, forwards refs and native props where it wraps an element.
6. **Server by default.** A component gets `"use client"` only if it needs state, effects, or browser APIs. Non-interactive shadcn components (`Card`, `Badge`, `Skeleton`, `Separator`, `Table`) stay server components.
7. **Route-group split.** Public routes live in `(public)` and admin in `(admin)`. Admin-only components (`ResourceTable`, `ResourceForm`, `form`, `table`, `slider`) are never imported by public pages, so they never ship to visitors.
8. **Everything is in `/styleguide`.** Each shared component is shown with its variants and states (loading, empty, error, disabled), in both themes.
9. **Admin CRUD is configuration.** Sermons, events, announcements, gallery, hero, and users are built from `ResourceTable` and `ResourceForm` with a column and field config per resource. No page hand-builds its own table or form layout.

**Shared component inventory**

| Component | Built from | Used by |
|---|---|---|
| `GlassCard` | `Card` + `cva` | featured sermon, give, forms, admin stats, login |
| `Section`, `SectionHeading` | semantic `section` + container tokens | every public page |
| `PageHeader` | `h1` + description + actions slot | inner pages, admin pages |
| `MediaRow` | `next/image` + text | sermon lists, related sermons |
| `DateBlock`, `EventRow` | text only | events list, Home, event detail |
| `EmptyState`, `ErrorState`, `ListSkeleton` | `Skeleton` | every list |
| `CopyButton` | `Button` + `sonner` | Give, temporary-password display |
| `ThemeToggle` | `DropdownMenu` | header, mobile sheet, admin shell |
| `Logo` | inline SVG or two images | header, footer, login |
| Form fields: `TextField`, `TextAreaField`, `SelectField`, `SwitchField`, `DateTimeField`, `UrlField`, `ImageUrlField`, `SlugField` | `Form` + `Input` and friends | contact, prayer, every admin form |
| `OptionCardGroup` | `RadioGroup` | hero layout and mode, permission presets |
| `ResourceTable` | `Table`, `Badge`, `DropdownMenu`; cards under 640px | every admin list |
| `ResourceForm` | `Form` + field components + sticky save bar | every admin create and edit |
| `ConfirmDialog` | `AlertDialog` | every destructive action |
| `StatusBadge` | `Badge` | tables, hero status, user status |
| `PermissionPicker` | `Checkbox` group | admin user form |
| `Can`, `usePermissions` | Zustand session snapshot | admin navigation and actions |
| `HeroRenderer` family | section 4.3 | Home, admin hero preview |

### 4.2 Page patterns

**Structure is information.** Do not chop all content into identical cards. Match the form to the content:

| Content | Treatment |
|---|---|
| Sermons | Media rows or a featured large item + compact list; thumbnail, title, preacher, scripture, date; play affordance |
| Events | Date-led list rows (large day number + month), time and venue to the right; no card chrome |
| Announcements | Simple stacked text blocks with a pinned marker; typographic, not boxed |
| Gallery | Mosaic/masonry with varied aspect ratios; lightbox |
| Service times | A confident typographic block, large times, clear days; sits right under the hero |
| Leadership | Portrait-led, generous whitespace, name and role only |

**Navigation.** Desktop: slim sticky header that condenses on scroll (see 5.6) into a `glass-strong` bar, with the `ThemeToggle`. Mobile: menu button opens a shadcn `Sheet` (full height, focus-trapped, ESC closes, scroll locked; all built in) plus a persistent bottom quick-action bar in `glass-strong`: Call, WhatsApp, Directions (≥ 44px targets, respects safe-area insets).

**Buttons.** shadcn `Button` with three variants (`default` filled indigo, `outline`, `ghost`) plus one brand variant, `gold` (gold on midnight, used once per screen, normally the hero's primary action). Min height 44px (`size="lg"` is the default on touch), visible focus ring (2px, offset, `ring` token), press feedback with CSS (`active:scale-[0.98] transition-transform motion-reduce:transition-none motion-reduce:active:scale-100`) rather than a motion component, so buttons stay server-renderable. Label states exactly what happens ("Send prayer request", "Copy account number"), not "Submit".

**Forms.** shadcn `Form` (react-hook-form + zod, the schema shared with the API where possible), `Label`, `Input`, `Textarea`. Labels above fields, large inputs (16px+ to avoid iOS zoom), inline validation on blur, errors that say how to fix ("Enter a phone number like 0803 123 4567") tied to the field with `aria-describedby`, disabled-while-submitting buttons, success states that confirm what happens next. Form libraries load only on pages that contain a form.

**Images.** `next/image` with real dimensions and `sizes`; consistent aspect ratios per context; subtle overlays only where text sits on photos (verify contrast); blur placeholders for large photos; no autoplay video.

**Copy.** Plain, warm, active voice, sentence case, no filler ("Welcome to our website" is filler). Name things by what visitors understand: "Visit us", "Watch a sermon", "Send a prayer request". Empty states invite action ("No events scheduled yet. Check back soon or follow us on Facebook."). Errors explain what happened and the fix; they do not apologise.

### 4.3 Configurable hero (admin-managed)

The hero is content, not code. Staff pick a layout and fill in text and background in the admin (PRD 6.12.5); the site renders it with one set of components. A built-in default hero (church name, welcome line, "Plan your visit", "Watch latest sermon", all from `site.ts`) renders whenever no hero is live, so Home is never empty.

**Modes.** *Single* (one slide) or *Carousel* (2 to 6 slides). Staff can run a carousel today and a single image tomorrow, and schedule tomorrow's hero in advance.

**Layouts** (chosen per slide, so one carousel can mix them):

| Layout | Structure | Background | Best for |
|---|---|---|---|
| Full-bleed | Text over a full-width photo, overlay for contrast | Image (required) | Photo-led welcome, thanksgiving, a church event photo (with consent) |
| Split | Text panel beside an image; on mobile the image sits above the text and stays short | Colour or gradient behind the text; the image is the side media | Event with a poster, sermon series art, announcement with a graphic |
| Text only | Large typographic statement | Colour or gradient | Service time change, urgent notice, a scripture, a closure notice |

**Per-slide content.** Title (required, ≤ 80 characters), subtitle (≤ 200), up to two buttons (label plus link), text alignment (start, center, end), text tone (light or dark).

**Backgrounds.**
- *Image:* URL, alt text (required unless marked decorative), focal point (x and y), overlay strength 0 to 80% (default 40), optional separate mobile image for art direction.
- *Colour:* brand swatch or custom hex.
- *Gradient:* a named preset (`dawn`: midnight to indigo, `daybreak`: indigo to sky, `glow`: midnight with a soft gold light). Presets are defined in tokens; only the key is stored.
- Admin input never becomes raw CSS or HTML.

**Theme behaviour.** A slide's background and text colour are fixed per slide and identical in light and dark (fixed-surface rule, section 3.5). Only the surrounding chrome (header over the hero, glass controls) follows the theme. The built-in default hero is the one hero that is theme-aware.

**Components** (`components/hero/`): `HeroRenderer` (server; picks single or carousel), `HeroSlideView` (renders one slide for its layout), `HeroCarousel` (client island on shadcn `Carousel`/Embla, `next/dynamic` so Single heroes ship no carousel JS), `DefaultHero`. The same `HeroRenderer` powers the admin live preview, so what staff see is what visitors get.

**Carousel behaviour and accessibility**
- Autoplay is **off by default**. An admin may turn it on (interval 5 to 15 s, default 7). When on: it stops on hover, focus within, touch, and any manual interaction; it pauses when the tab is hidden; a visible pause/play button is always present (WCAG 2.2.2); it is forced off under `prefers-reduced-motion`.
- Controls: previous/next buttons and dot buttons on small `glass` pills (≥ 44px, labelled "Go to slide 2 of 4"), swipe, arrow keys.
- Semantics: wrapper `role="region" aria-roledescription="carousel" aria-label="Featured"`; each slide `role="group" aria-roledescription="slide" aria-label="2 of 4"`; off-screen slides are `inert`; the live region is `off` while autoplaying and `polite` otherwise.
- Headings: the first slide's title is the page `h1`; later slides use `h2`.
- Transition: transform and opacity only, 400ms, `ease-out`.

**Performance and stability**
- The first slide is server-rendered with `priority`; later slides' images are lazy. Hero images use `next/image` with `sizes="100vw"` and an `object-position` from the focal point.
- All slides share one fixed height (`min-h-[80svh]` on mobile, capped on desktop) so changing slides never shifts layout.
- Full-bleed text must hold 4.5:1 over the lightest part of the photo after the overlay; below a 25% overlay the editor warns, and for solid colours the server rejects a published slide that fails 4.5:1.

**Choosing a layout** (guidance for the admin help text): a time or venue change gets Text only; an event or series with artwork gets Split; a welcome or celebration photo gets Full-bleed; several things to announce today gets a Carousel, with one message per slide.

## 5. Motion system

### 5.1 The motion budget

Non-user-triggered motion is rationed. For the whole site:

1. **One hero sequence** on first load of Home (≤ 1.2s total), applied to the first slide of the live hero (or the default hero). Later carousel slide changes are user-triggered, not part of this sequence.
2. **One scroll-linked signature**: the "sunrise" sky shift across Home (section 6).
3. **One scroll story**: word-by-word reveal of the church's vision statement or a scripture (About or Home), pinned for a short scroll distance.
4. Everything else is **user-triggered feedback**: menu open/close, lightbox, accordion, button press, form success, toasts, hover/focus states.

Not allowed: fade-up on every section, per-card hover lifts everywhere, looping animations, parallax on more than one or two images, auto-playing carousels (the single exception is a hero carousel an admin has explicitly set to autoplay, under the rules in section 4.3), cursor effects, scroll-jacking (never hijack scroll speed or direction).

### 5.2 Rules

- Animate **transform and opacity only** (plus `clip-path`/`filter` sparingly). Never animate width/height/top/left/box-shadow on scroll.
- Durations: micro 120 to 200ms; UI 200 to 350ms; reveals 400 to 700ms; scroll-linked is driven by scroll, not time. Easing: `[0.22, 1, 0.36, 1]` (smooth out) for entrances; springs `{ type: "spring", stiffness: 260, damping: 30 }` for interactive elements.
- **Reduced motion:** wrap the app in `<MotionConfig reducedMotion="user">`; additionally disable scroll-linked transforms (parallax, pinned story) with `useReducedMotion()` and render the static end state. Hero carousel autoplay is forced off.
- **SSR safety:** motion components need `"use client"`. Keep them in small wrappers so pages remain server components. Initial states must render acceptable content without JS (do not hide content with `opacity: 0` in server HTML for critical text; use `initial` only for non-critical decoration or animate with `whileInView` on below-the-fold items).
- **No layout shift:** reserve space; animate with transforms; never animate into place from `display: none`.
- **Performance:** `will-change` only while animating; limit simultaneous scroll-linked values (≤ 4); use `viewport={{ once: true }}` for reveals; test with 4x CPU throttle; on devices with `prefers-reduced-data` or low memory, drop optional effects.
- **Mobile Safari/Android:** use `svh`/`dvh` instead of `vh` for hero height; no `position: fixed` + transform tricks that jitter with the URL bar; no smooth-scroll libraries by default (they hurt accessibility and performance).
- Import from `"motion/react"` only. Optionally `motion/react-client` when a motion element must be used inside a server component.

### 5.3 Foundation: provider

```tsx
// components/motion/MotionProvider.tsx
"use client";
import { MotionConfig } from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
```

### 5.4 Hero sequence (the one orchestrated load moment)

Headline lines rise out of a mask, then supporting text and actions follow. Critical text remains in the DOM and readable even before JS runs. In the CMS-driven hero (section 4.3) it wraps the first slide only; the built-in default hero uses it too.

```tsx
// components/motion/HeroSequence.tsx
"use client";
import { motion, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const line: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const fade: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroSequence({ lines, children }: { lines: string[]; children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <h1 className="font-display text-balance text-[length:var(--fs-h1)] leading-[1.05]">
        {lines.map((l) => (
          <span key={l} className="block overflow-hidden pb-[0.1em]">
            <motion.span variants={line} className="block">{l}</motion.span>
          </span>
        ))}
      </h1>
      <motion.div variants={fade} className="mt-6">{children}</motion.div>
    </motion.div>
  );
}
```

### 5.5 Reveal (use rarely, for the first meaningful item of a few sections only)

```tsx
// components/motion/Reveal.tsx
"use client";
import { motion } from "motion/react";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 5.6 Scroll-linked header and progress

```tsx
// components/motion/ScrollProgress.tsx  (thin gold reading-progress line; use on sermon detail and long pages only)
"use client";
import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gold" />;
}
```

Header condense: `const { scrollY } = useScroll(); useMotionValueEvent(scrollY, "change", y => setCondensed(y > 24))` (state kept in a tiny Zustand `uiStore` or local state), then toggle classes for height and background with CSS transitions (200ms). Do not animate header height with layout thrash; swap padding via classes.

### 5.7 Parallax image (max one or two on the whole site)

```tsx
// components/motion/ParallaxImage.tsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] md:aspect-[16/10]">
      <motion.div style={reduce ? undefined : { y, scale: 1.18 }} className="absolute inset-0">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}
```

## 6. Signature scroll effect: the "sunrise" sky (Home)

Concept: as the visitor scrolls down Home, the page's backdrop moves from pre-dawn midnight to morning sky, with a soft gold light rising near the horizon. It is slow, quiet, and thematically right (light, grace, new mornings). It is the site's one memorable scroll moment.

Implementation rules:
- A single `position: fixed; inset: 0; z-index: -1` container holds **two or three stacked gradient layers** (midnight, indigo-to-sky, sky-to-paper). Animate each layer's **opacity** from `scrollYProgress` of the Home page; never animate `background` or colour values directly (it repaints).
- A small gold radial "light" element translates upward slightly with scroll and its opacity peaks around the Visit/service-times section.
- Section text colours switch by section using CSS classes (`.on-dark`, `.on-light`) tied to the same progress breakpoints only at section boundaries; verify contrast at every scroll position, especially mid-transition (use solid section backgrounds where text sits to remove the risk).
- Disable on reduced motion (static `bg-background` with a midnight hero).
- Theme-aware: in dark mode the sunrise is a night-to-deep-indigo glow with the same rising gold light, and it never reaches a light tone, so light text stays readable throughout.

```tsx
// components/motion/SunriseBackdrop.tsx
"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export function SunriseBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const dawn = useTransform(scrollYProgress, [0, 0.35], [1, 0]);   // midnight fades out
  const day = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);  // sky fades in
  const lightY = useTransform(scrollYProgress, [0, 0.5], ["20%", "-10%"]);
  const lightO = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.7], [0, 0.9, 0.6, 0]);

  if (reduce) return <div aria-hidden className="fixed inset-0 -z-10 bg-background" />;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      {/* light: sky to paper. dark: deep indigo to night, never a light tone */}
      <motion.div style={{ opacity: day }} className="absolute inset-0 bg-linear-to-b from-sky to-background dark:from-secondary dark:to-background" />
      {/* light: midnight, indigo, sky. dark: night, midnight, deep indigo */}
      <motion.div style={{ opacity: dawn }} className="absolute inset-0 bg-linear-to-b from-midnight via-indigo to-sky dark:from-night dark:via-midnight dark:to-secondary" />
      <motion.div
        style={{
          y: lightY,
          opacity: lightO,
          // --gold is the CSS variable behind the `gold` token
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--gold) 45%, transparent), transparent)",
        }}
        className="absolute left-1/2 top-[55%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full"
      />
    </div>
  );
}
```

Mount it only on Home. Keep it behind solid or semi-solid content surfaces (`bg-background`, `bg-card`, or `glass-strong` at the opacities in section 3.6) so text contrast never depends on mid-transition colours.

## 7. Scroll story: vision statement word reveal

A pinned section where words of the vision statement or a verse brighten as the visitor scrolls. Pin with CSS `position: sticky`, not JS. Use real, church-supplied text only; if none, render the placeholder statically.

```tsx
// components/motion/WordReveal.tsx
"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">{word}</motion.span>;
}

export function WordReveal({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = text.split(" ");

  if (reduce) return <p className="font-display text-[length:var(--fs-h2)] leading-tight">{text}</p>;

  return (
    <div ref={ref} className="relative h-[220svh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <p className="mx-auto max-w-3xl px-5 font-display text-[length:var(--fs-h2)] leading-tight text-balance">
          {words.map((w, i) => {
            const start = i / words.length;
            return <Word key={i} word={w} range={[start * 0.9, Math.min(1, start * 0.9 + 0.12)]} progress={scrollYProgress} />;
          })}
        </p>
      </div>
    </div>
  );
}
```

Guardrails: pinned distance ≤ 2.5 viewport heights; content always readable at the end state; screen readers get the full sentence (the words are real text, not images); never pin forms or critical actions.

## 8. Other motion (user-triggered, keep)

Most of this comes from shadcn/Radix and `tw-animate-css`, so there is little custom motion code.

- **Mobile menu:** shadcn `Sheet` (right side). Slide-in, backdrop fade, focus trap, scroll lock, and ESC/overlay close are built in. Open state lives in a small Zustand store (`useUiStore`) so the quick-action bar and header can close it.
- **Lightbox:** shadcn `Dialog` with `Carousel` inside; Radix traps focus and returns it to the thumbnail on close; arrow keys and swipe come from Embla. Loaded on first open with `next/dynamic`. A shared-element `layoutId` transition is optional and only worth adding if it stays smooth on a low-end phone.
- **Accordion/FAQ:** shadcn `Accordion` (CSS height animation, chevron rotates).
- **Copy to clipboard (Give page):** `CopyButton`; the icon swaps from Copy to Check with a 150ms scale, and a `sonner` toast says "Account number copied".
- **Toasts:** `sonner`, themed with tokens, mounted once in the root layout.
- **Form success:** the form fades to a confirmation panel; no confetti.
- **Count-up numbers:** not used (no stat sections). If ever needed: `useInView` + `animate(0, value, { duration: 1.2, onUpdate })`, once only.

## 9. Page-by-page direction (Home)

1. **Hero (CMS-driven, section 4.3):** the live hero from the admin, otherwise the built-in default (midnight): large church name in the display serif on 2 to 3 lines, welcome sentence, two actions, photograph/logo treatment on the right (desktop) or below (mobile). Gold used only for the primary action and the rising light.
2. **Service times (typographic band):** big times and days, address, "Get directions" and "Call". Solid background for contrast.
3. **Latest sermon (feature + short list):** large thumbnail with play affordance in a `GlassCard` (`strong`); next three as compact rows with no card chrome.
4. **Vision scroll story:** the pinned word reveal.
5. **Events (date-led list)** and **announcement** (typographic).
6. **Invitation to visit / pray / give:** three quiet, differently-treated blocks (not three identical cards): Visit (photo), Pray (text and form link), Give (text and link). 
7. **Footer (midnight):** contact, socials, quick links, privacy.

Every section is reviewed in light and dark. Inner pages inherit tokens and components but use **no** scroll-linked effects beyond the optional reading-progress bar on sermon detail.

## 10. Accessibility and resilience checklist (non-negotiable)

- Keyboard: all interactive elements reachable; visible focus; skip-to-content link; dialogs trap focus and restore it.
- Contrast ≥ 4.5:1 (3:1 for large text and UI boundaries) at every scroll position, in **both themes**, and over glass surfaces (checked against the worst backdrop, and again in the solid fallback).
- `prefers-reduced-motion` respected (provider + static fallbacks).
- Touch targets ≥ 44px; no hover-only functionality.
- Headings in order; landmarks present; images have meaningful `alt` or empty `alt` if decorative.
- Pages usable with JS slow or failing; content not hidden until animation runs.
- 360px width: no horizontal scroll, no cramped tap targets.
- Theme: toggle is keyboard-operable and labelled; no flash of the wrong theme; `color-scheme` set; both themes pass axe.
- Hero carousel: pause control whenever autoplay is on, no autoplay under reduced motion, slide semantics and labels as in section 4.3.

## 11. Performance checklist

- Public first-load JS ≤ 150 KB gzipped; motion wrappers code-split; no heavy libraries (no GSAP, no smooth-scroll libs, no 3D) unless explicitly approved. shadcn components are imported one by one; admin-only components stay in the `(admin)` route group; the carousel (Embla) and the lightbox load only when needed. Run the bundle analyzer in CI and investigate any public route over 130 KB.
- LCP image is the hero asset with `priority`; all others lazy; AVIF/WebP; sized correctly.
- YouTube embeds use a click-to-load facade.
- Scroll-linked work ≤ 4 motion values at once; transforms/opacity only; verified at 4x CPU slowdown and "Slow 4G".
- CLS ≈ 0; fonts do not cause visible layout jump (size-adjust fallbacks via `next/font`); the hero reserves its full height for every slide.
- Glass: ≤ 3 blurred layers on screen on a phone, blur ≤ 12px on mobile, no blur on animated or repeated items; verified at 4x CPU slowdown.

## 12. Pre-ship review (answer each before declaring done)

1. Does the design plan name choices specific to this church, or could it be any church? Revise if generic.
2. Is there exactly one hero moment, one scroll signature, one scroll story, and nothing else autonomous (apart from an admin-enabled hero autoplay that obeys section 4.3)?
3. Are all colours, fonts, radii, and spacings coming from tokens?
4. Do sermons, events, announcements, and gallery each have a form fitted to their content?
5. Is any text unreadable at any scroll position, in reduced-motion mode, in either theme, or on glass in its solid fallback?
6. Is every themed colour either a semantic token or a light/dark pair, and does each fixed surface keep one colour in both themes?
7. Is glass limited to the surfaces in section 3.6, within the layer and blur budget, using `GlassCard` or the `glass` utilities only?
8. Is any markup repeated that should be a shared component? Are admin lists and forms built from `ResourceTable` and `ResourceForm`? Is every shared component in `/styleguide`?
9. Does the hero render correctly for every layout and mode (single, carousel, scheduled, none live), and does the default hero appear when nothing is live?
10. Is every church-specific fact sourced from `site.ts`/DB, and every placeholder visibly a placeholder?
11. Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility; axe clean in light and dark; public bundle within budget; tested on a real mid-range Android.
12. What single decorative element can be removed? Remove it.
