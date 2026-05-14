import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/game';
import type { GameFilters } from '@/types/game-filters';

type GamesApiResponse = {
  success: boolean;
  data: Game[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
};

const DEFAULT_GAME_FILTERS: GameFilters = {
  platform: 'All Platforms',
  genre: 'All Genres',
  searchQuery: ''
};

interface UseGamesReturn {
  games: Game[];
  filteredGames: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  applyFilters: (filters: GameFilters) => void;
  filteringMode: 'client' | 'server';
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
  };
}

export const useGames = (itemsPerPage: number = 4): UseGamesReturn => {
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteringMode] = useState<'client' | 'server'>('server');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<GameFilters>({
    ...DEFAULT_GAME_FILTERS
  });
  const limit = itemsPerPage;
 
  const fetchGames = useCallback(async (filters: GameFilters, currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      if (filters.platform && filters.platform !== 'All Platforms') {
        params.append('platform', filters.platform);
      }
      if (filters.genre && filters.genre !== 'All Genres') {
        params.append('genre', filters.genre);
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }

      const url = `/api/games?${params.toString()}`;

      // Use AbortController to handle component unmount
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'X-Partial-Refresh': 'true' } // Custom header for debugging
      });

      clearTimeout(timeoutId);
      const result: GamesApiResponse = await response.json();

      if (result.success) {
        setFilteredGames(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      } else {
        setError(result.message || 'Failed to fetch games');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError('Network error while loading games');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const applyFilters = (filters: GameFilters) => {
    setCurrentFilters(filters);
    fetchGames(filters, 1);
  };

  useEffect(() => {
    fetchGames(DEFAULT_GAME_FILTERS, 1);
  }, [fetchGames]);

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    fetchGames(currentFilters, newPage);
  };

  const nextPage = () => {
    if (page < totalPages) {
      handlePageChange(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      handlePageChange(page - 1);
    }
  };

  return {
    games: filteredGames, // For backward compatibility
    filteredGames,
    loading,
    error,
    refetch: () => fetchGames(currentFilters, page),
    applyFilters,
    filteringMode,
    pagination: {
      page,
      totalPages,
      total,
      limit,
      setPage: handlePageChange,
      nextPage,
      prevPage
    }
  };
};
