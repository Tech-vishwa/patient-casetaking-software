'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import {
  Mic,
  Brain,
  Flame,
  ArrowLeft,
  Sparkles,
  Bot,
  Layers,
  CheckCircle,
} from 'lucide-react';

export default function ConversationPlaceholderPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { patient } = usePatientSession();

  const narrationText = `${t.conversationPlaceholder.title}. ${t.conversationPlaceholder.description}. ${t.conversationPlaceholder.feature1Title}: ${t.conversationPlaceholder.feature1Desc}. ${t.conversationPlaceholder.feature2Title}: ${t.conversationPlaceholder.feature2Desc}. ${t.conversationPlaceholder.feature3Title}: ${t.conversationPlaceholder.feature3Desc}.`;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.conversationPlaceholder.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            {t.conversationPlaceholder.title}
          </h1>
          <p className="text-xl text-slate-600 font-medium mt-1">
            {t.conversationPlaceholder.description}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Connected Patient Context Banner */}
      {patient && (
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Ready for Intake:</span>
            <p className="text-lg font-black text-kiosk-navy">{patient.full_name} ({patient.age} yrs, {patient.gender})</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Language:</span>
            <p className="text-base font-black text-kiosk-blue uppercase">{language.toUpperCase()}</p>
          </div>
        </div>
      )}

      {/* Future Capabilities Architecture Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6 mb-8">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Bot className="w-8 h-8 text-kiosk-blue" />
          <h2 className="text-2xl font-bold text-kiosk-navy">
            Segment 2 AI Engine Integration Points
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-kiosk-blue flex items-center justify-center mb-3">
              <Mic className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-kiosk-navy mb-1">
                {t.conversationPlaceholder.feature1Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.conversationPlaceholder.feature1Desc}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-kiosk-navy mb-1">
                {t.conversationPlaceholder.feature2Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.conversationPlaceholder.feature2Desc}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-kiosk-navy mb-1">
                {t.conversationPlaceholder.feature3Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.conversationPlaceholder.feature3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Segment 1 Foundation Hand-Off Checklist:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Patient Entity & State Machine initialized
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Digital Consent audit recorded with timestamp
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Active Language context propagated
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Intake Session created in database
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => router.push('/patient/dashboard')}
          icon={<ArrowLeft className="w-6 h-6" />}
          iconPosition="left"
        >
          {t.conversationPlaceholder.backToDashboard}
        </KioskButton>

        <KioskButton
          variant="primary"
          size="large"
          onClick={() => router.push('/kiosk/conversation')}
        >
          <span>Start AI Health Interview →</span>
        </KioskButton>
      </div>
    </div>
  );
}
