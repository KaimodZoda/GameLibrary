'use client';

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
  applyFilters: () => void;
}

const SearchFilter = ({ platform, setPlatform, genre, setGenre, searchQuery, setSearchQuery, applyFilters }: SearchFilterProps) => {
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlatform(e.target.value);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value);
  };

  const handleFilterClick = () => {
    applyFilters();
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
                value={searchQuery}
                onChange={setSearchQuery}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
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
            onClick={handleFilterClick}
          >
            <i className="fas fa-filter mr-2"></i>Filter
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default SearchFilter;
