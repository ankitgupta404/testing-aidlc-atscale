import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import type { Announcement } from "@aws-news-hub/shared";
import { ServiceBadge } from "./ServiceBadge";
import { relativeDate } from "../utils/formatDate";

interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
}

export function AnnouncementCard({ announcement, index = 0 }: AnnouncementCardProps) {
  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className={`group block bg-bg-surface rounded-xl border border-border p-6 transition-all hover:shadow-lg hover:shadow-aws-navy/5 hover:border-aws-orange/30 hover:-translate-y-0.5 animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2.5">
            <ServiceBadge service={announcement.service} />
            <span className="flex items-center gap-1 text-xs text-text-secondary font-mono">
              <Calendar className="w-3 h-3" />
              {relativeDate(announcement.date)}
            </span>
          </div>
          <h3 className="font-display font-semibold text-[1.05rem] text-text-primary mb-2 group-hover:text-aws-navy leading-snug">
            {announcement.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            {announcement.summary}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-text-secondary/40 group-hover:text-aws-orange transition-all group-hover:translate-x-0.5 shrink-0 mt-1" />
      </div>
    </Link>
  );
}
