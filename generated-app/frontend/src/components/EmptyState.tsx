import { SearchX, Inbox } from "lucide-react";

interface EmptyStateProps {
  searchQuery?: string;
  service?: string;
}

export function EmptyState({ searchQuery, service }: EmptyStateProps) {
  const hasFilters = searchQuery || service;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-bg-primary flex items-center justify-center mb-4">
        {hasFilters ? (
          <SearchX className="w-7 h-7 text-text-secondary" />
        ) : (
          <Inbox className="w-7 h-7 text-text-secondary" />
        )}
      </div>
      <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
        {hasFilters ? "No results found" : "No announcements yet"}
      </h3>
      <p className="text-sm text-text-secondary text-center max-w-md">
        {searchQuery
          ? `No announcements matching "${searchQuery}"`
          : service
          ? `No announcements found for ${service}`
          : "Check back later for the latest AWS service updates."}
      </p>
    </div>
  );
}
