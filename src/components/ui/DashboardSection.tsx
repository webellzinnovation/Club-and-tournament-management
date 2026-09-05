import React from 'react';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  tabs?: TabOption[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  actionText,
  onAction,
  actionIcon,
  children,
  className = ''
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header with Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          {tabs && tabs.length > 0 && onTabChange && (
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-slate-100 text-slate-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Link / Button */}
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors hover:underline"
            >
              <span>{actionText}</span>
              {actionIcon}
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div>{children}</div>
    </section>
  );
};
