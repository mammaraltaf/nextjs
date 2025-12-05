import React, { useState } from 'react';
import { formatPhoneNumber } from '../Resources/functions';
import { runValidation } from '../Resources/ValidationFunctions';

// Telephone.js
// This component handles phone number and extension input with validation
// It ensures the phone number is 10 digits and the extension is 1-4 digits
export default function Telephone({ id, form, setform, formErrors, setFormErrors, section }) {
  const [phone, setPhone] = useState(form[id] || '');
  const [ext, setExt] = useState(form[`${id}_ext`] || '');

  return (
    <div className="w-full bg-white">
      <div className="flex space-x-2">
        {/* Phone Input */}
        <div className="w-3/4">
          <input
            type="tel"
            id={id}
            name={id}
            value={form[id] || phone}
            onChange={(e) => {
               // numbers only, no letters or special characters
                if (e.target.value && !/^\d*$/.test(e.target.value)) {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }
                const formattedPhone = formatPhoneNumber(e.target.value);
                const error = runValidation(section, { ...form, [id]: formattedPhone }, id);
                setform((prevForm) => ({
                  ...prevForm,
                  [id]: formattedPhone,
                }));
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  [id]: error[id],
                }));
            }}
            placeholder="Phone Number"
            className="w-full border border-gray-300 rounded px-4 py-4"
          />
        </div>

        {/* Extension Input */}
        <div className="w-1/4">
          <input
            type="tel"
            id={`${id}_ext`}
            name={`${id}_ext`}
            value={ext}
            onChange={(e) => {
                // numbers only, no letters or special characters
                if (e.target.value && !/^\d*$/.test(e.target.value)) {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }
                setExt(e.target.value);
                setform((prevForm) => ({
                  ...prevForm,
                  [`${id}_ext`]: e.target.value,
                }));
            }}
            maxLength={4}
            placeholder="Ext"
            className="w-full border border-gray-300 rounded px-4 py-4"
          />
          {formErrors[`${id}_ext`] && (
            <p className="text-red-600 text-sm mt-1">{formErrors[`${id}_ext`]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
