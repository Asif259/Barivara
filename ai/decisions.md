# Architecture & Technical Decisions

> Chronological record of architectural, technical, and implementation decisions discovered in the BariVara codebase.

---

## Decision 1: Custom NestJS JWT Authentication Instead of Supabase Auth

- **Decision**: Authenticate users via custom NestJS JWT (Access & Refresh tokens) backed by the application's `users` table, rather than Supabase Auth (`auth.users`).
- **Why it appears to have been made**: Provides full control over credentials, phone/email login identifiers, token expiration policies, audit logging, and eliminates vendor lock-in to Supabase auth client SDKs.
- **Current implementation**: 
  - Password hashing with `argon2`.
  - JWT Access Token (default 15m) + Refresh Token (default 30d).
  - Validated by `JwtAuthGuard` and `JwtStrategy` in `barivara-api/src/common/guards/`.
  - Frontend auto-refreshes tokens via Axios response interceptors in `barivara-web/src/lib/api.ts`.
- **Files/components affected**:
  - `barivara-api/src/auth/*`
  - `barivara-api/src/common/guards/jwt-auth.guard.ts`
  - `barivara-api/src/common/decorators/current-user.decorator.ts`
  - `barivara-web/src/lib/api.ts`
  - `barivara-web/src/stores/auth-store.ts`
- **Known trade-offs**: 
  - Requires maintaining custom password reset, refresh token rotation, and rate-limiting logic on the backend.
  - Supabase client cannot rely on `auth.uid()` for Row Level Security policies.
- **Evidence/source in project**: 
  - `barivara-api/src/auth/auth.service.ts`
  - `prisma/migrations/20260908220000_enable_rls_public_lockdown/migration.sql` (Line 10: `Does NOT create auth.uid() policies (BariVara uses custom NestJS JWTs)`).
- **Reasoning status**: Verified from code and migration comments.

---

## Decision 2: Complete PostgREST Lockdown via Database RLS Default-Deny

- **Decision**: Enable Row-Level Security on all database tables with default-deny on `anon` and `authenticated` roles, revoking all PostgREST access.
- **Why it appears to have been made**: Because custom JWTs are used rather than Supabase Auth, allowing anonymous or authenticated PostgREST access could expose tenant records. Locking down PostgREST forces all database traffic through the NestJS backend via the privileged `postgres` user connection.
- **Current implementation**: 
  - SQL migration `20260908220000_enable_rls_public_lockdown` enables RLS on all 11 tables and `_prisma_migrations`.
  - Revokes table, sequence, and routine privileges from `anon` and `authenticated`.
  - Application-level multi-tenant security is enforced in NestJS services via `userId` scoping.
- **Files/components affected**:
  - `barivara-api/prisma/migrations/20260908220000_enable_rls_public_lockdown/migration.sql`
  - `barivara-api/src/prisma/prisma.service.ts`
- **Known trade-offs**: 
  - Prevents the frontend from using Supabase Realtime or direct Supabase client queries.
  - Multi-tenancy must be strictly validated in every NestJS service method.
- **Evidence/source in project**: 
  - `prisma/migrations/20260908220000_enable_rls_public_lockdown/migration.sql`.
- **Reasoning status**: Verified from migration source and architecture comments.

---

## Decision 3: Direct Client-to-Supabase Storage with Pre-Signed URLs

- **Decision**: Handle all file and document uploads via 3-step signed URLs directly against Supabase Storage rather than streaming binaries through the NestJS backend.
- **Why it appears to have been made**: Keeps the NestJS backend lightweight and completely stateless, prevents server memory exhaustion from large file uploads, and eliminates local filesystem storage dependencies.
- **Current implementation**: 
  1. Client sends file metadata to `POST /api/v1/files/upload-url`.
  2. Backend validates MIME type, size limit, assigns bucket, and creates signed URL via Supabase Storage JS SDK.
  3. Client uploads binary directly to Supabase via HTTP `PUT`.
  4. Client calls `POST /api/v1/files/:id/complete` to verify object existence and activate record.
- **Files/components affected**:
  - `barivara-api/src/files/*`
  - `barivara-api/src/files/storage/supabase-storage.service.ts`
  - `barivara-web/src/lib/file-upload.ts`
- **Known trade-offs**: 
  - Requires a 3-step client-server orchestration.
  - Uncompleted uploads must be cleaned up if the client abandons the upload step.
- **Evidence/source in project**: 
  - `barivara-api/src/files/files.service.ts`
  - `barivara-web/src/lib/file-upload.ts`.
- **Reasoning status**: Verified from implementation.

---

## Decision 4: PostgreSQL `Decimal(12, 2)` & `Decimal.js` for Financial Calculations

- **Decision**: Enforce exact decimal arithmetic across database schemas and application services.
- **Why it appears to have been made**: Standard IEEE-754 floating-point arithmetic introduces rounding inaccuracies (e.g., `0.1 + 0.2 = 0.30000000000000004`), which is unacceptable for rent, late fees, partial payments, and ledger balances.
- **Current implementation**: 
  - Prisma schema defines `Decimal @db.Decimal(12, 2)`.
  - Utility class `DecimalUtil` (`barivara-api/src/common/utils/decimal.util.ts`) wraps `decimal.js`.
  - `TransformInterceptor` converts Prisma `Decimal` instances to standard JSON numbers on the response wire.
