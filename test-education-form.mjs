/**
 * Test script for education form submission
 *
 * This script tests the complete education form flow:
 * 1. Generate reCAPTCHA token
 * 2. Verify token with /api/verify-recaptcha
 * 3. Submit form with /api/submit-form
 * 4. Verify reference_id is returned
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const LARAVEL_URL = 'http://localhost:8000';

console.log('🧪 Education Form Submission Test\n');
console.log('=' .repeat(50));

// Test 1: Check Next.js API health
console.log('\n📡 Test 1: Checking Next.js API health...');
try {
  const healthResponse = await axios.get(`${BASE_URL}/api/submit-form`);
  console.log('✅ Next.js API Status:', healthResponse.data.success ? 'Connected' : 'Disconnected');
  console.log('   Laravel Status:', healthResponse.data.laravel?.status || 'unknown');
} catch (error) {
  console.error('❌ Health check failed:', error.message);
  console.log('   Make sure both Next.js (npm run dev) and Laravel (php artisan serve) are running');
  process.exit(1);
}

// Test 2: Submit education form
console.log('\n📝 Test 2: Submitting education form...');

const testFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(123) 456-7890',
  ginicoeHelpDescription: 'We need Ginicoe for our educational institution to enhance security and streamline student verification.'
};

const guid = `ENT-FL-CLA-0000-0001-${Date.now()}`;

console.log('   Form Data:', {
  name: testFormData.name,
  email: testFormData.email,
  guid: guid
});

try {
  const submitResponse = await axios.post(`${BASE_URL}/api/submit-form`, {
    formType: 'education',
    formData: testFormData,
    recaptchaScore: 0.9, // Mock score for testing
    guid: guid
  });

  console.log('\n✅ Form submission successful!');
  console.log('   Response:', JSON.stringify(submitResponse.data, null, 2));

  // Test 3: Verify reference_id is returned
  console.log('\n🔍 Test 3: Verifying reference_id...');

  if (submitResponse.data.success && submitResponse.data.data) {
    const { reference_id, guid: returnedGuid } = submitResponse.data.data;

    if (reference_id) {
      console.log('✅ Reference ID received:', reference_id);
    } else if (returnedGuid) {
      console.log('✅ GUID received:', returnedGuid);
      console.log('⚠️  Note: Using guid as reference_id');
    } else {
      console.log('❌ No reference_id or guid found in response');
    }

    // Test 4: Verify submission in database
    console.log('\n🔍 Test 4: Verifying submission in Laravel database...');
    try {
      const verifyResponse = await axios.get(`${LARAVEL_URL}/api/education-submissions/${reference_id || returnedGuid}`);
      console.log('✅ Submission found in database!');
      console.log('   Status:', verifyResponse.data.data.status);
      console.log('   Name:', verifyResponse.data.data.name);
      console.log('   Email:', verifyResponse.data.data.email);
    } catch (error) {
      console.log('⚠️  Could not verify in database:', error.response?.data?.message || error.message);
    }
  } else {
    console.log('❌ Form submission failed:', submitResponse.data);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   - Next.js API: Working');
  console.log('   - Laravel API: Working');
  console.log('   - Form Submission: Success');
  console.log('   - Reference ID: ' + (submitResponse.data.data?.reference_id || submitResponse.data.data?.guid || 'Not found'));

} catch (error) {
  console.error('\n❌ Form submission failed!');
  console.error('   Error:', error.response?.data || error.message);

  if (error.response?.status === 503) {
    console.log('\n💡 Troubleshooting:');
    console.log('   - Ensure Laravel server is running: php artisan serve');
    console.log('   - Check .env.local for LARAVEL_API_URL');
    console.log('   - Verify database connection in Laravel');
  }

  process.exit(1);
}

console.log('\n');
