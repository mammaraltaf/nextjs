import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

// Submitted component displays a success message after the user completes their application
// It provides options to go back to the dashboard or logout
export default function Submitted({guid}) {
  const [userEmail, setUserEmail] = useState('joe@example.com');
  const router = useRouter();
  return (
    <div className='flex-1 relative flex items-center justify-center bg-white'>
        <div className='text-center'>
            <h2 className='text-2xl font-bold text-green-700 mb-4'>Success!</h2>
            <p className='text-gray-600 font-bold'>You have completed your application.</p>
            <p className='text-gray-600'>You can expect to hear from us by email in the upcoming days.</p>
            <p className='text-gray-600'>Please keep an eye on your inbox <a href={`mailto:${userEmail}`} className='text-blue-500 underline'>{userEmail}</a> for updates.</p>
            {/* Logout or redirect to dashboard */}
            <div className='flex gap-1 justify-center mt-6'>
              <button className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
                onClick={() => router.push('/dashboard/consumer')}>
                Go to Dashboard
              </button>
              <button className='mt-4 px-4 py-2 bg-red-500 text-white rounded'
                onClick={() => alert('Logout functionality not implemented yet')}>
                Logout
              </button>
            </div>
        </div>
    </div>
  )
}
