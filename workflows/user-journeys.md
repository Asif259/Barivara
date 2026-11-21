# User Journeys

> End-to-end user workflows reverse-engineered from the BariVara codebase (`barivara-api` & `barivara-web`).  
> Primary Actor: **Landlord / Property Owner** (`Role.OWNER`).

---

## Journey 1: Landlord Registration & First-Time Onboarding

### Actor
New Landlord / Property Owner

### Entry Point
Frontend URL: `/register`

### Preconditions
- User has a valid mobile phone number and/or email address.
- User does not already have an account with the specified phone or email.

### Flow
1. User navigates to `/register` and fills in **Name**, **Email**, **Phone number**, and **Password**.
2. Frontend validates inputs using Zod schema in `barivara-web/src/app/(auth)/register/page.tsx`.
3. Client dispatches `POST /api/v1/auth/register` with request payload.
4. Backend applies `ThrottlerGuard` (rate limit: 10 req/min) and validates payload via `RegisterDto`.
5. Backend verifies uniqueness of email and phone in database table `users`.
6. Backend hashes password using `argon2.hash()`.
7. Backend inserts new record into `users` table with default `role: Role.OWNER` and logs an `AuditLog` entry (`action: AuditAction.CREATE`).
8. Backend signs a short-lived Access Token (15m) and long-lived Refresh Token (30d) via `@nestjs/jwt`.
9. Client receives standard envelope `{ success: true, data: { accessToken, refreshToken, user } }`.
10. Client persists tokens in Zustand store `useAuthStore` (persisted to `localStorage`).
11. UI displays success toast and redirects user to `/dashboard`.

### APIs
- `POST /api/v1/auth/register`

### Data Involved
- Tables: `users`, `audit_logs`
- DTOs: `RegisterDto`

### Success State
User record created in database; tokens stored in client; user authenticated on `/dashboard`.

### Failure States
- **HTTP 400**: Missing both email and phone, or invalid password format.
- **HTTP 409**: Duplicate resource (`ErrorCode.DUPLICATE_RESOURCE` if email/phone already taken).
- **HTTP 429**: Too many registration attempts within 60 seconds.

### Evidence
- Frontend: `barivara-web/src/app/(auth)/register/page.tsx`
- Backend: `barivara-api/src/auth/auth.controller.ts` (lines 35-47)
- Service: `barivara-api/src/auth/auth.service.ts` (`register`)

---

## Journey 2: User Login & Automated Session Refresh

### Actor
Registered Landlord

### Entry Point
Frontend URL: `/login`

### Preconditions
- User account exists and `isActive === true`.

### Flow
1. User inputs phone number or email and password at `/login`.
2. Frontend validates form and submits `POST /api/v1/auth/login`.
3. Backend checks rate limiting (10 req/min) and finds user by email or phone.
4. Backend verifies password hash using `argon2.verify(user.passwordHash, password)`.
5. Backend generates new JWT Access Token and Refresh Token, logs `AuditAction.LOGIN`.
6. Client stores tokens in `auth-store`.
7. **Subsequent API Requests**: `apiClient` Axios request interceptor injects `Authorization: Bearer <accessToken>`.
8. **Automated Refresh on Expiration**:
   - When access token expires, backend returns HTTP 401.
   - Axios response interceptor catches 401, queues pending requests, and calls `POST /api/v1/auth/refresh { refreshToken }`.
   - Backend verifies refresh token, issues fresh tokens.
   - Axios dequeues and retries original failed requests transparently.

### APIs
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

### Data Involved
- Tables: `users`, `audit_logs`

### Success State
Valid session established; client seamlessly refreshed on token expiration.

### Failure States
- **HTTP 401**: Invalid credentials (`ErrorCode.AUTH_UNAUTHORIZED`).
- **HTTP 401 on Refresh**: Invalid or expired refresh token $\to$ client logs out, clears localStorage, redirects to `/login`.

### Evidence
- Frontend: `barivara-web/src/lib/api.ts` (lines 47-165)
- Backend: `barivara-api/src/auth/auth.controller.ts` (lines 49-74)

---

## Journey 3: Password Recovery via Email OTP

### Actor
Landlord unable to access account

### Entry Point
Frontend URL: `/forgot-password` $\to$ `/reset-password`

### Preconditions
- User has registered with a valid email address.

