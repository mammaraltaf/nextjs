import React, { useEffect, useRef, useState } from 'react'
import { runValidation } from '../Resources/ValidationFunctions';
import { consumerProgressTackers } from '../Resources/Variables';
import { ChevronDown } from 'lucide-react';

// DropDownMenu component
// This component renders a dropdown menu with options, allowing selection and keyboard navigation.
// It supports form integration, validation, and can open upwards if specified.
export default function DropDownMenu({ options, id, form, formState, setform, setFormErrors,openUpWards=false, sliceText=false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const highlightedItemRef = useRef(null);
  // Handle selection of an option
  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (form && setform) {
      setform((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle default selected
  useEffect(() => {
    if (form && form[id]) {
      setSelected(form[id]);
    } else {
      setSelected('');
    }
  }, [form, id]);
  // Handle initial highlighted index
  useEffect(() => {
    if (highlightedItemRef.current) {
      highlightedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

  // Validation trigger
  useEffect(() => {
    const fieldValue = form[id];
    if (fieldValue) {
      const error = runValidation(consumerProgressTackers[formState][0], form, id);
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (!error[id]) {
          delete newErrors[id];
        } else {
          newErrors[id] = error[id];
        }
        return newErrors;
      });
    }
  }, [form, formState, id, setFormErrors, selected]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelect(options[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className="w-full h-[51px] border border-[var(--border-primary)] rounded px-4 py-4 text-left text-sm bg-white focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] flex items-center justify-between "
      >
        <ChevronDown className='absolute right-2 w-4 h-4' />
        {sliceText && selected ? selected.slice(0, 42) : selected || 'Select an option'}
      </button>

      {isOpen && (
        // Dropdown menu should open upwards if openUpWards is true
        <ul className={`absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded shadow-md text-sm ${openUpWards ? 'bottom-full' : 'top-full'}`}>
          {options.map((option, index) => (
            <li
              key={index}
              ref={el => {
                if (index === highlightedIndex) highlightedItemRef.current = el;
              }}
              className={`px-3 py-2 cursor-pointer ${
                option === selected ? 'bg-blue-50 font-semibold' : ''
              } ${index === highlightedIndex ? 'bg-blue-100' : ''}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


