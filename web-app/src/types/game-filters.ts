export interface GameFilters {
  platform: string;
  genre: string;
  searchQuery: string;
}

declare global {
  interface Window {
    applyGameFilters?: (filters: GameFilters) => void;
    clearGameFilters?: () => void;
  }
}

export {};
