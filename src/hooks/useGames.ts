import { useState, useEffect } from 'react';
import { Game } from '@/types/game';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchFilteredGames: (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => void;
}

export const useGames = (): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState({
    platform: 'All Platforms',
    genre: 'All Genres',
    searchQuery: ''
  });

  const fetchGames = async (filters = currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      // Build URL parameters efficiently
      if (filters.platform && filters.platform !== 'All Platforms') {
        params.append('platform', filters.platform);
      }
      if (filters.genre && filters.genre !== 'All Genres') {
        params.append('genre', filters.genre);
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      
      const url = `/api/games${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setGames(result.data);
        setCurrentFilters(filters);
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredGames = (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => {
    fetchGames(filters);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    loading,
    error,
    refetch: () => fetchGames(),
    fetchFilteredGames
  };
};
