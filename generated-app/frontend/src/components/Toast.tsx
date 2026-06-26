import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { Toast as ToastType } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-success" />,
    error: <XCircle className="w-4 h-4 text-error" />,
    info: <Info className="w-4 h-4 text-aws-orange" />,
  };

  const bgColors = {
    success: "bg-success/5 border-success/20",
    error: "bg-error/5 border-error/20",
    info: "bg-aws-orange/5 border-aws-orange/20",
  };

  return (
    <div
      className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[toast.type]} bg-bg-surface shadow-xl shadow-aws-navy/10 min-w-[280px] max-w-[380px]`}
    >
      {icons[toast.type]}
      <p className="text-sm text-text-primary flex-1">{toast.message}</p>
      <button
        onClick={onRemove}
        className="p-0.5 text-text-secondary hover:text-text-primary transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
