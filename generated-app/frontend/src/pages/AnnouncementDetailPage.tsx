import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ExternalLink, Pencil, Trash2 } from '../components/Icons';
import { useAnnouncement, useDeleteAnnouncement } from '../hooks/useAnnouncements';
import ServiceBadge from '../components/ServiceBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import { useState } from 'react';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: announcement, isLoading, isError } = useAnnouncement(id);
  const deleteAnnouncement = useDeleteAnnouncement();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  if (isError || !announcement) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-display)]">
          Announcement not found
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          The announcement you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-aws-orange hover:text-aws-orange-hover font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteAnnouncement.mutateAsync(announcement.id);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-aws-orange transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      {/* Article */}
      <article className="bg-surface rounded-xl border border-border p-8">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <ServiceBadge service={announcement.service} size="md" />
          <div className="flex items-center gap-1.5 text-text-muted text-sm font-[family-name:var(--font-mono)]">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(announcement.date)}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 font-[family-name:var(--font-display)] leading-tight">
          {announcement.title}
        </h1>

        {/* Summary */}
        <div className="prose prose-sm max-w-none">
          <p className="text-text-secondary leading-relaxed text-base whitespace-pre-wrap">
            {announcement.summary}
          </p>
        </div>

        {/* External link */}
        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-aws-orange/10 text-aws-orange rounded-lg text-sm font-medium hover:bg-aws-orange/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View original announcement
          </a>
        )}

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to={`/announcements/${announcement.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-aws-navy text-white rounded-lg text-sm font-medium hover:bg-aws-navy-light transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg text-sm font-medium hover:bg-error/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </article>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl animate-slide-down">
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-display)]">
              Delete Announcement
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteAnnouncement.isPending}
                className="px-4 py-2 bg-error text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteAnnouncement.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
