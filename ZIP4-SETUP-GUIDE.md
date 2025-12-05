# ZIP+4 Code Setup Guide

## Current Status

The address autocomplete system is working with **Smarty Autocomplete API** for address suggestions. However, **ZIP+4 codes are not currently available** because they require additional API access.

### What's Working Now
- ✅ Address autocomplete using Smarty Autocomplete Pro API
- ✅ 5-digit ZIP code lookup
- ✅ Address verification and validation
- ❌ ZIP+4 (9-digit) postal codes - **REQUIRES ADDITIONAL API ACCESS**

---

## How to Get ZIP+4 Codes

You have **THREE OPTIONS** to enable ZIP+4 functionality:

### Option 1: HERE Geocoding API (Recommended if client provides key)

**You mentioned the client says "Here.com provides the key for zip +4"**

1. Get the HERE API key from your client
2. Add it to `.env.local`:
   ```
   NEXT_PUBLIC_HERE_GEO_CODE_API_KEY=your_here_api_key_here
   ```
3. Restart your Next.js development server
4. ZIP+4 codes will automatically work!

**Links:**
- HERE Developer Portal: https://developer.here.com/
- HERE Geocoding API Docs: https://developer.here.com/documentation/geocoding-search-api/dev_guide/index.html

---

### Option 2: Smarty US Street API (Paid - Most Accurate)

Your existing Smarty credentials (`SMARTY_AUTH_ID` and `SMARTY_AUTH_TOKEN`) are for **Autocomplete API only**. To get ZIP+4, you need the **US Street API** subscription.

1. **Upgrade your Smarty subscription** at https://www.smarty.com/pricing
   - Add the "US Street Address Verification" API
2. Once upgraded, your existing credentials should work with both APIs
3. Add new credentials to `.env.local` (if different):
   ```
   SMARTY_STREET_AUTH_ID=your_auth_id
   SMARTY_STREET_AUTH_TOKEN=your_auth_token
   ```
4. Restart your Next.js server

**Cost:** Starting at $89/month for 3,000 lookups

**Links:**
- Smarty Pricing: https://www.smarty.com/pricing
- US Street API Docs: https://www.smarty.com/docs/cloud/us-street-api

---

### Option 3: USPS Address API (Free for USPS Shipping)

The USPS provides free ZIP+4 lookup, but **only for facilitating USPS shipping transactions**.

1. **Register** at https://developers.usps.com/
2. Create an application to get OAuth credentials
3. Add credentials to `.env.local`:
   ```
   USPS_CLIENT_ID=your_client_id
   USPS_CLIENT_SECRET=your_client_secret
   ```
4. **Update the API route** `src/app/api/smarty-verify/route.js` to implement USPS OAuth flow (requires additional code - see USPS docs)

**Important:** USPS API requires OAuth 2.0 authentication flow, which is more complex to implement.

**Links:**
- USPS Developer Portal: https://developers.usps.com/
- Addresses 3.0 API: https://developers.usps.com/addressesv3
- GitHub Examples: https://github.com/USPS/api-examples

---

## How It Works Currently

### Without ZIP+4 API:
```
User types address → Smarty Autocomplete → Returns: "18055" (5-digit)
```

### With ZIP+4 API (once configured):
```
User types address → Smarty Autocomplete → User selects → ZIP+4 Verification API → Returns: "18055-1234" (9-digit)
```

---

## Testing the Address

Test with: **1241 1/2 1st Ave, Hellertown, PA 18055**

### Current behavior (without ZIP+4 API):
- Shows: `1241 1/2 1st Ave, Hellertown, PA 18055`

### Expected behavior (with ZIP+4 API):
- Shows: `1241 1/2 1st Ave, Hellertown, PA 18055-XXXX` (where XXXX is the +4 code)

---

## Implementation Files

The solution has been implemented in these files:

1. **API Route**: `src/app/api/smarty-verify/route.js`
   - Checks for HERE API key first
   - Falls back to Smarty Street API
   - Returns 5-digit ZIP if no API configured

2. **Component**: `src/app/PageComponents/HereGeoLocationComponent.js`
   - Calls verification API after address selection
   - Updates form with ZIP+4 code if available
   - Gracefully falls back to 5-digit ZIP

---

## Next Steps

**ACTION REQUIRED:**

1. **Contact your client** about the HERE API key they mentioned
2. Once you have the key, add it to `.env.local` as shown above
3. Test the address autocomplete to verify ZIP+4 is working

**Alternative:** If the client doesn't provide the HERE key, choose Option 2 (Smarty - paid) or Option 3 (USPS - free but more complex).

---

## Questions?

If you need help implementing any of these options, let me know which API you'd like to use!

---

## References

- [Smarty ZIP+4 Documentation](https://www.smarty.com/articles/zip-4-code)
- [US Street Address API Docs](https://www.smarty.com/docs/cloud/us-street-api)
- [USPS Developer Portal](https://developers.usps.com/)
- [HERE Geocoding API](https://developer.here.com/documentation/geocoding-search-api)
