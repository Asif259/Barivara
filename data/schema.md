# Data Schema

## 1. Overview

The BariVara data architecture is centered on a relational multi-tenant property management model. Data is stored in a hosted PostgreSQL instance on Supabase and managed using Prisma ORM. Access is strictly scoped to the authenticated landlord (`User`), with properties, rental units, tenant contracts, monthly billing cycles, and append-only payment transactions organized hierarchically beneath each owner.

---

## 2. Data Storage Technology

- **Database Engine**: PostgreSQL 16 (Hosted on Supabase)
- **Object-Relational Mapping (ORM)**: Prisma ORM v5.22.0
- **Object Storage**: Supabase Storage (4 storage buckets)
- **Connection Mode**: PostgreSQL connection pooling over TLS (`DATABASE_URL` with `?sslmode=require&pgbouncer=true`)
- **Row-Level Security**: Enabled with default-deny on PostgREST roles (`anon`, `authenticated`). All application access is performed through the NestJS backend via the privileged database connection.

---

## 3. Entities / Tables

### User (`users`)

**Purpose:**
Stores registered landlords and property managers who authenticate and own properties within the system.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `name` | `String` | Yes | - | Full name of the user |
| `email` | `String` | No | `null` | Unique email address |
| `phone` | `String` | No | `null` | Unique mobile phone number |
| `passwordHash` | `String` | Yes | - | Argon2 password hash |
| `role` | `Role` (Enum) | Yes | `OWNER` | User permission role (`OWNER`, `MANAGER`, `STAFF`) |
| `isActive` | `Boolean` | Yes | `true` | Account active flag |
| `signatureFileId`| `String (UUID)`| No | `null` | Reference to owner signature in `media` table |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: None (self-contained account entity)
- **Unique Constraints**: `email` (unique), `phone` (unique)
- **Indexes**: Primary key index on `id`, unique btree indexes on `email` and `phone`
- **Enums**: `Role` (`OWNER`, `MANAGER`, `STAFF`)
- **Security / Access Notes**: Passwords hashed with `argon2`. Owns properties directly via `ownerId`.

---

### Property (`properties`)

**Purpose:**
Represents a physical building, apartment complex, or house managed by an owner.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `ownerId` | `String (UUID)` | Yes | - | References `users.id` |
| `name` | `String` | Yes | - | Property building name |
| `address` | `String` | Yes | - | Street address / location |
| `city` | `String` | No | `null` | City name |
| `district` | `String` | No | `null` | Administrative district |
| `postalCode` | `String` | No | `null` | Postal / ZIP code |
| `description` | `String` | No | `null` | Additional notes or description |
| `totalFloors` | `Int` | Yes | `1` | Total floor count |
| `isActive` | `Boolean` | Yes | `true` | Property active status |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `ownerId` $\to$ `users.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([ownerId])`
- **Security / Access Notes**: Scoped to authenticated user's `id`.

---

### Unit (`units`)

