import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import EnhancedFileUpload from '@/app/PageComponents/EnhancedFileUpload';
import { consumerProgressTackers, incomeAndSupportOptions } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  section: 'flex flex-col gap-3',
  grid: 'grid gap-1',
  fieldContainer: 'flex gap-1 my-1 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  input: 'p-4 border-2 border-gray-500 rounded-md',
  error: 'text-red-500 text-xs',
  toggleContainer: 'flex gap-1 my-2 flex-col',
  documentation: 'mt-4 p-4 border rounded-md bg-gray-50',
  fileUpload: 'w-full p-2 border rounded-md',
  fileItem: 'flex items-center justify-between p-2 bg-white rounded border',
  removeButton: 'text-red-500 hover:text-red-700 text-sm'
};

// Employment fields configuration
const EMPLOYMENT_FIELDS = [
  { id:'employer_name', label: 'Employer\'s Name', type: 'text' },
  { id:'job_title', label: 'Job Title', type: 'text' },
  { id: 'employer_website', placeholder:'http://www.', label: 'Employer\'s Website', type: 'text' },
  { id:'financial_picture', label: 'Gross Annual Income (include bonus, overtime, additional income stream)', type: 'ddm', options: incomeAndSupportOptions }
];

/**
 * Form_Employment Component
 * Renders the employment form section of the consumer dashboard
 * Includes fields for employer's name, job title, employer's website, and gross annual income
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {number} props.formState - Current form state/step
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.handleChange - Function to handle input changes
 */
export default function Form_Employment({ form, setForm, formState, setFormErrors, formErrors, handleChange }) {
  // Handle file upload for income documentation (alimony/child support)
  const handleFileUpload = (files) => {
    // files is already an array from EnhancedFileUpload component
    const validFiles = Array.isArray(files) ? files : [];
    
    // Update form state with uploaded files (limit to 3)
    setForm(prev => ({
      ...prev,
      incomeDocumentation: [...(prev.incomeDocumentation || []), ...validFiles].slice(0, 3)
    }));
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setForm(prev => {
      const newFiles = [...(prev.incomeDocumentation || [])];
      newFiles.splice(index, 1);
      return {
        ...prev,
        incomeDocumentation: newFiles
      };
    });
  };

  // Render employment fields
  const renderEmploymentFields = () => {
    return EMPLOYMENT_FIELDS.map((field, index) => (
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
            setFormErrors={setFormErrors}
            formState={formState}
          />
        ) : (
          <input
            id={field.id}
            name={field.label}
            value={form[field.id] || ''}
            onChange={handleChange}
            type={field.type} 
            placeholder={field.placeholder || ''}
            className={CSS_CLASSES.input}
          />
        )}
        {formErrors[field.id] && (
          <div className={CSS_CLASSES.error}>
            {formErrors[field.id]}
          </div>
        )}
      </div>
    ));
  };

  // Render income documentation upload (alimony/child support)
  const renderIncomeDocumentation = () => {
    // Check if financial_picture field value indicates alimony or child support
    const needsDocumentation = form.financial_picture && 
      (form.financial_picture.toLowerCase().includes('alimony') || 
       form.financial_picture.toLowerCase().includes('child support'));

    if (!needsDocumentation) return null;

    const isChildSupport = form.financial_picture.toLowerCase().includes('child support');
    const maxFiles = isChildSupport ? 3 : 3;

    return (
      <EnhancedFileUpload
        onFilesSelected={handleFileUpload}
        uploadedFiles={form.incomeDocumentation || []}
        onRemoveFile={removeFile}
        maxFiles={maxFiles}
        maxSize={5}
        acceptedTypes={['image/png', 'image/jpeg', 'application/pdf', 'image/jpg']}
        label={isChildSupport 
          ? 'Upload Court Evidence for Child Support (3 or more dependents)'
          : 'Upload Court Evidence for Alimony'
        }
        description={`Please upload court documentation that verifies your ${isChildSupport ? 'child support' : 'alimony'} income`}
      />
    );
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
          {renderEmploymentFields()}
        </div>
        
        {/* Income position (alimony/child support) documentation */}
        {renderIncomeDocumentation()}
      </div>
    </div>
  );
}