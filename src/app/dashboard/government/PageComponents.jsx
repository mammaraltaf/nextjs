'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicComponent from '@/app/PageComponents/DynamicComponent';
import { formatPhoneNumber, scrollToError } from '@/app/Resources/functions';
import { budgetingAuthorityOptions, federalAgencies, sectors } from '@/app/Resources/Variables';
import Image from 'next/image';
import { runValidation } from '@/app/Resources/ValidationFunctions';
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
 * Form field configurations organized by sections
 * Moving these outside the component prevents recreation on every render
 */
const PERSONAL_INFO_FIELDS = [
  { type: 'sectionHeading', label: 'Personal Info' },
  {
    label: 'What is Your First Name?',
    id: 'firstName',
    type: 'text',
    required: true,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'What is Your Last/SurName?',
    id: 'lastName',
    type: 'text',
    required: true,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'What is Your Title?',
    id: 'jobTitle',
    type: 'ddm',
    options: ['Chief', 'Director'],
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  }
];

const ADDRESS_FIELDS = [
  { type: 'sectionHeading', label: 'Address' },
  {
    label: 'What is your Office / Agency Physical Street Address?',
    id: 'officeStreetName',
    type: 'hereGeoLocation',
    required: true,
    outerClass: '!text-base !text-gray-700 col-span-2',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'What is your Office / Agency Physical Urbanization Number?',
    id: 'officeUrbanizationNumber',
    type: 'text',
    required: false,
    outerClass: '!text-base !text-gray-700 col-span-2',
    label3: 'For Puerto Rico and U.S. Virgin Islands only',
    labelClasses: '!text-sm !text-gray-700'
  }
];

const ADDRESS_DETAILS_FIELDS = [
  {
    label: 'State',
    type: 'input',
    id: 'officeState',
    options: [],
    required: true,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'County',
    id: 'officeCounty',
    type: 'input',
    options: [],
    required: false,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'City',
    id: 'officeCity',
    type: 'input',
    options: [],
    required: true,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'Zip Code',
    id: 'officeZipCode',
    type: 'text',
    required: true,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  }
];

const AGENCY_INFO_FIELDS = [
  { type: 'sectionHeading', label: 'Contact Info' },
  {
    label: 'What is your Office / Agency Primary Telephone?',
    id: 'officePrimaryTelephone',
    type: 'tel',
    required: false,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    label: 'What is your Office / Agency Alternate Telephone Number?',
    id: 'officeAlternateTelephone',
    type: 'tel',
    required: false,
    classes: '!text-base !text-gray-700',
    labelClasses: '!text-sm !text-gray-700'
  },
  { type: 'sectionHeading', label: 'Agency Info' },
  {
    type: 'ddm',
    id: 'agencyType',
    required: true,
    label: 'Are you',
    options: ['Federal', 'State', 'County', 'City', 'Village', 'Township', 'Perish'],
    classes: '!text-base !text-gray-700 col-span-3 relative',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    type: 'ddm',
    label: 'What Sector Best Describes Your Agency?',
    id: 'sector',
    options: sectors,
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    type: 'text',
    label: 'Please Describe',
    id: 'agencyDescription',
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative',
    labelClasses: '!text-sm !text-gray-700',
    conditionalId: 'sector',
    condition: 'Other'
  },
  {
    type: 'autoddm',
    label: 'What is the Name of the Agency that You Represent?',
    id: 'agencyName',
    options: [...federalAgencies, 'Other'],
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    type: 'text',
    label: 'Please Describe the Agency that You Represent',
    id: 'agencyDescription2',
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative',
    labelClasses: '!text-sm !text-gray-700',
    conditionalId: 'agencyName',
    condition: 'Other'
  },
  {
    type: 'yes/no',
    label: 'Do You Have Budgeting / Procurement Authority?',
    id: 'budgetingProcurementAuthority',
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative gap-3',
    labelClasses: '!text-sm !text-gray-700'
  },
  {
    type: 'ddm',
    label: 'If Yes, then what is Your Approximate Amount of Budgeting Authority?',
    id: 'budgetingAuthority',
    options: budgetingAuthorityOptions,
    required: true,
    classes: '!text-base !text-gray-700 col-span-3 relative -top-3',
    labelClasses: '!text-sm !text-gray-700',
    conditionalId: 'budgetingProcurementAuthority',
    condition: true
  }
];

// ===== MAIN COMPONENT =====

/**
 * PageComponents - Government Form Component
 * 
 * Features:
 * - Multi-section government form with validation
 * - Address verification with geolocation
 * - reCAPTCHA v3 Enterprise integration
 * - Real-time input sanitization
 * - GUID generation for tracking
 * - License agreement popup
 * - Performance optimized with hooks
 */
