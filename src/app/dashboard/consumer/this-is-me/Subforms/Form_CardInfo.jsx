'use client';
import { getCardType } from '@/app/Resources/functions';
import { consumerProgressTackers } from '@/app/Resources/Variables';
import { PlusCircle, Trash } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 gap-5 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  cardContainer: 'flex flex-col mt-5 gap-3 shadow-lg p-4 rounded-lg bg-gray-50',
  cardHeader: 'flex gap-2 items-center text-lg font-semibold',
  deleteButton: 'w-7 h-7 text-red-500 right-2 top-2 cursor-pointer rounded-full p-1 hover:bg-gray-300 transition-colors duration-300',
  grid: 'grid grid-cols-2 w-full gap-2',
  fieldContainer: 'flex relative gap-1 flex-col',
  label: 'text-gray-600',
  required: 'text-red-500 font-bold',
  input: 'w-full bg-white p-4 border-2 border-gray-700 rounded-md',
  cardImage: 'absolute right-2 top-5',
  error: 'text-red-500 text-xs',
  addButtonContainer: 'flex flex-col justify-between mt-4',
  addButton: 'flex gap-2 group group-hover:text-[var(--primary)] items-center',
  addIcon: 'w-5 h-5 text-[var(--primary)] group-hover:text-white rounded-full group-hover:bg-[var(--primary)] transition-all duration-200',
  addText: 'group-hover:text-[var(--primary)]',
  cardError: 'text-red-500 mt-4 text-xs'
};

// Card fields configuration
const CARD_FIELDS = [
  { id: 'card_number', autoComplete: 'cc-number', label: 'Card Number', type: 'card', required: true },
  { id: 'nick_name', autoComplete: 'cc-nickname', label: 'Nick Name', type: 'text', required: false },
  { id: 'primary_card_holder_first_name', autoComplete: 'cc-name', label: 'Primary Card Holder First Name', type: 'text', required: true },
  { id: 'primary_card_holder_last_name', autoComplete: 'cc-family-name', label: 'Primary Card Holder Last Name', type: 'text', required: true }
];

/**
 * Form_CardInfo Component
 * Handles the card information form for the consumer dashboard
 * Allows users to add, edit, and delete credit card information
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {number} props.formState - Current form state/step
 * @param {string} props.addCardError - Error message for card addition
 * @param {Object} props.formErrors - Form validation errors
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.setDeleteCard - Function to delete a card
 */
export default function Form_CardInfo({ form, setForm, formState, addCardError, formErrors, handleChange, setDeleteCard }) {
  /**
   * Handle changes in card information fields
   * Splits full name into first and last name components
   * 
   * @param {Event} e - Input change event
   * @param {number} index - Index of the card being edited
   */
  const handleCardholderName = (e, index) => {
    const { id, value } = e.target;
    if (id !== 'primary_card_holder_first_name') return;
    
    const fullName = value.trim();
    const [first = '', ...rest] = fullName.split(' ');
    const last = rest.join(' '); // handles middle names too
    
    let cardInfo = form.card_info || [];
    cardInfo[index] = { 
      ...cardInfo[index], 
      primary_card_holder_first_name: first,
      primary_card_holder_last_name: last
    };

    setForm((prev) => ({
      ...prev,
      card_info: cardInfo
    }));
  };

  /**
   * Render card fields for a specific card
   * 
   * @param {Object} card - Card data
   * @param {number} index - Index of the card
   * @returns {JSX.Element} Card fields JSX
   */
  const renderCardFields = (card, index) => {
    return CARD_FIELDS.map((field, innerIndex) => (
      <div className={CSS_CLASSES.fieldContainer} key={innerIndex}>
        <label className={CSS_CLASSES.label}>
          {field.label} {field.required && <span className={CSS_CLASSES.required}>*</span>}
        </label>
        <div>
          <input 
            type={field.type} 
            className={CSS_CLASSES.input}
            id={field.id}
            name={field.label}
            value={card[field.id] || ''}
            onChange={(e) => {
              handleChange(e, index);
              handleCardholderName(e, index);
            }}
            autoComplete={field.autoComplete || 'off'}
          />
          {
            field.type === 'card' && (
              <Image 
                className={CSS_CLASSES.cardImage}
                src={`/${getCardType(card[field.id])}.svg`} 
                alt="Card Image" 
                width={30} 
                height={30} 
              />
            )
          }
        </div>
        <div className={CSS_CLASSES.error}>
          {formErrors?.card_info?.[index]?.[field.id]}
        </div>
      </div>
    ));
  };

  /**
   * Add a new card to the form
   */
  const addNewCard = () => {
    const newCard = { 
      card_number: '', 
      nick_name: '', 
      primary_card_holder_first_name: '', 
      primary_card_holder_last_name: '' 
    };
    
    if (!form.card_info) {
      setForm((prev) => ({
        ...prev,
        card_info: [newCard]
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        card_info: [...prev.card_info, newCard]
      }));
    }
  };

  return (
    <div className={CSS_CLASSES.container}>
      {formState !== 9 && (
        <h3 className={CSS_CLASSES.heading}>
          {consumerProgressTackers[formState]}
        </h3>
      )}
      
      {/* Credit Card Information Section */}
      {form.card_info?.map((card, index) => (
        <div className={CSS_CLASSES.cardContainer} key={index}>
          <h2 className={CSS_CLASSES.cardHeader}>
            Card {index + 1}
            <Trash 
              className={CSS_CLASSES.deleteButton} 
              onClick={() => setDeleteCard(index)}
            />
          </h2>
          
          <div className={CSS_CLASSES.grid}>
            {renderCardFields(card, index)}
          </div>
        </div>
      ))}
      
      <div className={CSS_CLASSES.addButtonContainer}>
        <button 
          className={CSS_CLASSES.addButton}
          onClick={addNewCard}
        >
          <PlusCircle className={CSS_CLASSES.addIcon} />
          <span className={CSS_CLASSES.addText}>
            {!form.card_info ? 'Add Card' : `Add Another Card`}
          </span>
        </button>
        
        <div className={CSS_CLASSES.cardError}>
          {!form.card_info && addCardError && <span>{addCardError}</span>}
        </div>
      </div>
    </div>
  );
}