# BariVara Backend API Reference

## A. Backend Overview

* **Project Purpose:** A backend API for the BariVara rental management application, allowing landlords to manage properties, units, tenants, rental agreements, monthly rent collection, payments, expenses, and view dashboard statistics. Built with NestJS, Prisma, and PostgreSQL.
* **Base API URL (Local):** `http://localhost:3000/api/v1`
* **Base API URL (Production):** Varies depending on deployment environment (e.g., `https://api.barivara.com/api/v1`).
* **API Version/Prefix:** `api/v1`
* **Authentication Mechanism:** JWT Bearer Token (`Authorization: Bearer <token>`).
* **Content Type:** `application/json` for request/response payloads.
* **Localization:** Supports English (`en`) and Bangla (`bn`) via `Accept-Language` header. Default is Bangla.
* **Pagination Conventions:** Standard query parameters `page` and `limit`. The response includes a `meta` object with pagination details.
* **Error Handling Conventions:** Unified JSON error envelope with `success: false`, `errorCode`, and `message`.

## B. Authentication

### Register
* **Method & URL:** `POST /api/v1/auth/register`
* **Purpose:** Create a new user account (e.g., Property Owner).
* **Auth Requirement:** No
* **Request Body:**
```json
{
  "name": "Asif Chowdhury",
  "email": "user@example.com",
  "phone": "01712345678",
  "password": "StrongPassword123"
}
```
* **Successful Response:** `201 Created` with `accessToken` and user details.
* **Error Responses:** `400 Bad Request` (validation errors), `409 Conflict` (email/phone already exists).

### Login
* **Method & URL:** `POST /api/v1/auth/login`
* **Purpose:** Authenticate and obtain JWT token.
* **Auth Requirement:** No
* **Request Body:**
```json
{
  "identifier": "user@example.com", 
  "password": "StrongPassword123"
}
```
* **Successful Response:** `200 OK` with `accessToken`.
* **Error Responses:** `401 Unauthorized` (invalid credentials).

### Refresh Token
* **Method & URL:** `POST /api/v1/auth/refresh`
* **Purpose:** Obtain a new access token using a refresh token (if implemented).
* **Auth Requirement:** No
* **Request Body:**
```json
{
  "refreshToken": "<token>"
}
```
* **Successful Response:** `200 OK` with new tokens.

### Logout
* **Method & URL:** `POST /api/v1/auth/logout`
* **Purpose:** Invalidate the current token.
* **Auth Requirement:** Yes
* **Successful Response:** `200 OK`

### Current User/Profile
* **Method & URL:** `GET /api/v1/auth/me`
* **Purpose:** Retrieve the profile of the currently logged-in user.
* **Auth Requirement:** Yes
* **Successful Response:** `200 OK` with user data.

## C. User/Profile APIs

*All user-related operations are currently handled via the Auth module's `/api/v1/auth/me` endpoint. Role-based fields exist but updates are restricted to the owner role by default.*

## D. Property APIs

### Create Property
* **Method:** `POST /api/v1/properties`
* **Auth Requirement:** Yes (Bearer)
* **Request Body:** `name`, `address`, `city`, `district`, `postalCode` (opt), `description` (opt), `totalFloors`.
* **Response:** Property object.

### List Properties
* **Method:** `GET /api/v1/properties`
* **Auth Requirement:** Yes
* **Parameters:** `page`, `limit`, `search`, `sortBy`, `sortOrder`.
* **Response:** Paginated array of properties.

### Get Property Summary
* **Method:** `GET /api/v1/properties/:id/summary`
* **Purpose:** Returns the current month's financial and unit summary for the property.

### Get Property Details
* **Method:** `GET /api/v1/properties/:id`
* **Auth Requirement:** Yes

### Update Property
* **Method:** `PATCH /api/v1/properties/:id`
* **Auth Requirement:** Yes
* **Request Body:** Partial property fields.

### Delete Property
* **Method:** `DELETE /api/v1/properties/:id`
* **Auth Requirement:** Yes
* **Behavior:** Soft delete.

## E. Unit APIs

### Create Unit
* **Method:** `POST /api/v1/properties/:propertyId/units`
* **Auth Requirement:** Yes
* **Request Body:** `unitNumber`, `floor`, `unitType`, `bedrooms`, `bathrooms`, `monthlyBaseRent`, `defaultServiceFee`, `defaultParkingFee`, `defaultExtraCharge`, `status`.

