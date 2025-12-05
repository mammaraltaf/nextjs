import React from 'react'
import WordProcess from './WordProcess'

// Following the pattern of the other components, this TextProcessor component is designed to handle and format text input.
export default function TextProcessor({ text , index}) {
  return (
    <div key={index}>
        {text.trim().startsWith('-')?
        <div className='list-disc mb-1'>{
            text.trim().startsWith('-') && text.includes(':')?
            <li className='my-2'>
                <span className='text-blue-600 font-bold mr-2'>{text.split(':')[0].trim().replace('-', '')}:</span>
                <WordProcess text={text.split(':')[1].trim()}/>
            </li>:
            text.trim().startsWith('-')?
            <li className='ml-5 my-1'>
                <WordProcess text={text.trim().replace('--', '').replace('-', '')}/>
            </li>:
            <span>{
                text.trim()
            }</span>
        }</div>
        : text.includes(':')?
        <div className='mb-1'>
            <span className=' font-bold mr-2'>{text.split(':')[0].trim()}:</span>
            <WordProcess text={text.split(':')[1].trim()}/>
        </div>
        : <div className='my-3'>
            <WordProcess text={text.trim()}/>
          </div>
        }
    </div>
  )
}
