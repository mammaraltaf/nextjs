import React from 'react'
const patternBold = /\*\*(.+?)\*\*/;
// WordProcess.js
// This component processes text to apply specific formatting, such as bolding certain words.
// It splits the text into words and applies a bold style to words that match a specific pattern.
export default function WordProcess({ text }) {
  return (
    text.split(' ').map((word, index) => (
        <span key={index} className={`inline-block mr-[5px] ${patternBold.test(word) ? '!font-bold' : ''}`}>
            {word.replace(patternBold, '$1').replace(/_/g, ' ')}
        </span>
      ))
  )
}
