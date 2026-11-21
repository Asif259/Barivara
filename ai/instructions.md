# AI Instructions & Operational Guidelines

> **Target Audience**: Future AI coding agents and automated systems working on the BariVara codebase.  
> **Repository Roots**: `barivara-api` (NestJS Backend), `barivara-web` (Next.js Frontend).

---

## 1. Project-Specific Rules & Tenets

1. **Dual Language First-Class Support (বাংলা & English)**:
   - The user-facing domain is designed for the Bangladesh rental real estate market.
   - All backend error messages and responses MUST provide bilingual text via `Accept-Language: bn` (default) or `Accept-Language: en` (or `?lang=bn|en`).
   - Frontend translations are centralized in `barivara-web/src/lib/translations.ts`. Never hardcode raw strings into UI components without verifying their presence in the language dictionary.
2. **Financial Precision Guarantee**:
   - Never use standard JavaScript `Number` floating-point math for money calculations (rent, dues, fees, penalties, deposits, expenses).
   - Backend database columns use PostgreSQL `Decimal(12, 2)`.
   - Backend calculations MUST use `Decimal.js` via `DecimalUtil` (`barivara-api/src/common/utils/decimal.util.ts`).
   - The global interceptor `TransformInterceptor` converts Prisma `Decimal` instances to serializable numbers at the API boundary.
3. **Atomic Financial Transactions**:
   - Any operation touching payments, payment reversals, agreement status transitions, or rent generation MUST execute inside `prisma.$transaction`.
   - Never update rental agreements or generate monthly rent records outside a transaction block.
4. **Strict Scope & Multi-Tenant Isolation**:
   - BariVara enforces multi-tenancy at the application layer.
   - Every property, unit, tenant, agreement, rent bill, payment, and expense MUST be verified against `userId` (ownership scope) before read, update, or deletion.
   - Never query by entity ID alone (e.g., `findUnique({ where: { id } })`) without verifying that `property.ownerId === userId` or joining through owner hierarchy.
5. **Direct Client-to-Storage File Architecture**:
   - Never implement multipart file upload endpoints on the NestJS backend that buffer or save binary files locally.
   - File uploads must follow the 3-step lifecycle:
     1. `POST /api/v1/files/upload-url` (request signed URL from backend)
     2. `PUT <uploadUrl>` (client directly uploads binary to Supabase Storage)
     3. `POST /api/v1/files/:id/complete` (verify upload in Supabase Storage and activate record)

---

## 2. Architecture Constraints

1. **Backend Technology Stack**:
   - Framework: **NestJS 10** with `@nestjs/platform-express`.
   - Language: **TypeScript 5 (ES2021 target, CommonJS module)**.
   - ORM: **Prisma 5**.
   - Database: **Supabase PostgreSQL**.
   - Storage: **Supabase Storage**.
   - Hosting: **Hostinger Managed Node.js Web App**.
2. **Frontend Technology Stack**:
   - Framework: **Next.js 16 (App Router, Turbopack)**.
   - Language: **TypeScript 5**.
   - Styling: **Tailwind CSS + Radix UI + Lucide React**.
   - State & Cache: **TanStack React Query + Zustand**.
   - Hosting: **Vercel**.
3. **API Contracts & Standard Response Envelope**:
   - Global Prefix: `/api/v1` on all endpoints.
   - Success envelope: `{ success: true, message: string, data: T, meta?: PaginationMeta }`.
   - Error envelope: `{ success: false, message: string, errorCode: string, details?: any }`.
   - Strict DTO Validation: NestJS runs `ValidationPipe` with `whitelist: true, transform: true, forbidNonWhitelisted: true`.
   - Any property sent from the frontend that is not declared with a decorator on the backend DTO triggers HTTP 400 (`VALIDATION_ERROR: property <field> should not exist`).

---

## 3. Discovered Coding Conventions

1. **DTOs and Whitelisting**:
   - All controller endpoints must bind strongly typed DTOs decorated with `class-validator` and `class-transformer`.
   - When introducing fields on the frontend, check the backend DTO first. If the field is optional or mode-dependent (e.g. create vs update), reflect it in both DTOs or strip it before sending.
2. **Date & Timezone Handling**:
   - Dates in the database are stored in UTC ISO-8601 strings.
   - Date calculations, due dates, and reporting periods operate with Dhaka timezone awareness (`Asia/Dhaka`, UTC+6) using `DateUtil` (`barivara-api/src/common/utils/date.util.ts`) and `date-fns-tz`.
