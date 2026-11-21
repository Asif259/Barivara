# Frontend API Gaps

This document identifies genuinely missing backend APIs that a fully-featured frontend application would reasonably need for a complete user experience. 

Do NOT implement these automatically. These are suggestions for future backend iterations.

---

Feature: Password Recovery
Why frontend needs it: Users inevitably forget their passwords. The frontend needs a way to request a password reset email/OTP and submit a new password.
Suggested endpoint: `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password`
Suggested HTTP method: `POST`
Suggested request: 
```json
// forgot-password
{ "email": "user@example.com" }

// reset-password
{ "token": "xyz", "newPassword": "new" }
```
Suggested response: `200 OK` with success message.

---

Feature: File & Image Uploads
Why frontend needs it: Landlords will want to upload profile pictures, property cover images, or PDF copies of National ID (NID) cards for tenants. Currently, there is no multipart/form-data upload endpoint.
Suggested endpoint: `/api/v1/uploads/image` and `/api/v1/uploads/document`
Suggested HTTP method: `POST`
Suggested request: `multipart/form-data` containing a `file` field.
Suggested response: 
```json
{
  "success": true,
  "data": {
    "url": "https://storage.provider.com/images/1234.jpg"
  }
}
```

---

Feature: Global Search
Why frontend needs it: A top navigation search bar on the frontend that allows a landlord to instantly find a tenant, property, or unit by typing a name or phone number, without having to navigate to the specific list page first.
Suggested endpoint: `/api/v1/search`
Suggested HTTP method: `GET`
Suggested request: `?q=Kamal`
Suggested response: 
```json
{
  "properties": [...],
  "tenants": [...],
  "units": [...]
}
```

---

Feature: User Profile Update
Why frontend needs it: The current backend provides `/auth/me` to get the profile, but there is no specific endpoint to update the logged-in user's name, phone, or avatar.
Suggested endpoint: `/api/v1/users/profile`
Suggested HTTP method: `PATCH`
Suggested request:
```json
{
  "name": "Updated Name",
  "phone": "01999999999"
}
```
Suggested response: `200 OK` with updated user details.
