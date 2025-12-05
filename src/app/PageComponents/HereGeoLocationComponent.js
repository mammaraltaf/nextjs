'use client';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { runValidation } from '../Resources/ValidationFunctions';
import { ChevronRight } from 'lucide-react';
import { buildAddress } from '../Resources/functions';

// HereGeoLocationComponent component
// This component allows users to input an address and fetch suggestions from a Smarty API.
export default function HereGeoLocationComponent({  section, id, form, setform, setFormErrors,setVerifiedAddress, classes = '' }) {
  const dropdownRef = useRef(null);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]);
  // Handle input change and fetch suggestions
  const handleInput = async(e) => {
    try {
      let updatedForm  = { ...form };
      delete updatedForm['verified_' + id];
      setform({
        ...updatedForm,
        [id]: e.target.value,
      });
      if (e.target.value.length < 3 || e.target.value.split(' ').length < 2) return
      const response = await fetch(`/api/smarty-autocomplete?search=${e.target.value.replaceAll(' ', '+')}`);
   
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      let suggestions = data.suggestions;
      setItems(suggestions);
      setOpen(suggestions.length > 0 ? true : false);
      let errors = runValidation(section, updatedForm, id);
      setFormErrors({ ...errors });
      if (setVerifiedAddress) {
        setVerifiedAddress({});
      }
    } catch (error) {
      
    }
  };
  // Handle selection of an address
  const handleSelect = async (addressObj) => {
    if(addressObj.entries && addressObj.entries > 1) {
      const entry = buildAddress(addressObj);
      const response = await fetch(`/api/smarty-autocomplete?search=${form[id].replaceAll(' ', '+')}&selected=${entry}`);

      if (!response.ok) {
       console.error('Error fetching data:', response.statusText);
       return;
      }
      const data = await response.json();
      setItems(data.suggestions);
      return;
    }
    // Construct the address text from the selected object
    let addressText = `${addressObj.street_line}${addressObj.secondary ? ' ' + addressObj.secondary : ''}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipcode}`;
    verifyAddressByHere(addressText, addressObj);

  };
  // Verify address using USPS API to get ZIP+4
  const verifyAddressByHere = async (addressText, addressObj) => {
    try {
      // Fetch the address details including ZIP+4 from USPS API
      try {
          // Construct street address
          const street = `${addressObj.street_line}${addressObj.secondary ? ' ' + addressObj.secondary : ''}`;

          // Call API
          const response = await fetch(
              `/api/smarty-verify?street=${encodeURIComponent(street)}&city=${encodeURIComponent(addressObj.city)}&state=${encodeURIComponent(addressObj.state)}&zipcode=${encodeURIComponent(addressObj.zipcode)}`
          );

          let zipCode = addressObj.zipcode; // Default to 5-digit ZIP
      } catch (error) {
          console.error(error);
      }
      
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        // Fall back to original address if verification fails
        addressText = `${street}, ${addressObj.city}, ${addressObj.state} ${zipCode}`;
      } else {
        const data = await response.json();

        // Extract ZIP+4 from USPS response
        if (data && data.success && data.zipPlus4) {
          zipCode = data.zipPlus4; // Use ZIP+4 if available
          addressText = `${street}, ${addressObj.city}, ${addressObj.state} ${zipCode}`;
        } else {
          // Fall back to original address if no ZIP+4 found
          addressText = `${street}, ${addressObj.city}, ${addressObj.state} ${zipCode}`;
        }
      }

      setform((prev) => ({
        ...prev,
        [id]: addressText,
        [`verified_${id}`]: true, // Mark as verified (boolean for Laravel)
        [`verified_${id}_value`]: addressText, // Store the actual verified address
      }));
      setOpen(false);
      if(setVerifiedAddress){
        // Create structure compatible with government form expectations
        const verifiedData = {
          address: addressText,
          id: id,
          items: [{
            address: {
              label: addressText,
              county: '', // Not available from Smarty autocomplete
              city: addressObj.city,
              state: addressObj.state,
              subdistrict: '', // Not available from Smarty autocomplete
              postalCode: zipCode
            }
          }]
        };
        console.log('Setting verified address:', id, verifiedData);
        setVerifiedAddress(verifiedData);
      }
      let errors = runValidation(section, { ...form, [id]: addressText, [`verified_${id}`]: true, [`verified_${id}_value`]: addressText }, id);
      setFormErrors({ ...errors });
      
    } catch (error) {
      console.error('Error verifying address:', error);
      // Fall back to original address on error
      const street = `${addressObj.street_line}${addressObj.secondary ? ' ' + addressObj.secondary : ''}`;
      addressText = `${street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipcode}`;

      setform((prev) => ({
        ...prev,
        [id]: addressText,
        [`verified_${id}`]: true, // Mark as verified (boolean for Laravel)
        [`verified_${id}_value`]: addressText, // Store the actual verified address
      }));
      setOpen(false);
      if(setVerifiedAddress){
        // Create structure compatible with government form expectations (fallback)
        const verifiedData = {
          address: addressText,
          id: id,
          items: [{
            address: {
              label: addressText,
              county: '',
              city: addressObj.city,
              state: addressObj.state,
              subdistrict: '',
              postalCode: addressObj.zipcode
            }
          }]
        };
        console.log('Setting verified address (fallback):', id, verifiedData);
        setVerifiedAddress(verifiedData);
      }
    }
  };
  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); // Close the dropdown if clicked outside
        setItems([]); // Clear items when dropdown is closed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
        {form[`verified_${id}`] && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <Image
                    src="/check.svg"
                    alt="Verified"
                    width={15}
                    height={15}
                    className="w-4 h-4"
                  />
                </div>
              )}
      <input
         autoComplete="off"
        value={form[id] || ''}
          onChange={handleInput}
          className={`w-full h-[31px] border border-[var(--border-primary)] p-4 rounded text-left text-sm  focus:outline-none pr-3 ${classes} ${
          form[`verified_${id}`] ? '!pl-8' : 'pl-3'
        }`}
      />
      {open  && (
        <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded shadow-md text-sm">
          {items.map((item,index) => (
            //item.includes('USA') && 
            <li
              key={index}
              className="flex justify-between p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              <div className='flex flex-col justify-between'>{`${item.street_line}, ${item.secondary? item.secondary + ', ' : ''}${item.city}, ${item.state}, ${item.zipcode}`}</div>
              {
                item.entries && item.entries > 1? (
                  <div className='flex gap-1 text-[var(--primary)] items-center !font-bold !text-sm'>
                    {`+ ${item.entries} Addresses`}
                    <ChevronRight className='w-3 h-3' />
                  </div>
                ) : null
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
