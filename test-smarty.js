// Test script to verify Smarty Autocomplete API for address lookup
const authId = '6aa8e83d-a413-e5b0-4893-bb8195814a76';
const authToken = 'TS09sJuAAW7LqyyxcIo8';

// Test address from the client - Step 1: Search
const searchAddress = '1241 1/2 1st Ave, Hellertown, PA 18055';

const autocompleteUrl = `https://us-autocomplete-pro.api.smarty.com/lookup?auth-id=${authId}&auth-token=${authToken}&search=${encodeURIComponent(searchAddress)}`;

console.log('Testing Smarty Autocomplete API for address search...');
console.log('Search:', searchAddress);
console.log('\nAPI URL:', autocompleteUrl);
console.log('\nFetching...\n');

fetch(autocompleteUrl)
  .then(res => res.json())
  .then(data => {
    console.log('=== AUTOCOMPLETE RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));

    if (data && data.suggestions && data.suggestions.length > 0) {
      const firstSuggestion = data.suggestions[0];
      console.log('\n=== FIRST SUGGESTION ===');
      console.log('Street:', firstSuggestion.street_line);
      console.log('City:', firstSuggestion.city);
      console.log('State:', firstSuggestion.state);
      console.log('Zipcode:', firstSuggestion.zipcode);

      // Now try to select this address to get more details
      const selectedAddress = `${firstSuggestion.street_line} ${firstSuggestion.city} ${firstSuggestion.state} ${firstSuggestion.zipcode}`;
      const selectedUrl = `https://us-autocomplete-pro.api.smarty.com/lookup?auth-id=${authId}&auth-token=${authToken}&search=${encodeURIComponent(searchAddress)}&selected=${encodeURIComponent(selectedAddress)}`;

      console.log('\n=== TESTING SELECTED ADDRESS ===');
      console.log('URL:', selectedUrl);

      return fetch(selectedUrl);
    } else {
      console.log('\n✗ No suggestions found');
      return null;
    }
  })
  .then(res => res ? res.json() : null)
  .then(data => {
    if (data) {
      console.log('\n=== SELECTED ADDRESS RESPONSE ===');
      console.log(JSON.stringify(data, null, 2));
    }
  })
  .catch(error => {
    console.error('✗ ERROR:', error.message);
  });
