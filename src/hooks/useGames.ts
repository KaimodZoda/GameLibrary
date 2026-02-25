import { useState, useEffect } from 'react';
import { Game } from '@/types/game';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGames = (): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/games');
      const result = await response.json();
      
      if (result.success) {
        setGames(result.data);
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    loading,
    error,
    refetch: fetchGames
  };
};
