'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Submitted Component - Success page after form submission
 * 
 * Features:
 * - Thank you message
 * - Reference ID display
 * - Navigation buttons
 * - Client-side rendering protection
 * 
 * @param {string} guid - Unique identifier for the submission
 */
export default function Submitted({ guid }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * handleDashboard - Navigate to dashboard
   */
  const handleDashboard = () => {
    router.push('/dashboard');
  };

  /**
   * handleLogout - Clear session and logout
   * 
   * Note: This is a placeholder implementation
   * Replace with your actual authentication logout logic
   */
  const handleLogout = () => {
    // Clear any stored data
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('guid');
      localStorage.removeItem('userSession'); // Add other session data as needed
      // Clear any other relevant data
    }
    
    // Placeholder for actual logout implementation
    // In a real app, you would:
    // 1. Call your authentication logout API
    // 2. Clear cookies/tokens
    // 3. Redirect to login page
    alert('Logout functionality will be implemented based on your auth system');
  };

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className='flex flex-col relative items-center justify-center p-10 bg-gray-50 h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Loading...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col relative items-center justify-center p-10 bg-gray-50 h-screen'>
      <div className='text-center max-w-2xl'>
        {/* Main success message */}
        <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">
          Thank you for contacting us!
        </h1>
        
        {/* Success details */}
        <div className='space-y-3 text-lg mb-6'>
          <p>Your healthcare form has been submitted successfully.</p>
          <p>One of our sales team members will reach out to you soon.</p>
          
          {/* Display reference ID if available */}
          {guid && (
            <p className='text-sm text-gray-600'>
              Reference ID: <span className='font-mono font-semibold'>{guid}</span>
            </p>
          )}
        </div>

        {/* Business tagline */}
        <p className='text-lg italic text-gray-700 mb-8'>
          Biometric protection at the SPEED of a SMILE. <span className='not-italic'>😊</span>
        </p>

        {/* Action buttons */}
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