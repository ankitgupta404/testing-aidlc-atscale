import { AWS_SERVICES } from '../utils/constants';
import type { AwsService } from '@aws-news-hub/shared';

interface FilterBarProps {
  selectedService: string | undefined;
  onServiceChange: (service: string | undefined) => void;
}

export default function FilterBar({ selectedService, onServiceChange }: FilterBarProps) {
  return (
    <div className="animate-fade-in-up stagger-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => onServiceChange(undefined)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            !selectedService
              ? 'bg-[#FF9900] text-[#232F3E] shadow-sm'
              : 'bg-white text-[#4C566A] border border-[#E5E9F0] hover:border-[#88C0D0] hover:text-[#2E3440]'
          }`}
        >
          All
        </button>
        {AWS_SERVICES.map((service: AwsService) => (
          <button
            key={service}
            onClick={() => onServiceChange(service === selectedService ? undefined : service)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              selectedService === service
                ? 'bg-[#FF9900] text-[#232F3E] shadow-sm'
                : 'bg-white text-[#4C566A] border border-[#E5E9F0] hover:border-[#88C0D0] hover:text-[#2E3440]'
            }`}
          >
            {service}
          </button>
        ))}
      </div>
    </div>
  );
}
