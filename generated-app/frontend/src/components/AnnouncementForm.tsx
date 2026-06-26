import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Announcement, AwsService } from "@aws-news-hub/shared";
import { CreateAnnouncementInputSchema } from "@aws-news-hub/shared";
import { ALL_SERVICES } from "../utils/constants";

interface AnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    summary: string;
    service: AwsService;
    date: string;
    url?: string;
  }) => void;
  initialData?: Announcement | null;
  isLoading?: boolean;
}

export function AnnouncementForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [service, setService] = useState<AwsService>("Lambda");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSummary(initialData.summary);
      setService(initialData.service);
      setDate(initialData.date.slice(0, 10));
      setUrl(initialData.url || "");
    } else {
      setTitle("");
      setSummary("");
      setService("Lambda");
      setDate(new Date().toISOString().slice(0, 10));
      setUrl("");
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dateStr = `${date}T00:00:00.000Z`;
    const input = {
      title,
      summary,
      service,
      date: dateStr,
      url: url || undefined,
    };

    const result = CreateAnnouncementInputSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-display font-semibold text-lg">
            {initialData ? "Edit Announcement" : "New Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AWS Lambda now supports..."
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.title ? "border-error" : "border-border"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-error mt-1">{errors.title}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Summary <span className="text-error">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the announcement..."
              rows={4}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all resize-none ${
                errors.summary ? "border-error" : "border-border"
              }`}
            />
            {errors.summary && (
              <p className="text-xs text-error mt-1">{errors.summary}</p>
            )}
          </div>

          {/* Service & Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Service <span className="text-error">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as AwsService)}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange bg-bg-surface transition-all"
              >
                {ALL_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                  errors.date ? "border-error" : "border-border"
                }`}
              />
              {errors.date && (
                <p className="text-xs text-error mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              External URL <span className="text-text-secondary">(optional)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://aws.amazon.com/about-aws/whats-new/..."
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all ${
                errors.url ? "border-error" : "border-border"
              }`}
            />
            {errors.url && (
              <p className="text-xs text-error mt-1">{errors.url}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-aws-orange text-white text-sm font-medium rounded-lg hover:bg-aws-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-aws-orange/20"
            >
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update Announcement"
                : "Create Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
