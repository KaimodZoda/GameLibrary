'use client';

import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import GameGrid from '@/components/GameGrid';
import SearchFilter from '@/components/SearchFilter';
import Container from '@/components/ui/Container';
import { useSession } from 'next-auth/react';
import { useGameFilters } from '@/hooks/useGameFilters';

export default function Browse() {
  const { data: session } = useSession();
  
  // Manage filter state at the Browse level
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
