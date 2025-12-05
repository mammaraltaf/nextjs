import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import ToggleButton from '@/app/PageComponents/ToggleButton';
import EnhancedFileUpload from '@/app/PageComponents/EnhancedFileUpload';
import { branchOfServiceOptions, consumerProgressTackers, suffixOptions } from '@/app/Resources/Variables';
import React from 'react';

// Personal information fields configuration
const PERSONAL_INFO_FIELDS = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'middleInitial', label: 'Middle Initial', type: 'text', required: false },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'suffix', label: 'Prefix/Suffix', type: 'ddm', options: suffixOptions, required: false },
  { id: 'nickName', label: 'Nick Name', type: 'text', required: false },
  { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  { id: 'socialSecurityNumber', label: 'Social Security Number', type: 'text', required: true },
  { id: 'verifySocialSecurityNumber', label: 'Verify Social Security Number', type: 'text', required: true }
];

// Service date fields configuration
const SERVICE_DATE_FIELDS = [
  { id: 'startDate', label: 'Start Date', type: 'date', required: true },
  { id: 'endDate', label: 'End Date', type: 'date', required: true }
];

/**
 * Form_Predigree Component
 * Renders the Pedigree form for the consumer dashboard
 * Includes fields for personal information, veteran status, and service details
 * 
 * @param {Object} props - Component properties
 * @param {string} props.formState - Current form state
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Object} props.fieldRefs - References to form fields
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {boolean} props.showHeading - Whether to show the form heading
 */
