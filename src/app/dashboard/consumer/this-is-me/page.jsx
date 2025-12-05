import React from 'react';
import PageComponents from './PageComponents';
import ReCaptchaScript from '@/app/components/ReCaptchaScript';

/**
 * Consumer Dashboard Page
 * 
 * This is the main page for the consumer dashboard that renders all necessary components.
 * It includes the ReCaptchaScript for security and the PageComponents which contains 
 * all the dashboard functionality.
 * 
 * @returns {JSX.Element} The consumer dashboard page
 */
export default function ConsumerDashboardPage() {
  return (
    <>
      {/* ReCaptcha Script for security */}
      <ReCaptchaScript />
      
      {/* Consumer Dashboard Components */}
      <PageComponents />
    </>
  );
}

/**
 * Metadata for the consumer dashboard page
 * 
 * This metadata is used for SEO and social media sharing.
 * It provides essential information about the page to search engines and social platforms.
 */
export const metadata = {
  title: 'Ginicoe - Consumer Dashboard',
  description: 'Your Description Here',
  authors: [{ name: 'Team Ginicoe', url: 'https://ginicoe.com' }],
  creator: 'Team Ginicoe',
  openGraph: {
    title: 'Ginicoe - Consumer Dashboard',
    description: 'Ginicoe - Consumer Dashboard',
    url: 'https://ginicoe.com',
    siteName: 'Ginicoe',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ginicoe - Consumer Dashboard',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};