- **Files/components affected**:
  - `barivara-api/prisma/schema.prisma`
  - `barivara-api/src/common/utils/decimal.util.ts`
  - `barivara-api/src/common/interceptors/transform.interceptor.ts`
  - `barivara-api/src/payments/payments.service.ts`
  - `barivara-api/src/monthly-rents/monthly-rents.service.ts`
- **Known trade-offs**: 
  - Requires explicit serialization/deserialization when converting Prisma query results to JSON.
- **Evidence/source in project**: 
  - `prisma/schema.prisma`
  - `src/common/utils/decimal.util.ts`.
- **Reasoning status**: Verified from code comments and README.

---

## Decision 5: Append-Only Payment Ledger with Reversal Flow

- **Decision**: Prohibit updating or hard-deleting payment records. Payments can only be marked `COMPLETED` or `REVERSED`.
- **Why it appears to have been made**: Guarantees financial auditability. Landlords and tenants must have an unalterable history of receipts and transaction dates.
- **Current implementation**: 
  - `Payment` model status enum: `COMPLETED | REVERSED`.
  - `payments.service.ts` implements `reversePayment(userId, paymentId, reason)`.
  - Inside a Prisma transaction, reversing a payment re-adds the amount to `monthlyRent.remainingAmount`, decreases `monthlyRent.paidAmount`, recalculates rent status (`PENDING | PARTIAL | OVERDUE`), and records an `AuditLog`.
- **Files/components affected**:
  - `barivara-api/prisma/schema.prisma`
  - `barivara-api/src/payments/payments.service.ts`
  - `barivara-api/src/payments/payments.controller.ts`
- **Known trade-offs**: 
  - Slightly more complex reporting queries that must always filter for `status: COMPLETED`.
- **Evidence/source in project**: 
  - `src/payments/payments.service.ts`.
- **Reasoning status**: Verified from implementation.

---

## Decision 6: Lazy Overdue Status Evaluation Instead of Background Cron Daemon

- **Decision**: Calculate and update overdue rent statuses dynamically on demand during queries (`refreshOverdueStatuses`) rather than running a background `@Cron` daemon.
- **Why it appears to have been made**: Hostinger Managed Node.js and similar container/serverless environments may sleep, restart, or scale across instances. Running persistent background cron workers inside the web process adds complexity and potential duplicate job execution.
- **Current implementation**: 
  - Whenever `findOutstanding` or related rent list endpoints are queried, `refreshOverdueStatuses(userId)` scans past-due pending rents for that owner and updates them to `OVERDUE` in a single query.
- **Files/components affected**:
  - `barivara-api/src/monthly-rents/monthly-rents.service.ts`
- **Known trade-offs**: 
  - Rents are only marked `OVERDUE` in the database when an API query runs; status is not updated in real-time at midnight if no one opens the app.
- **Evidence/source in project**: 
  - `src/monthly-rents/monthly-rents.service.ts` (lines 398, 480-520).
- **Reasoning status**: Inferred from codebase architecture (absence of `@nestjs/schedule` and explicit `refreshOverdueStatuses` calls).

---

## Decision 7: DNS IPv4 Resolution Priority

- **Decision**: Explicitly execute `dns.setDefaultResultOrder('ipv4first')` in `main.ts`.
- **Why it appears to have been made**: Cloud container platforms and hosting providers (Render, Hostinger) frequently lack outbound IPv6 routing or encounter `ENETUNREACH` errors when connecting to dual-stack database hostnames like Supabase.
- **Current implementation**: 
  - Set at the very top of `barivara-api/src/main.ts` inside a try-catch block.
- **Files/components affected**:
  - `barivara-api/src/main.ts`
- **Known trade-offs**: 
  - Outbound connections ignore IPv6 even on networks where IPv6 is faster.
- **Evidence/source in project**: 
  - `src/main.ts` lines 13-19 and commit `ccbb88e` ("ix(email): force IPv4 to prevent ENETUNREACH timeouts on Render").
- **Reasoning status**: Verified from code and commit log.

---

## Decision 8: In-Memory Maps for Password Reset OTPs

- **Decision**: Store password reset OTP codes and temporary reset sessions in JavaScript `Map` instances inside `AuthService`.
- **Why it appears to have been made**: Rapid prototyping without adding schema migrations for short-lived OTP tokens in PostgreSQL.
- **Current implementation**: 
  - `pendingOtps = new Map<string, PendingOtpRecord>()` (expires in 10 minutes).
  - `resetSessions = new Map<string, ResetSessionRecord>()` (expires in 15 minutes).
- **Files/components affected**:
  - `barivara-api/src/auth/auth.service.ts`
- **Known trade-offs**: 
  - Reset tokens and OTPs are lost on process restart.
  - Multi-instance deployments (load balancing across 2+ servers) will fail OTP verification if requests hit different instances.
- **Evidence/source in project**: 
  - `src/auth/auth.service.ts` lines 42-45.
- **Reasoning status**: Verified from code; trade-off inferred from Node.js runtime fundamentals.
