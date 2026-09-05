'use client';

import React from 'react';
import { ClinicalStage } from '@/types/clinical';
import { ConsultationMode } from '@/types/intakeSession';
import { useLanguage } from '@/context/LanguageContext';

interface ConversationProgressProps {
  currentStage: ClinicalStage;
  consultationMode?: ConsultationMode;
}

const MODERN_STAGES: Array<{ key: ClinicalStage; labelKey: string }> = [
  { key: 'chief_complaint', labelKey: 'stageChiefComplaint' },
  { key: 'hpi', labelKey: 'stageHpi' },
  { key: 'past_medical_history', labelKey: 'stagePmh' },
  { key: 'surgical_history', labelKey: 'stageSurgeries' },
  { key: 'medications', labelKey: 'stageMeds' },
  { key: 'allergies', labelKey: 'stageAllergies' },
  { key: 'family_history', labelKey: 'stageFamily' },
  { key: 'personal_history', labelKey: 'stagePersonal' },
];

const AYUSH_STAGES: Array<{ key: ClinicalStage; label: Record<string, string> }> = [
  { key: 'presenting_complaint', label: { en: '1. Presenting Complaint', ta: '1. முக்கிய பிரச்சனை', hi: '1. मुख्य समस्या' } },
  { key: 'prakriti', label: { en: '2. Prakriti (Constitution)', ta: '2. பிரகிருதி (இயற்கை தன்மை)', hi: '2. प्रकृति (शारीरिक गठन)' } },
  { key: 'vikriti', label: { en: '3. Vikriti (Current State)', ta: '3. விக்ருதி (தற்போதைய நிலை)', hi: '3. विकृति (वर्तमान स्थिति)' } },
  { key: 'ahara', label: { en: '4. Ahara (Dietary Intake)', ta: '4. ஆகாரம் (உணவு முறை)', hi: '4. आहार (खान-पान)' } },
  { key: 'vihara', label: { en: '5. Vihara (Lifestyle Routine)', ta: '5. விஹாரம் (வாழ்க்கை முறை)', hi: '5. विहार (दिनचर्या)' } },
  { key: 'dashavidha_pariksha', label: { en: '6. Dashavidha Pariksha (10 Parameters)', ta: '6. தசவித பரிட்சை (10 அளவுகள்)', hi: '6. दशविध परीक्षा' } },
];

export const ConversationProgress: React.FC<ConversationProgressProps> = ({
  currentStage,
  consultationMode = 'MODERN_MEDICINE',
}) => {
  const { t, language } = useLanguage();
  const isAyush = consultationMode === 'AYUSH';
  const stages = isAyush ? AYUSH_STAGES : MODERN_STAGES;

  const currentIndex = stages.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;
  const progressPercent = Math.round(((activeIndex + 1) / stages.length) * 100);

  const getStageTitle = () => {
    if (isAyush) {
      const ayushStage = AYUSH_STAGES[activeIndex];
      return ayushStage.label[language] || ayushStage.label.en;
    }
    const modernStage = MODERN_STAGES[activeIndex];
    return (t.conversation as any)[modernStage.labelKey] || modernStage.labelKey;
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md text-white ${
              isAyush ? 'bg-emerald-600' : 'bg-kiosk-blue'
            }`}
          >
            {isAyush ? '🪷 AYUSH' : '🏥 Allopathic'} Stage {activeIndex + 1} of {stages.length}
          </span>
          <span className="text-sm font-bold text-kiosk-navy">{getStageTitle()}</span>
        </div>

        <span className={`text-sm font-black ${isAyush ? 'text-emerald-700' : 'text-kiosk-blue'}`}>
          {progressPercent}% Completed
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
        {stages.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={s.key}
              className={`flex-1 h-full border-r border-white/40 transition-all duration-300 ${
                isDone
                  ? isAyush
                    ? 'bg-emerald-500'
                    : 'bg-emerald-500'
                  : isCurrent
                  ? isAyush
                    ? 'bg-emerald-600 animate-pulse'
                    : 'bg-kiosk-blue animate-pulse'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