### List Units
* **Method:** `GET /api/v1/properties/:propertyId/units`
* **Parameters:** `page`, `limit`, `search`, `status`, `unitType`, `floor`.

### Get Unit Details
* **Method:** `GET /api/v1/units/:id`

### Update Unit
* **Method:** `PATCH /api/v1/units/:id`
* **Request Body:** Partial unit fields.

### Delete Unit
* **Method:** `DELETE /api/v1/units/:id`

## F. Tenant APIs

### Create Tenant
* **Method:** `POST /api/v1/tenants`
* **Auth Requirement:** Yes
* **Request Body:** `name`, `phone`, `email` (opt), `nid` (opt), `permanentAddress` (opt), `emergencyContactName` (opt), `emergencyContactPhone` (opt), `occupation` (opt).

### List Tenants
* **Method:** `GET /api/v1/tenants`
* **Parameters:** `page`, `limit`, `search`, `propertyId`, `unitId`, `status`.

### Get Tenant Details & Statement
* **Method:** `GET /api/v1/tenants/:id`
* **Purpose:** Retrieves tenant profile along with their rent and payment statement.

### Update Tenant
* **Method:** `PATCH /api/v1/tenants/:id`

### Delete Tenant
* **Method:** `DELETE /api/v1/tenants/:id`

## G. Rental Agreement APIs

### Create Agreement
* **Method:** `POST /api/v1/rental-agreements`
* **Auth Requirement:** Yes
* **Request Body:** `tenantId`, `unitId`, `monthlyRent`, `serviceFee`, `parkingFee`, `extraCharge`, `dueDay`, `securityDeposit`, `startDate`, `endDate` (opt).
* **Behavior:** Sets the Unit status to `OCCUPIED`.

### List Agreements
* **Method:** `GET /api/v1/rental-agreements`
* **Parameters:** `propertyId`, `unitId`, `tenantId`, `status`.

### Get Agreement Details
* **Method:** `GET /api/v1/rental-agreements/:id`

### Update Agreement
* **Method:** `PATCH /api/v1/rental-agreements/:id`

### End Agreement
* **Method:** `POST /api/v1/rental-agreements/:id/end`
* **Purpose:** Terminates the agreement and sets the Unit status back to `VACANT`.

## H. Monthly Rent APIs

### Generate Monthly Rent (Bulk)
* **Method:** `POST /api/v1/monthly-rents/generate`
* **Purpose:** Automatically generates rent records for active agreements for a given month and year.
* **Request Body:** `year`, `month`, `propertyId` (optional).

### Create Monthly Rent (Manual)
* **Method:** `POST /api/v1/monthly-rents`
* **Request Body:** `agreementId`, `year`, `month`, `rent`, `serviceFee`, `parkingFee`, `extraCharge`, `lateFee`, `discount`.

### List Monthly Rents
* **Method:** `GET /api/v1/monthly-rents`
* **Parameters:** `year`, `month`, `status`, `propertyId`, `tenantId`, `unitId`.

### Outstanding Rent
* **Method:** `GET /api/v1/monthly-rents/outstanding`
* **Purpose:** Fetches all rents with status `PENDING`, `PARTIAL`, or `OVERDUE`.

### Get Rent Details
* **Method:** `GET /api/v1/monthly-rents/:id`

### Update Rent
* **Method:** `PATCH /api/v1/monthly-rents/:id`

### Fields Explained:
* `rent`: Base rent amount.
* `serviceFee`: Service charge.
* `parkingFee`: Parking fee.
* `extraCharge`: Additional charges.
* `lateFee`: Penalty for late payment.
* `discount`: Discount applied to the total.
* `totalAmount`: Calculation = `rent + serviceFee + parkingFee + extraCharge + lateFee - discount`.
* `paidAmount`: Total sum of all successful payments against this rent record.
* `remainingAmount`: `totalAmount - paidAmount`.
* `dueDate`: Due date for the rent, clamped to the end of the month based on agreement `dueDay`.
* `paidDate`: Date when the rent became fully paid.
* `status`: 
  * `PENDING`: Rent generated, 0 paid.
  * `PARTIAL`: Paid amount > 0 but < totalAmount.
  * `PAID`: Paid amount == totalAmount.
  * `OVERDUE`: Due date has passed and not fully paid.
  * `CANCELLED`: Rent invoice cancelled.

