/**
 * Test script for merchant form submission
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Merchant Form Submission Test\n');
console.log('=' .repeat(50));

// Complete test payload with all required fields
const testFormData = {
  businessLegalName: "Test Business",
  businessTradeName: "Test Trade",
  businessPhysicalAddress: "123 Main St, City, State 12345",
  ownerHomeAddress: "456 Home Ave, City, State 12345",
  accountManagerPhysicalAddress: "789 Manager Rd, City, State 12345",
  firstName: "John",
  lastName: "Doe",
  telephone: "(123) 456-7890",
  businessEmail: "test@example.com",
  federalTaxId: "12-3456789",
  ownerFirstName: "Jane",
  ownerLastName: "Smith",
  socialSecurityNumber: "123-45-6789",
  ownerTelephone: "(098) 765-4321",
  ownerPercentageOwnership: "50",
  ownerDob: "1980-01-01",
  businessStructure: "LLC",
  areYouHomeBased: false,
  noofEmployees: "10-50",
  salesPerMonth: "$10,000-$50,000",
  tier2: true,
  merchantBank: "Test Bank",
  paymentProcessor: "Test Processor",
  accountManagerFirstName: "Account",
  accountManagerLastName: "Manager",
  accountManagerTelephoneNumber: "(555) 123-4567",
  accountManagerEmailAddress: "manager@test.com",
  industry: "Retail",
  naicsNumber: "123456",
  estimatedNumberOfPOSTerminals: "5",
  posManufacturer: "Test POS",
  thirdPartyWebHosting: false,
  cardStoredByUser: true,
  vendorPCICompliant: false,
  ginicoeHelpDescription: "We need help with merchant services and POS integration."
};

const guid = `M12-54015-TEST-${Date.now()}`;

console.log('\n📝 Submitting merchant form...');
console.log('   GUID:', guid);

try {
  const response = await axios.post(`${BASE_URL}/api/submit-form`, {
    formType: 'merchant',
    formData: testFormData,
    recaptchaScore: 0.9,
    guid: guid
  });

  console.log('\n✅ Success!');
  console.log('   Response:', JSON.stringify(response.data, null, 2));

  if (response.data.data?.reference_id) {
    console.log('\n🎉 Reference ID:', response.data.data.reference_id);
  }

} catch (error) {
  console.error('\n❌ Error!');
  console.error('   Status:', error.response?.status);
  console.error('   Message:', error.response?.data?.message);
  console.error('   Error:', error.response?.data?.error);
  console.error('   Details:', error.response?.data?.details);

  // Show full response for debugging
  if (error.response?.data) {
    console.log('\n📋 Full Error Response:');
    console.log(JSON.stringify(error.response.data, null, 2));
  }
}

console.log('\n' + '='.repeat(50));
