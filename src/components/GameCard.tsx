interface Game {
  id: number;
  title: string;
  platform: string;
  genre: string;
  available: boolean;
  gradient: string;
}

interface GameCardProps {
  game: Game;
  onBorrowClick: (game: Game) => void;
}

const GameCard = ({ game, onBorrowClick }: GameCardProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'PC':
        return 'fas fa-desktop';
      default:
        return 'fas fa-tv';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in">
      <div className={`h-48 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
        <i className="fas fa-gamepad text-white text-6xl"></i>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{game.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <i className={`${getPlatformIcon(game.platform)} mr-2`}></i>
          <span>{game.platform}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <i className="fas fa-tag mr-2"></i>
          <span>{game.genre}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`font-semibold ${game.available ? 'text-green-600' : 'text-red-600'}`}>
            <i className={`fas ${game.available ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
            {game.available ? 'Available' : 'Borrowed'}
          </span>
          <button 
            className={`px-3 py-1 rounded text-sm ${
              game.available 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={!game.available}
            onClick={() => game.available && onBorrowClick(game)}
          >
            {game.available ? 'Borrow' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
