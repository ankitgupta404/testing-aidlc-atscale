import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useAnnouncement, useAnnouncements } from "../api/client";
import { ServiceBadge } from "../components/ServiceBadge";
import { AnnouncementCard } from "../components/AnnouncementCard";
import { fullDate } from "../utils/formatDate";

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: announcement, isLoading, error } = useAnnouncement(id || "");

  // Fetch related announcements from the same service
  const { data: related } = useAnnouncements({
    service: announcement?.service,
    limit: 4,
  });

  const relatedAnnouncements =
    related?.pages
      .flatMap((p) => p.announcements)
      .filter((a) => a.id !== id)
      .slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <div className="animate-fade-in space-y-4">
          <div className="skeleton h-4 w-64" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-32 w-full mt-6" />
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-16 animate-fade-in">
          <h2 className="font-display text-xl font-semibold mb-2">
            Announcement not found
          </h2>
          <p className="text-text-secondary mb-4">
            The announcement you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-aws-orange hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-text-secondary mb-6 animate-fade-in">
        <Link to="/" className="hover:text-aws-orange transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/?service=${announcement.service}`}
          className="hover:text-aws-orange transition-colors"
        >
          {announcement.service}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text-primary truncate max-w-[200px]">
          {announcement.title}
        </span>
      </nav>

      {/* Main Content */}
      <article className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <ServiceBadge service={announcement.service} size="md" />
          <span className="flex items-center gap-1.5 text-sm text-text-secondary font-mono">
            <Calendar className="w-3.5 h-3.5" />
            {fullDate(announcement.date)}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary leading-tight mb-6">
          {announcement.title}
        </h1>

        <div className="bg-bg-surface rounded-xl border border-border p-6 sm:p-8 mb-6">
          <p className="text-text-primary leading-relaxed text-[0.95rem]">
            {announcement.summary}
          </p>
        </div>

        {announcement.url && (
          <a
            href={announcement.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-aws-navy text-white text-sm font-medium rounded-lg hover:bg-aws-navy-light transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View on AWS
          </a>
        )}

        <Link
          to="/"
          className="inline-flex items-center gap-2 ml-4 text-sm text-text-secondary hover:text-aws-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </article>

      {/* Related Announcements */}
      {relatedAnnouncements.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-display font-semibold text-lg mb-5">
            More from {announcement.service}
          </h2>
          <div className="space-y-4">
            {relatedAnnouncements.map((related, i) => (
              <AnnouncementCard key={related.id} announcement={related} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
