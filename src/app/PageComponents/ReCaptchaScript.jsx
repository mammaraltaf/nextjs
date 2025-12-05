'use client';
import Script from 'next/script';
import React from 'react';

// ReCaptchaScript component to load Google reCAPTCHA script
// This script is loaded after the page is interactive to ensure it does not block rendering
// It uses the site key from environment variables for security
// Make sure to set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env file

export default function ReCaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  console.log('🔍 reCAPTCHA Site Key:', siteKey ? `${siteKey.substring(0, 10)}...` : 'NOT SET');
  
  if (!siteKey) {
    console.error('❌ NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set!');
    return null;
  }
  
  
  return (
    <Script
      src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('✅ reCAPTCHA Enterprise script loaded successfully');
        console.log('window.grecaptcha available:', !!window.grecaptcha);
        console.log('window.grecaptcha.enterprise available:', !!(window.grecaptcha && window.grecaptcha.enterprise));
      }}
      onError={(e) => {
        console.error('❌ Failed to load reCAPTCHA script:', e);
      }}
    />
  );
}
