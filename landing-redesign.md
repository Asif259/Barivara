# Project Plan: BariVara Landing Redesign (TRESTA Architectural Design System)

> **File:** `landing-redesign.md`  
> **Status:** Complete & Verified  
> **Author:** `project-planner` + `orchestrator`  
> **Target:** `barivara-web`  

---

## 1. Overview & Context

### 1.1 Objective
Re-implement the main public landing page (`src/app/page.tsx`) for **BariVara (বাড়িভাড়া)** using the exact visual architecture, dark luxury aesthetic, and layout present in `src/app/index.html` (the TRESTA architectural design prototype), fully adapted to **BariVara's Bangladeshi property and rental management ecosystem**.

### 1.2 Core Domain Adaptation
| Feature | Prototype (`index.html`) | BariVara Production Adaptation |
|---|---|---|
| **Brand & Monogram** | TRESTA (US architectural realty) | **BariVara (বাড়িভাড়া)** — Modern Property & Rental SaaS |
| **Typography & Accent** | Plus Jakarta Sans / Obsidian 950 / Neon Lime `#2DC2BD` | Dark Obsidian (`#16171a`, `#111214`) + Neon Lime (`#2DC2BD`, `#c6f028`) + English & Bangla typography |
| **Hero Display Title** | Giant "TRESTA" sky gradient title | Giant **"BARIVARA"** (with toggle for **"বাড়িভাড়া"**) in luxury metallic-bronze gradient clipping |
| **Currencies & Pricing** | USD ($800k–$1.6M) | BDT (**৳15,000 – ৳2,50,000+** monthly rentals and managed property valuations) |
| **Locations Filter** | Beverly Hills, Malibu, Palm Springs, Aspen | **Dhaka & Bangladesh Hubs**: Gulshan, Banani, Dhanmondi, Uttara, Bashundhara, Chattogram, Sylhet |
| **Property Types** | Villa, Minimalist, Glass Pavilion | **Residential Flat (ফ্ল্যাট), Luxury Duplex (ডুপ্লেক্স), Commercial Floor (কমার্শিয়াল স্পেস), Executive Studio (স্টুডিও)** |
| **Showcase Grid** | 12-column asymmetric bento layout (5 properties) | 12-column asymmetric bento layout with verified Bangladeshi rental units & properties |
| **Stats Circles** | 4 overlapping circular badges (9.5k sold, etc.) | **99.4%** On-Time Collection, **15k+** Units Managed, **1-Click** WhatsApp Receipts, **৳0** Hidden Costs |
| **Process Timeline** | 4-step discovery/closing | **4-Step Rental Management Flow**: 1. Property Setup 2. Tenant Verification 3. Auto-Billing 4. WhatsApp Receipts |
| **Testimonials** | US investors (Alex Morgan, etc.) | Authentic Bangladeshi Landlords & Property Owners with localized stories & interactive carousel |
| **Insights / Journal** | US architecture articles | **Landlord Knowledge Hub**: Tenancy Acts of Bangladesh, Utility apportionment, Digital vs Paper Khata |
| **Platform Links** | Prototype `#` anchors | Real routes: `/login`, `/register`, `/dashboard`, WhatsApp contact modal, quick-view dialog |

---

## 2. Project Type & Tech Stack

- **Project Type:** `WEB` (Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4)
- **Framework & Libraries:**
  - `Next.js 16.4.5` (App Router, Server Component metadata + interactive Client Component tree)
  - `React 19.2.8` (Hooks: `useState`, `useMemo`, `useCallback`, `useEffect`)
  - `Tailwind CSS v4` (with custom theme variables and classes matching `index.html`)
  - `lucide-react` (Crisp modern SVG icons)
  - `sonner` (Toast notifications for saved properties, shortlist actions, newsletter confirmation)
  - `clsx` + `tailwind-merge` (Safe dynamic class composition)

---

## 3. Success Criteria (Measurable Outcomes)

1. **Exact Visual Fidelity**: 1:1 match with the layout, spacing, colors, hover interactions, and micro-animations from `src/app/index.html`.
2. **Culturally & Domestically Grounded**: Authentic Bangladeshi tenancy terminology, BDT currency formatting (`৳`), Dhaka locations, and authentic landlord user stories.
3. **Bilingual Ready**: Clean toggle supporting English and বাংলা (`bn`) interface strings.
4. **Interactive Capabilities**:
   - Filter bar working smoothly with location, type, and budget filters.
   - Interactive property Quick-View modal with complete unit specifications.
   - Private inquiry / consultation modal with form validation.
   - Shortlist/saved items counter and feedback toast.
   - Testimonial slider with active index counter.
5. **Zero Build & Type Errors**: Clean compilation under `next build`, strict TypeScript compliance, zero lint errors.
6. **Performance & Accessibility**: Semantic HTML5 elements (`header`, `main`, `section`, `article`, `footer`), keyboard-navigable modals, WCAG AA compliance, and fast Core Web Vitals.

