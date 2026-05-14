'use client';

import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import SearchFilter from '@/components/SearchFilter';
import Container from '@/components/ui/Container';
import { useSession } from 'next-auth/react';
import { useGameFilters } from '@/hooks/useGameFilters';
import type { GameFilters } from '@/types/game-filters';

export default function Home() {
  const { data: session } = useSession();
  
  // Manage filter state at the Home level
  const { platform, setPlatform, genre, setGenre, searchQuery, setSearchQuery, applyFilters, clearFilters, getCurrentFilters } = useGameFilters();

  // Apply filters using the window functions from GameGrid
  const handleApplyFilters = (filters: GameFilters) => {
    if (typeof window !== 'undefined' && window.applyGameFilters) {
      window.applyGameFilters(filters);
    }
  };

  const handleClearFilters = () => {
    if (typeof window !== 'undefined' && window.clearGameFilters) {
      window.clearGameFilters();
    }
    clearFilters();
  };

  return (
    <>
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
          <GameGrid showAllLoans={true} />
        </Container>
    </>
  );
}
