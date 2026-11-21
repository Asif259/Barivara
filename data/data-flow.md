# Data Flow

## 1. Overview

Data in BariVara moves through a decoupled client-server architecture:
- The **Next.js frontend** (`barivara-web`) renders server and client components, manages form state via React Hook Form and Zod, and issues HTTP requests via an Axios client with auto-refreshing JWT authentication.
- The **NestJS backend** (`barivara-api`) validates incoming payloads with strict class-validator DTOs, verifies ownership isolation, executes database mutations inside atomic Prisma transactions, and formats responses into standard bilingual envelopes.
- **Supabase PostgreSQL** persists relational entities, while **Supabase Storage** holds document and image binaries uploaded directly by the client using pre-signed upload URLs.

---

## 2. System-Level Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client Browser / Mobile Web"]
        UI["Next.js UI (React Hook Form + Zod)"]
        Store["Zustand Stores (auth / language)"]
        Axios["apiClient (Axios)"]
    end

    subgraph Backend ["Hostinger Managed Node.js Web App (NestJS)"]
        Guard["JwtAuthGuard & ThrottlerGuard"]
        Pipe["ValidationPipe (whitelist & forbidNonWhitelisted)"]
        Controller["NestJS Controllers"]
        Service["Domain Services (Atomic Transactions)"]
        Interceptor["TransformInterceptor & LoggingInterceptor"]
    end

    subgraph Storage ["External Cloud Infrastructure"]
        DB[("Supabase PostgreSQL (RLS Default-Deny)")]
        Buckets[("Supabase Storage Buckets (Signed URLs)")]
        Resend["Resend Email API"]
    end

    UI --> Store
    UI --> Axios
    Axios -- "HTTPS (Bearer JWT + Accept-Language)" --> Guard
    Guard --> Pipe
    Pipe --> Controller
    Controller --> Service
    Service -- "Prisma Client (TLS Pooler)" --> DB
    Service -- "Signed Upload URL Request" --> Buckets
    Service -- "HTTPS API Dispatch (OTP)" --> Resend
    DB --> Service
    Service --> Controller
    Controller --> Interceptor
    Interceptor -- "JSON Envelope {success, data, meta}" --> Axios
    Axios --> UI
    UI -- "Direct Binary PUT" --> Buckets
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Next.js Web App
    participant API as NestJS /auth
    participant DB as PostgreSQL
    participant Email as Resend Email API

    User->>Web: Enter Email/Phone & Password
    Web->>API: POST /api/v1/auth/login
    API->>DB: Query User by email or phone
    DB-->>API: Return User Record
    API->>API: Verify Password with argon2.verify()
    API->>API: Generate Access Token (15m) & Refresh Token (30d)
    API-->>Web: Return { accessToken, refreshToken, user }
    Web->>Web: Persist tokens in auth-store (localStorage)

    Note over Web,API: Auto Token Refresh on HTTP 401
    Web->>API: Request protected route with expired access token
    API-->>Web: HTTP 401 Unauthorized
    Web->>API: POST /api/v1/auth/refresh { refreshToken }
    API->>API: Verify Refresh Token signature
    API-->>Web: Return { accessToken, newRefreshToken }
    Web->>API: Retry original request with new accessToken
```

---

## 4. Create Data Flow (Example: Recording Rent Payment)

```mermaid
sequenceDiagram
    autonumber
    actor Landlord
    participant Modal as "Collect Rent" Dialog
    participant API as PaymentsController / Service
    participant DB as PostgreSQL (Prisma $transaction)

    Landlord->>Modal: Input Payment Amount, Method, Date & Note
    Modal->>Modal: Validate via Zod Schema
    Modal->>API: POST /api/v1/payments { monthlyRentId, amount, paymentMethod, ... }
    API->>API: Validate via CreatePaymentDto
    API->>DB: Start Prisma Transaction
    API->>DB: Fetch MonthlyRent & verify property.ownerId === userId
    API->>DB: Insert Payment record (status: COMPLETED)
    API->>DB: Recalculate remainingAmount = totalAmount - (paidAmount + amount)
    API->>DB: Determine new RentStatus (PAID if remaining <= 0, else PARTIAL)
    API->>DB: Update MonthlyRent (paidAmount, remainingAmount, status)
    API->>DB: Insert AuditLog record (action: PAYMENT_CREATED)
    DB-->>API: Commit Transaction
    API-->>Modal: Return { success: true, data: Payment }
    Modal->>Modal: Invalidate React Query Cache ['monthly-rents', 'payments']
    Modal->>Landlord: Display Success Toast & WhatsApp Receipt Option
