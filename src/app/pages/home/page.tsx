'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useCallback } from 'react';

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
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const handleBorrowClick = useCallback((game: any) => {
    setSelectedGame(game);
    setShowBorrowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowBorrowModal(false);
    setSelectedGame(null);
  }, []);

  const handleConfirmBorrow = useCallback(() => {
    console.log(`Borrowing ${selectedGame?.title}`);
    handleCloseModal();
  }, [selectedGame, handleCloseModal]);

  return (
    <>
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <Container className="py-8">
          <StatsSection />
          <GameGrid onBorrowClick={handleBorrowClick} />
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
