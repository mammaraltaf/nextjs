export async function loadBlockedTerms() {
  const res = await fetch('/Terms-to-Block.csv');
  const text = await res.text();

  const terms = text
    .split(/\r?\n|,/)
    .map(term => term.trim().toLowerCase().replace(/^["']?|["']?$/g, '').replace(/\\/g, '')) // remove quotes and backslashes
    .filter(Boolean);

  return [...new Set(terms)];
}
import naughtyWords from "naughty-words";
import { forbiddenSQLKeywords } from "./Variables";
// This module provides functions to sanitize user input by removing or replacing
// forbidden terms, SQL injection patterns, and other unwanted characters.
const obfuscationMap = {
  a: ['@', '4'],
  b: ['8'],
  e: ['3'],
  i: ['1', '!', '|'],
  l: ['1', '|'],
  o: ['0','*'],
  s: ['$', '5'],
  t: ['7', '+'],
  u: ['*'],
  c: ['('],
  h: ['#'],
};

// This function generates obfuscated variants of a word by replacing characters
// with their obfuscated counterparts up to a specified depth.
function generateObfuscatedVariants(word, maxDepth = 2) {
  const variants = new Set();
  const queue = [{ str: word, depth: 0, index: 0 }];

  while (queue.length) {
    const { str, depth, index } = queue.shift();
    if (depth >= maxDepth || index >= str.length) {
      variants.add(str);
      continue;
    }

    const char = str[index];
    const replacements = obfuscationMap[char.toLowerCase()];
    if (replacements) {
      for (const rep of replacements) {
        const newStr =
          str.slice(0, index) + rep + str.slice(index + 1);
        queue.push({ str: newStr, depth: depth + 1, index: index + 1 });
      }
    }

    queue.push({ str, depth, index: index + 1 });
  }

  return [...variants];
}
const rawWords = Object.values(naughtyWords).flat();
const badWordsSet = new Set();
for (const word of rawWords) {
  const clean = word.normalize('NFKC').trim().toLowerCase();
  if (!clean || clean.length < 3) continue;
  badWordsSet.add(clean);

  const variants = generateObfuscatedVariants(clean);
  for (const variant of variants) {
    badWordsSet.add(variant);
  }
}
const badWords = [...badWordsSet];

// This function compiles a list of blocked terms, including bad words and forbidden SQL keywords,
// into a regular expression pattern for sanitizing input.
export function compileBlockedTerms(terms) {
  if (!terms || !terms.length) {
    return null;
  }

  const allTerms = [...terms, ...badWords, ...forbiddenSQLKeywords];

  const escaped = allTerms
    .map(w => w.normalize('NFKC').trim().toLowerCase())
    .filter(w => w.length >= 3)
    .map(w => `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`); // wrap in \b

  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  return pattern;
}

// This function sanitizes user input by removing or replacing forbidden terms,
// SQL injection patterns, and other unwanted characters.
// It uses a precompiled pattern to identify and remove unwanted terms,
// and it handles exceptions for specific URLs.
export function SanitizeInput(input = '', compiledPattern) {
  const endsWithSpace = input.endsWith(' ') ? ' ' : '';

  // Normalize input for consistent matching
  let normalizedInput = input.normalize('NFKC');

  let exceptions = ['https://bigassfans.com/']
  if(exceptions.includes(normalizedInput.trim())) {
    return normalizedInput + endsWithSpace;
  }

  let sanitized = normalizedInput
    .replace(compiledPattern, '') // remove blocked terms
    .replace(/\s{2,}/g, ' ') // collapse double spaces
    .trim();

  return sanitized + endsWithSpace;
}

// Deny SQL injection patterns
export function sanitizeSQLInjection(input) {
  const pattern = forbiddenSQLKeywords.join('|');
  const sqlInjectionPattern = new RegExp(`\\b(${pattern})\\b`, 'gi');
  return input.replace(sqlInjectionPattern, '');
}
