# @ggm/types

Shared TypeScript contracts, types, and Zod validation schemas for the Grace of God Mission Asaba project.

This package acts as the single source of truth between the **`server`** (NestJS) and **`client`** (Next.js) applications.

---

## 📦 Contents

- **`auth.schemas.ts`**: Authentication DTOs (`loginSchema`, `changePasswordSchema`, `SessionUser`).
- **`permissions.ts`**: Role definitions (`SUPER_ADMIN`, `ADMIN`) and granular permission flags (`SERMONS_MANAGE`, `EVENTS_MANAGE`, `ANNOUNCEMENTS_MANAGE`, `GALLERY_MANAGE`, `HERO_MANAGE`, `CONTACT_INBOX`, `PRAYER_INBOX`).
- **`content.schemas.ts`**: Zod schemas and TypeScript types for sermons, events, announcements, and photo gallery items.
- **`hero.schema.ts`**: Configurable homepage hero layout schemas (Single vs. Carousel, transitions, overlay, focal points, slide schemas).
- **`messages.schemas.ts`**: Contact message and prayer request submission schemas with honeypot fields.
- **`users.schemas.ts`**: Administrator user management schemas and temporary password generation types.
- **`api.types.ts`**: Standard JSON envelope response types (`{ data: T }` and `{ data: T[], meta: { page, limit, total } }`).

---

## 🛠️ Usage

This workspace package is consumed internally via `workspace:*`:

```typescript
import { loginSchema, type SessionUser, type Permission } from "@ggm/types";
```

### Build Command
Compile TypeScript declarations to `dist/`:
```bash
pnpm --filter @ggm/types build
```

### Typecheck Command
Verify type definitions:
```bash
pnpm --filter @ggm/types typecheck
```
