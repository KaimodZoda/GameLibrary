import { Game } from '@/types/game';
import { useSession } from 'next-auth/react';
import { getDisplayStatus } from '@/lib/stats';

interface GameCardProps {
  game: Game;
  loans?: any[];
  returnRequests?: any[];
  onBorrowClick?: (game: Game) => void;
  onUpdate?: (updatedGame: Game) => void;
  isPublic?: boolean;
  showGlobalStatus?: boolean;
}

// Memoize expensive platform icon lookup
const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'PC':
      return 'fas fa-desktop';
    default:
      return 'fas fa-tv';
  }
};

// Simplified GameCard that just emits borrow events
const GameCard = ({ game, loans = [], returnRequests = [], onBorrowClick, onUpdate, isPublic = false, showGlobalStatus = false }: GameCardProps) => {
  const { data: session } = useSession();

  // Check if this game has a pending loan or return in progress
  const hasPendingLoan = loans.some((loan: any) => {
    const status = getDisplayStatus(loan);
    return loan.gameId === game.id && status === 'Borrow Pending';
  });

  // Check if this game has return pending or return approved status
  const hasReturnInProgress = loans.some((loan: any) => {
    const status = getDisplayStatus(loan, returnRequests);
    return loan.gameId === game.id && (status === 'Return Pending' || status === 'Returning');
  });

  // For global status, check if ANY user has an active loan for this game
  const hasActiveLoan = loans.some((loan: any) => {
    const status = getDisplayStatus(loan, returnRequests);
    return loan.gameId === game.id && (status === 'Active' || status === 'Borrow Approved');
  });

  // Check if current user has an active loan for this game (for "Active" status display)
  const hasUserActiveLoan = loans.some((loan: any) => {
    const status = getDisplayStatus(loan, returnRequests);
    const sessionUserId = session?.user?.id;
    const isUserLoan = loan.userId === sessionUserId || (typeof sessionUserId === 'string' && loan.userId === parseInt(sessionUserId));
    return loan.gameId === game.id && (status === 'Active' || status === 'Borrow Approved') && isUserLoan;
  });
  
  const handleBorrow = () => {
    // For public view, redirect to sign in
    if (isPublic) {
      window.location.href = '/pages/auth/signin';
      return;
    }

    if (!onBorrowClick) return;
    
    // Check authentication and emit borrow event
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/pages/auth/signin';
      return;
    }
    
    onBorrowClick(game);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow fade-in">
      <div className={`h-48 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
        <i className="fas fa-gamepad text-white text-6xl" aria-hidden="true"></i>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{game.title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <i className={`${getPlatformIcon(game.platform)} mr-2`} aria-hidden="true"></i>
          <span>{game.platform}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <i className="fas fa-tag mr-2" aria-hidden="true"></i>
          <span>{game.genre}</span>
        </div>
        <div className="flex justify-between items-center">
          {isPublic ? (
            <span className="font-semibold text-indigo-600">
              <i className="fas fa-gamepad mr-1" aria-hidden="true"></i>
              Browse
            </span>
          ) : (
            <span className={`font-semibold ${
              hasPendingLoan 
                ? 'text-orange-600' 
                : hasReturnInProgress
                  ? 'text-purple-600'
                  : showGlobalStatus
                    ? hasUserActiveLoan
                      ? 'text-green-600'
                      : hasActiveLoan
                        ? 'text-red-600'
                        : game.available
                          ? 'text-green-600'
                          : 'text-red-600'
                    : game.available 
                      ? 'text-green-600' 
                      : 'text-red-600'
            }`}>
              <i className={`fas ${
                hasPendingLoan 
                  ? 'fa-hourglass-half' 
                  : hasReturnInProgress
                    ? 'fa-spinner'
                    : showGlobalStatus
                      ? hasUserActiveLoan
                        ? 'fa-check-circle'
                        : hasActiveLoan
                          ? 'fa-times-circle'
                          : game.available
                            ? 'fa-check-circle'
                            : 'fa-times-circle'
                      : game.available 
                        ? 'fa-check-circle' 
                        : 'fa-times-circle'
              } mr-1`} aria-hidden="true"></i>
              {hasPendingLoan ? 'Pending' : hasReturnInProgress ? 'Return in Progress' : showGlobalStatus ? (hasUserActiveLoan ? 'Active' : hasActiveLoan ? 'Borrowed' : game.available ? 'Available' : 'Borrowed') : (game.available ? 'Available' : 'Borrowed')}
            </span>
          )}
          <button 
            className={`px-3 py-1 rounded text-sm ${
              isPublic
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : hasPendingLoan 
                  ? 'bg-orange-600 text-white cursor-not-allowed'
                  : hasReturnInProgress
                    ? 'bg-purple-600 text-white cursor-not-allowed'
                    : showGlobalStatus
                      ? hasUserActiveLoan
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : hasActiveLoan
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : game.available
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                      : game.available 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={isPublic ? false : (hasPendingLoan || hasReturnInProgress || (showGlobalStatus ? hasActiveLoan || !game.available : !game.available))}
            onClick={handleBorrow}
          >
            {isPublic ? 'Book now!' : hasPendingLoan ? 'Pending' : hasReturnInProgress ? 'Return in Progress' : showGlobalStatus ? (hasUserActiveLoan ? 'Active' : hasActiveLoan ? 'Unavailable' : game.available ? 'Borrow' : 'Unavailable') : (game.available ? 'Borrow' : 'Unavailable')}
          </button>
        </div>
      </div>
    </div>
  );
};


export default GameCard;
