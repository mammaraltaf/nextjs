import React from 'react'

export default function page() {
  return (
    <div className='flex w-full min-h-screen bg-white items-center justify-center'>
          <h1 className='text-2xl font-bold p-4'>Consumer Dashboard</h1>
    </div>
  )
}
export const metadata = {
  title: 'Ginicoe - Consumer Dashboard',
  description: 'Your Description Here',
  authors: [{ name: 'Team Ginicoe', url: 'https://ginicoe.com' }],
  creator: 'Team Ginicoe',
  openGraph: {
    title: 'Ginicoe - Consumer Dashboard',
    description: 'Ginicoe - Consumer Dashboard',
    url: 'https://ginicoe.com',
    siteName: 'Ginicoe',
    images: [
      {
        //url: 'https://ginicoe.com/og-image.png',
        //width: 1200,
        //height: 630,
        //alt: 'Ginicoe - Your AI-Powered Personal Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ginicoe - Consumer Dashboard',
    //description: 'Ginicoe - Your AI-Powered Personal Assistant',
    //images: ['https://ginicoe.com/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    //shortcut: '/favicon-16x16.png',
    //apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}