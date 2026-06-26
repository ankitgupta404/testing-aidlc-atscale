import type { AwsService } from "@aws-news-hub/shared";
import { SERVICE_COLORS } from "../utils/constants";

interface ServiceBadgeProps {
  service: AwsService;
  size?: "sm" | "md" | "lg";
}

export function ServiceBadge({ service, size = "sm" }: ServiceBadgeProps) {
  const color = SERVICE_COLORS[service] || "#5F6B7A";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md font-mono tracking-tight ${sizeClasses[size]}`}
      style={{
        color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}30`,
      }}
    >
      {service}
    </span>
  );
}
