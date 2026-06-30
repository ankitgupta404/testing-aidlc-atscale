import type { Announcement } from '@aws-news-hub/shared';
import AnnouncementCard from './AnnouncementCard';
import LoadingSpinner from './LoadingSpinner';
import { Inbox } from './Icons';

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export default function AnnouncementList({ announcements, isLoading, isError, error }: AnnouncementListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-display)]">
          Unable to load announcements
        </h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          {error?.message || 'Something went wrong. Please try again later.'}
        </p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-display)]">
          No announcements found
        </h3>
        <p className="text-text-secondary text-sm">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          index={index}
        />
      ))}
    </div>
  );
}
