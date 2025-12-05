import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import { consumerProgressTackers, populationGroups } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  section: 'flex flex-col mt-7',
  infoText: 'font-bold text-gray-500',
  grid: 'grid grid-cols-3 gap-3',
  fieldContainer: 'flex gap-1 my-2 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  error: 'text-red-500 text-xs'
};

// Ethnicity fields configuration
const ETHNICITY_FIELDS = [
  { id: 'ethnicity', label: 'Ethnicity', type: 'ddm', options: populationGroups }
];

/**
 * Form_Ethinicity Component
 * Renders the ethnicity form section of the consumer dashboard
 * 
 * @param {Object} props - Component properties
 * @param {number} props.formState - Current form state/step
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Function} props.handleChange - Function to handle input changes
 */
export default function Form_Ethinicity({ formState, form, setForm, formErrors, setFormErrors, handleChange }) {
  // Render ethnicity fields
  const renderEthnicityFields = () => {
    return ETHNICITY_FIELDS.map((field, index) => (
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
            sliceText={true} 
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
        <h2 className={CSS_CLASSES.infoText}>
          Ethnicity is defined as Language, cultural heritage, religion, and traditions.
        </h2>
        
        <div className={CSS_CLASSES.grid}>
          {renderEthnicityFields()}
        </div>
      </div>
    </div>
  );
}