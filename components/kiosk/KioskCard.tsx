'use client';

import React from 'react';

interface KioskCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const KioskCard: React.FC<KioskCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  badge,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  children,
}) => {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={(e) => {
        if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative p-8 rounded-3xl transition-all select-none ${
        disabled
          ? 'opacity-60 bg-slate-100/80 border-2 border-slate-200 cursor-not-allowed'
          : onClick
          ? 'cursor-pointer active:scale-[0.98] hover:shadow-kiosk-elevated'
          : ''
      } ${
        selected
          ? 'bg-gradient-to-b from-sky-50 to-white border-4 border-kiosk-blue shadow-kiosk-card ring-4 ring-sky-100'
          : 'bg-white border-2 border-slate-200 shadow-kiosk-card hover:border-slate-300'
      } ${className}`}
    >
      {badge && (
        <div className="absolute top-6 right-6 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          {badge}
        </div>
      )}

      <div className="flex items-start gap-6">
        {icon && (
          <div
            className={`p-4 rounded-2xl flex-shrink-0 flex items-center justify-center transition ${
              selected
                ? 'bg-kiosk-blue text-white shadow-md shadow-sky-500/30'
                : 'bg-slate-100 text-kiosk-navy'
            }`}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-kiosk-navy mb-1.5 tracking-tight">{title}</h3>
          {subtitle && <p className="text-lg font-semibold text-kiosk-blue mb-2">{subtitle}</p>}
          {description && <p className="text-base text-slate-600 leading-relaxed">{description}</p>}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
};
