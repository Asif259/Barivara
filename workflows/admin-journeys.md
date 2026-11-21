# Administrator Journeys

> Architectural analysis and documentation of administrative workflows in BariVara.  
> **Important Finding**: No global SaaS "platform superadmin" exists in the current codebase. Administrative authority is modeled around the **Property Owner** (`Role.OWNER`), who has full administrative governance over their multi-tenant organization (properties, units, leases, tenants, staff, financial ledgers, and audit logs).

---

## Administrative Architecture & Roles

The database schema (`prisma/schema.prisma`) defines three user roles:
```prisma
enum Role {
  OWNER
  MANAGER
  STAFF
}
```

- **`OWNER`** (Fully Implemented): The primary account administrator. Owns properties, signs agreements, manages financial ledgers, executes reversals, and configures digital signatures.
- **`MANAGER` / `STAFF`** (Partially Implemented): Role enum values exist in the database and a `RolesGuard` (`barivara-api/src/common/guards/roles.guard.ts`) is implemented. However, controller-level granular role restrictions are not actively enforced on domain routes; all data isolation is scoped to `ownerId === userId`.
- **Global Platform Superadmin**: **Status: Not Found**. There is no cross-tenant platform administration dashboard or back-office panel in either `barivara-api` or `barivara-web`.

---

## Admin Journey 1: Portfolio Executive Overview & Operational Metrics

### Actor
Property Owner (`Role.OWNER`)

### Entry Point
Frontend URL: `/dashboard`

### Preconditions
- Landlord is authenticated.

### Flow
1. Landlord navigates to `/dashboard`.
2. Frontend issues parallel queries via TanStack React Query:
   - `GET /api/v1/dashboard/overview`
   - `GET /api/v1/monthly-rents/outstanding?limit=5`
3. Backend `DashboardService` calculates portfolio aggregates:
   - Total properties and total rental units.
   - Occupancy rate: `(Occupied Units / Total Units) * 100`.
   - Monthly expected rent vs. actual collected rent for the active month.
   - Total outstanding unpaid arrears across all tenants.
4. UI renders executive summary cards, occupancy visualizer, and pending collections table.

