# Cloud Storage Integration Setup Guide

This guide will walk you through setting up cloud storage integrations (Dropbox, Google Drive, OneDrive) for file uploads in your application.

## Table of Contents
1. [Dropbox Integration](#dropbox-integration)
2. [Google Drive Integration](#google-drive-integration)
3. [OneDrive Integration](#onedrive-integration)
4. [Implementation](#implementation)

---

## Dropbox Integration

### Step 1: Create a Dropbox App
1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose "Scoped access"
4. Choose "Full Dropbox" or "App folder" based on your needs
5. Give your app a name
6. Click "Create app"

### Step 2: Get Your App Key
1. In your app's settings page, find the "App key"
2. Copy the App key

### Step 3: Configure Chooser Settings
1. In the app settings, scroll to "Chooser / Saver / Embedder domains"
2. Add your domain (e.g., `localhost` for development, `yourdomain.com` for production)

### Step 4: Add to Environment Variables
Add the following to your `.env.local` file:
```
NEXT_PUBLIC_DROPBOX_APP_KEY=your_app_key_here
```

### Step 5: Add Dropbox Script to Layout
Add this script tag to your `src/app/layout.jsx`:
```jsx
<script 
  src="https://www.dropbox.com/static/api/2/dropins.js" 
  id="dropboxjs" 
  data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}
/>
```

---

## Google Drive Integration

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Give your project a name and click "Create"

### Step 2: Enable Required APIs
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for and enable:
   - **Google Drive API**
   - **Google Picker API**

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in application name and support email
   - Add scopes: `https://www.googleapis.com/auth/drive.readonly`
4. Create OAuth client ID:
   - Application type: "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Add authorized redirect URIs (same as above)
5. Copy the Client ID

### Step 4: Create API Key
1. In "Credentials", click "Create Credentials" → "API Key"
2. Copy the API key
3. (Optional) Restrict the key to Google Drive API and Google Picker API

### Step 5: Add to Environment Variables
Add the following to your `.env.local` file:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_APP_ID=your_project_number_here
```

Note: Project number can be found in the project settings.

### Step 6: Add Google Scripts to Layout
Add these script tags to your `src/app/layout.jsx`:
```jsx
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## OneDrive Integration

### Step 1: Register Your Application
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in the details:
   - Name: Your app name
   - Supported account types: Choose appropriate option
   - Redirect URI: Add your domain (e.g., `http://localhost:3000` for development)
5. Click "Register"

### Step 2: Configure API Permissions
1. In your app's page, go to "API permissions"
2. Click "Add a permission"
3. Choose "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Files.Read`
   - `Files.Read.All` (if you need access to all files)
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin rights)

### Step 3: Get Application ID
1. In your app's "Overview" page
2. Copy the "Application (client) ID"

### Step 4: Add to Environment Variables
Add the following to your `.env.local` file:
```
NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=your_client_id_here
```

### Step 5: Add OneDrive Script to Layout
Add this script tag to your `src/app/layout.jsx`:
```jsx
<script src="https://js.live.net/v7.2/OneDrive.js"></script>
```

---

## Implementation

### Using the EnhancedFileUpload Component

```jsx
import EnhancedFileUpload from '@/app/PageComponents/EnhancedFileUpload';

function MyForm() {
  const [files, setFiles] = useState([]);

  const handleFilesSelected = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <EnhancedFileUpload
      onFilesSelected={handleFilesSelected}
      uploadedFiles={files}
      onRemoveFile={handleRemoveFile}
      maxFiles={8}
      maxSize={5}
      acceptedTypes={['image/png', 'image/jpeg', 'application/pdf']}
      label="Upload Documents"
      description="Upload supporting documents"
    />
  );
}
```

### Updating Your Layout.jsx

Add all the required scripts to your main layout file:

```jsx
// src/app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Dropbox */}
        <script 
          src="https://www.dropbox.com/static/api/2/dropins.js" 
          id="dropboxjs" 
          data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}
        />
        
        {/* Google Drive */}
        <script src="https://apis.google.com/js/api.js"></script>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        
        {/* OneDrive */}
        <script src="https://js.live.net/v7.2/OneDrive.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Testing

1. **Test Dropbox**: 
   - Click "From Dropbox" in the file upload dropdown
   - A Dropbox file picker should appear
   - Select files and they should be added to your upload list

2. **Test Google Drive**:
   - Click "From Google Drive" in the file upload dropdown
   - Google sign-in should appear (if not already signed in)
   - Google Drive picker should appear
   - Select files and they should be added to your upload list

3. **Test OneDrive**:
   - Click "From OneDrive" in the file upload dropdown
   - Microsoft sign-in should appear (if not already signed in)
   - OneDrive picker should appear
   - Select files and they should be added to your upload list

---

## Security Considerations

1. **Never commit API keys** to version control
2. Use `.env.local` for local development (already in `.gitignore`)
3. Use environment variables in production deployment
4. Restrict API keys to specific domains in production
5. Regularly rotate API keys
6. Enable only necessary API permissions
7. Monitor API usage in respective consoles

---

## Troubleshooting

### Dropbox Issues
- **"Dropbox SDK not loaded"**: Ensure the script tag is in your layout and the page has reloaded
- **Domain not allowed**: Add your domain to Chooser domains in Dropbox app settings

### Google Drive Issues
- **"Google API not loaded"**: Check if scripts are loaded correctly
- **OAuth errors**: Verify redirect URIs match exactly in Google Cloud Console
- **Permission errors**: Ensure Google Drive API and Google Picker API are enabled

### OneDrive Issues
- **"OneDrive SDK not loaded"**: Ensure the script tag is in your layout
- **Authentication errors**: Verify client ID is correct and redirect URI matches
- **Permission denied**: Grant admin consent for API permissions

---

## Support

For issues with:
- **Dropbox**: [Dropbox Developer Support](https://www.dropbox.com/developers/support)
- **Google Drive**: [Google Cloud Support](https://cloud.google.com/support)
- **OneDrive**: [Microsoft Developer Support](https://developer.microsoft.com/en-us/support)

For implementation issues, please refer to the code comments in `src/app/utils/cloudStorageIntegration.js` and `src/app/PageComponents/EnhancedFileUpload.jsx`.

