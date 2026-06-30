import type { AwsService } from '@aws-news-hub/shared';
import { AWS_SERVICES } from '../utils/constants';

interface FilterBarProps {
  selectedService: string | undefined;
  onServiceChange: (service: string | undefined) => void;
}

export default function FilterBar({ selectedService, onServiceChange }: FilterBarProps) {
  return (
    <div className="animate-fade-in-up stagger-1">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onServiceChange(undefined)}
          className={`filter-chip flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !selectedService
              ? 'bg-aws-navy text-white shadow-md'
              : 'bg-white text-text-secondary border border-border hover:border-aws-orange hover:text-aws-orange'
          }`}
        >
          All
        </button>
        {AWS_SERVICES.map((service: AwsService) => (
          <button
            key={service}
            onClick={() => onServiceChange(service === selectedService ? undefined : service)}
            className={`filter-chip flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedService === service
                ? 'bg-aws-orange text-white shadow-md'
                : 'bg-white text-text-secondary border border-border hover:border-aws-orange hover:text-aws-orange'
            }`}
          >
            {service}
          </button>
        ))}
      </div>
    </div>
  );
}
