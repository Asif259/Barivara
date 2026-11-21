# Detailed Findings — BariVara Security Audit

---

## F-001: No JWT Token Revocation Mechanism

**Severity:** HIGH · **CWE-613** (Insufficient Session Expiration)

### Description
When a user logs out, the backend only records an audit log entry. The access and refresh tokens remain valid until their expiry. There is no token blacklist, no token version counter in the database, and no token rotation on use. Combined with the default 30-day expiry, a compromised token grants extended access.

### Source Evidence
- `barivara-api/src/auth/auth.service.ts` lines 238–255: `logout()` method writes an audit log and returns success — does not invalidate the token.
- `barivara-api/src/auth/strategies/jwt.strategy.ts` lines 21–42: `validate()` only checks user existence and `isActive` flag — no revocation check.
- `barivara-api/src/common/guards/jwt-auth.guard.ts`: The guard delegates to Passport's JWT strategy — no additional checks.
- No `tokenBlacklist` table in `schema.prisma`, no Redis dependency, no token version column on `User` model.

### Affected Flows
- **Logout:** User sees "logged out", but the token still works if replayed.
- **Password change (F-005 impact):** Old tokens remain valid after password change.
- **Account deactivation:** `isActive = false` is checked in `validate()` — this is the *only* server-side token invalidation mechanism, and it requires a DB query on every request.

### Recommended Fix
1. Add a `tokenVersion` integer column on the `User` model.
2. Include `tokenVersion` in the JWT payload.
2. In `JwtStrategy.validate()`, verify `user.tokenVersion` matches `payload.tokenVersion`.
3. Increment `tokenVersion` on logout, password change, and password reset.
4. Alternative: Use a Redis-backed token blacklist (keyed by `tokenId + jti`, checked in `validate()`.

---

## F-002: In-Memory OTP/Reset Session Store

**Severity:** HIGH · CWE-613 (Session Expiration)

### Description
Password reset OTP codes and the subsequent reset authorization tokens are stored in plain JavaScript `Map` objects inside the NestJS process. These are not persisted, not replicated, and not shared across instances.

### Source Evidence
- `barivara-api/src/auth/auth.service.ts` lines 43–44:
  ```typescript
  private readonly pendingOtps = new Map<string, PendingOtpRecord>();
  private readonly resetSessions = new Map<string, ResetSessionRecord>();
  ```
- `PendingOtpRecord` (lines 2**6-32) holds `otp`, `otp, expiresAt, `tries,`, `userId, email) — stored key on `stringifiedotp for OTP.`
- `ResetSessionRecord` (lines 2**4-38 holds `userId, `dentifier, expiresAt) — keyed on cryptographically random 64-char hex string.

### Impact in Production
- **Horizontal scaling:** Two servers behind a load balancer have separate Maps. A user gets OTP from Instance A but the OTP verification request hits Instance B — it fails.
- **Restart:** Server restart during a reset wipes all pending OTP sessions. Users must start over.
- **Memory pressure:** No TTL-based cleanup; expired entries are only cleaned on access. An attacker could spam OTP requests piling up memory.

