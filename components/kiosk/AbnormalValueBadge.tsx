'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AbnormalValueBadgeProps {
  label?: string;
  isAbnormal?: boolean;
  className?: string;
}

export const AbnormalValueBadge: React.FC<AbnormalValueBadgeProps> = ({
  label,
  isAbnormal,
  className = '',
}) => {
  const { t } = useLanguage();
  if (isAbnormal === false) return null;
  const text = label || t.documents.abnormalHighlight;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-sm ${className}`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
      <span>{text}</span>
    </span>
  );
};
