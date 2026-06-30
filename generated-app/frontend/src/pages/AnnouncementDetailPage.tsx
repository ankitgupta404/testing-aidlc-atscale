import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAnnouncement, useDeleteAnnouncement } from '../hooks/useAnnouncements';
import ServiceBadge from '../components/ServiceBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import { ArrowLeft, Calendar, ExternalLink, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: announcement, isLoading, isError } = useAnnouncement(id || '');
  const deleteMutation = useDeleteAnnouncement();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/');
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (isError || !announcement) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-[#2E3440] mb-2">Announcement not found</h2>
        <p className="text-sm text-[#4C566A] mb-6">
          The announcement you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5E81AC] text-white rounded-lg text-sm font-medium hover:bg-[#4C6A94] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-[#5E81AC] hover:text-[#4C6A94] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to feed
      </Link>

      {/* Article */}
      <article className="bg-white rounded-xl border border-[#E5E9F0] p-6 sm:p-8">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <ServiceBadge service={announcement.service} size="md" />
          <span className="flex items-center gap-1.5 text-sm text-[#4C566A] font-['JetBrains_Mono']">
            <Calendar className="w-4 h-4" />
            {formatDate(announcement.date)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3440] font-['Crimson_Pro'] leading-tight mb-6">
          {announcement.title}
        </h1>

        {/* Summary */}
        <div className="prose prose-sm max-w-none">
          <p className="text-[#4C566A] leading-relaxed text-base whitespace-pre-wrap">
            {announcement.summary}
          </p>
        </div>

        {/* External Link */}
        {announcement.link && (
          <a
            href={announcement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#ECEFF4] text-[#5E81AC] rounded-lg text-sm font-medium hover:bg-[#E5E9F0] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on AWS
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#E5E9F0]">
          <Link
            to={`/announcements/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5E81AC] text-white rounded-lg text-sm font-medium hover:bg-[#4C6A94] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </article>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-[#2E3440] mb-2">Delete announcement?</h3>
            <p className="text-sm text-[#4C566A] mb-6">
              This action cannot be undone. The announcement will be permanently removed.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-[#4C566A] hover:text-[#2E3440] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
