import { Link } from 'react-router-dom';
import { Calendar, ExternalLink } from './Icons';
import type { Announcement } from '@aws-news-hub/shared';
import ServiceBadge from './ServiceBadge';
import { formatDate } from '../utils/formatDate';

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
}

export default function AnnouncementCard({ announcement, index = 0 }: AnnouncementCardProps) {
  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className={`block bg-surface rounded-xl border border-border p-6 card-hover animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
    >
      <div className="flex flex-col gap-3">
        {/* Top row: service badge + date */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <ServiceBadge service={announcement.service} />
          <div className="flex items-center gap-1.5 text-text-muted text-xs font-[family-name:var(--font-mono)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(announcement.date)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary leading-snug font-[family-name:var(--font-display)] group-hover:text-aws-orange transition-colors">
          {announcement.title}
        </h3>

        {/* Summary (truncated) */}
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
          {announcement.summary}
        </p>

        {/* Link indicator */}
        {announcement.link && (
          <div className="flex items-center gap-1 text-aws-orange text-xs font-medium">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View original</span>
          </div>
        )}
      </div>
    </Link>
  );
}
