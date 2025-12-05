import fs from 'fs';
import fetch from 'node-fetch'; // You may need to install this via `npm i node-fetch`

const url = 'https://rowzero.io/workbook/05CBFE2A43AD77BEE297EEEA/130?ref=fips-codes';

try {
  const res = await fetch(url);
  const text = await res.text();
  await fs.promises.writeFile('fips.txt', text);
  console.log('FIPS data saved to fips.txt');
} catch (err) {
  console.error('Error:', err.message);
}