### APIs
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/monthly-rents/outstanding`

### Database Operations
- Queries `properties`, `units`, `monthly_rents`, `payments` scoped to `ownerId === userId`.

### Permissions
- Scoped to authenticated user.

### Success State
Executive dashboard displays real-time portfolio occupancy and financial health.

### Evidence
- Frontend: `barivara-web/src/app/(dashboard)/dashboard/page.tsx`
- Backend: `barivara-api/src/dashboard/dashboard.service.ts`

---

## Admin Journey 2: Lease Termination & Unit Vacancy Restoration

### Actor
Property Owner (`Role.OWNER`)

### Entry Point
Frontend URL: `/agreements` $\to$ Agreement Actions $\to$ "চুক্তি সমাপ্ত করুন" (Terminate Agreement)

### Preconditions
- Agreement is in `ACTIVE` status.

### Flow
1. Landlord initiates agreement termination and specifies an effective termination date (`endDate`).
2. Client sends `POST /api/v1/rental-agreements/:id/end { endDate }`.
3. Backend runs `rental-agreements.service.ts` inside `prisma.$transaction`:
   - Verifies agreement ownership (`agreement.unit.property.ownerId === userId`).
   - Checks agreement is currently `ACTIVE`.
   - Updates `rental_agreements.status` to `AgreementStatus.ENDED` and sets `endDate`.
   - Transitions associated `Unit.status` from `OCCUPIED` back to `VACANT`.
   - Inserts `AuditLog` entry (`action: AuditAction.UPDATE`).
4. Transaction commits.
5. Unit is restored to vacant inventory, allowing new tenants to be leased.

### APIs
- `POST /api/v1/rental-agreements/:id/end`

### Database Operations
- Atomic update of `rental_agreements` and `units` tables.

### Permissions
- Strictly restricted to the owner of the unit's property.

### Success State
Lease agreement status is `ENDED`; unit status is `VACANT`.

### Failure States
- **HTTP 400**: Agreement is already ended or cancelled.
- **HTTP 403**: User does not own the property.

### Audit / Logging
- Emits `AuditAction.UPDATE` recording termination timestamp.

### Evidence
- Frontend: `barivara-web/src/app/(dashboard)/agreements/page.tsx`
- Backend: `barivara-api/src/rental-agreements/rental-agreements.service.ts` (lines 330-380)

---

## Admin Journey 3: Administrative Payment Reversal & Balance Restoration

### Actor
Property Owner (`Role.OWNER`)

### Entry Point
Frontend URL: `/payments` $\to$ Action Menu $\to$ "বাতিল / রিভার্স করুন"

### Preconditions
- Target payment is in `COMPLETED` status.

### Flow
1. Landlord identifies an erroneous or bounced payment entry.
2. Landlord enters a mandatory reason for reversal.
3. Client submits `POST /api/v1/payments/:id/reverse { reason: "Cheque bounced" }`.
4. Backend executes `payments.service.ts` inside `prisma.$transaction`:
   - Verifies payment ownership.
   - Sets `payment.status = PaymentStatus.REVERSED`.
   - Restores the reversed sum back to `monthlyRent.remainingAmount`.
   - Deducts the reversed sum from `monthlyRent.paidAmount`.
   - Recalculates rent status (transitions from `PAID` back to `PARTIAL` or `PENDING` / `OVERDUE`).
   - Clears `monthlyRent.paidDate` if previously marked paid.
   - Logs an `AuditLog` with `action: AuditAction.PAYMENT_REVERSED`.
5. Frontend invalidates cache and updates both payment history and monthly rent status.

### APIs
- `POST /api/v1/payments/:id/reverse`

### Database Operations
- Modifies `payments`, `monthly_rents`, inserts into `audit_logs`.

### Permissions
- Verified against `payment.monthlyRent.agreement.unit.property.ownerId === userId`.

### Success State
Payment ledger reflects `REVERSED` transaction; tenant's outstanding balance increases by the reversed amount.

### Audit / Logging
- Emits `AuditAction.PAYMENT_REVERSED` with reversal metadata.

### Evidence
- Backend: `barivara-api/src/payments/payments.service.ts` (lines 140-230)

---

## Admin Journey 4: Security & Operational Audit Log Inspection

### Actor
Property Owner (`Role.OWNER`)

### Entry Point
Frontend URL: Settings / Audit Trail (or direct API inspection)

### Preconditions
- User is authenticated.

### Flow
1. Owner requests security and action logs for their account.
2. Client dispatches `GET /api/v1/audit-logs?page=1&limit=20`.
3. Backend filters `audit_logs` where `userId === user.id`.
4. Returns chronological log of events:
   - `LOGIN` & `LOGOUT` events with client IP and User-Agent.
   - `PAYMENT_CREATED` & `PAYMENT_REVERSED` with financial IDs.
   - `RENT_GENERATED` with monthly batch details.
5. UI displays an immutable activity audit timeline.

### APIs
- `GET /api/v1/audit-logs`

### Database Operations
- Reads `audit_logs` table ordered by `createdAt: 'desc'`.

### Permissions
- Landlords can only see audit events associated with their own `userId`.

### Success State
Complete history of administrative and financial operations displayed to owner.

### Evidence
- Backend: `barivara-api/src/audit-logs/audit-logs.controller.ts`
- Service: `barivara-api/src/audit-logs/audit-logs.service.ts`

---

## Admin Journey 5: Owner Digital Signature Administration

### Actor
Property Owner (`Role.OWNER` strictly enforced)

### Entry Point
Frontend URL: `/settings` $\to$ "মালিকের ডিজিটাল স্বাক্ষর" (Owner Signature)

### Preconditions
- Authenticated user must have `role === Role.OWNER`.

### Flow
1. Landlord uploads a signature image (PNG/JPEG, max 2MB).
2. Client uploads file to Supabase bucket `owner-signatures` via 3-step signed upload URL flow.
3. Client submits `PATCH /api/v1/users/profile/signature { fileId }`.
4. Backend `UsersController.updateSignature()` asserts `user.role === 'OWNER'`:
   - If user is not `OWNER`, throws HTTP 403 (`ErrorCode.AUTH_FORBIDDEN`).
   - Validates that `fileId` exists in `media` table, belongs to user, has category `OWNER_SIGNATURE`, and status `COMPLETED`.
   - Updates `users.signatureFileId = fileId`.
5. When future payments are collected, this signature file ID is snapshotted to `payments.ownerSignatureSnapshotId`, embedding the owner's signature on payment receipts.

### APIs
- `PATCH /api/v1/users/profile/signature`
- `DELETE /api/v1/users/profile/signature`

### Database Operations
- Updates `users` table (`signatureFileId`).

### Permissions
- Hardcoded role assertion: `user.role === 'OWNER'` (`assertOwnerRole` in `UsersController`).

### Success State
Digital signature bound to landlord profile and automatically linked to subsequent payment receipts.

### Evidence
- Backend: `barivara-api/src/users/users.controller.ts` (lines 37-91)
- Service: `barivara-api/src/users/users.service.ts`
