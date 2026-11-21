# BariVara Web - Frontend Specification & Master Prompt

This document outlines the complete architecture, routing, component structure, and state management rules for the `barivara-web` frontend. It is based strictly on the current NestJS backend API contract.

At the bottom of this document, you will find a **Master Prompt** that you can copy and paste into Antigravity (or any other AI coding agent) to immediately begin generating the frontend codebase with zero guesswork.

---

## 1. Tech Stack & Architecture

- **Framework:** Next.js (App Router, React 18+)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with Shadcn UI for accessible, reusable components)
- **State Management & Data Fetching:** 
  - Server State: TanStack Query (React Query)
  - Client State: Zustand (for auth state, UI toggles, and language preference)
- **API Client:** Axios (configured with interceptors for JWT, language headers, and refresh flows)
- **Form Handling:** React Hook Form + Zod validation
- **Routing & Protected Routes:** Next.js Middleware for checking auth cookies/tokens before rendering protected pages.

## 2. Core Flows & Features

### Language Selection (First-Launch)
- **Feature:** When a user first opens the app, prompt them to choose between "বাংলা" and "English".
- **Implementation:** Store preference in local storage/cookie. Attach this to the Axios interceptor as `Accept-Language: bn` or `en` for all API calls.

### Authentication & Token Refresh
- **Flow:** `/auth/login` ➔ Save `accessToken` (in HTTP-only cookie or local storage) ➔ Redirect to `/dashboard`.
- **Refresh:** Axios interceptor catches `401 Unauthorized`. If a refresh route existed, it would attempt refresh; otherwise, it logs the user out, clears state, and redirects to login.

### Dashboard
- **Responsive Layout:** Sidebar navigation (collapsible on mobile) and top app bar.
- **Widgets:** 
  - Summary Cards (Expected Rent, Collected, Outstanding).
  - Unpaid/Overdue Rents List (Quick action to "Record Payment").
  - Upcoming Reminders.
- **Mapping:** Fetches `GET /api/v1/dashboard/overview` and `GET /api/v1/monthly-rents/outstanding`.

### Properties, Units, & Tenants
- **Structure:** Standard CRUD tables with server-side pagination (`?page=1&limit=10`).
- **Pages:**
  - `/properties` ➔ List ➔ Add Modal ➔ Edit Modal.
  - `/properties/[id]` ➔ Detail page with nested Units list.
  - `/tenants` ➔ List ➔ Detail page (shows tenant profile and statement/history).

### Rent Collection & Payments
- **Rent Generation:** A dedicated UI to trigger `POST /api/v1/monthly-rents/generate` for a specific month.
- **Recording Payment:** A modal that accepts `amount`, `paymentMethod`, and calls `POST /api/v1/payments`.
- **Payment Receipt:** After successful payment, show a printable receipt view.
- **Reversals:** Authorized users can reverse a mistaken payment via `POST /api/v1/payments/:id/reverse`.

### Reports & Analytics
- **UI:** A page with date/month filters fetching `GET /api/v1/reports/monthly`.
- **Export:** A button triggering `GET /api/v1/reports/monthly/export` to download CSV.

## 3. UI/UX Patterns

- **Loading States:** Skeletons for page data, spinner overlays for mutations.
- **Error States:** Toast notifications (e.g., Sonner or React Hot Toast) mapping to backend error messages (which are localized based on the header).
- **Empty States:** Beautiful illustrations with clear Call-to-Action buttons (e.g., "No properties found. Add your first property!").
- **Tables:** Data tables with sorting, search inputs, and pagination controls.

## 4. Route Structure (App Router)

```text
src/app/
├── (auth)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)
│   ├── layout.tsx (Contains Sidebar and Header)
│   ├── page.tsx (Overview)
│   ├── properties/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── tenants/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── agreements/page.tsx
│   ├── rents/page.tsx
│   ├── payments/page.tsx
│   ├── expenses/page.tsx
│   └── reports/page.tsx
└── layout.tsx (Global Providers: QueryClient, LanguageStore)
```

---

# 🚀 Master Prompt for Antigravity

*Copy everything below this line and paste it into a new Antigravity session to build the frontend.*

***

**Task: Build the BariVara Web Frontend (Next.js)**

You are an expert Frontend AI agent. Your task is to build `barivara-web`, a modern, highly aesthetic, and responsive Next.js application for a rental management system. 

The backend API is already fully built and running at `http://localhost:3000/api/v1`. You will strictly use the API contract defined in `backend_api_reference.md` (which I will provide or you have in context). **Do NOT guess API endpoints or request/response payloads.**

### 1. Tech Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Shadcn UI (for accessible, premium components)
- Lucide React (for icons)
- TanStack Query (React Query) for API state
- Zustand for client state (Auth & Language)
- Axios for API requests
- React Hook Form + Zod for validation

### 2. Design Aesthetics (CRITICAL)
Your web application MUST look premium, modern, and beautiful.
- Avoid generic plain colors. Use a harmonious, curated color palette (e.g., sleek slate/zinc with a vibrant primary brand color).
- Use a modern typography system (e.g., Inter or Outfit font).
- Implement subtle micro-animations (framer-motion or CSS transitions), smooth gradients, and hover effects to make the interface feel alive.
- Ensure the layout is fully responsive (mobile-first approach).
- Use Skeleton loaders for fetching states and beautiful Empty States (with icons) when lists are empty.

### 3. Core Requirements
1. **API Client Setup:** Create an Axios instance configured with a base URL of `http://localhost:3000/api/v1`. Add interceptors to:
   - Inject the `Authorization: Bearer <token>` from Zustand/Cookies.
   - Inject the `Accept-Language: en` (or `bn`) header based on the user's preference in Zustand.
   - Handle global 401 errors by logging the user out.
2. **Language Selection:** On the very first launch, show a beautiful selection screen to choose between "English" and "বাংলা". Store this in Zustand.
3. **Authentication:** Build a Login page and a Registration page. Protect the dashboard routes using a Next.js layout or middleware that redirects unauthenticated users.
4. **Layout:** Build a Dashboard layout with a collapsible sidebar and a top header containing the user profile and language toggle.
5. **Pages to Build First:**
   - **Dashboard Overview:** Fetch from `/dashboard/overview` and show stats cards and a table of outstanding rents.
   - **Properties:** List properties, and build a modal to create a new property (`POST /properties`).
   - **Tenants:** List tenants with a create modal.
   - **Rents & Payments:** A view to see generated rents, and a modal to record a payment (`POST /payments`).

### 4. Workflow
1. Initialize the Next.js project.
2. Setup the global layout, providers (TanStack Query), and Axios client.
3. Build the Authentication flow.
4. Build the Dashboard layout (Sidebar, Header).
5. Build the Dashboard Overview page.
6. Build the Properties list and create flow.

Please confirm you understand these instructions, review the `backend_api_reference.md`, and generate a plan to begin Step 1.
