import FaceScanHud from '@/app/PageComponents/FaceScanHud';
import ToggleButton from '@/app/PageComponents/ToggleButton';
import { consumerProgressTackers } from '@/app/Resources/Variables';
import React from 'react';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  container: 'flex-1 relative mr-3 px-4 py-5 bg-white',
  heading: 'text-lg mb-4 font-semibold text-[var(--primary)]',
  legalMessage: 'relative group text-xs text-gray-600 mt-4 italic w-fit',
  legalMessageText: 'text-gray-500 block',
  tooltipOverlay: 'absolute inset-0 z-40 hidden group-hover:block bg-black/30 rounded transition-opacity duration-300',
  tooltipContent: 'absolute z-50 opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-300 top-full mt-2 w-96 bg-white border border-gray-300 shadow-xl p-4 text-xs text-gray-700 rounded-md pointer-events-none',
  tooltipParagraph: 'mb-2',
  tooltipSource: 'text-gray-500 italic',
  note: 'text-sm text-gray-700 mt-4',
  noteBold: 'font-bold',
  toggleSection: 'mt-6 flex flex-col gap-4'
};

/**
 * Form_FaceRecognition Component
 * Renders the Face Recognition form for the consumer dashboard
 * Includes a HUD-style face capture box, legal messages, and opt-in toggles
 * 
 * @param {Object} props - Component properties
 * @param {number} props.formState - Current form state/step
 * @param {Object} props.form - Form data object
 * @param {Function} props.setForm - Function to update form state
 * @param {Function} props.setShowTutorial - Function to control tutorial visibility
 * @param {Function} props.setCurrentStep - Function to set current step
 */
export default function Form_FaceRecognition({ formState, form, setForm, setShowTutorial, setCurrentStep }) {
  return (
    <div className={CSS_CLASSES.container}>
      {formState !== 9 && (
        <h3 className={CSS_CLASSES.heading}>
          {consumerProgressTackers[formState]}
        </h3>
      )}
      
      {/* HUD-style Face Capture Box */}
      <FaceScanHud setShowTutorial={setShowTutorial} setCurrentStep={setCurrentStep} />

      {/* Legal + Cultural Message */}
      <div className={CSS_CLASSES.legalMessage}>
        Islamic Law permits a woman to uncover her face and hands when buying or selling...
        <span className={CSS_CLASSES.legalMessageText}>
          (source: Ibn Qudaamah, al-Mughni, 7/459)
        </span>

        {/* Tooltip overlay background */}
        <div className={CSS_CLASSES.tooltipOverlay}></div>

        {/* Tooltip content box */}
        <div className={CSS_CLASSES.tooltipContent}>
          <p className={CSS_CLASSES.tooltipParagraph}>
            Islamic Law permits a woman to uncover her face and hands when buying or selling, and it is permitted for the vendor to see her face when he hands over the goods and asks for the money, provided that this will not lead to <em>fitnah</em> – otherwise it is forbidden.
          </p>
          <p className={CSS_CLASSES.tooltipParagraph}>
            Ibn Qudaamah said: &#34;If a person deals with a woman when selling or renting, he may look at her face so he knows who she is, and may go back to her when the money is due (a guarantee of the price when the deal is finalized). It was reported that Ahmad said this was <em>makrooh</em> in the case of a young woman, but not in the case of an old woman, and in the case where there is fear of <em>fitnah</em>, or where there is no need for this business deal. But in cases where it is necessary, and there is no wrongful desire, then there is no harm in it.&#34;
          </p>
          <p className={CSS_CLASSES.tooltipSource}>
            (al-Mughni, 7/459; al-Sharh al-Kabeer &#39;ala Matan al-Muqni&#39;, 7/348 bi Haamish al-Mughni; al-Hidaayah ma&#39;a Takmilat Fath al-Qadeer, 10/24)
          </p>
        </div>
      </div>
      
      {/* Ginicoe Note */}
      <div className={CSS_CLASSES.note}>
        <strong className={CSS_CLASSES.noteBold}>Note:</strong> Ginicoe reserves the right to request an updated facial image from you anytime in the future to continue to meet our high quality standards to prevent identity theft.
      </div>

      {/* Opt-in Toggles */}
      <div className={CSS_CLASSES.toggleSection}>
        <ToggleButton 
          id={'optInSeeMe'} 
          label={'Do you wish to opt-in for counter-part consent for your global look-alike to see you?'} 
          required={false} 
          form={form} 
          setform={setForm} 
        />
        <ToggleButton 
          id={'optInSeeLookalike'} 
          label={'Do you wish to opt-in for counter-part consent to see your global look-alike?'} 
          required={false} 
          form={form} 
          setform={setForm} 
        />
      </div>
    </div>
  );
}