import { consumerProgressTackers } from '@/app/Resources/Variables';
import React from 'react'

// ProgressTracker component displays the user's progress through the profile setup steps
// It shows a vertical tracker with dots and labels for each step
// Clicking on a label allows the user to navigate back to that step
// The component takes formState and setFormState as props to manage the current step
export default function ProgressTracker({ formState, setFormState }) {
  return (
    <div className='flex flex-col w-80 bg-white'>
        <h2 className='bg-[var(--primary)] text-sm py-2 rounded-tl-lg rounded-tr-lg text-center text-white font-bold'>User Profile Information</h2>
        <div className='flex flex-col w-full px-2 py-4 mt-5'>
        {consumerProgressTackers.map((label, index) => (
            <div className="flex items-start px-2 relative" key={index}>
                {/* Dot + Line */}
                <div className="flex flex-col items-center min-h-[32px]">
                <div className={`rounded-full p-[2px] border ${index <= formState?'border-[var(--primary)]':'border-gray-400'} transition-all duration-200`}>
                    <div className={`w-[6px] h-[6px] rounded-full ${index <= formState?'bg-[var(--primary)]':'bg-gray-400'}`} />
                </div>

                {/* Vertical line (hidden on last item) */}
                {index !== consumerProgressTackers.length - 1 && (
                    <div className="w-px bg-gray-300 flex-1 min-h-[24px]"></div>
                )}
                </div>

                {/* Label */}
                <span className={`text-xs ml-2 relative -top-0.5 ${index <= formState ? 'text-[var(--primary)] font-semibold cursor-pointer hover:underline' : 'text-gray-600 cursor-default'}`}
                onClick={() => {
                if (index <= formState) {
                    setFormState(index);
                }
                }}
                >{label}</span>
            </div>
            ))}
        </div>
    </div>
  )
}
