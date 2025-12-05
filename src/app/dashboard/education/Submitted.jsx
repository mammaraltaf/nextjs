// ===== SUBMITTED/SUCCESS COMPONENT =====
// app/PageComponents/Submitted.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Submitted Component - Success page for an education form
 * 
 * Features:
 * - Thank you for a message with education-specific content
 * - Reference ID display with GUID
 * - Navigation options (dashboard, logout)
 * - Client-side rendering protection
 * - Cleanup functionality for user session
 * 
 * @param {string} guid - Unique identifier for the education form submission
 */
export default function Submitted({ guid }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatches by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * handleDashboard - Navigate back to dashboard
   */
  const handleDashboard = () => {
    router.push('/dashboard');
  };

  /**
   * handleLogout - Logout functionality with cleanup
   * 
   * This is a placeholder implementation that should be replaced
   * with your actual authentication system logout logic
   */
  const handleLogout = () => {
    // Clear stored data related to the education form
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('guid');
      localStorage.removeItem('educationFormData'); // Add other relevant data
      // Clear any other education-specific session data
    }
    
    // Placeholder alert - replace with actual logout implementation
    // In a real application, you would:
    // 1. Call your authentication logout API
    // 2. Clear authentication tokens/cookies
    // 3. Redirect to login page
    // 4. Reset any global state
    alert('Logout functionality will be implemented based on your auth system');
  };

  // Show loading during client-side hydration
  if (!isClient) {
    return (
      <div className='flex flex-col items-center justify-center p-10 bg-gray-50 h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center p-10 bg-gray-50 h-screen'>
      <div className='text-center max-w-2xl'>
        
        {/* Main Success Message */}
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">
          Thank you for contacting us!
        </h1>
        
        {/* Success Details */}
        <div className='space-y-3 text-lg mb-6'>
          <p>Your education form has been submitted successfully.</p>
          <p>One of our sales team members will reach out to you soon.</p>

          {/* Display reference ID if available */}
          {guid && (
            <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-base text-gray-700'>
                Reference ID: <span className='font-mono font-semibold text-blue-700'>{guid}</span>
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Please save this reference ID for your records
              </p>
            </div>
          )}
        </div>

        {/* Business Tagline */}
        <p className='text-lg italic text-gray-700 mb-8'>
          Biometric protection at the SPEED of a SMILE. 😊
        </p>

        {/* Action Buttons */}
        <div className='flex gap-4 justify-center'>
          <button 
            className='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
            onClick={handleDashboard}
          >
            Go to Dashboard
          </button>
          
          <button 
            className='px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors'
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}