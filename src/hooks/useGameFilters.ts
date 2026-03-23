import { useState } from 'react';

interface UseGameFiltersReturn {
  platform: string;
  setPlatform: (platform: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  applyFilters: () => void;
  hasActiveFilters: boolean;
  getCurrentFilters: () => {
    platform: string;
    genre: string;
    searchQuery: string;
  };
}

export const useGameFilters = (): UseGameFiltersReturn => {
  const [platform, setPlatform] = useState('All Platforms');
  const [genre, setGenre] = useState('All Genres');
  const [searchQuery, setSearchQuery] = useState('');

  const hasActiveFilters = platform !== 'All Platforms' || genre !== 'All Genres' || searchQuery !== '';

  const getCurrentFilters = () => ({
    platform,
    genre,
    searchQuery
  });

  const applyFilters = () => {
    // This will be handled by the component that calls fetchFilteredGames
    // Keeping the function for compatibility
  };

  return {
    platform,
    setPlatform,
    genre,
    setGenre,
    searchQuery,
    setSearchQuery,
    applyFilters,
    hasActiveFilters,
    getCurrentFilters
  };
};