### Recommended Fix
Replace both Maps with Redis (or your infrastructure's key-value store):
- `SET forgot_otp:{identifier} {...} EX 600` for the 4**-digit OTP.
- `SET reset_token:{resetToken} {...} EX 600` for the reset session.
- Ensure TTLs are set consistently (currently 10 minutes / 600 seconds).

---

## F-003: JWT Payload Contains PII (Email, Phone)

**Severity:** MEDIUM · CWE-200 (Information Exposure)

### Description
The JWT payload includes the user's email and phone number alongside `sub` (userId) and `role`. JWT is base**4-encoded, not encrypted — any process that sees the token can decode it and extract this data.

### Source Evidence
- `barivara-api/src/auth/auth.service.ts` line 628:
  ```typescript
  const payload = { sub: userId, role, email, phone };
  ```

### Risk
- Browser**de extensions that inspect headers can see user PII.
- Logging the `Authorization` header (accidental or intentional) captures email/phone.
- The token is sent with every request — more exposure surface than needed.

### Fix
```typescript
const payload = { sub: userId, role };
// Drop email and phone from payload
```
The `JwtStrategy.validate()` already fetches the user from the database, so these fields are not needed for downstream processing.

---

## F-004: Supabase Service Role Key — No User-Level RLS

**Severity:** MEDIUM · CWE-266 (Incorrect Privilege Assignment)

### Description
The Supabase Storage client is initialized with the **service_role_key**, which bypasses all Row-Level Security (RLS) policies in Supabase. While the API middleware validates ownership before generating URLs, the storage layer itself has no per-user isolation.

### Source Evidence
- `barivara-api/src/files/storage/supabase-storage.service.ts` lines 29**31:
  ```typescript
  this.client = createClient(url, key, {
    auth: { persistSession: false },
  });
  ```
- The key is `his.configService.get('supabase.serviceRoleKey')` — the Supabase service role key gives admin-level full access to all buckets.

### Recommended Fix

Evaluate whether to use user-scoped Supabase tokens for Storage instead of the service role key. Supabase supports authenticating as a specific user using `auth.admin.generateLink()` or `supabase.auth.signInWithPassword()` to get a user-scoped token, then using that for file operations. This would allow using Supabase's built-in RLS policies on Storage buckets.

If the service role key must be used, ensure:
- Strict network isolation (separate VPC, no public access from API server)
- Regular key rotation
- Audit logging of all admin operations in Supabase

---

## F-005: Unauthenticated Password Change via resetPasswordDirect

**Severity:** MEDIUM · CWE-620 (Unverified Password Change)

### Description
The `POST /auth/set-password-direct` endpoint allows password change using only `identifier` (email/phone) + `currentPassword` with **no JWT token required**. The endpoint is `@Public()`, meaning anyone who knows the identifier and current password can change the password.

### Source Evidence
- `barivara-api/src/auth/auth.controller.ts` lines 15**167:
  ```typescript
  @Public()
  @Post('reset-password-direct')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  ```
- No JWT authentication check. The service compares the provided password hash and updates if they match.

### Risk Scenario
An attacker who compromises both the email/phone and password (via phishing, credential stuffing, or data breach) can change the password with no second factor, no session invalidation, and no notification email.

### Fix Options
**Option A (Recommended):** Require JWT authentication by removing `@Public()`. Merge this into the `change-password` endpoint which already requires JWT. The difference is that `change-password` uses `user.id` from the JWT while `reset-password-direct` looks up the user by identifier — but since both verify current password, they're functionally duplicates.

**Option B:** Keep public but send email notification on password change and invalidate all existing sessions. Add stricter rate limiting (2/min).

---

## F-006: Hardcoded process.env Fallback for Resend API Key

**Severity:** LOW · CWE-489 (Leftover Debug Code)

### Description
The email service reads `RESEND_API_KEY` reads from `ConfigService AND `process.env as a fallback. This bypasses the environment validation schema defined in `env.validation.ts`. The same env file lists `RESEND_API_KEY` as `@IsOptional()` without `@IsNotEmpty(). No NODE_ENV` production validation.

### Source Evidence
- `barivara-api/src/email/email.service.ts`` L19**22:
  ```typescript
  const resendApiKey = this.configService.get<string>('RESEND_KEY') ||
    process.env.RESEND_API_KEY;
  ```
- `barivara-api/src/config/validation.ts` lines 107**113:
  ```typescript
  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;
  ```

### Impact
In production, If neither ConfigService (configured) nor `process.env`. has the key, the email service silently falls back to console logging — password reset OTPs are only printed to stdout. The forgot-password flow reports success to the user even though no email was sent.

### Fix
- Make `RESEND_API_KEY` required outside test environment (`@ValidateIf((o) => o.NODE_ENV !== 'test')` + `@IsNotEmpty()`).
- Remove the `process.env` fallback — use ConfigService exclusively.
- In production, throw a startup error if email is not configured to send emails.

---

## F-007: Missing Security Headers in Next.js Frontend

**Severity:** MEDIUM · CWE-1021 (Improper Restriction of Rendered UI)

### Description
The Next.js frontend has no custom security headers configured. No `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` is set.

### Source Evidence
- `barivara-web/next.config.ts` (full file):
  ```typescript
  import type { NextConfig } from "next";
  const nextConfig: NextConfig = {};
  export default nextConfig;
  ```
- No `headers()` async function is defined.

### Impact
- **No CSP:** If any user-controlled content is rendered unsafely, XSS is possible.
- **Clickjacking risk:** No `X-Frame-Options`, so the app could be embedded in an iframe.
- **No HSTS:** In production, users dont get automatic HTTPS upgrade instructions.
- **No MIME protection:** `X-Content-Type-Options` missing — browsers might MIME sniff.

### Fix
Add to `nextConfig`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' <api_url>; object-src 'none'; frame-ancestors 'none';",
        },
      ],
    },
  ];
}
```

---

## F-008: JWT Token Lifetime Defaults (30–60 Days)

**Severity:** MEDIUM · CWE-613 (Insufficient Session Expiration)

### Description
The `.env.example` template suggests very long JWT lifetimes. Combined with no token revocation (F-001), a stolen token gives access for up to 30 days.

### Source Evidence
- `barivara-api/.env.example` lines 15–16:
  ```
  JWT_ACCESS_EXPIRES_IN="30d"
  JWT_REFRESH_EXPIRES_IN="60d"
  ```
- `barivara-api/src/config/configuration.ts` line 10:
  ```typescript
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  ```
  Note: The code default is 15 minutes — a reasonable value. But the `.env.example` overrides this to 30 days. Production deployments using the example template directly get 30d tokens.

### Fix
- Update `.env.example` should suggest reasonable defaults:
  ```
  JWT_ACCESS_EXPIRES_IN="15m"
  JWT_REFRESH_EXPIRES_IN="7d"
  ```
- Consider adding a `lastPasswordChanged` timestamp and invalidating old tokens by checking `iat < lastPasswordChanged` in `JwtStrategy.validate()`.

---

## F-009: Audit Log Contains Email in Plain Text (Forgot Password)

**Severity:** LOW · CWE-532 (Information Exposure Through Log Files)

### Description
The forgot-password flow stores the user's email in audit log metadata. If the audit logs are ever exposed, an attacker can identify which users recently requested password resets.

### Source Evidence
- `barivara-api/src/auth/auth.service.ts` line 405:
  ```typescript
  metadata: { action: 'FORGOT_PASSWORD_REQUEST', email: user.email },
  ```
  Contrast with registration (line 120 which deliberately excludes PII:
  ```typescript
  metadata: { action: 'REGISTER' },
  ```

### Fix
```typescript
  metadata: { action: 'FORGOT_PASSWORD_REQUEST' },
  // drop the 'email' field
```

Or use a HMAC hash of `email and userId: `metadata: { action: 'FORGOT_PASSWORD_REQUEST', emailHash: sha256(user.email + user_secret)
```