### Flow
1. User submits email address on `/forgot-password`.
2. Client calls `POST /api/v1/auth/forgot-password { email }`.
3. Backend generates a 6-digit cryptographically secure numeric OTP using `crypto.randomInt()`.
4. Backend stores OTP in memory map `pendingOtps` with a 10-minute expiry timestamp.
5. Backend invokes `EmailService.sendPasswordResetOtp()` via Resend HTTPS API (`resend.emails.send`).
6. User receives email with 6-digit OTP code.
7. User enters code on `/reset-password` $\to$ client calls `POST /api/v1/auth/verify-password-reset-otp { identifier, otp }`.
8. Backend verifies OTP match, removes it from `pendingOtps`, and generates temporary `resetToken` in `resetSessions` map (15-minute expiry).
9. User enters new password $\to$ client calls `POST /api/v1/auth/reset-password { resetToken, newPassword }`.
10. Backend verifies `resetToken`, hashes new password via `argon2`, and updates `users.passwordHash`.

### APIs
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/verify-password-reset-otp`
- `POST /api/v1/auth/reset-password`

### Data Involved
- Tables: `users`
- In-memory: `pendingOtps`, `resetSessions`
- External Service: Resend Email API

### Success State
Password hash updated in database; user can log in with new password.

### Failure States
- **HTTP 400**: Invalid or expired OTP code (max 5 incorrect attempts allowed).
- **HTTP 429**: Rate limit exceeded (5 requests/min on forgot-password).

### Evidence
- Frontend: `barivara-web/src/app/(auth)/forgot-password/page.tsx`
- Backend: `barivara-api/src/auth/auth.service.ts` (lines 280-495)
- Email: `barivara-api/src/email/email.service.ts`

---

## Journey 4: Property Creation & Unit Setup

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/properties` $\to$ "Add Property" Dialog

### Preconditions
- User is authenticated with valid JWT.

### Flow
1. User clicks "নতুন সম্পত্তি যোগ করুন" (Add Property) and enters Name, Address, City, District, Total Floors.
2. Client submits `POST /api/v1/properties`.
3. Backend validates payload with `CreatePropertyDto` and inserts into `properties` with `ownerId: user.id`.
4. User opens property details page `/properties/[id]`.
5. User adds rental units (flats/rooms) individually or in bulk:
   - **Single Unit**: `POST /api/v1/properties/:propertyId/units` with Unit Number (e.g. "Flat 3A"), Floor, Type, Bedrooms, Bathrooms, Monthly Base Rent, Default Service Fee.
   - **Bulk Units**: `POST /api/v1/properties/:propertyId/units/bulk` generates multiple flats across specified floor ranges.
6. Backend inserts units in `units` table with default `status: UnitStatus.VACANT`.

### APIs
- `GET /api/v1/properties`
- `POST /api/v1/properties`
- `GET /api/v1/properties/:propertyId/units`
- `POST /api/v1/properties/:propertyId/units`
- `POST /api/v1/properties/:propertyId/units/bulk`

### Data Involved
- Tables: `properties`, `units`

### Success State
Property and its associated units exist in database with `VACANT` status ready for tenant assignment.

### Failure States
- **HTTP 403**: Attempting to add units to a property owned by another user (`ErrorCode.PROPERTY_ACCESS_DENIED`).
- **HTTP 409**: Duplicate unit number in the same property.

### Evidence
- Frontend: `barivara-web/src/app/(dashboard)/properties/page.tsx`
- Backend: `barivara-api/src/properties/properties.service.ts`
- Backend: `barivara-api/src/units/units.service.ts`

---

## Journey 5: Tenant Onboarding & Document Upload

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/tenants` $\to$ "Add Tenant" Dialog

### Preconditions
- User is authenticated.

### Flow
1. Landlord inputs Tenant Name, Phone, Email, Address, Emergency Contact, and Occupation.
2. Landlord optionally attaches Tenant Profile Picture, Front NID, or Back NID:
   - Frontend invokes `uploadFileDirectly()` (`barivara-web/src/lib/file-upload.ts`):
     1. Client calls `POST /api/v1/files/upload-url` with `{ category: TENANT_FRONT_NID, originalName, mimeType, size }`.
     2. Backend validates MIME/size, generates Supabase signed upload URL for bucket `tenant-documents`, and creates `Media` record in `PENDING` status.
     3. Client performs direct HTTP `PUT` of the file binary to the Supabase Storage URL.
     4. Client calls `POST /api/v1/files/:fileId/complete` to verify object existence and mark `Media` status as `COMPLETED`.
3. Client submits `POST /api/v1/tenants` including `nidFrontImageId`, `nidBackImageId`, and `profilePictureId`.
4. Backend creates record in `tenants` table.

### APIs
- `POST /api/v1/files/upload-url`
- `POST /api/v1/files/:id/complete`
- `POST /api/v1/tenants`

### Data Involved
- Tables: `tenants`, `media`
- Storage: Supabase Storage bucket `tenant-documents` (private)

### Success State
Tenant profile saved with verified private media attachments.

### Evidence
- Frontend: `barivara-web/src/lib/file-upload.ts`
- Backend: `barivara-api/src/tenants/tenants.service.ts`
- Storage: `barivara-api/src/files/storage/supabase-storage.service.ts`

---

## Journey 6: Rental Agreement Execution & Immediate Invoice Generation

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/agreements` $\to$ `AgreementFormDialog`

