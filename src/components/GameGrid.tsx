'use client';

import { useState, useEffect } from 'react';
import GameCard from './GameCard';
import BorrowConfirmationModal from './BorrowConfirmationModal';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import { useLoans } from '@/hooks/useLoans';
import { useSession } from 'next-auth/react';
import Button from './ui/Button';

interface GameGridProps {
  onBorrowClick?: (game: Game) => void;
}

interface GameCardState {
  [key: number]: Game;
}

const GameGrid = ({ onBorrowClick }: GameGridProps) => {
  const { games, loading, error, refetch, applyFilters: hookApplyFilters, filteringMode } = useGames();
  const { borrowGame } = useLoans();
  const { data: session } = useSession();
  const [gameStates, setGameStates] = useState<GameCardState>({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const handleGameUpdate = (updatedGame: Game) => {
    setGameStates(prev => ({
      ...prev,
      [updatedGame.id]: updatedGame
    }));
  };

  const handleGameCardBorrow = (game: Game) => {
    setSelectedGame(game);
    setShowBorrowModal(true);
  };

  const handleConfirmBorrow = async (dueDate: string) => {
    if (!selectedGame || !session?.user) return;
    
    setIsBorrowing(true);
    
    try {
      const result = await borrowGame(selectedGame.id, dueDate);
      if (result.success) {
        console.log('Game borrowed successfully:', result.message);
        setShowBorrowModal(false);
        // Refetch games to update availability status
        refetch();
        // Update local state
        setGameStates(prev => ({
          ...prev,
          [selectedGame.id]: { ...selectedGame, available: false }
        }));
      } else {
        console.error('Failed to borrow game:', result.message);
      }
    } catch (error) {
      console.error('Error borrowing game:', error);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleCloseModal = () => {
    setShowBorrowModal(false);
    setSelectedGame(null);
  };

  // Expose applyFilters function to parent
  useEffect(() => {
    // This will be called by parent component
    if (typeof window !== 'undefined') {
      (window as any).applyGameFilters = hookApplyFilters;
      (window as any).clearGameFilters = () => {
        hookApplyFilters({ platform: 'All Platforms', genre: 'All Genres', searchQuery: '' });
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).applyGameFilters;
        delete (window as any).clearGameFilters;
      }
    };
  }, [hookApplyFilters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={refetch}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filtering Mode Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing {games.length} games
          {isFiltering && (
            <span className="ml-2 text-indigo-600">
              <i className="fas fa-spinner fa-spin mr-1"></i>
              Updating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtering:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            filteringMode === 'client' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {filteringMode === 'client' ? 'Client-side' : 'Server-side'}
          </span>
        </div>
      </div>
      
      {/* Partial Loading Overlay */}
      {isFiltering && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-indigo-600 mb-2"></i>
            <p className="text-sm text-gray-600">Updating games...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
        {games.map(game => (
          <GameCard 
            key={game.id} 
            game={gameStates[game.id] || game} 
            onBorrowClick={handleGameCardBorrow}
            onUpdate={handleGameUpdate}
          />
        ))}
      </div>

      {selectedGame && (
        <BorrowConfirmationModal
          game={selectedGame}
          isOpen={showBorrowModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBorrow}
          isBorrowing={isBorrowing}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <nav className="flex space-x-2">
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <i className="fas fa-chevron-left text-gray-900"></i>
          </button>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-md">1</button>
          <button className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">2</button>
          <button className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">3</button>
          <button className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
            <i className="fas fa-chevron-right text-gray-900"></i>
          </button>
        </nav>
      </div>
    </>
  );
};

export default GameGrid;
