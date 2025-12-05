// Test script for Smarty API - Standalone version
import { readFileSync } from 'fs';

// Manually load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const key = envVars.SMARTY_EMBEDDED_KEY;

console.log('Testing Smarty API with embedded key...\n');
console.log('Embedded Key:', key ? `${key.substring(0, 10)}...` : 'NOT FOUND');

if (!key) {
  console.error('❌ SMARTY_EMBEDDED_KEY not found in .env.local');
  process.exit(1);
}

// Import Smarty SDK
import SmartySDK from 'smartystreets-javascript-sdk';
const SmartyCore = SmartySDK.core;
const Lookup = SmartySDK.usStreet.Lookup;

// Create credentials and client
const credentials = new SmartyCore.SharedCredentials(key);
const clientBuilder = new SmartyCore.ClientBuilder(credentials).withLicenses(["us-rooftop-geocoding-cloud"]);
const client = clientBuilder.buildUsStreetApiClient();

// Test with a simple address
const lookup = new Lookup();
lookup.street = "1600 Amphitheatre Parkway";
lookup.city = "Mountain View";
lookup.state = "CA";

console.log('\nTesting address verification with:');
console.log('Street:', lookup.street);
console.log('City:', lookup.city);
console.log('State:', lookup.state);
console.log('\n---\n');

// Send the request
client.send(lookup)
  .then((result) => {
    console.log('✅ SUCCESS! Smarty API is working.\n');

    if (result.lookups && result.lookups.length > 0) {
      const firstLookup = result.lookups[0];

      if (firstLookup.result && firstLookup.result.length > 0) {
        console.log('Address verification results:');
        firstLookup.result.forEach((candidate, index) => {
          console.log(`\nCandidate ${index + 1}:`);
          console.log('  Delivery Line:', candidate.deliveryLine1);
          console.log('  Last Line:', candidate.lastLine);
          console.log('  Zipcode:', candidate.components.zipCode);
          console.log('  Latitude:', candidate.metadata.latitude);
          console.log('  Longitude:', candidate.metadata.longitude);
        });
      } else {
        console.log('No results found for this address.');
      }
    }
  })
  .catch((err) => {
    console.error('❌ ERROR testing Smarty API:');
    console.error('Error details:', err.error || err.message || err);

    if (err.statusCode) {
      console.error('Status Code:', err.statusCode);
    }

    process.exit(1);
  });
