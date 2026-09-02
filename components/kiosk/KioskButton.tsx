'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'default' | 'large' | 'huge';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const KioskButton: React.FC<KioskButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  icon,
  iconPosition = 'right',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all select-none rounded-2xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-4';

  const sizeStyles = {
    default: 'h-16 px-8 text-xl min-w-[200px]',
    large: 'h-20 px-10 text-2xl min-w-[260px]',
    huge: 'h-24 px-12 text-2xl min-w-[320px] font-extrabold shadow-kiosk-elevated',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-kiosk-blue to-kiosk-blue-dark text-white shadow-kiosk-button hover:brightness-110 focus:ring-sky-300 border border-sky-400/40',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-kiosk-navy border-2 border-slate-300 focus:ring-slate-300',
    success:
      'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-600/30 hover:brightness-110 focus:ring-emerald-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 focus:ring-rose-300',
    outline:
      'bg-white hover:bg-slate-50 text-kiosk-navy border-2 border-slate-300 hover:border-kiosk-blue focus:ring-sky-200',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-3">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="ml-3">{icon}</span>}
        </>
      )}
    </button>
  );
};
