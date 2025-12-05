'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicComponent from '@/app/PageComponents/DynamicComponent';
import { formatPhoneNumber, scrollToError } from '@/app/Resources/functions';
import Submitted from './Submitted';
import { runValidation, verifyCaptcha } from '@/app/Resources/ValidationFunctions';
import { 
  compileBlockedTerms, 
  loadBlockedTerms, 
  SanitizeInput, 
  sanitizeSQLInjection 
} from '@/app/Resources/SanitizingFunctions';
import SignageDownloadPopup from '@/app/PageComponents/SignageDownloadPopup';
import TextAreaField from '@/app/PageComponents/TextAreaField';
import { generateGUID } from '@/app/Resources/GuidFunctions';
import { useRecaptcha } from '@/app/hooks/useRecaptcha';

// Form field configuration (moved outside component to prevent recreation on each render)
const FORM_FIELDS = [
  { id: 'name', type: 'text', label: 'Your Name', required: true },
  { id: 'email', type: 'email', label: 'Your Email', required: true },
  { id: 'phone', type: 'tel', label: 'Your Phone Number', required: false },
];

// Loading spinner component (separated for reusability)
const LoadingSpinner = () => (
  <div className='flex items-center justify-center w-full min-h-screen'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
      <p className='mt-2 text-gray-600'>Loading...</p>
    </div>
  </div>
);

/**
 * PageComponents - Main healthcare contact form component
 * 
 * Features:
 * - Real-time form validation
 * - Input sanitization and security
 * - reCAPTCHA v3 integration
 * - GUID generation for tracking
 * - License agreement popup
 * - Optimized performance with useCallback and useMemo
 */
