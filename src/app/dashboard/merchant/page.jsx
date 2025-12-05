import React from 'react';
import PageComponents from './PageComponents';
import ReCaptchaScript from '@/app/components/ReCaptchaScript';

/**
 * Merchant New Page - Main page wrapper component
 * 
 * Purpose: Combines reCAPTCHA script loading with merchant form
 * - Loads reCAPTCHA Enterprise script first for optimal performance
 * - Renders the merchant form interface
 * - Provides comprehensive SEO metadata
 */
export default function MerchantNewPage() {
  return (
    <>
      {/* Load reCAPTCHA script before form renders */}
      <ReCaptchaScript />
      
      {/* Main merchant form component */}
      <PageComponents />
    </>
  );
}

// SEO and page metadata for better search visibility
export const metadata = {
  title: 'Merchant Application - Payment Processing Solutions',
  description: 'Apply for merchant services and payment processing solutions with Ginicoe',
  keywords: 'merchant, payment processing, POS, credit card processing, business',
  author: 'Ginicoe',
};