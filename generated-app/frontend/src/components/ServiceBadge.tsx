import type { AwsService } from '@aws-news-hub/shared';
import { SERVICE_BADGE_COLORS } from '../utils/constants';

interface ServiceBadgeProps {
  service: AwsService;
  size?: 'sm' | 'md';
}

export default function ServiceBadge({ service, size = 'sm' }: ServiceBadgeProps) {
  const colors = SERVICE_BADGE_COLORS[service] || SERVICE_BADGE_COLORS['Other'];
  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md font-['JetBrains_Mono'] tracking-tight ${colors.bg} ${colors.text} ${sizeClasses} transition-transform hover:scale-105`}
    >
      {service}
    </span>
  );
}
