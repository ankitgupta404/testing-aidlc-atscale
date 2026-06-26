import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Loader2, Radio } from "lucide-react";
import { useAnnouncements } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import { AnnouncementCard } from "../components/AnnouncementCard";
import { ServiceFilter, MobileServiceFilter } from "../components/ServiceFilter";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";

interface HomePageProps {
  searchQuery: string;
}

export function HomePage({ searchQuery }: HomePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedService = searchParams.get("service") || undefined;
  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useAnnouncements({
    service: selectedService,
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const handleServiceChange = (service: string | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (service) {
      params.set("service", service);
    } else {
      params.delete("service");
    }
    setSearchParams(params);
  };

  const allAnnouncements = data?.pages.flatMap((page) => page.announcements) || [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Hero Section */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-aws-orange" />
          <span className="text-xs font-mono text-aws-orange uppercase tracking-wider font-medium">
            Live Updates
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          Latest AWS Service Releases
        </h1>
        <p className="text-text-secondary text-base">
          Stay up to date with the newest announcements across all AWS services.
        </p>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-all"
        >
          <Filter className="w-4 h-4" />
          Filter
          {selectedService && (
            <span className="ml-1 px-1.5 py-0.5 bg-aws-orange/10 text-aws-orange rounded text-xs">
              1
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <ServiceFilter
            selectedService={selectedService}
            onServiceChange={handleServiceChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Results count */}
          {!isLoading && allAnnouncements.length > 0 && (
            <div className="flex items-center justify-between mb-4 animate-fade-in">
              <p className="text-sm text-text-secondary">
                <span className="font-mono font-medium text-text-primary">{allAnnouncements.length}</span>
                {" "}announcement{allAnnouncements.length !== 1 ? "s" : ""}
                {selectedService && <span> in <span className="font-medium text-text-primary">{selectedService}</span></span>}
                {debouncedSearch && <span> matching "<span className="font-medium text-text-primary">{debouncedSearch}</span>"</span>}
              </p>
            </div>
          )}

          {isLoading ? (
            <LoadingState />
          ) : allAnnouncements.length === 0 ? (
            <EmptyState searchQuery={debouncedSearch} service={selectedService} />
          ) : (
            <>
              <div className="space-y-4">
                {allAnnouncements.map((announcement, index) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    index={index}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 px-6 py-3 bg-aws-navy text-white text-sm font-medium rounded-lg hover:bg-aws-navy-light transition-all disabled:opacity-50"
                  >
                    {isFetchingNextPage && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Panel */}
      <MobileServiceFilter
        selectedService={selectedService}
        onServiceChange={handleServiceChange}
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      />
    </div>
  );
}
