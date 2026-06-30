import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative animate-fade-in-up stagger-2">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-[#81A1C1]" />
      </div>
      <input
        type="text"
        placeholder="Search announcements..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-10 py-3 bg-white border border-[#E5E9F0] rounded-xl text-sm text-[#2E3440] placeholder-[#9FA8B7] focus:outline-none focus:ring-2 focus:ring-[#88C0D0] focus:border-transparent transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#4C566A] hover:text-[#2E3440] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
