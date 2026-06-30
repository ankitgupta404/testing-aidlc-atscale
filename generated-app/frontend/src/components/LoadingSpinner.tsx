export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-border rounded-full"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-aws-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-text-muted font-[family-name:var(--font-mono)]">
        Loading announcements...
      </p>
    </div>
  );
}
