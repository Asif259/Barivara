# BariVara (বাড়িভাড়া)

> **Bangla-First Property, Rental & Tenancy Management Monorepo for Bangladesh**  
> An automated, culturally grounded property-tech platform tailored for Bangladeshi residential landlords, homeowners, and property managers. Streamlines rental collection, tenant ledgers, DESCO/WASA utility bill splits, bKash/Nagad reconciliations, and verified A4/WhatsApp rent receipts.

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-10.4.15-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

---

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
2. [Key Features](#-key-features)
   - [Landlord & User Features](#landlord--user-features)
   - [Security & Architecture Features](#security--architecture-features)
3. [Visual Tour & Screenshots](#-visual-tour--screenshots)
   - [Public & Onboarding Views](#1-public--onboarding-views)
   - [Landlord Dashboard & Property Operations](#2-landlord-dashboard--property-operations)
   - [Tenant Directory & Profiles](#3-tenant-directory--profiles)
   - [Monthly Billing, Payments & Expense Tracking](#4-monthly-billing-payments--expense-tracking)
   - [Financial Analytics & Settings](#5-financial-analytics--settings)
   - [Mobile Experience](#6-mobile-experience)
4. [Tech Stack](#-tech-stack)
5. [Monorepo Project Structure](#-monorepo-project-structure)
6. [Prerequisites](#-prerequisites)
7. [Getting Started (Installation & Local Setup)](#-getting-started-installation--local-setup)
8. [Configuration & Environment Variables](#-configuration--environment-variables)
9. [Available Scripts & Workflows](#-available-scripts--workflows)
10. [REST API Reference & Swagger](#-rest-api-reference--swagger)
11. [Deployment Guide](#-deployment-guide)
12. [Contributing & License](#-contributing--license)

---

## 📖 Product Overview

**BariVara (বাড়িভাড়া)** is engineered to solve the day-to-day operational pain points of Bangladeshi landlords managing 1–15 residential or small commercial rental units. 

In Bangladesh, property management traditionally relies on handwritten paper ledgers (*khatas*), manual utility bill calculations (splitting WASA water bills, gas charges, and DESCO/DPDC sub-meter electricity readings), informal cash collections, and unrecorded bKash/Nagad transactions. This creates frequent disputes over rent arrears and utility apportionments.

BariVara transforms this workflow into an auditable digital hub while preserving local cultural and operational norms:
- **First-Class Dual Language (বাংলা & English)**: Native bilingual experience across all interfaces, reports, and notices with a 1-click toggle.
- **Bangladeshi Taka (৳) Decimal Arithmetic**: Exact financial calculations executed with `Decimal(12, 2)` and `Decimal.js` to eliminate JavaScript floating-point rounding discrepancies.
- **1-Click WhatsApp Receipts**: Instantly generates formatted rent acknowledgment messages with direct `wa.me` links conforming to Bangladesh international phone numbering (`8801[3-9]...`).
- **Print-Ready A4 Tenancy Documents**: Client-rendered, high-resolution A4 rent notices and money receipts with embedded owner digital signature snapshots for official records.
- **Multi-Channel Rent Tracking**: Full support for Cash, Bank Transfer, bKash, Nagad, Rocket, and Debit/Credit cards.

---

## 🚀 Key Features

### Landlord & User Features
- **Multi-Property & Unit Hierarchy**: Manage multiple apartment buildings, individual flats, sublet rooms, parking spaces, and commercial shops with floor-level organization.
- **Comprehensive Tenant Profiles**: Track tenant contact info, emergency contacts, occupation, permanent address, and National ID (NID) document uploads.
- **Tenancy Contracts & Rental Agreements**: Establish legally compliant lease terms with monthly base rent, recurring service fees, parking charges, advance security deposits, and contract validity periods.
- **Automated Monthly Invoicing**: Idempotent monthly billing engine (`POST /api/v1/monthly-rents/generate`) that automatically calculates utilities, extra charges, and handles February leap-year due-date clamping.
- **Partial Payments & Arrears Tracking**: Record partial rent payments with automatic balance updates and full audit logs.
- **Operating Expense Ledger**: Log and categorize building maintenance expenses (electricity, gas, water, security, repairs, municipal taxes) with receipt attachments.
- **Financial Analytics & Export**: Real-time net income vs. expense graphs, occupancy rates, collection efficiency KPIs, and 1-click CSV ledger exports.
- **Owner Signature Snapshots**: Landlords upload an authorized digital signature that is snapshotted at payment time so historical receipts remain immutable.

### Security & Architecture Features
- **Stateless JWT Authentication**: Secure access & refresh token rotation with token version revocation support.
- **Role-Based Access Control (RBAC)**: Enforced authorization guards (`OWNER`, `TENANT`, `ADMIN`) isolating property and tenant records by landlord.
- **Argon2 Password Hashing**: State-of-the-art password hashing with strict complexity rules.
- **Audit Logging**: Comprehensive tracking of financial events (`PAYMENT_CREATED`, `PAYMENT_REVERSED`, `RENT_GENERATED`).
- **Nodemailer SMTP Integration**: Email delivery with 6-digit one-time password (OTP) verification for secure password resets.
- **Supabase Object Storage**: Presigned upload URLs for tenant NID cards, property photos, and expense receipts.
- **Security Headers & Throttling**: Hardened with Helmet, rate-limited via NestJS Throttler, and configured with strict Cross-Origin Resource Sharing (CORS).

---

## 📸 Visual Tour & Screenshots

All screenshots below represent the live application running in the local development environment with seeded test data.

### 1. Public & Onboarding Views

| Landing Page (Hero & Value Proposition) | Bilingual Login Screen |
|:---:|:---:|
| ![Landing Page](docs/screenshots/01-landing-page.png) | ![Login Page](docs/screenshots/02-login-page.png) |
| *Hero banner with authentic Bangladeshi architectural themes and bilingual value proposition.* | *Dual-language authentication interface with phone/email identifier support.* |

| Landlord Registration | Mobile Landing View |
|:---:|:---:|
| ![Register Page](docs/screenshots/03-register-page.png) | ![Mobile Landing](docs/screenshots/14-mobile-landing.png) |
| *Streamlined onboarding for individual landlords and homeowners.* | *Responsive mobile landing view optimized for handheld devices (390x844).* |

---

### 2. Landlord Dashboard & Property Operations

| Dashboard Overview & Revenue Analytics | Property & Unit Directory |
|:---:|:---:|
| ![Dashboard Overview](docs/screenshots/04-dashboard-overview.png) | ![Properties Management](docs/screenshots/05-properties-management.png) |
| *Aggregated KPIs: Total rent collected, pending arrears, occupancy rate, and monthly revenue charts.* | *Multi-property building cards showing total floors, unit counts, and vacant units.* |

| Property Detail & Unit Breakdown | Mobile Landlord Dashboard |
|:---:|:---:|
| ![Property Details](docs/screenshots/06-property-details.png) | ![Mobile Dashboard](docs/screenshots/15-mobile-dashboard.png) |
| *Unit-level management: bedrooms, bathrooms, base rent, and occupancy statuses.* | *Handheld mobile dashboard showing quick stats and upcoming collection tasks.* |

---

### 3. Tenant Directory & Profiles

| Tenant Register & Verification Status | Tenant Detail & Active Tenancy Contract |
|:---:|:---:|
| ![Tenants Directory](docs/screenshots/07-tenants-directory.png) | ![Tenant Profile](docs/screenshots/08-tenant-profile.png) |
| *Comprehensive tenant roster with assigned units, contact numbers, and NID verification status.* | *Detailed tenant profile displaying active agreement, emergency contact, and lease dates.* |

---

### 4. Monthly Billing, Payments & Expense Tracking

| Monthly Rent Ledger | Payment History & Receipt Generation |
|:---:|:---:|
| ![Rents Ledger](docs/screenshots/09-rents-ledger.png) | ![Payments History](docs/screenshots/10-payments-history.png) |
| *Automated monthly invoicing table with status badges (পরিশোধিত, বকেয়া, আংশিক).* | *Detailed payment logs across bKash, Nagad, and Cash with 1-click WhatsApp and A4 receipt dispatch.* |

| Property Operating Expense Tracker | Financial Reports & CSV Export |
|:---:|:---:|
| ![Expenses Tracker](docs/screenshots/11-expenses-tracker.png) | ![Financial Reports](docs/screenshots/12-financial-reports.png) |
| *Categorized operating costs (maintenance, utility repairs, building security, cleaners).* | *Monthly income vs expense summary with collection efficiency metrics and CSV export.* |

---

### 5. Financial Analytics & Settings

| Account Settings, Signature & Localization |
|:---:|
| ![Settings & Localization](docs/screenshots/13-settings-and-localization.png) |
| *Profile configuration, digital landlord signature upload, password management, and language preferences.* |

---

## 🛠️ Tech Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend Framework** | **Next.js 16.4.6** (App Router, Turbopack) | Server & Client Components, responsive layouts, metadata SEO |
| **UI & Styling** | **React 19.2.8**, **Tailwind CSS v4**, **Radix UI** | Accessible headless UI primitives, Lucide icons, Emil-inspired design tokens |
| **State & Data Fetching** | **Zustand 5**, **TanStack React Query v5** | Global auth & language persistence, query invalidation, optimistic updates |
| **Form Handling** | **React Hook Form 7**, **Zod** | Type-safe form validation and runtime schema parsing |
| **Document Generation** | **html-to-image**, **html2canvas**, **canvas-confetti** | High-DPI A4 receipt rendering, digital signature embedding |
| **Backend Framework** | **NestJS 10.4.15** (Express Platform) | Modular architecture, controllers, services, guards, interceptors |
| **Database & ORM** | **PostgreSQL 14+**, **Prisma ORM 5.22.0** | Relational data schema, type-safe queries, transaction isolation, migrations |
| **Authentication** | **Passport.js**, **JWT**, **Argon2** | Stateless Bearer authentication, refresh token rotation, secure hashing |
| **Object Storage** | **Supabase Storage** | Secure presigned upload URLs for NID cards, property photos, and receipts |
| **Email Service** | **Nodemailer (SMTP / Gmail)** | Delivery of 6-digit password reset OTP tokens |
| **API Documentation** | **Swagger / OpenAPI 3.0** (`@nestjs/swagger`) | Auto-generated interactive API explorer available at `/api/docs` |
| **Monorepo Tooling** | **Turborepo 2.11**, **npm Workspaces** | Parallel task orchestration, build caching, shared dependencies |

---

## 📁 Monorepo Project Structure

```text
Barivara/
├── apps/
│   ├── api/                          # Backend REST API (NestJS + Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # PostgreSQL database schema & enums
│   │   │   └── seed.ts               # Demo data seeder (owner, property, units, tenants, rents)
│   │   ├── src/
│   │   │   ├── audit-logs/           # Financial and administrative audit logging
│   │   │   ├── auth/                 # JWT authentication, guards, OTP password recovery
│   │   │   ├── common/               # Filters, interceptors, decimal utilities, error codes
│   │   │   ├── config/               # Declarative environment variable schema & validation
│   │   │   ├── dashboard/            # Aggregated analytics and metrics endpoints
│   │   │   ├── email/                # Nodemailer SMTP email service
│   │   │   ├── expenses/             # Property operating expenses management
│   │   │   ├── files/                # Presigned Supabase storage URL generator
│   │   │   ├── health/               # Terminus health checks (PostgreSQL ping)
│   │   │   ├── monthly-rents/        # Automated monthly billing engine
│   │   │   ├── payments/             # Rent collection, reversal, and receipt tracking
│   │   │   ├── prisma/               # Prisma service singleton
│   │   │   ├── properties/           # Building property CRUD operations
│   │   │   ├── reminders/            # Rent overdue and lease expiry reminder engine
│   │   │   ├── rental-agreements/    # Tenancy contracts and unit allocation
│   │   │   ├── reports/              # Monthly financial summaries and CSV streaming
│   │   │   ├── tenants/              # Tenant profiles and NID record management
│   │   │   └── units/                # Unit configuration (rent, service fees, status)
│   │   ├── test/                     # Unit and E2E test suites
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Frontend Web Application (Next.js 16 + React 19)
│       ├── public/                   # Static illustrations, logos, and audio assets
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── (auth)/           # Login, register, forgot-password, reset-password
│       │   │   ├── (dashboard)/      # Protected landlord dashboard and management pages
│       │   │   ├── globals.css       # Global design tokens and emerald theme
│       │   │   └── page.tsx          # Public marketing landing page
│       │   ├── components/           # Reusable UI components, modals, sidebar, navigation
│       │   ├── lib/                  # Axios API client, bilingual i18n dictionaries, types
│       │   └── stores/               # Zustand persistent auth and language stores
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   └── screenshots/                  # High-resolution screenshots of all views
├── scripts/                          # Maintenance and utility scripts
├── .env.example                      # Root environment reference
├── package.json                      # Monorepo root workspace configuration
├── turbo.json                        # Turborepo task pipeline configuration
└── README.md                         # Project documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following runtime environments installed on your machine:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended, minimum `>=18.0.0`)
- **Package Manager**: `npm` `v10.x` or `v11.x`
- **Database**: **PostgreSQL 14+** (Local PostgreSQL instance or cloud database such as [Supabase](https://supabase.com))
- **Git**: `v2.30+`

---

## 🚀 Getting Started (Installation & Local Setup)

Follow these step-by-step instructions to get the application running locally in under 5 minutes:

### 1. Clone the Repository
```bash
git clone https://github.com/Asif259/Barivara.git
cd Barivara
```

### 2. Install Dependencies
Install all monorepo workspace dependencies using npm:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment files for both the backend and frontend:

```bash
# Backend environment configuration
cp apps/api/.env.example apps/api/.env

# Frontend environment configuration
cp apps/web/.env.example apps/web/.env
```

Open `apps/api/.env` and update the required values (especially your PostgreSQL `DATABASE_URL` and `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`).

### 4. Run Database Migrations & Generate Prisma Client
Apply the database schema to your PostgreSQL database:

```bash
# Generate the Prisma Client
npm run prisma:generate

# Deploy migrations to the database
npm run prisma:deploy
```

### 5. Seed the Database with Demo Data
Populate the database with a pre-configured landlord, building, units, tenants, and payment records:

```bash
npm --prefix apps/api run prisma:seed
```

> **Default Seed Credentials:**
> - **Email**: `owner@barivara.com`
> - **Password**: `Password123`
> - **Role**: Property Owner / Landlord

### 6. Launch the Local Development Servers
Run both the backend API and frontend Next.js app concurrently via Turborepo:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Interactive Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **API Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🔐 Configuration & Environment Variables

### Backend Environment Variables (`apps/api/.env`)

| Variable | Required | Description | Example / Default |
|---|:---:|---|---|
| `NODE_ENV` | Optional | Application runtime environment (`development`, `production`, `test`) | `development` |
| `PORT` | Optional | Port on which the NestJS backend listens | `4000` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (supports Supabase Transaction Pooler) | `postgresql://postgres:pass@db.supabase.co:5432/postgres?sslmode=require` |
| `JWT_ACCESS_SECRET` | **Yes** | Signing secret for access tokens (min 32 characters in production) | `your-super-secret-jwt-access-key-min-32-chars-long` |
| `JWT_REFRESH_SECRET` | **Yes** | Signing secret for refresh tokens (must differ from access secret) | `your-super-secret-jwt-refresh-key-min-32-chars-long` |
| `JWT_ACCESS_EXPIRES_IN` | Optional | Lifespan of access tokens | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Optional | Lifespan of refresh tokens | `7d` |
| `FRONTEND_URL` | Optional | Allowed CORS origins (comma-separated for multiple URLs) | `http://localhost:3000,https://barivara-web.vercel.app` |
| `MOBILE_APP_SCHEME` | Optional | Deep link scheme for mobile client | `barivara` |
| `SUPABASE_URL` | **Yes** | Supabase project URL for object storage | `https://your-project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key for presigned upload URLs | `eyJhbGciOi...` |
| `SMTP_HOST` | Optional | SMTP mail server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP mail server port (465 for SSL, 587 for TLS) | `465` |
| `SMTP_SECURE` | Optional | Set to `"true"` for SSL connections | `true` |
| `SMTP_USER` | **Yes** | SMTP username / email address | `your-email@gmail.com` |
| `SMTP_PASS` | **Yes** | SMTP password or 16-character Google App Password | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Optional | Formatted sender email string | `BariVara <your-email@gmail.com>` |
| `TRUST_PROXY` | Optional | Reverse-proxy hops (1 for Vercel/Render/Hostinger) | `1` |
| `LOG_LEVEL` | Optional | Logging level (`debug`, `info`, `warn`, `error`) | `info` |
| `MAX_IMAGE_SIZE_MB` | Optional | Maximum allowed upload size for images | `5` |
| `MAX_DOCUMENT_SIZE_MB` | Optional | Maximum allowed upload size for PDF documents | `10` |

### Frontend Environment Variables (`apps/web/.env`)

| Variable | Required | Description | Example / Default |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Full URL of the backend REST API (`/api/v1`) | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical public site URL for Open Graph and SEO | `https://barivara-web.vercel.app` |

---

## 📜 Available Scripts & Workflows

Run these commands from the root directory of the monorepo:

| Command | Description |
|---|---|
| `npm run dev` | Starts both `apps/web` (:3000) and `apps/api` (:4000) concurrently using Turborepo. |
| `npm run build` | Compiles the backend API into `./dist` and prepares production assets. |
| `npm run typecheck` | Executes TypeScript typecheck (`tsc --noEmit`) across all monorepo workspaces. |
| `npm run test` | Runs all 24 unit test suites (244 tests) in `apps/api`. |
| `npm run lint` | Runs ESLint across all workspaces. |
| `npm run format` | Formats all code using Prettier according to `.prettierrc`. |
| `npm run prisma:generate` | Generates the latest Prisma Client based on `schema.prisma`. |
| `npm run prisma:deploy` | Applies pending database migrations in production. |
| `npm --prefix apps/api run prisma:seed` | Populates the database with default landlord, property, unit, and tenant data. |

---

## 📡 REST API Reference & Swagger

The backend provides a structured, versioned REST API (`/api/v1`) with global input validation and response transformation:

```json
{
  "success": true,
  "message": "সফল হয়েছে",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

### Core API Endpoints

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Service status and PostgreSQL connectivity ping |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate with email/phone & password, returns JWT tokens |
| | `POST` | `/api/v1/auth/register` | Register a new property owner account |
| | `POST` | `/api/v1/auth/refresh` | Exchange a valid refresh token for a new access token |
| | `POST` | `/api/v1/auth/forgot-password` | Request a 6-digit password reset OTP via email |
| | `POST` | `/api/v1/auth/reset-password` | Verify OTP and set a new password |
| | `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile |
| **Properties** | `GET` | `/api/v1/properties` | List all properties owned by the authenticated landlord |
| | `POST` | `/api/v1/properties` | Create a new property |
| | `GET` | `/api/v1/properties/:id` | Retrieve single property with units and floors |
| | `PATCH` | `/api/v1/properties/:id` | Update property details |
| | `DELETE` | `/api/v1/properties/:id` | Soft-delete property |
| **Units** | `GET` | `/api/v1/properties/:propertyId/units` | List units in a property |
| | `POST` | `/api/v1/properties/:propertyId/units` | Create a new unit |
| | `POST` | `/api/v1/properties/:propertyId/units/bulk` | Bulk-generate multiple units across floors |
| **Tenants** | `GET` | `/api/v1/tenants` | List all active and archived tenants |
| | `POST` | `/api/v1/tenants` | Register a new tenant with emergency contacts and NID |
| | `GET` | `/api/v1/tenants/:id` | Retrieve tenant profile with active agreement |
| **Agreements** | `GET` | `/api/v1/rental-agreements` | List rental agreements and lease terms |
| | `POST` | `/api/v1/rental-agreements` | Create lease linking tenant to a unit |
| | `POST` | `/api/v1/rental-agreements/:id/terminate` | Terminate an agreement and mark unit vacant |
| **Monthly Rents** | `GET` | `/api/v1/monthly-rents` | Query monthly rent bills filtered by year, month, and status |
| | `POST` | `/api/v1/monthly-rents/generate` | Idempotently generate rent bills for an active month |
| **Payments** | `GET` | `/api/v1/payments` | Query payments with filters for method and date range |
| | `POST` | `/api/v1/payments` | Record rent payment (Cash, Bank, bKash, Nagad, Rocket) |
| | `POST` | `/api/v1/payments/:id/reverse` | Atomically reverse a payment and restore balance |
| **Expenses** | `GET` | `/api/v1/expenses` | List building maintenance and operating expenses |
| | `POST` | `/api/v1/expenses` | Record a new expense |
| **Reports** | `GET` | `/api/v1/reports/monthly` | Aggregated monthly financial summary |
| | `GET` | `/api/v1/reports/monthly/export` | Stream monthly financial report as CSV |
| **Dashboard** | `GET` | `/api/v1/dashboard/metrics` | Real-time landlord KPIs (revenue, arrears, occupancy) |
| | `GET` | `/api/v1/dashboard/recent-activity` | Chronological activity feed |
| **Files** | `POST` | `/api/v1/files/upload-url` | Generate presigned upload URL for Supabase storage |
| **Audit Logs** | `GET` | `/api/v1/audit-logs` | Retrieve administrative and financial audit trails |

> **Interactive Swagger Documentation**: When running in non-production environments, explore and execute all endpoints at `http://localhost:4000/api/docs`.

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
The Next.js frontend (`apps/web`) is deployed on Vercel:
1. Connect the `Barivara` repository to Vercel.
2. In **Project Settings** > **General**:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your production backend API URL (e.g. `https://palegoldenrod-stingray-758793.hostingersite.com/api/v1`)
   - `NEXT_PUBLIC_SITE_URL`: `https://barivara-web.vercel.app`
4. Deploy!

### Backend Deployment (Hostinger Managed Node.js / VPS)
The NestJS backend (`apps/api`) runs via LiteSpeed Node.js (`lsnode.js`):
1. In Hostinger hPanel > **Deployments** (or Node.js Web App):
   - **Repository**: `https://github.com/Asif259/Barivara.git`
   - **Branch**: `main`
   - **Root Directory**: `/`
   - **Build Command**: `npm run build`
   - **Application Startup File**: `dist/src/main.js`
   - **Node.js Version**: `20.x` or `22.x`
2. Add all production environment variables from `apps/api/.env.example` into Hostinger's Environment Variables table.
3. Trigger deployment. The root `npm run build` command installs dependencies with `--include=dev`, compiles the NestJS API, and copies compiled output to `dist/src/main.js`.

---

## 🤝 Contributing & License

### Contributing
Contributions to BariVara are welcome! Please follow these standards:
1. Fork the repository and create your branch from `main`.
2. Ensure all 24 unit test suites pass (`npm run test`).
3. Ensure TypeScript typechecking passes (`npm run typecheck`).
4. Follow conventional commit messages (`feat:`, `fix:`, `style:`, `docs:`).

### License
This project is proprietary and confidential. All rights reserved.  
Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
