# Project Current State & Architectural Snapshot

> **Date of Snapshot**: October 2026  
> **Repository**: BariVara (বাড়িভাড়া)  
> **Scope**: Full-stack application (`barivara-api` + `barivara-web`)

---

## 1. Project Purpose

BariVara is a bilingual (Bangla-first and English) property and rental management platform designed specifically for Bangladesh's residential and commercial rental real estate market. It enables landlords and property managers to manage properties, units/flats, tenants, rental agreements, automated monthly rent billing, payment collection with receipt generation, property maintenance expenses, and financial summaries.

---

## 2. Technology Stack

### Backend (`barivara-api`)
- **Runtime**: Node.js (v18.x - v22.x LTS)
- **Framework**: NestJS v10.4.15 (Express platform)
- **Language**: TypeScript v5.7.2
- **Database ORM**: Prisma v5.22.0
- **Database Engine**: PostgreSQL 16 (Hosted on Supabase)
- **Object Storage SDK**: `@supabase/supabase-js` v2.114.0
- **Authentication**: `@nestjs/jwt` v10.2.0, `@nestjs/passport` v10.0.3, `argon2` v0.41.1
- **Validation**: `class-validator` v0.14.1, `class-transformer` v0.5.1
- **Math & Money**: `decimal.js` v10.4.3
- **Email Delivery**: `resend` v6.28.1
- **API Documentation**: `@nestjs/swagger` v7.4.2 (Swagger UI available at `/api/docs` in non-prod)
- **Security**: `helmet` v7.2.0, `@nestjs/throttler` v5.2.0

### Frontend (`barivara-web`)
- **Framework**: Next.js v16.3.4 (App Router, Turbopack)
- **Language**: TypeScript v5
- **Styling**: Tailwind CSS v3, Radix UI primitives, Lucide React icons
- **State Management**: Zustand v5 (`auth-store.ts`, `language-store.ts`)
- **Data Fetching & Cache**: TanStack React Query v5
- **HTTP Client**: Axios v1.7.9
- **Form Management**: `react-hook-form` with `@hookform/resolvers/zod` and `zod`
- **UI Notifications**: Sonner (`toast`)

---

## 3. Directory Structure

```text
Barivara/
├── ai/                         # AI context & instructions documentation
├── data/                       # Data schema, relationships, and data-flow documentation
├── barivara-api/               # NestJS Backend API
│   ├── prisma/
│   │   ├── migrations/         # 7 PostgreSQL migrations
│   │   └── schema.prisma       # Prisma schema (11 models)
│   ├── src/
│   │   ├── audit-logs/         # Financial & security event auditing
│   │   ├── auth/               # Login, register, refresh, password recovery
│   │   ├── common/             # Interceptors, filters, guards, decorators, utils
│   │   ├── config/             # Config loader & env validation
│   │   ├── dashboard/          # High-level aggregated statistics
│   │   ├── email/              # Resend email notification service
│   │   ├── expenses/           # Property expense records
│   │   ├── files/              # Supabase storage signed URL management
│   │   ├── health/             # /api/v1/health check
│   │   ├── monthly-rents/      # Rent billing engine & due date calculation
│   │   ├── payments/           # Rent collection & payment reversal
│   │   ├── properties/         # Property building records
│   │   ├── reminders/          # Due date & custom reminders
│   │   ├── rental-agreements/  # Unit lease contracts & status transitions
│   │   ├── reports/            # Monthly income/expense statements & CSV exports
│   │   ├── tenants/            # Tenant directory & NID management
│   │   ├── units/              # Flat/room entities & statuses
│   │   ├── users/              # User profile & signature management
│   │   ├── app.module.ts       # NestJS root application module
│   │   └── main.ts             # Application bootstrap & global pipes
│   ├── package.json
│   └── tsconfig.json
├── barivara-web/               # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, register, forgot-password, reset-password
│   │   │   ├── (dashboard)/    # Dashboard, properties, units, tenants, agreements, rents, payments, expenses, reports, settings
│   │   │   ├── globals.css     # Design tokens & base styling
│   │   │   ├── layout.tsx      # Root HTML & body structure
│   │   │   └── providers.tsx   # React Query & store providers
│   │   ├── components/         # Modals, dialogs, form widgets, tables
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios client & token refresh queue
│   │   │   ├── file-upload.ts  # Direct Supabase upload client
│   │   │   ├── translations.ts # Bilingual dictionary (Bangla & English)
│   │   │   └── types.ts        # Shared TypeScript interfaces
│   │   └── stores/             # Zustand persistent stores
│   ├── package.json
│   └── tailwind.config.ts
└── run.md                      # Local startup reference
```

---

## 4. Backend Architecture & Flow

```text
Client Request (HTTPS)
       │
       ▼
[Helmet & CORS Middleware]
       │
       ▼
[ThrottlerGuard (Rate Limiting)]
       │
       ▼
[JwtAuthGuard (Token Validation)]
       │
       ▼
[ValidationPipe (whitelist: true, transform: true, forbidNonWhitelisted: true)]
       │
       ▼
[Controller] ──► [Service] ──► [Prisma Transaction] ──► [Supabase PostgreSQL]
       │
       ▼
[LoggingInterceptor & TransformInterceptor] ──► Serializes Decimal & Wraps Envelope
       │
       ▼
Client Response: { success: true, message: "...", data: {...} }
```

---

## 5. Frontend Architecture & Flow

```text
User Interaction
       │
       ▼
[Next.js App Router Page]
       │
       ▼
[Zustand Stores] (auth-store, language-store)
       │
       ▼
[TanStack React Query Hook] (useQuery / useMutation)
       │
       ▼
[apiClient (Axios)]
   ├── Request Interceptor: Injects Bearer Token & Accept-Language
   └── Response Interceptor: Catches 401 & Executes Token Refresh Queue
       │
       ▼
Backend API (/api/v1/...)
```

---

## 6. External Services & Integrations

1. **Supabase PostgreSQL**:
   - Connection via connection pooler (`DATABASE_URL`).
   - Row-Level Security enabled with public PostgREST disabled.
2. **Supabase Storage**:
   - Four buckets: `property-images` (public), `tenant-documents` (private), `payment-receipts` (private), `owner-signatures` (private).
   - Pre-signed upload and download URLs generated via `SUPABASE_SERVICE_ROLE_KEY`.
3. **Resend Email API**:
   - Delivers 6-digit password reset OTP emails with Bengali and English templates.
   - Falls back to console logging when `RESEND_API_KEY` is omitted in development.
4. **WhatsApp Web URL Dispatch**:
   - Frontend utility `barivara-web/src/lib/whatsapp-receipt.ts` creates formatted Bangla rent receipts and dispatches them directly via `https://wa.me/{phone}?text={encodedReceipt}`.

---

## 7. Build, Run & Deployment Summary

- **Local Execution**:
  - Backend: `npm run start:dev` (runs on `http://localhost:3000` or `4000`)
  - Frontend: `npm run dev -- -p 3001` (runs on `http://localhost:3001`)
- **Production Build**:
  - Backend: `prisma generate && nest build` $\to$ compiled entry point is `dist/src/main.js`.
  - Frontend: `next build` $\to$ compiled static and server routes via Next.js Turbopack.
- **Production Hosting**:
  - Backend: Hostinger Managed Node.js Web App.
  - Frontend: Vercel.
  - Database & Storage: Supabase.
