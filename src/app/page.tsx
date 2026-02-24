'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SearchFilter from '@/components/SearchFilter';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import { useState } from 'react';

export default function Home() {
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const handleBorrowClick = (game: any) => {
    setSelectedGame(game);
    setShowBorrowModal(true);
  };

  const handleCloseModal = () => {
    setShowBorrowModal(false);
    setSelectedGame(null);
  };

  return (
    <>
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <SearchFilter />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsSection />
          <GameGrid onBorrowClick={handleBorrowClick} />
        </div>
        {showBorrowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Borrow Game</h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Game: <span className="font-semibold">{selectedGame?.title}</span></p>
                <p className="text-gray-600 mb-2">Platform: <span className="font-semibold">{selectedGame?.platform}</span></p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    console.log(`Borrowing ${selectedGame?.title}`);
                    handleCloseModal();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Confirm Borrow
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
