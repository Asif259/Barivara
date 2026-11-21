# Known Issues, Risks & Technical Debt

> Comprehensive audit of discovered bugs, performance risks, architectural limitations, and technical debt in the BariVara project.

---

## Issue 1: Unit Test Failure in Monthly Rent Generation Spec

- **Severity**: High (Code Quality / CI/CD)
- **Evidence**: Running `npm run test` in `barivara-api` reports:
  ```text
  FAIL src/monthly-rents/monthly-rents.service-generate.spec.ts
  ● MonthlyRentsService — generate › generates rents for all active agreements
    Expected: 2, Received: 0
  ● MonthlyRentsService — generate › calculates totalAmount correctly
    TypeError: Cannot read properties of undefined (reading 'totalAmount')
  ```
- **Affected area**: `barivara-api/src/monthly-rents/monthly-rents.service-generate.spec.ts`
- **Current behavior**: The mocked Prisma transaction and test fixtures in `monthly-rents.service-generate.spec.ts` do not match the updated query conditions in `monthly-rents.service.ts` (which now checks active agreements with non-null properties and date filters), resulting in 0 captured records and 6 failed assertions.
- **Expected behavior**: All unit test suites should pass cleanly (`100% pass`).
- **Possible impact**: Blocks automated CI/CD deployment pipelines if test failure gating is enabled.
- **Status**: Resolved (Mock fixtures updated with valid agreement start dates; 100% test pass verified across 20 test suites).

---

## Issue 2: In-Memory Storage of Password Reset OTPs and Reset Sessions

- **Severity**: Medium (Reliability & Scalability)
- **Evidence**: `barivara-api/src/auth/auth.service.ts` lines 43-44:
  ```typescript
  private readonly pendingOtps = new Map<string, PendingOtpRecord>();
  private readonly resetSessions = new Map<string, ResetSessionRecord>();
  ```
- **Affected area**: `barivara-api/src/auth/auth.service.ts`
- **Current behavior**: Password reset OTP codes (generated when users request password reset) and verified session tokens are held in Node.js process heap memory using JavaScript `Map` objects.
- **Expected behavior**: Production authentication tokens and OTPs should be stored in a shared, persistent store with automatic TTL (such as Redis or a dedicated database table like `password_resets`).
- **Possible impact**:
  1. A backend server restart or deployment invalidates all in-flight password reset OTPs.
  2. If the backend is horizontally scaled across multiple instances or worker processes behind a load balancer, OTP verification will fail whenever the verification request hits a different server node than the initial request.
- **Status**: Active Technical Debt.
- **Recommended next investigation/fix**: Migrate `pendingOtps` and `resetSessions` into a database table or Redis cache with automated expiration.

---

## Issue 3: Incomplete Cleanup for Abandoned File Uploads

- **Severity**: Low (Storage Efficiency)
- **Evidence**: `barivara-api/src/files/files.service.ts` (`requestUploadUrl` creates records with `status: FileStatus.PENDING`).
- **Affected area**: `barivara-api/src/files/` & Supabase Storage
- **Current behavior**: When a user initiates a file upload, a `Media` record is inserted with `PENDING` status. If the client closes the browser, loses internet connection, or encounters an upload error before calling `completeUpload`, the record remains in `PENDING` indefinitely.
- **Expected behavior**: A periodic background cleanup routine (or database query) should prune `PENDING` media records older than 24 hours.
- **Possible impact**: Slow accumulation of orphaned `PENDING` rows in the `media` table over time.
- **Status**: Discovered Technical Debt.
- **Recommended next investigation/fix**: Create a scheduled pruning script or database maintenance query that deletes `PENDING` media records older than 24 hours.

---

## Issue 4: Outdated Root Documentation Contradicting Implementation

- **Severity**: Low (Documentation Gap)
- **Evidence**: `frontend_api_gaps.md` lists:
  - Password Recovery (`/api/v1/auth/forgot-password`)
  - File & Image Uploads (`/api/v1/uploads/image`)
  - User Profile Update (`/api/v1/users/profile`)
  as "missing backend APIs".
- **Affected area**: Workspace root documentation files (`frontend_api_gaps.md`, `frontend_api_map.md`).
- **Current behavior**: `barivara-api` actually implements all three features:
  - Password recovery: `AuthController` (`forgot-password`, `verify-password-reset-otp`, `reset-password`, `reset-password-direct`).
  - File uploads: `FilesController` (`/api/v1/files/upload-url`, `/api/v1/files/:id/complete`).
  - Signature update: `UsersController` (`/api/v1/users/profile/signature`).
- **Expected behavior**: Documentation should reflect the actual current implementation state.
- **Possible impact**: Confuses developers and AI agents into believing core features are missing when they already exist.
- **Status**: Documentation Drift.
- **Recommended next investigation/fix**: Archive or update `frontend_api_gaps.md` with current implementation status.

---

## Issue 5: Lack of SMS Gateway for Reminders

- **Severity**: Low (Feature Incompleteness)
- **Evidence**: `prisma/schema.prisma` declares `enum ReminderChannel { IN_APP, PUSH, EMAIL, SMS, WHATSAPP }`. `barivara-web/src/lib/whatsapp-receipt.ts` exists for client-side WhatsApp link generation. However, backend services have no integrated SMS gateway (e.g., SSL Wireless, Twilio, or Greenweb).
- **Affected area**: `barivara-api/src/reminders/`
- **Current behavior**: Reminders created with channel `SMS` or `PUSH` are stored in the database but have no delivery provider dispatch logic. Only `IN_APP` reminders are functional in UI.
- **Expected behavior**: Either restrict channels to supported options (`IN_APP`, `EMAIL`) or integrate a local SMS aggregator.
- **Possible impact**: Landlords expecting automated SMS reminders to tenants will not receive automated text messages.
- **Status**: Feature limitation (known from schema vs service implementation).
- **Recommended next investigation/fix**: Implement a pluggable SMS provider in `barivara-api/src/reminders/` or explicitly disable non-functional channels in the UI dropdown.
