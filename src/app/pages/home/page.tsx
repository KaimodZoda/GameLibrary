'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import SearchFilter from '@/components/SearchFilter';
import BorrowConfirmationModal from '@/components/BorrowConfirmationModal';
import Container from '@/components/ui/Container';
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useGameFilters } from '@/hooks/useGameFilters';

export default function Home() {
  const { data: session } = useSession();
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  
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

  const handleConfirmBorrow = useCallback(async (dueDate: string) => {
    if (!selectedGame || !session?.user) return;
    
    setIsBorrowing(true);
    
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameId: selectedGame.id,
          dueDate: dueDate
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
      setIsBorrowing(false);
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
        <BorrowConfirmationModal
          game={selectedGame}
          isOpen={showBorrowModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBorrow}
          isBorrowing={isBorrowing}
        />
      </main>
      <Footer />
    </>
  );
}