### Preconditions
- Target Unit is in `VACANT` status.
- Selected Tenant does not already have an `ACTIVE` agreement on the same unit.

### Flow
1. Landlord selects Tenant and vacant Unit.
2. Landlord specifies Monthly Rent, Service Fee, Parking Fee, Extra Charge, Due Day (1-31), Security Deposit, Start Date, and End Date.
3. Landlord checks "তাত্ক্ষণিকভাবে চলতি মাসের ভাড়ার বিল তৈরি করুন" (`generateCurrentMonthRent: true`).
4. Client sends `POST /api/v1/rental-agreements`.
5. Backend validates payload with `CreateRentalAgreementDto`.
6. Inside `prisma.$transaction`:
   - Verifies unit exists, is owned by landlord, and is currently `VACANT`.
   - Inserts new `RentalAgreement` record with `status: ACTIVE`.
   - Updates `Unit.status` to `OCCUPIED`.
   - If `generateCurrentMonthRent` is `true`, immediately calls `MonthlyRentsService.createForAgreement()` to generate initial invoice.
7. Transaction commits.

### APIs
- `POST /api/v1/rental-agreements`

### Data Involved
- Tables: `rental_agreements`, `units`, `monthly_rents`

### Success State
Agreement is `ACTIVE`, unit is `OCCUPIED`, and first month's invoice is generated.

### Failure States
- **HTTP 409**: Unit is already occupied (`ErrorCode.UNIT_ALREADY_OCCUPIED`).
- **HTTP 409**: Tenant already has an active lease (`ErrorCode.TENANT_ACTIVE_AGREEMENT_EXISTS`).

### Evidence
- Frontend: `barivara-web/src/components/agreements/agreement-form-dialog.tsx`
- Backend: `barivara-api/src/rental-agreements/rental-agreements.service.ts` (lines 40-140)

---

## Journey 7: Bulk Monthly Rent Billing Generation

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/rents` $\to$ `GenerateRentDialog`

### Preconditions
- One or more `ACTIVE` rental agreements exist under the landlord's properties.

### Flow
1. Landlord opens "ভাড়া তৈরি করুন" (Generate Rent) modal and picks Target Year (e.g. 2026) and Month (e.g. October).
2. Client submits `POST /api/v1/monthly-rents/generate { year: 2026, month: 10, propertyId?: ... }`.
3. Backend finds all `ACTIVE` rental agreements belonging to the landlord.
4. For each agreement:
   - Checks if `monthly_rents` record already exists for `[agreementId, year, month]`.
   - If already exists, increments `skippedCount`.
   - If not, calculates due date clamped to valid days for Dhaka timezone via `DateUtil.calculateDueDate()`.
   - Calculates total via `DecimalUtil.calculateRentTotal(rent, serviceFee, parkingFee, extraCharge)`.
   - Inserts `MonthlyRent` with `status: PENDING`, `paidAmount: 0`, and `remainingAmount: totalAmount`.
5. Backend records an `AuditLog` entry (`action: RENT_GENERATED`).
6. UI displays report modal: "Generated: X bills, Skipped: Y bills".

### APIs
- `POST /api/v1/monthly-rents/generate`

### Data Involved
- Tables: `monthly_rents`, `rental_agreements`, `audit_logs`

### Success State
New invoice records generated idempotently without duplicate billing.

### Evidence
- Frontend: `barivara-web/src/components/rents/generate-rent-dialog.tsx`
- Backend: `barivara-api/src/monthly-rents/monthly-rents.service.ts` (lines 24-180)

---

## Journey 8: Payment Collection & WhatsApp Receipt Dispatch

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/rents` or `/payments` $\to$ "ভাড়া সংগ্রহ করুন" (Collect Rent) Modal

### Preconditions
- Monthly Rent record exists with `remainingAmount > 0` and `status !== CANCELLED`.

