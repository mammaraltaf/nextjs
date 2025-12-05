// src/app/utils/cloudStorageIntegration.js

/**
 * Dropbox API integration for file uploads.
 * Requires Dropbox App Key and App Secret from environment variables.
 * @param {File} file - The file to upload.
 * @param {string} accessToken - User's Dropbox access token.
 * @returns {Promise<Object>} - A promise that resolves with upload details or rejects with an error.
 */
export async function uploadToDropbox(file, accessToken) {
  try {
    console.log(`Uploading ${file.name} to Dropbox...`);
    
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/ginicoe_uploads/${Date.now()}_${file.name}`,
          mode: 'add',
          autorename: true,
          mute: false
        })
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`Dropbox upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      service: 'Dropbox',
      fileName: file.name,
      filePath: result.path_display,
      size: file.size,
      dropboxId: result.id
    };
  } catch (error) {
    console.error('Dropbox upload error:', error);
    throw error;
  }
}

/**
 * Google Drive API integration.
 * Requires Google Client ID and Client Secret from environment variables.
 * @param {File} file - The file to upload.
 * @param {string} accessToken - User's Google Drive access token.
 * @returns {Promise<Object>} - A promise that resolves with upload details or rejects with an error.
 */
export async function uploadToGoogleDrive(file, accessToken) {
  try {
    console.log(`Uploading ${file.name} to Google Drive...`);
    
    // Create metadata for the file
    const metadata = {
      name: `${Date.now()}_${file.name}`,
      parents: ['appDataFolder'] // Upload to app-specific folder
    };

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Google Drive upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      service: 'Google Drive',
      fileName: file.name,
      filePath: `https://drive.google.com/file/d/${result.id}/view`,
      size: file.size,
      googleDriveId: result.id
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw error;
  }
}

/**
 * OneDrive API integration using Microsoft Graph API.
 * Requires OneDrive Client ID and Client Secret from environment variables.
 * @param {File} file - The file to upload.
 * @param {string} accessToken - User's OneDrive access token.
 * @returns {Promise<Object>} - A promise that resolves with upload details or rejects with an error.
 */
export async function uploadToOneDrive(file, accessToken) {
  try {
    console.log(`Uploading ${file.name} to OneDrive...`);
    
    // Create a folder for ginicoe uploads if it doesn't exist
    const folderName = 'ginicoe_uploads';
    const fileName = `${Date.now()}_${file.name}`;
    
    // Upload to OneDrive using Microsoft Graph API
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}/${fileName}:/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type
      },
      body: file
    });

    if (!response.ok) {
      throw new Error(`OneDrive upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      service: 'OneDrive',
      fileName: file.name,
      filePath: result.webUrl,
      size: file.size,
      oneDriveId: result.id
    };
  } catch (error) {
    console.error('OneDrive upload error:', error);
    throw error;
  }
}

// OAuth initiation functions
export function initiateDropboxOAuth() {
  const clientId = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/dropbox-oauth-callback`);
  const state = Math.random().toString(36).substring(7); // CSRF protection
  
  // Redirect to Dropbox authorization page
  const dropboxAuthUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&token_access_type=offline`;
  
  // Redirect to Dropbox (not popup)
  window.location.href = dropboxAuthUrl;
}

export function initiateGoogleDriveOAuth() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/google-drive-oauth-callback`);
  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
  const state = Math.random().toString(36).substring(7); // CSRF protection
  
  // Redirect to Google authorization page
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&state=${state}`;
  
  // Redirect to Google (not popup)
  window.location.href = googleAuthUrl;
}

export function initiateOneDriveOAuth() {
  const clientId = process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/onedrive-oauth-callback`);
  const scope = encodeURIComponent('files.readwrite');
  const state = Math.random().toString(36).substring(7); // CSRF protection
  
  // Redirect to Microsoft authorization page
  const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&response_mode=query&state=${state}`;
  
  // Redirect to Microsoft (not popup)
  window.location.href = microsoftAuthUrl;
}