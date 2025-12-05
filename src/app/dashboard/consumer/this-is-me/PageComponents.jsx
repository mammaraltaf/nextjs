'use client'
import React, {  useEffect, useRef, useState, useMemo } from 'react'
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRightCircle, ChevronDown, Eye } from 'lucide-react';
import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import ConsentForm from './Subforms/Form_Consent';
import DialogBox from '@/app/PageComponents/DialogBox';
import { 
  consumerProgressTackers, 
  referralSources,
} from '@/app/Resources/Variables';
import { runValidation } from '@/app/Resources/ValidationFunctions';
import { useRecaptcha } from '@/app/hooks/useRecaptcha';

// Importing all the subforms for the consumer dashboard
// These subforms are used to collect various information from the user

import Form_Predigree from './Subforms/Form_Predigree.jsx';
import Form_FaceRecognition from './Subforms/Form_FaceRecognition';
import Form_Address from './Subforms/Form_Address';
import Form_GenderIdentity from './Subforms/Form_GenderIdentity';
import Form_Ethinicity from './Subforms/Form_Ethinicity';
import Form_Neighbourhood from './Subforms/Form_Neighbourhood';
import Form_Employment from './Subforms/Form_Employment';
import Form_CardInfo from './Subforms/Form_CardInfo';

// Importing the components for the consumer dashboard
import Submitted from './SubElements/Submitted';
import ProgressTracker from './SubElements/ProgressTracker';
import { compileBlockedTerms, loadBlockedTerms, SanitizeInput } from '@/app/Resources/SanitizingFunctions';
import ShowLiveTutorial from '@/app/PageComponents/ShowLiveTutorial';
import {steps } from '@/app/Resources/Variables'
import { generateGUID } from '@/app/Resources/GuidFunctions';
import AgreementSigningSystem from '@/app/PageComponents/AgreementSigningSystem';