## I. Payment APIs

### Create Payment
* **Method:** `POST /api/v1/payments`
* **Request Body:** `monthlyRentId`, `amount`, `paymentMethod`, `transactionId` (opt), `paymentDate` (opt), `note` (opt).
* **Behavior:** 
  1. Creates a payment record.
  2. Adds `amount` to the `monthlyRent.paidAmount`.
  3. Updates `monthlyRent.remainingAmount`.
  4. Automatically transitions `monthlyRent.status` based on state logic (`PENDING` -> `PARTIAL` -> `PAID`).
  5. Sets `paidDate` if fully paid.

### Reverse Payment
* **Method:** `POST /api/v1/payments/:id/reverse`
* **Purpose:** Reverses a previously recorded payment.
* **Behavior:** 
  1. Soft-deletes or marks the payment as reversed.
  2. Deducts the `amount` from `monthlyRent.paidAmount`.
  3. Updates `remainingAmount`.
  4. Reverts `monthlyRent.status` (e.g., `PAID` back to `PARTIAL` or `PENDING`).

### List Payments
* **Method:** `GET /api/v1/payments`
* **Parameters:** `monthlyRentId`, `propertyId`, `tenantId`, `paymentMethod`, `status`.

## J. Dashboard APIs

### Get Overview
* **Method:** `GET /api/v1/dashboard/overview`
* **Parameters:** `propertyId` (opt), `year` (opt), `month` (opt).
* **Calculations:**
  * **Expected Rent:** Sum of `totalAmount` of all rents for the month.
  * **Collected Rent:** Sum of `paidAmount` of all rents for the month.
  * **Outstanding Rent:** Sum of `remainingAmount`.
  * **Occupancy Rate:** (Occupied Units / Total Units) * 100.
  * **Collection Rate:** (Collected Rent / Expected Rent) * 100.
  * **Paid Count:** Count of rents with status `PAID`.

## K. Reminder APIs

* **Create Reminder:** `POST /api/v1/reminders`
* **List Reminders:** `GET /api/v1/reminders`
* **Update Reminder:** `PATCH /api/v1/reminders/:id`
* **Mark as Sent:** `POST /api/v1/reminders/:id/send`

## L. Expense APIs

* **Create Expense:** `POST /api/v1/expenses`
* **List Expenses:** `GET /api/v1/expenses` (Parameters: `propertyId`, `category`, `dateFrom`, `dateTo`)
* **Get Details:** `GET /api/v1/expenses/:id`
* **Update Expense:** `PATCH /api/v1/expenses/:id`
* **Delete Expense:** `DELETE /api/v1/expenses/:id`

## M. Reports APIs

* **Monthly Report:** `GET /api/v1/reports/monthly` (Financial aggregate for the month)
* **Monthly Report CSV:** `GET /api/v1/reports/monthly/export`
* **Tenant Statement:** `GET /api/v1/reports/tenants/:tenantId/statement`
* **Property Financials:** `GET /api/v1/reports/properties/:propertyId/financial`

## N. File Upload APIs
*(File upload not implemented yet. Avatars and documents use external URLs or string references currently).*

## O. Shared Types and Enums

