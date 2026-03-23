'use client';

import GameCard from './GameCard';
import SearchFilter from './SearchFilter';
import { Game } from '@/types/game';
import { useGames } from '@/hooks/useGames';
import { useGameFilters } from '@/hooks/useGameFilters';
import Button from '@/components/ui/Button';

interface GameGridProps {
  onBorrowClick: (game: Game) => void;
}

const GameGrid = ({ onBorrowClick }: GameGridProps) => {
  const { games, loading, error, refetch, fetchFilteredGames } = useGames();
  const { platform, setPlatform, genre, setGenre, searchQuery, setSearchQuery, applyFilters, getCurrentFilters } = useGameFilters();

  const handleApplyFilters = () => {
    const filters = getCurrentFilters();
    fetchFilteredGames(filters);
  };

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
      <SearchFilter 
        platform={platform} 
        setPlatform={setPlatform} 
        genre={genre}
        setGenre={setGenre}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        applyFilters={handleApplyFilters}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {games.map(game => (
          <GameCard 
            key={game.id} 
            game={game} 
            onBorrowClick={onBorrowClick}
          />
        ))}
      </div>

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
