import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  title,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-bg-surface rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base mb-1">
                Delete Announcement
              </h3>
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete{" "}
                <span className="font-medium text-text-primary">"{title}"</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
