'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicComponent from '@/app/PageComponents/DynamicComponent'
import { formatPhoneNumber, scrollToError } from '@/app/Resources/functions'
import { 
    bankJobTitles, 
    financialInstitutionOptions, 
    financialServices, 
    financialSizeOptions, 
    getFinancialInstitutionsData, 
    transactionRanges 
} from '@/app/Resources/Variables'
import SignageDownloadPopup from '@/app/PageComponents/SignageDownloadPopup'
import { runValidation } from '@/app/Resources/ValidationFunctions'
import { compileBlockedTerms, loadBlockedTerms, SanitizeInput, sanitizeSQLInjection } from '@/app/Resources/SanitizingFunctions'
import TextAreaField from '@/app/PageComponents/TextAreaField'
import { generateGUID } from '@/app/Resources/GuidFunctions'
import { useRecaptcha } from '@/app/hooks/useRecaptcha'

// This component is used to render the financial institutions form and handle its logic
// It includes form validation, file downloads, and dynamic field rendering based on user input
export default function PageComponents() {
    const [showPopup, setShowPopup] = useState(false);
    const [reviewing, setReviewing] = useState(false)
    const [compiledBlockedTerms, setCompiledBlockedTerms] = useState('');
    const [verifiedAddress, setVerifiedAddress] = useState({});
    const [guid, setGuid] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firstRender = useRef(true);
    const hasSubmitted = useRef(false); // Track if form has been submitted
    const [formErrors, setFormErrors] = useState({})
    const [institutions, setInstitutions] = useState({});

    
    // Use the reCAPTCHA hook
    const { executeRecaptcha, isLoading: recaptchaLoading } = useRecaptcha();
    
    // Initialize form state with proper structure
    const [form, setform] = useState(() => ({
        financialInstitutionsSelected: financialInstitutionOptions.map(option => ({ 
            id: option.id, 
            value: false 
        })),
        financialServicesSelected: financialServices.map(service => ({ 
            id: service.id, 
            value: false 
        }))
    }));
    
    const filesToDownload = [
            {
                path: '/agreements/c_Bank%20Signage%20small.docx',
                name: 'c_Bank Signage small.docx',
            },
            {
                path: '/agreements/b_Bank%20Signage%20Large.docx',
                name: 'b_Bank Signage Large.docx',
            },
    ];
    // function to download multiple files sequentially
    // This function creates a link for each file and triggers the download
    const downloadMultipleFiles = () => {
        console.log('Starting multiple file download...');

        filesToDownload.forEach((file, index) => {
            setTimeout(() => {
            const link = document.createElement('a');
            link.href = file.path; // MUST start from root, not /public
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`Downloaded: ${file.name}`);
            }, index * 300); // Small delay to avoid browser blocking
        });
    };
    // handleChange function to update form state based on input changes
    const handleChange = useCallback((e) => {
        let { id, value } = e.target;
        const isPortfolioSizeField = id.startsWith('portfolioSize-');
        value = id !== 'ginicoeHelpDescription' ? sanitizeSQLInjection(value) : value;
        
        switch (id) {
            case 'firstName':
            case 'lastName':
                // Remove all digits & special characters from the input
                value = value.replace(/[^\w\s]/gi, '');
                setform((prev) => ({ ...prev, [id]: value }));
                break;
                
            case isPortfolioSizeField ? id : 'portfolioSize':
                const key = id.replace('portfolioSize-', '');
                setform(prev => ({
                    ...prev,
                    portfolioSizes: {
                        ...prev.portfolioSizes,
                        [key]: value
                    }
                }));
                break;
                
            case 'telephone':
            case 'faxNumber':
            case 'alternateTelephoneNumber':
            case 'alternateFaxNumber':
            case 'mobileNumber':
                value = formatPhoneNumber(value);
                setform((prev) => ({ ...prev, [id]: value }));
                break;
                
            case 'binNumber':
                // Remove all non-numeric characters from the input, max length is 8 digits
                value = value.replace(/\D/g, '').slice(0, 8);
                setform((prev) => ({ ...prev, [id]: value }));
                break;
                
            default:
                setform((prev) => ({ ...prev, [id]: value }));
                break;
        }
        
        // Run validation for the changed field
        const updatedForm = { ...form, [id]: value };
        const errors = runValidation('bank_form', updatedForm, id);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [id]: errors[id] || '',
        }));
    }, [form]);
    // postSubmit function to handle form submission after captcha verification
    const postSubmit = useCallback(async () => {
        setIsSubmitting(true);
        try {
            const token = await executeRecaptcha('financial_institution_form');
            
            if (token) {
                // Step 3: Verify reCAPTCHA token with our backend using axios (simple verification)
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

                // Step 4: Sanitize form data
                let sanitizedForm = {};
                for (const key in form) {
                    if (form.hasOwnProperty(key) && typeof form[key] === 'string') {
                        sanitizedForm[key] = SanitizeInput(form[key], compiledBlockedTerms);
                    } else {
                        sanitizedForm[key] = form[key];
                    }
                }
                
                // Prepare the final form data for submission
                const submissionGuid = guid || generateGUID('Financial Institution', 'Unknown State', 'Unknown County', '0000', '0001');
                const submissionData = {
                    ...sanitizedForm,
                    submittedAt: new Date().toISOString(),
                    ipAddress: null // Will be set by the API
                };
                
                // Submit the form data using axios
                // Note: guid and recaptchaScore must be at root level, not inside formData
                const apiResponse = await axios.post('/api/submit-form', {
                    formType: 'financial_institution',
                    guid: submissionGuid,
                    recaptchaScore: verifyResponse.data.score,
                    formData: submissionData
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 second timeout
                });
                
                if (apiResponse.status === 200 || apiResponse.status === 201) {
                    // Set the sanitized form
                    setform(sanitizedForm);
                    
                    toast.success("Thank you for agreeing to the Freeware License. Your form has been submitted successfully.", {
                        position: "top-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    // Optional: Clear form or redirect
                    // window.location.href = '/dashboard/financial-institutions/success';
                } else {
                    throw new Error(`API request failed with status: ${apiResponse.status}`);
                }
            } else {
                toast.error('Failed to complete captcha verification. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
            hasSubmitted.current = false; // Reset flag on error to allow retry
            
            // Provide user-friendly error messages based on error type
            if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please check your internet connection and try again.', {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const statusCode = error.response.status;
                const errorMessage = error.response.data?.message || 'Server error occurred';
            } else if (error.request) {
                // The request was made but no response was received
                toast.error('Network error: Unable to reach the server. Please check your internet connection and try again.', {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                // Something happened in setting up the request
                toast.error('An error occurred during form submission. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [executeRecaptcha, form, compiledBlockedTerms, guid]);
    // handleSubmit function to validate the form and show the popup if validation passes
    const handleSubmit = useCallback(() => {
        const errors = runValidation('bank_form', form);
        if (Object.keys(errors).length === 0) {
            hasSubmitted.current = false; // Reset submission flag to allow new submission
            setShowPopup(true);
            return;
        }
        setFormErrors(errors);
        scrollToError(errors);
        //setShowPopup(true);
    }, [form]);

    // Load financial institutions data on mount
    useEffect(() => {
        getFinancialInstitutionsData().then(data => {
            setInstitutions(data);
        });
    }, []);

    // Load blocked terms on mount
    useEffect(() => {
        loadBlockedTerms().then(terms => {
            const compiledTerms = compileBlockedTerms(terms);
            setCompiledBlockedTerms(compiledTerms);
        });
    }, []);

    // Validate financial institutions selected
    useEffect(() => {
        if (firstRender.current) {
            setTimeout(() => {
                firstRender.current = false;
            }, 100);
            return;
        }
        const errors = runValidation('bank_form', form, 'selectedFI');
        setFormErrors(prev => ({
            ...prev,
            selectedFI: errors.selectedFI || '',
        }));
    }, [form.financialInstitutionsSelected]);

    // Validate financial services selected
    useEffect(() => {
        if (firstRender.current) return;
        const errors = runValidation('bank_form', form, 'selectedFS');
        setFormErrors(prev => ({
            ...prev,
            selectedFS: errors.selectedFS || '',
        }));
    }, [form.financialServicesSelected]);

    // Validate operates across state lines
    useEffect(() => {
        if (form.operatesAcrossStateLines !== undefined) {
            const errors = runValidation('bank_form', form, 'operatesAcrossStateLines');
            setFormErrors(prev => ({
                ...prev,
                operatesAcrossStateLines: errors.operatesAcrossStateLines || '',
            }));
        }
    }, [form.operatesAcrossStateLines]);

    // Validate portfolio sizes
    useEffect(() => {
        if (form.portfolioSizes) {
            const errors = runValidation('bank_form', form, 'portfolioSizes');
            setFormErrors(prev => ({
                ...prev,
                portfolioSizesValid: errors.portfolioSizesValid || '',
            }));
        }
    }, [form.portfolioSizes]);

    // Auto-populate charter information when financial institution is selected
    useEffect(() => {
        if (form.financialInstitutionName && institutions[form.financialInstitutionName]) {
            const values = institutions[form.financialInstitutionName];
            setform(prev => ({
                ...prev,
                charterAddress: `${values.address} ${values.city}, ${values.state}`,
                charterNumber: values.charterNo || '',
                state: values.state || '',
            }));
        }
    }, [form.financialInstitutionName, institutions]);

    // Handle license acceptance and trigger final submission
    useEffect(() => {
        if (form['freeWareLicense'] === true && !hasSubmitted.current) {
            hasSubmitted.current = true; // Mark as submitted to prevent re-trigger
            setShowPopup(false);

            // Remove the license flag from form state
            setform(prev => {
                const { freeWareLicense, ...restForm } = prev;
                return restForm;
            });

            postSubmit();
        }
    }, [form['freeWareLicense'], postSubmit]);

    // Handle verified address changes
    useEffect(() => {
        if (verifiedAddress?.items?.length > 0) {
            const address = verifiedAddress.items[0].address;
            setform(prev => ({
                ...prev,
                state: address.state || '',
                charterAddress: address.label || '',
            }));
        }
    }, [verifiedAddress]);

    // Generate GUID when office address is verified
    useEffect(() => {
        if (verifiedAddress?.Obj && verifiedAddress.id === 'officeAddress') {
            const address = verifiedAddress.Obj.address;
            const generatedGuid = generateGUID('Financial Institution', address.state, address.county, '0000', '0001', address.label);
            setGuid(generatedGuid);
        }
    }, [verifiedAddress]);

    // Store GUID in localStorage
    useEffect(() => {
        if (guid) {
            localStorage.setItem('guid', guid);
        }
    }, [guid]);
  return (
    <div className='flex-1 gap-5 py-10 px-20 bg-white'>
        <div className='flex flex-col bg-gray-100 px-5 py-10 rounded-2xl'>
            <div className='flex flex-col gap-2 mb-5'>
                <span>Please have the following info ready to complete your SignUp</span>
                <ul className='list-disc list-inside'>
                    <li>BIN/IIN</li>
                    <li>Total asset size globally</li>
                    <li>Daily trade volume in your department in usd</li>
                </ul>
            </div>
            <h1 className="text-3xl font-bold text-[var(--primary)] text-center">
                {
                    reviewing ? 'Review Your Information' : 'Financial Institutions Form'
                }
            </h1>
            <div className={`${reviewing?'flex flex-col gap-3 mt-20 mb-10':'grid grid-cols-3 mt-5 gap-3'}`}>
                    {
                        [
                            { label: 'What is the Name of your Financial Institution (FI)?', id: 'financialInstitutionName', type: 'autoddm',options:Object.keys(institutions), required: true },
                            { label: 'Office Address', type:'hereGeoLocation', id: 'officeAddress', required: true },
                            { type: 'sectionHeading', label: 'Who is the Primary contact?', id: 'tier_type' },
                            { label: 'First Name', id: 'firstName', type: 'text', required: true },
                            { label: 'Last Name', id: 'lastName', type: 'text', required: true },
                            { label: 'Job Title', id: 'jobTitle', type: 'autoddm', required: true, options: bankJobTitles },
                            { type: 'sectionHeading', label: 'What is the your contact info?', id: 'contact_info' },
                            { label: 'Telephone', id: 'telephone', type: 'tel', required: true },
                            { label: 'Office Fax Number', id: 'faxNumber', type: 'text' },
                            { label:'Business E-Mail Address', id: 'businessEmailAddress', type: 'email',  required: true },
                            { label:'Alternate Telephone Number (Optional)', id: 'alternateTelephoneNumber', type: 'tel',  },
                            { label:'Office Fax Number (If Different Than Primary)', id: 'alternateFaxNumber', type: 'text', },
                            { label: 'Mobile Number', id: 'mobileNumber', type: 'text',  required: true },
                            { type: 'sectionHeading', label: 'What Type of Financial Institution (FI) do you represent?',id:'selectedFI' },
                            { type: 'label', label: 'Please select the type of Financial Institution (FI) you represent.', classes:'!text-base mt-0 text-gray-500 italic font-normal !col-span-3' },
                            { type: 'checklist', classes: 'col-span-3', id: 'financialInstitutionsSelected', label: 'Financial Institution Type', options: financialInstitutionOptions, required: true },
                            { label: 'What best describes your FI?', id: 'charterType', type: 'ddm', options: ['Federal', 'State'], required: true, classes:'col-span-3 my-3', labelClasses: '!text-base font-bold !text-black' },
                            { label: 'What Address is Your Charter In?', id: 'charterAddress', type: 'hereGeoLocation', required: true, classes:'col-span-3', labelClasses: '!text-base font-bold !text-black' },
                            { label:'Charter No.', id: 'charterNumber', type: 'number', required: true, classes:'col-span-3', labelClasses: '!text-base font-bold !text-black' },
                            { label:'State', id: 'state', type: 'text',  required: true, classes:'col-span-3 mb-3', labelClasses: '!text-base font-bold !text-black' },
                            { label:'Does Your FI Operate Across State Lines?', id: 'operatesAcrossStateLines', type: 'yes/no', classes:'col-span-3 my-3 gap-2', labelClasses: '!text-base font-bold !text-black', required:true },
                            { label: 'What is the Total Asset Size of Your Global FI ?', id: 'totalAssetSize', type: 'ddm', options: financialSizeOptions, required: true, classes:'col-span-3 my-3', labelClasses: '!text-base font-bold !text-black' },
                            
                            { type: 'sectionHeading', label: 'Please Check All Deliverables That Your Financial Institution Performs', id:'selectedFS',required:true },
                             { type: 'checklist', classes: 'col-span-3', id: 'financialServicesSelected', label: 'Please Check All Deliverables That Your Financial Institution Performs', options: financialServices, required: true },
                             //{ type: 'sectionHeading', label:'What is Your Bank Identification Number (BIN)?', id: 'bin_info', required: true },
                             { label: 'What is Your Bank Identification Number (BIN)?', id: 'binNumber', type: 'number', placeholder: 'BIN/IIN', required: true, classes:'col-span-3 my-3', labelClasses: '!text-base font-bold !text-black' },
                             { label: 'What is your Daily Trade Volume (not dollars) in Your Department or Division or Unit?', type:'ddm', id: 'trade_volume', required: true, labelClasses: '!text-base font-bold !text-black', options: transactionRanges, classes:'col-span-3 my-3' },
                        ].map((field, index) => (
                            reviewing?
                            field.type==='sectionHeading'?
                            <h2 key={`section1-field-${index}`} className='flex gap-3 font-semibold mt-10 text-lg underline text-gray-700'>{field.label}</h2>:
                            field.type==='checklist'?
                            <div key={`section1-field-${index}`} className='px-4'>
                                {field.options.map((option, idx) => (
                                    form[field.id][idx].value &&
                                    <div key={`section1-field-${index}-option-${idx}`} className='flex gap-2'>
                                        <label className='!text-sm font-semibold text-gray-700'>{option.label}</label>
                                        {/* <span className='!text-sm text-gray-500 ml-1'>{form[field.id][idx].value ? 'Yes' : 'No'}</span> */}
                                    </div>
                                ))}
                                <div className='flex mt-5 mb-2 border border-gray-200'></div>
                            </div>:
                            <div key={`section1-field-${index}`} className='flex gap-2'>
                                <label className='!text-sm font-semibold text-gray-700'>{field.label}:</label>
                                <span className='!text-sm text-gray-500 ml-1'>{form[field.id]}</span>
                            </div>
                            :
                            <DynamicComponent
                                key={`section1-field-${index}`}
                                form={form}
                                setform={setform}
                                handleChange={handleChange}
                                formErrors={formErrors}
                                label={field.label} // Remove any text after '('
                                id={field.id}
                                type={field.type}
                                setFormErrors={setFormErrors}
                                options={field.options || []}
                                placeholder={field.placeholder}
                                secondaryId={field.secondaryId}
                                secondaryLabel={field.secondaryLabel}
                                required={field.required}
                                section='bank_form' // Assuming this is the section name for validation
                                index={index} // Add index if needed for validation
                                conditionalId={field.conditionalId}
                                condition={field.condition}
                                classes={field.innerClass || field.classes}
                                outerClass={field.outerClass || field.classes}
                                labelClasses={field.labelClasses || ''}
                                setVerifiedAddress={setVerifiedAddress}
                                compiledBlockedTerms={compiledBlockedTerms} // Pass compiled blocked terms to the component
                            />
                        ))
                    }
            </div>
            {    /// check if form['financialServicesSelected'] is not empty and has at least one service selected is true
                !reviewing ?
                <div key={`portfolio-sizes-edit`} className='flex flex-col mt-3'>
                    {form['financialServicesSelected']?.some(item => item.value === true) && <h2 className='text-base font-bold'>What is the Portfolio Size of Your Deliverables? <span className='text-red-500'>*</span></h2>}
                    <label className='!text-red-500 !text-sm'>{formErrors['portfolioSizesValid']}</label>
                    {
                        form['financialServicesSelected'].map((service, index) => {
                            if (service.value) {
                                return (
                                    <div key={`portfolio-size-${index}`} className='flex items-center gap-2 mt-3'>
                                        <label htmlFor={`portfolioSize-${service.id}`} className='text-sm w-100 text-right font-semibold'>{service.id.replace(/_/g, ' ').toUpperCase()}:</label>
                                        <span>$</span>
                                        <div className='flex flex-col w-full'>
                                            <input
                                                type='number'
                                                id={`portfolioSize-${service.id}`}
                                                placeholder='Enter Portfolio Size'
                                                className='border border-gray-300 bg-white rounded-md px-3 py-1 text-sm w-full max-w-xs'
                                                onChange={handleChange}
                                            />
                                            <div className='text-red-500 text-xs mt-1'>
                                                {formErrors[`portfolioSize-${service.id}`] || ''}
                                            </div>
                                        </div>
                                        
                                    </div>
                                )
                            }
                            return null;
                        })
                    }
                </div>:
                <div key={`portfolio-sizes-review`} className='flex flex-col mt-3'>
                    <h2 className='text-base font-bold'>What is the Portfolio Size of Your Deliverables?</h2>
                    {
                       form['portfolioSizes'] && Object.entries(form['portfolioSizes']).map(([key, value], index) => (
                            <div key={`portfolio-size-${index}`} className='flex items-center gap-2 mt-3'>
                                <label className='text-sm w-100 text-right font-semibold'>{key.replace(/_/g, ' ').toUpperCase()}:</label>
                                <span>$</span>
                                <span className='!text-sm text-gray-500 ml-1'>{value}</span>
                            </div>
                        ))
                    }
                </div>
            }
            {
                !reviewing?
                <TextAreaField
                    id='ginicoeHelpDescription'
                    label='Describe in Detail How Ginicoe Can Help You.'
                    label2='Please provide any additional information that may be relevant to your application.'
                    required={false}
                    form={form}
                    handleChange={handleChange}
                    classes='mb-10'
                    formErrors={formErrors}
                />:
                <div key={`Describe in Detail How Ginicoe Can Help You.`} className='flex flex-col my-5 gap-2'>
                    <label className='!text-sm font-semibold text-gray-700'>{'Describe in Detail How Ginicoe Can Help You.'}:</label>
                    {
                        form['ginicoeHelpDescription'] ?
                        form['ginicoeHelpDescription'].split('\n').map((line, lineIndex) => (
                            <span key={`section5-field-line-${lineIndex}`} className='!text-sm text-gray-500 ml-1'>{line}</span>
                        )) : null
                    }
                </div>
            }
            <div className='flex justify-center gap-5 items-center mt-10'>
                    <button className='bg-blue-500 text-white px-4 py-2 rounded-md'
                     onClick={()=>{setReviewing(!reviewing)}}
                    >{
                        reviewing ? 'Edit' : 'Review'
                    }</button>
                    <button 
                        className={`bg-green-500 text-white px-4 py-2 rounded-md ml-4 ${
                            (recaptchaLoading || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                        }`}
                        onClick={handleSubmit}
                        disabled={recaptchaLoading || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : recaptchaLoading ? 'Processing...' : 'Submit'}
                    </button>
            </div>
        </div>
        <SignageDownloadPopup id='freeWareLicense' file={'/agreements/FI Click Wrap Actual.pdf'} form={form} setform={setform} show={showPopup} label="FI Freeware License" onClose={() => setShowPopup(false)} />
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}