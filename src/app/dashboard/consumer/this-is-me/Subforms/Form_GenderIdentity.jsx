import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import { consumerProgressTackers, selfIdentityTodayOptions } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  section: 'flex flex-col gap-3',
  grid: 'grid grid-cols-3 gap-3',
  fieldContainer: 'flex gap-1 my-2 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  error: 'text-red-500 text-xs'
};

// Gender identity fields configuration
const GENDER_IDENTITY_FIELDS = [
  { id: 'identityatbirth', label: 'Sex Assigned at Birth', type: 'ddm', options: ['Male', 'Female'] },
  { id: 'legalsex', label: 'Legal Sex', type: 'ddm', options: ['Male', 'Female'] },
  { id: 'selfidentity', label: 'What gender best describes how you self-identify today. ', type: 'ddm', options: selfIdentityTodayOptions }
];

/**
 * Form_GenderIdentity Component
 * Renders the gender identity form section of the consumer dashboard
 * 
 * @param {Object} props - Component properties
 * @param {number} props.formState - Current form state/step
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Function} props.handleChange - Function to handle input changes
 */
export default function Form_GenderIdentity({ formState, form, setForm, formErrors, setFormErrors, handleChange }) {
  // Render gender identity fields
  const renderGenderIdentityFields = () => {
    return GENDER_IDENTITY_FIELDS.map((field, index) => (
      <div className={CSS_CLASSES.fieldContainer} key={field.id}>
        <label className={CSS_CLASSES.label}>
          {field.label} <span className={CSS_CLASSES.required}>*</span>
        </label>
        {field.type === 'ddm' ? (
          <DropDownMenu 
            id={field.id} 
            form={form} 
            setform={setForm} 
            options={field.options} 
            formState={formState} 
            setFormErrors={setFormErrors} 
          />
        ) : (
          <input 
            id={field.id}
            name={field.label}
            value={form[field.id] || ''}
            onChange={handleChange}
            type={field.type} 
          />
        )}
        <div className={CSS_CLASSES.error}>
          {formErrors[field.id]}
        </div>
      </div>
    ));
  };

  return (
    <div className={CSS_CLASSES.container}>
      {formState !== 9 && (
        <h3 className={CSS_CLASSES.heading}>
          {consumerProgressTackers[formState]}
        </h3>
      )}
      
      <div className={CSS_CLASSES.section}>
        <div className={CSS_CLASSES.grid}>
          {renderGenderIdentityFields()}
        </div>
      </div>
    </div>
  );
}