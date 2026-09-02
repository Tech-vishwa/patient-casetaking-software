'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import {
  MessageSquareHeart,
  HelpCircle,
  FileUp,
  FileCheck,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Globe,
} from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { t, language, setLanguage, availableLanguages } = useLanguage();

  const narrationText = `${t.welcome.greeting}. ${t.welcome.subheading}. ${t.welcome.howItWorksTitle}. ${t.welcome.step1Title}: ${t.welcome.step1Desc}. ${t.welcome.step2Title}: ${t.welcome.step2Desc}. ${t.welcome.step3Title}: ${t.welcome.step3Desc}. ${t.welcome.step4Title}: ${t.welcome.step4Desc}.`;

  const handleStart = () => {
    router.push('/kiosk/language');
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4 sm:py-6">
      {/* Top Banner / Audio Guide */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-sm font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Hospital Self-Service Intake Kiosk</span>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Hero Welcome Message */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-sky-100/70 text-kiosk-blue-dark rounded-full font-bold text-sm">
          <Sparkles className="w-4 h-4 text-kiosk-blue animate-spin" />
          <span>Next-Generation Healthcare Intake</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-kiosk-navy tracking-tight">
          {t.welcome.greeting}
        </h1>

        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
          {t.welcome.subheading}
        </p>
      </div>

      {/* Quick Language Switcher Bar on Welcome Screen */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-kiosk-blue" />
            <span className="text-lg font-bold text-kiosk-navy">
              Select Language / மொழியைத் தேர்ந்தெடுக்கவும் / भाषा चुनें:
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-5 py-3 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center gap-2 ${
                  language === lang.code
                    ? 'bg-kiosk-blue text-white shadow-md shadow-sky-500/30 ring-4 ring-sky-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Step Intake Process Cards */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-kiosk-navy text-center mb-6">
          {t.welcome.howItWorksTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center mb-4">
              <MessageSquareHeart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-kiosk-navy mb-2">{t.welcome.step1Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.welcome.step1Desc}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-kiosk-navy mb-2">{t.welcome.step2Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.welcome.step2Desc}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <FileUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-kiosk-navy mb-2">{t.welcome.step3Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.welcome.step3Desc}</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-kiosk-navy mb-2">{t.welcome.step4Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.welcome.step4Desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Start Button & Callout */}
      <div className="flex flex-col items-center gap-4 text-center pb-4">
        <KioskButton
          size="huge"
          onClick={handleStart}
          icon={<ChevronRight className="w-8 h-8 stroke-[3]" />}
          className="w-full sm:w-auto min-w-[340px]"
        >
          {t.welcome.startBtn}
        </KioskButton>

        <p className="text-slate-500 font-medium text-base">
          {t.welcome.needHelpPrompt}
        </p>
      </div>
    </div>
  );
}
