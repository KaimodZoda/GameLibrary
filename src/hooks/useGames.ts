import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/game';

interface UseGamesReturn {
  games: Game[];
  filteredGames: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  applyFilters: (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => void;
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
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteringMode, setFilteringMode] = useState<'client' | 'server'>('client');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = itemsPerPage;

  // Determine if we should use server-side filtering
  const shouldUseServerSide = (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => {
    // Use server-side if:
    // 1. Search query is complex (special characters, long text)
    // 2. Dataset is large (future-proofing)
    // 3. Search query is very short (to get better results)
    const searchComplexity = filters.searchQuery.length > 20 || /[\W_]/.test(filters.searchQuery);
    const searchTooShort = filters.searchQuery.length > 0 && filters.searchQuery.length < 2;
    
    return searchComplexity || searchTooShort;
  };

  // Fetch all games once on mount
  const fetchAllGames = async (currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/games?page=${currentPage}&limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setAllGames(result.data);
        setFilteredGames(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
        console.log('Games fetched:', result.data.length, 'Total:', result.total); // Debug log
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering with partial refresh
  const fetchFilteredGames = useCallback(async (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }, currentPage = 1) => {
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

      console.log('Server-side filtering with URL:', url); // Debug log

      // Use AbortController to handle component unmount
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'X-Partial-Refresh': 'true' } // Custom header for debugging
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (result.success) {
        setFilteredGames(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
        console.log('Server filtered games:', result.data.length); // Debug log
      } else {
        setError('Failed to fetch filtered games');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      setError('Network error during filtering');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Client-side filtering
  const applyClientSideFilters = (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => {
    console.log('Applying client-side filters:', filters); // Debug log

    let filtered = [...allGames];

    // Filter by platform
    if (filters.platform && filters.platform !== 'All Platforms') {
      filtered = filtered.filter(game => game.platform === filters.platform);
    }

    // Filter by genre
    if (filters.genre && filters.genre !== 'All Genres') {
      filtered = filtered.filter(game => game.genre === filters.genre);
    }

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setTotal(filtered.length);
    setTotalPages(Math.ceil(filtered.length / limit));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiltered = filtered.slice(startIndex, endIndex);

    setFilteredGames(paginatedFiltered);
    console.log('Client filtered games:', paginatedFiltered.length, 'Total:', filtered.length); // Debug log
  };

  // Hybrid filtering logic
  const applyFilters = (filters: {
    platform: string;
    genre: string;
    searchQuery: string;
  }) => {
    const useServerSide = shouldUseServerSide(filters);
    setFilteringMode(useServerSide ? 'server' : 'client');
    
    if (useServerSide) {
      fetchFilteredGames(filters);
    } else {
      applyClientSideFilters(filters);
    }
  };

  useEffect(() => {
    fetchAllGames();
  }, []);

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchAllGames(newPage);
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
    refetch: fetchAllGames,
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
