import { useState, useMemo } from 'react';
import { Game } from '@/types/game';

interface UseGameFiltersReturn {
  filteredGames: Game[];
  platform: string;
  setPlatform: (platform: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  applyFilters: () => void;
  hasActiveFilters: boolean;
}

export const useGameFilters = (allGames: Game[]): UseGameFiltersReturn => {
  const [platform, setPlatform] = useState('All Platforms');
  const [appliedPlatform, setAppliedPlatform] = useState('All Platforms');

  const [genre, setGenre] = useState('All Genres');
  const [appliedGenre, setAppliedGenre] = useState('All Genres');

  const filteredGames = useMemo(() => {
    return allGames.filter(game => {
      const platformMatch = appliedPlatform === 'All Platforms' || game.platform === appliedPlatform;
      const genreMatch = appliedGenre === 'All Genres' || game.genre === appliedGenre;
      return platformMatch && genreMatch;
    });
  }, [allGames, appliedPlatform, appliedGenre]);

  const applyFilters = () => {
    setAppliedPlatform(platform);
    setAppliedGenre(genre);
  };

  const hasActiveFilters = appliedPlatform !== 'All Platforms' || appliedGenre !== 'All Genres';

  return {
    filteredGames,
    platform,
    setPlatform,
    genre,
    setGenre,
    applyFilters,
    hasActiveFilters
  };
};
