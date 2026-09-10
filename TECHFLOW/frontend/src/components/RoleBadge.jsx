import React from 'react';
import { ROLE_CONFIGS } from '../dashboards/roleConfig';

export default function RoleBadge({ role, size = 'md' }) {
  const config = ROLE_CONFIGS[role];
  const label = config?.title || role;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3 py-1 font-medium' 
      : 'text-xs px-2.5 py-0.5 font-medium';

  return (
    <span
      className={`inline-block rounded border border-gray-300 bg-gray-100 text-gray-800 ${sizeClasses}`}
    >
      {label}
    </span>
  );
}

