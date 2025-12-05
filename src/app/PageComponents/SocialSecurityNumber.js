import React from 'react'
import { runValidation } from '../Resources/ValidationFunctions';

// SocialSecurityNumber.js
export default function SocialSecurityNumber({ id, form, setform, classes='', setFormErrors, section }) {
    // Handle change for SSN input
    const handleSSNChange = (e) => {
        const { value } = e.target;
        let rawValue = value.replace(/\D/g, '').slice(0, 9); // max 9 digits
        // Format to XXX-XX-XXXX
        let  formatted = rawValue;
        if (rawValue.length > 5) {
        formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 5)}-${rawValue.slice(5)}`;
        } else if (rawValue.length > 3) {
        formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
        }
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
        name="ssn"
        value={form[id] || ''}
        onChange={handleSSNChange}
        className={`w-full p-4 ${classes} bg-white`}
      />
  )
}
