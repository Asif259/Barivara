# Scheduled Tasks & Periodic Jobs

> Audit and analysis of scheduled tasks, cron jobs, timers, and periodic automation in the BariVara codebase.

---

## Current Implementation Status

**No scheduled tasks or cron jobs were found in the current implementation.**

The BariVara backend does not import or configure `@nestjs/schedule`, `node-cron`, `setInterval`, `setTimeout`, OS-level crontab routines, cloud scheduler triggers, or GitHub Actions scheduled workflows.

---

## Conceptual Distinction

To ensure architectural clarity across future iterations:

| Concept | Definition | Status in BariVara |
|---|---|---|
| **Scheduled Task** | A time-triggered routine executed at recurring intervals (e.g. `0 0 1 * *` midnight on the 1st of every month) independent of user traffic. | **Not Found / None** |
| **Background Job** | A worker process consuming jobs from an asynchronous queue (e.g. BullMQ / Redis) outside the HTTP request/response cycle. | **Not Found / None** |
| **Normal API Request** | Synchronous execution triggered directly by an incoming client HTTP request. | **100% of Application Logic** |

---

## Alternative Pattern Used: Lazy Request-Driven Evaluation

Instead of maintaining a continuous background timer or cron scheduler (which can introduce multi-instance duplication risks or fail when cloud containers sleep), BariVara uses **Lazy Request-Driven Evaluation** for time-dependent operations.

### 1. Lazy Overdue Rent Evaluation (`refreshOverdueStatuses`)

- **Standard Expected Behavior**: A midnight cron job scans all `monthly_rents` where `status == PENDING && dueDate < today` and updates them to `OVERDUE`.
- **Actual Implementation in BariVara**:
  - Whenever a landlord queries their outstanding bills via `GET /api/v1/monthly-rents/outstanding`, the backend automatically invokes `this.refreshOverdueStatuses(userId)` before returning the response.
  - The method executes an update query targeting all bills belonging to that landlord where `dueDate < today` and `remainingAmount > 0`, updating their status to `RentStatus.OVERDUE`.
- **Trigger**: Direct HTTP request to `GET /api/v1/monthly-rents/outstanding`.
- **Trade-off**:
  - **Advantage**: Zero scheduler infrastructure overhead; zero risk of cron jobs executing simultaneously across multiple server instances.
  - **Limitation**: Rent records remain in `PENDING` status past their due date until an owner opens the dashboard or queries outstanding bills.
- **Evidence**: `barivara-api/src/monthly-rents/monthly-rents.service.ts` (lines 398 and 480-510).

### 2. Manual Monthly Rent Billing Generation

- **Standard Expected Behavior**: A recurring cron job on the 1st of every month automatically generates rent bills for all active leases.
- **Actual Implementation in BariVara**:
  - Rent generation is an intentional, user-initiated action. Landlords open the "ভাড়া তৈরি করুন" (Generate Rent) modal on `/rents` and trigger `POST /api/v1/monthly-rents/generate`.
  - The backend generates rent bills for the specified month, ensuring idempotency via the database unique constraint `@@unique([agreementId, year, month])`.
- **Trigger**: Landlord clicks "Generate Rent" button in UI.
- **Evidence**: `barivara-api/src/monthly-rents/monthly-rents.service.ts` (lines 24-180).

### 3. Tenant Reminders Lifecycle

- **Standard Expected Behavior**: A cron scheduler polls `reminders` where `scheduledAt <= now() && status == PENDING`, dispatches push/SMS/email notifications, and marks `status = SENT`.
- **Actual Implementation in BariVara**:
  - Reminders are created and saved in the database with `scheduledAt`, `type`, and `channel` fields.
  - However, **no automated scheduler exists** to poll or dispatch them in the background.
  - Reminders function as an on-demand in-app reminder list queried via `GET /api/v1/reminders`.
- **Status**: Partially Implemented (Data model and CRUD endpoints exist, but automatic scheduler dispatch is absent).
- **Evidence**: `barivara-api/src/reminders/reminders.service.ts`.

---

## Architectural Precautions for Adding Future Schedulers

If a server-side scheduler (e.g. `@nestjs/schedule`) is introduced in the future:
1. **Multi-Instance Concurrency**: On scalable hosts like Hostinger or container clusters, a standard `@Cron()` decorator without distributed locking (e.g., Redlock or database advisory locks) will execute duplicate jobs across every active server instance.
2. **Timezone Alignment**: Any cron expression must be explicitly aligned with Bangladesh Standard Time (`Asia/Dhaka`, UTC+6), matching the application's `DateUtil` conventions.
