import React from 'react'
import { runValidation } from '../Resources/ValidationFunctions';

// EINNumber component
// This component renders an input field for EIN (Employer Identification Number) with validation.
export default function EINNumber({ id, form, setform, classes, setFormErrors, section }) {
    // Handle EIN input change
    const handleEINChange = (e) => {
        const { value } = e.target;
        let rawValue = value.replace(/\D/g, '').slice(0, 9); // max 9 digits
        // Format to XX-XXXXXXX
        if(rawValue===''){
            setform((prev) => ({
                ...prev,
                [id]: '',
            }));
            return;
        }
        let formatted = `${rawValue.slice(0, 2)}-${rawValue.slice(2)}`;

        let updatedForm = {
            ...form,
            [id]: value,
        };
        const errors = runValidation(section, updatedForm, id);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [id]: errors[id] || '',
        }));
        setform((prev) => ({
            ...prev,
            [id]: formatted,
            [`verified_${id}`]: formatted, // Assuming you want to mark it as verified
        }));
    };
  return (
    <input
        type="text"
        id={id}
        name="ein"
        className={`w-full ${classes} bg-white`}
        value={form[id] || ''}
        onChange={handleEINChange}
      />
  )
}
