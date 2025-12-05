'use client';
import React, { useEffect, useRef, useState } from 'react';
import AgreementSigningSystem from '@/app/PageComponents/AgreementSigningSystem';

// CSS class constants for better maintainability
const CSS_CLASSES = {
  overlay: 'fixed inset-0 flex items-center justify-center z-50',
  container: 'bg-white p-6 rounded-lg shadow-xl max-w-xl border border-gray-300',
  heading: 'text-xl text-center border border-transparent border-b-gray-300 font-bold mb-4',
  scrollContainer: 'max-w-4xl mx-auto overflow-y-auto bg-white p-6 shadow-lg rounded-lg my-5',
  title: 'text-2xl font-bold mb-4 text-[var(--primary)]',
  introText: 'mb-6 italic text-sm text-gray-700',
  link: 'text-green-500',
  sectionHeading: 'text-xl font-semibold mb-2 text-[var(--primary)]',
  paragraph: 'mb-4 text-sm text-gray-700',
  listItem: 'list-disc my-3 pl-5 text-sm text-gray-700 space-y-1',
  boldText: 'font-bold',
  greenText: 'text-green-800',
  blueText: 'text-blue-800',
  consentText: 'text-xs text-gray-800',
  optOutContainer: 'flex flex-col gap-3 my-5',
  optOutCheckboxContainer: 'flex gap-3',
  checkbox: 'cursor-pointer',
  optOutLabel: 'cursor-pointer text-xs font-bold text-gray-700',
  optOutDescription: 'text-xs text-gray-600',
  buttonContainer: 'flex justify-end',
  agreeButton: 'mt-4 items-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700',
  disabledButton: 'opacity-50 pointer-events-none',
  enabledButton: 'opacity-100',
  actionButtonContainer: 'flex justify-end gap-2',
  okButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4',
  disagreeButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4'
};

/**
 * Form_Consent Component
 * Handles the consent form for biometric information
 * Displays the consent notice and allows the user to agree or disagree
 * Manages the scroll behavior and state of the form
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.setForm - Function to update form state
 * @param {Function} props.setFormState - Function to update form state
 * @param {Object} props.form - Form data object
 * @param {number} props.formState - Current form state/step
 * @param {Function} props.setReviewIndex - Function to set review index
 */
