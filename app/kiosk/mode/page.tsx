'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { ConsultationMode } from '@/types/intakeSession';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { CheckCircle2, Stethoscope, Sparkles } from 'lucide-react';

export default function ConsultationModeSelectionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { consultationMode, setConsultationMode, patient, consent } = usePatientSession();
  const [selectedMode, setSelectedMode] = useState<ConsultationMode | null>(consultationMode || null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);

  const handleSelectMode = async (mode: ConsultationMode) => {
    setSelectedMode(mode);
    setIsAdvancing(true);

    try {
      await setConsultationMode(mode);
    } catch (e) {
      console.error('Failed to save consultation mode', e);
    }

    // Auto-advance after 600ms without requiring a separate "Next" button
    setTimeout(() => {
      if (patient && consent) {
        router.push('/kiosk/conversation');
      } else if (patient) {
        router.push('/kiosk/consent');
      } else {
        router.push('/kiosk/identification');
      }
    }, 600);
  };

  const narration = `${t.consultationMode.title}. ${t.consultationMode.subtitle}`;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 sm:py-8 space-y-6">
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs sm:text-sm font-black uppercase tracking-wider">
          <span>{t.consultationMode.title}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-kiosk-navy tracking-tight">
          {t.consultationMode.title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
          {t.consultationMode.subtitle}
        </p>

        <div className="flex justify-center pt-2">
          <AudioPromptButton textToSpeak={narration} />
        </div>
      </div>

      {/* Two Large Accessible Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 my-auto">
        {/* CARD 1: Modern Medicine */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isAdvancing && handleSelectMode('MODERN_MEDICINE')}
          onKeyDown={(e) => {
            if (!isAdvancing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleSelectMode('MODERN_MEDICINE');
            }
          }}
          className={`relative p-8 rounded-3xl transition-all duration-300 select-none cursor-pointer text-left flex flex-col justify-between border-4 ${
            selectedMode === 'MODERN_MEDICINE'
              ? 'bg-gradient-to-b from-sky-50 to-white border-kiosk-blue shadow-2xl ring-4 ring-sky-200 scale-[1.02]'
              : 'bg-white border-slate-200 shadow-kiosk-card hover:border-sky-300 hover:shadow-xl'
          }`}
        >
          {selectedMode === 'MODERN_MEDICINE' && (
            <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-kiosk-blue text-white text-xs font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.consultationMode.selectedBadge}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center text-4xl shadow-inner">
              🏥
            </div>

            <div>
              <span className="text-xs font-black tracking-wider uppercase text-sky-600">Allopathic / General OPD</span>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy tracking-tight mt-1">
                {t.consultationMode.modernMedicineTitle}
              </h2>
              <p className="text-base sm:text-lg font-bold text-kiosk-blue mt-1">
                {t.consultationMode.modernMedicineSubtitle}
              </p>
            </div>

            <p className="text-base text-slate-600 font-medium leading-relaxed">
              {t.consultationMode.modernMedicineDesc}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <div
              className={`w-full py-4 px-6 rounded-2xl text-center font-black text-lg transition flex items-center justify-center gap-2 ${
                selectedMode === 'MODERN_MEDICINE'
                  ? 'bg-kiosk-blue text-white shadow-lg shadow-sky-500/30 animate-pulse'
                  : 'bg-slate-100 text-kiosk-navy hover:bg-sky-500 hover:text-white'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>{t.consultationMode.modernMedicineBtn}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: AYUSH / Ayurveda */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isAdvancing && handleSelectMode('AYUSH')}
          onKeyDown={(e) => {
            if (!isAdvancing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleSelectMode('AYUSH');
            }
          }}
          className={`relative p-8 rounded-3xl transition-all duration-300 select-none cursor-pointer text-left flex flex-col justify-between border-4 ${
            selectedMode === 'AYUSH'
              ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-600 shadow-2xl ring-4 ring-emerald-200 scale-[1.02]'
              : 'bg-white border-slate-200 shadow-kiosk-card hover:border-emerald-300 hover:shadow-xl'
          }`}
        >
          {selectedMode === 'AYUSH' && (
            <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.consultationMode.selectedBadge}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-4xl shadow-inner">
              🪷
            </div>

            <div>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-700">Ministry of Ayush OPD</span>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy tracking-tight mt-1">
                {t.consultationMode.ayushTitle}
              </h2>
              <p className="text-base sm:text-lg font-bold text-emerald-700 mt-1">
                {t.consultationMode.ayushSubtitle}
              </p>
            </div>

            <p className="text-base text-slate-600 font-medium leading-relaxed">
              {t.consultationMode.ayushDesc}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <div
              className={`w-full py-4 px-6 rounded-2xl text-center font-black text-lg transition flex items-center justify-center gap-2 ${
                selectedMode === 'AYUSH'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-100 text-kiosk-navy hover:bg-emerald-600 hover:text-white'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.consultationMode.ayushBtn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer helper */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">
          💡 Touch any card to select your consultation type. The kiosk will proceed automatically.
        </p>
      </div>
    </div>
  );
}
