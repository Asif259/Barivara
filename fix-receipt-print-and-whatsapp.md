# Plan: Fix Rent Receipt Layout, Export, Print & WhatsApp Sharing

> **Task Slug:** `fix-receipt-print-and-whatsapp`  
> **Status:** Pending User Approval (Phase 1)  
> **Primary Agents:** `debugger` → `frontend-specialist` → `test-engineer`

---

## 1. Problem Diagnosis & Evidence

### User Symptoms
1. **Desktop Image (Image 1):** Copied & sent via WhatsApp:
   - Bengali table labels wrapped on almost every word (`মূল\nভাড়া:`, `সার্ভিস\nচার্জ:`, `মোট মাসিক\nবিল:`, `টাকা গ্রহণের\nতারিখ:`, `পেমেন্ট\nমেথড:`).
   - Bottom row `অবশিষ্ট\nবকেয়া:` was clipped/cut off at the bottom.
   - In the bottom-left settlement box, "পরিমাণ" wrapped and collided directly on top of `৳১৫,০০০`.
2. **Phone Image (Image 2):** Sent from mobile phone:
   - Same overlapping in the settlement box (`পরিমাণ` colliding with `৳১৫,০০০`).
   - Awkward table wrapping on narrow viewports.
3. **Core Contrast:** The in-app preview inside the dialog looks correct, but both **Print** and **Send via WhatsApp / Copy Image** produce deformed receipts.

---

## 2. Root Cause Analysis

1. **Font Stripping in Image Generation (`skipFonts: true`):**
   - In `payment-receipt-dialog.tsx` (and `rent-notice-dialog.tsx`), `toPng` is called with `skipFonts: true`.
   - This strips `@font-face` rules from the canvas SVG. The canvas falls back to generic system fonts with different font metrics from `Noto Sans Bengali`.
   - Because Next.js uses `next/font/google` (self-hosted local fonts), cross-origin security issues do not apply, but stripping fonts ruins Bengali glyph rendering.
2. **Unconstrained Flex Breakdown Table:**
   - Table rows use `<div className="flex justify-between">` with raw `<span>` children without fixed column proportions (`flex-basis`, `w-[60%]`, or `whitespace-nowrap`).
   - Slight differences in font size or container width compress the label column, forcing each Bengali word onto a new line.
3. **Text Overlap in Settlement Box (`পরিশোধিত টাকার পরিমাণ`):**
   - `tracking-[0.16em]` on Bengali script breaks syllable ligatures (যুক্তাক্ষর) and unnaturally expands text width.
   - When "পরিমাণ" wraps to line 2, lack of line-height and lack of vertical gap (`space-y-1` or `flex-col`) places `পরিমাণ` directly over `৳১৫,০০০`.
4. **Capturing Transformed DOM Node on Mobile:**
   - On mobile devices, the receipt preview is scaled down with `transform: scale(0.55)` and clipped by an outer `overflow: hidden` container.
   - Capturing `receiptNode` directly inside this transformed/scaled container leads to fractional pixel rounding errors, subpixel line wrapping, and bottom clipping.
5. **Print Renders Raster Image Instead of Clean Vector Document:**
   - `handlePrint` prints the rasterized PNG inside an iframe rather than printing clean vector HTML with `@media print`.

---

## 3. Implementation Plan

### Step 1: Re-architect `RentDocument` Layout (`rent-document.tsx`)
- [ ] **Fix Settlement Box (Bottom Left):**
  - Remove destructive `tracking-[0.16em]` on Bengali text.
  - Implement explicit vertical stack (`flex flex-col gap-1.5`) with defined line-heights (`leading-tight`) to guarantee zero collision between label and amount.
- [ ] **Fix Breakdown Table:**
  - Convert flex rows to structured table or grid layout (`grid grid-cols-[1fr_auto]` or `table w-full`) with fixed column ratios.
  - Apply `whitespace-nowrap` on standard labels (`ভাড়ার মাস ও সাল:`, `মূল ভাড়া:`, `সার্ভিস চার্জ:`, `টাকা গ্রহণের তারিখ:`, `পেমেন্ট মেথড:`, `অবশিষ্ট বকেয়া:`).
  - Add ample row height and padding to ensure no bottom row is clipped.
- [ ] **Apply to Notice Mode as well:**
  - Ensure `NoticeDocumentProps` receives the exact same robust layout protections.

### Step 2: Fix Receipt Image Generation & Export (`payment-receipt-dialog.tsx` & `rent-notice-dialog.tsx`)
- [ ] **Dedicated Unscaled Export Anchor:**
  - Create a dedicated offscreen export container (`width: 600px`, `transform: none`, fixed scale) separate from the responsive preview wrapper.
  - Guarantees that whether generated on mobile (iPhone/Android) or desktop, the captured receipt is ALWAYS identical, unscaled, and unclipped.
- [ ] **Font Preservation in `html-to-image`:**
  - Configure `toPng` with font embedding support and explicit font styles so canvas SVG retains `Noto Sans Bengali` font metrics.
  - Provide fallback canvas font loading wait before snapshot.
- [ ] **Vector Print Flow:**
  - Provide high-fidelity vector print styling for `handlePrint` so printing prints crisp text directly rather than a blurred raster snapshot.

### Step 3: Verification & Testing
- [ ] Verify TypeScript types: `npx tsc --noEmit`.
- [ ] Verify Next.js build: `npm run build`.
- [ ] Test image generation on both desktop viewports and simulated mobile viewports (375px).
- [ ] Verify that neither table rows nor the settlement box overlaps or clips.

---

## 4. Agent Assignment Matrix (Orchestration Phase 2)

| Agent | Focus Area |
|---|---|
| `debugger` | Font metric verification & offscreen DOM isolation |
| `frontend-specialist` | `RentDocument` component redesign & dialog export wiring |
| `test-engineer` | Responsive tests, build verification, and quality audit |

