import DropDownMenu from '@/app/PageComponents/DropDownMenu';
import HereGeoLocationComponent from '@/app/PageComponents/HereGeoLocationComponent';
import EnhancedFileUpload from '@/app/PageComponents/EnhancedFileUpload';
import { consumerProgressTackers, racesNeighbours } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  header: 'flex gap-10',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  infoText: 'text-gray-400 font-semibold',
  instruction: 'text-[var(--primary)]',
  section: 'flex mt-5 flex-col gap-3',
  grid: 'grid grid-cols-2 gap-3',
  fieldContainer: 'flex gap-1 my-2 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  error: 'text-red-500 text-xs',
  toggleContainer: 'flex gap-1 my-2 flex-col',
  documentation: 'mt-4 p-4 border rounded-md bg-gray-50',
  fileUpload: 'w-full p-2 border rounded-md',
  fileItem: 'flex items-center justify-between p-2 bg-white rounded border',
  removeButton: 'text-red-500 hover:text-red-700 text-sm'
};

// Neighborhood fields configuration
const NEIGHBORHOOD_FIELDS = [
  { id: 'right_neighbor_address', label: 'Please provide the house address of your nearest neighbor to the RIGHT of you.', type: 'text' },
  { direction:'Right', id: 'right_neighbor_race', label: 'What race are your nearest neighbors to the RIGHT of you?', type: 'ddm', options: racesNeighbours },
  { id: 'left_neighbor_address', label: 'Please provide the house address of your nearest neighbor to the LEFT of you.', type: 'text' },
  { direction:'Left', id: 'left_neighbor_race', label: 'What race are your nearest neighbors to the LEFT of you?', type: 'ddm', options: racesNeighbours },
  { id: 'front_neighbor_address', label: 'Please provide the house address of your nearest neighbor in FRONT of you.', type: 'text' },
  { direction:'Front', id: 'front_neighbor_race', label: 'What race are your nearest neighbors in FRONT of you?', type: 'ddm', options: racesNeighbours },
  { id: 'back_neighbor_address', label: 'Please provide the house address of your nearest neighbor BEHIND you.', type: 'text' },
  { direction:'Back', id: 'back_neighbor_race', label: 'What race are your nearest neighbors BEHIND you?', type: 'ddm', options: racesNeighbours }
];

/**
 * Form_Neighbourhood Component
 * Renders the neighbourhood form section of the consumer dashboard
 * Includes fields for the addresses and races of the nearest neighbors
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {number} props.formState - Current form state/step
 * @param {Function} props.setFormErrors - Function to update form errors
 * @param {Object} props.formErrors - Form validation errors
 * @param {string} props.compiledBlockedTerms - Compiled blocked terms for validation
 */
export default function Form_Neighbourhood({ form, setForm, formState, setFormErrors, formErrors, compiledBlockedTerms }) {
  // Handle file upload for multi-racial couple documentation
  const handleFileUpload = (files) => {
    // files is already an array from EnhancedFileUpload component
    const validFiles = Array.isArray(files) ? files : [];
    
    // Update form state with uploaded files (limit to 8)
    setForm(prev => ({
      ...prev,
      multiRacialDocumentation: [...(prev.multiRacialDocumentation || []), ...validFiles].slice(0, 8)
    }));
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setForm(prev => {
      const newFiles = [...(prev.multiRacialDocumentation || [])];
      newFiles.splice(index, 1);
      return {
        ...prev,
        multiRacialDocumentation: newFiles
      };
    });
  };

  // Render neighborhood fields
  const renderNeighborhoodFields = () => {
    return NEIGHBORHOOD_FIELDS.map((field, index) => (
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
            openUpWards={index === 7}
          />
        ) : (
          <HereGeoLocationComponent
            id={field.id}
            form={form}
            setform={setForm}
            formState={formState}
            setFormErrors={setFormErrors}
            compiledBlockedTerms={compiledBlockedTerms}
            section={'my_neighbours_are'}
            setformErrors={setFormErrors}
          />
        )}
        <div className={CSS_CLASSES.error}>
          {formErrors[field.id]}
        </div>
      </div>
    ));
  };

  // Render multi-racial couple documentation upload
  const renderMultiRacialDocumentation = () => {
    if (!form.isMultiRacialCouple) return null;

    return (
      <EnhancedFileUpload
        onFilesSelected={handleFileUpload}
        uploadedFiles={form.multiRacialDocumentation || []}
        onRemoveFile={removeFile}
        maxFiles={8}
        maxSize={5}
        acceptedTypes={['image/png', 'image/jpeg', 'application/pdf', 'image/jpg']}
        label="Upload Matching Information"
        description="Please upload matching information from both spouses' driver's licenses or other government-issued IDs as proof of a shared address"
      />
    );
  };

  return (
    <div className={CSS_CLASSES.container}>
      <div className={CSS_CLASSES.header}>
        {formState !== 9 && (
          <h3 className={CSS_CLASSES.heading}>
            {consumerProgressTackers[formState]}
          </h3>
        )}
        <div className='flex flex-col'>
          <h4 className={CSS_CLASSES.infoText}>Race is defined as Physical Characteristics</h4>
          <h4 className={CSS_CLASSES.infoText}>Ethnicity is defined as Language, heritage, religion</h4>
        </div>
      </div>
      
      <div className={CSS_CLASSES.section}>
        <p className={CSS_CLASSES.instruction}>
          Standing with the front door of your house address at your back, and where distance or
          fences, walls or obstacles are of no consequence, please answer the next 4 directional
          questions to the best of your knowledge.
        </p>
        
        <div className={CSS_CLASSES.grid}>
          {renderNeighborhoodFields()}
        </div>
        
        {/* Multi-racial couple toggle and documentation */}
        <div className={CSS_CLASSES.toggleContainer}>
          <label className={`${CSS_CLASSES.label} font-bold`}>
            Are you considered a multi-racial couple?
          </label>
          <div className='flex items-center gap-2 mt-2'>
            <div 
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                form.isMultiRacialCouple ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setForm(prev => ({ ...prev, isMultiRacialCouple: !prev.isMultiRacialCouple }))}
            >
              <div 
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  form.isMultiRacialCouple ? 'translate-x-6' : ''
                }`}
              />
            </div>
            <span className='text-gray-700'>
              {form.isMultiRacialCouple ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        {/* Multi-racial documentation upload */}
        {renderMultiRacialDocumentation()}
      </div>
    </div>
  );
}