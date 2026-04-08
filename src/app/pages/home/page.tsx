'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import SearchFilter from '@/components/SearchFilter';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useGameFilters } from '@/hooks/useGameFilters';

// Hoist modal backdrop JSX
const ModalBackdrop = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div 
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    onClick={onClose}
  >
    {children}
  </div>
);

// Hoist modal content JSX
const ModalContent = ({ 
  game, 
  onClose, 
  onConfirm 
}: { 
  game: any; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => (
  <div 
    className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10"
    onClick={(e) => e.stopPropagation()}
  >
    <h3 className="text-xl font-bold mb-4">Borrow Game</h3>
    <div className="mb-4">
      <p className="text-gray-600 mb-2">Game: <span className="font-semibold">{game?.title}</span></p>
      <p className="text-gray-600 mb-2">Platform: <span className="font-semibold">{game?.platform}</span></p>
    </div>
    <div className="mb-4">
      <Input 
        type="date"
        label="Due Date"
        required
      />
    </div>
    <div className="flex justify-end space-x-3">
      <Button 
        onClick={onClose}
        variant="outline"
      >
        Cancel
      </Button>
      <Button 
        onClick={onConfirm}
      >
        Confirm Borrow
      </Button>
    </div>
  </div>
);

export default function Home() {
  const { data: session } = useSession();
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  
  // Manage filter state at the Home level
  const { platform, setPlatform, genre, setGenre, searchQuery, setSearchQuery, applyFilters, clearFilters, getCurrentFilters } = useGameFilters();

  // Apply filters using the window functions from GameGrid
  const handleApplyFilters = (filters: { platform: string; genre: string; searchQuery: string }) => {
    if (typeof window !== 'undefined' && (window as any).applyGameFilters) {
      (window as any).applyGameFilters(filters);
    }
  };

  const handleClearFilters = () => {
    if (typeof window !== 'undefined' && (window as any).clearGameFilters) {
      (window as any).clearGameFilters();
    }
    clearFilters();
  };

  const handleBorrowClick = useCallback((game: any) => {
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/pages/auth/signin';
      return;
    }
    
    setSelectedGame(game);
    setShowBorrowModal(true);
  }, [session]);

  const handleCloseModal = useCallback(() => {
    setShowBorrowModal(false);
    setSelectedGame(null);
  }, []);

  const handleConfirmBorrow = useCallback(async () => {
    if (!selectedGame || !session?.user) return;
    
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameId: selectedGame.id,
          // Optional: allow user to specify due date
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        console.log('Game borrowed successfully!');
        // Update the game grid to reflect availability change
        window.location.reload();
      } else {
        console.error('Failed to borrow game:', result.message);
      }
    } catch (error) {
      console.error('Error borrowing game:', error);
    } finally {
      handleCloseModal();
    }
  }, [selectedGame, session]);

  return (
    <>
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <Container className="py-8">
          <StatsSection />
          <SearchFilter 
            platform={platform}
            setPlatform={setPlatform}
            genre={genre}
            setGenre={setGenre}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            applyFilters={handleApplyFilters}
            clearFilters={handleClearFilters}
          />
          <GameGrid 
            onBorrowClick={handleBorrowClick}
          />
        </Container>
        {showBorrowModal && (
          <ModalBackdrop onClose={handleCloseModal}>
            <ModalContent 
              game={selectedGame}
              onClose={handleCloseModal}
              onConfirm={handleConfirmBorrow}
            />
          </ModalBackdrop>
        )}
      </main>
      <Footer />
    </>
  );
}
