import { useState } from 'react';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useDebounce } from '../hooks/useDebounce';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import AnnouncementList from '../components/AnnouncementList';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, isError, error, refetch } = useAnnouncements({
    service: selectedService,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#2E3440] font-['Crimson_Pro'] tracking-tight">
          Latest AWS Announcements
        </h1>
        <p className="mt-2 text-[#4C566A] text-sm sm:text-base">
          Stay up-to-date with the latest service releases, features, and updates from AWS.
        </p>
      </div>

      {/* Search */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {/* Filters */}
      <FilterBar
        selectedService={selectedService}
        onServiceChange={setSelectedService}
      />

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Failed to load announcements</p>
            <p className="text-xs text-red-600 mt-1">{(error as Error)?.message || 'Unknown error'}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Results count */}
      {data && !isLoading && (
        <div className="flex items-center justify-between animate-fade-in-up stagger-3">
          <p className="text-xs font-['JetBrains_Mono'] text-[#4C566A]">
            {data.announcements.length} announcement{data.announcements.length !== 1 ? 's' : ''}
            {selectedService && ` in ${selectedService}`}
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </p>
        </div>
      )}

      {/* Announcement List */}
      <AnnouncementList
        announcements={data?.announcements || []}
        isLoading={isLoading}
      />
    </div>
  );
}
