# BariVara Frontend API Map

This document maps the backend API endpoints to the frontend features/pages that will consume them. It indicates which endpoints are required vs. optional for building specific frontend modules.

## Dashboard (Required)
The main overview page showing high-level stats and pending tasks.
├── `GET /api/v1/dashboard/overview` (Required: Stats cards)
├── `GET /api/v1/monthly-rents/outstanding` (Required: "Unpaid Rents" widget)
├── `GET /api/v1/properties` (Optional: If the dashboard filters by property)
└── `GET /api/v1/reminders` (Optional: "Upcoming tasks" widget)

## Authentication (Required)
Login and Registration flows.
├── `POST /api/v1/auth/login` (Required)
├── `POST /api/v1/auth/register` (Required)
├── `GET /api/v1/auth/me` (Required: To fetch user profile post-login)
└── `POST /api/v1/auth/logout` (Required)

## Property Management (Required)
Managing buildings and houses.
├── `GET /api/v1/properties` (Required: List view)
├── `POST /api/v1/properties` (Required: Add new property modal)
├── `GET /api/v1/properties/:id` (Required: Property details page)
├── `PATCH /api/v1/properties/:id` (Required: Edit property)
├── `DELETE /api/v1/properties/:id` (Required: Delete property)
└── `GET /api/v1/properties/:id/summary` (Optional: To show quick stats on the property detail page)

## Unit Management (Required)
Managing flats/rooms within a property. Usually nested inside Property Management.
├── `GET /api/v1/properties/:propertyId/units` (Required: List units in a property)
├── `POST /api/v1/properties/:propertyId/units` (Required: Add unit)
├── `GET /api/v1/units/:id` (Required: Unit detail/edit modal)
├── `PATCH /api/v1/units/:id` (Required: Update unit)
└── `DELETE /api/v1/units/:id` (Required: Delete unit)

## Tenant Management (Required)
Managing renters.
├── `GET /api/v1/tenants` (Required: Tenants list page)
├── `POST /api/v1/tenants` (Required: Add tenant form)
├── `GET /api/v1/tenants/:id` (Required: Tenant profile & statement)
├── `PATCH /api/v1/tenants/:id` (Required: Edit tenant)
└── `DELETE /api/v1/tenants/:id` (Required: Remove tenant)

## Rental Agreements (Required)
Assigning tenants to units.
├── `GET /api/v1/rental-agreements` (Required: Agreements list)
├── `POST /api/v1/rental-agreements` (Required: New assignment flow)
├── `GET /api/v1/rental-agreements/:id` (Required: Agreement details)
├── `PATCH /api/v1/rental-agreements/:id` (Optional: Edit terms)
└── `POST /api/v1/rental-agreements/:id/end` (Required: Move out flow)

## Rent Management (Required)
Managing invoices/bills for rent.
├── `POST /api/v1/monthly-rents/generate` (Required: Monthly bulk generation action)
├── `GET /api/v1/monthly-rents` (Required: Rent list/invoice list page)
├── `POST /api/v1/monthly-rents` (Optional: Add a manual, custom rent bill)
├── `GET /api/v1/monthly-rents/:id` (Required: Rent invoice detail view)
└── `PATCH /api/v1/monthly-rents/:id` (Optional: Edit specific charges before payment)

## Payment Management (Required)
Recording rent collection.
├── `GET /api/v1/payments` (Required: Payment history log)
├── `POST /api/v1/payments` (Required: "Collect Rent" modal)
├── `GET /api/v1/payments/:id` (Required: Payment receipt view)
└── `POST /api/v1/payments/:id/reverse` (Required: Revert a mistaken payment)

## Expenses (Optional but Recommended)
Tracking property costs.
├── `GET /api/v1/expenses` (Required if Expense module is built)
├── `POST /api/v1/expenses`
├── `PATCH /api/v1/expenses/:id`
└── `DELETE /api/v1/expenses/:id`

## Reports (Optional)
Analytics and financial summaries.
├── `GET /api/v1/reports/monthly` (Required for Reports view)
├── `GET /api/v1/reports/properties/:propertyId/financial` (Required for deep dive)
└── `GET /api/v1/reports/monthly/export` (Required for "Download CSV" button)

## Settings / System (Optional)
├── `GET /api/v1/audit-logs` (Optional: Activity log page)
└── `GET /api/v1/health` (Optional: System status indicator)
