import React from 'react';
import PageComponents from './PageComponents';
import ReCaptchaScript from '@/app/components/ReCaptchaScript';

/**
 * Education Page - Main page wrapper component
 * 
 * Purpose: Combines reCAPTCHA script loading with education form
 * - Loads reCAPTCHA script first for optimal performance
 * - Renders the education form interface
 * - Provides comprehensive SEO metadata
*/
export default function EducationPage() {
  return (
    <>
      {/* Load reCAPTCHA script before form renders */}
      <ReCaptchaScript />
      
      {/* Main education form component */}
      <PageComponents />
    </>
  );
}

// SEO and page metadata for better search visibility
export const metadata = {
  title: 'Education Contact Form - Biometric Solutions',
  description: 'Contact us for education sector biometric protection solutions and services',
  keywords: 'education, biometric, security, schools, universities, student safety',
  author: 'Ginicoe',
};