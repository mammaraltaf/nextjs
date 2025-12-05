'use client';
import Script from 'next/script';
import React, { useState, useEffect } from 'react';

/**
 * ReCaptchaScript Component
 * 
 * Purpose: Loads Google reCAPTCHA script into the browser
 * - Uses Next.js Script component for optimal loading
 * - Handles loading states and errors
 * - Provides callbacks for parent components
 * - Only loads in client-side environment
*/
export default function ReCaptchaScript({ onLoad, onError }) {
  // Track loading state to prevent duplicate script loads
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Get site key from environment variables (public key, safe to expose)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Check if reCAPTCHA is already loaded (handles hot reload in development)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.grecaptcha) {
      setIsLoaded(true);
      // Notify that reCAPTCHA is ready
      if (typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => {
          onLoad?.(); // Notify parent that script is ready
        });
      } else {
        onLoad?.(); // Notify parent that script is ready
      }
    }
  }, [onLoad]);

  // Safety check: Don't render if site key is missing
  if (!siteKey) {
    return null;
  }

  // Called when script successfully loads
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    
    // Double-check that grecaptcha object is actually available
    if (typeof window !== 'undefined' && window.grecaptcha) {
      console.log('reCAPTCHA grecaptcha object is available');
      // Notify that reCAPTCHA is ready
      if (typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => {
          onLoad?.(); // Notify parent component
        });
      } else {
        onLoad?.(); // Notify parent component
      }
    } else {
      console.warn('reCAPTCHA script loaded but grecaptcha object not found');
    }
  };

  // Called when script fails to load
  const handleError = (e) => {
    console.error('Failed to load reCAPTCHA script:', e);
    setHasError(true);
    setIsLoaded(false);
    onError?.(e);
  };

  return (
    <>
      {/* Next.js Script component for optimal loading */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive" // Load after page becomes interactive
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Hidden debug info for development (invisible to users) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ display: 'none' }} data-recaptcha-debug>
          <span data-recaptcha-status={isLoaded ? 'loaded' : hasError ? 'error' : 'loading'} />
          <span data-recaptcha-site-key={siteKey?.substring(0, 10) + '...'} />
        </div>
      )}
    </>
  );
}