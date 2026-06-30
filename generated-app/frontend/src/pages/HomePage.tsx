import { useState } from 'react';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useDebounce } from '../hooks/useDebounce';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import AnnouncementList from '../components/AnnouncementList';
import { Zap } from '../components/Icons';

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading, isError, error } = useAnnouncements({
    service: selectedService,
    search: debouncedSearch || undefined,
  });

  const announcements = data?.announcements || [];

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-aws-orange/10 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-aws-orange" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-[family-name:var(--font-display)]">
            Latest AWS News
          </h1>
        </div>
        <p className="text-text-secondary text-sm sm:text-base ml-11 font-[family-name:var(--font-serif)] italic">
          Stay up-to-date with the latest service releases, features, and announcements
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedService={selectedService}
        onServiceChange={setSelectedService}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
      />

      {/* Results count */}
      {!isLoading && !isError && (
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-sm text-text-muted font-[family-name:var(--font-mono)]">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
            {selectedService && <span className="text-aws-orange"> · {selectedService}</span>}
            {debouncedSearch && <span className="text-aws-orange"> · "{debouncedSearch}"</span>}
          </p>
        </div>
      )}

      {/* Announcement List */}
      <AnnouncementList
        announcements={announcements}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </div>
  );
}
