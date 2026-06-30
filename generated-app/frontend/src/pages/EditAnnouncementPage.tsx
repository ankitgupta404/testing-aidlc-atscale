import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from '../components/Icons';
import { UpdateAnnouncementInputSchema } from '@aws-news-hub/shared';
import type { AwsService } from '@aws-news-hub/shared';
import { useAnnouncement, useUpdateAnnouncement } from '../hooks/useAnnouncements';
import { AWS_SERVICES } from '../utils/constants';
import { formatDateForInput, toISODateTime } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: announcement, isLoading } = useAnnouncement(id);
  const updateAnnouncement = useUpdateAnnouncement();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    service: '' as AwsService | '',
    date: '',
    summary: '',
    link: '',
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        service: announcement.service,
        date: formatDateForInput(announcement.date),
        summary: announcement.summary,
        link: announcement.link || '',
      });
    }
  }, [announcement]);

  if (isLoading) return <LoadingSpinner />;

  if (!announcement) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Announcement not found</h3>
        <Link to="/" className="text-aws-orange hover:text-aws-orange-hover text-sm font-medium">
          Back to feed
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input = {
      title: formData.title,
      service: formData.service as AwsService,
      date: toISODateTime(formData.date),
      summary: formData.summary,
      ...(formData.link ? { link: formData.link } : {}),
    };

    const result = UpdateAnnouncementInputSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await updateAnnouncement.mutateAsync({ id: announcement.id, data: result.data });
      navigate(`/announcements/${announcement.id}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update announcement' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Back link */}
      <Link
        to={`/announcements/${announcement.id}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-aws-orange transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to announcement
      </Link>

      <div className="bg-surface rounded-xl border border-border p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6 font-[family-name:var(--font-display)]">
          Edit Announcement
        </h1>

        {errors.submit && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.title ? 'border-error' : 'border-border'
              }`}
              maxLength={200}
            />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title}</p>}
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              AWS Service <span className="text-error">*</span>
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value as AwsService }))}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.service ? 'border-error' : 'border-border'
              }`}
            >
              <option value="">Select a service...</option>
              {AWS_SERVICES.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            {errors.service && <p className="mt-1 text-xs text-error">{errors.service}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.date ? 'border-error' : 'border-border'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-error">{errors.date}</p>}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Summary <span className="text-error">*</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={5}
              maxLength={2000}
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all resize-none ${
                errors.summary ? 'border-error' : 'border-border'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.summary && <p className="text-xs text-error">{errors.summary}</p>}
              <p className="text-xs text-text-muted ml-auto font-[family-name:var(--font-mono)]">
                {formData.summary.length}/2000
              </p>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Link <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://aws.amazon.com/..."
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.link ? 'border-error' : 'border-border'
              }`}
            />
            {errors.link && <p className="mt-1 text-xs text-error">{errors.link}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={updateAnnouncement.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-aws-orange text-white rounded-lg text-sm font-medium hover:bg-aws-orange-hover transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              {updateAnnouncement.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to={`/announcements/${announcement.id}`}
              className="px-6 py-3 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
