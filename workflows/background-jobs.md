# Background Jobs

> Audit and analysis of asynchronous processes, queues, workers, and background task processing in the BariVara codebase.

---

## Current Implementation Status

**No background jobs were found in the current implementation.**

The BariVara backend (`barivara-api`) does not use message queues (such as Bull, BullMQ, RabbitMQ, Celery, or AWS SQS), asynchronous queue workers, detached background threads, or decoupled event consumers.

All business operations, external service dispatches, and database mutations execute **synchronously** within the standard HTTP request/response lifecycle.

---

## How Asynchronous Work is Handled in Practice

The application employs specific architectural patterns to avoid running persistent background workers:

### 1. Synchronous HTTPS Email Dispatch
- **Implementation**: In `barivara-api/src/email/email.service.ts`, outgoing OTP emails are delivered by awaiting the Resend API client (`await this.resend.emails.send(...)`) directly inside the `POST /api/v1/auth/forgot-password` request handler.
- **Architectural Behavior**: The HTTP response to the client is held until the external Resend HTTPS API responds (or times out).
- **Trade-off**: Simpler architecture with zero queue infrastructure requirements; however, third-party API latency directly impacts the client's HTTP response time.
- **Evidence**: `barivara-api/src/email/email.service.ts` (lines 38-80) and `barivara-api/src/auth/auth.service.ts` (line 335).

### 2. Offloading File Processing to Direct Client Storage
- **Implementation**: Instead of accepting multipart file streams, queuing background image resizing workers, or processing PDF thumbnails on the server, the backend generates pre-signed Supabase Storage upload URLs.
- **Architectural Behavior**: The heavy binary upload occurs directly between the user's browser and Supabase Storage via HTTP `PUT`. The NestJS backend is completely bypassed during binary transfer.
- **Trade-off**: Completely eliminates the need for background file ingestion workers and server-side disk spooling.
- **Evidence**: `barivara-web/src/lib/file-upload.ts` and `barivara-api/src/files/storage/supabase-storage.service.ts`.

### 3. Inline Transactional Audit Logging
- **Implementation**: Instead of publishing audit events to an asynchronous message bus (Kafka/RabbitMQ) for deferred processing, audit logs are inserted into the PostgreSQL `audit_logs` table synchronously inside the same Prisma transaction or service method as the primary action.
- **Architectural Behavior**: Guarantees ACID consistency between business mutations (e.g., payment creation) and audit records, but increases transaction execution time slightly.
- **Evidence**: `barivara-api/src/payments/payments.service.ts` (lines 105-115) and `barivara-api/src/monthly-rents/monthly-rents.service.ts` (lines 142-152).

### 4. Client-Side WhatsApp Message Assembly
- **Implementation**: Rent receipts are not sent via a background SMS/WhatsApp queue service. Instead, a URL is formatted directly on the client with the URI scheme `https://wa.me/{phone}?text={encodedReceipt}`.
- **Architectural Behavior**: The message is dispatched through the landlord's active WhatsApp Web session upon user click, requiring zero server-side queue or webhook infrastructure.
- **Evidence**: `barivara-web/src/lib/whatsapp-receipt.ts`.

---

## Architectural Risks & Concurrency Considerations

1. **Third-Party API Dependency in Request Path**:
   - If Resend experiences latency or rate-limiting, the `forgot-password` endpoint will block until the request completes or times out.
2. **Synchronous Batch Rent Generation**:
   - `MonthlyRentsService.generate()` iterates through all active agreements for an owner in a single synchronous loop. For landlords with hundreds of units, this request could take several seconds. Introducing a background queue worker would decouple this operation if the portfolio grows significantly.
3. **Absence of Orphaned File Cleanup Workers**:
   - Incomplete uploads leave `Media` records in `PENDING` status. Because no background cleanup worker exists, these rows remain in the database unless purged manually.
