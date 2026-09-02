'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export const LanguageBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, availableLanguages } = useLanguage();
  const router = useRouter();

  const current = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <button
      onClick={() => router.push('/kiosk/language')}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-kiosk-navy rounded-full border border-slate-200 shadow-sm transition active:scale-95 ${className}`}
      title="Change Language"
    >
      <Globe className="w-5 h-5 text-kiosk-blue" />
      <span className="text-base font-bold">{current.nativeName}</span>
      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
        {current.code.toUpperCase()}
      </span>
    </button>
  );
};
