import { Filter, X } from "lucide-react";
import type { AwsService } from "@aws-news-hub/shared";
import { ALL_SERVICES, SERVICE_COLORS } from "../utils/constants";

interface ServiceFilterProps {
  selectedService: string | undefined;
  onServiceChange: (service: string | undefined) => void;
}

export function ServiceFilter({ selectedService, onServiceChange }: ServiceFilterProps) {
  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="bg-bg-surface rounded-xl border border-border p-5 animate-slide-in-left">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-aws-orange" />
            Filter by Service
          </h3>
          {selectedService && (
            <button
              onClick={() => onServiceChange(undefined)}
              className="text-xs text-text-secondary hover:text-error flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {ALL_SERVICES.map((service) => {
            const isSelected = selectedService === service;
            const color = SERVICE_COLORS[service as AwsService];
            return (
              <button
                key={service}
                onClick={() => onServiceChange(isSelected ? undefined : service)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                  isSelected
                    ? "bg-aws-navy text-white font-medium"
                    : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{service}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// Mobile filter as a dropdown
interface MobileServiceFilterProps {
  selectedService: string | undefined;
  onServiceChange: (service: string | undefined) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileServiceFilter({
  selectedService,
  onServiceChange,
  isOpen,
  onClose,
}: MobileServiceFilterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-bg-surface rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">Filter by Service</h3>
          <button onClick={onClose} className="p-1 hover:bg-bg-primary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        {selectedService && (
          <button
            onClick={() => {
              onServiceChange(undefined);
              onClose();
            }}
            className="mb-3 text-sm text-error hover:underline"
          >
            Clear filter
          </button>
        )}
        <div className="grid grid-cols-2 gap-2">
          {ALL_SERVICES.map((service) => {
            const isSelected = selectedService === service;
            const color = SERVICE_COLORS[service as AwsService];
            return (
              <button
                key={service}
                onClick={() => {
                  onServiceChange(isSelected ? undefined : service);
                  onClose();
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isSelected
                    ? "bg-aws-navy text-white font-medium"
                    : "bg-bg-primary text-text-secondary hover:text-text-primary"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{service}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
