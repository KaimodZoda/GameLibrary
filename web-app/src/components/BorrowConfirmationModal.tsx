import { useState } from 'react';
import { Game } from '@/types/game';

interface BorrowConfirmationModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dueDate: string) => void;
  isBorrowing: boolean;
}

type DateBounds = {
  defaultDueDate: string;
  minDate: string;
  maxDate: string;
};

const getDateBounds = (): DateBounds => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const defaultDueDate = new Date(today);
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  return {
    defaultDueDate: defaultDueDate.toISOString().split('T')[0],
    minDate: tomorrow.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0]
  };
};

const BorrowConfirmationModal = ({ 
  game, 
  isOpen, 
  onClose, 
  onConfirm, 
  isBorrowing 
}: BorrowConfirmationModalProps) => {
  const [dateBounds, setDateBounds] = useState<DateBounds>(() => getDateBounds());
  const [dueDate, setDueDate] = useState(dateBounds.defaultDueDate);
  const [dateError, setDateError] = useState('');

  // Validate due date
  const validateDueDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30); // Max 30 days from today
    
    if (selectedDate <= today) {
      setDateError('Due date must be in the future');
      return false;
    }
    
    if (selectedDate > maxDate) {
      setDateError('Due date cannot be more than 30 days from today');
      return false;
    }
    
    setDateError('');
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    validateDueDate(newDate);
  };

  const handleConfirm = () => {
    if (validateDueDate(dueDate)) {
      onConfirm(dueDate);
    }
  };

  if (!isOpen) return null;

  const resetForm = () => {
    const nextBounds = getDateBounds();
    setDateBounds(nextBounds);
    setDueDate(nextBounds.defaultDueDate);
    setDateError('');
  };

  const handleClose = () => {
    resetForm();
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
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Confirm Borrow</h3>
          <button 
            onClick={handleClose}
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
            <label className="block text-sm font-medium text-blue-800 mb-2">
              <i className="fas fa-calendar-alt mr-2"></i>
              Select Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={handleDateChange}
              min={dateBounds.minDate}
              max={dateBounds.maxDate}
              className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {dateError && (
              <p className="mt-2 text-sm text-red-600">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {dateError}
              </p>
            )}
            <p className="mt-2 text-xs text-blue-600">
              <i className="fas fa-info-circle mr-1"></i>
              Select a date between tomorrow and 30 days from today
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
              <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isBorrowing || !!dateError}
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
