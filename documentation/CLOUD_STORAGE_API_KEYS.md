# Cloud Storage API Keys Configuration

This document outlines the API keys and credentials required for Dropbox and OneDrive integration in your Ginicoe application.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Dropbox API Configuration
NEXT_PUBLIC_DROPBOX_APP_KEY=your_dropbox_app_key_here
DROPBOX_APP_SECRET=your_dropbox_app_secret_here

# Google Drive API Configuration  
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OneDrive API Configuration (Microsoft Graph)
NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=your_onedrive_client_id_here
ONEDRIVE_CLIENT_SECRET=your_onedrive_client_secret_here
```

## 1. Dropbox API Setup

### Required Keys:
- **App Key** (NEXT_PUBLIC_DROPBOX_APP_KEY)
- **App Secret** (DROPBOX_APP_SECRET)

### How to Get Dropbox API Keys:

1. **Go to Dropbox Developers Console:**
   - Visit: https://www.dropbox.com/developers/apps
   - Sign in with your Dropbox account

2. **Create a New App:**
   - Click "Create app"
   - Choose "Scoped access" (recommended)
   - Choose "App folder" or "Full Dropbox" access
   - Name your app (e.g., "Ginicoe File Upload")
   - Click "Create app"

3. **Get Your Credentials:**
   - Go to the "Settings" tab
   - Find "App key" - this is your `NEXT_PUBLIC_DROPBOX_APP_KEY`
   - Find "App secret" - this is your `DROPBOX_APP_SECRET`

4. **Configure Permissions:**
   - Go to "Permissions" tab
   - Enable these scopes:
     - `files.content.write` (for uploading files)
     - `files.content.read` (for downloading files)

5. **Set Redirect URIs:**
   - Add: `http://localhost:3000/api/dropbox-oauth-callback`
   - Add your production URL: `https://yourdomain.com/api/dropbox-oauth-callback`

## 2. OneDrive API Setup (Microsoft Graph)

### Required Keys:
- **Client ID** (NEXT_PUBLIC_ONEDRIVE_CLIENT_ID)
- **Client Secret** (ONEDRIVE_CLIENT_SECRET)

### How to Get OneDrive API Keys:

1. **Go to Azure Portal:**
   - Visit: https://portal.azure.com/
   - Sign in with your Microsoft account

2. **Register an Application:**
   - Go to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name: "Ginicoe File Upload"
   - Supported account types: "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3000/api/onedrive-oauth-callback`
   - Click "Register"

3. **Get Your Credentials:**
   - Copy "Application (client) ID" - this is your `NEXT_PUBLIC_ONEDRIVE_CLIENT_ID`
   - Go to "Certificates & secrets" > "New client secret"
   - Add description and expiration
   - Copy the "Value" - this is your `ONEDRIVE_CLIENT_SECRET`

4. **Configure API Permissions:**
   - Go to "API permissions"
   - Add permission > "Microsoft Graph" > "Delegated permissions"
   - Add these permissions:
     - `Files.ReadWrite.All` (for full file access)
     - `User.Read` (for basic user info)
   - Click "Grant admin consent" (if applicable)

5. **Set Redirect URIs:**
   - Go to "Authentication"
   - Add platform > "Web"
   - Redirect URIs:
     - `http://localhost:3000/api/onedrive-oauth-callback`
     - `https://yourdomain.com/api/onedrive-oauth-callback`

## 3. Google Drive API Setup

### Required Keys:
- **Client ID** (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
- **Client Secret** (GOOGLE_CLIENT_SECRET)

### How to Get Google Drive API Keys:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create or select a project

2. **Enable Google Drive API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Ginicoe File Upload"

4. **Configure OAuth Consent Screen:**
   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information:
     - App name: "Ginicoe"
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/drive.file` (for files created by your app)
   - Add test users if in testing mode

5. **Get Your Credentials:**
   - In "Credentials" page, find your OAuth client
   - Copy "Client ID" - this is your `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Copy "Client secret" - this is your `GOOGLE_CLIENT_SECRET`

6. **Set Authorized Redirect URIs:**
   - In your OAuth client settings, add:
     - `http://localhost:3000/api/google-drive-oauth-callback`
     - `https://yourdomain.com/api/google-drive-oauth-callback`

## Security Notes

1. **Never commit your `.env.local` file to version control**
2. **Use different credentials for development and production**
3. **Regularly rotate your API keys**
4. **Monitor API usage in each service's dashboard**
5. **Set appropriate rate limits and quotas**

## Testing the Integration

Once you've added the environment variables:

1. Restart your Next.js development server
2. Go to a file upload section in your consumer form
3. Click "CHOOSE FILES" dropdown
4. Try selecting "From Dropbox", "From Google Drive", or "From OneDrive"
5. You should see OAuth popup windows for authentication

## Troubleshooting

### Common Issues:

1. **"Integration not configured" error:**
   - Check that environment variables are correctly named
   - Restart your development server after adding variables

2. **OAuth redirect errors:**
   - Ensure redirect URIs match exactly in all service consoles
   - Check that your domain is added to authorized origins

3. **Permission errors:**
   - Verify that required scopes are enabled in each service
   - Check that admin consent is granted (for OneDrive)

4. **CORS errors:**
   - Ensure your domain is added to authorized JavaScript origins
   - Check that API keys have correct restrictions

For additional help, refer to each service's official documentation:
- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation)
- [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
