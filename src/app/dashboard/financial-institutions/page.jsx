import React from 'react'
import PageComponents from './PageComponents'
import ReCaptchaScript from '@/app/components/ReCaptchaScript'
// This is the main page component for the financial institutions dashboard.
// It includes the ReCaptcha script and the main page components.
export default function page() {
  return (
    <>
          <ReCaptchaScript />
          <PageComponents />
    </>
  )
}
export const metadata = {
  title: 'Dashboard - FI Forms',
  description: 'Financial institutions services and solutions',
  author: 'Your Name',
  // Add any other metadata properties you need
}