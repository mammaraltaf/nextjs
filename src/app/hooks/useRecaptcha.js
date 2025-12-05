'use client';
import { useCallback, useEffect, useState } from 'react';

/**
 * useRecaptcha Hook
 * 
 * Purpose: Provides a clean interface for reCAPTCHA v3 operations (simple implementation)
 * 
 * Features:
 * - Executes invisible reCAPTCHA challenges
 * - Manages loading and error states
 * - Handles timeouts to prevent hanging
 * - Waits for script to be ready before execution
 * - Returns risk scores (0.0 = bot, 1.0 = human)
 * 
 * Why use a hook?
 * - Encapsulates complex reCAPTCHA logic
 * - Provides consistent interface across components
 * - Handles edge cases and error states
 * - Prevents code duplication
 */
export function useRecaptcha() {
  // State to track reCAPTCHA status
  const [state, setState] = useState({
    isReady: false,    // Whether reCAPTCHA script is loaded and ready
    isLoading: false,  // Whether a reCAPTCHA execution is in progress
    error: null,       // Any error messages from failed executions
  });

  // Auto-detect when reCAPTCHA is ready
  useEffect(() => {
    const checkRecaptcha = () => {
      if (typeof window !== 'undefined' && 
          window.grecaptcha && 
          typeof window.grecaptcha.ready === 'function') {
        setState(prev => ({ ...prev, isReady: true }));
      }
    };

    // Check immediately
    checkRecaptcha();

    // Check periodically
    const interval = setInterval(checkRecaptcha, 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * executeRecaptcha - Main function to get reCAPTCHA token
   * 
   * @param {string} action - Action name (e.g., 'login', 'signup', 'healthcare_form')
   * @returns {Promise<string|null>} - reCAPTCHA token or null if failed
   * 
   * Flow:
   * 1. Check if we're on client-side
   * 2. Set loading state
   * 3. Wait for reCAPTCHA to be ready (with timeout)
   * 4. Execute reCAPTCHA with specified action
   * 5. Return token for backend verification
   */
  const executeRecaptcha = useCallback(async (action) => {
    // Safety check: reCAPTCHA only works on client-side
    if (typeof window === 'undefined') {
      console.error('reCAPTCHA can only be executed on client side');
      return null;
    }

    // Set loading state and clear any previous errors
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Wait for reCAPTCHA to be ready with a 10-second timeout
      const token = await new Promise((resolve, reject) => {
        // Timeout prevents infinite waiting if reCAPTCHA fails to load
        const timeout = setTimeout(() => {
          reject(new Error('reCAPTCHA timeout'));
        }, 10000);

        // Check if reCAPTCHA script is loaded
        if (!window.grecaptcha) {
          clearTimeout(timeout);
          reject(new Error('reCAPTCHA not loaded'));
          return;
        }

        // Wait for reCAPTCHA to be fully ready
        window.grecaptcha.ready(() => {
          clearTimeout(timeout); // Cancel timeout since we're ready
          
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
          
          // Execute reCAPTCHA (invisible to user)
          // This analyzes user behavior and returns a token
          window.grecaptcha
            .execute(siteKey, { action }) // Action helps Google understand context
            .then(resolve)  // Success: return token
            .catch(reject); // Failure: throw error
        });
      });

      // Update state to indicate success
      setState(prev => ({ ...prev, isReady: true, isLoading: false }));
      return token; // Return token for backend verification

    } catch (error) {
      // Handle any errors during execution
      const errorMessage = error instanceof Error ? error.message : 'reCAPTCHA execution failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error('reCAPTCHA execution failed:', error);
      return null; // Return null to indicate failure
    }
  }, []); // Empty dependency array - function doesn't depend on props/state

  /**
   * waitForRecaptcha - Helper function to wait for reCAPTCHA to be ready
   * 
   * @returns {Promise<boolean>} - True when reCAPTCHA is ready
   * 
   * This is useful when you need to ensure reCAPTCHA is loaded before
   * attempting other operations. Checks every 100ms until ready.
   */
  const waitForRecaptcha = useCallback(() => {
    return new Promise((resolve) => {
      const checkRecaptcha = () => {
        
        // Check if all required reCAPTCHA components are available
        if (typeof window !== 'undefined' && 
            window.grecaptcha && 
            typeof window.grecaptcha.ready === 'function') {
          
          console.log('✅ reCAPTCHA is ready!');
          setState(prev => ({ ...prev, isReady: true }));
          resolve(true); // reCAPTCHA is ready
        } else {
          // Not ready yet, check again in 100ms
          setTimeout(checkRecaptcha, 100);
        }
      };
      checkRecaptcha(); // Start checking
    });
  }, []);

  // Return hook interface
  return { 
    executeRecaptcha,  // Function to execute reCAPTCHA
    waitForRecaptcha,  // Function to wait for reCAPTCHA readiness
    ...state           // Spread current state (isReady, isLoading, error)
  };
}