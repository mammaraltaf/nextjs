'use client';

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="flex justify-start items-center px-4 py-2">
        <Link href="/" className="flex items-center">
          <img 
            src="/ginicoelogo.jpg" 
            alt="Logo" 
            className="h-14 md:h-16 w-auto"
            width={64}
            height={64}
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;