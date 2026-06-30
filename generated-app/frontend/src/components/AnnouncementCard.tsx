import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Announcement } from '@aws-news-hub/shared';
import ServiceBadge from './ServiceBadge';
import { formatDate } from '../utils/formatDate';

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
}

export default function AnnouncementCard({ announcement, index = 0 }: AnnouncementCardProps) {
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;

  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className={`block animate-fade-in-up ${staggerClass}`}
    >
      <article className="bg-white rounded-xl border border-[#E5E9F0] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[#88C0D0] hover:-translate-y-0.5 group">
        <div className="flex flex-col gap-3">
          {/* Top row: Badge + date */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ServiceBadge service={announcement.service} />
            <span className="flex items-center gap-1.5 text-xs text-[#4C566A] font-['JetBrains_Mono']">
              <Calendar className="w-3 h-3" />
              {formatDate(announcement.date)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-[#2E3440] group-hover:text-[#5E81AC] transition-colors leading-snug font-['Crimson_Pro']">
            {announcement.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-[#4C566A] leading-relaxed line-clamp-3">
            {announcement.summary}
          </p>

          {/* Link indicator */}
          {announcement.link && (
            <div className="flex items-center gap-1 text-xs text-[#81A1C1]">
              <ExternalLink className="w-3 h-3" />
              <span>External link available</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