* `UserRole`: `OWNER`, `MANAGER`, `STAFF`
* `UnitType`: `APARTMENT`, `FLAT`, `ROOM`, `SHOP`, `OFFICE`, `PARKING`, `OTHER`
* `UnitStatus`: `VACANT`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE`
* `AgreementStatus`: `ACTIVE`, `COMPLETED`, `TERMINATED`
* `RentStatus`: `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`
* `PaymentMethod`: `CASH`, `BANK`, `BKASH`, `NAGAD`, `ROCKET`, `CARD`, `OTHER`
* `ExpenseCategory`: `ELECTRICITY`, `WATER`, `GAS`, `MAINTENANCE`, `REPAIR`, `SECURITY`, `CLEANING`, `SALARY`, `TAX`, `OTHER`
* `ReminderType`: `UPCOMING_DUE`, `DUE_TODAY`, `OVERDUE`, `PAYMENT_CONFIRMATION`, `CUSTOM`

## P. API Response Format

```json
{
  "success": true,
  "message": "অপারেশন সফল হয়েছে",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

## Q. Error Reference

| HTTP Status | Error Code | Meaning | Frontend Action |
| ----------- | ---------- | ------- | --------------- |
| 400 | `BAD_REQUEST` | Validation error or bad input | Show validation feedback on form |
| 401 | `UNAUTHORIZED` | Token missing or invalid | Redirect to login |
| 403 | `FORBIDDEN` | No permission for resource | Show access denied message |
| 404 | `NOT_FOUND` | Resource not found | Show 404 UI or redirect back |
| 409 | `CONFLICT` | Resource already exists (e.g. Email) | Show error toast |
| 500 | `INTERNAL_SERVER_ERROR` | Backend failure | Show generic error toast |

## R. Pagination

Query Parameters: `?page=1&limit=20`
* **Default page:** `1`
* **Default limit:** `10`
* **Sorting:** `?sortBy=createdAt&sortOrder=desc`

Response includes:
```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5
}
```

## S. Filtering and Search

* **Search (`?search=`):** Used for partial matching on names, emails, phones, and addresses. Supported on `/properties`, `/tenants`, `/units`.
* **Filtering (`?status=VACANT`):** Direct exact match filtering on specific fields. Supported across most list endpoints.

## T. Authorization Rules

* Multi-tenant architecture isolates data using `ownerId`.
* **Resource Ownership:** `User A` cannot view, edit, or delete `User B`'s properties, tenants, units, or payments. The backend strictly enforces this via global Prisma schema isolation and ownership checks in services.

## U. Frontend Integration Guide

1. **Authentication:** Call `POST /auth/login` and save the `accessToken` in local storage or cookies.
2. **Calling APIs:** Attach the token to the header: `Authorization: Bearer <token>`.
3. **Localization:** Pass `Accept-Language: en` or `bn` in your Axios/Fetch interceptor to toggle response language.
4. **401 Handling:** Add a global HTTP interceptor to catch `401 Unauthorized`. Clear the local token and redirect to `/login`.
5. **Validation Errors:** On `400` errors, check `details` in the JSON body which usually contains specific field errors mapped by class-validator.
6. **Data Display:** Always check `res.data.success`. If true, consume `res.data.data`.

## V. Complete Endpoint Index

| Module | Method | Endpoint | Auth | Purpose |
| ------ | ------ | -------- | ---- | ------- |
| Health | GET | `/api/v1/health` | No | Server health check |
| Auth | POST | `/api/v1/auth/register` | No | Register new owner |
| Auth | POST | `/api/v1/auth/login` | No | User login |
| Auth | GET | `/api/v1/auth/me` | Yes | Get current user |
| Properties | POST | `/api/v1/properties` | Yes | Create property |
| Properties | GET | `/api/v1/properties` | Yes | List properties |
| Properties | GET | `/api/v1/properties/:id/summary` | Yes | Property stats |
| Units | POST | `/api/v1/properties/:propertyId/units` | Yes | Create unit |
| Units | GET | `/api/v1/properties/:propertyId/units` | Yes | List property units |
| Tenants | POST | `/api/v1/tenants` | Yes | Create tenant |
| Tenants | GET | `/api/v1/tenants` | Yes | List tenants |
| Agreements | POST | `/api/v1/rental-agreements` | Yes | Create agreement |
| Monthly Rents| POST | `/api/v1/monthly-rents/generate`| Yes | Bulk generate rent |
| Monthly Rents| GET | `/api/v1/monthly-rents` | Yes | List rents |
| Monthly Rents| GET | `/api/v1/monthly-rents/outstanding`| Yes| List unpaid rents |
| Payments | POST | `/api/v1/payments` | Yes | Record payment |
| Payments | POST | `/api/v1/payments/:id/reverse` | Yes | Reverse payment |
| Dashboard | GET | `/api/v1/dashboard/overview` | Yes | Dashboard stats |
| Expenses | POST | `/api/v1/expenses` | Yes | Record expense |
| Reports | GET | `/api/v1/reports/monthly` | Yes | Monthly financials |
| Reports | GET | `/api/v1/reports/monthly/export` | Yes | Export CSV report |
