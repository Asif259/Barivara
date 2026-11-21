# BariVara Architecture Overview (Security Audit)

## Application Profile

**BariVara** (বাড়িভাড়া) is a Bangla-first property & rental management dashboard for residential and commercial property owners in Bangladesh.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend framework | NestJS (Express) | v10.4.15 |
| Language | TypeScript | ~5.x |
| Database | PostgreSQL (via Prisma ORM) | PG 15+ / Prisma 5.22 |
| Auth | JWT (access + refresh) with Argon2 hashing | passport-jwt, argon2 |
| File storage | Supabase Storage (presigned URLs) | @supabase/supabase-js v2.114 |
| Email | Resend API | resend SDK |
| Frontend | Next.js (App Router) | v16.3.4 / React 19 |
| State | TanStack Query + Zustand (persisted to localStorage) | v5.102 / v5.10 |
| UI | Radix UI + Tailwind CSS v4 | Shadcn-style |

## Deployment Architecture

- **API:** NestJS server listening on port 4000 (dev) behind a global `/api/v1` prefix
- **Frontend:** Next.js server-side rendered app connecting to API via Axios
- **Database:** PostgreSQL (likely Supabase or Render)
- **Storage:** Supabase Storage (separate from DB)
- **Email:** Resend HTTPS API

## API Structure

### Global middleware/pipes
- `helmet()` — security headers (default config)
- `ValidationPipe` — whitelist, forbidNonWhitelisted, auto-transform
- `ThrottlerGuard` (global) — 120 req/min default
- `HttpExceptionFilter` — Never leaks stack traces, Prisma error codes, or internals
- `TransformInterceptor` — Wraps responses in `{ success, message, data, meta }`
- `JwtAuthGuard` — Applied per-controller (most controllers); respects `@Public()` decorator
- Swagger UI — Available at `/api/docs` in non-production only

### Authentication flow
1. `POST /auth/register` — Creates user with Argon2-hashed password
2. `POST /auth/login` — Validates credentials, returns access + refresh JWT
3. `POST /auth/refresh` — Validates refresh token, returns new access token
4. `POST /auth/logout` — Audit log only (no token invalidation)
5. `POST /auth/forgot-password` — Sends 6-digit OTP via email
6. `POST /auth/verify-password-reset-otp` — Validates OTP, returns `resetToken`
7. `POST /auth/reset-password` — Uses `resetToken` to set new password
8. `POST /auth/reset-password-direct` — Change password with current password
9. `POST /auth/change-password` — Authenticated user changes password

### Data Model

Key models are nested under `User → Property → Unit → RentalAgreement → MonthlyRent → Payment
All resources scoped via `ownerId`/createdById` chains via Prisma schema.

### Multi-tenant isolation
- Properties are owned by `ownerId` on User model. All CRUD operations verify ownership at the service layer.

## Identified Security Defenses (Source Evidence

- **1. No JWT revocation mechanism** — logout is audit-only, no invalidation
- **2. In-memory OTP/reset session store** — `Map<string, PendingOtpRecord>` and `Map<string, ResetSessionRecord>` in auth service, not persisted, not shared across instances
- **3. Supabase Service Role Key** used for file operations — bypasses RLS
- **4. JWT payload includes PII** (`email`, `phone`) in addition to `sub` and `role`
- **5. Long token lifetimes** — `.env.example` suggests 30d access, 60d refresh
- **6. Direct `process.env.RESEND_API_KEY` access** in email.service.ts bypasses ConfigService validation
- **7. `CORS `origin` allowed for non-browser clients(by design, missing origins allowed)**
- **8. Next.js has zero custom security headers** configured**