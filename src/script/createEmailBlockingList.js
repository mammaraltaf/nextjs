const fs = require('fs');
const path = require('path');

// Adjust path if needed
// This script reads a list of disposable email domains from a file and converts it to a JSON format.
// The input file should contain one domain per line, with comments starting with '#' ignored.
const inputPath = path.join(__dirname, 'disposable_email_blocklist.conf');
const outputPath = path.join(__dirname, 'disposable-domains.json');

const data = fs.readFileSync(inputPath, 'utf8');

// Split the file content by new lines, trim each line, and filter out empty lines and comments
// This ensures that only valid domains are included in the final JSON output.
const domains = data
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#')); // ignore empty and commented lines
// Convert the array of domains to a JSON format
// The JSON format is suitable for use in applications that require a list of disposable email domains.
fs.writeFileSync(outputPath, JSON.stringify(domains, null, 2));
console.log(`Saved ${domains.length} domains to ${outputPath}`);
