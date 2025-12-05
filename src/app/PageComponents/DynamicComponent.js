import DropDownMenu from '@/app/PageComponents/DropDownMenu'
import EINNumber from '@/app/PageComponents/EINNumber'
import SocialSecurityNumber from '@/app/PageComponents/SocialSecurityNumber'
import ToggleButton from '@/app/PageComponents/ToggleButton'
import React from 'react'
import AutoDropDownMenu from './AutoDropDownMenu'
import HereGeoLocationComponent from './HereGeoLocationComponent'
import Telephone from './Telephone'

// DynamicComponent renders different form components based on the type prop.
// It supports various input types, conditional rendering, and integrates with form state management.
// Elements include dropdowns, text inputs, checklists, and more.
// Depending on the type, it renders the appropriate component with shared props for consistency.
// It also handles conditional visibility based on form state.
export default function DynamicComponent({
    // All props are destructured for clarity and ease of use
    classes = '', // CSS classes for styling
    compiledBlockedTerms = null, // Terms to block in the input
    condition = null, // Condition for conditional rendering
    conditionalId = null, // ID for conditional rendering
    disabled = false, // Whether the component is disabled
    form, // Form state object
    formErrors, // Object to hold form validation errors
    formState = 0, // Current state of the form
    handleChange, // Function to handle input changes
    hlink = null, // Hyperlink for additional information
    id,     // Unique identifier for the component
    index = null, // Index of the component in the form
    label, // Label for the component
    label2 = null, // Secondary label for additional context
    label3 = null, // Tertiary label for further information
    labelClasses = '', // CSS classes for the label
    maxCharacters = 3000, // Maximum characters allowed in the input
    options = [], // Options for dropdowns or other select inputs
    outerClass = '', // CSS classes for the outer container
    placeholder = ``, // Placeholder text for the input
    required = false, // Whether the input is required
    section = null, // Section the component belongs to
    setFormErrors, // Function to set form errors
    setVerifiedAddress = null, // Function to set verified address
    setform, // Function to update the form state
    toggleIDs = null, // IDs for toggling visibility of components
    type, // Type of the component (e.g., 'text', 'dropdown', etc.)

    }) {
    // Shared properties for all components
    // These properties are passed to each component for consistency
    const sharedFieldProps = {
            form,
            setform,
            handleChange,
            formErrors,
            label,
            id,
            type,
            classes,
            labelClasses,
            setFormErrors,
            options,
            placeholder,
            required,
            formState,
            section,
            index,
            conditionalId,
            condition,
            hlink,
            label2,
            toggleIDs,
            disabled,
            label3,
            maxCharacters,
            setVerifiedAddress,
            compiledBlockedTerms
    };
    // Determine the column span based on the type of component
    // This is used for layout purposes in the form
    const colSpan = ['sectionHeading', 'heading2', 'br', 'empty','label','checklist'].includes(type) ? 'col-span-3' : '';
    // Determine the outer class based on the type of component
    // This is used for additional styling of the component
    const donotShowLabels = ['toggle', 'textarea','sectionHeading','label', 'checklist'];

    // Map of component types to their respective components
    const COMPONENT_MAP = {
        // alphabetical order
        'autoddm': AutoDropDownMenu,
        'br': () => <br key={index} />,
        'checklist': () => (
            <div key={index} className={`flex gap-6 px-5 ${classes}`}>
                <div>
                    {
                        options.slice(0,11).map((option, optIndex) => (
                            <div key={`option-${optIndex}`} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id={`${id}-${optIndex}`}
                                    name={option.value}
                                    checked={form[id][optIndex].value || false}
                                    onChange={(e) => {
                                        setform({ ...form, [id]: form[id].map((item, index) => index === optIndex ? { ...item, value: e.target.checked } : item)     });
                                        //handleChange(e);
                                    }}
                                    className="mr-2 bg-white"
                                />
                                <label htmlFor={`${id}-${optIndex}`} className="text-gray-700 !text-md">{option.label}</label>
                            </div>
                        ))}
                </div>
                <div>
                    {
                        options.slice(11, 22).map((option, optIndex) => {
                            const actualIndex = optIndex + 11;
                            return (
                            <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                                <input
                                type="checkbox"
                                id={`${id}-${actualIndex}`}
                                name={option.value}
                                checked={form[id]?.[actualIndex]?.value || false}
                                onChange={(e) => {
                                    const updatedArray = form[id].map((item, index) =>
                                    index === actualIndex ? { ...item, value: e.target.checked } : item
                                    );
                                    setform({ ...form, [id]: updatedArray });
                                }}
                                className="mr-2"
                                />
                                <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-md">
                                {option.label}
                                </label>
                            </div>
                            );
                        })
                        }

                </div>
                <div>
                    {
                        options.slice(22, 33).map((option, optIndex) => {
                            const actualIndex = optIndex + 22;
                            return (
                            <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                                <input
                                type="checkbox"
                                id={`${id}-${actualIndex}`}
                                name={option.value}
                                checked={form[id]?.[actualIndex]?.value || false}
                                onChange={(e) => {
                                    const updatedArray = form[id].map((item, index) =>
                                    index === actualIndex ? { ...item, value: e.target.checked } : item
                                    );
                                    setform({ ...form, [id]: updatedArray });
                                }}
                                className="mr-2"
                                />
                                <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-md">
                                {option.label}
                                </label>
                            </div>
                            );
                        })
                        }
                </div>
                <div>
                    {
                        options.slice(33).map((option, optIndex) => {
                            const actualIndex = optIndex + 33;
                            return (
                            <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                                <input
                                type="checkbox"
                                id={`${id}-${actualIndex}`}
                                name={option.value}
                                checked={form[id]?.[actualIndex]?.value || false}
                                onChange={(e) => {
                                    const updatedArray = form[id].map((item, index) =>
                                    index === actualIndex ? { ...item, value: e.target.checked } : item
                                    );
                                    setform({ ...form, [id]: updatedArray });
                                }}
                                className="mr-2"
                                />
                                <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-md">
                                {option.label}
                                </label>
                            </div>
                            );
                        })
                        }
                </div>
            </div>
        ),
        'conditionalDDM': ({ conditionalId, condition }) => (
            form[conditionalId] && form[conditionalId] === condition ? (
                <DropDownMenu
                    id={id}
                    key={index}
                    name={label}
                    form={form}
                    setform={setform}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={options}
                    formState={formState}
                    setFormErrors={setFormErrors}
                    sliceText={true}
                />
            ) : null
        ),
        'ddm': DropDownMenu,
        'EIN': EINNumber,
        'empty': () => <div className="invisible"></div>,
        'hereGeoLocation': HereGeoLocationComponent,
        'heading2': () => (
            <div key={index} className={`col-span-3 text-lg font-bold mt-2 mb-1 ${classes}`}>
                <h2 key={`heading2-${index}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </h2>
            </div>
        ),
        'label': () => (
            <div key={index} className={`col-span-3 ${classes}`}>
                {label}
            </div>
        ),
        'ssn': SocialSecurityNumber,
        'sectionHeading': () => (
            <div key={index} className={`col-span-3 text-lg font-bold mt-5 ${classes}`}>
                <h2>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </h2>
            </div>
        ),
        'toggle': ToggleButton,
        'tel': Telephone,
        'textarea': ({ id, label, required, label2, hlink }) => (
            <div className={`flex relative mt-8 flex-col ${classes}`}>
                <label className={`flex flex-col text-md text-blue-600 font-bold`}>
                    <span>{label} {required && <span className="text-red-500">*</span>}</span>
                    {label2 && <span className="text-gray-500 text-md font-normal ml-1 italic">{label2}</span>}
                    {hlink && <a href={hlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Learn more</a>}
                </label>
                <textarea
                    id={id}
                    name={label}
                    value={form[id] || ''}
                    onChange={handleChange}
                    className="border p-4 rounded w-full bg-white"
                    rows={10}
                />
            </div>
        ),
        'yes/no': ()=>(
            <div className='flex px-15'>
                    <input
                            type="radio"
                            id={`${id}-yes`}
                            name={id}
                            value="yes"
                            checked={form[id] === true}
                            onChange={() => {
                                setform({ ...form, [id]: true });
                            }}
                            className="mr-2"
                        />
                <label htmlFor={`${id}-yes`} className="mr-4 !text-md">Yes</label>

                <input
                    type="radio"
                    id={`${id}-no`}
                    name={id}
                    value="no"
                    checked={form[id] === false}
                    onChange={() => {
                        setform({ ...form, [id]: false });
                    }}
                    className="mr-2"
                />
                <label htmlFor={`${id}-no`} className="mr-4 !text-md">No</label>
                </div>
        )
    };
  // Select the component based on the type prop
  // If the type is not found in the COMPONENT_MAP, it defaults to a text input
  const FieldComponent = COMPONENT_MAP[type];
  return (
    <div key={id} className={`flex flex-col my-1 ${outerClass} ${colSpan} ${condition && form[conditionalId]?.toString() !==condition.toString() ? 'hidden' : ''}`}>
      <label htmlFor={id} className={`text-md font-medium ${labelClasses} ${type && donotShowLabels.includes(type) ? 'hidden' : ''}`}>
            {label}
            {required && <span className="text-red-500">*</span>}
      </label>
      {/* Display secondary label if provided */}
      {label3 && <span className="text-gray-500 text-md font-normal ml-1 italic">{label3}</span>}
      {FieldComponent ? (
        <FieldComponent
          {...sharedFieldProps}
          classes={`${type!=='toggle'?'bg-white':''} ${classes}`}
        />
      ) : (
        // Fallback to a simple text input if no component matches
        <input
          type={type}
          key={index}
          id={id}
          name={label}
          value={form[id] || ''}
          onChange={handleChange}
          className='bg-white p-4'
        />
      )}
      {/* Display form errors if any */}
      <div id={`error-${id}`} className="text-red-600 text-md font-medium mt-1 px-2 py-1  rounded-md">{formErrors[id]}</div>
    </div>
  )
}
