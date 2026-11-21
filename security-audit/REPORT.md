# BariVara Security Audit — Final Report

**Audit ID:** run-001  
**Target:** BariVara (বাড়িভাড়া) — Property & Rental Management Platform  
**Date:** 2025-07-16  
**Scope:** Full-stack audit (barivara-api NestJS backend, barivara-web Next.js frontend)  
**Methodology:** Source-code review (sandboxed execution not available — see NEEDS-VALIDATION.md for manual test plans)  
**Reviewer:** Clixad (security-audit skill)

---

## Executive Summary

**3 HIGH, 3 MEDIUM, 2 LOW** findings were identified.

The application demonstrates **strong security fundamentals** for a small-team project:

- Argon2 password hashing (memory-hard, resistant to GPU cracking)
- Proper validation pipe with `whitelist` + `forbidNonWhitelisted` (mass-assignment protection)
- Structured error codes with locale-aware messages (no stack traces leaked to clients)
- Helmet security headers on the API server
- Global rate limiting (120 req/min base, tighter per-auth-endpoint limits)
- UUID-based entity IDs (no enumerable integers)
- Ownership checks on all CRUD operations (IDOR protection)
- Soft-delete pattern throughout
- Audit logging of auth events
- Generic forgot-password response (anti-enumeration)

The three **HIGH** findings revolve around a single theme: **session security**. The app has no token revocation mechanism, uses in-memory state that doesn't scale, and has long-lived tokens. These are the most impactful risks.

---

## Finding Summary

| ID | Title | Severity | Category |
|----|-------|----------|----------|
| F-001 | No JWT Token Revocation Mechanism | **HIGH** | Authentication |
| F-002 | In-Memory OTP/Reset Session Store | **HIGH** | Auth / Availability |
| F-003 | JWT Payload Contains PII (Email, Phone) | MEDIUM | Privacy |
| F-004 | Supabase Service Role Key — No Per-User RLS | MEDIUM | Access Control |
| F-005 | Unauthenticated ResetPasswordDirect Endpoint | MEDIUM | Authentication |
| F-006 | Hardcoded process.env Fallback for Resend API Key | LOW | Configuration |
| F-007 | Missing Security Headers in Next.js Frontend | MEDIUM | Frontend Security |
| F-008 | JWT Token Lifetime Defaults (30–60 Days) | MEDIUM | Authentication |
| F-009 | Audit Log Contains Email in Plain Text (Forgot Password) | LOW | Privacy |

---

## Noteworthy Strengths

1. **Argon2 hashing** — Current best practice for password storage.
2. **IDOR protection** — Every entity operation checks `ownerId`/`createdById` matching. Files check `uploadedBy` on all operations.
3. **Structured error handling** — `HttpExceptionFilter` never leaks Prisma error codes, connection strings, or stack traces to clients. Explicitly tested (see filter spec).
4. **Rate limiting** — Per-endpoint throttles on auth paths (register: 10/min, forgot-password: 5/min etc.).
5. **Anti-enumeration** — Forgot-password returns generic success regardless of whether the user exists.
6. **Soft delete** — All resources use `deletedAt` pattern; no hard deletes.
7. **UUID primary keys** — No sequential IDs that could be enumerated.
8. **File ownership validation** — Before generating an upload URL, the service validates entity ownership to prevent IDOR in storage paths.
9. **Swagger disabled in production** — API documentation is not accessible when NODE_ENV=production.
10. **ValidationPipe** — `forbidNonWhitelisted` prevents unexpected fields from being accepted.

---

## Deployment Considerations

Before production deployment, address:
- **JWT expiry reduction** — 30-day access tokens create an unacceptable exposure window
- **OTP state** — In-memory Maps break with multiple instances; use Redis
- **Frontend CSP** — Add Content-Security-Policy to protect against XSS
- **Secrets** — Ensure RESEND_API_KEY and SUPABASE_SERVICE_ROLE_KEY are injected via environment, not hardcoded

---

## Fix Roadmap (Recommended Order)

1. **Reduce JWT lifetimes** (F-008) — 5min access / 7d refresh. Low effort, high impact.
2. **Add JWT blacklist** (F-001) — Redis-backed token invalidation during logout. Medium effort.
3. **Move OTP state to Redis** (F-002) — Enables horizontal scaling. Medium effort.
4. **Require JWT for resetPasswordDirect** (F-005) — Or add rate limiting + notification. Low effort.
5. **Remove PII from JWT payload** (F-003) — Low effort, immediate privacy improvement.
6. **Configure CSP + security headers on frontend** (F-007) — Low effort.
7. **Audit-log PII cleanup** (F-009) — Remove email from metadata. Low effort.
7. **Add CSP + security headers** (F-007) — Add Content-Security-Policy to frontend. Low effort.
6. **Consistent secret loading** (F-006) — Use ConfigService exclusively. Low effort.
7. **Supabase RLS** (F-004) — Consider user-level RLS. Higher effort, evaluate.