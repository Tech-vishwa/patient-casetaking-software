'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Bell, Eye, Type, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { LanguageBadge } from './LanguageBadge';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const KioskHeader: React.FC = () => {
  const { t } = useLanguage();
  const { toggleHighContrast, highContrast, cycleTextScale, textScale } = useAccessibility();
  const { resetKioskSession, patient } = usePatientSession();
  const router = useRouter();
  const pathname = usePathname();

  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleHomeReset = () => {
    if (confirm('Are you sure you want to end this kiosk session and return to the main screen?')) {
      resetKioskSession();
      router.push('/kiosk/welcome');
    }
  };

  const isWelcome = pathname === '/kiosk/welcome';

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-slate-200 py-4 px-6 sm:px-10 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Hospital Branding */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => !isWelcome && router.push('/kiosk/welcome')}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-kiosk-blue to-kiosk-navy flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-kiosk-navy tracking-tight">{t.common.appName}</h1>
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Segments 1-4
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500">{t.common.hospitalName}</p>
          </div>
        </div>

        {/* Right Accessibility & Action Bar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/doctor/queue"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
            title="Doctor & Staff Review Portal"
          >
            <span>Doctor Desk ↗</span>
          </Link>
          {/* Live Clock */}
          <div className="hidden md:flex flex-col text-right pr-2">
            <span className="text-xl font-black text-kiosk-navy">{time}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Kiosk Online
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          {/* Language Selector */}
          <LanguageBadge />

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`p-3 rounded-full border transition active:scale-95 flex items-center justify-center ${
              highContrast
                ? 'bg-kiosk-navy text-yellow-300 border-kiosk-navy shadow-md'
                : 'bg-white text-slate-600 hover:text-kiosk-navy border-slate-200 hover:bg-slate-50'
            }`}
            title={t.common.highContrast}
            aria-label={t.common.highContrast}
          >
            <Eye className="w-6 h-6" />
          </button>

          {/* Font Scaler */}
          <button
            onClick={cycleTextScale}
            className={`px-3.5 py-2.5 rounded-full border font-bold text-sm transition active:scale-95 flex items-center gap-1 ${
              textScale !== 'normal'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={t.common.textScale}
          >
            <Type className="w-5 h-5" />
            <span>{textScale === 'normal' ? '1x' : textScale === 'large' ? '1.25x' : '1.5x'}</span>
          </button>

          {/* Return Home / Reset Session Button if in mid-flow */}
          {!isWelcome && (
            <button
              onClick={handleHomeReset}
              className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full transition active:scale-95 flex items-center justify-center"
              title="Reset & Return to Start"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
