import React, {  useEffect, useRef, useState } from 'react'
import { consumerProgressTackers } from '../Resources/Variables';
import { runValidation } from '../Resources/ValidationFunctions';

// AutoDropDownMenu component
// This component is a custom dropdown menu that allows users to select options from a list.

export default function AutoDropDownMenu({ options, id, form, formState, setform, setFormErrors, classes = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const highlightedItemRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  // Initialize filtered options with the full list of options
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
  // Handle input value
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
    <div className={`${classes} relative`} ref={dropdownRef}>
      <input
      className={`w-full p-4`}
        type="text"
        onClick={() => {
          setIsOpen(true);
          setHighlightedIndex(0);
          setFilteredOptions(filteredOptions.length > 0 ? filteredOptions : options);
        }}
        onKeyDown={handleKeyDown}
        value={form[id]? form[id] : inputValue}
        onChange={(e) => {
          let value = e.target.value;
          //value = SanitizeInput(value, compiledBlockedTerms);
          setInputValue(value);

          const filtered = options.filter(option =>{
            //console.log(value,option ,option.toLowerCase().includes(value.toLowerCase()))
            return option.toLowerCase().includes(value.toLowerCase())
          });
          //delete existing form value by id
          let newForm = { ...form };
          delete newForm[id];
          setform(newForm);
          if(filtered.length === 0) {
            setFilteredOptions(options)
          }else{
            setFilteredOptions(filtered);
          }
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded shadow-md text-sm">
          {filteredOptions.map((option, index) => (
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


