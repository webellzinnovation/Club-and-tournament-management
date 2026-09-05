import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const getStyle = (val: string) => {
    const s = val.toUpperCase().replace(/\s+/g, '_');
    switch (s) {
      case 'ACTIVE':
      case 'LIVE':
      case 'IN_PROGRESS':
      case 'OPEN':
      case 'REGISTERED':
      case 'ONGOING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/70 ring-emerald-500/10';
      case 'COMPLETED':
      case 'VERIFIED':
      case 'PAID':
      case 'FINISHED':
        return 'bg-blue-50 text-blue-700 border-blue-200/70 ring-blue-500/10';
      case 'PENDING':
      case 'REGISTRATION':
      case 'AWAITING_VERIFICATION':
      case 'UPCOMING':
      case 'SCHEDULED':
      case 'CALLED':
        return 'bg-amber-50 text-amber-700 border-amber-200/70 ring-amber-500/10';
      case 'CANCELLED':
      case 'REJECTED':
      case 'OVERDUE':
      case 'CONFLICT':
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200/70 ring-rose-500/10';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/70 ring-slate-500/10';
    }
  };

  const formatText = (val: string) => {
    return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const isLive = status.toUpperCase() === 'LIVE' || status.toUpperCase() === 'IN_PROGRESS';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border ring-1 rounded-full whitespace-nowrap ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${getStyle(status)} ${className}`}
    >
      {isLive && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      <span>{formatText(status)}</span>
    </span>
  );
};
