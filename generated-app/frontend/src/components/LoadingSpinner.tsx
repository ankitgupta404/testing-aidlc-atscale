export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-3 border-[#E5E9F0]" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-3 border-transparent border-t-[#FF9900] animate-spin" />
      </div>
    </div>
  );
}
