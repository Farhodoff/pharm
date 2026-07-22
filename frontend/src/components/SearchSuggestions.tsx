import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Clock,
  TrendingUp,
  X,
  Pill,
  Tag,
  Building2,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useSearchStore, type SuggestionItem } from '../store/useSearchStore';
import { formatPrice } from '../utils/format';

interface SearchSuggestionsProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: (q: string) => void;
  showPopular?: boolean;
}

export default function SearchSuggestions({
  inputRef,
  searchQuery,
  setSearchQuery,
  onSearch,
  showPopular = true,
}: SearchSuggestionsProps) {
  const navigate = useNavigate();
  const {
    recentSearches,
    popularSearches,
    suggestions,
    isSuggestionsOpen,
    isFetchingSuggestions,
    setIsSuggestionsOpen,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
    fetchSuggestions,
    fetchPopularSearches,
    logSearch,
  } = useSearchStore();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Fetch popular searches on mount
  useEffect(() => {
    if (showPopular && popularSearches.length === 0) {
      fetchPopularSearches();
    }
  }, [showPopular, popularSearches.length, fetchPopularSearches]);

  // Debounced fetching of suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 250);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputRef, setIsSuggestionsOpen]);

  // Attach keyboard handler to the input element
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handler = (e: KeyboardEvent) => {
      if (!isSuggestionsOpen) return;

      const items = getFlatItems();
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < items.length) {
            // Let the form handle it if no item is selected
            handleSelect(items[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsSuggestionsOpen(false);
          el.blur();
          break;
      }
    };

    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [inputRef, isSuggestionsOpen, activeIndex, suggestions, recentSearches, popularSearches, searchQuery, showPopular]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions, searchQuery]);

  const handleSelect = (item: SuggestionItem | string) => {
    setIsSuggestionsOpen(false);

    if (typeof item === 'string') {
      // Let the parent handle logging via onSearch
      setSearchQuery(item);
      onSearch(item);
    } else if (item.type === 'medicine') {
      addRecentSearch(item.name);
      logSearch(item.name);
      navigate(`/medicine/${item.id}`);
    } else if (item.type === 'category') {
      addRecentSearch(item.name);
      logSearch(item.name);
      navigate(`/search?category=${item.id}`);
    } else if (item.type === 'manufacturer') {
      addRecentSearch(item.name);
      logSearch(item.name);
      navigate(`/search?q=${encodeURIComponent(item.name)}`);
    }
  };

  const getFlatItems = (): (SuggestionItem | string)[] => {
    if (!isSuggestionsOpen) return [];
    const items: (SuggestionItem | string)[] = [];

    if (searchQuery.trim().length >= 2 && suggestions) {
      if (suggestions.medicines.length > 0) items.push(...suggestions.medicines);
      if (suggestions.categories.length > 0) items.push(...suggestions.categories);
      if (suggestions.manufacturers.length > 0) items.push(...suggestions.manufacturers);
    } else if (showPopular) {
      if (recentSearches.length > 0) {
        items.push(...recentSearches);
      }
      if (popularSearches.length > 0) {
        items.push(...popularSearches.map(p => p.query));
      }
    }
    return items;
  };

  const renderContent = () => {
    if (searchQuery.trim().length >= 2 && isFetchingSuggestions) {
      return (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Qidirilmoqda...</span>
        </div>
      );
    }

    if (searchQuery.trim().length >= 2 && suggestions) {
      const hasResults =
        suggestions.medicines.length > 0 ||
        suggestions.categories.length > 0 ||
        suggestions.manufacturers.length > 0;

      if (!hasResults) {
        return (
          <div className="py-8 text-center text-slate-400">
            <SearchIcon size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Hech narsa topilmadi</p>
            <p className="text-xs text-slate-300 mt-1">
              Boshqa so'z bilan izlab ko'ring
            </p>
          </div>
        );
      }

      const medCount = suggestions.medicines.length;
      const catCount = suggestions.categories.length;

      return (
        <>
          {medCount > 0 && <SectionLabel label="Dorilar" />}
          {suggestions.medicines.map((m, i) => (
            <SuggestionRow
              key={`med-${m.id}`}
              item={m}
              index={i}
              activeIndex={activeIndex}
              onSelect={handleSelect}
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 truncate">{m.internationalName || m.activeSubstance}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600 shrink-0">
                  {m.discountPrice
                    ? formatPrice(m.discountPrice)
                    : formatPrice(m.price ?? 0)}
                </span>
              </div>
            </SuggestionRow>
          ))}
          {catCount > 0 && (
            <>
              {medCount > 0 && <div className="border-t border-slate-100" />}
              <SectionLabel label="Kategoriyalar" />
              {suggestions.categories.map((c, i) => (
                <SuggestionRow
                  key={`cat-${c.id}`}
                  item={c}
                  index={medCount + i}
                  activeIndex={activeIndex}
                  onSelect={handleSelect}
                >
                  <span className="text-slate-700">{c.name}</span>
                </SuggestionRow>
              ))}
            </>
          )}
          {suggestions.manufacturers.length > 0 && (
            <>
              {(medCount > 0 || catCount > 0) && <div className="border-t border-slate-100" />}
              <SectionLabel label="Ishlab chiqaruvchilar" />
              {suggestions.manufacturers.map((m, i) => (
                <SuggestionRow
                  key={`man-${m.id}`}
                  item={m}
                  index={medCount + catCount + i}
                  activeIndex={activeIndex}
                  onSelect={handleSelect}
                >
                  <span className="text-slate-700">{m.name}</span>
                </SuggestionRow>
              ))}
            </>
          )}
        </>
      );
    }

    // Show recent + popular when no query or query < 2 chars
    if (showPopular) {
      const hasRecent = recentSearches.length > 0;
      const hasPopular = popularSearches.length > 0;

      if (!hasRecent && !hasPopular) {
        return (
          <div className="py-6 text-center text-slate-400 text-sm">
            <SearchIcon size={24} className="mx-auto mb-1 opacity-30" />
            Qidiruvni boshlang
          </div>
        );
      }

      return (
        <>
          {hasRecent && (
            <>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  So'nggi qidiruvlar
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  Tozalash
                </button>
              </div>
              {recentSearches.map((q, i) => (
                <div
                  key={`recent-${q}`}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    i === activeIndex
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                  onClick={() => handleSelect(q)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm truncate">{q}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(q);
                    }}
                    className="p-1 rounded hover:bg-slate-200 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </>
          )}
          {hasPopular && (
            <>
              {hasRecent && <div className="border-t border-slate-100" />}
              <SectionLabel label="Ommabop qidiruvlar" />
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {popularSearches.map((p) => (
                  <button
                    key={p.query}
                    onClick={() => handleSelect(p.query)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 text-xs px-3 py-1.5 rounded-full transition-colors"
                  >
                    <TrendingUp size={12} />
                    {p.query}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
    >
      <div className="max-h-96 overflow-y-auto">
        {renderContent()}
      </div>
      {isSuggestionsOpen && (
        <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-4">
          <span>↑↓ Navigatsiya</span>
          <span>Enter Tanlash</span>
          <span>Esc Yopish</span>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 py-1.5 bg-slate-50">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function SuggestionRow({
  item,
  index,
  activeIndex,
  onSelect,
  children,
}: {
  item: SuggestionItem | string;
  index: number;
  activeIndex: number;
  onSelect: (item: SuggestionItem | string) => void;
  children: React.ReactNode;
}) {
  const isActive = index === activeIndex;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'
      }`}
      onClick={() => onSelect(item)}
    >
      <div className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        {renderItemIcon(item)}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function renderItemIcon(item: SuggestionItem | string) {
  if (typeof item === 'string') return <SearchIcon size={16} />;
  switch (item.type) {
    case 'medicine': return <Pill size={16} />;
    case 'category': return <Tag size={16} />;
    case 'manufacturer': return <Building2 size={16} />;
  }
}
