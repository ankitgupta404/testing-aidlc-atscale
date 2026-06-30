import { useIsFetching } from '@tanstack/react-query';

export function LoadingBar() {
  const isFetching = useIsFetching();

  if (!isFetching) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
      <div className="h-full bg-canopy-500 animate-loading-bar rounded-r-full" />
    </div>
  );
}
