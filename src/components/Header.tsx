'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/pages/home" className="flex items-center">
              <i className="fas fa-gamepad text-indigo-600 text-2xl mr-3"></i>
              <h1 className="text-xl font-bold text-gray-900">Game Library</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/pages/home" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
              <i className="fas fa-search mr-1" aria-hidden="true"></i> Search
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/pages/my-loans"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <i className="fas fa-book mr-1" aria-hidden="true"></i> My Loans
                </Link>
                {session?.user?.role === 'ADMIN' && (
                  <Link 
                    href="/pages/admin"
                    className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <i className="fas fa-cog mr-1" aria-hidden="true"></i> Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <i className="fas fa-user-circle text-gray-600 text-xl mr-2" aria-hidden="true"></i>
                    <span className="text-gray-700 font-medium">{session?.user?.name}</span>
                    {session?.user?.role === 'ADMIN' && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <i className="fas fa-sign-out-alt mr-1" aria-hidden="true"></i> Sign out
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/pages/auth/signin"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                <i className="fas fa-user mr-1" aria-hidden="true"></i> Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
