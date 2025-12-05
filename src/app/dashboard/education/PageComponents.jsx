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

// ===== FORM CONFIGURATION (MOVED OUTSIDE FOR PERFORMANCE) =====

/**
 * Form field configuration for education contact form
 * Moved outside component to prevent recreation on every render
 */
const EDUCATION_FORM_FIELDS = [
  {
    id: 'name',
    type: 'text',
    label: 'Your Name',
    required: true
  },
  {
    id: 'email',
    type: 'email',
    label: 'Your Email',
    required: true
  },
  {
    id: 'phone',
    type: 'tel',
    label: 'Your Phone Number',
    required: false
  }
];

// ===== LOADING COMPONENT =====

/**
 * Loading spinner component for better UX during hydration
 */
const LoadingSpinner = () => (
  <div className='flex items-center justify-center w-full min-h-screen'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
      <p className='mt-2 text-gray-600'>Loading Education Form...</p>
    </div>
  </div>
);

// ===== MAIN COMPONENT =====

/**
 * PageComponents - Education Form Component
 * 
 * Features:
 * - Contact form for education sector
 * - Real-time form validation
 * - Input sanitization and security
 * - reCAPTCHA v3 simple integration
 * - GUID generation for tracking
 * - License agreement popup
 * - Success page after submission
 * - Optimized performance with React hooks
 */
