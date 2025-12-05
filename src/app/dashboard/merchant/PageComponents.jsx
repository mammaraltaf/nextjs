'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicComponent from '@/app/PageComponents/DynamicComponent';
import { formatPhoneNumber, scrollToError } from '@/app/Resources/functions';
import { 
  acquiringBank, 
  businessTypes, 
  categories, 
  getJobTitlesData, 
  industries, 
  numberOfEmployeesOptions, 
  paymentProcessors, 
  posSystems 
} from '@/app/Resources/Variables';
import SignageDownloadPopup from '@/app/PageComponents/SignageDownloadPopup';
import { 
  compileBlockedTerms, 
  loadBlockedTerms, 
  SanitizeInput, 
  sanitizeSQLInjection 
} from '@/app/Resources/SanitizingFunctions';
import { runValidation } from '@/app/Resources/ValidationFunctions';
import TextAreaField from '@/app/PageComponents/TextAreaField';
import { generateGUID } from '@/app/Resources/GuidFunctions';
import { useRecaptcha } from '@/app/hooks/useRecaptcha';
import MerchantConsent from './MerchantConsent';

// Form field configurations organized by sections
const BUSINESS_INFO_FIELDS = [
  { id: 'businessLegalName', label: 'Business LEGAL Name', type: 'text', required: true },
  { id: 'businessTradeName', label: 'Business DBA Name (if different than legal name)', type: 'text', required: false },
  // { id: 'businessPhysicalAddress', label: 'Business physical address', type: 'text', required: true },
];

const CONTACT_INFO_FIELDS = [
  { type: 'sectionHeading', label: 'Contact Information' },
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'telephone', label: 'Telephone', type: 'tel', required: false },
  { id: 'tollFreeNumber', placeholder: '1-800-123-456', label: 'Toll Free Number (if applicable)', type: 'text', required: false },
  { id: 'businessEmail', label: 'Business Email', type: 'email', required: false },
  { id: 'federalTaxId', label: 'Federal Tax ID# (Required for Partnerships and Corporations)', type: 'text', required: true },
];

const OWNER_INFO_FIELDS = [
  { type: 'sectionHeading', label: 'Ownership or Partner Information' },
  { id: 'ownerFirstName', label: 'Owner/Partner First Name', type: 'text', required: true },
  { id: 'ownerLastName', label: 'Owner/Partner Last Name', type: 'text', required: true },
  { id: 'titleInBusiness', label: 'Title in Business', type: 'autoddm', required: true },
  { id: 'socialSecurityNumber', label: 'Social Security Number', type: 'ssn', required: true },
  { id: 'ownerTelephone', label: 'Telephone Number', type: 'tel', required: true },
  { id: 'ownerPercentageOwnership', label: 'Owner Percentage', type: 'text', required: true },
  { id: 'ownerDob', label: 'Date of Birth', type: 'date', required: true },
  // { id: 'ownerHomeAddress', label: `Owner's Home Address`, type: 'hereGeoLocation', required: true },
];

/**
 * MerchantNewPageComponents - Modern Merchant Form Component
 * 
 * Features:
 * - Comprehensive merchant application form
 * - Real-time validation and sanitization
 * - reCAPTCHA v3 Enterprise integration with useRecaptcha hook
 * - Axios for API calls
 * - Toast notifications for user feedback
 * - GUID generation and tracking
 * - Address verification
 * - Document downloads
 * - Performance optimized with React hooks
 */
