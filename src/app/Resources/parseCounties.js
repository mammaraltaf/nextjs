import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Support __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'counties.txt');
const outputFile = path.join(__dirname, 'output.json');

try {
  const data = await readFile(inputFile, 'utf8');
  const lines = data.trim().split('\n');
  const result = {};

  lines.forEach(line => {
    const parts = line.split('\t');
    const countyFull = parts[0];
    const countyCode = parts[1];

    const countyName = countyFull.replace(', Puerto Rico', '').trim();
    result[countyName] = countyCode;
  });

  await writeFile(outputFile, JSON.stringify(result, null, 2));
  console.log('JSON file written to', outputFile);
} catch (err) {
  console.error('Error:', err);
}