export default function Form_Consent({ setForm, setFormState, form, formState, setReviewIndex, guid, onAgreementAccepted }) {
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  /**
   * Handle scroll events to check if user has scrolled to bottom
   */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1; // small buffer
    setIsAtBottom(isBottom);
  };

  /**
   * Add scroll event listener to the scroll container
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Check if consent is given and scroll to bottom of consent notice
   */
  useEffect(() => {
    if (form['consent'] === true) {
      setIsAtBottom(true);
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight; // Scroll to bottom when consent is given
      }
    }
  }, [form['consent']]);

  // Handle agreement acceptance from the modal
  const handleAgreementAccepted = async (agreementData) => {
    try {
      console.log('Consumer agreement accepted in consent form:', agreementData);
      
      // Call the parent's agreement acceptance handler if provided
      if (onAgreementAccepted) {
        await onAgreementAccepted(agreementData);
      }
      
      // Proceed to next step after agreement is signed
      setFormState(formState === 1 ? 2 : 9);
      if (setReviewIndex) {
        setReviewIndex(null);
      }
    } catch (error) {
      console.error('Error in consent agreement acceptance:', error);
    }
  };

  return (
    <>
    {/* Agreement Signing Modal */}
    <AgreementSigningSystem
      show={showAgreementModal}
      agreementType="consumer"
      agreementUrl="/agreements/consumer_agreement.pdf"
      userId={guid || 'temp-guid'}
      userName={`${form.firstName || ''} ${form.lastName || ''}`.trim() || 'User'}
      onAgreementAccepted={handleAgreementAccepted}
      onClose={() => setShowAgreementModal(false)}
    />
    
    {/* Only show consent popup when agreement modal is not open */}
    {!showAgreementModal && (
    <div className={CSS_CLASSES.overlay}>
      <div className={CSS_CLASSES.container}>
        <h1 className={CSS_CLASSES.heading}>NOTICE AND CONSENT</h1>

        <div 
          ref={scrollRef} 
          className={`${CSS_CLASSES.scrollContainer} ${form['optOutCheckBox'] ? 'max-h-40' : 'max-h-60'}`}
        >
          <h1 className={CSS_CLASSES.title}>Biometric Information Privacy Statement</h1>
          <p className={CSS_CLASSES.introText}>
            This Biometric Information Privacy Policy describes how Ginicoe collects and uses certain Biometric Information, including facial geometry, in connection with the Services we provide.
            Please carefully review this Biometric Information Privacy Policy prior to consenting to our collection and use of your Biometric Information. Please note that once consent has been provided for the collection and processing of Biometric Information as part of your verification it may not be revoked where it is required to complete the transaction for which it was collected, or to complete the verification Services.
            Additionally, by consenting to the collection and use of your Biometric Information you acknowledge that you have been provided with, and agree to be bound by, the <span className={CSS_CLASSES.link}>Ginicoe Terms of Service</span> and the <span className={CSS_CLASSES.link}>Ginicoe Privacy Policy</span>.
          </p>
          <h2 className={CSS_CLASSES.sectionHeading}>Biometric Information Privacy Policy</h2>
          <p className={CSS_CLASSES.paragraph}>
            Biometric Information is a form of Personal Information related to biometric characteristics which may be used to identify you. Common examples include fingerprints, voiceprints, scans of a hand, facial geometry recognition, and iris or retina recognition. As used in this policy, Biometric Information includes any &#34;biometric identifiers&#34; or &#34;biometric information&#34; as defined under applicable law.
          </p>
          <div className="space-y-6">
            <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>1. What is Biometric Information?</h3>
            <p className={CSS_CLASSES.paragraph}>
              Biometric Information is a form of Personal Information related to biometric characteristics which may be used to identify you. Common examples include fingerprints, voiceprints, scans of a hand, facial geometry recognition, and iris or retina recognition. As used in this policy, Biometric Information includes any &#34;biometric identifiers&#34; or &#34;biometric information&#34; as defined under applicable law.
            </p>
            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>2. What Biometric Information Do We Collect?</h3>
              <div className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>The information we collect will vary depending on the specific type of Services you request.</span> Many Ginicoe Services do not require Biometric Information, however certain Services - those requiring a <span className={CSS_CLASSES.greenText}>NIST 800-63A IAL2</span> credential, such as the Internal Revenue Service (IRS), Office of Veterans Affairs (VA), or certain state unemployment or labor departments - may require a higher level of assurance for your identity verification. When you sign up for an applicable Ginicoe Service we may collect the following Biometric Information:
                <ul className={CSS_CLASSES.listItem}>
                  <li><span className={CSS_CLASSES.boldText}>Facial Biometrics:</span> {`Our Service may require you to upload an image of your government issued or other identification document(s) as well as your photographic image or "selfie" photograph using your mobile or other device. We use these images to create a facial geometry or faceprint which we use for purposes of identity verification and to prevent the creation of multiple accounts in a fraudulent manner.`}</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>3. How Do We Use Your Biometric Information?</h3>
              <p className={`text-sm ${CSS_CLASSES.boldText} mx-3 text-gray-700`}>
                We use your Biometric Information only as follows:
              </p>
              <ul className="list-disc pl-5 mx-4 my-2 text-sm text-gray-700 space-y-1">
                <li>To verify your identity when you are opening an account or using our Services;</li>
                <li>To authenticate use of your account and the Services for a point of interaction transaction and scoring. This is materially consistent with our terms under which your biometric is originally collected;</li>
                <li>To prevent fraudulent uses of Ginicoe&#39;s Services or the creation of multiple accounts; and</li>
                <li>To comply with legal obligations or comply with a request from law enforcement or government entities where not prohibited by law.</li>
              </ul>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>4. Do We Share or Disclose Your Biometric Information?</h3>
              <p className={`text-sm ${CSS_CLASSES.boldText} mx-3 text-gray-700`}>
                Ginicoe will only share your Biometric Information with our partners in the following circumstances:
              </p>
              <ul className="list-disc pl-5 mx-4 my-2 text-sm text-gray-700 space-y-1">
                <li>As required with other third parties where permitted by law to enforce our <span className={CSS_CLASSES.greenText}>Terms of Service</span>, to comply with legal obligations, or to cooperate with law enforcement agencies concerning conduct or activity that we reasonably believe may violate federal, state, or local law when required by a subpoena, warrant, or other court ordered legal action, and to prevent harm, loss or injury to others.</li>
                <li>To third party service providers that perform functions on our behalf. These service providers are limited to using the Biometric Information to assist in our provision of Services such as a financial transaction that you authorized or requested or your legally authorized representative, and must process any Biometric Information we share in a secure fashion.</li>
              </ul>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>5. Do We Sell Your Biometric Information?</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>Ginicoe will not sell, rent, or trade your Biometric Information.</span> Your Biometric Information will only be used by Ginicoe to verify your identity in accordance with the guidelines published by the <span className={CSS_CLASSES.greenText}>National Institute for Standards and Technology</span> or as required for the prevention of fraud. In fulfilling our Services to you, Ginicoe will transfer your Biometric Information to our third party partners only when required by a subpoena, warrant, or other court ordered legal action.
              </p>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>6. How Long Does Ginicoe Retain My Biometric Information?</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>Ginicoe may retain your Biometric Information indefinitely.</span> Ginicoe collects and processes your Biometric Information in order to verify your identity and help prevent fraud. Biometric Information is retained in line with Ginicoe&#39;s obligations first to you and secondly to our partners, with the specific retention periods determined by you. You have the right to close you&#39;re account with us resulting in deletion of your biometric. Your account may become inactive during a 36 month continguous time period at which time your biometric will be deleted and you will have to re-enroll to use our services again. Certain partners may require your biometric to be purged within twenty-four (24) hours following a successful verification such as at a grocery store, other partners may require a longer retention period such as during a home mortgage loan process, but under no circumstances will Ginicoe retain your biometric information outside these conditions absent a subpoena, warrant, or other legally compelling justification.
              </p>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>7. Can I Request that Ginicoe Delete My Biometric Information?</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>Yes, you may direct Ginicoe to delete your Biometric Information.</span> After closing your account, you may request that Ginicoe delete your Biometric Information. You may request the deletion of both the selfie image and Biometric Information submitted during your enrollment by submitting a request through the Ginicoe &#34;Privacy Rights Center&#34; which is accessible via a link at the bottom of our Website, or under the &#34;Privacy&#34; setting in your account. Deletion of the selfie image and associated Biometric Information may take up to seven (7) days. Ginicoe reserves the right to retain this information as needed to comply with our legal obligations, including warrants, subpoenas or other court orders, or to help prevent fraud.

                Pursuant to the California Consumer Privacy Act of 2018 (CCPA), residents of California are entitled to additional rights and disclosures regarding their Personal information, including Biometric Information. Please see our <span className={CSS_CLASSES.greenText}>Notice to California Residents</span> for additional details regarding these disclosures and how to exercise your rights.

                Pursuant to the Washington State Biometric Privacy Law, The Illinois Biometric Information Privacy Act (<span className={CSS_CLASSES.blueText}>BIPA</span>), The Texas Capture Or Use of Biometric Identifier (<span className={CSS_CLASSES.blueText}>Cubi</span>), New York City Biometric Privacy Act, Oregon, Colorado, Utah, Maryland, and Tennessee residents of these States are entitled to additional rights and disclosures regarding their Personal information, including Biometric Information.
              </p>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>8. Can I Refuse to Provide My Biometric Information?</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>Yes, you may refuse to consent for the collection of your Biometric Information.</span> Please note that if you refuse to consent to the collection and processing of your Biometric Information then we may not be able to verify you at the required level of assurance for use of all of our Services. Additionally, it may directly impact our methods and systems associated with your geographic Social Justic Outerchange Rating (SoJOR).
              </p>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>9. What Kind of Storage and Security Do You Use?</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>We are committed to protecting your information.</span> We have adopted technical, administrative, and physical security procedures, beyond other confidential and sensitive information, to help protect your information from loss, misuse, unauthorized access, and alteration. Please note that no data transmission or storage can be guaranteed to be 100% secure.
                <br />
                <br />
                <span className={CSS_CLASSES.boldText}>We employ appropriate security safeguards.</span> To safeguard certain sensitive information (such as Biometric Information and government-issued identification information), we implement security measures such as encryption, firewalls, and intrusion detection and prevention systems.
              </p>
            </div>

            <div>
              <h3 className={`font-bold ${CSS_CLASSES.greenText} mb-1`}>10. Changes</h3>
              <p className={CSS_CLASSES.paragraph}>
                <span className={CSS_CLASSES.boldText}>This Biometric Information Privacy Policy may be periodically updated.</span> From time-to-time we may update this policy to reflect new features or changes in our Personal Information practices or our Services. We will post a notice for users at the top of this Privacy Policy addressing any significant changes.
              </p>
            </div>
          </div>
        </div>
        
        <p className={CSS_CLASSES.consentText}>By selecting I AGREE, you concur that you have read and received this notice and consent and VOLUNTARILY OPT-IN to enroll your biometric for Ginicoe products and services.</p>
        
        <div className={CSS_CLASSES.optOutContainer}>
          <div className={CSS_CLASSES.optOutCheckboxContainer}>
            <input 
              type="checkbox" 
              id="optOutCheckbox" 
              className={CSS_CLASSES.checkbox} 
              checked={form['optOutCheckbox'] || false}
              onChange={(e) => {
                setForm(prev => ({
                  ...prev,
                  'optOutCheckbox': e.target.checked
                }));
              }}
            />
            <label htmlFor="optOutCheckbox" className={CSS_CLASSES.optOutLabel}>Opt-out</label>
          </div>
          {
            form['optOutCheckbox'] &&
            <p className={CSS_CLASSES.optOutDescription}>You have the right to opt-out and not enroll your biometric. However please be advised, that this may impact your SoJOR and disallow Ginicoe and our partners from actively protecting you with our products and services. Additionally, you will not be pulling your weight to help make our Nation a more peaceful perfect union. Remember - unequal societies tend to be more violent.</p>
          }
        </div>
        
        {!form['consent'] ? (
          <div className={CSS_CLASSES.buttonContainer}>
            <button 
              className={`${CSS_CLASSES.agreeButton} ${isAtBottom ? CSS_CLASSES.enabledButton : CSS_CLASSES.disabledButton}`}
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  consent: true
                }));
                // Show agreement signing modal instead of directly proceeding
                setShowAgreementModal(true);
              }}
            >
              I Agree
            </button>
          </div>
        ) : (
          <div className={CSS_CLASSES.actionButtonContainer}>
            <button 
              className={CSS_CLASSES.okButton}
              onClick={() => {
                // Show agreement signing modal
                setShowAgreementModal(true);
              }}
            >
              OK
            </button>
            <button 
              className={CSS_CLASSES.disagreeButton}
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  consent: false
                }));
                setFormState(formState === 1 ? 2 : 9); // Move to next step after consent
                setReviewIndex(null); // Set review index to 1
              }}
            >
              I Disagree
            </button>
          </div>
        )}
      </div>
    </div>
    )}
    </>
  );
}