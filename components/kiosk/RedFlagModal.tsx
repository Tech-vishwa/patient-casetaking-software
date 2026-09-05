'use client';

import React from 'react';
import { AlertOctagon, Phone, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { RedFlagAlert } from '@/types/clinical';
import { KioskButton } from './KioskButton';

interface RedFlagModalProps {
  alert: RedFlagAlert | null;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({ alert, onDismiss, onAcknowledge }) => {
  const { t } = useLanguage();
  const handleClose = onAcknowledge || onDismiss || (() => {});

  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-xl w-full shadow-2xl border-4 border-rose-500 space-y-6">
        {/* Top Emergency Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 animate-bounce">
            <AlertOctagon className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white">
              Emergency Safety Alert
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">
              {t.redFlags.alertTitle}
            </h2>
          </div>
        </div>

        {/* Notice Message */}
        <div className="p-5 bg-rose-50 rounded-2xl border-2 border-rose-200 text-slate-800 space-y-3">
          <p className="text-lg font-bold text-rose-950 leading-relaxed">
            {t.redFlags.alertNotice}
          </p>
          <p className="text-base font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{t.redFlags.alertCallStaff}</span>
          </p>
        </div>

        {/* Staff Emergency Desk Phone Box */}
        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-7 h-7 text-kiosk-blue" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Immediate Assistance:</p>
              <p className="text-lg font-extrabold text-kiosk-navy">{t.redFlags.staffDeskExt}</p>
            </div>
          </div>
          <span className="text-xs font-black bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
            High Priority
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium text-center">
          Note: MediKiosk does not provide medical diagnoses. All clinical evaluations are made by hospital physicians.
        </p>

        {/* Dismiss Button */}
        <div className="pt-2">
          <KioskButton
            size="large"
            variant="outline"
            onClick={handleClose}
            className="w-full text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            {t.redFlags.dismissAndContinue}
          </KioskButton>
        </div>
      </div>
    </div>
  );
};