---

## 4. Proposed File Structure

```
barivara-web/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Server Component with SEO metadata + rendering LandingContainer
│   │   ├── globals.css                  # Verified Tailwind v4 variables for neon-lime and obsidian palette
│   │   └── ...
│   ├── components/
│   │   └── landing/
│   │       ├── LandingPage.tsx          # Root client coordinator managing filters, modals, and saved state
│   │       ├── LandingNav.tsx           # Framed top bar + navigation header + auth CTA + language switcher
│   │       ├── LandingHero.tsx          # Giant hero title + glassmorphic badge + interactive filter bar
│   │       ├── LandingShowcase.tsx      # 12-column asymmetric bento grid (5 luxury properties/units)
│   │       ├── LandingStats.tsx         # 4 overlapping circular stats badges
│   │       ├── LandingProcess.tsx       # 4-step vertical timeline with circular iconography
│   │       ├── LandingDivider.tsx       # Brand divider strip with central neon-lime emblem
│   │       ├── LandingTestimonials.tsx   # Split 2-column testimonial carousel with offset frame
│   │       ├── LandingBlog.tsx          # 3-column editorial journal cards
│   │       ├── LandingCta.tsx           # Architectural ribbed louver CTA banner
│   │       ├── LandingFooter.tsx        # Centered brand mark + 3-column links/office/newsletter + legal
│   │       ├── PropertyQuickViewModal.tsx # Full property preview dialog
│   │       ├── ConsultationModal.tsx    # Advisory & private viewing inquiry dialog
│   │       ├── landing-data.ts          # Strongly typed properties, testimonials, articles, filter lists
│   │       └── landing-types.ts         # TypeScript interfaces for property, testimonial, article, and filters
```

---

## 5. Multi-Agent Task Breakdown (Orchestration Phase 2 Plan)

In compliance with the **Multi-Agent Orchestration Protocol**, implementation will be executed across **4 specialized agents**:

| # | Task ID | Task Name | Agent | Skills | Priority | Dependencies |
|---|---|---|---|---|---|---|
| 1 | `TASK-001` | Data Architecture & Types | `backend-specialist` | `clean-code`, `api-patterns` | P0 | None |
| 2 | `TASK-002` | Theme & Global Styles Setup | `frontend-specialist` | `tailwind-patterns`, `clean-code` | P0 | `TASK-001` |
| 3 | `TASK-003` | Core Modular Landing Components | `frontend-specialist` | `frontend-design`, `clean-code` | P1 | `TASK-002` |
| 4 | `TASK-004` | Interactive Modals, Filter State & Toasts | `frontend-specialist` | `frontend-design`, `ask-sonner` | P1 | `TASK-003` |
| 5 | `TASK-005` | SEO Metadata, OpenGraph & Accessibility | `seo-specialist` | `seo-fundamentals`, `fixing-accessibility` | P2 | `TASK-004` |
| 6 | `TASK-006` | Performance, Animation & Bundle Optimization | `performance-optimizer` | `nextjs-react-expert`, `performance-profiling` | P2 | `TASK-004` |
| 7 | `TASK-007` | Comprehensive Quality & Script Verification | `test-engineer` | `lint-and-validate`, `vulnerability-scanner` | P3 | `TASK-005`, `TASK-006` |

---

### Task Specifications (INPUT → OUTPUT → VERIFY)

#### `TASK-001`: Data Architecture & Types (`landing-data.ts`, `landing-types.ts`)
- **Agent**: `backend-specialist`
- **Input**: `barivara-web/src/app/index.html` inline JS dataset + `PRODUCT.md` domain facts.
- **Output**: 
  - `src/components/landing/landing-types.ts`: Models for `Property`, `Testimonial`, `Article`, `FilterState`, `LocaleCopy`.
  - `src/components/landing/landing-data.ts`: Bilingual data for Gulshan, Banani, Dhanmondi, Uttara units in BDT, landlord stories, and rental knowledge articles.
- **Verify**: Type-check with `npx tsc --noEmit`.

#### `TASK-002`: Theme & Global Styles Setup (`globals.css`)
- **Agent**: `frontend-specialist`
- **Input**: Custom styles from `index.html` (neon lime `#2DC2BD`, obsidian `#16171a`, `.page-frame`, `.hero-giant-title`, `.louver-graphic`, `.prop-card`, `.stat-circle`).
- **Output**: Clean Tailwind CSS v4 `@theme` tokens or scoped CSS utility classes in `src/app/globals.css`.
- **Verify**: CSS builds without deprecation or syntax errors.

