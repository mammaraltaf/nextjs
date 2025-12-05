// Test Smarty Autocomplete API directly
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('Testing Smarty Autocomplete API...\n');

// The key "180387786253805454" might be an auth-id for the autocomplete API
// Let's test it as both embedded key and auth-id

const testKey = '180387786253805454';

console.log('Test 1: Using as embedded key (website/browser key)');
console.log('-----------------------------------------------');

// Test with embedded key format
const testUrl1 = `https://us-autocomplete-pro.api.smarty.com/lookup?key=${testKey}&search=1600+Amphitheatre`;
console.log('URL:', testUrl1);

try {
  const response1 = await fetch(testUrl1);
  const data1 = await response1.json();

  if (response1.ok) {
    console.log('✅ SUCCESS with embedded key!\n');
    console.log('Results:', JSON.stringify(data1, null, 2));
  } else {
    console.log('❌ Failed with embedded key');
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('\n\nTest 2: Using as auth-id (may need auth-token)');
console.log('-----------------------------------------------');

// Test with auth-id format (this might need a token too)
const testUrl2 = `https://us-autocomplete-pro.api.smarty.com/lookup?auth-id=${testKey}&search=1600+Amphitheatre`;
console.log('URL:', testUrl2);

try {
  const response2 = await fetch(testUrl2);
  const data2 = await response2.json();

  if (response2.ok) {
    console.log('✅ SUCCESS with auth-id!\n');
    console.log('Results:', JSON.stringify(data2, null, 2));
  } else {
    console.log('❌ Failed with auth-id');
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('\n\n=== Summary ===');
console.log('The key "180387786253805454" needs to be configured correctly.');
console.log('Please check your Smarty account dashboard to see:');
console.log('1. If this is a "Website Key" (use with key= parameter)');
console.log('2. If this is an "Auth ID" (needs matching Auth Token)');
console.log('3. Which Smarty APIs this key is authorized for');
