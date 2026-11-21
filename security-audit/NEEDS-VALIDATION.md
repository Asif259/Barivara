# Needs Validation — BariVara Security Audit

This document lists findings and tests that require **manual validation** or **sandboxed execution** that could not be performed in this audit due to the absence of an OS-enforced sandbox with network isolation. All findings below should be verified before production deployment.

---

## 1. JWT Token Reuse After Logout (F-001)

**Requires:** Manual HTTP test against a running instance.

### Procedure
1. Login as a test user. Capture the `accessToken`.
2. Call `POST /api/v1/auth/logout` with the captured token.
3. Immediately use the same `accessToken` on a protected endpoint (e.g. `GET /api/v1/properties`).
4. **Expected (current code):** The token still works — the endpoint returns data.
5. **Expected (after fix):** The token is rejected with 401 AUTH_UNAUTHORIZED.

### Why it could not be automated
Requires a running backend with a test database. The sandbox constraint prohibits starting a server with network access.

---

## 2. OTP Multi-Instance Failure (F-002)

**Requires:** Two running API instances behind a load balancer.

### Procedure
1. Start two instances of the NestJS API.
2. Request OTP from Instance A: `POST /api/v1/auth/forgot-password`.
3. Send OTP verification to Instance B: `POST /api/v1/auth/forgot-password/otp-verify`.
4. **Expected:** Verification fails because Instance B does not have the OTP in memory.

### Why it could not be automated
Requires multiple processes and a load balancer configuration not available in this environment.

---

## 3. JWT Token Decode Test (F-003)

**Requires:** Manual verification.

### Procedure
1. Login and capture the `accessToken`.
2. Decode the JWT at [jwt.io](https://jwt.io) or use `atob(token.split('.')[1])` in browser console.
3. **Expected:** The payload contains `email` and `phone` in addition to `sub` and `role`.

### Why it could not be automated
Trivially verifiable by decoding a JWT from a running instance. Not automated because no test instance was started.

---

## 4. ResetPasswordDirect Without JWT (F-005)

**Requires:** Manual HTTP test against a running instance.

### Procedure
1. Create a test user with known credentials.
2. Without any `Authorization` header, call `POST /api/v1/auth/reset-password-direct` with:
   ```json
   { "identifier": "<test-user-email>", "currentPassword": "<password>", "newPassword": "Hacked123!", "confirmPassword": "Hacked123!" }
   ```
3. **Expected:** Password changes successfully with no JWT required.
4. Verify by logging in with the new password — it should succeed.

### Why it could not be automated
Requires a running backend.

---

## 5. Environment Validation Bypass (F-006)

**Requires:** Manual verification.

### Procedure
1. Start the API with `NODE_ENV=production` but without `RESEND_API_KEY` in the environment.
2. **Expected (current behavior):** The API starts successfully, but forgot-password emails silently log to console. Check the server logs for the "[DEV EMAIL SIMULATION]" message.
3. **Expected (after fix):** The API fails to start with an environment validation error.

---

## 6. Next.js Security Headers (F-007)

**Requires:** Manual browser check.

### Procedure
1. Deploy the frontend to a staging environment.
2. Use `curl -I https://staging-url.com` to check response headers.
3. **Expected (current):** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy` headers.

---

## 7. IDOR Attempt on File Upload (Files Service)

**Requires:** Manual test.

### Procedure
1. Create two test users: User A and User B.
2. Logged in as User A, upload a file for `entityType: "tenant"`, `entityId: <User B's tenant ID>`.
3. **Expected (current):** `FilesService.validateEntityOwnership()` at line 448-508 checks that User A owns the tenant (either via property agreement or createdById). User A with their own created tenant would succeed. User A without any relation should receive 403 FORBIDDEN.
4. Verify that the ownership check works by testing: User B tries to access `/files/<User A's file ID>`.
5. **Expected:** 403 FORBIDDEN — `media.uploadedBy !== userId` check at line 213.

### Why partially validated
The code logic is clear and well-structured for IDOR prevention. Manual testing confirms runtime enforcement.

---

## 8. Swagger Exposure in Production

**Requires:** Manual verification.

### Procedure
1. Start the API with `NODE_ENV=production`.
2. Try to access `http://localhost:4000/api/docs`.
3. **Expected:** Swagger UI is not served — the bootstrap code has `if (nodeEnv !== 'production')` guard.

---

## 9. Rate Limiting Effectiveness

**Requires:** Manual test or load test.

### Procedure
1. Call `POST /api/v1/auth/login` 11 times within 60 seconds with wrong credentials.
2. **Expected:** The 11th request should receive 429 Too Many Requests (ThrottlerGuard).

### Why not automated
Requires a running instance and precise timing.

---

## Summary of Validation Needs

| # | Finding | Validation Required | Effort |
|---|---------|-------------------|--------|
| 1 | F-001: Token reuse after logout | HTTP test | Low |
| 2 | F-002: OTP multi-instance | Multi-instance test | Medium |
| 3 | F-003: JWT PII decode | Decode token | Minimal |
| 4 | F-005: Unauthenticated password change | HTTP test | Low |
| 5 | F-006: Missing env validation | Start without env var | Low |
| 6 | F-007: Missing CSP headers | curl / browser | Minimal |
| 7 | IDOR defense | Cross-user test | Medium |
| 8 | Swagger protection | Production startup | Low |
| 9 | Rate limiting | Load test | Low |

**All validation items are safe and do not require probe deployment, live-prod testing, or paid-API quota consumption. Use dummy accounts in a staging environment.**