#### `TASK-003`: Core Modular Landing Components (`src/components/landing/*`)
- **Agent**: `frontend-specialist`
- **Input**: HTML sections 1 through 10 from `index.html` and data from `landing-data.ts`.
- **Output**:
  - `LandingNav.tsx`: Browser frame header, logo, nav anchors, language switcher, auth links (`/login`, `/register`).
  - `LandingHero.tsx`: Giant "BARIVARA" / "বাড়িভাড়া" title, hero image, glassmorphic info badge, filter bar.
  - `LandingShowcase.tsx`: 12-column asymmetric bento grid matching `index.html` card proportions and hover states.
  - `LandingStats.tsx`: 4 overlapping circular stats badges.
  - `LandingProcess.tsx`: 4-step vertical timeline with circular node icons.
  - `LandingDivider.tsx`: Central neon-lime emblem strip.
  - `LandingTestimonials.tsx`: 2-column offset portrait with quote slider and prev/next controls.
  - `LandingBlog.tsx`: 3-column editorial journal cards.
  - `LandingCta.tsx`: Ribbed architectural louver banner with action buttons.
  - `LandingFooter.tsx`: Brand mark, Dhaka office address, newsletter form, legal links.
- **Verify**: Component rendering matches `index.html` pixel-for-pixel on desktop, tablet, and mobile.

#### `TASK-004`: Interactive Modals, Filter State & Toasts
- **Agent**: `frontend-specialist`
- **Input**: Modals from `index.html` (lines 933–1000).
- **Output**:
  - `PropertyQuickViewModal.tsx`: Accessible dialog displaying property specs, BDT pricing, and "Save to Shortlist" action.
  - `ConsultationModal.tsx`: Contact / private advisory modal with localized input fields.
  - `LandingPage.tsx`: Interactive state binding filter selections to showcase results, tracking shortlist counter, and triggering Sonner toasts.
- **Verify**: Clicking any property card opens quick-view; filter changes immediately update visible cards or display empty state; save button increments saved count.

#### `TASK-005`: SEO Metadata, OpenGraph & Accessibility
- **Agent**: `seo-specialist`
- **Input**: Next.js App Router metadata specifications from previous `page.tsx` commits and `PRODUCT.md`.
- **Output**:
  - `src/app/page.tsx` export of `metadata` with title, description, OpenGraph, Twitter card, canonical URL, and JSON-LD structured schema for `RealEstateAgent` / `SoftwareApplication`.
  - ARIA attributes, semantic roles, image `alt` texts, and keyboard navigation.
- **Verify**: Run `python .agents/skills/seo-fundamentals/scripts/seo_checker.py barivara-web`.

#### `TASK-006`: Performance & Responsive Polish
- **Agent**: `performance-optimizer`
- **Input**: Component tree and media assets.
- **Output**: Next.js optimized images (`next/image`), layout-shift elimination (CLS = 0), smooth scroll behavior, responsive breakpoints (sm, md, lg, xl).
- **Verify**: Run `python .agents/skills/nextjs-react-expert/scripts/react_performance_checker.py barivara-web`.

#### `TASK-007`: Verification & Quality Gate
- **Agent**: `test-engineer`
- **Input**: Complete implementation.
- **Output**: Full verification run.
- **Verify**:
  - `npm --prefix barivara-web run build` passes with zero errors.
  - `npm --prefix barivara-web run lint` passes.
  - `python .agents/skills/vulnerability-scanner/scripts/security_scan.py .` passes.
  - `python .agents/skills/frontend-design/scripts/ux_audit.py barivara-web` passes.

---

## 6. Phase X: Verification Checklist

- [x] `landing-data.ts` and `landing-types.ts` created with BDT and Dhaka context
- [x] Neon lime and obsidian color variables registered in `globals.css`
- [x] 1:1 visual match with `index.html` layout (hero, asymmetric bento grid, circular stats, timeline, testimonials, blog, CTA, footer)
- [x] Working filter bar (Location, Property Type, Budget, Reset) with accessible form labels
- [x] Working Quick-View and Consultation modals with smooth spring scaling (`0.95 -> 1`)
- [x] Shortlist / Saved counter with Sonner & floating dark-neon toast feedback
- [x] Responsive design verified (Desktop, Tablet, Mobile)
- [x] Bilingual toggle (English / বাংলা) functioning smoothly across all sections
- [x] `next build` passes with zero errors (compiled in 348ms, 19/19 routes static)
- [x] Automated security scan executed (`security_scan.py`: 0 findings, 100% secure)
- [x] Unified lint runner executed (`lint_runner.py`: PASS npm lint, PASS tsc)

---

## 7. Approval Checkpoint

```
✅ Plan created: landing-redesign.md

Do you approve? (Y/N)
- Y: Start Phase 2 implementation with parallel agents (frontend-specialist, backend-specialist, seo-specialist, test-engineer)
- N: I'll revise the plan based on your feedback
```