### Flow
1. Landlord opens Collect Rent dialog for a tenant's invoice.
2. Landlord enters Payment Amount, Method (`CASH`, `BKASH`, `BANK`, etc.), Transaction ID, and Note.
3. Client submits `POST /api/v1/payments`.
4. Backend executes `payments.service.ts` inside `prisma.$transaction`:
   - Validates payment amount does not exceed `monthlyRent.remainingAmount`.
   - Inserts `Payment` record with `status: COMPLETED`.
   - Deducts amount from `remainingAmount` and adds to `paidAmount`.
   - If `remainingAmount == 0`, updates rent status to `PAID` and sets `paidDate: now()`. Otherwise sets status to `PARTIAL`.
   - If landlord has an active signature (`users.signatureFileId`), snapshots it to `Payment.ownerSignatureSnapshotId`.
   - Inserts `AuditLog` (`action: PAYMENT_CREATED`).
5. Backend returns completed Payment record.
6. Frontend displays success modal with a **"WhatsApp-এ রশিদ পাঠান"** (Send Receipt on WhatsApp) button.
7. Clicking the button invokes `generateWhatsAppReceiptMessage()` (`barivara-web/src/lib/whatsapp-receipt.ts`), opening `https://wa.me/{phone}?text={encodedReceipt}` with a formatted Bengali receipt.

### APIs
- `POST /api/v1/payments`
- `GET /api/v1/payments/:id`

### Data Involved
- Tables: `payments`, `monthly_rents`, `audit_logs`

### Success State
Payment ledger updated, invoice balance reduced, and WhatsApp receipt message ready for dispatch.

### Failure States
- **HTTP 400**: Amount exceeds remaining balance (`ErrorCode.PAYMENT_AMOUNT_EXCEEDS_REMAINING`).
- **HTTP 400**: Rent invoice is already fully paid.

### Evidence
- Frontend: `barivara-web/src/lib/whatsapp-receipt.ts`
- Backend: `barivara-api/src/payments/payments.service.ts` (lines 35-130)

---

## Journey 9: Payment Reversal (Audit Recovery)

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/payments` $\to$ Payment Row Actions $\to$ "বাতিল / রিভার্স করুন" (Reverse)

### Preconditions
- Payment record exists with `status === COMPLETED`.

### Flow
1. Landlord selects a payment record entered by mistake and inputs a reversal reason.
2. Client sends `POST /api/v1/payments/:id/reverse { reason }`.
3. Backend runs `payments.service.ts` in `prisma.$transaction`:
   - Verifies payment ownership and checks `payment.status !== REVERSED`.
   - Updates `payment.status` to `REVERSED`.
   - Re-adds payment amount to `monthlyRent.remainingAmount` and subtracts from `paidAmount`.
   - Recalculates rent status (`PARTIAL` or `PENDING` / `OVERDUE`).
   - Inserts `AuditLog` entry (`action: PAYMENT_REVERSED`).
4. Transaction commits.

### APIs
- `POST /api/v1/payments/:id/reverse`

### Data Involved
- Tables: `payments`, `monthly_rents`, `audit_logs`

### Success State
Payment marked `REVERSED`, invoice balance restored, audit trail preserved.

### Evidence
- Backend: `barivara-api/src/payments/payments.service.ts` (lines 140-230)

---

## Journey 10: Financial Reporting & CSV Statement Export

### Actor
Authenticated Landlord

### Entry Point
Frontend URL: `/reports`

### Preconditions
- User is authenticated.

### Flow
1. Landlord navigates to `/reports` and selects Year and Month.
2. Client calls `GET /api/v1/reports/monthly?year=2026&month=10`.
3. Backend calculates:
   - Total expected rent revenue.
   - Total rent collected (`Payment` records in date range with `status: COMPLETED`).
   - Total outstanding arrears.
   - Total expenses grouped by category (`expenses` table).
   - Net profit / cash flow (`Collected - Expenses`).
4. Landlord clicks "Download CSV" $\to$ browser issues `GET /api/v1/reports/monthly/export?format=csv`.
5. Backend streams formatted CSV using `csv-stringify` with `Content-Type: text/csv`.

### APIs
- `GET /api/v1/reports/monthly`
- `GET /api/v1/reports/monthly/export`
- `GET /api/v1/reports/properties/:propertyId/financial`

### Data Involved
- Tables: `monthly_rents`, `payments`, `expenses`, `properties`

### Success State
Aggregated financial statement displayed on dashboard and downloaded as CSV.

### Evidence
- Frontend: `barivara-web/src/app/(dashboard)/reports/page.tsx`
- Backend: `barivara-api/src/reports/reports.service.ts`
