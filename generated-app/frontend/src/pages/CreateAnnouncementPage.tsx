import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateAnnouncement } from '../hooks/useAnnouncements';
import { AWS_SERVICES } from '../utils/constants';
import { toISODateTime } from '../utils/formatDate';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import type { AwsService } from '@aws-news-hub/shared';
import { CreateAnnouncementInputSchema } from '@aws-news-hub/shared';

export default function CreateAnnouncementPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAnnouncement();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [service, setService] = useState<AwsService>('Lambda');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input = {
      title: title.trim(),
      summary: summary.trim(),
      service,
      date: toISODateTime(date),
      link: link.trim() || undefined,
    };

    const validation = CreateAnnouncementInputSchema.safeParse(input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createMutation.mutateAsync(input);
      navigate('/');
    } catch {
      setErrors({ form: 'Failed to create announcement. Please try again.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-[#5E81AC] hover:text-[#4C6A94] transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to feed
      </Link>

      <div className="bg-white rounded-xl border border-[#E5E9F0] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#2E3440] font-['Crimson_Pro'] mb-6">
          Add New Announcement
        </h1>

        {errors.form && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#2E3440] mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AWS Lambda adds support for Python 3.13"
              maxLength={200}
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-[#E5E9F0] bg-white'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Service + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2E3440] mb-1.5">
                Service <span className="text-red-500">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as AwsService)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E9F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#88C0D0] transition-all duration-200"
              >
                {AWS_SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E3440] mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] ${
                  errors.date ? 'border-red-300 bg-red-50' : 'border-[#E5E9F0] bg-white'
                }`}
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-[#2E3440] mb-1.5">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the announcement..."
              rows={5}
              maxLength={2000}
              className={`w-full px-4 py-3 rounded-lg border text-sm resize-y transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] ${
                errors.summary ? 'border-red-300 bg-red-50' : 'border-[#E5E9F0] bg-white'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.summary && <p className="text-xs text-red-600">{errors.summary}</p>}
              <p className="text-xs text-[#9FA8B7] font-['JetBrains_Mono'] ml-auto">
                {summary.length}/2000
              </p>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-[#2E3440] mb-1.5">
              Link <span className="text-[#9FA8B7]">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://aws.amazon.com/..."
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#88C0D0] ${
                errors.link ? 'border-red-300 bg-red-50' : 'border-[#E5E9F0] bg-white'
              }`}
            />
            {errors.link && <p className="text-xs text-red-600 mt-1">{errors.link}</p>}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF9900] text-[#232F3E] rounded-lg text-sm font-semibold hover:bg-[#EC8D00] transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              <Send className="w-4 h-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 text-sm font-medium text-[#4C566A] hover:text-[#2E3440] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
