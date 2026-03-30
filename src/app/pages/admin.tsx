'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import AddGameForm from '@/components/admin/AddGameForm';
import GameList from '@/components/admin/GameList';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'users'>('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('./auth/signin');
      return;
    }
    
    if (session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router, searchParams]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'games') {
      setActiveTab('add');
    } else if (tabParam === 'users') {
      setActiveTab('users');
    }
  }, [searchParams]);

  const handleGameAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Library Admin</h1>
              <p className="text-gray-600">Manage your game collection</p>
            </div>
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'add'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Game
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'list'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-list mr-2"></i>
                  Manage Games
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className="fas fa-users mr-2"></i>
                  Manage Users
                </button>
              </nav>
            </div>
            <div>
              {activeTab === 'add' && <AddGameForm onSuccess={handleGameAdded} />}
              {activeTab === 'list' && <GameList refreshTrigger={refreshTrigger} />}
              {activeTab === 'users' && <UserManagement />}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
