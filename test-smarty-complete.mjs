// Complete Smarty API Test - Tests both Auth ID/Token and Embedded Key
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

const authId = envVars.SMARTY_AUTH_ID;
const authToken = envVars.SMARTY_AUTH_TOKEN;
const embeddedKey = envVars.SMARTY_EMBEDDED_KEY;

console.log('='.repeat(60));
console.log('SMARTY API AUTHENTICATION TEST');
console.log('='.repeat(60));
console.log('\nCredentials loaded:');
console.log('  Auth ID:', authId ? `${authId.substring(0, 15)}...` : '❌ NOT FOUND');
console.log('  Auth Token:', authToken ? `${authToken.substring(0, 8)}...` : '❌ NOT FOUND');
console.log('  Embedded Key:', embeddedKey ? `${embeddedKey.substring(0, 10)}...` : '❌ NOT FOUND');
console.log('\n' + '='.repeat(60));

// Test 1: Autocomplete API with Auth ID/Token
console.log('\n📍 TEST 1: US Autocomplete Pro API (Auth ID + Token)');
console.log('-'.repeat(60));

const testAddress = '1600 Amphitheatre';
const autocompleteUrl = `https://us-autocomplete-pro.api.smarty.com/lookup?auth-id=${authId}&auth-token=${authToken}&search=${encodeURIComponent(testAddress)}`;

console.log('Testing address:', testAddress);
console.log('Endpoint: us-autocomplete-pro.api.smarty.com');

try {
  const response = await fetch(autocompleteUrl);
  const data = await response.json();

  if (response.ok) {
    console.log('\n✅ SUCCESS! Autocomplete API is working!\n');

    if (data.suggestions && data.suggestions.length > 0) {
      console.log(`Found ${data.suggestions.length} suggestions:\n`);
      data.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.street_line}`);
        console.log(`     ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`);
        if (index < 2) console.log('');
      });
      if (data.suggestions.length > 3) {
        console.log(`  ... and ${data.suggestions.length - 3} more`);
      }
    } else {
      console.log('No suggestions found.');
    }
  } else {
    console.log('\n❌ FAILED');
    console.log('Status:', response.status);
    console.log('Error:', JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.log('\n❌ ERROR:', err.message);
}

// Test 2: Street Address API with SDK (Embedded Key)
console.log('\n\n📍 TEST 2: US Street Address API (Embedded Key + SDK)');
console.log('-'.repeat(60));

try {
  const SmartySDK = (await import('smartystreets-javascript-sdk')).default;
  const SmartyCore = SmartySDK.core;
  const Lookup = SmartySDK.usStreet.Lookup;

  const credentials = new SmartyCore.SharedCredentials(embeddedKey);
  const clientBuilder = new SmartyCore.ClientBuilder(credentials).withLicenses(["us-rooftop-geocoding-cloud"]);
  const client = clientBuilder.buildUsStreetApiClient();

  const lookup = new Lookup();
  lookup.street = "1600 Amphitheatre Parkway";
  lookup.city = "Mountain View";
  lookup.state = "CA";

  console.log('Testing address:');
  console.log(`  ${lookup.street}`);
  console.log(`  ${lookup.city}, ${lookup.state}`);

  const result = await client.send(lookup);

  if (result.lookups && result.lookups[0].result && result.lookups[0].result.length > 0) {
    console.log('\n✅ SUCCESS! Street Address API is working!\n');

    const candidate = result.lookups[0].result[0];
    console.log('Verified Address:');
    console.log(`  ${candidate.deliveryLine1}`);
    console.log(`  ${candidate.lastLine}`);
    console.log(`  Coordinates: ${candidate.metadata.latitude}, ${candidate.metadata.longitude}`);
    console.log(`  Precision: ${candidate.metadata.precision}`);
  } else {
    console.log('\n⚠️  No results returned (address may not be valid)');
  }
} catch (err) {
  console.log('\n❌ FAILED');
  console.log('Error:', err.error || err.message);
  if (err.statusCode) {
    console.log('Status Code:', err.statusCode);
  }
}

// Test 3: Auth ID/Token with Street Address API
console.log('\n\n📍 TEST 3: US Street Address API (Auth ID + Token)');
console.log('-'.repeat(60));

try {
  const SmartySDK = (await import('smartystreets-javascript-sdk')).default;
  const SmartyCore = SmartySDK.core;
  const Lookup = SmartySDK.usStreet.Lookup;

  const credentials = new SmartyCore.StaticCredentials(authId, authToken);
  const client = new SmartyCore.ClientBuilder(credentials).buildUsStreetApiClient();

  const lookup = new Lookup();
  lookup.street = "1600 Amphitheatre Parkway";
  lookup.city = "Mountain View";
  lookup.state = "CA";

  console.log('Testing with Auth ID/Token credentials...');

  const result = await client.send(lookup);

  if (result.lookups && result.lookups[0].result && result.lookups[0].result.length > 0) {
    console.log('\n✅ SUCCESS! Auth ID/Token works for Street API!\n');

    const candidate = result.lookups[0].result[0];
    console.log('Verified Address:');
    console.log(`  ${candidate.deliveryLine1}`);
    console.log(`  ${candidate.lastLine}`);
  } else {
    console.log('\n⚠️  No results returned');
  }
} catch (err) {
  console.log('\n❌ FAILED');
  console.log('Error:', err.error || err.message);
}

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log('\nYour Smarty API credentials are configured in .env.local:');
console.log('  - SMARTY_AUTH_ID (for server-side requests)');
console.log('  - SMARTY_AUTH_TOKEN (for server-side requests)');
console.log('  - SMARTY_EMBEDDED_KEY (for client-side requests)');
console.log('\nAPI Routes:');
console.log('  - /api/smarty-autocomplete uses AUTH_ID + AUTH_TOKEN');
console.log('  - src/script/fetch-smart.js uses EMBEDDED_KEY');
console.log('\n' + '='.repeat(60));
