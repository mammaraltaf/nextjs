import React from 'react';

// Following the pattern of the other components, this TextAreaField component is designed to be reusable and customizable.
// It accepts props for id, label, label2, hlink, required status, form
const TextAreaField = ({ id, label, label2, hlink, required, form, formErrors, handleChange, classes = '' }) => {
  return (
    <div className={`flex flex-col ${classes}`}>
      <label className="flex flex-col !text-base !text-blue-600 font-bold">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {label2 && (
          <span className="text-gray-500 text-sm font-normal ml-1 italic">{label2}</span>
        )}
        {hlink && (
          <a
            href={hlink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline ml-1"
          >
            Learn more
          </a>
        )}
      </label>
      <textarea
        id={id}
        name={label}
        value={form[id] || ''}
        onChange={handleChange}
        className="border p-4 rounded w-full bg-white"
        rows={10}
      />
      <label className="!text-red-500 text-sm mt-1">{formErrors[id]}</label>
    </div>
  );
};

// ✅ Memoized export
export default React.memo(TextAreaField);
