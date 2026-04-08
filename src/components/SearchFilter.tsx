'use client';

import { useState, useEffect, useRef } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SearchFilterProps {
  platform: string;
  setPlatform: (platform: string) => void;
  genre: string;
  setGenre: (genre: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  applyFilters: (filters: { platform: string; genre: string; searchQuery: string }) => void;
  clearFilters: () => void;
}

const SearchFilter = ({ platform, setPlatform, genre, setGenre, searchQuery, setSearchQuery, applyFilters, clearFilters }: SearchFilterProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlatform = e.target.value;
    console.log('Platform changed to:', newPlatform); // Debug log
    setPlatform(newPlatform);
    // Apply filters with the new platform value immediately
    applyFilters({ platform: newPlatform, genre, searchQuery: localSearchQuery });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGenre = e.target.value;
    console.log('Genre changed to:', newGenre); // Debug log
    setGenre(newGenre);
    // Apply filters with the new genre value immediately
    applyFilters({ platform, genre: newGenre, searchQuery: localSearchQuery });
  };

  const handleSearchChange = (query: string) => {
    console.log('Search query changed to:', query); // Debug log
    setLocalSearchQuery(query);
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout to apply filters after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters({ platform, genre, searchQuery: query });
    }, 300); // 300ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Update local search query when searchQuery prop changes (e.g., from clear filters)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleClearFilters = () => {
    clearFilters();
    // Apply filters with cleared values immediately
    applyFilters({ platform: 'All Platforms', genre: 'All Genres', searchQuery: '' });
  };

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <Container>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input 
                type="search"
                placeholder="Search games by title..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400" aria-hidden="true"></i>
            </div>
          </div>
          <select 
            value={platform}
            onChange={handlePlatformChange}
            className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Platforms</option>
            <option>PlayStation 5</option>
            <option>Xbox Series X</option>
            <option>Nintendo Switch</option>
            <option>PC</option>
          </select>
          <select 
            value={genre}
            onChange={handleGenreChange}
            className="text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option>All Genres</option>
            <option>Action</option>
            <option>RPG</option>
            <option>Sports</option>
            <option>Strategy</option>
          </select>
          <Button 
            onClick={handleClearFilters}
            variant="secondary"
          >
            <i className="fas fa-times mr-2"></i>Clear Filters
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default SearchFilter;
