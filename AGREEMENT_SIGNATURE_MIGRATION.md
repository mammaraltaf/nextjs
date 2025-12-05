# Agreement Signature Migration to Laravel

This document describes the migration of the agreement signature functionality from Next.js (direct PostgreSQL) to Laravel backend.

## Summary

The `/api/save-agreement-signature` endpoint has been successfully migrated to use the Laravel backend instead of direct PostgreSQL connection.

## Changes Made

### 1. Next.js API Route Updated
**File:** `src/app/api/save-agreement-signature/route.js`

- **Before:** Direct PostgreSQL connection using `pg` library
- **After:** Proxy to Laravel API endpoint `/api/v1/agreement-signatures`

The Next.js route now:
- Accepts both JSON and multipart form data (for PDF uploads)
- Forwards requests to Laravel backend
- Supports both camelCase (Next.js convention) and snake_case (Laravel convention) field names

### 2. Laravel Backend Configuration
**Location:** `D:/laragon/www/ginicoe.com-nextjs-connect-forms-pricing-admin`

#### Controller
**File:** `app/Http/Controllers/Api/AgreementSignatureController.php`

Updated to support both camelCase and snake_case field names for seamless integration with Next.js.

#### Routes
**File:** `routes/api.php`

Existing routes (already configured):
- `POST /api/v1/agreement-signatures` - Save agreement signature
- `GET /api/v1/agreement-signatures/{agreementId}` - Retrieve signature by ID

### 3. Database Tables
The following tables were already created in Laravel:
- `agreement_signatures` - Main signature storage
- `consumer_agreement_signatures` - Links consumer submissions to signatures
- `merchant_agreement_signatures` - Links merchant submissions to signatures

## API Endpoints

### POST /api/save-agreement-signature

**Request (JSON):**
```json
{
  "agreementType": "consumer",
  "userName": "John Doe",
  "userId": "optional-user-id",
  "signatureData": "base64-encoded-signature",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Request (Multipart with PDF):**
```
agreementType: consumer
userName: John Doe
userId: optional-user-id
signatureData: base64-encoded-signature
agreementPdf: [File]
ipAddress: 127.0.0.1
userAgent: Mozilla/5.0...
```

**Response:**
```json
{
  "success": true,
  "message": "Agreement signature saved successfully",
  "data": {
    "signatureId": 1,
    "agreementId": "uuid-here",
    "savedAt": "2025-11-26T22:43:19.000000Z",
    "status": "signed"
  }
}
```

### GET /api/save-agreement-signature?agreementId={uuid}

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "agreement_id": "uuid-here",
    "user_id": "user-id",
    "user_name": "John Doe",
    "agreement_type": "consumer",
    "signature_data": "base64-data",
    "signature_date": "2025-11-26T22:43:19.000000Z",
    "ip_address": "127.0.0.1",
    "user_agent": "Mozilla/5.0...",
    "agreement_pdf_path": "/path/to/pdf",
    "status": "signed",
    "created_at": "2025-11-26T22:43:19.000000Z",
    "updated_at": "2025-11-26T22:43:19.000000Z"
  }
}
```

## Environment Configuration

Ensure these environment variables are set in `.env.local`:

```env
LARAVEL_API_URL=http://localhost:8000
LARAVEL_API_BASE_PATH=/api/v1
```

## Testing

A test script has been created to verify the migration:

**File:** `test-agreement-signature.mjs`

**Run test:**
```bash
node test-agreement-signature.mjs
```

**Test Results:**
- ✅ POST endpoint - Successfully saves signatures
- ✅ GET endpoint - Successfully retrieves signatures
- ✅ Field name conversion (camelCase to snake_case) working
- ✅ Response format matches expectations

## Migration Benefits

1. **Consistency:** All form submissions now go through Laravel backend
2. **Centralized Logic:** Business logic and validation in one place
3. **Easier Maintenance:** Database schema managed by Laravel migrations
4. **Better Security:** Laravel's built-in security features
5. **File Storage:** PDF agreement files stored using Laravel's storage system
6. **Audit Trail:** Consistent created_by/updated_by tracking

## Removed Dependencies

The following can be removed from Next.js `package.json` if not used elsewhere:
- `pg` (PostgreSQL client library)

## Notes

- The Next.js route maintains backward compatibility with existing frontend code
- Both camelCase and snake_case field names are supported
- Laravel server must be running on port 8000 for the integration to work
- Next.js server is currently running on port 3004 (port 3000 was in use)

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js UI)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js API   │
│   /api/save-    │
│   agreement-    │
│   signature     │
└────────┬────────┘
         │ Proxy
         ▼
┌─────────────────┐
│  Laravel API    │
│  /api/v1/       │
│  agreement-     │
│  signatures     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

## Rollback Plan

If needed, the old PostgreSQL implementation is available in git history. To rollback:

1. Revert `src/app/api/save-agreement-signature/route.js` to previous version
2. Ensure PostgreSQL connection details in `.env.local`
3. Ensure `pg` package is installed

---

**Migration Date:** November 26, 2025
**Tested By:** Claude Code
**Status:** ✅ Complete and Verified
