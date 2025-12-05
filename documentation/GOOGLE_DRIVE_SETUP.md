# Google Drive Integration Setup Guide

## Error: 403 - Access Denied

This error occurs because your Google Cloud project needs proper configuration. Follow these steps:

---

## Step 1: Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **"APIs & Services" > "Library"**
4. Search for and enable these APIs:
   - ✅ **Google Drive API**
   - ✅ **Google Picker API**

---

## Step 2: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** for User Type (unless you have a Google Workspace)
3. Fill in required information:
   - **App name**: Your app name
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**

### Add Scopes:
5. Click **"Add or Remove Scopes"**
6. Add these scopes:
   - `https://www.googleapis.com/auth/drive.file` (See and download files created by this app)
   - `https://www.googleapis.com/auth/drive.readonly` (See and download all your Google Drive files)
7. Click **"Update"** then **"Save and Continue"**

### Add Test Users (IMPORTANT for External apps):
8. Click **"Add Users"**
9. Add your email address and any other test users
10. Click **"Save and Continue"**

**Note**: External apps are limited to 100 test users until you submit for verification. For internal testing, this is sufficient.

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Select **"Web application"**
4. Configure:

### Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

### Authorized redirect URIs:
   - `http://localhost:3000/api/google-drive-oauth-callback` (for development)
   - `https://yourdomain.com/api/google-drive-oauth-callback` (for production)

5. Click **"Create"**
6. **Copy your Client ID** and **Client Secret**

---

## Step 4: Create API Key for Picker

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "API Key"**
3. Click on the newly created API key to edit it
4. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Google Drive API"** and **"Google Picker API"**
5. Under **"Application restrictions"** (optional but recommended):
   - Select **"HTTP referrers (web sites)"**
   - Add: `http://localhost:3000/*` and your production domain
6. Click **"Save"**
7. **Copy your API Key**

---

## Step 5: Update Environment Variables

Add these to your `.env.local` file:

```bash
# Google Drive OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Google Picker API Key
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

---

## Step 6: Verify Configuration

### Checklist:
- ✅ Google Drive API enabled
- ✅ Google Picker API enabled
- ✅ OAuth consent screen configured
- ✅ Test users added (your email)
- ✅ OAuth 2.0 credentials created
- ✅ Authorized JavaScript origins include `http://localhost:3000`
- ✅ Authorized redirect URIs include `http://localhost:3000/api/google-drive-oauth-callback`
- ✅ API Key created and restricted
- ✅ Environment variables set

---

## Common Issues

### 403 Error - "You do not have access to this page"

**Cause**: Your email is not added as a test user

**Solution**: Go to "OAuth consent screen" > "Test users" > Add your email address

---

### "Access blocked: This app's request is invalid"

**Cause**: OAuth scopes mismatch or redirect URI not configured

**Solution**: 
1. Check that redirect URI matches exactly
2. Verify scopes in OAuth consent screen match your code
3. Wait a few minutes after making changes (Google can take time to propagate)

---

### "The OAuth client was not found"

**Cause**: Client ID is incorrect or not set

**Solution**: Double-check your `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`

---

## For Production

Before going to production:

1. **Submit for Verification**:
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification if you need more than 100 users

2. **Update URLs**:
   - Add production domain to authorized JavaScript origins
   - Add production redirect URI
   - Update environment variables in production

3. **Security**:
   - Never expose your Client Secret on the client side
   - Use environment variables for all sensitive data
   - Restrict API key to your domains

---

## Testing

After configuration:

1. Restart your development server
2. Click "From Google Drive" in your app
3. You should see Google's authorization page
4. Sign in with a test user email
5. Grant permissions
6. You should be redirected back to your app

If you still see a 403 error, verify that:
- You're logged in with a test user email
- The test user is added in OAuth consent screen
- All APIs are enabled
- You've waited a few minutes after making changes

