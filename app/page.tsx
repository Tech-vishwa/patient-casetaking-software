'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Activity,
  User,
  Stethoscope,
  UserPlus,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function WelcomePortalPage() {
  const router = useRouter();
  const { t, language, setLanguage, availableLanguages } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar with Hospital Branding & Language Selection */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kiosk-blue to-kiosk-navy flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-kiosk-navy tracking-tight">
              MediKiosk
            </h1>
            <p className="text-xs font-bold text-slate-500">Ministry of Ayush & Health Services</p>
          </div>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                language === lang.code
                  ? 'bg-kiosk-blue text-white shadow-sm'
                  : 'text-slate-600 hover:text-kiosk-navy'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Hero & Role Selection Portal */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-sky-800 rounded-full font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-kiosk-blue" />
            <span>AI-Powered Clinical Intake Platform</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-kiosk-navy tracking-tight">
            WELCOME TO MEDIKIOSK
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Choose how you want to continue your healthcare experience today
          </p>
        </div>

        {/* Primary Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 1. Patient Intake Kiosk */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push('/kiosk/welcome')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/kiosk/welcome');
            }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white border-3 border-slate-200 hover:border-kiosk-blue shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ring-4 ring-transparent hover:ring-sky-100 active:scale-[0.99]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Activity className="w-9 h-9 stroke-[2.5]" />
              </div>

              <span className="text-xs font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Hospital OPD Self-Service
              </span>

              <h3 className="text-3xl font-black text-kiosk-navy mt-3 mb-2">
                🏥 Start Patient Intake
              </h3>

              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Start your self-service clinical intake. Choose language, verify with ABHA or phone, and describe your symptoms.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-kiosk-blue group-hover:underline">
                Start Health Intake Now
              </span>
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* 2. Doctor Login */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push('/doctor/login')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/doctor/login');
            }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white border-3 border-slate-200 hover:border-emerald-600 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left ring-4 ring-transparent hover:ring-emerald-100 active:scale-[0.99]"
          >
            <div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Stethoscope className="w-9 h-9 stroke-[2.5]" />
              </div>

              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Physician & Staff Desk
              </span>

              <h3 className="text-3xl font-black text-kiosk-navy mt-3 mb-2">
                👨‍⚕️ Doctor Login
              </h3>

              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Access the triaged patient waiting queue, review AI clinical summaries, and sync with hospital EMR.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-emerald-700 group-hover:underline">
                Enter Clinical Workstation
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
                <ChevronRight className="w-6 h-6 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Quick Action Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/patient/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold border-2 border-slate-200 shadow-sm transition active:scale-95 text-base"
          >
            <User className="w-5 h-5 text-kiosk-blue" />
            <span>Returning Patient? Login & View Records</span>
          </Link>

          <Link
            href="/patient/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold border-2 border-slate-200 shadow-sm transition active:scale-95 text-base"
          >
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>New Patient Registration</span>
          </Link>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-200 text-xs font-medium text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ABDM Compliant • HL7 FHIR R4 Ready • End-to-End Encrypted</span>
        </div>
        <div>
          <span>Ayushman Bharat Digital Mission (ABDM) Pilot</span>
        </div>
      </footer>
    </div>
  );
}
