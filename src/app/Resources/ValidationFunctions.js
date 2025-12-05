import disposableDomains from './disposable-domains.json';
import { olderThan2Years } from './functions';

// Following function checks if a given email is from a disposable domain.
function isDisposableEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        return disposableDomains.includes(domain);
  }
// This function validates a fax number by checking its format.
function isValidFaxNumber(fax) {
    
        const pattern = /^\(\d{3}\)\s\d{3}\s*-\s*\d{4}$/;

        return pattern.test(fax)
          ? true
          : 'Invalid fax number format. Use (123) 456 - 7890';
        }
// This function validates a float percentage value.
function isValidFloatPercent(value) {
  if (!value) return 'This Field is required';

  // Allow 1–2 digit integer (e.g., 1 to 99) OR 1–2 digit + exactly two decimals, both with optional %
  const floatPattern = /^(?:\d{1,2}%?|\d{1,2}\.\d{2}%?)$/;

  if (!floatPattern.test(value)) {
    return 'Invalid format. Use xx.xx or xx';
  }

  return true;
}
// This function validates a URL to ensure it is in a proper format and not disposable.
function isValidSiteUrl(url) {  
        if (!url) return 'This Field is required';
        // Regular expression to validate URL format
        // should start with http:// or https://, followed by domain and should include .com or .org or .net etc.
        const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
        if (!urlPattern.test(url)) {
          return 'Invalid URL format';
        }
        // Check if the URL is disposable
        const urlParts = url.split('/');
        let domain = urlParts[2] || urlParts[0]; // Get the domain part
       
        domain = domain.split('.')[1]; // Remove subdomains if any
        if (!domain) return 'Invalid URL format';
        domain = domain.toLowerCase()+ '.com'; // Normalize to .com for disposable check
        if (disposableDomains.includes(domain)) {
          return 'Disposable URLs are not allowed';
        }
        return true;
}
// Following function applies Luhn algorithm to validate a credit card number.
export function isValidLuhn(number) {
          const digits = number.replace(/\D/g, '').split('').reverse().map(Number);
          const sum = digits.reduce((acc, digit, i) => {
              if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit -= 9;
              }
              return acc + digit;
            }, 0);
            return sum % 10 === 0;
        }
// Following function validates an office phone number.
function isValidOfficePhoneNumber(input, required = true) {
  // Format: (123) 456-7890
  if(!input && !required) return true; // If not required and no value, return true
  const pattern = /^\(\d{3}\)\s\d{3}\s*-\s*\d{4}$/;

  if (!pattern.test(input)) {
    return 'ex: (123) 456 - 7890';
  }

  return true;
  }
// Following function validates a Social Security Number (SSN).
function isValidSSN(input) {
  if (!input) return false;

  // Acceptable formats: XXX-XX-XXXX or 9-digit number
  const validFormat = /^\d{3}-\d{2}-\d{4}$|^\d{9}$/.test(input);
  if (!validFormat) return false;

  // Remove hyphens and keep only digits
  const ssn = input.replace(/\D/g, '');

  // Must be exactly 9 digits
  if (ssn.length !== 9) return false;

  const area = ssn.substring(0, 3);
  const group = ssn.substring(3, 5);
  const serial = ssn.substring(5, 9);

  // Reject all same-digit SSNs (e.g., 111111111)
  if (/^(\d)\1{8}$/.test(ssn)) return false;

  // Area number rules
  if (area === '000' || area === '666' || Number(area) >= 900) return false;

  // Group number rules
  if (group === '00') return false;

  // Serial number rules
  if (serial === '0000') return false;

  // Explicitly blacklisted SSNs
  const blacklistedSSNs = ['078051120', '219099999', '123456789'];
  if (blacklistedSSNs.includes(ssn)) return false;

  return true;
  }
