'use client';

import React from 'react';
import { ClinicalStage } from '@/types/clinical';
import { useLanguage } from '@/context/LanguageContext';

interface ConversationProgressProps {
  currentStage: ClinicalStage;
}

const STAGES: Array<{ key: ClinicalStage; labelKey: string }> = [
  { key: 'chief_complaint', labelKey: 'stageChiefComplaint' },
  { key: 'hpi', labelKey: 'stageHpi' },
  { key: 'past_medical_history', labelKey: 'stagePmh' },
  { key: 'surgical_history', labelKey: 'stageSurgeries' },
  { key: 'medications', labelKey: 'stageMeds' },
  { key: 'allergies', labelKey: 'stageAllergies' },
  { key: 'family_history', labelKey: 'stageFamily' },
  { key: 'personal_history', labelKey: 'stagePersonal' },
];

export const ConversationProgress: React.FC<ConversationProgressProps> = ({ currentStage }) => {
  const { t } = useLanguage();

  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;
  const progressPercent = Math.round(((activeIndex + 1) / STAGES.length) * 100);

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-kiosk-blue text-white">
            Stage {activeIndex + 1} of {STAGES.length}
          </span>
          <span className="text-sm font-bold text-kiosk-navy">
            {(t.conversation as any)[STAGES[activeIndex].labelKey] || STAGES[activeIndex].labelKey}
          </span>
        </div>

        <span className="text-sm font-black text-kiosk-blue">{progressPercent}% Completed</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
        {STAGES.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={s.key}
              className={`flex-1 h-full border-r border-white/40 transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500'
                  : isCurrent
                  ? 'bg-kiosk-blue animate-pulse'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
