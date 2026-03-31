import { useState } from 'react';
import { Game } from '@/types/game';

interface BorrowConfirmationModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBorrowing: boolean;
}

const BorrowConfirmationModal = ({ 
  game, 
  isOpen, 
  onClose, 
  onConfirm, 
  isBorrowing 
}: BorrowConfirmationModalProps) => {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'PC':
        return 'fas fa-desktop';
      default:
        return 'fas fa-tv';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Confirm Borrow</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{game.title}</h4>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <i className={`${getPlatformIcon(game.platform)} mr-2`} aria-hidden="true"></i>
              <span>{game.platform}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-tag mr-2" aria-hidden="true"></i>
              <span>{game.genre}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Due date: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isBorrowing}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBorrowing ? 'Borrowing...' : 'Confirm Borrow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowConfirmationModal;