```

---

## 5. Read Data Flow

1. **User requests a dashboard or list page** (e.g. `/rents`).
2. **TanStack React Query** invokes the corresponding API method in `apiClient`.
3. **Axios interceptor** attaches `Authorization: Bearer <accessToken>` and `Accept-Language: bn` (or `en`).
4. **Backend `JwtAuthGuard`** decodes the JWT and attaches `user: CurrentUserPayload` to the request.
5. **Service method executes query**:
   - Applies tenant ownership filter: `where: { agreement: { unit: { property: { ownerId: userId } } } }`.
   - Executes pagination: `skip: (page - 1) * limit, take: limit`.
   - Optionally runs lazy overdue update: `refreshOverdueStatuses(userId)`.
6. **Backend `TransformInterceptor`**:
   - Converts all Prisma `Decimal` instances into plain JSON numbers.
   - Wraps payload in `{ success: true, message: "...", data: [...], meta: { page, limit, total, totalPages } }`.
7. **Frontend updates cache and re-renders table/cards**.

---

## 6. Update Data Flow

1. User modifies an entity in an edit modal (e.g. `PATCH /rental-agreements/:id`).
2. Frontend ensures only permitted, updateable fields are transmitted.
3. Backend controller validates fields against the corresponding `Update...Dto`.
4. Service verifies resource ownership (`ownerId === userId`).
5. Updates execute inside a transaction if side effects exist (e.g. updating unit status from `VACANT` to `OCCUPIED`).
6. Updated record is returned and React Query cache is invalidated.

---

## 7. Delete Flow (Soft Deletion)

BariVara uses **soft deletion** on business entities:
1. `DELETE /api/v1/properties/:id`, `DELETE /api/v1/units/:id`, `DELETE /api/v1/tenants/:id`.
2. Backend verifies ownership.
3. Instead of running SQL `DELETE`, backend executes `prisma.<entity>.update({ where: { id }, data: { deletedAt: new Date() } })`.
4. Subsequent queries automatically filter records with `{ deletedAt: null }`.
5. Hard deletes are reserved exclusively for file metadata when objects are purged from Supabase Storage.

---

## 8. External Services Integration Flow

### Resend Email (OTP Flow)
1. User clicks "Forgot Password" on `/forgot-password`.
2. Backend generates a cryptographically secure 6-digit numeric OTP.
3. Stored in memory map (`pendingOtps`) with a 10-minute expiry.
4. Backend formats bilingual HTML email and invokes Resend HTTPS API (`resend.emails.send()`).
5. User enters OTP on `/verify-password-reset-otp` to receive a temporary reset session token.

### WhatsApp Web Direct Dispatch
1. When rent is collected, frontend invokes `generateWhatsAppReceiptMessage()` (`barivara-web/src/lib/whatsapp-receipt.ts`).
2. Formats a full Bengali rent receipt with tenant name, flat number, month/year, total rent, amount collected, remaining dues, and payment date.
3. Opens browser window with `https://wa.me/{tenantPhone}?text={encodedText}` directly dispatching the receipt to the tenant's WhatsApp without backend SMS gateway overhead.

---

## 9. File & Storage Flow (3-Step Upload Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Next.js Web App
    participant API as NestJS /files
    participant Storage as Supabase Storage

    User->>Web: Select File (Avatar, NID, Document)
    Web->>API: 1. POST /api/v1/files/upload-url { originalName, mimeType, size, category }
    API->>API: Validate MIME type & file size limit (10MB image, 2MB signature)
    API->>API: Resolve bucket ('property-images', 'tenant-documents', etc.)
    API->>Storage: Request createSignedUploadUrl(storagePath)
    Storage-->>API: Return { signedUrl, token, path }
    API->>API: Insert Media record in DB (status: PENDING)
    API-->>Web: Return { fileId, uploadUrl }

    Web->>Storage: 2. HTTP PUT uploadUrl (Direct binary upload)
    Storage-->>Web: HTTP 200 OK

    Web->>API: 3. POST /api/v1/files/{fileId}/complete
    API->>Storage: Verify objectExists(bucket, storagePath)
    Storage-->>API: Object Confirmed
    API->>API: Update Media record (status: COMPLETED)
    API-->>Web: Return { success: true, data: Media }
```

---

## 10. Realtime & Background Flow

- **No WebSocket / Realtime Subscriptions**: All state is managed request-driven via TanStack React Query polling and window focus refetching.
- **No Background Daemon Process**: Overdue status updates are lazily evaluated during read operations (`refreshOverdueStatuses`).

---

## 11. Security Boundaries

1. **Transport Layer**: All communication forced over HTTPS/TLS.
2. **Network Perimeter**: Supabase PostgreSQL connections require SSL (`sslmode=require`).
3. **Application Perimeter**:
   - `Helmet` sets standard security headers.
   - `ThrottlerGuard` applies IP-based rate limiting on sensitive authentication routes.
   - `ValidationPipe` with `forbidNonWhitelisted: true` rejects unexpected body fields.
4. **Data Layer**:
   - Row-Level Security enabled with public PostgREST disabled.
   - Strict application-level ownership verification on all operations.

---

## 12. Important Data Transformations

1. **Decimal to Number Serialization**:
   - Handled globally by `TransformInterceptor`:
     ```typescript
     DecimalUtil.transformDecimals(data)
     ```
   - Automatically traverses objects and arrays, converting Prisma `Decimal` instances to standard JSON numbers for client consumption.
2. **Date Clamping**:
   - `DateUtil.calculateDueDate(year, month, dueDay)` automatically clamps due days to the maximum valid calendar day (e.g., February 28/29).

---

## 13. Unknown / Unverified Flows

- Real-time push notifications or mobile background sync flows are not implemented in the current repository code.
