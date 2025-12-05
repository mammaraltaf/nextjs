import React from 'react';
import PageComponents from './PageComponents';
import ReCaptchaScript from '@/app/components/ReCaptchaScript';

/**
 * Government Page - Main page component
 * 
 * Purpose: Combines reCAPTCHA script loading with government form
 * - Loads reCAPTCHA Enterprise script first
 * - Renders the government form interface
 * - Provides SEO metadata
 */
export default function GovernmentPage() {
  return (
    <>
      {/* Load reCAPTCHA script before form renders */}
      <ReCaptchaScript />
      
      {/* Main government form component */}
      <PageComponents />
    </>
  );
}

// SEO and page metadata
export const metadata = {
  title: 'Government Application - Biometric Solutions',
  description: 'Government agency application for Ginicoe biometric protection solutions and services',
  keywords: 'government, biometric, security, federal, state, local, agencies',
  author: 'Ginicoe',
};