**Purpose:**
Represents an individual rentable unit (apartment, flat, room, shop) within a property.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `propertyId` | `String (UUID)` | Yes | - | References `properties.id` |
| `unitNumber` | `String` | Yes | - | Flat or room identifier (e.g. "3A", "Flat 4B") |
| `floor` | `Int` | Yes | `0` | Floor number |
| `unitType` | `UnitType` (Enum)| Yes | `APARTMENT` | Type of unit |
| `bedrooms` | `Int` | No | `null` | Number of bedrooms |
| `bathrooms` | `Int` | No | `null` | Number of bathrooms |
| `monthlyBaseRent`| `Decimal(12,2)` | Yes | `0` | Default monthly rent amount |
| `defaultServiceFee`| `Decimal(12,2)`| Yes | `0` | Default service charge |
| `defaultParkingFee`| `Decimal(12,2)`| Yes | `0` | Default parking fee |
| `defaultExtraCharge`| `Decimal(12,2)`| Yes| `0` | Default extra charge |
| `status` | `UnitStatus` | Yes | `VACANT` | Availability status |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `propertyId` $\to$ `properties.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([propertyId])`
- **Enums**:
  - `UnitType`: `APARTMENT`, `FLAT`, `ROOM`, `SHOP`, `OFFICE`, `PARKING`, `OTHER`
  - `UnitStatus`: `VACANT`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`
- **Security / Access Notes**: Property ownership must be verified before modifying units.

---

### Tenant (`tenants`)

**Purpose:**
Stores renter profiles, contact details, emergency contacts, and references to verification documents.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `name` | `String` | Yes | - | Tenant's full name |
| `phone` | `String` | Yes | - | Tenant's mobile phone number |
| `email` | `String` | No | `null` | Tenant's email address |
| `profilePictureId` | `String (UUID)`| No | `null` | Reference to tenant avatar in `media` table |
| `nidFrontImageId` | `String (UUID)`| No | `null` | Reference to front National ID in `media` |
| `nidBackImageId` | `String (UUID)`| No | `null` | Reference to back National ID in `media` |
| `permanentAddress` | `String` | No | `null` | Permanent home address |
| `emergencyContactName`| `String` | No | `null` | Emergency contact person name |
| `emergencyContactPhone`| `String` | No | `null` | Emergency contact telephone |
| `occupation` | `String` | No | `null` | Occupation / employer |
| `notes` | `String` | No | `null` | Additional background notes |
| `isActive` | `Boolean` | Yes | `true` | Active tenant flag |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: None (independent entity linked via `rental_agreements`)
- **Indexes**: `@@index([phone])`
- **Security / Access Notes**: NID documents are stored in private Supabase bucket `tenant-documents` requiring signed URLs.

---

### RentalAgreement (`rental_agreements`)

**Purpose:**
Binds a tenant to a specific rental unit under defined financial and temporal terms.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `tenantId` | `String (UUID)` | Yes | - | References `tenants.id` |
| `unitId` | `String (UUID)` | Yes | - | References `units.id` |
| `monthlyRent` | `Decimal(12,2)` | Yes | - | Monthly base rent for this lease |
| `serviceFee` | `Decimal(12,2)` | Yes | `0` | Monthly service charge |
| `parkingFee` | `Decimal(12,2)` | Yes | `0` | Monthly parking fee |
| `extraCharge` | `Decimal(12,2)` | Yes | `0` | Other recurring monthly charges |
| `dueDay` | `Int` | Yes | `5` | Monthly rent due day (day of month, 1-31) |
| `securityDeposit`| `Decimal(12,2)` | Yes | `0` | Advance security deposit held |
| `startDate` | `DateTime` | Yes | - | Agreement commencement date |
| `endDate` | `DateTime` | No | `null` | Agreement termination / expiry date |
| `status` | `AgreementStatus`| Yes| `ACTIVE` | Lease status |
| `notes` | `String` | No | `null` | Special lease conditions |
| `agreementDocumentId`| `String (UUID)`| No | `null` | Scanned lease document in `media` table |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**:
  - `tenantId` $\to$ `tenants.id` (`onDelete: Cascade`)
  - `unitId` $\to$ `units.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([tenantId])`, `@@index([unitId])`, `@@index([status])`, `@@index([unitId, status])`
- **Enums**: `AgreementStatus`: `ACTIVE`, `ENDED`, `CANCELLED`
- **Security / Access Notes**: Changing status to `ACTIVE` marks associated `unit.status` as `OCCUPIED`. Ending marks `VACANT`.

---

### MonthlyRent (`monthly_rents`)

**Purpose:**
Represents a generated monthly rent invoice for an agreement covering a specific month and year.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `agreementId` | `String (UUID)` | Yes | - | References `rental_agreements.id` |
| `month` | `Int` | Yes | - | Month of invoice (1-12) |
| `year` | `Int` | Yes | - | Year of invoice (e.g. 2026) |
| `rent` | `Decimal(12,2)` | Yes | - | Base rent portion |
| `serviceFee` | `Decimal(12,2)` | Yes | `0` | Service fee portion |
| `parkingFee` | `Decimal(12,2)` | Yes | `0` | Parking fee portion |
| `extraCharge` | `Decimal(12,2)` | Yes | `0` | Extra charge portion |
| `lateFee` | `Decimal(12,2)` | Yes | `0` | Imposed late penalty |
| `discount` | `Decimal(12,2)` | Yes | `0` | Concession / discount applied |
| `totalAmount` | `Decimal(12,2)` | Yes | - | Grand total amount due |
| `paidAmount` | `Decimal(12,2)` | Yes | `0` | Cumulative amount collected |
| `remainingAmount`| `Decimal(12,2)`| Yes | - | Outstanding balance (`total - paid`) |
| `dueDate` | `DateTime` | Yes | - | Due payment date |
| `paidDate` | `DateTime` | No | `null` | Date full payment was completed |
| `status` | `RentStatus` | Yes | `PENDING` | Payment status |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `agreementId` $\to$ `rental_agreements.id` (`onDelete: Cascade`)
- **Unique Constraints**: `@@unique([agreementId, year, month])` (Idempotent billing guarantee)
- **Indexes**: `@@index([agreementId])`, `@@index([status])`, `@@index([dueDate])`, `@@index([year, month])`
- **Enums**: `RentStatus`: `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`

---

### Payment (`payments`)

**Purpose:**
An append-only financial transaction record documenting rent collected against a monthly rent invoice.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `monthlyRentId` | `String (UUID)` | Yes | - | References `monthly_rents.id` |
| `amount` | `Decimal(12,2)` | Yes | - | Payment amount collected |
| `paymentMethod` | `PaymentMethod`| Yes | `CASH` | Channel used to collect funds |
| `transactionId` | `String` | No | `null` | Bank or mobile financial service TxID |
| `paymentDate` | `DateTime` | Yes | `now()` | Date funds were collected |
| `receivedBy` | `String` | No | `null` | Person collecting payment |
| `note` | `String` | No | `null` | Payment remarks |
| `status` | `PaymentStatus`| Yes | `COMPLETED` | Transaction state (`COMPLETED`, `REVERSED`)|
| `ownerSignatureSnapshotId`| `String (UUID)`| No| `null`| Media snapshot of owner signature at payment|
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `monthlyRentId` $\to$ `monthly_rents.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([monthlyRentId])`, `@@index([monthlyRentId, status])`, `@@index([paymentDate])`
- **Enums**:
  - `PaymentMethod`: `CASH`, `BANK`, `BKASH`, `NAGAD`, `ROCKET`, `CARD`, `OTHER`
  - `PaymentStatus`: `COMPLETED`, `REVERSED`

---

### Expense (`expenses`)

**Purpose:**
Records property-level maintenance, utility, and administrative expenditures.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `propertyId` | `String (UUID)` | Yes | - | References `properties.id` |
| `category` | `ExpenseCategory`| Yes| - | Expense category classification |
| `amount` | `Decimal(12,2)` | Yes | - | Expenditure amount |
| `expenseDate` | `DateTime` | Yes | `now()` | Date expense was incurred |
| `description` | `String` | No | `null` | Detailed description |
| `paymentMethod` | `PaymentMethod`| Yes | `CASH` | Method of disbursement |
| `reference` | `String` | No | `null` | Bill/voucher reference number |
| `receiptFileId` | `String (UUID)`| No | `null` | Voucher image in `media` table |
| `createdBy` | `String` | No | `null` | User ID of staff recording expense |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `propertyId` $\to$ `properties.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([propertyId, expenseDate])`
- **Enums**: `ExpenseCategory`: `ELECTRICITY`, `WATER`, `GAS`, `MAINTENANCE`, `REPAIR`, `SECURITY`, `CLEANING`, `SALARY`, `TAX`, `OTHER`

---

### Reminder (`reminders`)

**Purpose:**
Tracks due-date reminders, payment receipts, and custom notifications for tenants.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `monthlyRentId` | `String (UUID)` | No | `null` | Optional link to `monthly_rents.id` |
| `tenantId` | `String (UUID)` | Yes | - | References `tenants.id` |
| `type` | `ReminderType` | Yes | - | Category of reminder |
| `scheduledAt` | `DateTime` | Yes | - | Target notification trigger date |
| `sentAt` | `DateTime` | No | `null` | Dispatch timestamp |
| `status` | `ReminderStatus`| Yes| `PENDING` | Delivery status |
| `channel` | `ReminderChannel`| Yes| `IN_APP` | Transmission channel |
| `message` | `String` | Yes | - | Notification text message |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |

- **Primary Key**: `id`
- **Foreign Keys**:
  - `monthlyRentId` $\to$ `monthly_rents.id` (`onDelete: SetNull`)
  - `tenantId` $\to$ `tenants.id` (`onDelete: Cascade`)
- **Indexes**: `@@index([scheduledAt, status])`
- **Enums**:
  - `ReminderType`: `UPCOMING_DUE`, `DUE_TODAY`, `OVERDUE`, `PAYMENT_CONFIRMATION`, `CUSTOM`
  - `ReminderChannel`: `IN_APP`, `PUSH`, `EMAIL`, `SMS`, `WHATSAPP`
  - `ReminderStatus`: `PENDING`, `SENT`, `FAILED`, `CANCELLED`

---

### AuditLog (`audit_logs`)

**Purpose:**
Provides an immutable security and audit trail for key domain actions and authentication events.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `userId` | `String (UUID)` | No | `null` | Actor `users.id` (null for anonymous/system) |
| `action` | `AuditAction` | Yes | - | Categorized event type |
| `entityType` | `String` | Yes | - | Target entity name (e.g. "Payment", "User") |
| `entityId` | `String` | No | `null` | Target entity UUID |
| `metadata` | `Json` | No | `null` | Contextual JSON payload |
| `ipAddress` | `String` | No | `null` | Remote client IP address |
| `userAgent` | `String` | No | `null` | HTTP User-Agent string |
| `createdAt` | `DateTime` | Yes | `now()` | Event occurrence timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: `userId` $\to$ `users.id` (`onDelete: SetNull`)
- **Indexes**: `@@index([userId])`, `@@index([entityType, entityId])`
- **Enums**: `AuditAction`: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `PAYMENT_CREATED`, `PAYMENT_REVERSED`, `RENT_GENERATED`

---

### Media (`media`)

**Purpose:**
Maintains metadata, bucket locations, and verification states for files uploaded directly to Supabase Storage.

**Fields:**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `id` | `String (UUID)` | Yes | `uuid()` | Primary key |
| `originalName` | `String` | Yes | - | Uploaded file name |
| `storagePath` | `String` | Yes | - | Internal object path inside Supabase bucket |
| `bucket` | `String` | Yes | - | Supabase Storage bucket name |
| `mimeType` | `String` | Yes | - | Standard MIME type (e.g. `image/jpeg`) |
| `size` | `Int` | Yes | - | File size in bytes |
| `category` | `FileCategory` | Yes | - | Classification of document |
| `entityType` | `String` | No | `null` | Linked entity type ("tenant", "property", etc.)|
| `entityId` | `String` | No | `null` | Linked entity UUID |
| `uploadedBy` | `String` | Yes | - | User ID of the uploader |
| `status` | `FileStatus` | Yes | `PENDING` | Upload state |
| `createdAt` | `DateTime` | Yes | `now()` | Record creation timestamp |
| `updatedAt` | `DateTime` | Yes | - | Record update timestamp |
| `deletedAt` | `DateTime` | No | `null` | Soft deletion timestamp |

- **Primary Key**: `id`
- **Foreign Keys**: None (loosely coupled reference to prevent cascade anomalies)
- **Indexes**: `@@index([entityType, entityId])`, `@@index([uploadedBy])`, `@@index([status])`
- **Enums**:
  - `FileCategory`: `PROFILE_IMAGE`, `PROPERTY_IMAGE`, `TENANT_PROFILE_PICTURE`, `TENANT_FRONT_NID`, `TENANT_BACK_NID`, `TENANT_DOCUMENT`, `AGREEMENT_DOCUMENT`, `PAYMENT_RECEIPT`, `OWNER_SIGNATURE`, `OTHER`
  - `FileStatus`: `PENDING`, `COMPLETED`, `FAILED`, `DELETED`

---

## 4. Authentication Data

- Handled completely by the `users` table via `passwordHash` (Argon2).
- Authenticated state is transported through stateless JSON Web Tokens:
  - `accessToken`: Standard JWT with 15m expiration containing `{ sub: user.id, role: user.role, email: user.email }`.
  - `refreshToken`: Signed JWT with 30d expiration containing `{ sub: user.id }`.
- Password reset OTPs are verified in-memory within `AuthService` (`pendingOtps`).

---

## 5. Security

- **Row-Level Security (RLS)**: Enforced via PostgreSQL `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` on all 11 tables and `_prisma_migrations`.
- **Default-Deny Privileges**: Privileges are revoked from Supabase PostgREST roles `anon` and `authenticated`.
- **Application Authorization**: NestJS services enforce ownership by joining against `ownerId === user.id`.

---

## 6. Storage / Files

Supabase Storage is partitioned into 4 distinct buckets:

| Bucket Name | Access Level | Stored Categories | Size Limit |
|---|---|---|---|
| `property-images` | Public | `PROPERTY_IMAGE` | 10 MB |
| `tenant-documents` | Private | `TENANT_PROFILE_PICTURE`, `TENANT_FRONT_NID`, `TENANT_BACK_NID`, `TENANT_DOCUMENT`, `AGREEMENT_DOCUMENT`, `PROFILE_IMAGE`, `OTHER` | 10 MB |
| `payment-receipts` | Private | `PAYMENT_RECEIPT` | 10 MB |
| `owner-signatures` | Private | `OWNER_SIGNATURE` | 2 MB |

Private buckets require backend-generated signed download URLs (`expiresInSeconds: 3600`).

---

## 7. Database Functions / Triggers

- **Functions/Triggers**: None discovered in application schema. Business logic and status propagation are executed in NestJS application transactions (`prisma.$transaction`).

---

## 8. Important Constraints

1. **Unique Idempotent Billing**: `monthly_rents` enforces `@@unique([agreementId, year, month])` preventing duplicate bills for the same month.
2. **Precision Decimals**: All financial amounts enforce `@db.Decimal(12, 2)` preventing rounding drift.
3. **Foreign Key Integrity**: Cascade deletion is enabled from `User` $\to$ `Property` $\to$ `Unit` $\to$ `RentalAgreement` $\to$ `MonthlyRent` $\to$ `Payment`.

---

## 9. Unknown / Unverified Information

- There are no active database-level triggers or stored procedures in the schema; all logic is handled at the application layer.