export default function PageComponents() {
  // ===== STATE MANAGEMENT =====
  const [form, setForm] = useState({
    posHardwareSoftware: false,
    sameAsPhysicalAddress: true,
    areYouHomeBased: false,
    thirdPartyWebHosting: false,
    cardStoredByUser: false,
    vendorPCICompliant: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [compiledBlockedTerms, setCompiledBlockedTerms] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI state
  const [verifiedAddress, setVerifiedAddress] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guid, setGuid] = useState('');
  const [jobTitles, setJobTitles] = useState([]);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  
  // reCAPTCHA integration using custom hook
  const { executeRecaptcha, waitForRecaptcha, isReady: recaptchaReady } = useRecaptcha();

  // Files to download on successful submission
  const filesToDownload = [
    {
      path: '/agreements/2_Merchant%20Signage%20Large.pdf',
      name: '2_Merchant Signage Large.pdf',
    },
    {
      path: '/agreements/3_Merchant%20Signage%20small.pdf',
      name: '3_Merchant Signage small.pdf',
    },
  ];

  // ===== UTILITY FUNCTIONS =====
  
  /**
   * Download multiple files sequentially
   */
  const downloadMultipleFiles = useCallback(() => {
    console.log('Starting multiple file download...');
    
    filesToDownload.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = file.path;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`Downloaded: ${file.name}`);
      }, index * 300);
    });
  }, [filesToDownload]);

  /**
   * Input sanitization based on field type
   */
  const sanitizeValue = useCallback((id, value) => {
    return id !== 'ginicoeHelpDescription' ? sanitizeSQLInjection(value) : value;
  }, []);

  // ===== FORM HANDLERS =====
  
  /**
   * Handle form field changes with validation and formatting
   */
  const handleChange = useCallback((e) => {
    const { id, value: rawValue } = e.target;
    let value = sanitizeValue(id, rawValue);

    // Field-specific processing
    switch (id) {
      case 'ownerFirstName':
      case 'ownerLastName':
      case 'businessLegalName':
      case 'businessTradeName':
      case 'firstName':
      case 'lastName':
      case 'accountManagerFirstName':
      case 'accountManagerLastName':
        value = value.replace(/\d+/g, ' ');
        break;

      case 'ownerPercentageOwnership':
        let cleaned = value
          .replace(/[^0-9.%]/g, '')
          .replace(/^(\d*\.\d{0,2}).*$/, '$1');
        
        if (/^\d{3,}$/.test(cleaned) && !cleaned.includes('.') && !cleaned.includes('%')) {
          cleaned = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}`;
        }
        
        if (rawValue.includes('%') && !cleaned.includes('%')) {
          cleaned += '%';
        }
        
        value = cleaned;
        break;

      case 'federalTaxId':
        value = value.replace(/\D/g, '');
        if (value.length > 9) return;
        if (value.length >= 2) {
          value = `${value.slice(0, 2)}-${value.slice(2)}`;
        }
        break;

      case 'accountManagerTelephoneNumber':
      case 'ownerTelephone':
      case 'telephone':
        value = formatPhoneNumber(value);
        break;

      case 'tollFreeNumber':
        let digits = value.replace(/\D/g, '');
        if (value === '') {
          setForm(prev => ({ ...prev, [id]: '' }));
          return;
        }
        
        let formatted = '';
        if (digits.length <= 1) {
          formatted = `${digits}-`;
        } else if (digits.length > 1 && digits.length < 4) {
          formatted = `${digits.slice(0, 1)}-${digits.slice(1)}`;
        } else if (digits.length >= 4 && digits.length < 7) {
          formatted = `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4)}`;
        } else if (digits.length >= 7) {
          formatted = `${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        value = formatted;
        break;

      case 'naicsNumber':
        let cleanedNaics = value.replace(/\D/g, '').slice(0, 6);
        if (cleanedNaics.length > 2) {
          cleanedNaics = `${cleanedNaics.slice(0, 2)}-${cleanedNaics.slice(2)}`;
        }
        value = cleanedNaics;
        break;

      case 'tier1':
      case 'tier2':
      case 'tier3':
      case 'tier4':
        if (value === true) {
          const otherTiers = ['tier1', 'tier2', 'tier3', 'tier4'].filter(tier => tier !== id);
          otherTiers.forEach(tier => {
            setForm(prev => ({ ...prev, [tier]: false }));
          });
        }
        break;
    }

    setForm(prev => ({ ...prev, [id]: value }));

    // Real-time validation
    const updatedForm = { ...form, [id]: value };
    const errors = runValidation('merchant_form', updatedForm, id);
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [id]: errors[id] || '',
    }));
  }, [form, sanitizeValue]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    const errors = runValidation('merchant_form', form);

    console.log('🔍 Merchant form validation results:', {
      errorCount: Object.keys(errors).length,
      errorKeys: Object.keys(errors),
      errors: errors,
      errorsJSON: JSON.stringify(errors, null, 2),
      formState: form
    });

    if (Object.keys(errors).length === 0) {
      // Generate GUID if not already generated
      if (!guid) {
        const newGuid = generateGUID('Merchant', 'Florida', 'Clay', '0000', '0001');
        setGuid(newGuid);
        console.log('Generated GUID for merchant:', newGuid);
      }

      // Show consent form on submit
      console.log('✅ Validation passed! Showing consent form...');
      setShowConsentForm(true);
      return;
    }

    // Show error notification to user
    const errorCount = Object.keys(errors).length;
    const firstErrorKey = Object.keys(errors)[0];
    const firstError = errors[firstErrorKey];

    console.error('❌ Merchant form validation errors:', {
      errorCount,
      firstErrorKey,
      firstError,
      allErrors: errors,
      allErrorsJSON: JSON.stringify(errors, null, 2)
    });

    toast.error(
      `Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}: ${firstError}`,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );

    setFormErrors(errors);
    scrollToError(errors);
  }, [form, isSubmitting, guid]);

  /**
   * Handle post submission after license agreement
   */
  const postSubmit = useCallback(async () => {
    console.log('Posting merchant form...');
    if (!isClient || typeof window === 'undefined' || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Step 1: Wait for reCAPTCHA to be ready
      console.log('Merchant form: Waiting for reCAPTCHA...');
      await waitForRecaptcha();

      // Step 2: Execute reCAPTCHA v3 (invisible to user)
      console.log('Merchant form: Executing reCAPTCHA...');
      const token = await executeRecaptcha('merchant_form');
      
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

      console.log(`Merchant form reCAPTCHA verification successful. Score: ${verifyResponse.data.score}`);

      // Step 4: Sanitize form data
      const sanitizedForm = {};
      for (const key in form) {
        if (form.hasOwnProperty(key) && typeof form[key] === 'string') {
          sanitizedForm[key] = SanitizeInput(form[key], compiledBlockedTerms);
        } else {
          sanitizedForm[key] = form[key];
        }
      }

      // Step 5: Save to PostgreSQL database via API
      // Note: guid and recaptchaScore must be at root level, not inside formData
      const submissionResponse = await axios.post('/api/submit-form', {
        formType: 'merchant',
        formData: sanitizedForm,
        recaptchaScore: verifyResponse.data.score, // Use actual score from verification
        guid: guid || generateGUID('Merchant', 'Florida', 'Clay', '0000', '0001')
      });

      if (!submissionResponse.data.success) {
        throw new Error(`Database save failed: ${submissionResponse.data.error}`);
      }

      console.log('Merchant form saved to database:', submissionResponse.data.data);

      // Extract reference_id from Laravel response
      // Laravel returns the data in submissionResponse.data.data
      const referenceId = submissionResponse.data.data?.reference_id ||
                         submissionResponse.data.data?.guid ||
                         guid; // Fallback to generated GUID if not returned

      console.log('Reference ID from database:', referenceId);
      setGuid(referenceId); // Update GUID with the actual reference_id from database

      // Step 6: Success actions
      downloadMultipleFiles();
      toast.success(`Form submitted successfully! Reference ID: ${referenceId}`);
      setSubmitted(true);

    } catch (error) {
      console.error('Error in merchant form postSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast.error(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, compiledBlockedTerms, executeRecaptcha, waitForRecaptcha, isClient, downloadMultipleFiles, setIsSubmitting, setSubmitted, guid]);

  /**
   * Handle consent acceptance from the consent form
   */
  const handleConsentAccepted = useCallback(async (agreementData) => {
    try {
      console.log('Merchant consent accepted:', agreementData);

      // Ensure we have a GUID
      const merchantGuid = guid || generateGUID('Merchant', 'Florida', 'Clay', '0000', '0001');
      if (!guid) {
        setGuid(merchantGuid);
        console.log('Generated GUID for agreement:', merchantGuid);
      }

      // Step 1: Save agreement signature directly to Laravel database
      console.log('Saving agreement signature to Laravel...');

      // Laravel API expects snake_case field names
      const signaturePayload = {
        agreement_type: agreementData.agreementType || 'merchant',
        agreement_id: agreementData.agreementId,
        user_id: agreementData.userId || merchantGuid,
        user_name: agreementData.userName,
        signature_data: agreementData.signatureData,
        signature_date: agreementData.signatureDate,
        ip_address: agreementData.ipAddress,
        user_agent: agreementData.userAgent,
        timestamp: agreementData.timestamp
      };

      console.log('Signature payload to send to Laravel:', signaturePayload);

      // Call Laravel API directly
      const laravelApiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000';
      const laravelApiPath = process.env.NEXT_PUBLIC_LARAVEL_API_BASE_PATH || '/api/v1';
      const laravelEndpoint = `${laravelApiUrl}${laravelApiPath}/agreement-signatures`;

      console.log('Laravel endpoint:', laravelEndpoint);

      const signatureResponse = await axios.post(laravelEndpoint, signaturePayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Laravel API response:', signatureResponse.data);

      if (!signatureResponse.data.success) {
        const errorMsg = signatureResponse.data.error || signatureResponse.data.message || 'Failed to save agreement signature';
        throw new Error(errorMsg);
      }

      console.log('Agreement signature saved successfully to Laravel:', signatureResponse.data);

      // Store agreement data to be included with form submission
      setForm(prev => ({
        ...prev,
        biometricConsentData: agreementData,
        agreementSignatureId: signatureResponse.data.data?.signatureId || signatureResponse.data.data?.id
      }));

      // Mark consent as accepted, hide consent form, and proceed with form submission
      setConsentAccepted(true);
      setShowConsentForm(false);
      toast.success('Agreement signed successfully!');

      // Proceed with form submission
      await postSubmit();
    } catch (error) {
      console.error('Error processing merchant consent:', error);

      // Extract detailed error message
      let errorMessage = 'Failed to process consent';
      if (error.response?.data) {
        errorMessage = error.response.data.details || error.response.data.error || error.response.data.message || error.message;
      } else {
        errorMessage = error.message;
      }

      toast.error(`Failed to process consent: ${errorMessage}`);
    }
  }, [guid, postSubmit]);

  /**
   * Handle consent rejection
   */
  const handleConsentRejected = useCallback(() => {
    setShowConsentForm(false);
    toast.error('You must accept the biometric consent to submit the merchant application.');
  }, []);

  // ===== EFFECTS =====
  
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  useEffect(() => {
    getJobTitlesData('/JobList.xlsx').then(data => {
      setJobTitles(data);
    });
  }, []);

  useEffect(() => {
    if (form['freeWareLicense'] === true) {
      // Remove the license flag immediately to prevent re-trigger
      const { freeWareLicense, ...restForm } = form;
      setForm(restForm);
      setShowPopup(false);
      postSubmit();
    }
  }, [form['freeWareLicense'], postSubmit]);

  // useEffect(() => {
  //   if (verifiedAddress && verifiedAddress.Obj && verifiedAddress.id === 'businessPhysicalAddress') {
  //     const address = verifiedAddress.Obj.address;
  //     setGuid(generateGUID('Merchant', address.state, address.county, '0000', '0001', address.label));
  //   }
  // }, [verifiedAddress]);

  useEffect(() => {
    if (isClient && guid && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('guid', guid);
      console.log('GUID generated and stored:', guid);
    }
  }, [guid, isClient]);

  // Tier validation effect
  useEffect(() => {
    if (form['tier1'] || form['tier2'] || form['tier3'] || form['tier4']) {
      const errors = runValidation('merchant_form', form, 'tier_type');
      setFormErrors(errors);
    }
  }, [form['tier1'], form['tier2'], form['tier3'], form['tier4']]);

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className='flex items-center justify-center w-full min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-2 text-gray-600'>Loading Merchant Form...</p>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (submitted) {
    return (
      <div className='flex flex-col items-center justify-center p-5 bg-gray-500 h-screen'>
        <div className='text-center max-w-2xl'>
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">
            Thank you for your merchant application!
          </h1>
          <div className='space-y-3 text-lg mb-6'>
            <p>Your merchant form has been submitted successfully.</p>
            <p>Your signage documents have been downloaded.</p>

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
          <p className='text-lg italic text-gray-700 mb-8'>
            Biometric protection at the SPEED of a SMILE. 😊
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* Biometric Consent Form - Shows when user clicks Submit */}
    {showConsentForm && (
      <MerchantConsent
        onConsentAccepted={handleConsentAccepted}
        onConsentRejected={handleConsentRejected}
        guid={guid || generateGUID('Merchant', 'Florida', 'Clay', '0000', '0001')}
        userName={`${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Merchant User'}
      />
    )}
    
    {/* Main Form */}
    <div className='flex-1 gap-5 py-10 px-10 bg-white'>
      <div className='flex flex-col bg-gray-200 px-5 py-10 rounded-sm'>
        {/* Header */}
        <div className='flex flex-col gap-2 mb-5'>
          <span>Please have the following info ready to complete your SignUp</span>
          <ul className='list-disc list-inside'>
            <li>EIN Number</li>
            <li>NAICS Number</li>
            <li>Name of your acquiring bank</li>
            <li>Name of your payment processor</li>
          </ul>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--primary)] text-center">
          Merchant Form
        </h1>

        {/* Business Information Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mt-5 mb-3' : 'grid grid-cols-3 mt-5 gap-3'}`}>
          {BUSINESS_INFO_FIELDS.map((field, index) => (
            reviewing ? (
              <div key={`business-field-${index}`} className='flex gap-2'>
                <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
              </div>
            ) : (
              <DynamicComponent
                key={`business-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
                setVerifiedAddress={setVerifiedAddress}
              />
            )
          ))}
        </div>

        {/* Mailing Address Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mb-10' : 'grid grid-cols-3 mt-5 gap-3'}`}>
          {reviewing ? (
            <div className='flex gap-2'>
              <label className='!text-sm font-semibold text-gray-700'>Mailing Address:</label>
              <span className='!text-sm text-gray-500 ml-1'>
                {form.sameAsPhysicalAddress ? 'Yes' : form.businessMailingAddress}
              </span>
            </div>
          ) : (
            <>
              <DynamicComponent
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label='Mailing Address Same as Physical Address?'
                id='sameAsPhysicalAddress'
                type='toggle'
                classes='!text-sm mt-[2px]'
                compiledBlockedTerms={compiledBlockedTerms}
              />
              <DynamicComponent
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label='Mailing Address'
                id='businessMailingAddress'
                type='hereGeoLocation'
                required={true}
                conditionalId='sameAsPhysicalAddress'
                condition='false'
                setFormErrors={setFormErrors}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            </>
          )}
        </div>

        {/* Contact Information Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3' : 'grid grid-cols-3 mt-5 gap-3'}`}>
          {CONTACT_INFO_FIELDS.map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`contact-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : (
                <div key={`contact-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`contact-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                placeholder={field.placeholder}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Owner Information Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3' : 'grid grid-cols-3 mt-5 gap-3'}`}>
          {OWNER_INFO_FIELDS.map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`owner-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : (
                <div key={`owner-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`owner-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                options={field.id === 'titleInBusiness' ? jobTitles : []}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Business Details Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mt-5 mb-4' : 'flex flex-col gap-6 !my-6'}`}>
          {[
            { id: 'siteUrl', label: 'Entity Website URL', type: 'text', required: false },
            { id: 'businessStructure', label: 'What is the Structure of your Business?', type: 'ddm', options: businessTypes, required: true },
            { id: 'areYouHomeBased', label: 'Are you a home based business?', type: 'toggle', required: true, classes: '!text-base' },
          ].map((field, index) => (
            reviewing ? (
              <div key={`business-detail-${index}`} className='flex gap-2'>
                <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
              </div>
            ) : (
              <DynamicComponent
                key={`business-detail-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                setFormErrors={setFormErrors}
                options={field.options || []}
                required={field.required}
                section='merchant_form'
                classes={field.classes || ''}
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Sales Information */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mb-4' : 'grid grid-cols-3 mt-1 gap-3'}`}>
          {[
            { id: 'noofEmployees', label: 'Number of Employees', type: 'ddm', options: numberOfEmployeesOptions, required: true },
            { id: 'salesPerMonth', label: 'What is your sales per month?', type: 'ddm', options: ['$0 – $3,000', '$3,000 – $10,000', '$10,000 – $40,000', '$40,000 – $75,000', '$75,000 – $100,000', '$100,000+'], required: true },
          ].map((field, index) => (
            reviewing ? (
              <div key={`sales-field-${index}`} className='flex gap-2'>
                <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
              </div>
            ) : (
              <DynamicComponent
                key={`sales-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                options={field.options}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Merchant Tier Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mb-10' : 'flex flex-col gap-6 !my-6'}`}>
          {[
            { type: 'sectionHeading', label: 'Are you?', required: true },
            { id: 'tier1', type: 'toggle', label: 'Tier 1: Any merchant processing over six million transactions annually', label2: '(6mil / 12 = 500,000 card transactions p/mo)', required: false },
            { id: 'tier2', type: 'toggle', label: 'Tier 2: Any merchant processing between one million and six million total transactions annually', label2: '(84,000 - 500,000 card transactions p/mo)', required: false },
            { id: 'tier3', type: 'toggle', label: 'Tier 3: Any merchant processing between twenty thousand and one million transactions annually', label2: '(1,700 - 84,000 card trans p/mo)', required: false },
            { id: 'tier4', type: 'toggle', label: 'Tier 4: Any merchant processing less than 20,000 transactions annually', label2: '(less than 1,700 card trans p/mo)', required: false },
            { id: 'merchantBank', label: 'What is the Name of your Acquiring Bank?', type: 'ddm', options: acquiringBank, required: true },
            { id: 'paymentProcessor', label: 'What is the Name of your Payment Processor?', type: 'ddm', options: paymentProcessors, required: true },
          ].map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`tier-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : field.type === 'toggle' ? (
                <div key={`tier-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id] ? 'Yes' : 'No'}</span>
                </div>
              ) : (
                <div key={`tier-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`tier-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                options={field.options || []}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
                label2={field.label2}
              />
            )
          ))}
        </div>

        {/* Account Manager Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mt-5 mb-10' : 'grid grid-cols-3 mt-1 gap-3'}`}>
          {[
            { type: 'sectionHeading', label: 'ACCOUNT MANAGER INFORMATION' },
            { label: 'Account manager\'s First Name', id: 'accountManagerFirstName', type: 'text', required: true },
            { label: 'Account manager\'s Last Name', id: 'accountManagerLastName', type: 'text', required: true },
            // { label: 'Account manager\'s physical Office address', id: 'accountManagerPhysicalAddress', type: 'text', required: true },
            { label: 'Account manager\'s telephone number', id: 'accountManagerTelephoneNumber', type: 'tel', required: true },
            { label: 'Account manager\'s business email address', id: 'accountManagerEmailAddress', type: 'email', required: true },
          ].map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`manager-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : (
                <div key={`manager-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`manager-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Business Industry Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mt-5 mb-10' : 'grid grid-cols-3 mt-1 gap-3'}`}>
          {[
            { type: 'sectionHeading', label: 'BUSINESS INFORMATION' },
            { label: 'What Industry best describes your business?', id: 'industry', type: 'ddm', options: industries, required: true },
            { label: 'What is your NAICS Code?', id: 'naicsNumber', type: 'text', required: true },
          ].map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`industry-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : (
                <div key={`industry-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`industry-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                options={field.options || []}
                required={field.required}
                section='merchant_form'
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* POS Information Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mb-3' : 'grid grid-cols-3 mt-1 gap-3'}`}>
          {[
            { type: 'sectionHeading', label: 'POINT OF SALE INFO' },
            { label: 'What is your estimated number of POS Terminals globally entity wide?', id: 'estimatedNumberOfPOSTerminals', outerClass: 'col-span-3', type: 'number', required: true },
            { label: 'Who is your POS Manufacturer?', id: 'posManufacturer', type: 'ddm', options: posSystems, required: true, outerClass: 'col-span-3' },
          ].map((field, index) => (
            reviewing ? (
              field.type === 'sectionHeading' ? (
                <h3 key={`pos-heading-${index}`} className='!text-lg font-semibold underline text-gray-800'>
                  {field.label}
                </h3>
              ) : (
                <div key={`pos-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`pos-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='mr-5'
                setFormErrors={setFormErrors}
                options={field.options || []}
                required={field.required}
                section='merchant_form'
                outerClass={field.outerClass || ''}
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
        </div>

        {/* Security and Compliance Section */}
        <div className={`${reviewing ? 'flex flex-col gap-3 mb-10' : 'flex flex-col !my-6'}`}>
          {[
            { label: 'Have you experienced an account data compromise? If yes, When?', id: 'experiencedAccountDataCompromise', type: 'date', required: false },
            { label: 'Do you use point of sale terminal hardware and software, or a PCI DSS Certified Internet Gateway Provider?', id: 'posHardwareSoftware', type: 'toggle', required: true },
            { label: 'If No, what third party software company/vendor did you purchase your POS application from?', id: 'thirdPartySoftwareCompany', type: 'text', required: true, conditionalId: 'posHardwareSoftware', condition: 'false' },
            { label: 'Version Number?', id: 'posVersionNumber', type: 'text', required: false },
            { label: 'Do your transactions process through any other third parties, web hosting companies or gateways?', id: 'thirdPartyWebHosting', type: 'toggle', required: true },
            { label: 'If yes, with whom?', id: 'thirdPartyWebHostingCompany', type: 'text', required: true, conditionalId: 'thirdPartyWebHosting', condition: true },
            { label: 'Do you or your vendor receive, pass, transmit or store the full cardholder number, electronically?', id: 'cardStoredByUser', type: 'toggle', required: true },
            { label: 'If yes, where is the card data stored?', id: 'cardDataStorage', type: 'ddm', options: categories, required: true, conditionalId: 'cardStoredByUser', condition: true },
            { label: 'Are you or your vendor PCI/DSS compliant?', id: 'vendorPCICompliant', type: 'toggle', required: true },
            { label: 'What is the name of your Qualified Security Assessor?', id: 'qualifiedSecurityAssessor', type: 'text', required: false, conditionalId: 'vendorPCICompliant', condition: true },
            { label: 'Date of Compliance', id: 'dateOfCompliance', type: 'date', required: true, conditionalId: 'vendorPCICompliant', condition: true },
            { label: 'Date of last scan', id: 'dateOfLastScan', type: 'date', required: true, conditionalId: 'vendorPCICompliant', condition: true },
          ].map((field, index) => (
            reviewing ? (
              field.type === 'toggle' ? (
                <div key={`security-field-${index}`} className='flex'>
                  <label className='block !text-sm font-semibold text-gray-700'>
                    {field.label}:
                    <span className='!text-sm font-normal text-gray-500 ml-3'>
                      {form[field.id] ? 'Yes' : 'No'}
                    </span>
                  </label>
                </div>
              ) : (
                <div key={`security-field-${index}`} className='flex gap-2'>
                  <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                  <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                </div>
              )
            ) : (
              <DynamicComponent
                key={`security-field-${index}`}
                form={form}
                setform={setForm}
                handleChange={handleChange}
                formErrors={formErrors}
                label={field.label}
                id={field.id}
                type={field.type}
                classes='!text-base'
                setFormErrors={setFormErrors}
                options={field.options || []}
                required={field.required}
                section='merchant_form'
                conditionalId={field.conditionalId}
                condition={field.condition}
                compiledBlockedTerms={compiledBlockedTerms}
              />
            )
          ))}
          
          {/* Description Text Area */}
          <TextAreaField
            id='ginicoeHelpDescription'
            label='Describe in Detail How Ginicoe Can Help You.'
            label2='Please provide any additional information that may be relevant to your application.'
            required={false}
            form={form}
            handleChange={handleChange}
            classes='mt-5'
            formErrors={formErrors}
          />
        </div>

        {/* Contact Information Section - continuing in next part due to length */}
        
        {/* Submit buttons */}
        <div className='flex justify-center gap-5 items-center mt-10'>
          {/* <button 
            className='bg-blue-500 text-white px-4 py-2 rounded-md'
            onClick={() => setReviewing(!reviewing)}
          >
            {reviewing ? 'Edit' : 'Review'}
          </button> */}
          
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Submit'}
          </button>
        </div>

        {/* License Agreement Popup */}
        <SignageDownloadPopup 
          file="/agreements/1_Merchant Click-Wrap.pdf" 
          id='freeWareLicense' 
          form={form} 
          setform={setForm} 
          show={showPopup} 
          label="Merchant Freeware License" 
          onClose={() => setShowPopup(false)} 
        />
        
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </div>
    </>
  );
}