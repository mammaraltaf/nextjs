'use client'
import React, { useEffect, useState } from 'react';

export default function DashboardComponents() {
  const [guid, setGuid] = useState('Loading...');

  useEffect(() => {
    const storedGuid = localStorage.getItem('guid') || 'No GUID generated yet';
    setGuid(storedGuid);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <label className='font-bold absolute top-4 right-4'>
        GUID: <span className='font-normal'>{guid}</span>
      </label>
      <h1 className="text-4xl font-bold">Dashboard</h1>
    </div>
  );
}

