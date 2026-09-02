'use client';

import React from 'react';

interface KioskInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const KioskInput: React.FC<KioskInputProps> = ({
  label,
  error,
  helperText,
  icon,
  rightAction,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || 'kiosk-input-' + label.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xl font-bold text-kiosk-navy mb-2.5 flex items-center justify-between"
      >
        <span>{label}</span>
        {props.required && <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">* Required</span>}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-5 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full h-16 rounded-2xl text-xl font-medium text-kiosk-navy bg-white border-2 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
            icon ? 'pl-14' : 'pl-6'
          } ${rightAction ? 'pr-20' : 'pr-6'} ${
            error
              ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-200'
              : 'border-slate-300 focus:border-kiosk-blue focus:ring-sky-100 hover:border-slate-400'
          } ${className}`}
          {...props}
        />

        {rightAction && (
          <div className="absolute right-3">{rightAction}</div>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-base font-semibold text-rose-600 flex items-center gap-1.5">
          <span>⚠️</span> {error}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-sm text-slate-500 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
};
