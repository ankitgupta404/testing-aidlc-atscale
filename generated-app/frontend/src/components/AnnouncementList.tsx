import type { Announcement } from '@aws-news-hub/shared';
import AnnouncementCard from './AnnouncementCard';
import { Inbox } from 'lucide-react';

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading?: boolean;
}

export default function AnnouncementList({ announcements, isLoading }: AnnouncementListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`bg-white rounded-xl border border-[#E5E9F0] p-6 animate-fade-in-up stagger-${i + 1}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-20 rounded-md skeleton-shimmer" />
                <div className="h-4 w-24 rounded skeleton-shimmer ml-auto" />
              </div>
              <div className="h-6 w-3/4 rounded skeleton-shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E5E9F0] mb-4">
          <Inbox className="w-8 h-8 text-[#4C566A]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2E3440] mb-2">No announcements found</h3>
        <p className="text-sm text-[#4C566A]">
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
