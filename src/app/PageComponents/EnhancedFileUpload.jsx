'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Upload, FileText, X, ArrowUp } from 'lucide-react';
import { initiateDropboxOAuth, initiateGoogleDriveOAuth, initiateOneDriveOAuth } from '@/app/utils/cloudStorageIntegration';

/**
 * EnhancedFileUpload Component
 * 
 * A sophisticated file upload component with multiple source options matching the design:
 * - From Device (local file system)
 * - From Smallpdf (Pro feature)
 * - From Dropbox
 * - From Google Drive
 * - From OneDrive
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onFilesSelected - Callback function when files are selected
 * @param {Array} props.uploadedFiles - Array of currently uploaded files
 * @param {Function} props.onRemoveFile - Callback to remove a file
 * @param {number} props.maxFiles - Maximum number of files allowed (default: 3)
 * @param {number} props.maxSize - Maximum file size in MB (default: 5)
 * @param {Array} props.acceptedTypes - Accepted file types (default: ['image/png', 'image/jpeg', 'application/pdf'])
 * @param {string} props.label - Label for the upload section
 * @param {string} props.description - Description text
 */
export default function EnhancedFileUpload({
  onFilesSelected,
  uploadedFiles = [],
  onRemoveFile,
  maxFiles = 3,
  maxSize = 5,
  acceptedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/jpg'],
  label = 'Upload Documents',
  description = 'Upload supporting documents (PNG, JPG, PDF)'
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadSource, setUploadSource] = useState('device');
  const fileInputRef = useRef(null);

  // Upload source options matching the design
  const uploadSources = [
    { 
      id: 'device', 
      label: 'From device', 
      icon: ArrowUp,
      iconColor: 'text-gray-600'
    },
    { 
      id: 'dropbox', 
      label: 'From Dropbox', 
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#0061FF" d="M6 1.807L0 5.159l6 3.352 6-3.352L6 1.807z"/>
          <path fill="#0061FF" d="M18 1.807l-6 3.352 6 3.352 6-3.352-6-3.352z"/>
          <path fill="#0061FF" d="M0 11.863l6 3.352 6-3.352-6-3.352-6 3.352z"/>
          <path fill="#0061FF" d="M18 8.511l-6 3.352 6 3.352 6-3.352-6-3.352z"/>
          <path fill="#0061FF" d="M6 15.919l6 3.352 6-3.352-6-3.704-6 3.704z"/>
          <path fill="#0053D6" d="M12 19.271l-3.5 2.064v1.458L12 24l3.5-1.207v-1.458L12 19.271z"/>
        </svg>
      )
    },
    { 
      id: 'google_drive', 
      label: 'From Google Drive', 
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M8.1 2L2 13.5h4.5L14 2H8.1z"/>
          <path fill="#FFBA00" d="M22 13.5L15.9 2H10l6.1 11.5H22z"/>
          <path fill="#0F9D58" d="M2 13.5l3.05 5.3 9.95-17.3L10 2 2 13.5z"/>
          <path fill="#DB4437" d="M15 13.5H2l3.05 5.3h13L22 13.5H15z"/>
          <path fill="#0F9D58" d="M8.1 18.8l3.95 2.2 3.95-2.2-3.95-6.8-3.95 6.8z"/>
        </svg>
      )
    },
    { 
      id: 'onedrive', 
      label: 'From OneDrive', 
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
          <path fill="#0078D4" d="M30.5 20c-1.3-4.9-5.8-8.5-11.1-8.5-5 0-9.3 3.2-10.9 7.6C4.8 20.2 2 23.6 2 27.7 2 32.6 6.1 36.5 11 36.5h19.5c4.1 0 7.5-3.4 7.5-7.5 0-3.9-3-7.1-6.8-7.5-.1-.5-.2-1-.2-1.5z"/>
          <path fill="#0364B8" d="M30.5 20c.1.5.1 1 .2 1.5C34.5 22 37.5 25.1 37.5 29c0 4.1-3.4 7.5-7.5 7.5H11c-4.9 0-9-3.9-9-8.8 0-4.1 2.8-7.5 6.5-8.6C10.2 14.7 14.5 11.5 19.4 11.5c5.3 0 9.8 3.6 11.1 8.5z"/>
        </svg>
      )
    }
  ];

  // Handle file selection from device
  const handleDeviceFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    files.forEach(file => {
      if (acceptedTypes.includes(file.type) && file.size <= maxSizeBytes) {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  // Load Dropbox SDK
  useEffect(() => {
    // Check if Dropbox script is already loaded
    if (!document.getElementById('dropboxjs')) {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.setAttribute('data-app-key', process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || '');
      document.body.appendChild(script);
    }
  }, []);

  // Handle cloud storage file selection messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'dropbox_files_selected') {
        // Convert Dropbox files to File objects
        const files = event.data.files.map(file => ({
          name: file.name,
          size: file.bytes,
          type: file.mime_type || 'application/octet-stream',
          url: file.link,
          source: 'dropbox'
        }));
        onFilesSelected(files);
      } else if (event.data.type === 'google_drive_files_selected') {
        // Convert Google Drive files to File objects
        const files = event.data.files.map(file => ({
          name: file.name,
          size: file.sizeBytes || 0,
          type: file.mimeType || 'application/octet-stream',
          url: file.url,
          source: 'google_drive'
        }));
        onFilesSelected(files);
      } else if (event.data.type === 'onedrive_files_selected') {
        // Convert OneDrive files to File objects
        const files = event.data.files.map(file => ({
          name: file.name,
          size: file.size || 0,
          type: file.file?.mimeType || 'application/octet-stream',
          url: file.downloadUrl,
          source: 'onedrive'
        }));
        onFilesSelected(files);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onFilesSelected]);

  // Handle Dropbox file selection using Chooser (no OAuth needed)
  const handleDropboxSelect = () => {
    if (!process.env.NEXT_PUBLIC_DROPBOX_APP_KEY) {
      alert('Dropbox integration is not configured. Please add DROPBOX_APP_KEY to your environment variables.');
      setShowDropdown(false);
      return;
    }

    if (!window.Dropbox) {
      alert('Dropbox Chooser is loading. Please wait a moment and try again.');
      setShowDropdown(false);
      return;
    }

    // Use Dropbox Chooser directly without OAuth
    window.Dropbox.choose({
      success: async function(files) {
        console.log('Dropbox files selected:', files);
        
        if (!files || files.length === 0) {
          console.log('No files selected from Dropbox');
          return;
        }

        // Show loading indicator
        alert(`Downloading ${files.length} file(s) from Dropbox...`);
        
        try {
          // Download files and convert to File objects
          const filePromises = files.map(async (dropboxFile) => {
            try {
              console.log('Downloading file:', dropboxFile.name, 'from:', dropboxFile.link);
              
              // Fetch the file from the direct link
              const response = await fetch(dropboxFile.link);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const blob = await response.blob();
              console.log('Downloaded blob:', blob.size, 'bytes, type:', blob.type);
              
              // Create a File object
              const file = new File([blob], dropboxFile.name, {
                type: blob.type || 'application/octet-stream',
                lastModified: Date.now()
              });
              
              console.log('Created File object:', file.name, file.size, file.type);
              return file;
            } catch (error) {
              console.error('Error downloading file from Dropbox:', dropboxFile.name, error);
              alert(`Failed to download ${dropboxFile.name}: ${error.message}`);
              return null;
            }
          });

          // Wait for all files to download
          const downloadedFiles = await Promise.all(filePromises);
          let validFiles = downloadedFiles.filter(f => f !== null);
          
          console.log('Downloaded files:', validFiles.length);
          
          // Validate file types and sizes
          const maxSizeBytes = maxSize * 1024 * 1024;
          const rejectedFiles = [];
          
          validFiles = validFiles.filter(file => {
            // Check file type
            if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
              const extension = '.' + file.name.split('.').pop().toLowerCase();
              const typeMatch = acceptedTypes.some(type => {
                const extMap = {
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/jpg': ['.jpg', '.jpeg'],
                  'application/pdf': ['.pdf']
                };
                return extMap[type]?.includes(extension);
              });
              
              if (!typeMatch) {
                rejectedFiles.push(`${file.name} (invalid type)`);
                return false;
              }
            }
            
            // Check file size
            if (file.size > maxSizeBytes) {
              rejectedFiles.push(`${file.name} (too large: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
              return false;
            }
            
            return true;
          });
          
          console.log('Valid files after validation:', validFiles.length);
          
          if (rejectedFiles.length > 0) {
            alert(`Some files were rejected:\n${rejectedFiles.join('\n')}`);
          }
          
          if (validFiles.length > 0) {
            console.log('Calling onFilesSelected with files:', validFiles);
            onFilesSelected(validFiles);
            alert(`Successfully added ${validFiles.length} file(s) from Dropbox!`);
          } else {
            alert('No valid files to add. Please check file types and sizes.');
          }
        } catch (error) {
          console.error('Error processing Dropbox files:', error);
          alert(`Error: ${error.message}`);
        }
      },
      cancel: function() {
        console.log('Dropbox Chooser cancelled');
      },
      linkType: "direct", // Use direct links for downloading
      multiselect: true,
      // Don't filter by extensions - allow all file types for better flexibility
      // The file validation will happen after download
      // extensions: ['.pdf', '.png', '.jpg', '.jpeg'],
      folderselect: false
      // sizeLimit: maxSize * 1024 * 1024 // Size validation will happen after download
    });
    
    setShowDropdown(false);
  };

  // Handle Google Drive file selection
  const handleGoogleDriveSelect = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      alert('Google Drive integration is not configured. Please add GOOGLE_CLIENT_ID to your environment variables.');
      setShowDropdown(false);
      return;
    }

    // For now, show that Google Drive requires additional setup
    alert('Google Drive integration requires additional OAuth setup and API key configuration.\n\nSteps needed:\n1. Enable Google Picker API in Google Cloud Console\n2. Configure OAuth consent screen\n3. Add authorized JavaScript origins\n4. Get API key for Picker\n\nWould you like to proceed with OAuth flow? (This will redirect you to Google for authorization)');
    
    // Initiate OAuth flow
    initiateGoogleDriveOAuth();
    setShowDropdown(false);
  };

  // Handle OneDrive file selection
  const handleOneDriveSelect = () => {
    if (process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID) {
      initiateOneDriveOAuth();
    } else {
      alert('OneDrive integration is not configured. Please add ONEDRIVE_CLIENT_ID to your environment variables.');
    }
    setShowDropdown(false);
  };


  // Handle upload source selection
  const handleSourceSelect = (sourceId) => {
    setUploadSource(sourceId);
    
    switch(sourceId) {
      case 'device':
        fileInputRef.current?.click();
        break;
      case 'dropbox':
        handleDropboxSelect();
        break;
      case 'google_drive':
        handleGoogleDriveSelect();
        break;
      case 'onedrive':
        handleOneDriveSelect();
        break;
      default:
        break;
    }
    
    setShowDropdown(false);
  };

  return (
    <div className='mt-4'>
      <h4 className='font-semibold text-gray-700 mb-2'>
        {label}
      </h4>
      <p className='text-sm text-gray-600 mb-2'>
        {description}
      </p>
      <p className='text-xs text-gray-500 mb-3'>
        Files Upload Limit: {maxFiles} | Maximum File Size Allowed: {maxSize}MB (Of Each File)
      </p>
      
      {/* Main Upload Button - Matching the design */}
      <div className='relative inline-block'>
        <button
          type='button'
          onClick={() => setShowDropdown(!showDropdown)}
          className='bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-blue-500 transition-colors shadow-sm min-w-[200px]'
          disabled={uploadedFiles.length >= maxFiles}
        >
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 border border-gray-600 rounded flex items-center justify-center'>
              <div className='w-2 h-2 bg-gray-600 rounded-sm'></div>
            </div>
            <span className='text-sm font-medium text-gray-800'>CHOOSE FILES</span>
          </div>
          <div className='w-5 h-5 flex items-center justify-center'>
            <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu - Matching the design */}
        {showDropdown && (
          <div className='absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg'>
            {uploadSources.map((source, index) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.id}
                  type='button'
                  onClick={() => handleSourceSelect(source.id)}
                  className='w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0'
                >
                  <div className='flex items-center gap-2.5'>
                    <div className='flex items-center justify-center w-4 h-4'>
                      {typeof Icon === 'function' ? <Icon /> : <Icon className={`w-4 h-4 ${source.iconColor || 'text-gray-600'}`} />}
                    </div>
                    <span className='text-sm text-gray-800'>{source.label}</span>
                  </div>
                  {source.badge && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${source.badge.color}`}>
                      <source.badge.icon className='w-2.5 h-2.5' />
                      <span>{source.badge.text}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden file input for device upload */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleDeviceFileSelect}
        className='hidden'
        disabled={uploadedFiles.length >= maxFiles}
      />

      {/* Upload progress indicator */}
      {uploadedFiles.length > 0 && (
        <p className='text-xs text-gray-500 mt-2'>
          {uploadedFiles.length}/{maxFiles} files uploaded
        </p>
      )}

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className='mt-3'>
          <h5 className='text-sm font-medium text-gray-700 mb-2'>Uploaded Files:</h5>
          <div className='space-y-1.5'>
            {uploadedFiles.map((file, index) => (
              <div key={index} className='flex items-center justify-between p-2 bg-white rounded border border-gray-200'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-100 rounded flex items-center justify-center'>
                    <FileText className='w-3 h-3 text-blue-600' />
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-800 block truncate max-w-xs'>{file.name}</span>
                    <span className='text-xs text-gray-500'>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => onRemoveFile(index)}
                  className='text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50'
                  title='Remove file'
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