export default function PageComponents() {
  // State variables for managing form state, errors, and other UI elements
  const [formState, setFormState] = useState(0)
  const [compiledBlockedTerms, setCompiledBlockedTerms] = useState('');
  const [formErrors, setFormErrors] = useState({})
  const [addCardError, setAddCardError] = useState('');
  const fieldRefs = useRef({});
  const [form, setForm] = useState({
  })
  const [reviewIndex, setReviewIndex] = useState(null); // Index of the section being reviewed
  const [formSubmitted, setFormSubmitted] = useState(false); // Flag to indicate if the form has been submitted
  const [deleteCard, setDeleteCard] = useState(null); // Index of the card to be deleted
  const [showTutorial, setShowTutorial] = useState(false); // Show tutorial overlay
  const [currentStep, setCurrentStep] = useState(0); // Current step in the tutorial
  const [verifiedAddress, setVerifiedAddress] = useState({}); // Object to hold verified address data
  const [guid, setGuid] = useState(''); // GUID for the consumer
  const [showAgreementModal, setShowAgreementModal] = useState(false); // Show agreement signing modal
  
  // Auto-advance settings
  // Set to true if you want the tutorial to auto-advance through steps
  const autoAdvance = false; // set to true if you want automatic step changes
  const stepInterval = 5000; // 5 seconds
  
  // reCAPTCHA integration
  const { executeRecaptcha, waitForRecaptcha, isReady: recaptchaReady } = useRecaptcha();

  // Memoized GUID generation based on user's name (similar to healthcare form)
  const generatedGuid = useMemo(() => {
    if (form.firstName && form.lastName) {
      return generateGUID('Consumer', 'Florida', 'Clay', '0000', '0001');
    }
    return '';
  }, [form.firstName, form.lastName]);

  // Effect to update the main guid state when generatedGuid changes
  useEffect(() => {
    if (generatedGuid && generatedGuid !== guid) {
      setGuid(generatedGuid);
    }
  }, [generatedGuid, guid]);

  // Function to handle changes in form fields
  const handleChange = (e, index) => {
    let { id, value } = e.target;
    // Check for SQL Injection
    value = SanitizeInput(value, compiledBlockedTerms);
    let rawValue = value;
    let formatted = value;
    let updatedData = { };
    // Handle card_info section separately
    if (formState === 8 || reviewIndex === 8) {
          if (id.startsWith('card_number')) {
          let rawValue = value.replace(/\D/g, '').slice(0, 16);
          let formatted = rawValue;
          if (rawValue.length > 12) {
            formatted = `${rawValue.slice(0, 4)}-${rawValue.slice(4, 8)}-${rawValue.slice(8, 12)}-${rawValue.slice(12)}`;
          } else if (rawValue.length > 8) {
            formatted = `${rawValue.slice(0, 4)}-${rawValue.slice(4, 8)}-${rawValue.slice(8)}`;
          } else if (rawValue.length > 4) {
            formatted = `${rawValue.slice(0, 4)}-${rawValue.slice(4)}`;
          }
          formatted = formatted.replace(/-$/, '');

          setForm((prev) => ({
            ...prev,
            card_info: prev.card_info.map((c, i) =>
              i === index ? { ...c, [id]: formatted } : c
            )
          }));
          updatedData = { ...form, card_info: form.card_info.map((c, i) => i === index ? { ...c, [id]: formatted } : c) };
        }else if (id.startsWith('nick_name') || id.startsWith('primary_card_holder_first_name') || id.startsWith('primary_card_holder_last_name')) {
          formatted = value.replace(/[^a-zA-Z0-9 ]/g, '');
          setForm((prev) => ({
            ...prev,
            card_info: prev.card_info.map((c, i) =>
              i === index ? { ...c, [id]: formatted } : c
            )
          }));
          updatedData = { ...form, card_info: form.card_info.map((c, i) => i === index ? { ...c, [id]: formatted } : c) };
        }

        const error = runValidation('card_info', updatedData);
        const fieldError = error?.card_info?.[index]?.[id] || '';

        // Clone existing errors
          let prevCardErrors = [...(formErrors?.card_info || [])];
        //console.log('prevCardErrors', prevCardErrors);
        // Ensure object at index
        if (!prevCardErrors[index]) {
          prevCardErrors[index] = {};
        }
        
        // Update or remove specific field error
        if (fieldError) {
          prevCardErrors[index][id] = fieldError;
        } else {
          delete prevCardErrors[index][id];
          if (Object.keys(prevCardErrors[index]).length === 0) {
            prevCardErrors[index] = {};
          }
        }

        // Check if all card error entries are empty
        //console.log('prevCardErrors', prevCardErrors);
        prevCardErrors = prevCardErrors.map((entry) => entry? Object.keys(entry).length > 0? entry:{}: {});
        const hasAnyCardError = prevCardErrors.some((entry) => Object.keys(entry).length > 0);
        
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          if (hasAnyCardError) {
            newErrors.card_info = prevCardErrors;
          } else {
            delete newErrors.card_info; // ⛔ Remove card_info if all are clear
          }
          return newErrors;
        });
      }
    // Handle other sections
    else{
          switch (id) {
            case 'socialSecurityNumber':
            case 'verifySocialSecurityNumber':
              // Validate Social Security Number format (e.g., XXX-XX-XXXX)
              rawValue = value.replace(/\D/g, '').slice(0, 9); // max 9 digits
              // Format to XXX-XX-XXXX
              formatted = rawValue;
              if (rawValue.length > 5) {
                formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5)}`;
              } else if (rawValue.length > 3) {
                formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
              }
              updatedData = { ...form, [id]: formatted };
              if (id === 'socialSecurityNumber' && rawValue.length === 9) {
                  fieldRefs.current['verifySocialSecurityNumber']?.focus();
                }
              break;
            default:
                if(formState!==8){
                  updatedData = { ...form, [id]: value };
                }
                break;
          }
        setForm(updatedData);
        const error = runValidation(consumerProgressTackers[formState][0], updatedData, formState===9?null: id);
        if(formState===9){
          setFormErrors({ ...error})
        }else{
          setFormErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (!error[id]) {
              // If field is now valid, remove its error
              delete newErrors[id];
            } else {
              newErrors[id] = error[id]; // If error exists, update it
            }
            return newErrors;
          });
        }
    }
  };
  // Function to handle agreement acceptance (called from consent form)
  const handleAgreementAccepted = async (agreementData) => {
    try {
      console.log('Agreement accepted:', agreementData);
      
      // Save agreement signature to database
      const agreementResponse = await axios.post('/api/save-agreement-signature', agreementData);
      
      if (!agreementResponse.data.success) {
        throw new Error(`Failed to save agreement signature: ${agreementResponse.data.error}`);
      }
      
      console.log('Agreement signature saved:', agreementResponse.data);
      
      // Note: Form submission will continue automatically after agreement is signed
      // No need to call postSubmit() here as it's handled by the consent form
    } catch (error) {
      console.error('Error saving agreement signature:', error);
      toast.error('Failed to save agreement signature. Please try again.');
    }
  };

  // Function to handle form submission and verify reCAPTCHA
  const postSubmit = async () => {
    try {
      // Step 1: Wait for reCAPTCHA to be ready
      console.log('Consumer form: Waiting for reCAPTCHA...');
      await waitForRecaptcha();

      // Step 2: Execute reCAPTCHA v3 (invisible to user)
      // This analyzes user behavior and generates a risk score
      console.log('Consumer form: Executing reCAPTCHA...');
      const token = await executeRecaptcha('consumer_form');
      
      if (!token) {
        throw new Error('Failed to get reCAPTCHA token');
      }
      console.log('Consumer form: reCAPTCHA token:', token);
      
      const verifyResponse = await axios.post('/api/verify-recaptcha', {
        token
      });
      console.log('Consumer form: Verify response:', verifyResponse.data);

      if (!verifyResponse.data.success) {
        throw new Error(`Security verification failed: ${verifyResponse.data.error}`);
      }

      // Check reCAPTCHA score threshold (must be > 0.5)
      if (verifyResponse.data.score <= 0.5) {
        throw new Error('Security verification failed: reCAPTCHA score too low');
      }

      console.log(`Consumer form reCAPTCHA verification successful. Score: ${verifyResponse.data.score}`);

      // Step 3: Create FormData object and append form data and files
      const formData = new FormData();
      console.log(generatedGuid);
      
      // Add form data as JSON string
      formData.append('formData', JSON.stringify({
        ...form,
        recaptchaScore: verifyResponse.data.score,
        guid: guid || generatedGuid // Use generatedGuid as fallback if guid is empty
      }));

      // Add income documentation files if they exist
      if (form.incomeDocumentation && Array.isArray(form.incomeDocumentation)) {
        form.incomeDocumentation.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`file_${index}`, file);
          }
        });
      }

      // Add multi-racial couple documentation files if they exist
      if (form.multiRacialDocumentation && Array.isArray(form.multiRacialDocumentation)) {
        form.multiRacialDocumentation.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`multi_racial_file_${index}`, file);
          }
        });
      }

      // Add impairment documentation files if they exist
      if (form.impairmentDocumentation && Array.isArray(form.impairmentDocumentation)) {
        form.impairmentDocumentation.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`impairment_file_${index}`, file);
          }
        });
      }

      // Step 4: Submit form data with files using axios
      const submissionResponse = await axios.post('/api/submit-consumer-form', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!submissionResponse.data.success) {
        throw new Error(`Database save failed: ${submissionResponse.data.error}`);
      }

      // Step 5: Submit credit cards if any exist
      if (form.card_info && Array.isArray(form.card_info) && form.card_info.length > 0) {
        console.log('Submitting credit cards to external API...');
        try {
          const cardSubmissionResponse = await axios.post('/api/submit-credit-cards', {
            guid: guid || generatedGuid,
            cards: form.card_info
          });

          if (cardSubmissionResponse.data.success) {
            console.log('All credit cards submitted successfully:', cardSubmissionResponse.data);
          } else if (cardSubmissionResponse.data.partialSuccess) {
            console.warn('Some credit cards failed to submit:', cardSubmissionResponse.data);
            toast.warning(`${cardSubmissionResponse.data.summary.successful} of ${cardSubmissionResponse.data.summary.total} cards submitted successfully`);
          } else {
            console.error('Credit card submission failed:', cardSubmissionResponse.data);
            toast.error('Failed to submit credit cards. Form data saved successfully.');
          }
        } catch (cardError) {
          console.error('Error submitting credit cards:', cardError);
          toast.warning('Form submitted but credit card submission encountered errors');
        }
      }

      toast.success('Form submitted successfully!');

      // Step 6: Mark as successfully submitted
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error in consumer form postSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast.error(`Submission failed: ${errorMessage}`);
    }
  }

  // Following function handles the form submission and navigation between sections
  const handleSaveAndContinue = (direction) => {
  // Handle back navigation
    if (direction === -1) {
      setFormErrors({});
      setFormState((prev) => {
        const newState = prev + direction;
        return newState >= 0 ? newState : prev;
      });
      return;
    }

    const currentSection = consumerProgressTackers[formState][0];
    
    const errors = runValidation(formState === 8 ? 'card_info' : formState === 9 ? 'Review & Edit' : currentSection, form);
    // Special handling for card_info section
    if ((formState === 8 || formState === 9 ) && errors.card_info) {
      const hasCardErrors = errors.card_info.some(
        (card) => card && Object.keys(card).length > 0
      );

      if (hasCardErrors) {
        setFormErrors({ card_info: errors.card_info });
        return;
      }

      // All cards valid — remove card_info errors
      delete errors.card_info;
    }
    // Handle standard validation failure
    console.log('Errors:', errors);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    // Proceed to next step
    setFormErrors({});
    setFormState((prev) => {
      const newState = prev + direction;
      return newState < consumerProgressTackers.length ? newState : prev;
    });
    if(formState === 10){
      // Directly submit the form since agreement is now handled in step 2
      postSubmit();
    }
  };

  // Effect to run validation when formState changes, specifically for the Review & Edit section
  useEffect(()=>{
    if(formState === 9 ){
      const errors = runValidation('Review & Edit', form);
      setFormErrors(errors);
    }
  },[form])

  // Handle cloud storage file picker after OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const dropboxToken = urlParams.get('dropbox_token');
    const googleToken = urlParams.get('google_token');
    const onedriveToken = urlParams.get('onedrive_token');

    console.log('OAuth callback detected:', { action, dropboxToken: !!dropboxToken, googleToken: !!googleToken, onedriveToken: !!onedriveToken });

    if (action === 'open_dropbox_picker' && dropboxToken) {
      console.log('Opening Dropbox picker with token');
      // Wait a bit for SDK to load, then open picker
      setTimeout(() => {
        openDropboxPicker(dropboxToken);
      }, 1000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (action === 'open_google_picker' && googleToken) {
      console.log('Opening Google Drive picker with token');
      setTimeout(() => {
        openGooglePicker(googleToken);
      }, 1000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (action === 'open_onedrive_picker' && onedriveToken) {
      console.log('Opening OneDrive picker with token');
      setTimeout(() => {
        openOneDrivePicker(onedriveToken);
      }, 1000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load cloud storage SDKs
  useEffect(() => {
    // Load Dropbox SDK
    const dropboxScript = document.createElement('script');
    dropboxScript.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    dropboxScript.id = 'dropboxjs';
    dropboxScript.setAttribute('data-app-key', process.env.NEXT_PUBLIC_DROPBOX_APP_KEY);
    document.body.appendChild(dropboxScript);

    // Load Google API
    const googleScript = document.createElement('script');
    googleScript.src = 'https://apis.google.com/js/api.js';
    document.body.appendChild(googleScript);

    // Load OneDrive SDK
    const onedriveScript = document.createElement('script');
    onedriveScript.src = 'https://js.live.net/v7.2/OneDrive.js';
    document.body.appendChild(onedriveScript);

    return () => {
      // Cleanup scripts if needed
      document.getElementById('dropboxjs')?.remove();
      document.querySelector('script[src="https://apis.google.com/js/api.js"]')?.remove();
      document.querySelector('script[src="https://js.live.net/v7.2/OneDrive.js"]')?.remove();
    };
  }, []);

  // Open Dropbox file picker using Chooser
  const openDropboxPicker = (accessToken) => {
    console.log('Opening Dropbox Chooser');
    
    if (!window.Dropbox) {
      console.error('Dropbox SDK not loaded');
      toast.error('Dropbox Chooser not loaded. Please refresh the page and try again.');
      return;
    }

    // Use Dropbox Chooser directly
    window.Dropbox.choose({
      success: function(files) {
        console.log('Dropbox files selected:', files);
        
        // Convert Dropbox files to our format
        const convertedFiles = files.map(file => ({
          name: file.name,
          size: file.bytes,
          type: file.name.split('.').pop(), // Get extension as type
          url: file.link,
          id: file.id,
          source: 'dropbox',
          thumbnailLink: file.thumbnailLink,
          icon: file.icon
        }));
        
        console.log('Converted files:', convertedFiles);
        toast.success(`${files.length} file(s) selected from Dropbox`);
        
        // TODO: Pass these files to your upload handler
        // For now, just log them
      },
      cancel: function() {
        console.log('Dropbox Chooser cancelled');
        toast.info('File selection cancelled');
      },
      linkType: "direct", // Use direct links for downloading
      multiselect: true,
      extensions: ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'],
      folderselect: false
    });
  };

  // Open Google Drive file picker
  const openGooglePicker = (accessToken) => {
    if (window.gapi) {
      window.gapi.load('auth2:picker', function() {
        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .addView(google.picker.ViewId.PHOTOS)
          .setOAuthToken(accessToken)
          .setCallback(function(data) {
            if (data.action === google.picker.Action.PICKED) {
              console.log('Google Drive files selected:', data.docs);
              // Convert to standard format and handle
              const convertedFiles = data.docs.map(file => ({
                name: file.name,
                size: file.sizeBytes || 0,
                type: file.mimeType || 'application/octet-stream',
                url: file.url,
                source: 'google_drive'
              }));
              // You can add logic here to handle the selected files
              toast.success(`${data.docs.length} file(s) selected from Google Drive`);
            }
          })
          .build();
        
        picker.setVisible(true);
      });
    }
  };

  // Open OneDrive file picker
  const openOneDrivePicker = (accessToken) => {
    if (window.OneDrive) {
      window.OneDrive.open({
        clientId: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID,
        action: 'query',
        multiSelect: true,
        viewType: 'files',
        queryParameters: 'select=id,name,size,file,folder,parentReference,downloadUrl',
        success: function(files) {
          console.log('OneDrive files selected:', files);
          // Convert to standard format and handle
          const convertedFiles = files.map(file => ({
            name: file.name,
            size: file.size || 0,
            type: file.file?.mimeType || 'application/octet-stream',
            url: file.downloadUrl,
            source: 'onedrive'
          }));
          // You can add logic here to handle the selected files
          toast.success(`${files.length} file(s) selected from OneDrive`);
        },
        cancel: function() {
          console.log('OneDrive picker cancelled');
        },
        error: function(error) {
          console.error('OneDrive picker error:', error);
          toast.error('Failed to open OneDrive file picker');
        }
      });
    }
  };

  // Effect to load and compile blocked terms for sanitization
  useEffect(() => {
      loadBlockedTerms().then(terms => {
          let compiledTerms = compileBlockedTerms(terms);
          setCompiledBlockedTerms(compiledTerms); // compile once here
      });
  }, []);

  // Effect to auto-advance through tutorial steps if enabled
  useEffect(() => {
      if (!autoAdvance || !showTutorial) return;
  
      const interval = setInterval(() => {
        setCurrentStep((prev) =>
          prev < steps.length - 1 ? prev + 1 : prev
        );
      }, stepInterval);
  
      return () => clearInterval(interval);
    }, [autoAdvance, showTutorial]);

  // Effect to handle verified address changes
  useEffect(() => {
      if(verifiedAddress && verifiedAddress.Obj && verifiedAddress.id=== 'current_us_address') {
          let address = verifiedAddress.Obj.address;
          setGuid(generateGUID('Consumer',address.state,address.county,'0000', '0001',address.label))
      }
  }, [verifiedAddress]);
  
  useEffect(() => {
        console.log('GUID generated:', guid);
        localStorage.setItem('guid', guid);
      }, [guid]);    
  return (
    <>
    {showTutorial && <ShowLiveTutorial steps={steps} currentStep={currentStep} setShowTutorial={setShowTutorial} setCurrentStep={setCurrentStep} />}
    
    {/* Agreement Signing Modal - Now handled in ConsentForm (step 2) */}
    
    <div className='flex bg-gray-100 w-full h-screen'>
      {
        deleteCard!==null &&
        <DialogBox 
          message={`Are you sure you want to delete the cardnumber ${deleteCard+1}?`}
          onClose={()=>{
            setForm((prev) => {
                  const newCardInfo = prev.card_info
                    .filter((_, i) => i !== deleteCard) // Remove the item at the clicked index
                  return {
                    ...prev,
                    card_info: newCardInfo
                  };
                });
                setDeleteCard(null);
          }}
          onCancel={() => setDeleteCard(null)}
        />
      }
       {
        !formSubmitted?
        <div className='flex gap-4 px-2 py-10 w-full'>
          <ProgressTracker formState={formState} setFormState={setFormState} />
          <div className='flex w-full flex-col relative'>
          {
              formState === 0?
                <Form_Predigree
                      formState={formState}
                      form={form}
                      setForm={setForm}
                      formErrors={formErrors}
                      setFormErrors={setFormErrors}
                      fieldRefs={fieldRefs}
                      handleChange={handleChange}
                />:
              formState === 1?
                <ConsentForm 
                  form={form} 
                  setForm={setForm} 
                  setFormState={setFormState} 
                  formState={formState}
                  guid={guid || generatedGuid}
                  onAgreementAccepted={handleAgreementAccepted}
                />:
              formState === 2?
                <Form_FaceRecognition form={form} setForm={setForm} setFormState={setFormState} setShowTutorial={setShowTutorial} setCurrentStep={setCurrentStep} formState={formState} />
              : 
              formState === 3?
                <Form_Address 
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  setFormErrors={setFormErrors}
                  formErrors={formErrors}
                  handleChange={handleChange}
                  setVerifiedAddress={setVerifiedAddress}
                />:
              formState === 4?
                <Form_GenderIdentity
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleChange={handleChange}
                />:
              formState === 5?
                <Form_Ethinicity
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleChange={handleChange}
                />:
              formState === 6?
                <Form_Neighbourhood
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                />:
              formState === 7?
                <Form_Employment
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleChange={handleChange}
                />:
              formState === 8?
                <Form_CardInfo 
                  formState={formState}
                  form={form}
                  setForm={setForm}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  handleChange={handleChange}
                  setDeleteCard={setDeleteCard}
                  addCardError={addCardError}
                />
              :
              formState === 9?
              <div className='flex-1 relative mr-3  px-4 py-5 bg-white'>
                  <h3 className='text-lg mb-4 font-semibold text-[var(--primary)]'>{consumerProgressTackers[formState]}</h3>
                  {
                    consumerProgressTackers.slice(0,9).map((tracker, trackerIndex) => (
                      <div className='w-full' key={trackerIndex}>
                        <div className={`flex w-full items-center cursor-pointer hover:border-blue-500 transition-colors duration-300 px-2 py-3 border ${trackerIndex!==8 ? 'border-b-transparent' : ''} border-gray-200`} key={trackerIndex}
                          onClick={() => setReviewIndex(reviewIndex === trackerIndex ? null : trackerIndex)}
                          >
                            <div className='flex w-full items-center justify-between gap-2'>
                              <span className='flex gap-3 text-gray-600 text-xs font-bold'>
                                {tracker}
                                {
                                  trackerIndex === 0 ? (
                                    Object.keys(formErrors['my_pedigree_info'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['my_pedigree_info'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) : 
                                  trackerIndex === 1 ? (
                                    Object.keys(formErrors['consent_form'] || {}).length > 0 || !form['consent'] ? (
                                      <span className='text-red-500'>
                                        You must agree to the consent terms
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Agreed !</span>
                                    )
                                  ) : 
                                  trackerIndex === 2 ? (
                                    Object.keys(formErrors['my_face_recognition'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['my_face_recognition'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 3 ? (
                                    Object.keys(formErrors['address'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['address'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 4 ? (
                                    Object.keys(formErrors['gender_identity_information'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['gender_identity_information'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 5 ? (
                                    Object.keys(formErrors['ethnicity_information'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['ethnicity_information'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 6 ? (
                                    Object.keys(formErrors['my_neighbours_are'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['my_neighbours_are'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 7 ? (
                                    Object.keys(formErrors['employment_information'] || {}).length > 0 ? (
                                      <span className='text-red-500'>
                                        {Object.keys(formErrors['employment_information'] || {}).length} Error(s)
                                      </span>
                                    ) : (
                                      <span className='text-green-500 italic'>Complete !</span>
                                    )
                                  ) :
                                  trackerIndex === 8 ? 
                                  <div className="text-sm">
                                              {(() => {
                                                const cardInfoErrors = formErrors?.card_info;

                                                // Determine error count whether card_info is object or array of objects
                                                const errorCount = Array.isArray(cardInfoErrors)
                                                  ? cardInfoErrors.reduce((acc, errObj) => acc + Object.keys(errObj || {}).length, 0)
                                                  : typeof cardInfoErrors === 'object' && cardInfoErrors !== null
                                                    ? Object.keys(cardInfoErrors).length
                                                    : 0;

                                                // Conditional rendering based on error count
                                                if (errorCount > 0) {
                                                  return (
                                                    <span className="text-red-500 text-xs">
                                                      {errorCount} Error(s)
                                                    </span>
                                                  );
                                                } else {
                                                  return (
                                                    <span className="text-green-500 italic text-xs">
                                                      Complete !
                                                    </span>
                                                  );
                                                }
                                              })()}
                                            </div>
                                            :
                                  null
                                }

                              </span>
                              {
                                trackerIndex === 1?
                                <Eye className='w-5 h-5 text-gray-500' />:
                                <ChevronDown className={`w-5 h-5 text-gray-500 ${reviewIndex === trackerIndex ? 'transform rotate-180' : ''}`} />
                              }
                            </div>
                          </div>
                          {
                            reviewIndex === trackerIndex && trackerIndex === 0?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                                <Form_Predigree
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                fieldRefs={fieldRefs}
                                handleChange={handleChange}
                                showHeading={false}
                              />
                            </div>:
                            reviewIndex === trackerIndex && trackerIndex === 1?
                            <ConsentForm 
                              form={form} 
                              setForm={setForm} 
                              setReviewIndex={setReviewIndex} 
                              setFormState={setFormState} 
                              showHeading={false}
                              guid={guid || generatedGuid}
                              onAgreementAccepted={handleAgreementAccepted}
                            />:
                            reviewIndex === trackerIndex && trackerIndex === 2?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                                <Form_FaceRecognition
                                  formState={formState}
                                  form={form}
                                  setForm={setForm}
                                  formErrors={formErrors}
                                  setFormErrors={setFormErrors}
                                  fieldRefs={fieldRefs}
                                  handleChange={handleChange}
                                />
                            </div>:
                            reviewIndex === trackerIndex && trackerIndex === 3?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                              <Form_Address
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                fieldRefs={fieldRefs}
                                handleChange={handleChange}
                              />
                            </div>:
                            reviewIndex === trackerIndex && trackerIndex === 4?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                              <Form_GenderIdentity
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                fieldRefs={fieldRefs}
                                handleChange={handleChange}
                              />
                            </div>:
                            reviewIndex === trackerIndex && trackerIndex === 5?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                                <Form_Ethinicity
                                  formState={formState}
                                  form={form}
                                  setForm={setForm}
                                  formErrors={formErrors}
                                  setFormErrors={setFormErrors}
                                  fieldRefs={fieldRefs}
                                  handleChange={handleChange}
                                />
                              </div>:
                            reviewIndex === trackerIndex && trackerIndex === 6?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                              <Form_Neighbourhood
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                              />
                              </div>:
                            reviewIndex === trackerIndex && trackerIndex === 7?
                            <div className='flex border border-transparent border-r-gray-200 border-l-gray-200 pb-4'>
                              <Form_Employment
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                handleChange={handleChange}
                              />
                            </div>:
                            reviewIndex === trackerIndex && trackerIndex === 8?
                            <div className='flex border border-transparent border-b-gray-200 border-r-gray-200 border-l-gray-200 pb-4'>
                              <Form_CardInfo
                                formState={formState}
                                form={form}
                                setForm={setForm}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                handleChange={handleChange}
                                setDeleteCard={setDeleteCard}
                              />
                            </div>:
                            null
                          }
                      </div>
                    ))
                  }
              </div>
              :
              formState === 10?
              <div className='flex-1 relative mr-3  px-4 py-5 bg-white'>
                <h3 className='text-lg mb-4 font-semibold text-[var(--primary)]'>{consumerProgressTackers[formState]}</h3>
                <div className='flex flex-col'>
                  <p className='text-gray-600 mb-1'>Please select your source:
                    <span className='text-red-500 font-bold'>*</span>
                  </p>
                  <DropDownMenu 
                  id={'how_did_you_hear_about_us'} 
                  form={form} 
                  setform={setForm} 
                  options={referralSources} 
                  formState={formState}
                  setFormErrors={setFormErrors}
                  />
                  <div className='text-red-500 text-xs'>
                    {formErrors['how_did_you_hear_about_us']}
                  </div>
                  {
                    form['how_did_you_hear_about_us'] === 'Other' ?
                    <div className='flex gap-1 my-2 flex-col'>
                      <label className='text-gray-600'>Please specify:
                        <span className='text-red-500 font-bold'>*</span>
                      </label>
                      <input 
                        type='text' 
                        id='other_source'
                        value={form.other_source || ''}
                        onChange={handleChange}
                        className='border border-gray-300 rounded px-2 py-1'
                      />
                      <div className='text-red-500 text-xs'>
                        {formErrors['other_source']}
                      </div>
                    </div> :
                    null
                  }
                </div>
              </div>:
              null
          }
          <div className={`flex justify-between relative mr-3 px-4 py-5 bg-white`}>
            {/*<button className='flex gap-2 items-center bg-blue-500 text-white hover:cursor-pointer px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-200'*/}
            {/*  onClick={()=>{alert('This feature is not implemented yet!')}}*/}
            {/*  >*/}
            {/*    Save & Return Later*/}
            {/*</button>*/}
            <button className='flex gap-2 items-center bg-blue-500 hover:cursor-pointer text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-200'
                onClick={()=>{
                  if(formState === 8 && !form.card_info?.length ){
                    setAddCardError('You must add at least one card before proceeding.');
                    return;
                  }
                  handleSaveAndContinue(1)}
                  
                }
                >
                    Save & Continue
                    <ArrowRightCircle className='w-5 h-5' />
            </button>
          </div>
          </div>
        </div>:
        <Submitted guid={guid} />
      }
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </>
  )
}