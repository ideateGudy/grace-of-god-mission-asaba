# Grace of God Mission Asaba design plan

## Direction

The Dawn palette uses midnight `#141633`, indigo `#2E3192`, sky `#DCE6F7`, gold `#D9A441`, and paper `#FAFAF7`; night `#0B0D22` and indigo-soft `#A5A9F7` provide dark companions. Newsreader is reserved for display headings and Figtree for UI and body copy. The layout prioritizes a direct welcome, service information, and the latest teaching, with a calm rhythm and a single sunrise scroll signature. No church logo or verified identity assets were present, so the text wordmark and explicitly marked church detail placeholders remain replaceable.

## Home wireframe

Mobile:

```text
[wordmark] [menu]
[welcome / hero]
[service time + location]
[latest sermon]
[vision statement]
[events + announcement]
[visit / pray / give]
[contact + footer]
```

Desktop:

```text
[wordmark] [about visit sermons events contact give]
[welcome / text              hero media]
[service time] [location] [directions]
[latest sermon feature] [next teachings]
[vision statement]
[events] [announcement]
[visit] [pray] [give]
[contact + footer]
```

## Principles

1. Church facts stay in `config/site.ts` or the CMS; unknown facts are visibly marked for confirmation.
2. Motion is limited to the hero reveal, Home sunrise, and optional vision word reveal; reduced-motion users get static content.
3. Glass is reserved for floating and featured surfaces. Other content uses semantic colors and solid surfaces in both themes.

## Pre-ship review

- The brand currently uses the specified fallback palette because supplied logo and photography were not available in the repository.
- Local verification completed: the latest Next.js production build succeeded; client TypeScript and ESLint checks passed; backend TypeScript, build, lint, and unit tests passed (9 tests); shared types compiled and typechecked.
- The Next.js 16 Turbopack bundle analyzer completed and wrote a static report to `.next/diagnostics/analyze`. The report is available for route and dependency inspection; it does not establish the Lighthouse or mobile gzipped-bundle budgets by itself.
- Browser coverage is implemented for the public home, 360px overflow, keyboard operation and focus restoration in mobile navigation, light/dark theme switching, reduced-motion hero behavior, sermons, contact submission, admin login/dashboard, mobile sermon creation, limited-permission admin creation, hero editing, cache-revalidation authorization, forced password change, and axe checks for Home, Sermons, Contact, and the Admin dashboard in both themes. The separate development-only styleguide render test passed. A production browser run reached the final axe checks but was interrupted after the browser stopped producing output, so that run is inconclusive and must not be treated as a passing accessibility audit.
- Backend database E2E tests cover login/password changes, session invalidation, user permissions and protections, the single-super-admin constraint, and sermon access. They are guarded to require a dedicated localhost database ending in `_test` and have not run because the available local database credentials are invalid and no dedicated test database is configured.
- Theme switching, reduced motion, keyboard flows, and glass contrast still need a deliberate rendered review before launch. The browser checks currently do not establish the full F10 checklist.
- Production Lighthouse scores, real Android form submission, and CDN/deployment behavior require configured production services and a physical device. No production deployment was performed.
- Before launch, replace the explicitly marked church details in `config/site.ts`, provide approved brand assets and production domains/secrets, provision the isolated test database, then complete the remaining F10 checks against the deployed site and a real device.
