import GameCard from './GameCard';

interface Game {
  id: number;
  title: string;
  platform: string;
  genre: string;
  available: boolean;
  gradient: string;
}

interface GameGridProps {
  onBorrowClick: (game: Game) => void;
}

const GameGrid = ({ onBorrowClick }: GameGridProps) => {
  const games: Game[] = [
    {
      id: 1,
      title: 'The Legend of Zelda',
      platform: 'Nintendo Switch',
      genre: 'Action-Adventure',
      available: true,
      gradient: 'from-indigo-400 to-purple-500'
    },
    {
      id: 2,
      title: 'Elden Ring',
      platform: 'PlayStation 5',
      genre: 'RPG',
      available: false,
      gradient: 'from-green-400 to-blue-500'
    },
    {
      id: 3,
      title: 'FIFA 24',
      platform: 'Xbox Series X',
      genre: 'Sports',
      available: true,
      gradient: 'from-red-400 to-orange-500'
    },
    {
      id: 4,
      title: 'Stardew Valley',
      platform: 'PC',
      genre: 'Simulation',
      available: true,
      gradient: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-md">1</button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">2</button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">3</button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <i className="fas fa-chevron-right"></i>
          </button>
        </nav>
      </div>
    </>
  );
};

export default GameGrid;
