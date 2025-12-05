import React from 'react'

// DialogBox component
// This component displays a confirmation dialog box with a message and two buttons: Cancel and Yes,
export default function DialogBox({ message, onClose, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white w-100 p-4 rounded shadow-md">
        <h2 className="text-lg font-semibold py-2 mb-2 border border-transparent border-b-gray-300">Are you Sure?</h2>
        <p className='py-10'>{message}</p>
        <div className='flex justify-end gap-2 border py-2 border-transparent border-t-gray-300 mt-2'>
            <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full" onClick={onCancel}>Cancel</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full mr-2" onClick={onClose}>Yes, Delete It</button>
        </div>
      </div>
    </div>
  )
}
