# BariVara (বাড়িভাড়া)

> **Bangla-First Property & Tenancy Management Platform for Bangladesh**  
> Streamlining rental management, tenant ledgers, DESCO/WASA utility splits, and verified rent collection for Bangladeshi property owners and landlords.

---

<p align="center">
  <video src="brag-output/brag.mp4" controls="controls" width="100%" poster="brag-output/brag.jpg">
    <p>Your browser does not support HTML5 video. <a href="brag-output/brag.mp4">Click here to download or view the demo video.</a></p>
  </video>
</p>

<p align="center">
  <a href="brag-output/brag.mp4">
    <img src="brag-output/brag.jpg" alt="BariVara Launch Video Preview" width="100%" style="border-radius: 8px;" />
  </a>
  <br>
  <em>(Click image above to watch the BariVara product showcase video)</em>
</p>

---

## 📌 Table of Contents

1. [Product Overview](#-product-overview)
2. [Verified Feature Matrix](#-verified-feature-matrix)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Repository Structure](#-repository-structure)
6. [Prerequisites](#-prerequisites)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Environment Variables](#-environment-variables)
9. [REST API Documentation](#-rest-api-documentation)
10. [Database Architecture & Prisma ORM](#-database-architecture--prisma-orm)
11. [Authentication & Security](#-authentication--security)
12. [Testing & Quality Assurance](#-testing--quality-assurance)
13. [Deployment Guide](#-deployment-guide)
14. [Troubleshooting Guide](#-troubleshooting-guide)
15. [Contributing](#-contributing)
16. [License](#-license)

---

## 📖 Product Overview

**BariVara (বাড়িভাড়া)** is a modern, culturally grounded property and rental management platform designed specifically for the Bangladeshi rental ecosystem. 

In Bangladesh, residential landlords and commercial property owners typically manage tenancy records in physical paper ledgers (*khatas*), perform manual monthly bill apportionment (electricity meters, WASA water, gas, and service charges), track informal mobile financial service (bKash/Nagad) transactions, and issue paper or verbal receipts.

BariVara transforms this workflow into an automated, transparent, and auditable digital experience while preserving local tenancy conventions:
- **First-Class Dual Language (বাংলা & English)**: Seamless language toggling across both the user interface and generated documents.
- **Bangladeshi Taka (৳) Precision Arithmetic**: Financial math computed using PostgreSQL `Decimal(12, 2)` and `Decimal.js` to eliminate JavaScript IEEE-754 floating-point rounding errors.
- **WhatsApp 1-Click Receipts**: Dynamic generation of formatted payment acknowledgments and rent collection notices with direct `wa.me` links conforming to Bangladesh international phone numbering (`8801...`).
- **Printable A4 Rent Documents with Landlord Signature**: Client-rendered, high-resolution A4 rent notices and receipts with embedded owner signature snapshots.

---

## 🚀 Verified Feature Matrix

Every capability documented below has been verified directly against the implementation in [`barivara-api`](barivara-api) and [`barivara-web`](barivara-web).

### 🟢 Fully Implemented

| Domain | Capability | Implementation Details |
|---|---|---|
| **Property Management** | Multi-Property & Floor Hierarchy | Create, update, soft-delete, and view properties with addresses, total floors, and associated metrics. |
| **Unit Management** | Flat & Commercial Spaces | Manage units by type (`FLAT`, `APARTMENT`, `ROOM`, `SHOP`, `OFFICE`, `PARKING`), status transitions (`VACANT`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`), base rents, and default fees. Supports bulk unit creation. |
| **Tenant Records** | Comprehensive Tenant Profiles | Tenant identification with phone index, emergency contact details, permanent address, occupation, and NID card uploads (front & back). |
| **Rental Agreements** | Tenancy Contracts | Link tenants to specific units with monthly rent, recurring service fees, parking charges, advance security deposits, and contract start/end dates. Prevents overlapping active agreements on the same unit. |
| **Rent Generation** | Automated Monthly Invoicing | Idempotent monthly billing engine (`POST /api/v1/monthly-rents/generate`) with automatic February due-date clamping (28/29 days) and lazy overdue status updates. |
| **Rent Collection** | Atomic Payments & Reversals | Record full or partial payments across multiple methods (`CASH`, `BANK`, `BKASH`, `NAGAD`, `ROCKET`, `CARD`). Automatic ledger updates and atomic transaction reversals executed inside `prisma.$transaction`. |
| **Notices & Receipts** | A4 Document Generation | Generate print-ready and downloadable image/PDF rent notices and money receipts with QR/receipt IDs and landlord signatures using `html2canvas` and `html-to-image`. |
| **WhatsApp Dispatch** | Direct Messaging Links | Automated creation of localized WhatsApp message texts with validated Bangladesh phone numbers (`8801[3-9]...`) and localized Bangla/English numeral formatting. |
| **Owner Signature** | Digital Signature Snapshot | Landlords upload their signature in Settings. The signature is stored securely in Supabase Storage and snapshotted onto payments (`ownerSignatureSnapshotId`) so past receipts remain immutable. |
| **Expense Tracking** | Operating Cost Management | Categorize property expenses (`ELECTRICITY`, `WATER`, `GAS`, `MAINTENANCE`, `REPAIR`, `SECURITY`, `CLEANING`, `SALARY`, `TAX`, `OTHER`) with receipt attachments. |
| **Financial Reporting** | Income & Expense Ledger | Monthly financial reports, property income breakdowns, and CSV export streaming (`/api/v1/reports/monthly/export?format=csv`). |
| **Audit Logging** | Activity Auditing | Tracking of administrative, authentication, and financial operations (`PAYMENT_CREATED`, `PAYMENT_REVERSED`, `RENT_GENERATED`). |
| **Password Recovery** | Email OTP Verification | Request 6-digit password reset OTP sent via Resend API with time-limited verification. |

### 🟡 Partially Implemented / Planned

| Domain | Current Scope | Planned / Future Scope |
|---|---|---|
| **MFS Payment Reconciliation** | **Manual TrxID Matching:** Landlords record transaction IDs (e.g. `BKASH-TX-987123`) when logging bKash/Nagad payments. | Direct MFS Payment Gateway (PGW) API webhooks for automated instant settlement. |
| **Automated Reminders** | **Database Schema & In-App Reminders:** Model `Reminder` exists with channels (`IN_APP`, `SMS`, `EMAIL`, `WHATSAPP`). | Automated cron dispatchers for outbound SMS/WhatsApp gateway webhooks. |

---

## 🛠️ Technology Stack

### Frontend Application (`barivara-web`)

- **Framework**: Next.js 16.3.4 (App Router, React 19.2.8, Server & Client Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, PostCSS, Lucide React icons
- **UI Components**: Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-popover`), Class Variance Authority (`cva`), `clsx`, `tailwind-merge`
- **State Management**: Zustand 5 (Auth & Language state persistence)
- **Data Fetching & Caching**: TanStack React Query v5
- **Form Validation**: React Hook Form 7 with Zod resolvers
- **HTTP Client**: Axios 1.20 with request/response interceptors for Bearer auth and language injection
- **Document & Image Rendering**: `html2canvas`, `html-to-image`, `sonner` toasts

### Backend Application (`barivara-api`)

- **Framework**: NestJS 10.4 (Express platform, Modular architecture)
- **Language**: TypeScript 5.7
- **Database & ORM**: PostgreSQL with Prisma ORM 5.22
- **Precision Math**: `decimal.js` (PostgreSQL `Decimal(12, 2)`)
- **Authentication**: JWT (`@nestjs/jwt`, `passport-jwt`) with Argon2 password hashing
- **Security**: Helmet, `@nestjs/throttler` (Rate limiting), Whitelisted class-validator DTOs
- **File Storage**: Supabase Storage via `@supabase/supabase-js` (presigned direct upload URLs)
- **Email Service**: Resend SDK (`resend`) for password recovery OTP delivery
- **Documentation**: OpenAPI 3.0 / Swagger (`@nestjs/swagger`)
- **Testing**: Jest 29, Supertest 7, `ts-jest`

---

## 🏛️ System Architecture

The BariVara system is structured as an API-first multi-client workspace:

```mermaid
flowchart TD
    subgraph Clients["Clients"]
        Web["Web Application\n(Next.js 16 / React 19)\nhttp://localhost:3001"]
        WhatsApp["WhatsApp Web / App\n(wa.me Direct Dispatch)"]
    end

    subgraph Backend["NestJS 10 REST API (barivara-api)\nhttp://localhost:3000/api/v1"]
        Router["Global Prefix & Versioning (/api/v1)"]
        Guard["Security Pipeline\n(Helmet • Throttler • JWT Guard)"]
        
        subgraph Modules["Application Modules"]
            AuthMod["Auth & Profile Module\n(Argon2 • JWT • Resend OTP)"]
            PropMod["Properties & Units Module"]
            TenantMod["Tenants & Agreements Module"]
            RentMod["Monthly Rent Generation Engine"]
            PayMod["Payments & Atomic Transactions"]
            ExpMod["Expenses & Financial Reports"]
            FilesMod["Files & Media Module"]
        end

        Prisma["Prisma ORM Client\n(Decimal.js • Transaction Isolation)"]
    end

    subgraph External["Data & Cloud Infrastructure"]
        Postgres[("PostgreSQL Database\n(Local Docker or Supabase DB)")]
        Storage["Supabase Storage Buckets\n(Presigned Uploads & Private Media)"]
        Resend["Resend Email API\n(Password Reset Delivery)"]
    end

    Web -->|REST API over Axios\nBearer Auth + Accept-Language| Router
    Web -.->|Generates 1-click links| WhatsApp
    Web -->|Direct Upload via Presigned URL| Storage

    Router --> Guard
    Guard --> Modules
    Modules --> Prisma
    Prisma --> Postgres
    FilesMod --> Storage
    AuthMod --> Resend
```

### Architectural Guarantees
1. **Multi-Tenant Ownership Isolation**: All entity queries filter strictly by the authenticated `userId` / `ownerId` payload. Landlords cannot view, modify, or delete another landlord's data.
2. **Standardized Response Envelope**:
   - Success: `{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }`
   - Error: `{ "success": false, "message": "...", "errorCode": "...", "details": [ ... ] }`
3. **Fail-Safe Decimal Arithmetic**: All rent calculations (rent, service fees, late fees, remaining dues, and expenses) are calculated using `decimal.js` methods before persisting.
4. **Cloud-Ready Networking**: Backend includes `dns.setDefaultResultOrder('ipv4first')` in `main.ts` to prevent cloud hosting IPv6 routing stalls (e.g. Render/Supabase connection timeouts).

---

## 📂 Repository Structure

```text
Barivara/                             # Turborepo + npm Workspaces Monorepo
├── apps/
│   ├── api/                          # NestJS Backend Application (apps/api)
│   │   ├── prisma/
│   │   │   ├── migrations/           # Database migration history
│   │   │   ├── schema.prisma         # Primary Prisma data model definitions
│   │   │   └── seed.ts               # Development test fixtures
│   │   ├── src/
│   │   │   ├── audit-logs/           # Audit trail of system events
│   │   │   ├── auth/                 # Authentication, JWT, Argon2, and OTP
│   │   │   ├── common/               # Filters, interceptors, guards, decorators, errors
│   │   │   ├── config/               # Configuration loader and env validators
│   │   │   ├── dashboard/            # Analytics and metric aggregations
│   │   │   ├── expenses/             # Expense management and categories
│   │   │   ├── files/                # Supabase storage integration & media records
│   │   │   ├── health/               # /api/v1/health monitoring endpoint
│   │   │   ├── monthly-rents/        # Billing generation and due-date logic
│   │   │   ├── payments/             # Payment processing & atomic reversals
│   │   │   ├── prisma/               # Global Prisma Service provider
│   │   │   ├── properties/           # Property CRUD and summaries
│   │   │   ├── reminders/            # Tenant due notices & reminders
│   │   │   ├── rental-agreements/    # Agreement life-cycle & conflict checks
│   │   │   ├── reports/              # Monthly financial reports & CSV streaming
│   │   │   ├── tenants/              # Tenant records, NID storage
│   │   │   ├── units/                # Unit management & status lifecycle
│   │   │   ├── users/                # User profile service
│   │   │   ├── app.module.ts         # Root application module
│   │   │   └── main.ts               # Application bootstrap, Swagger, Helmet, CORS
│   │   ├── docker-compose.yml        # Local PostgreSQL 16 container definition
│   │   ├── package.json              # Backend dependencies and test scripts
│   │   └── tsconfig.json             # TypeScript compiler configuration
│   │
│   └── web/                          # Next.js Frontend Application (apps/web)
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── (auth)/           # Login, register, forgot/reset password
│       │   │   ├── (dashboard)/      # Authenticated landlord workspace
│       │   │   │   ├── agreements/   # Rental agreements directory
│       │   │   │   ├── dashboard/    # KPI metrics & quick actions
│       │   │   │   ├── expenses/     # Property expense logs
│       │   │   │   ├── payments/     # Payment collection logs & receipts
│       │   │   │   ├── properties/   # Property & unit management
│       │   │   │   ├── rents/        # Monthly rent invoicing & batch notices
│       │   │   │   ├── reports/      # Financial summaries & export
│       │   │   │   ├── settings/     # Profile & owner signature upload
│       │   │   │   └── tenants/      # Tenant registry & profiles
│       │   │   ├── layout.tsx        # Global layout with font & metadata
│       │   │   └── page.tsx          # Root route redirecting to dashboard
│       │   ├── components/           # Modular UI, forms, dialogs, documents
│       │   ├── hooks/                # Reusable React hooks
│       │   ├── lib/                  # Axios client, types, translations, WhatsApp util
│       │   └── stores/               # Zustand stores (Auth & Language)
│       ├── package.json              # Frontend dependencies and Next scripts
│       └── tsconfig.json             # Frontend TypeScript configuration
│
├── package.json                      # Monorepo root workspaces & Turborepo scripts
├── turbo.json                        # Turborepo task pipeline configuration
├── brag-output/                      # Product launch showcase video & poster
│   ├── brag.mp4                      # Full 20s launch video
│   ├── brag.jpg                      # Settled poster thumbnail
│   ├── brag-plan.md                  # Storyboard and creative angles
│   └── share-copy.txt                # Social release copy
│
├── backend_api_reference.md          # Comprehensive backend endpoint reference
├── DESIGN.md                         # Design system tokens and UI rationale
├── PRODUCT.md                        # Product requirements and domain constraints
└── run.md                            # Development startup command reference
```

---

## ⚙️ Prerequisites

Before running the project locally, ensure you have the following installed:

| Requirement | Supported Version | Notes |
|---|---|---|
| **Node.js** | `>= 18.0.0 < 23.0.0` | NestJS engine constraint specified in `barivara-api/package.json`. Node 20 LTS recommended. |
| **npm** | `>= 9.0.0` | Standard package manager used across both sub-projects. |
| **PostgreSQL** | `15` or `16` | Required for `barivara-api`. Can be run locally via Docker (`docker-compose.yml`) or Supabase. |
| **Docker & Compose** | Optional | Recommended for zero-setup local PostgreSQL. |
| **Supabase Project** | Optional for local core | Required if testing file uploads (NID, signature, receipts). |

---

## 💻 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Barivara
```

### 2. Configure Backend (`barivara-api`)

#### A. Install Dependencies
```bash
cd barivara-api
npm install
```

#### B. Setup Environment Variables
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL instance. For local Docker setup:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barivara?schema=public"
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-min-32-chars-long"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-min-32-chars-long"
FRONTEND_URL="http://localhost:3000,http://localhost:3001,https://barivara-web.vercel.app"
```

#### C. Start Local PostgreSQL Database (Docker)
```bash
docker-compose up -d
```

#### D. Run Database Migrations & Seed Data
```bash
# Push schema or run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed initial test data (Admin owner, properties, units, tenants)
npx prisma db seed
```

#### E. Start Backend Server
```bash
# Development mode with hot reload
npm run start:dev
```
The backend API will be running at **`http://localhost:3000/api/v1`**.  
Interactive Swagger documentation is available at **`http://localhost:3000/api/docs`**.

---

### 3. Configure Frontend (`barivara-web`)

Open a new terminal window:

#### A. Install Dependencies
```bash
cd barivara-web
npm install
```

#### B. Setup Environment Variables
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```
Configure the API endpoint:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

#### C. Start Frontend Development Server
Since port 3000 is occupied by the API server, run the web application on **port 3001** (as configured in [`run.md`](run.md)):
```bash
npm run dev -- -p 3001
```
The web dashboard is now accessible at **`http://localhost:3001`**.

---

## 🔐 Environment Variables

### Backend Environment Variables (`barivara-api/.env`)

> [!CAUTION]
> **Server-Side Secrets**: These variables contain private database credentials, JWT keys, and third-party API tokens. They must **NEVER** be committed to public version control or exposed to client-side bundles.

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | No | `3000` | Port on which the NestJS backend listens. |
| `NODE_ENV` | Yes | `development` | Environment mode (`development`, `production`, `test`). |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/barivara?schema=public` | PostgreSQL connection string. |
| `JWT_ACCESS_SECRET` | Yes | `your-secure-access-secret-32-chars` | Signing key for short-lived access tokens. |
| `JWT_REFRESH_SECRET` | Yes | `your-secure-refresh-secret-32-chars` | Signing key for long-lived refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | No | `30d` | Expiration time for access tokens. |
| `JWT_REFRESH_EXPIRES_IN`| No | `60d` | Expiration time for refresh tokens. |
| `FRONTEND_URL` | Yes | `http://localhost:3001,https://barivara-web.vercel.app` | Comma-separated whitelisted CORS origins. |
| `SUPABASE_URL` | Optional | `https://your-project.supabase.co` | Supabase project URL for presigned file storage. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | `your-supabase-service-role-key` | Service role key with administrative storage access. |
| `MAX_IMAGE_SIZE_MB` | No | `5` | Maximum allowed file size for image uploads. |
| `MAX_DOCUMENT_SIZE_MB` | No | `10` | Maximum allowed file size for document uploads. |
| `RESEND_API_KEY` | Optional | `re_your_api_key_here` | API key for Resend email delivery (password reset OTP). |
| `RESEND_FROM` | Optional | `BariVara <onboarding@resend.dev>` | Verified sender email address for Resend. |

### Frontend Environment Variables (`barivara-web/.env.local`)

| Variable Name | Required | Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000/api/v1` | Public REST API base URL accessible by browser clients. |
| `NEXT_PUBLIC_SITE_URL` | No | `https://barivara-web.vercel.app` | Canonical site origin for SEO metadata and OpenGraph tags. |

---

## 📡 REST API Documentation

- **Base Path**: `/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/docs` (available in non-production environments)
- **Authentication**: Bearer Token (`Authorization: Bearer <accessToken>`)
- **Localization Header**: `Accept-Language: bn` (default) or `Accept-Language: en` (or query param `?lang=en|bn`)

### Standard Response Structure

#### Success (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "সফলভাবে সম্পন্ন হয়েছে",
  "data": { ... },
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Error (`400`, `401`, `403`, `404`, `409`, `429`)
```json
{
  "success": false,
  "message": "অনুরোধটি সঠিক নয়",
  "errorCode": "VALIDATION_FAILED",
  "details": ["ফোন নম্বর আবশ্যক"]
}
```

### Verified API Endpoints

| Category | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **System** | `GET` | `/api/v1/health` | System and PostgreSQL connectivity status | No |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new landlord account | No (Rate-limited: 10/min) |
| **Auth** | `POST` | `/api/v1/auth/login` | Login via email or phone | No (Rate-limited: 10/min) |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Obtain new access token via refresh token | No (Rate-limited: 20/min) |
| **Auth** | `POST` | `/api/v1/auth/logout` | Invalidate current session | Yes |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| **Auth** | `POST` | `/api/v1/auth/change-password` | Update password for active session | Yes |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Request email OTP for password recovery | No (Rate-limited: 5/min) |
| **Auth** | `POST` | `/api/v1/auth/verify-password-reset-otp` | Validate 6-digit password reset OTP | No (Rate-limited: 10/min) |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Reset password using verified OTP | No (Rate-limited: 5/min) |
| **Properties** | `POST` | `/api/v1/properties` | Create a property | Yes |
| **Properties** | `GET` | `/api/v1/properties` | List properties (paginated, searchable) | Yes |
| **Properties** | `GET` | `/api/v1/properties/:id` | Get property details | Yes |
| **Properties** | `GET` | `/api/v1/properties/:id/summary` | Current month financial & unit occupancy summary | Yes |
| **Properties** | `PATCH` | `/api/v1/properties/:id` | Update property attributes | Yes |
| **Properties** | `DELETE` | `/api/v1/properties/:id` | Soft-delete property | Yes |
| **Units** | `POST` | `/api/v1/properties/:propertyId/units` | Create individual unit under property | Yes |
| **Units** | `POST` | `/api/v1/properties/:propertyId/units/bulk` | Bulk create multiple units | Yes |
| **Units** | `GET` | `/api/v1/properties/:propertyId/units` | List all units for a property | Yes |
| **Units** | `GET` | `/api/v1/units/:id` | Get unit details | Yes |
| **Units** | `PATCH` | `/api/v1/units/:id` | Update unit status, rent, or specifications | Yes |
| **Units** | `DELETE` | `/api/v1/units/:id` | Soft-delete unit | Yes |
| **Tenants** | `POST` | `/api/v1/tenants` | Create tenant record | Yes |
| **Tenants** | `GET` | `/api/v1/tenants` | List tenants with unit & agreement summaries | Yes |
| **Tenants** | `GET` | `/api/v1/tenants/:id` | Detailed tenant profile, NID files, and rent ledger | Yes |
| **Tenants** | `PATCH` | `/api/v1/tenants/:id` | Update tenant details | Yes |
| **Tenants** | `DELETE` | `/api/v1/tenants/:id` | Soft-delete tenant | Yes |
| **Agreements** | `POST` | `/api/v1/rental-agreements` | Create tenancy agreement and occupy unit | Yes |
| **Agreements** | `GET` | `/api/v1/rental-agreements` | List agreements | Yes |
| **Agreements** | `GET` | `/api/v1/rental-agreements/:id` | Get agreement details | Yes |
| **Agreements** | `POST` | `/api/v1/rental-agreements/:id/end` | Terminate agreement & release unit to `VACANT` | Yes |
| **Monthly Rent**| `POST` | `/api/v1/monthly-rents/generate` | Bulk generate rent bills for active agreements | Yes |
| **Monthly Rent**| `GET` | `/api/v1/monthly-rents` | List monthly rent bills (filters: property, status) | Yes |
| **Monthly Rent**| `GET` | `/api/v1/monthly-rents/outstanding`| List overdue and unpaid rent bills | Yes |
| **Monthly Rent**| `GET` | `/api/v1/monthly-rents/:id` | Get single rent bill invoice details | Yes |
| **Payments** | `POST` | `/api/v1/payments` | Record full/partial rent payment | Yes |
| **Payments** | `GET` | `/api/v1/payments` | List payment ledger history | Yes |
| **Payments** | `GET` | `/api/v1/payments/:id` | Get payment receipt with snapshot signature | Yes |
| **Payments** | `POST` | `/api/v1/payments/:id/reverse` | Reverse a payment atomically inside transaction | Yes |
| **Expenses** | `POST` | `/api/v1/expenses` | Record property expense | Yes |
| **Expenses** | `GET` | `/api/v1/expenses` | List categorized expenses | Yes |
| **Expenses** | `DELETE` | `/api/v1/expenses/:id` | Remove expense record | Yes |
| **Reports** | `GET` | `/api/v1/reports/monthly` | Monthly income vs expense summary | Yes |
| **Reports** | `GET` | `/api/v1/reports/monthly/export` | Stream monthly financial ledger as CSV | Yes |
| **Dashboard** | `GET` | `/api/v1/dashboard/overview` | KPI overview (Occupancy, Expected, Collected) | Yes |
| **Files** | `POST` | `/api/v1/files/upload-url` | Request signed Supabase upload URL | Yes |
| **Files** | `POST` | `/api/v1/files/:id/complete` | Mark upload as completed | Yes |
| **Files** | `GET` | `/api/v1/files/:id/url` | Obtain public or signed time-limited download URL | Yes |
| **Files** | `DELETE` | `/api/v1/files/:id` | Soft-delete file & remove object from storage | Yes |

---

## 🗄️ Database Architecture & Prisma ORM

The persistence layer uses PostgreSQL managed through Prisma ORM (`barivara-api/prisma/schema.prisma`).

### Core Data Models

- **`User`**: Property owners and administrators. Holds authentication credentials (`passwordHash`), role, and `signatureFileId`.
- **`Property`**: Multi-unit buildings with address, floors, owner association, and soft-delete (`deletedAt`).
- **`Unit`**: Individual flats or commercial spaces belonging to a property. Tracks base rent, default service fees, and occupancy status (`VACANT`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`).
- **`Tenant`**: Renters associated with properties. Tracks contact info, occupation, emergency contacts, and NID card media IDs.
- **`RentalAgreement`**: Legal binding contract between tenant and unit. Enforces `dueDay` (e.g. 5th of each month), monthly rent, deposit, and status (`ACTIVE`, `ENDED`, `CANCELLED`).
- **`MonthlyRent`**: Monthly rent invoices. Enforces unique constraint `@@unique([agreementId, year, month])` preventing duplicate bill creation. Tracks `rent`, `serviceFee`, `parkingFee`, `extraCharge`, `lateFee`, `discount`, `paidAmount`, `remainingAmount`, and status (`PENDING`, `PARTIAL`, `PAID`, `OVERDUE`).
- **`Payment`**: Financial records of rent payments. Links to `MonthlyRent`, tracks `amount`, `paymentMethod` (`CASH`, `BANK`, `BKASH`, `NAGAD`, etc.), `transactionId`, `ownerSignatureSnapshotId`, and status (`COMPLETED`, `REVERSED`).
- **`Expense`**: Operating costs categorized by utility and maintenance types (`ELECTRICITY`, `WATER`, `GAS`, `MAINTENANCE`, `SALARY`, etc.).
- **`Media`**: File registry tracking uploaded assets (NID images, receipts, landlord signatures) stored in Supabase Storage with status tracking (`PENDING`, `COMPLETED`, `FAILED`).
- **`AuditLog`**: System and financial audit trail storing actor, action, IP address, user-agent, and metadata changes.

### Migrations & Integrity Protections
- **Foreign Key Constraints with Cascade / SetNull**: Deleting a property safely cascades to units and agreements; user deletion sets nullable creator references.
- **Compound Indexes**: Optimized for queries like `[agreementId, year, month]`, `[ownerId]`, `[scheduledAt, status]`, and `[propertyId, expenseDate]`.
- **Financial Immutability**: Payments are append-only. Payment corrections are performed via an audited reversal workflow (`POST /payments/:id/reverse`) that recalculates the remaining rent balance.

---

## 🔒 Authentication & Security

1. **Password Hashing**: Uses modern **Argon2** algorithm with automated salt generation.
2. **Stateless JWT Tokens**:
   - Access Token: Short-lived Bearer token signed with `JWT_ACCESS_SECRET`.
   - Refresh Token: Stored and validated against `JWT_REFRESH_SECRET` for seamless rotation.
3. **Strict Rate Limiting (`@nestjs/throttler`)**:
   - Authentication endpoints (`/login`, `/register`) restricted to 10 requests/minute.
   - Password reset endpoints restricted to 5 requests/minute.
   - General API endpoints throttled at 120 requests/minute.
4. **Security Headers**: Configured via **Helmet** to protect against clickjacking, cross-site scripting (XSS), and MIME sniffing.
5. **CORS Security**: Strictly matches origins against configured `FRONTEND_URL`. In production, regex matching ensures unauthorized third-party domains are rejected.
6. **Input Sanitization**: Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strips unexpected payload properties.
7. **Secure File Uploads**: Client uploads bypass the API server directly to Supabase Storage via short-lived, presigned upload URLs. File mime-types and size limits are verified before completion.

---

## 🧪 Testing & Quality Assurance

### Verified Test Results

All test suites and static analysis tools have been executed and verified directly against the codebase:

```bash
# Backend unit & integration test suite (Jest)
cd barivara-api
npm test
```
**Status: 23 passed, 23 total suites | 228 passed, 228 total tests**

### Available Quality Commands

#### Backend (`barivara-api`)
```bash
# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Check code coverage
npm run test:cov

# Run End-to-End tests
npm run test:e2e

# Run TypeScript typecheck without emitting output
npm run typecheck

# Run ESLint check
npm run lint:check
```

#### Frontend (`barivara-web`)
```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Production build verification
npm run build
```

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

The Next.js frontend is optimized for deployment on Vercel:

1. Connect the GitHub repository to Vercel and set the **Root Directory** to `barivara-web`.
2. Configure Environment Variables in the Vercel dashboard:
   ```ini
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
   NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
   ```
3. Deploy. Build command defaults to `next build`.

### Backend Deployment (Render / Hostinger VPS / Docker)

The NestJS backend can be deployed to container platforms (such as Render) or standard Linux VPS environments (such as Hostinger):

#### 1. Production Build & Start Commands
```bash
cd barivara-api
npm install --omit=dev
npx prisma generate
npm run build
npm run start:prod
```

#### 2. Applying Production Migrations
Always run Prisma deployment migrations in your CI/CD pipeline before starting the production server:
```bash
npx prisma migrate deploy
```

#### 3. Health Check Verification
After deployment, verify that the application and database connectivity are healthy:
```bash
curl -X GET https://your-api-domain.com/api/v1/health
```
Expected output:
```json
{
  "message": "সার্ভার সচল রয়েছে",
  "data": {
    "status": "ok",
    "database": "up",
    "timestamp": "2026-10-19T10:00:00.000Z"
  }
}
```

---

## ❓ Troubleshooting Guide

### 1. Port Conflict (`EADDRINUSE: port 3000`)
- **Cause**: Both NestJS and Next.js default to port 3000.
- **Solution**: Run the backend on port 3000 and start the frontend on port 3001 using:
  ```bash
  cd barivara-web && npm run dev -- -p 3001
  ```

### 2. Database Connection Issues (`P1001: Can't reach database server`)
- **Cause**: PostgreSQL is not running or the connection string is incorrect.
- **Solution**:
  - If using Docker, ensure the container is running: `docker-compose ps` (or restart with `docker-compose up -d`).
  - If using Supabase, ensure you are using port `5432` with `?sslmode=require` or the transaction pooler on port `6543`.

### 3. Prisma Client Generation (`@prisma/client did not initialize yet`)
- **Cause**: Prisma Client was not re-generated after schema changes.
- **Solution**:
  ```bash
  cd barivara-api
  npx prisma generate
  ```

### 4. CORS Errors on Web Dashboard
- **Cause**: The frontend URL is not included in the backend's whitelisted CORS origins.
- **Solution**: Check `barivara-api/.env` and ensure `FRONTEND_URL` includes the exact URL and port of your frontend (e.g. `FRONTEND_URL="http://localhost:3001"`).

### 5. Cloud Container IPv6 Timeouts (Render / Cloud VPS)
- **Cause**: Cloud providers lacking IPv6 outbound routing may stall when attempting to connect to PostgreSQL over IPv6.
- **Solution**: This has been pre-configured in `barivara-api/src/main.ts` via `dns.setDefaultResultOrder('ipv4first')`. Ensure your cloud environment runs Node.js 18+.

---

## 🤝 Contributing

Contributions to BariVara are welcome:

1. Check existing issues or open a discussion before implementing large architectural changes.
2. Follow standard coding styles:
   - Run `npm run format` and `npm run lint:check` in `barivara-api`.
   - Run `npm run lint` and `npx tsc --noEmit` in `barivara-web`.
3. Ensure all automated tests pass (`npm test` in `barivara-api` must maintain 100% pass rate).
4. Submit pull requests against the `main` branch.

---

## 📄 License

This repository is currently private and proprietary. No open-source license is granted. All rights reserved by the BariVara development team.
