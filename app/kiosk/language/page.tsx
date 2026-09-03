'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { PatientService } from '@/services/patientService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { KioskProgress } from '@/components/kiosk/KioskProgress';
import { Check, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { PreferredLanguage } from '@/types/patient';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { patient, setPatient } = usePatientSession();
  const [selectedLang, setSelectedLang] = useState<PreferredLanguage | null>(null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);

  const narrationText = `${t.language.selectTitle}. ${t.language.selectSubtitle}.`;

  const handleSelectLanguage = async (code: PreferredLanguage) => {
    setSelectedLang(code);
    setLanguage(code);
    setIsAdvancing(true);

    if (patient) {
      try {
        await PatientService.updateLanguage(patient.id, code);
        setPatient({ ...patient, preferred_language: code });
      } catch (err) {
        console.warn('Language update error:', err);
      }
    }

    // Automatic step transition after brief visual confirmation (600ms)
    setTimeout(() => {
      if (patient) {
        router.push('/kiosk/consent');
      } else {
        router.push('/kiosk/identification');
      }
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      {/* Step Indicator */}
      <KioskProgress currentStep={1} />

      {/* Header with Audio Narration */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight mb-2">
            {t.language.selectTitle}
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            {t.language.selectSubtitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Visual Transition Feedback Banner */}
      {isAdvancing && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Language selected! Proceeding to patient identification...</span>
        </div>
      )}

      {/* Language Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {availableLanguages.map((lang) => {
          const isSelected = selectedLang ? selectedLang === lang.code : language === lang.code;

          return (
            <div
              key={lang.code}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectLanguage(lang.code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectLanguage(lang.code);
                }
              }}
              className={`relative p-8 rounded-3xl cursor-pointer transition-all active:scale-[0.98] select-none flex flex-col items-center text-center justify-between min-h-[220px] ${
                isSelected
                  ? 'bg-gradient-to-b from-sky-50 to-white border-4 border-kiosk-blue shadow-kiosk-card ring-4 ring-sky-100 scale-105'
                  : 'bg-white border-2 border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-kiosk-blue text-white flex items-center justify-center shadow-md">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              )}

              <div className="text-5xl my-2">{lang.flag}</div>

              <div>
                <h3 className="text-3xl font-black text-kiosk-navy mb-1">{lang.nativeName}</h3>
                <p className="text-lg font-semibold text-slate-500">{lang.name}</p>
              </div>

              <div
                className={`mt-4 px-4 py-1.5 rounded-full text-sm font-bold ${
                  isSelected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isSelected ? '✓ Selected • Proceeding...' : 'Tap to Select'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extensible note */}
      <div className="bg-sky-50/80 border border-sky-200 p-4 rounded-2xl flex items-center gap-3 text-slate-600 text-sm font-medium">
        <Sparkles className="w-5 h-5 text-kiosk-blue flex-shrink-0" />
        <span>{t.language.moreLanguagesNote}</span>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => router.push('/')}
          icon={<ArrowLeft className="w-6 h-6" />}
          iconPosition="left"
        >
          {t.common.back}
        </KioskButton>

        <p className="text-xs font-semibold text-slate-400">
          Tap any language card to automatically advance.
        </p>
      </div>
    </div>
  );
}