// Runs validation based on the section and form data provided.
// It uses a predefined validation schema to validate each field in the form data.
// Returns an object containing the validation results for each field.
export function runValidation(section, formData, changedField = null) {

    let validationSchema = {
        my_pedigree_info: {
          firstName: validateName('First name',26, true,' Use your first 26 characters only.'),
          middleInitial: validateName('Middle initial',26, false, 'Use your first 26 characters only.'),
          lastName: validateName('Last name',26, true,' Use your first 26 characters only.'),
          nickName: validateName('Nickname',26, false, 'Use your first 26 characters only.'),
          suffix: (value) => {
            if (!value) return 'Suffix is required';
            return true;
          },
          dateOfBirth: (value) => {
            if (!value) return 'Date of Birth is required';
            const dobValidation = validateDOB(value);
            if (dobValidation !== 'Valid') return dobValidation;
            return true;
          },
          socialSecurityNumber: (value) => {
            if (!isValidSSN(value)) return 'Invalid Social Security Number';
            return true;
          },
          verifySocialSecurityNumber: (value) => {
            if (!value) return 'Verification of Social Security Number is required';
            if (!formData.socialSecurityNumber) return 'Social Security Number is required to verify';
            if (!isValidSSN(value)) return 'Invalid Social Security Number';
            if (formData.socialSecurityNumber !== value) return 'Social Security Number does not match';
            return true;
          },
          branchOfService: (value) => {
            if (formData.areYouUSVeteran && !value) return 'Branch of Service is required if you are a US Veteran';
            return true;
          },
          startDate: (value) => {
            if (!value && formData.areYouUSVeteran) return 'Start Date is required';
            const startDate = new Date(value);
            const today = new Date();
            if (startDate > today) return 'Start Date cannot be in the future';
            return true;
          },
          endDate: (value) => {
            if (!value && formData.areYouUSVeteran) return 'End Date is required';
            const endDate = new Date(value);
            const today = new Date();
            if (endDate > today) return 'End Date cannot be in the future';
            return true;
          },
        },
        'Notice and Consent for Biometric': {
          'consent': (value) => {
            if (value !== true) return 'You must agree to the consent terms';
            return true;
          },
        },
        address:{
          'current_us_address': (value) => {
            if (!value) return 'Current US Address is required';
            if (formData.verified_current_us_address !== true) {
              return 'Current US Address must be verified';
            }
            return true;
          },
          'moveInDate': (value) => {
            if (!value) return 'Move In Date is required';
            const moveInDate = new Date(value);
            const today = new Date();
            if (moveInDate > today) return 'Move In Date cannot be in the future';
            return true;
          },
          'previous_us_address': (value) => {
            if(!formData.moveInDate || olderThan2Years(formData.moveInDate)) return true; // Skip validation if not applicable
            if (!value) return 'Previous US Address is required';
            if (formData.verified_previous_us_address !== true) {
              return 'Previous US Address must be verified';
            }
            return true;
          }
        },
        gender_identity_information:{
          'identityatbirth': (value) => {
            if (!value) return 'Identity at Birth is required';
            return true;
          },
          'legalsex': (value) => {
            if (!value) return 'Legal Sex is required';
            return true;
          },
          'selfidentity': (value) => {
            if (!value) return 'Self Identity is required';
            return true;
          }
        },
        ethnicity_information: {
          'ethnicity': (value) => {
            if (!value) return 'Ethnicity is required';
            return true;
          }
        },
        my_neighbors_are:{
          'right_neighbor_address': (value) => {
            if (!value) return 'Right Neighbor Address is required';
            if (formData.verified_right_neighbor_address !== true) {
              return 'Right Neighbor Address must be verified';
            }
            return true;
          },
          'left_neighbor_address': (value) => {
            if (!value) return 'Left Neighbor Address is required';
            if (formData.verified_left_neighbor_address !== true) {
              return 'Left Neighbor Address must be verified';
            }
            return true;
          },
          'front_neighbor_address': (value) => {
            if (!value) return 'Front Neighbor Address is required';
            if (formData.verified_front_neighbor_address !== true) {
              return 'Front Neighbor Address must be verified';
            }
            return true;
          },
          'back_neighbor_address': (value) => {
            if (!value) return 'Back Neighbor Address is required';
            if (formData.verified_back_neighbor_address !== true) {
              return 'Back Neighbor Address must be verified';
            }
            return true;
          },
          'right_neighbor_race': (value) => {
            if (!value) return 'Right Neighbor Race is required';
            return true;
          },
          'left_neighbor_race': (value) => {
            if (!value) return 'Left Neighbor Race is required';
            return true;
          },
          'front_neighbor_race': (value) => {
            if (!value) return 'Front Neighbor Race is required';
            return true;
          },
          'back_neighbor_race': (value) => {
            if (!value) return 'Back Neighbor Race is required';
            return true;
          },
        },
        employment_information: {
          'employer_name': (value) => {
            if (!value) return 'Employer Name is required';
            return true;
          },
          'job_title': (value) => {
            if (!value) return 'Job Title is required';
            return true;
          },
          'financial_picture' : (value) => {
            if (!value) return 'This Field is required';
            return true;
          },
          'employer_website': (value) => {  
            return isValidSiteUrl(value);
          }
        },
        card_info:{
          card_number: (value) => {
            const val = (value || '').replace(/\D/g, '');
            if (!val) return 'Card number is required';
            if (val.length !== 16) return 'Card number must be 16 digits';
            if (!isValidLuhn(val)) return 'Invalid card number';
            return true;
          },
          nick_name: validateName('Nick Name', 6, false),
          primary_card_holder_first_name: validateName('Primary Card Holder First Name', 26, true,'Use your first 26 characters only.'),
          primary_card_holder_last_name: validateName('Primary Card Holder Last Name', 26, true,'Use your first 26 characters only.'),
        },
        how_did_you_hear_about_us:  {
          how_did_you_hear_about_us: (value) => {
            if (!value) return 'Referral Source is required';
            return true;
          },
          other_source: (value) => {
            if (formData.how_did_you_hear_about_us === 'Other' && !value) {
              return 'Please specify the other source';
            }
            return true;
          }
        },
        merchant_form:{
          // Business Information
          'businessLegalName': validateName('Business LEGAL Name', 26, true),
          'businessTradeName': validateName('Business DBA Name', 26, false),
          'businessMailingAddress': (value) => {
            if(formData['sameAsPhysicalAddress']) return true; // Skip validation if same as mailing address
            if (!value) return 'Business Mailing Address is required';
            if (formData.verified_businessMailingAddress !== true) {
              return 'Business Mailing Address must be verified';
            }
            return true;
          },
          // 'businessPhysicalAddress': (value) => {
          //   if (!value) return 'A verified Business Physical Address is required';
          //   if (!'verified_businessPhysicalAddress' in formData || !formData.verified_businessPhysicalAddress) {
          //     return 'Business Physical Address must be verified';
          //   }
          //   return true;
          // },
          // Contact Information
          'firstName': validateName('First Name', 26, true),
          'lastName': validateName('Last Name', 26, true),
          'federalTaxId': (value) => {
            if (!value) return 'Federal Tax ID is required';
            const sanitizedValue = value.replace(/\D/g, '');
            if (sanitizedValue.length !== 9) return 'Federal Tax ID must be 9 digits';
            if (!isValidLuhn(sanitizedValue)) return 'Invalid Federal Tax ID';
            return true;
          },
          'ownerFirstName': validateName('Owner/Partner First Name', 26, true),
          'ownerLastName': validateName('Owner/Partner Last Name', 26, true),
          socialSecurityNumber: (value) => {
            if (!value) return 'Social Security Number is required';
            if(!isValidSSN(value)) return 'Invalid Social Security Number';
            return true;
          },
          
          'tollFreeNumber': (value) => {
            if (!value) return true;
            // Remove all non-digit characters
            let digits = value.replace(/\D/g, '');
            // Ensure it starts with '1', if not, prepend it
            if (digits && (digits.length !== 10 && digits.length !== 11)) {
              return 'Toll Free Number must be 10 or 11 digits';
            }
            return true;
          },
          'businessEmail': (value) => {
            if (!value) return 'Business Email is required';
            const emailValidation = validateEmail(value);
            return emailValidation;
            // Check if the email is disposable or not allowed
          },
          'telephone': (value) => {
           return isValidOfficePhoneNumber(value, true);
          },
          'ownerTelephone': (value) => {  
            return isValidOfficePhoneNumber(value, true);
          },
          'titleInBusiness': validateName('Title in Business', 26, true),
          'ownerPercentageOwnership': (value) => {
            return isValidFloatPercent(value);
          },
          'ownerDob': (value) => {
            if (!value) return 'Owner Date of Birth is required';
            const dobValidation = validateDOB(value);
            if (dobValidation !== 'Valid') return dobValidation;
            return true;
          },
          // 'ownerHomeAddress': (value) => {
          //   if (!value) return 'Owner Home Address is required';
          //   if (!'verified_ownerHomeAddress' in formData || !formData.verified_ownerHomeAddress) {
          //     return 'Owner Home Address must be verified';
          //   }
          //   return true;
          // },
          'businessStructure': (value) => {
            if (!value) return 'Business Structure is required';
            return true;
          },
          'noofEmployees': (value) => {
            if (!value) return 'Number of Employees is required';
            return true;
          },
          'salesPerMonth': (value) => {
            if (!value) return 'Sales per Month is required';
            return true;
          },
          // 'merchant_bank': (value) => {
          //   if (!value) return 'Merchant Bank or Acquirer Name is required';
          //   return true;
          // },
          'tier_type': () => {
            console.log(formData['tier1'], formData['tier2'], formData['tier3'], formData['tier4']);
            if (!formData['tier1'] && !formData['tier2'] && !formData['tier3'] && !formData['tier4']) return 'Tier Type is required';
            return true;
          },
          'accountManagerFirstName': validateName('Account Manager First Name', 26, false),
          'accountManagerLastName': validateName('Account Manager Last Name', 26, false),
          // 'accountManagerPhysicalAddress': (value) => {
          //   if (!value) return 'Account Manager Physical Address is required';
          //   if (!'verified_accountManagerPhysicalAddress' in formData || !formData.verified_accountManagerPhysicalAddress) {
          //     return 'Account Manager Physical Address must be verified';
          //   }
          //   return true;
          // },
          'accountManagerEmailAddress': (value) => {
            if (!value) return 'Account Manager Email Address is required';
            const emailValidation = validateEmail(value);
            return emailValidation;
          },
          'siteUrl': (value) => {
            return isValidSiteUrl(value);
          },
          'industry': (value) => {
            if (!value) return 'Industry is required';
            return true;
          },
          'industryType': (value) => {
            if (!value && formData.industry === 'Communication') return 'Industry Type is required for Communication industry';
            return true;
          },
          'naicsNumber': (value) => {
            if (!value) return 'NAICS Number is required';
            if (value.length > 7) return 'max 6 integers';
            return true;
          },
          'estimatedNumberOfPOSTerminals': (value) => {
            if (!value) return 'Estimated Number of POS Terminals is required';
            // range 1 - 100
            if (!/^\d+$/.test(value)) return 'Estimated Number of POS Terminals must be a number';
            if (value < 1 || value > 10000000) return 'Estimated Number of POS Terminals must be 1 - 10 million';
            return true;
          },
          'posManufacturer': (value) => {
            if (!value) return 'POS Manufacturer is required';
            return true;
          },
          // date expected format: YYYY-MM-DD
          'experiencedAccountDataCompromise': (value) => {
            if(value) {
              let date = new Date(value);
              const today = new Date();
              if (date > today) return 'This date cannot be in the future';
            };
            return true;
          },
          'thirdPartySoftwareCompany': (value) => {
            if (!value && !formData['posHardwareSoftware']) return 'Third Party Software Company is required if you have not selected POS Hardware/Software';
            return true;
          },
          'thirdPartyWebHostingCompany': (value) => {
            if (!value && formData['thirdPartyWebHosting']) return 'Third Party Web Hosting Company is required';
            return true;
          },
          'cardDataStorage': (value) => {
            if (!value && formData['cardStoredByUser']) return 'Card Data Storage is required';
            return true;
          },
          'qualifiedSecurityAssessor': (value) => {
            if (!value && formData['vendorPCICompliant']) return 'Qualified Security Assessor is required';
            return true;
          },
          'dateOfCompliance': (value) => {
            if (!value && formData['vendorPCICompliant']) return 'Date of Compliance is required';
            let date = new Date(value);
            const today = new Date();
            if (date > today) return 'This date cannot be in the future';
            return true;
          },
          'dateOfLastScan': (value) => {
            if (!value && formData['vendorPCICompliant']) return 'Date of Last Scan is required';
            let date = new Date(value);
            const today = new Date();
            if (date > today) return 'This date cannot be in the future';
            return true;
          },
          'ginicoeHelpDescription': (value) => {
            const specialCharPattern = /[^a-zA-Z0-9\s]/;
            if (!value) return 'GiniCoe Help Description is required';
            if(value.length >3000) return 'GiniCoe Help Description must be less than 3000 characters';
            if (specialCharPattern.test(value)) return 'GiniCoe Help Description must not contain special characters, you spell out these characters';
            return true;
          }
        },
        bank_form: {
          'financialInstitutionName': (value) => {
            // 256 Alphanumeric characters
            if (!value) return 'Financial Institution Name is required';
            if (value.length > 256) return 'Financial Institution Name must be less than 256 characters';
            //if (!/^[a-zA-Z0-9\s]+$/.test(value)) return 'Financial Institution Name must be alphanumeric';
            return true;
          },
          'jobTitle': (value) => {
            if (!value) return 'Job Title is required';
            return true;
          },
          'firstName': validateName('First Name', 26, true),
          'lastName': validateName('Last Name', 26, true),
          'faxNumber': (value) => {
            if(!value) return true; // Optional field
            return isValidFaxNumber(value);
          },
          'alternateFaxNumber': (value) => {
            if(!value) return true; // Optional field
            return isValidFaxNumber(value);
          },
          'mobileNumber': (value) => {
            if (!value) return 'Mobile Number is required';
            return isValidOfficePhoneNumber(value);
          },
          'telephone': (value) => {
            if (!value) return 'Telephone Number is required';
            return isValidOfficePhoneNumber(value);
          },
          'alternateTelephoneNumber': (value) => {
            if (!value) return true; // Optional field
            return isValidOfficePhoneNumber(value);
          },
          'businessEmailAddress': (value) => {
            if (!value) return 'Business Email is required';
            return validateEmail(value);
          },
          'charterType': (value) => {
            if (!value) return 'Charter Type is required';
          },
          'charterAddress': (value) => {
            if (!value) return 'Charter Address is required';
            if (formData.verified_charterAddress !== true) {
              return 'Charter Address must be verified';
            }
            return true;
          },
          'operatesAcrossStateLines': (value) => {
            if (value === undefined) return 'This Field is required';
            if (value !== true && value !== false) return 'Operates Across State Lines must be true or false';
            return true;
          },
          'totalAssetSize': (value) => {
            if (!value) return 'Total Asset Size is required';
            return true;
          },
          'binNumber': (value) => {
            if (!value) return 'BIN Information is required';
            if (value.length > 8 ) return 'BIN Information must be 8 Characters';
            return true;
          },
          'trade_volume': (value) => {
            if (!value) return 'Trade Volume is required';
            return true;
          },
          // portfolio selected
          selectedFI: () => {
            const selected = formData['financialInstitutionsSelected']?.some(item => item.value === true);
            return selected || 'At least one service must be selected';
          },  
          selectedFS: () => {
            const selected = formData['financialServicesSelected']?.some(item => item.value === true);
            return selected || 'At least one service must be selected';
          },  
          portfolioSizesValid: () => {
            const selectedServices = formData['financialServicesSelected'] || [];
            const sizes = formData['portfolioSizes'] || {};

            for (const service of selectedServices) {
              if (service.value) {
                const size = sizes[service.id];
                if (!size || isNaN(size) || Number(size) <= 0) {
                  return 'All selected services must have a valid portfolio size';
                }
              }
            }
            return true;
          },
          'ginicoeHelpDescription': (value) => {
            const specialCharPattern = /[^a-zA-Z0-9\s]/;
            if (!value) return 'GiniCoe Help Description is required';
            if(value.length >3000) return 'GiniCoe Help Description must be less than 3000 characters';
            if (specialCharPattern.test(value)) return 'GiniCoe Help Description must not contain special characters, you spell out these characters';
            return true;
          }

        },
        govt_form: {
          'firstName': validateName('First Name', 26, true),
          'lastName': validateName('Last Name', 26, true),
          'jobTitle': (value) => {
            if (!value) return 'Job Title is required';
            return true;
          },
          'officeStreetName': (value) => {
            if (!value) return 'Office Street Name is required';
            //if (value.length > 100) return 'Office Street Name must be less than 100 characters';
            return true;
          },
          'officeCity': (value) => {
            if (!value) return 'Office City is required';
            //if (value.length > 50) return 'Office City must be less than 50 characters';
            return true;
          },
          'officeState': (value) => {
            if (!value) return 'Office State is required';
            //if (value.length > 50) return 'Office State must be less than
            // 50 characters';
            return true;
          },
          'officeZipCode': (value) => {
            if (!value) return 'Office Zip Code is required';
            //if (value.length > 10) return 'Office Zip Code must be less than
            // 10 characters';
            return true;
          },
          'budgetingProcurementAuthority': (value) => {
            if (value===null || value===undefined) return 'Budgeting Procurement Authority is required';
          },
          'agencyName': (value) => {
            if (!value) return 'Agency Name is required';
          },
          'agencyType': (value) => {
            if (!value) return 'Agency Type is required';
            return true;
          },
          'sector': (value) => {
            if (!value) return 'Sector is required';
            return true;
          },
          'agencyDescription': (value) => {
            if (!value && formData['sector']==='Other') return 'This Field is required';
            return true;
          },
          'ginicoeHelpDescription': (value) => {
            const specialCharPattern = /[^a-zA-Z0-9\s]/;
            if (!value) return 'GiniCoe Help Description is required';
            if(value.length >3000) return 'GiniCoe Help Description must be less than 3000 characters';
            if (specialCharPattern.test(value)) return 'GiniCoe Help Description must not contain special characters, you spell out these characters';
            return true;
          },
          'officePrimaryTelephone': (value) => {
            if (!value) return true; // Optional field
            return isValidOfficePhoneNumber(value);
          },
          'officeAlternateTelephone': (value) => {
            if (!value) return true; // Optional field
            return isValidOfficePhoneNumber(value);
          },
        },
        education_form:{
          'name': validateName('Name', 26, true,' Use your first 26 characters only.'),
          'email': (value) => {
            if (!value) return 'Email is required';
            const emailValidation = validateEmail(value);
            if (emailValidation !== true) return emailValidation;
            return true;
          },
          'phone': (value) => {
            return isValidOfficePhoneNumber(value, true);
          },
          'ginicoeHelpDescription': (value) => {
            const specialCharPattern = /[^a-zA-Z0-9\s]/;
            if (!value) return 'GiniCoe Help Description is required';
            if(value.length >3000) return 'GiniCoe Help Description must be less than 3000 characters';
            if (specialCharPattern.test(value)) return 'GiniCoe Help Description must not contain special characters, you spell out these characters';
            return true;
          }
        },
        health_form:{
          'name': validateName('Name', 26, true,' Use your first 26 characters only.'),
          'email': (value) => {
            if (!value) return 'Email is required';
            const emailValidation = validateEmail(value);
            if (emailValidation !== true) return emailValidation;
            return true;
          },
          'phone': (value) => {
            return isValidOfficePhoneNumber(value, true);
          },
          'ginicoeHelpDescription': (value) => {
            const specialCharPattern = /[^a-zA-Z0-9\s]/;
            if (!value) return 'GiniCoe Help Description is required';
            if(value.length >3000) return 'GiniCoe Help Description must be less than 3000 characters';
            if (specialCharPattern.test(value)) return 'GiniCoe Help Description must not contain special characters, you spell out these characters';
            return true;
          }
        }
    };
    if(section === 'Review & Edit'){
      let reviewErrors = {};
      Object.keys(validationSchema).forEach((key) => {
        if ( key === 'my_pedigree_info' ||
          key === 'Notice and Consent for Biometric' || 
          key === 'address' ||
          key === 'gender_identity_information' ||
          key === 'ethnicity_information' ||
          key === 'my_neighbours_are' ||
          key === 'employment_information' ||
          key === 'card_info' 
        ) { // Skip the Review & Edit section itself
          const sectionErrors = runValidation(key, formData, null);
          if (Object.keys(sectionErrors).length > 0) {
            reviewErrors[key] = sectionErrors;
            reviewErrors = { ...reviewErrors, ...sectionErrors };
          }
        }
      })
      return reviewErrors;
    }
    const sectionKey = section.replace(/\s+/g, '_').replace('?','').toLowerCase();
    const validators = validationSchema[sectionKey] || {};
    const errors = {};

    const isArraySection = Array.isArray(formData[sectionKey]);
    if (isArraySection) {
    errors[sectionKey] = formData[sectionKey].map((item, index) => {
      const itemErrors = {};
      for (const field in validators) {
        if (changedField && field !== changedField) continue;

        const result = validators[field](item[field]);
        if (typeof result === 'string') {
          itemErrors[field] = result;
        }
      }
      return itemErrors; // ✅ Return as object, NOT array
    });
    }
    else {
      for (const field in validators) {
        //console.log('Validating field:', field, 'with value:', formData[field]);
        if (changedField && field !== changedField) continue;

        const result = validators[field](formData[field]);
        if (typeof result === 'string') {
          errors[field] = result;
        }
      }
    }
  return errors;
  }
