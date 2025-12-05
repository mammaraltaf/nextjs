// Test script to verify USPS ZIP+4 lookup

// Test address from the client
const testAddress = {
  street: '1241 1/2 1st Ave',
  city: 'Hellertown',
  state: 'PA',
  zipcode: '18055'
};

const uspsUrl = 'https://tools.usps.com/tools/app/ziplookup/zipByAddress';

const formData = new URLSearchParams({
  companyName: '',
  address1: testAddress.street,
  address2: '',
  city: testAddress.city,
  state: testAddress.state,
  urbanCode: '',
  zip: testAddress.zipcode
});

console.log('Testing USPS ZIP Code Lookup for ZIP+4...');
console.log('Address:', testAddress);
console.log('\nForm Data:', formData.toString());
console.log('\nPosting to USPS...\n');

fetch(uspsUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  body: formData
})
  .then(async res => {
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('\n=== RAW RESPONSE (first 500 chars) ===');
    console.log(text.substring(0, 500));

    try {
      const data = JSON.parse(text);
      console.log('\n=== PARSED JSON ===');
      console.log(JSON.stringify(data, null, 2));

      if (data && data.resultStatus === 'SUCCESS') {
        const zipPlus4 = data.zip4 ? `${data.zipCode}-${data.zip4}` : data.zipCode;

        console.log('\n=== RESULT ===');
        console.log('ZIP+4:', zipPlus4);
        console.log('Full Address:', `${data.addressLine1}, ${data.city}, ${data.state} ${zipPlus4}`);
        console.log('\n✓ SUCCESS: ZIP+4 code retrieved from USPS!');
      } else {
        console.log('\n✗ ERROR: Failed to get ZIP+4 code');
        console.log('Status:', data.resultStatus || 'Unknown');
      }
    } catch (e) {
      console.error('\n✗ ERROR: Response is not JSON');
      console.error('Parse error:', e.message);
    }
  })
  .catch(error => {
    console.error('✗ FETCH ERROR:', error.message);
  });
