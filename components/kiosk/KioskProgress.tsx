'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface KioskProgressProps {
  currentStep: number; // 1 to 5
  totalSteps?: number;
}

const STEPS = [
  { step: 1, label: 'Language' },
  { step: 2, label: 'Identity' },
  { step: 3, label: 'Consent' },
  { step: 4, label: 'Intake' },
  { step: 5, label: 'Summary' },
];

export const KioskProgress: React.FC<KioskProgressProps> = ({ currentStep, totalSteps = 5 }) => {
  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background connecting bar */}
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active progress bar */}
        <div
          className="absolute top-1/2 left-0 h-1.5 bg-kiosk-blue -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {STEPS.map((item) => {
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-white'
                    : isCurrent
                    ? 'bg-kiosk-blue text-white ring-4 ring-sky-200 shadow-lg scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-300 ring-4 ring-white'
                }`}
              >
                {isDone ? <Check className="w-6 h-6 stroke-[3]" /> : item.step}
              </div>
              <span
                className={`mt-2 text-sm font-bold tracking-tight select-none ${
                  isCurrent ? 'text-kiosk-blue' : isDone ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
