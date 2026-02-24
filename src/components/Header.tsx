'use client';

import Link from 'next/link';

const Header = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <i className="fas fa-gamepad text-indigo-600 text-2xl mr-3"></i>
              <h1 className="text-xl font-bold text-gray-900">Game Library</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
              <i className="fas fa-search mr-1"></i> Search
            </button>
            <Link 
              href="/my-loans"
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <i className="fas fa-book mr-1"></i> My Loans
            </Link>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              <i className="fas fa-user mr-1"></i> Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
