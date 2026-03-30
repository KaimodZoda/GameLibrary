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
      
      // Parallel URL parameter building
      const paramTasks = [];
      if (filters.platform && filters.platform !== 'All Platforms') {
        paramTasks.push(
          Promise.resolve().then(() => params.append('platform', filters.platform))
        );
      }
      if (filters.genre && filters.genre !== 'All Genres') {
        paramTasks.push(
          Promise.resolve().then(() => params.append('genre', filters.genre))
        );
      }
      if (filters.searchQuery) {
        paramTasks.push(
          Promise.resolve().then(() => params.append('search', filters.searchQuery))
        );
      }
      
      // Wait for all params to be added (parallel)
      await Promise.all(paramTasks);
      
      const url = `/api/games${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Parallel fetch and parse
      const [response, result] = await Promise.all([
        fetch(url),
        fetch(url).then(r => r.json())
      ]);
      
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
