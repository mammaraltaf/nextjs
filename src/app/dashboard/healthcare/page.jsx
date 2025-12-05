import React from 'react';
import PageComponents from './PageComponents';
import ReCaptchaScript from '@/app/components/ReCaptchaScript';

/**
 * HealthcarePage - Main page component
 * 
 * Purpose: Combines the reCAPTCHA script loader with the form components
 * - Loads reCAPTCHA script first
 * - Renders the main form interface
 * - Provides metadata for SEO
 */
export default function HealthcarePage() {
  return (
    <>
      {/* Load reCAPTCHA script before rendering form */}
      <ReCaptchaScript />
      {/* Main form components */}
      <PageComponents />
    </>
  );
}

// SEO metadata for the page
export const metadata = {
  title: 'Contact Us - Healthcare Forms',
  description: 'Get in touch with our healthcare team for biometric protection solutions',
  keywords: 'healthcare, contact, biometric protection, medical forms',
  author: 'Ginicoe',
};