// This function validates the date of birth (DOB) to ensure it is in the past and the user is at least 18 years old.
// It returns "Valid" if the DOB is valid, otherwise returns an appropriate error message.
export function validateDOB(dobString) {
  const dob = new Date(dobString);
  const today = new Date();

  // If DOB is in the future
  if (dob > today) {
    return "Something happened? You are not born yet.";
  }

  const age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  const actualAge = hasBirthdayPassedThisYear ? age : age - 1;

  if (actualAge < 18) {
    return "You must be at least 18 years old.";
  }

  return "Valid";
  }
// This function validates an email address format and checks if it is a disposable email.
// It returns true if the email is valid, otherwise returns an error message.
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(email).toLowerCase())) {
      return 'Invalid email format';
    }
    else if(isDisposableEmail(email)) {
      return 'Disposable email addresses are not allowed';
    }
    return true
  }
// Validation function for names, ensuring they are not empty, do not exceed maxLength, and are required if specified.
export    const validateName = (label, maxLength, required = false, customString) => (value) => {
    if (!required && !value) return true; // No error if not required and no value
    if( required && !value) return `${label} is required`;
    if (required && (!value || (value && value.trim() === ''))) return `${label} is required`;
    if (value.trim().length > maxLength) return customString || `${label} must be max ${maxLength} characters`;
    return true;
  };

  /**
 * verifyCaptcha - Legacy function for reCAPTCHA verification
 * 
 * Note: This function duplicates some logic from the useRecaptcha hook
 * Consider using the hook instead for new implementations
 * 
 * @param {string} action - Action name for reCAPTCHA
 * @returns {Promise<boolean>} - True if verification successful
 */
export const verifyCaptcha = async (action = 'healthcare_form') => {
  // Client-side only check
  if (typeof window === 'undefined') {
    console.error('verifyCaptcha can only be called on client side');
    return false;
  }

  try {
    // Check if reCAPTCHA is loaded
    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    // Execute reCAPTCHA to get token
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    const token = await new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action })
          .then(resolve)
          .catch(reject);
      });
    });

    if (!token) {
      throw new Error('Failed to get reCAPTCHA token');
    }

    // Verify token with our backend API (simple verification)
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('reCAPTCHA verification failed:', result.error);
      return false;
    }

    // Check reCAPTCHA score threshold (must be > 0.5)
    if (result.score <= 0.5) {
      console.error('reCAPTCHA verification failed: score too low');
      return false;
    }

    console.log(`reCAPTCHA verification successful. Score: ${result.score}`);
    return true;

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};