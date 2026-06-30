interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-bark-100 flex items-center justify-center mb-4 text-bark-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-bark-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-bark-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
      <div className="w-8 h-8 border-2 border-canopy-200 border-t-canopy-600 rounded-full animate-spin" />
      <p className="text-sm text-bark-500">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-bark-200 p-4 animate-pulse">
      <div className="h-4 bg-bark-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-bark-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-bark-100 rounded w-2/3" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="w-4 h-4 bg-bark-200 rounded" />
          <div className="h-4 bg-bark-200 rounded flex-1 max-w-md" />
          <div className="h-4 bg-bark-100 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
