  // Following function builds a formatted address string from a suggestion object.
  // It combines street line, secondary text (if available), city, state, and zipcode.
  // The secondary text is formatted to remove any commas followed by a hash (#) and includes
  export function buildAddress(suggestion) {
    const secondaryText = suggestion.secondary && suggestion.entries
    ? `${suggestion.secondary.replaceAll(',#','')} (${suggestion.entries})`
    : "";

    const selected = `${suggestion.street_line}${secondaryText ? ' ' + secondaryText : ''} ${suggestion.city} ${suggestion.state} ${suggestion.zipcode}`;
    return  selected.replaceAll(' ','+').replaceAll('#','%23');
  }
  // This function counts the number of errors in a form based on the provided fields and formErrors object.
  // It iterates through the formErrors object, checking if the fields are present and counting
  // the number of errors for each field. It handles both array and object error formats.
  export function countErrors(fields, formErrors) {
    return Object.keys(formErrors[fields]).reduce((count, key) => {
      if (fields.includes(key) && formErrors[key]) {
        if (Array.isArray(formErrors[key])) {
          return count + formErrors[key].length;
        } else if (typeof formErrors[key] === 'object') {
          return count + Object.keys(formErrors[key]).length;
        } else {
          return count + 1; // Single error message
        }
      }
      return count;
    }, 0);
  }
  // This function formats a phone number by removing all non-digit characters,
  // limiting it to 10 digits, and applying a specific format.
  // It progressively formats the number as the user types, adding parentheses and dashes.
  // The function returns an empty string if no digits are present.
  export function formatPhoneNumber(value) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits max
  const trimmed = digits.substring(0, 10);

  // Format progressively
  const len = trimmed.length;

  if (len === 0) return '';
  if (len < 4) return `(${trimmed}`;
  if (len < 7) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)} - ${trimmed.slice(6)}`;
 }
 // This function determines the type of credit card based on the provided number.
 // It uses regular expressions to match the card number against known patterns for Visa, Mastercard, American
  export function getCardType(number) {
    // Remove all non-digit characters
    if( !number) return 'Visa';

    const card = number.replace(/\D/g, '');

    if (/^4\d{12}(\d{3})?(\d{3})?$/.test(card)) return 'Visa';
    if (/^5[1-5]\d{14}$/.test(card) || /^2(2[2-9]|[3-6]|7[01])\d{12}$/.test(card)) return 'Mastercard';
    if (/^3[47]\d{13}$/.test(card)) return 'Americanexpress';
    if (/^6(?:011|5\d{2}|4[4-9]\d)\d{12}$/.test(card)) return 'Discover';
    if (/^3(?:0[0-5]|[68])\d{11}$/.test(card)) return "Dinerclub";

    return 'Paypal';
  }
  // This function checks if a given date is older than 2 years from the current date.
  // It compares the year, month, and day of the provided date with the current date
  // to determine if the date is more than 2 years old.
  // It returns true if the date is older than 2 years, otherwise false.
  export function olderThan2Years(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    // Calculate the difference in years
    const yearsDifference = today.getFullYear() - date.getFullYear();
    // Check if the date is more than 2 years ago
    if (yearsDifference > 2) {
      return true;
    } else if (yearsDifference === 2) {
      // Check if the month and day are also more than 2 years ago
      if (today.getMonth() > date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() > date.getDate())) {
        return true;
      }
    }
    return false;
  }
  // This function scrolls the page to the first error element based on the provided errors object.
  // It retrieves the first error key, finds the corresponding element by ID, and scrolls to it.
  export const scrollToError = (errors)=>{
        // if (errors) {
        //     const firstErrorKey = Object.keys(errors)[0];
        //     console.log('First Error Key:', firstErrorKey);
        //     const errorElement = document.getElementById(`error-${firstErrorKey}`);
        //     if (errorElement) {
        //         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        //     }
        // }
    }
  import ExcelJS from 'exceljs';

  // This function parses bank data from an Excel file.
  // It reads the first worksheet, extracts relevant information from each row, and returns an object
  // where each key is a bank name and the value is an object containing bank details.
  export async function parseBankData(file) {
    try{
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      let sheet = workbook.getWorksheet(1);
      if(sheet === undefined) {
        sheet = workbook.getWorksheet('Trust')
      }
      const result = {};
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const name = row.getCell(2).value?.toString(); // Column B
        if (!name || name==='NAME') return;

        result[name] = {
          charterNo: row.getCell(1).value?.toString() || '',
          address: row.getCell(3).value?.toString() || '',
          city: row.getCell(4).value?.toString() || '',
          state: row.getCell(5).value?.toString() || '',
          cert: row.getCell(6).value?.toString() || '',
          rssd: row.getCell(7).value?.toString() || ''
        };
      });
      return result;
    }catch (error) {
      console.error('Error parsing bank data:', error);
      return{}
    }
  }
  // This function parses a job list from an Excel file.
  // It reads the first worksheet, extracts job titles from the first column,
  // and returns an array of job titles.
  export async function parseJobList(file) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.getWorksheet(1);
      if (!sheet) {
        throw new Error('No worksheet found in the file.');
      }

      const result = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header

        const jobTitle = row.getCell(1).value?.toString() || '';
        result.push(jobTitle)
      });
      return result;
    } catch (error) {
      console.error('Error parsing job list:', error);
      return [];
    }
  }
  // This function extracts address parts from a formatted address string.
  // It splits the address into street, city, state, and zipcode components, 
  // ensuring that the state is in uppercase and the zipcode is correctly formatted.
  // It throws an error if the address format is incorrect or if the input is not a string
  export function extractAddressParts(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Address must be a non-empty string.');
    }

    // Step 1: Split into parts by comma
    const parts = address.split(',').map(p => p.trim());

    if (parts.length !== 3) {
      throw new Error('Address must follow the format: "street, city, state zip".');
    }

    const street = parts[0];
    const city = parts[1];

    // Step 2: Split state and ZIP
    const stateZip = parts[2].split(/\s+/); // split by one or more spaces

    if (stateZip.length !== 2) {
      throw new Error('State and ZIP code must be separated by a space.');
    }

    const [state, zipcode] = stateZip;

    return {
      street,
      city,
      state: state.toUpperCase(),
      zipcode
    };
  }