export default function PageComponents() {
  // ===== STATE MANAGEMENT =====
  
  // Core form state
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [compiledBlockedTerms, setCompiledBlockedTerms] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Address verification state
  const [verified, setVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState({});
  
  // UI state
  const [showPopup, setShowPopup] = useState(false);
  const [guid, setGuid] = useState('');
  
  // reCAPTCHA integration
  const { executeRecaptcha, waitForRecaptcha, isReady: recaptchaReady } = useRecaptcha();

  // ===== MEMOIZED FUNCTIONS (PERFORMANCE OPTIMIZATION) =====
  
  /**
   * sanitizeValue - Input sanitization based on field type
   * Prevents SQL injection and other security vulnerabilities
   */
  const sanitizeValue = useCallback((id, value) => {
    // Don't sanitize description field to preserve formatting
    return id !== 'ginicoeHelpDescription' ? sanitizeSQLInjection(value) : value;
  }, []);

  /**
   * handleChange - Comprehensive input change handler
   * 
   * Features:
   * - Field-specific processing (name cleanup, phone formatting)
   * - Real-time input sanitization
   * - Address verification state management
   * - Live validation feedback
   */
  const handleChange = useCallback((e) => {
    const { id, value: rawValue } = e.target;
    let value = sanitizeValue(id, rawValue);

    // Field-specific processing logic
    switch (id) {
      case 'firstName':
      case 'lastName':
        // Remove special characters and digits, keep only letters and spaces
        value = value.replace(/[^\w\s]/gi, '');
        setForm(prev => ({ ...prev, [id]: value }));
        break;

      case 'officeStreetName':
      case 'officeUrbanizationNumber':
      case 'officeCity':
      case 'officeState':
      case 'officeZipCode':
        // Address fields - reset verification status
        setVerified(false);
        setForm(prev => ({ ...prev, [id]: value }));
        break;

      case 'officePrimaryTelephone':
      case 'officeAlternateTelephone':
        // Format phone numbers as (123) 456-7890
        value = formatPhoneNumber(value);
        setForm(prev => ({ ...prev, [id]: value }));
        break;

      default:
        // Standard processing for other fields
        setForm(prev => ({ ...prev, [id]: value }));
        break;
    }

    // Real-time validation - check field as user types
    const updatedForm = { ...form, [id]: value };
    const errors = runValidation('govt_form', updatedForm, id);
    
    // Update only the specific field's error state
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
   * 2. Validate entire form
   * 3. Check address verification
   * 4. Show license popup if valid
   * 5. Display errors and scroll to first error if invalid
   */
  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    // Run comprehensive form validation
    const errors = runValidation('govt_form', form);
    const hasValidationErrors = Object.keys(errors).length > 0;

    // Check if form is valid and address is verified
    if (!hasValidationErrors && verified) {
      // Pre-sanitize form data before showing popup
      const sanitizedForm = {};
      for (const key in form) {
        if (form.hasOwnProperty(key) && typeof form[key] === 'string') {
          sanitizedForm[key] = SanitizeInput(form[key], compiledBlockedTerms);
        } else {
          sanitizedForm[key] = form[key];
        }
      }
      
      setForm(sanitizedForm);
      setShowPopup(true);
      return;
    }

    // Handle validation errors or unverified address
    const finalErrors = { ...errors };
    
    if (!verified) {
      finalErrors['officeStreetName'] = 'Address must be verified before submission';
    }

    setFormErrors(finalErrors);
    scrollToError(finalErrors);
    //setShowPopup(true);
  }, [form, verified, isSubmitting, compiledBlockedTerms]);

  /**
   * postSubmit - Final submission after license acceptance
   * 
   * Enhanced with reCAPTCHA v3 integration:
   * 1. Wait for reCAPTCHA readiness
   * 2. Execute invisible reCAPTCHA
   * 3. Verify token with backend
   * 4. Final sanitization
   * 5. Success handling
   */
  const postSubmit = useCallback(async () => {
    if (!isClient || typeof window === 'undefined' || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Step 1: Wait for reCAPTCHA to be ready
      await waitForRecaptcha();

      // Step 2: Execute reCAPTCHA v3 (invisible to user)
      const token = await executeRecaptcha('government_form');
      
      if (!token) {
        throw new Error('Failed to get reCAPTCHA token');
      }

      // Step 3: Verify reCAPTCHA token with backend using axios (simple verification)
      const verifyResponse = await axios.post('/api/verify-recaptcha', {
        token
      });

      if (!verifyResponse.data.success) {
        throw new Error(`Security verification failed: ${verifyResponse.data.error}`);
      }

      // Check reCAPTCHA score threshold (must be > 0.5)
      if (verifyResponse.data.score <= 0.5) {
        throw new Error('Security verification failed: reCAPTCHA score too low');
      }

      // Step 4: Final sanitization of form data
      const sanitizedForm = {};
      for (const key in form) {
        if (form.hasOwnProperty(key) && typeof form[key] === 'string') {
          sanitizedForm[key] = SanitizeInput(form[key], compiledBlockedTerms);
        } else {
          sanitizedForm[key] = form[key];
        }
      }

      setForm(sanitizedForm);

      // Step 5: Save to PostgreSQL database via API using axios
      // Note: guid and recaptchaScore must be at root level, not inside formData
      const submissionResponse = await axios.post('/api/submit-form', {
        formType: 'government',
        formData: {
          ...sanitizedForm,
          addressVerified: verified // Include address verification status
        },
        recaptchaScore: verifyResponse.data.score, // Use actual score from verification
        guid: guid || generateGUID('Government', sanitizedForm.officeState || 'Unknown', sanitizedForm.officeCounty || 'Unknown', '0000', '0001', sanitizedForm.officeStreetName)
      });

      if (!submissionResponse.data.success) {
        throw new Error(`Database save failed: ${submissionResponse.data.error}`);
      }
      toast.success("Form submitted successfully!");

    } catch (error) {
      console.error('Error in postSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, compiledBlockedTerms, executeRecaptcha, waitForRecaptcha, isClient]);

  // ===== MEMOIZED VALUES =====
  
  /**
   * Generate GUID when address is verified
   * Memoized to prevent unnecessary recalculation
   */
  const generatedGuid = useMemo(() => {
    if (verifiedAddress && verifiedAddress.Obj && verifiedAddress.id === 'officeStreetName') {
      const address = verifiedAddress.Obj.address;
      return generateGUID('Government', address.state, address.county, '0000', '0001', address.label);
    }
    return '';
  }, [verifiedAddress]);

  // ===== EFFECT HOOKS (LIFECYCLE AND SIDE EFFECTS) =====
  
  // Initialize client-side rendering
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
      } catch (error) {
        console.error('Failed to load blocked terms:', error);
      }
    };
    
    loadTerms();
  }, []);

  // Handle license acceptance and trigger submission
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

  // Store GUID in localStorage for tracking
  useEffect(() => {
    if (isClient && guid && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('guid', guid);
    }
  }, [guid, isClient]);

  // ===== VALIDATION EFFECTS =====
  // These effects handle real-time validation for complex fields
  
  // Validate financial institutions selection
  useEffect(() => {
    if (form['financialInstitutionsSelected']) {
      const errors = runValidation('govt_form', form, 'selectedFI');
      setFormErrors(prev => ({
        ...prev,
        'selectedFI': errors['selectedFI'] || '',
      }));
    }
  }, [form['financialInstitutionsSelected']]);

  // Validate financial services selection
  useEffect(() => {
    if (form['financialServicesSelected']) {
      const errors = runValidation('govt_form', form, 'selectedFS');
      setFormErrors(prev => ({
        ...prev,
        'selectedFS': errors['selectedFS'] || '',
      }));
    }
  }, [form['financialServicesSelected']]);

  // Validate operates across state lines
  useEffect(() => {
    if (form['operatesAcrossStateLines']) {
      const errors = runValidation('govt_form', form, 'operatesAcrossStateLines');
      setFormErrors(prev => ({
        ...prev,
        'operatesAcrossStateLines': errors['operatesAcrossStateLines'] || '',
      }));
    }
  }, [form['operatesAcrossStateLines']]);

  // Validate portfolio sizes
  useEffect(() => {
    if (form['portfolioSizes']) {
      const errors = runValidation('govt_form', form, 'portfolioSizes');
      setFormErrors(prev => ({
        ...prev,
        'portfolioSizesValid': errors['portfolioSizesValid'] || '',
      }));
    }
  }, [form['portfolioSizes']]);

  // Validate budgeting procurement authority
  useEffect(() => {
    if (form['budgetingProcurementAuthority']) {
      const errors = runValidation('govt_form', form, 'budgetingProcurementAuthority');
      setFormErrors(prev => ({
        ...prev,
        'budgetingProcurementAuthority': errors['budgetingProcurementAuthority'] || '',
      }));
    }
  }, [form['budgetingProcurementAuthority']]);

  // ===== ADDRESS VERIFICATION EFFECTS =====
  
  // Handle verified address data
  useEffect(() => {
    if (verifiedAddress && verifiedAddress.items && verifiedAddress.id === 'officeStreetName') {
      console.log('Address verified:', verifiedAddress);
      const addressItem = verifiedAddress.items[0];
      setForm(prev => ({
        ...prev,
        officeCounty: addressItem.address.county || '',
        officeCity: addressItem.address.city,
        officeState: addressItem.address.state,
        officeUrbanizationNumber: addressItem.address.subdistrict || '',
        officeZipCode: addressItem.address.postalCode
      }));
      setVerified(true);
    } else if (verifiedAddress && verifiedAddress.id !== 'officeStreetName') {
      // Don't change verified status for other fields
      return;
    } else {
      setVerified(false);
    }
  }, [verifiedAddress]);

  // ===== RENDER HELPERS =====
  
  /**
   * Renders a section of form fields with proper grid layout
   */
  const renderFieldSection = useCallback((fields, sectionKey, gridClasses = 'grid-cols-3') => (
    <div key={`${sectionKey}-fields`} className={`grid ${gridClasses} mt-5 gap-3`}>
      {fields.map((field, index) => (
        <DynamicComponent
          key={`${sectionKey}-field-${index}`}
          form={form}
          setform={setForm}
          handleChange={handleChange}
          formErrors={formErrors}
          label={field.label}
          label2={field.label2}
          label3={field.label3}
          id={field.id}
          type={field.type}
          setFormErrors={setFormErrors}
          options={field.options || []}
          placeholder={field.placeholder}
          secondaryId={field.secondaryId}
          secondaryLabel={field.secondaryLabel}
          required={field.required}
          section="govt_form"
          index={index}
          conditionalId={field.conditionalId}
          condition={field.condition}
          classes={field.classes || '!text-base !text-gray-700'}
          labelClasses={field.labelClasses || ''}
          outerClass={field.outerClass || ''}
          disabled={field.disabled || false}
          setVerifiedAddress={setVerifiedAddress}
          compiledBlockedTerms={compiledBlockedTerms}
        />
      ))}
    </div>
  ), [form, handleChange, formErrors, setFormErrors, compiledBlockedTerms]);

  // ===== CONDITIONAL RENDERING =====
  
  // Show loading spinner during hydration
  if (!isClient) {
    return (
      <div className='flex items-center justify-center w-full min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading Government Form...</p>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className='flex-1 gap-5 py-10 px-20 bg-white'>
      <div className='flex flex-col bg-gray-100 px-5 py-10 rounded-2xl'>
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-[var(--primary)] text-center">
          Government Form
        </h1>

        {/* Section 1: Personal Information */}
        {renderFieldSection(PERSONAL_INFO_FIELDS, 'section1')}

        {/* Section 2: Address Input */}
        {renderFieldSection(ADDRESS_FIELDS, 'section2', 'grid-cols-2')}

        {/* Section 3: Address Details */}
        {renderFieldSection(ADDRESS_DETAILS_FIELDS, 'section3', 'grid-cols-4')}

        {/* Address Verification Status */}
        <div className='flex flex-col gap-3 justify-center items-center mt-4'>
          <div className={`flex gap-3 items-center ${verified ? 'block' : 'hidden'}`}>
            <Image 
              src='/check.svg' 
              alt='Verified' 
              width={15} 
              height={15} 
              className={`w-4 h-4 ${verified ? 'block' : 'hidden'}`} 
            />
            <span className='text-green-500 font-bold'>Address Verified</span>
          </div>
          
          {/* {!verified && form['officeStreetName'] && (
            <div className="text-amber-600 text-sm text-center">
              Please verify your address before submission
            </div>
          )} */}
        </div>

        {/* Section 4: Agency Information */}
        {renderFieldSection(AGENCY_INFO_FIELDS, 'section4')}

        {/* Description Text Area */}
        <TextAreaField
          id='ginicoeHelpDescription'
          label='Describe in Detail How Ginicoe Can Help You.'
          label2='Please provide any additional information that may be relevant to your application.'
          required={false}
          form={form}
          handleChange={handleChange}
          classes='mb-10 mt-5'
          formErrors={formErrors}
        />

        {/* Action Buttons */}
        <div className='flex justify-center gap-5 items-center mt-10'>
          <button 
            className={`px-6 py-3 rounded-md transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Submit Application'}
          </button>
        </div>

        {/* License Agreement Popup */}
        <SignageDownloadPopup 
          file="/agreements/Ginicoe License _ SLA.pdf"
          id='freeWareLicense'
          form={form}
          setform={setForm}
          show={showPopup}
          label="Ginicoe Freeware License"
          onClose={() => setShowPopup(false)}
        />
        
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </div>
  );
}