export default function Form_Predigree({ 
  formState, 
  form, 
  setForm, 
  formErrors, 
  setFormErrors, 
  fieldRefs, 
  handleChange, 
  showHeading = true 
}) {
  // Handle file upload for income documentation
  const handleIncomeFileUpload = (files) => {
    // files is already an array from EnhancedFileUpload component
    const validFiles = Array.isArray(files) ? files : [];
    
    // Update form state with uploaded files (limit to 3)
    setForm(prev => ({
      ...prev,
      incomeDocumentation: [...(prev.incomeDocumentation || []), ...validFiles].slice(0, 3)
    }));
  };

  // Handle file upload for impairment documentation
  const handleFileUpload = (files) => {
    // files is already an array from EnhancedFileUpload component
    const validFiles = Array.isArray(files) ? files : [];
    
    // Update form state with uploaded files (limit to 3)
    setForm(prev => ({
      ...prev,
      impairmentDocumentation: [...(prev.impairmentDocumentation || []), ...validFiles].slice(0, 3)
    }));
  };

  // Remove uploaded income file
  const removeIncomeFile = (index) => {
    setForm(prev => {
      const newFiles = [...(prev.incomeDocumentation || [])];
      newFiles.splice(index, 1);
      return {
        ...prev,
        incomeDocumentation: newFiles
      };
    });
  };

  // Remove uploaded impairment file
  const removeFile = (index) => {
    setForm(prev => {
      const newFiles = [...(prev.impairmentDocumentation || [])];
      newFiles.splice(index, 1);
      return {
        ...prev,
        impairmentDocumentation: newFiles
      };
    });
  };

  // Render personal information fields
  const renderPersonalInfoFields = () => {
    return PERSONAL_INFO_FIELDS.map((field) => (
      <div className='flex gap-1 flex-col' key={field.id}>
        <label className='text-gray-600'>
          {field.label} {field.required && <span className='text-red-500 font-bold'>*</span>}
        </label>
        {field.type === 'ddm' ? (
          <DropDownMenu 
            id={field.id} 
            form={form} 
            setform={setForm} 
            formState={formState} 
            setFormErrors={setFormErrors} 
            options={field.options} 
          />
        ) : (
          <input 
            name={field.label}
            type={field.type} 
            id={field.id}
            value={form[field.id] || ''}
            onChange={handleChange}
            className="w-full p-4 border rounded-md"
            ref={(el) => {
              if (el) fieldRefs.current[field.id] = el;
            }}
          />
        )}
        <div className='text-red-500 text-xs'>
          {formErrors[field.id]}
        </div>
      </div>
    ));
  };

  // Render service date fields
  const renderServiceDateFields = () => {
    return SERVICE_DATE_FIELDS.map((field) => (
      <div className='flex gap-1 my-2 flex-col' key={field.id}>
        <label className='text-gray-600'>
          {field.label} {field.required && <span className='text-red-500 font-bold'>*</span>}
        </label>
        <input 
          className='w-80 p-4 border rounded-md' 
          type={field.type}
          id={field.id}
          value={form[field.id] || ''}
          onChange={handleChange}
        />
        <div className='text-red-500 text-xs'>
          {formErrors[field.id]}
        </div>
      </div>
    ));
  };

  // Render income documentation upload section
  const renderIncomeDocumentation = () => {
    if (!form.showIncomePosition) return null;

    return (
      <div className='mt-4 p-4 border rounded-md bg-gray-50'>
        <h4 className='font-semibold text-gray-700 mb-2'>
          What best describes your income position today?
        </h4>
        <br />
        
        <div className='flex gap-4 mb-4'>
          <button
            type='button'
            className={`px-4 py-2 rounded-md border ${
              form.incomePosition === 'alimony' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
            onClick={() => setForm(prev => ({ ...prev, incomePosition: 'alimony' }))}
          >
            Alimony
          </button>
          <button
            type='button'
            className={`px-4 py-2 rounded-md border ${
              form.incomePosition === 'child_support' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
            onClick={() => setForm(prev => ({ ...prev, incomePosition: 'child_support' }))}
          >
            Child Support
          </button>
        </div>

        {form.incomePosition && (
          <div className='mt-4'>
            <h5 className='font-semibold text-gray-700 mb-2'>
              {form.incomePosition === 'alimony' 
                ? 'Upload Court Evidence for Alimony' 
                : 'Upload Court Evidence for Child Support (3 documents)'}
            </h5>
            
            <div className='mb-3'>
              <label className='block text-sm text-gray-600 mb-1'>
                Upload supporting documents (PNG, JPG, PDF - Max 5MB each)
              </label>
              <input
                type='file'
                multiple
                accept='.png,.jpg,.jpeg,.pdf'
                onChange={handleIncomeFileUpload}
                className='w-full p-2 border rounded-md'
                disabled={(form.incomeDocumentation || []).length >= 3}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {(form.incomeDocumentation || []).length}/3 files uploaded
              </p>
            </div>

            {/* Display uploaded files */}
            {(form.incomeDocumentation || []).length > 0 && (
              <div className='mt-3'>
                <h6 className='text-sm font-medium text-gray-700 mb-2'>Uploaded Files:</h6>
                <div className='space-y-2'>
                  {form.incomeDocumentation.map((file, index) => (
                    <div key={index} className='flex items-center justify-between p-2 bg-white rounded border'>
                      <span className='text-sm truncate'>{file.name}</span>
                      <button
                        type='button'
                        onClick={() => removeIncomeFile(index)}
                        className='text-red-500 hover:text-red-700 text-sm'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formErrors.incomeDocumentation && (
              <div className='text-red-500 text-xs mt-2'>
                {formErrors.incomeDocumentation}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='flex-1 mr-3 px-4 py-5 bg-white'>
      {/* Form heading */}
      {showHeading && (
        <h3 className='text-lg mb-4 font-semibold text-[var(--primary)]'>
          {consumerProgressTackers[formState]}
        </h3>
      )}
      
      <div className='flex flex-col gap-3'>
        {/* Personal Information Section */}
        <div className='grid grid-cols-3 gap-3'>
          {renderPersonalInfoFields()}
        </div>
        
        {/* Veteran and Service Information Section */}
        <div className='flex flex-col gap-2 py-10'>
          {/* Speech or Hearing Impairment Toggle */}
          <div className='flex gap-1 my-2 flex-col'>
            <label className='text-gray-600 font-bold'>
              Do you have a significant speech or hearing impairment?
            </label>
            <div className='flex items-center gap-2 mt-2'>
              <div 
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                  form.hasImpairment ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setForm(prev => ({ ...prev, hasImpairment: !prev.hasImpairment }))}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    form.hasImpairment ? 'translate-x-6' : ''
                  }`}
                />
              </div>
              <span className='text-gray-700'>
                {form.hasImpairment ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Medical Evidence Documentation Upload */}
          {form.hasImpairment && (
            <EnhancedFileUpload
              onFilesSelected={handleFileUpload}
              uploadedFiles={form.impairmentDocumentation || []}
              onRemoveFile={removeFile}
              maxFiles={3}
              maxSize={5}
              acceptedTypes={['image/png', 'image/jpeg', 'application/pdf', 'image/jpg']}
              label="Upload Medical Evidence"
              description="Please upload medical documentation that verifies your speech or hearing impairment"
            />
          )}

          {/* Veteran Status Toggle */}
          <ToggleButton 
            id={'areYouUSVeteran'} 
            label={'Are you US Veteran?'} 
            required={true} 
            form={form} 
            setform={setForm}
          />
          
          {/* Conditional Veteran Service Details */}
          <div className={`flex flex-col gap-2 ${form.areYouUSVeteran ? 'block' : 'hidden'}`}>
            {/* Branch of Service Dropdown */}
            <div className='flex gap-1 my-2 flex-col'>
              <label className='text-gray-600'>
                Branch of Service <span className='text-red-500 font-bold'>*</span>
              </label>
              <DropDownMenu 
                id='branchOfService' 
                form={form} 
                setform={setForm} 
                formState={formState} 
                options={branchOfServiceOptions} 
                setFormErrors={setFormErrors} 
              />
              <div className='text-red-500 text-xs'>
                {formErrors['branchOfService']}
              </div>
            </div>
            
            {/* Service Time Period and Income Position */}
            <div className='flex gap-4 items-start'>
              {/* Time of Service - keeping existing structure */}
              <div className='flex-1'>
                <label className='text-gray-600 font-bold'>
                  Time of Service
                </label>
                <div className='flex gap-4 mt-2'>
                  {renderServiceDateFields()}
                </div>
              </div>
              
              {/* New Income Position Section */}
              <div className='flex-1'>
                <div className='flex gap-1 flex-col'>
                  <ToggleButton 
                    id='showIncomePosition' 
                    label='What best describes your income position today?' 
                    required={false} 
                    form={form} 
                    setform={setForm}
                  />
                </div>
                
                {/* Income Documentation Upload */}
                {renderIncomeDocumentation()}
              </div>
            </div>
          </div>
          
          {/* Ex-Offender Status Toggle */}
          <ToggleButton 
            id={'areYouAnExOffender'} 
            label={'Are you an ex-offender?'} 
            required={false} 
            form={form} 
            setform={setForm} 
          />
          
          {/* Confidentiality Notice */}
          <p className='text-gray-600 text-xs italic'>
            <span className='font-bold'>Note:</span> Your confidential response will in no way ever be shared or affect your ability to 
            To be protected by Ginicoe or our affiliates.
          </p>
        </div>
      </div>
    </div>
  );
}