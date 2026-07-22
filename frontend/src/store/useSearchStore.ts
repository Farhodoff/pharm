import { create } from 'zustand';
import api from '../services/api';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 8;

export interface SuggestionItem {
  id: number;
  name: string;
  type: 'medicine' | 'category' | 'manufacturer';
  internationalName?: string | null;
  activeSubstance?: string | null;
  price?: number;
  discountPrice?: number | null;
  image?: string | null;
}

export interface SearchSuggestions {
  medicines: SuggestionItem[];
  categories: SuggestionItem[];
  manufacturers: SuggestionItem[];
}

export interface PopularSearch {
  query: string;
  count: number;
}

function loadRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

interface SearchState {
  searchQuery: string;
  recentSearches: string[];
  suggestions: SearchSuggestions | null;
  popularSearches: PopularSearch[];
  isSuggestionsOpen: boolean;
  isFetchingSuggestions: boolean;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  fetchSuggestions: (query: string) => Promise<void>;
  fetchPopularSearches: () => Promise<void>;
  setIsSuggestionsOpen: (open: boolean) => void;
  logSearch: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  recentSearches: loadRecentSearches(),
  suggestions: null,
  popularSearches: [],
  isSuggestionsOpen: false,
  isFetchingSuggestions: false,

  setSearchQuery: (query) => set({ searchQuery: query }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const current = get().recentSearches;
    const filtered = current.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
    saveRecentSearches(updated);
    set({ recentSearches: updated });
  },

  clearRecentSearches: () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    set({ recentSearches: [] });
  },

  removeRecentSearch: (query) => {
    const updated = get().recentSearches.filter(s => s !== query);
    saveRecentSearches(updated);
    set({ recentSearches: updated });
  },

  fetchSuggestions: async (query) => {
    if (!query || query.trim().length < 2) {
      set({ suggestions: null, isFetchingSuggestions: false });
      return;
    }
    set({ isFetchingSuggestions: true });
    try {
      const res = await api.get(`/medicines/suggestions?q=${encodeURIComponent(query)}`);
      set({ suggestions: res.data.suggestions, isFetchingSuggestions: false });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      set({ suggestions: null, isFetchingSuggestions: false });
    }
  },

  fetchPopularSearches: async () => {
    try {
      const res = await api.get('/medicines/popular-searches');
      set({ popularSearches: res.data.popularSearches });
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  },

  setIsSuggestionsOpen: (open) => set({ isSuggestionsOpen: open }),

  logSearch: async (query) => {
    if (!query || !query.trim()) return;
    try {
      await api.post('/medicines/log-search', { query });
    } catch {
      // Silently fail — logging is non-critical
    }
  },
}));
