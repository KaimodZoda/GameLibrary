'use client';

import { useState } from 'react';
import AddGameForm from '@/components/admin/AddGameForm';
import GameList from '@/components/admin/GameList';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGameAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // Switch to list tab to show the new game
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Library Admin</h1>
          <p className="text-gray-600">Manage your game collection</p>
        </div>

        {/* Navigation Tabs */}
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
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'add' && <AddGameForm onSuccess={handleGameAdded} />}
          {activeTab === 'list' && <GameList refreshTrigger={refreshTrigger} />}
        </div>
      </div>
    </div>
  );
}