3. **Soft Deletion Convention**:
   - Entities (`User`, `Property`, `Unit`, `Tenant`, `RentalAgreement`, `Expense`, `Media`) have a nullable `deletedAt DateTime?` column.
   - Soft-deleted entities MUST be excluded in all queries using `{ deletedAt: null }`.
   - Hard deletion is prohibited on financial or audit-sensitive entities.
4. **Append-Only Payment Ledger**:
   - Payments are never updated or hard-deleted.
   - If a payment is wrong, it is reversed via `POST /api/v1/payments/:id/reverse`, updating status to `REVERSED` and logging an audit record.
5. **Frontend State & API Layer**:
   - UI components must not call `fetch` or `axios` directly; use `apiClient` or exported API services in `barivara-web/src/lib/api.ts`.
   - Global client state is divided cleanly: `auth-store.ts` (Zustand with localStorage persistence) and `language-store.ts` (Zustand with cookie/storage persistence).

---

## 4. Files & Modules Requiring Extra Caution

| File / Module | Reason for Caution |
|---|---|
| `barivara-api/src/payments/payments.service.ts` | Handles financial transactions, balance updates, payment creation, and reversals inside atomic locks. |
| `barivara-api/src/monthly-rents/monthly-rents.service.ts` | Calculates due dates, late fees, rent generation, and overdue status changes. |
| `barivara-api/src/rental-agreements/rental-agreements.service.ts` | Controls unit occupancy transitions (`VACANT` $\leftrightarrow$ `OCCUPIED`), overlap validation, and rent generation. |
| `barivara-api/src/files/storage/supabase-storage.service.ts` | Manages private bucket security, signed upload URLs, and token lifetime. |
| `barivara-api/prisma/schema.prisma` | Core source of truth for the entire database. Schema changes require migration sync. |
| `barivara-web/src/lib/api.ts` | Handles JWT refresh token interceptor queue. Concurrency mistakes here can cause infinite refresh loops. |

---

## 5. Things That Must Not Be Changed Without Explicit User Approval

1. **Database Schema & Migrations**:
   - Do not alter existing table names, column names, or enum types without direct request.
   - Do not run `prisma migrate dev` or `prisma db push` on staging/production without confirmation.
2. **Authentication Protocol & JWT Claims**:
   - Access token and refresh token signing algorithms and claims structure.
   - Do not switch to Supabase Auth without an architectural directive; the project uses custom NestJS JWTs.
3. **CORS & Domain Whitelisting**:
   - Do not loosen CORS settings to `*` or allow wildcards with `credentials: true`.
4. **Business Logic & Due Day Rules**:
   - Due day clamping logic (e.g., clamp to February 28/29) must remain intact to prevent silent calendar bugs.

---

## 6. Testing & Validation Expectations

1. **Unit Tests**:
   - Run `npm run test:unit` in `barivara-api`.
   - Financial calculation logic must maintain 100% test coverage.
2. **Type Checking & Linting**:
   - Backend: `npm run typecheck` (`tsc --noEmit`) and `npm run lint:check`.
   - Frontend: `npm run build` (Next.js Turbopack build verifies all TypeScript types, routes, and JSX).
3. **Build Target Check**:
   - In `barivara-api`, always verify that `dist/src/main.js` is generated properly by running `npm run build`.

---

## 7. Deployment & Release Precautions

1. **Hostinger Node.js Application Settings**:
   - Entry file must always be set to `dist/src/main.js`.
   - Start command: `npm run start:prod` (invoking `node dist/src/main.js`).
   - Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`.
2. **Database Pooling**:
   - Hostinger Node apps should connect to Supabase via the Transaction Pooler (`aws-0-[region].pooler.supabase.com:6543`) with `?sslmode=require&pgbouncer=true`.
3. **Vercel Frontend Configuration**:
   - `NEXT_PUBLIC_API_URL` must include `/api/v1` (e.g., `https://api.yourdomain.com/api/v1`).
   - Never add a trailing slash to `NEXT_PUBLIC_API_URL`.

---

## 8. Security-Sensitive Areas

1. **Row-Level Security (RLS)**:
   - Supabase PostgREST access is locked down (all tables have RLS enabled with default-deny).
   - Only backend connection via `DATABASE_URL` (superuser role) accesses tables.
2. **Password Security**:
   - Passwords are hashed with `argon2`. Never substitute with plain SHA-256 or bcrypt without explicit approval.
3. **Rate Limiting**:
   - `ThrottlerModule` protects `/api/v1/auth/login` (10/min), `/api/v1/auth/register` (10/min), and `/api/v1/auth/forgot-password` (5/min).
