export function LoadingState() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bg-surface rounded-xl border border-border p-6 animate-fade-in"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="skeleton h-5 w-20 rounded-md" />
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="skeleton h-5 w-3/4 mb-2" />
          <div className="skeleton h-4 w-full mb-1" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
