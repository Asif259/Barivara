---
name: BariVara Unified Design System
version: 1.3.0
colors:
  # Primary Brand Palette (Public & Authenticated)
  primary: "#12664F"
  primary-hover: "#0E513F"
  secondary: "#307473"
  accent-cyan: "#2DC2BD"
  accent-emerald: "#10B981"
  accent-emerald-hover: "#059669"
  accent-emerald-dark: "#12664F"
  
  # Architectural Dark Theme (Public Landing)
  obsidian-950: "#111214"
  obsidian-900: "#16171a"
  obsidian-800: "#1C1D21"
  obsidian-700: "#24262B"
  obsidian-600: "#2E3138"
  
  # Light Studio Theme (Dashboard & Ledgers)
  neutral-bg: "#FAFAF9"
  surface: "#FFFFFF"
  surface-subtle: "#F9FAFB"
  border: "#E5E7EB"
  border-subtle: "#F3F4F6"
  text-main: "#171717"
  text-muted: "#6B7280"
  text-subtle: "#9CA3AF"
  
  # Semantic Statuses
  success: "#15803D"
  warning: "#B45309"
  danger: "#DC2626"
  info: "#2563EB"

typography:
  headline-display: { fontFamily: Inter, fontSize: 44px, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }
  headline: { fontFamily: Inter, fontSize: 30px, fontWeight: 600, lineHeight: 1.2 }
  section-title: { fontFamily: Inter, fontSize: 18px, fontWeight: 600, lineHeight: 1.3 }
  body: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  label: { fontFamily: Inter, fontSize: 12px, fontWeight: 500, lineHeight: 1.4 }
  font-bangla: { fontFamily: Noto Sans Bengali, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  font-tabular: { fontVariantNumeric: "tabular-nums" }

motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  ease-spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
  btn-press-scale: "0.97"
  modal-enter-scale: "0.95"

rounded:
  tag: 4px
  btn: 6px
  card: 8px
  panel: 12px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px

components:
  landing-frame:
    backgroundColor: "{colors.obsidian-900}"
    maxWidth: "1360px"
    borderColor: "rgba(0, 0, 0, 0.2)"
  bento-card:
    backgroundColor: "{colors.obsidian-800}"
    borderColor: "rgba(255, 255, 255, 0.1)"
    hoverBorder: "{colors.accent-emerald}"
    hoverTransform: "translateY(-2px)"
  stat-circle:
    backgroundColor: "rgba(28, 29, 33, 0.9)"
    borderColor: "rgba(255, 255, 255, 0.1)"
    hoverBorder: "{colors.accent-emerald}"
  metric-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
  data-table:
    borderColor: "{colors.border}"
    headerBg: "{colors.surface-subtle}"
---

# BariVara (বাড়িভাড়া) Unified Design System

> **Standard:** v1.3.0  
> **Frameworks:** Next.js 16 (App Router) • React 19 • Tailwind CSS v4  
> **Philosophy:** `design-taste-frontend` (Anti-Slop Craftsmanship) + `emil-design-eng` (Invisible Mechanical Polish)

---

## 1. Brand Core & Design Philosophy

BariVara is engineered specifically for residential and commercial property owners and landlords managing 1–15 rental units in Bangladesh. The design system bridges two distinct but harmonized environments:

1. **The Public Architectural Landing Page**: High-contrast, dark luxury architectural frame (`#16171a` / Brand Emerald `#12664F` / Luminous Emerald `#10B981` / Metallic gradients) designed to establish immediate credibility, authority, and taste at the level of world-class design systems (e.g., figma.com, x.ai).
2. **The Authenticated Operational Dashboard**: High-clarity light studio canvas (`#FAFAF9` / Pure Surface `#FFFFFF` / Primary Emerald `#12664F`) engineered for distraction-free ledger accounting, high financial legibility, and mobile-friendly rent logging.

### The Five Zero-Slop Rules (`design-taste-frontend`)
1. **Zero Generic Purple**: No AI-style purple/violet gradients or neon blobs. Palette is grounded in architectural obsidian (`#16171a`), authentic Bangladeshi brand emerald (`#12664F`), luminous accent emerald (`#10B981`), and subtle teal (`#307473`).
2. **No Invented Metrics**: All statistics represent concrete, believable product capabilities (`1–15 Units`, `1st–10th Billing Cycle`, `1-Click WhatsApp Receipts`, `৳0 Hidden Fees`).
3. **Real Product UI Previews**: The bento showcase illustrates real system data (bKash TrxID, DESCO sub-meter math, DMP police forms) rather than abstract vectors.
4. **Equal Edges & One Section per Screen**: Clean desktop framing (`max-w-[1360px]`, `max-w-6xl` content bounds) with balanced left and right margins across all breakpoints.
5. **Tactile Micro-Interactions**: Linked cards lift 2px, photos zoom 1.04 inside overflow masks, and interactive buttons press (`active:scale-[0.97]`).

---

## 2. Color Palette & Roles

### 2.1 Public Architectural Theme (Obsidian & Emerald Green)
- **Outer Canvas (`#12664F`)**: Dignified deep brand emerald exterior frame border visible at wide desktop viewports (`1440px+`).
- **Frame Foundation (`#16171a`)**: Deep architectural obsidian housing the entire marketing site.
- **Card Surfaces (`#1C1D21` / `#111214`)**: Muted dark charcoal panels with hairline `rgba(255, 255, 255, 0.1)` borders.
- **Brand Accent (`#12664F` solid / `#10B981` luminous)**: Primary action buttons in solid emerald (`bg-[#12664F] hover:bg-[#0E513F] text-white border-[#10b981]/40`), luminous emerald (`#10B981`) for high-contrast text accents, status dots, icon highlights, and focus rings on dark obsidian.
- **Emerald Halos (`#12664F`)**: Used for subtle glow gradients and trusted status badges linking the public site with the authenticated app.

### 2.2 Operational Dashboard Theme (Light Studio)
- **Canvas (`#FAFAF9`)**: Warm off-white paper foundation providing daylight contrast for landlords logging payments outdoors.
- **Surface (`#FFFFFF`)**: Pure white cards, dialogs, and table containers with `#E5E7EB` borders.
- **Primary Emerald (`#12664F`, hover `#0E513F`)**: Action buttons, active navigation states, and confirm actions.
- **Secondary Teal (`#307473`)**: Supplementary badges, unit pills, and financial headers.
- **Text Main (`#171717`)**: High-contrast charcoal text meeting WCAG AAA legibility.
- **Text Muted (`#6B7280`)**: Secondary metadata, timestamps, and subtitles.

### 2.3 Status Colors (Both Environments)
- **Success (`#15803D`)**: Paid rents, verified tenants, active leases.
- **Warning (`#B45309`)**: Partial payments, expiring agreements.
- **Danger (`#DC2626`)**: Overdue rents, unpaid arrears, deleted records.
- **Info (`#2563EB`)**: System announcements, draft rent notices.

---

## 3. Typography & Bilingual Harmony

### 3.1 Type Families
- **Primary Latin**: `Inter` (subsets: latin, 400/500/600/700/800) for clean numerals, English UI strings, and navigation.
- **Bengali Primary**: `Noto Sans Bengali` (subsets: bengali, 400/500/600/700) for authentic Bengali typography.
- **Bengali Serif (Editorial/Voucher)**: `Noto Serif Bengali` for formal money receipts, legal notices, and quotation marks.

### 3.2 Tabular Numerals (Strict Requirement)
All currency values, sub-meter units, square footage, and counters MUST apply:
```css
font-variant-numeric: tabular-nums;
```
This guarantees that Bengali and English digits (`১, ৮০, ৳`) align vertically without horizontal jitter during filter changes and table scans.

---

## 4. Animation Decision Framework (`emil-design-eng`)

Every interaction follows Emil Kowalski’s physical motion principles:

```css
:root {
  --ease-out-emil: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out-emil: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-spring-emil: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

| Element | Interaction | Specification | Rationale |
|---|---|---|---|
| **Buttons (`.btn-press`)** | Active click | `transform: scale(0.97)` on `:active` with `120ms` ease-out | Physical response confirms the system registered user intent |
| **Bento Cards (`.prop-card`)** | Hover | `translateY(-2px)`, image zoom `scale(1.04)` | Depth cue without disruptive layout shifts |
| **Modals (`.modal-enter`)** | Opening | `scale(0.95) → scale(1)` + `opacity: 0 → 1` in `200ms` | Real objects never emerge from zero scale |
| **Toast Notifications** | Entry / Dismiss | `translateY(4px) → translateY(0)` with `opacity` | Smooth spatial continuity |
| **Circular Badges (`.stat-circle`)** | Hover | Border glow `rgba(16, 185, 129, 0.5)` in `300ms` | Calm indicator response |

---

## 5. Architectural Components Catalog

### 5.1 Public Landing Architecture
- **`.page-frame`**: 1360px centered container with dark obsidian background and deep ambient shadow (`box-shadow: 0 0 80px rgba(0, 0, 0, 0.75)`).
- **`.hero-giant-title`**: Display heading with metallic bronze gradient clipping (`linear-gradient(180deg, #2a2c30 0%, #4a382e 45%, #b56c3b 100%)`).
- **12-Column Asymmetric Bento Grid**:
  - `col-span-7`: Hero capability card (WhatsApp Receipts / Monthly Khata).
  - `col-span-5`: Compact capability card with offset desktop margin.
  - `col-span-4`: Vertical full-height card (Tenant NID & Police Form).
- **Overlapping Circular Stats**: 4 equal circles with `-1.75rem` desktop negative margin overlay.
- **Architectural Louver Graphic (`.louver-graphic`)**: 32-degree repeating hairline linear pattern with radial glow.

### 5.2 Dashboard & Financial Components
- **`MetricCard`**: 4-column responsive grid displaying Total Units, Active Leases, Collected Rent, and Overdue Balances.
- **`DenseTable`**: Sticky tenant/unit column with tabular BDT amounts.
- **`A4ReceiptVoucher`**: Dual-language printable money receipt conforming to Bangladesh tenancy customs, ready for PDF export and WhatsApp dispatch.

---

## 6. Accessibility & Inclusivity (WCAG AA Compliance)

- **Contrast Ratios**: All text strings against obsidian (`#16171a`) maintain at least 4.5:1 contrast; luminous emerald accents (`#10B981`) and solid brand emerald buttons (`#12664F`) maintain high WCAG AA/AAA legibility.
- **Accessible Form Elements**: Every `<select>` and `<input>` contains a paired `<label htmlFor="...">` and explicit `aria-label`.
- **Keyboard Navigation**: Modals include focus traps, `Escape` key close handlers, and `role="dialog"`.
- **Reduced Motion Support**: All float animations, infinite marquees, and scale transitions disable automatically under `@media (prefers-reduced-motion: reduce)`.
