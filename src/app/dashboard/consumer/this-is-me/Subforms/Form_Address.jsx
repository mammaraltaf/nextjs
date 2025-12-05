import HereGeoLocationComponent from '@/app/PageComponents/HereGeoLocationComponent';
import { olderThan2Years } from '@/app/Resources/functions';
import { consumerProgressTackers } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  section: 'flex flex-col gap-3',
  fieldContainer: 'flex gap-1 my-2 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  dateInput: 'w-40',
  error: 'text-red-500 text-xs'
};

/**
 * Form_Address Component
 * Handles the address input for the user's profile
 * Includes fields for current and previous addresses, with validation for move-in date
 * 
 * @param {Object} props - Component properties
 * @param {number} props.formState - Current form state/step
 * @param {Function} props.setVerifiedAddress - Function to set verified address data
 * @param {string} props.compiledBlockedTerms - Compiled blocked terms for validation
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.handleChange - Function to handle input changes
 */
export default function Form_Address({ 
  formState, 
  setVerifiedAddress,  
  compiledBlockedTerms, 
  form, 
  setForm, 
  setFormErrors, 
  formErrors, 
  handleChange 
}) {
  return (
    <div className={CSS_CLASSES.container}>
      {/* Form heading - only shown when not on step 9 */}
      {formState !== 9 && (
        <h3 className={CSS_CLASSES.heading}>
          {consumerProgressTackers[formState]}
        </h3>
      )}
      
      <div className={CSS_CLASSES.section}>
        <div className='grid'>
          {/* Current Address Section */}
          <div className={CSS_CLASSES.fieldContainer}>
            <label className={CSS_CLASSES.label}>
              Current U.S Address <span className={CSS_CLASSES.required}>*</span>
            </label>
            <HereGeoLocationComponent 
              id={'current_us_address'} 
              section={'address'} 
              setVerifiedAddress={setVerifiedAddress} 
              compiledBlockedTerms={compiledBlockedTerms} 
              form={form} 
              setform={setForm} 
              formState={formState} 
              setFormErrors={setFormErrors} 
            />
            <div className={CSS_CLASSES.error}>
              {formErrors['current_us_address']}
            </div>
            
            <label className={CSS_CLASSES.label}>
              Move-in Date (start date)
              <span className={CSS_CLASSES.required}>*</span>
            </label>
            <input 
              style={{
                padding: '16px',
                border: '1px solid #1f2937',
                borderRadius: '6px'
              }}
              type='date'
              id='moveInDate'
              value={form['moveInDate'] || ''}
              onChange={handleChange}
            />
            <div className={CSS_CLASSES.error}>
              {formErrors['moveInDate']}
            </div>
          </div>
          
          {/* Previous Address Section - only shown when move-in date is less than 2 years ago */}
          {form.moveInDate && !olderThan2Years(new Date(form.moveInDate)) && (
            <div className={CSS_CLASSES.fieldContainer}>
              <label className={CSS_CLASSES.label}>
                You have resided at your current address for less than two years, please provide your previous address 
                <span className={CSS_CLASSES.required}>*</span>
              </label>
              <HereGeoLocationComponent 
                id={'previous_us_address'} 
                setVerifiedAddress={setVerifiedAddress} 
                section={'address'} 
                compiledBlockedTerms={compiledBlockedTerms} 
                form={form} 
                setform={setForm}  
                formState={formState} 
                setFormErrors={setFormErrors} 
              />           
              <div className={CSS_CLASSES.error}>
                {formErrors['previous_us_address']}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}