export default function PageComponents() {
  // ===== STATE MANAGEMENT =====
  
  // Core form state
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [compiledBlockedTerms, setCompiledBlockedTerms] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI flow state
  const [submitted, setSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [guid, setGuid] = useState('');
  
  // reCAPTCHA integration
  const { executeRecaptcha, waitForRecaptcha, isReady: recaptchaReady } = useRecaptcha();

  // ===== MEMOIZED FUNCTIONS (PERFORMANCE OPTIMIZATION) =====
  
  /**
   * sanitizeValue - Input sanitization based on field type
   * Prevents security vulnerabilities while preserving user intent
   */
  const sanitizeValue = useCallback((id, value) => {
    // Don't sanitize description field to preserve formatting and special characters
    return id !== 'ginicoeHelpDescription' ? sanitizeSQLInjection(value) : value;
  }, []);

  /**
   * handleChange - Optimized input change handler
   * 
   * Features:
   * - Field-specific processing (name cleanup, phone formatting)
   * - Real-time input sanitization
   * - Live validation feedback
   * - Performance optimized with useCallback
   */
  const handleChange = useCallback((e) => {
    const { id, value: rawValue } = e.target;
    let value = sanitizeValue(id, rawValue);

    // Field-specific processing logic
    switch (id) {
      case 'name':
        // Remove special characters and digits, keep only letters and spaces
        // This ensures clean name data for education forms
        value = value.replace(/[^\w\s]/gi, '');
        setForm(prev => ({ ...prev, [id]: value }));
        break;

      case 'phone':
        // Format phone number as (123) 456-7890 for consistency
        value = formatPhoneNumber(value);
        setForm(prev => ({ ...prev, [id]: value }));
        break;

      default:
        // Standard processing for other fields (email, description, etc.)
        setForm(prev => ({ ...prev, [id]: value }));
        break;
    }

    // Real-time validation - validate field as user types
    const updatedForm = { ...form, [id]: value };
    const errors = runValidation('education_form', updatedForm, id);
    
    // Update only the specific field's error state for better performance
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [id]: errors[id] || '', // Clear error if validation passes
    }));
  }, [form, sanitizeValue]);

  /**
   * handleSubmit - Form submission handler
   * 
   * Flow:
   * 1. Prevent double submission
   * 2. Run comprehensive form validation
   * 3. Show license popup if valid
   * 4. Display errors and scroll to first error if invalid
   */
  const handleSubmit = useCallback(() => {
    if (isSubmitting) return; // Prevent double submission

    // Run comprehensive form validation
    const errors = runValidation('education_form', form);
    
    if (Object.keys(errors).length === 0) {
      // Form is valid - show license agreement popup
      setShowPopup(true);
      return;
    }

    // Form has validation errors
    setFormErrors(errors);
    scrollToError(errors); // Improve UX by scrolling to first error
  }, [form, isSubmitting]);

  /**
   * postSubmit - Final submission after license acceptance
   * 
   * Enhanced with reCAPTCHA v3 simple integration:
   * 1. Wait for reCAPTCHA to be ready
   * 2. Execute invisible reCAPTCHA analysis
   * 3. Verify token with backend API (simple verification)
   * 4. Sanitize form data for security
   * 5. Mark as submitted and show success page
   */
  const postSubmit = useCallback(async () => {
    if (!isClient || typeof window === 'undefined' || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Step 1: Wait for reCAPTCHA to be ready
      console.log('Education form: Waiting for reCAPTCHA...');
      await waitForRecaptcha();

      // Step 2: Execute reCAPTCHA v3 (invisible to user)
      // This analyzes user behavior and generates a risk score
      console.log('Education form: Executing reCAPTCHA...');
      const token = await executeRecaptcha('education_form');
      
      if (!token) {
        throw new Error('Failed to get reCAPTCHA token');
      }
      console.log('Education form: reCAPTCHA token:', token);
      
      const verifyResponse = await axios.post('/api/verify-recaptcha', {
        token
      });
      console.log('Education form: Verify response:', verifyResponse.data);

      if (!verifyResponse.data.success) {
        throw new Error(`Security verification failed: ${verifyResponse.data.error}`);
      }

      // Check reCAPTCHA score threshold (must be > 0.5)
      if (verifyResponse.data.score <= 0.5) {
        throw new Error('Security verification failed: reCAPTCHA score too low');
      }

      // console.log(`Education form reCAPTCHA verification successful. Score: ${verifyResponse.data.score}`);

      // Step 4: Final sanitization of form data for security
      const sanitizedForm = {};
      for (const key in form) {
        if (form.hasOwnProperty(key) && typeof form[key] === 'string') {
          sanitizedForm[key] = SanitizeInput(form[key], compiledBlockedTerms);
        } else {
          sanitizedForm[key] = form[key];
        }
      }
      console.log('Final sanitized form:', sanitizedForm)

      setForm(sanitizedForm);

      // Step 5: Save to PostgreSQL database via API using axios
      // Note: guid and recaptchaScore must be at root level, not inside formData
      const submissionResponse = await axios.post('/api/submit-form', {
        formType: 'education',
        formData: sanitizedForm,
        recaptchaScore: verifyResponse.data.score, // Use actual score from verification
        guid: generateGUID('Enterprise', 'Florida', 'Clay', '0000', '0001') // Generate GUID with proper values
      });

      if (!submissionResponse.data.success) {
        throw new Error(`Database save failed: ${submissionResponse.data.error}`);
      }

      console.log('Education form saved to database:', submissionResponse.data.data);

      // Extract reference_id from Laravel response
      // Laravel returns the data in submissionResponse.data.data
      const referenceId = submissionResponse.data.data?.reference_id ||
                         submissionResponse.data.data?.guid ||
                         guid; // Fallback to generated GUID if not returned

      console.log('Reference ID from database:', referenceId);
      setGuid(referenceId); // Update GUID with the actual reference_id from database

      toast.success('Form submitted successfully!');

      // Step 6: Mark as successfully submitted
      setSubmitted(true);

    } catch (error) {
      console.error('Error in education form postSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, compiledBlockedTerms, executeRecaptcha, waitForRecaptcha, isClient]);

  // ===== MEMOIZED VALUES =====
  
  /**
   * Generate GUID when name is entered
   * Memoized to prevent unnecessary recalculation on every render
   */
  const generatedGuid = useMemo(() => {
    if (form.name) {
      // Generate education-specific GUID with proper default values
      // Using 'Enterprise' as form name, 'Florida' as state, 'Clay' as county
      // Using '0000' and '0001' as increment counters
      return generateGUID('Enterprise', 'Florida', 'Clay', '0000', '0001');
    }
    return '';
  }, [form.name]);

  // ===== EFFECT HOOKS (LIFECYCLE AND SIDE EFFECTS) =====
  
  // Initialize client-side rendering to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load and compile blocked terms for content filtering
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const terms = await loadBlockedTerms();
        const compiledTerms = compileBlockedTerms(terms);
        setCompiledBlockedTerms(compiledTerms);
        console.log('Education form: Blocked terms loaded and compiled');
      } catch (error) {
        console.error('Failed to load blocked terms for education form:', error);
      }
    };
    
    loadTerms();
  }, []);

  // Handle license acceptance and trigger final submission
  useEffect(() => {
    if (form['freeWareLicense'] === true) {
      setShowPopup(false);
      postSubmit();
    }
  }, [form['freeWareLicense'], postSubmit]);

  // Update GUID when generated
  useEffect(() => {
    if (generatedGuid) {
      setGuid(generatedGuid);
    }
  }, [generatedGuid]);

  // Store GUID in localStorage for tracking and reference
  useEffect(() => {
    if (isClient && guid && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('guid', guid);
    }
  }, [guid, isClient]);

  // ===== CONDITIONAL RENDERING =====
  
  // Show loading spinner during hydration
  if (!isClient) {
    return <LoadingSpinner />;
  }

  // Show success page after form submission
  if (submitted) {
    return <Submitted guid={guid} />;
  }

  // ===== MAIN FORM RENDER =====
  return (
    <div className='flex justify-center items-center min-h-screen px-4'>
      <div className='w-full max-w-[800px] mx-auto'>
        <div className='flex flex-col gap-3 p-4 md:p-6 bg-gray-100 rounded-lg shadow-md'>
          <h2 className='text-2xl md:text-3xl font-bold text-center'>Contact Us</h2>
          
          {/* Dynamic Form Fields */}
          {EDUCATION_FORM_FIELDS.map((field, index) => (
            <DynamicComponent 
              key={field.id} // Use field.id as key for better React reconciliation
              id={field.id}
              label={field.label}
              form={form}
              setForm={setForm}
              handleChange={handleChange}
              formErrors={formErrors}
              maxCharacters={field.maxCharacters}
              type={field.type}
              classes={field.classes}
              label2={field.label2}
              compiledBlockedTerms={compiledBlockedTerms}
              setform={setForm} // Legacy prop for backward compatibility
              setFormErrors={setFormErrors}
              section={'education_form'}
            />
          ))}

          {/* Description Text Area */}
          <TextAreaField
            id='ginicoeHelpDescription'
            label='Describe in Detail How Ginicoe Can Help You.'
            label2='Please provide any additional information that may be relevant to your application.'
            required={false}
            form={form}
            handleChange={handleChange}
            formErrors={formErrors}
          />

          {/* Submit Button with Loading State */}
          <div className='flex justify-center items-center'>
            <button 
              className={`mt-5 w-full max-w-[200px] rounded-full px-4 py-2 text-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>

        </div>

        {/* License Agreement Popup */}
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