export default function PageComponents() {
  // ===== STATE MANAGEMENT =====
  const [form, setForm] = useState({});                    // Form data
  const [submitted, setSubmitted] = useState(false);       // Submission status
  const [formErrors, setFormErrors] = useState({});        // Validation errors
  const [showPopup, setShowPopup] = useState(false);       // License popup visibility
  const [guid, setGuid] = useState('');                    // Generated unique ID
  const [compiledBlockedTerms, setCompiledBlockedTerms] = useState(''); // Security terms
  const [isClient, setIsClient] = useState(false);         // Client-side rendering flag
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission in progress

  // ===== RECAPTCHA HOOK =====
  // Import reCAPTCHA functionality with state management
  const { executeRecaptcha, waitForRecaptcha, isReady, isLoading, error } = useRecaptcha();

  // ===== MEMOIZED FUNCTIONS (PERFORMANCE OPTIMIZATION) =====
  
  /**
   * sanitizeValue - Cleans input values to prevent security issues
   * Memoized to prevent recreation on every render
   */
  const sanitizeValue = useCallback((id, value) => {
    // Don't sanitize the description field (allows more characters)
    return id !== 'ginicoeHelpDescription' ? sanitizeSQLInjection(value) : value;
  }, []);

  /**
   * handleChange - Processes input changes with validation and sanitization
   * 
   * Flow:
   * 1. Extract field ID and value from event
   * 2. Sanitize input based on field type
   * 3. Apply field-specific processing (name cleanup, phone formatting)
   * 4. Update form state
   * 5. Run real-time validation
   * 6. Update error state
   */
  const handleChange = useCallback((e) => {
    const { id, value: rawValue } = e.target;
    let value = sanitizeValue(id, rawValue);

    // Field-specific processing
    switch (id) {
      case 'name':
        // Remove special characters, keep only letters, numbers, and spaces
        value = value.replace(/[^\w\s]/gi, '');
        break;
      case 'phone':
        // Format phone number as (123) 456-7890
        value = formatPhoneNumber(value);
        break;
      // Other fields pass through without modification
    }

    // Update form state with new value
    setForm(prev => ({ ...prev, [id]: value }));

    // Real-time validation: validate field as user types
    const updatedForm = { ...form, [id]: value };
    const errors = runValidation('health_form', updatedForm, id);
    
    // Update error state for this specific field
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [id]: errors[id] || '', // Clear error if validation passes
    }));
  }, [form, sanitizeValue]); // Dependencies: form state and sanitize function

  /**
   * handleSubmit - Initial form submission handler
   * 
   * Flow:
   * 1. Prevent double submission
   * 2. Run full form validation
   * 3. If valid: show license popup
   * 4. If invalid: show errors and scroll to first error
   */
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submission

    // Validate entire form
    const errors = runValidation('health_form', form);
    
    if (Object.keys(errors).length === 0) {
      // Form is valid - show license agreement popup
      setShowPopup(true);
      return;
    }

    // Form has errors - display them and scroll to first error
    setFormErrors(errors);
    scrollToError(errors); // Scroll to first error for better UX
  }, [form, isSubmitting]);

  /**
   * postSubmit - Final submission after license acceptance
   * 
   * Flow:
   * 1. Safety checks
   * 2. Execute reCAPTCHA v3
   * 3. Verify token with backend
   * 4. Sanitize form data
   * 5. Submit to server
   * 6. Handle success/error states
   */
  const postSubmit = useCallback(async () => {
    // Safety checks
    if (!isClient || typeof window === 'undefined' || isSubmitting) return;

    setIsSubmitting(true); // Set loading state

    try {
      // Step 1: Wait for reCAPTCHA to be ready
      await waitForRecaptcha();

      // Step 2: Execute reCAPTCHA v3 (invisible to user)
      const token = await executeRecaptcha('healthcare_form');
      
      if (!token) {
        throw new Error('Failed to get reCAPTCHA token');
      }

      // Step 3: Verify reCAPTCHA token with our backend using axios (simple verification)
      const verifyResponse = await axios.post('/api/verify-recaptcha', {
        token
      });
      
      if (!verifyResponse.data.success) {
        console.error('Verification failed:', verifyResponse.data);
        throw new Error(`Security verification failed: ${verifyResponse.data.error}`);
      }

      // Check reCAPTCHA score threshold (must be > 0.5)
      if (verifyResponse.data.score <= 0.5) {
        throw new Error('Security verification failed: reCAPTCHA score too low');
      }

      // Step 4: Sanitize form data before submission
      const sanitizedForm = {};
      for (const [key, value] of Object.entries(form)) {
        if (typeof value === 'string') {
          // Apply content filtering to string values
          sanitizedForm[key] = SanitizeInput(value, compiledBlockedTerms);
        } else {
          // Non-string values pass through unchanged
          sanitizedForm[key] = value;
        }
      }

      // Step 5: Save to PostgreSQL database via API using axios
      // Note: guid and recaptchaScore must be at root level, not inside formData
      const submissionResponse = await axios.post('/api/submit-form', {
        formType: 'health',
        formData: sanitizedForm,
        recaptchaScore: verifyResponse.data.score, // Use actual score from verification
        guid: generatedGuid || generateGUID('Health Care', 'Florida', 'Clay', '0000', '0001')
      });

      if (!submissionResponse.data.success) {
        throw new Error(`Database save failed: ${submissionResponse.data.error}`);
      }

      toast.success('Form submitted successfully!');

      // Step 6: Update form state and mark as submitted
      setForm(sanitizedForm);
      setSubmitted(true);

    } catch (error) {
      // Handle any errors during submission process
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during submission';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false); // Clear loading state
    }
  }, [isClient, form, compiledBlockedTerms, executeRecaptcha, waitForRecaptcha]);

  // ===== MEMOIZED VALUES =====
  
  /**
   * generatedGuid - Creates unique identifier when name is entered
   * Memoized to prevent regeneration on every render
   */
  const generatedGuid = useMemo(() => {
    if (form.name) {
      return generateGUID('Health Care', 'Florida', 'Clay', '0000', '0001');
    }
    return '';
  }, [form.name]); // Only recalculate when name changes

  // ===== EFFECTS (SIDE EFFECTS AND LIFECYCLE) =====
  
  // Set client-side flag to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load blocked terms for content filtering
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const terms = await loadBlockedTerms();
        const compiledTerms = compileBlockedTerms(terms);
        setCompiledBlockedTerms(compiledTerms);
      } catch (error) {
        console.error('Failed to load blocked terms:', error);
      }
    };
    
    loadTerms();
  }, []);

  // Trigger submission when license is accepted
  useEffect(() => {
    if (form.freeWareLicense === true) {
      setShowPopup(false); // Hide popup
      // Remove the freeWareLicense from form to prevent infinite loop
      const { freeWareLicense, ...rest } = form;
      setForm(rest);
      postSubmit();        // Process submission
    }
  }, [form.freeWareLicense, postSubmit]); // Remove form from dependencies

  // Store GUID in localStorage for tracking
  useEffect(() => {
    if (isClient && guid && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('guid', guid);
    }
  }, [guid]);

  // ===== RENDER LOGIC =====
  
  // Show loading spinner during hydration
  if (!isClient) {
    return <LoadingSpinner />;
  }

  // Show success page after submission
  if (submitted) {
    return <Submitted guid={guid} />;
  }

  // Main form interface
  return (
    <div className='flex justify-center items-center min-h-screen px-4'>
      <div className='w-full max-w-[800px] mx-auto'>
        
        <div className='flex w-2xl flex-col gap-3 px-10 py-5 bg-gray-100 text-gray-800'>
          <h2 className='text-2xl font-bold'>Contact Us</h2>
          
          {/* Dynamic form fields */}
          {FORM_FIELDS.map((field) => (
            <DynamicComponent 
              key={field.id}
              id={field.id} 
              label={field.label}
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              formErrors={formErrors}
              type={field.type}
              compiledBlockedTerms={compiledBlockedTerms}
              setform={setForm} // Legacy prop for compatibility
              setFormErrors={setFormErrors}
              section={'health_form'}
            />
          ))}

          {/* Description text area */}
          <TextAreaField
            id='ginicoeHelpDescription'
            label='Describe in Detail How Ginicoe Can Help You.'
            label2='Please provide any additional information that may be relevant to your application.'
            required={false}
            form={form}
            handleChange={handleChange}
            formErrors={formErrors}
          />

          {/* Submit button with loading state */}
          <div className='flex items-center justify-center'>
            <button 
              className={`mt-5 w-[200px] rounded-full px-4 py-2 text-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed'  // Disabled state
                  : 'bg-blue-600 hover:bg-blue-700'   // Active state
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting} // Prevent clicks during submission
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>

        </div>

        {/* License agreement popup */}
        <SignageDownloadPopup 
          file="/agreements/Ginicoe License _ SLA.pdf"
          id='freeWareLicense'
          form={form}
          setform={setForm}
          show={showPopup}
          label="Merchant Freeware License"
          onClose={() => setShowPopup(false)}
        />
        
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}