'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import {
  Printer,
  CheckCircle2,
  Hospital,
  Clock,
  QrCode,
  ShieldCheck,
  User,
  Calendar,
  Stethoscope,
  Home,
  Sparkles,
  ArrowRight,
  Pause,
  Play,
} from 'lucide-react';

export default function ConsultationTokenPage() {
  const router = useRouter();
  const { language, t, speakText } = useLanguage();
  const { patient, session, consultationMode, resetKioskSession, isLoading: sessionLoading } = usePatientSession();

  const isAyush = consultationMode === 'AYUSH' || session?.consultation_mode === 'AYUSH';

  // Deterministic token number generation (e.g. OPD-042 or AYU-018)
  const [tokenNumber, setTokenNumber] = useState<string>('');
  const [tokenTime, setTokenTime] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(45);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate or restore stable token
    const storedToken = sessionStorage.getItem('medikiosk_last_token');
    const storedTime = sessionStorage.getItem('medikiosk_last_token_time');

    if (storedToken && storedTime) {
      setTokenNumber(storedToken);
      setTokenTime(storedTime);
    } else {
      const randomSeq = Math.floor(Math.random() * 80) + 20; // 20 - 99
      const generatedToken = isAyush ? `AYU-${randomSeq}` : `OPD-${randomSeq}`;
      const nowStr = new Date().toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      setTokenNumber(generatedToken);
      setTokenTime(nowStr);
      try {
        sessionStorage.setItem('medikiosk_last_token', generatedToken);
        sessionStorage.setItem('medikiosk_last_token_time', nowStr);
      } catch {}
    }

    // Audio narration
    const narration = isAyush
      ? `Your Ayurvedic consultation token is ready. Token number is ${tokenNumber || 'AYU-018'}. Please proceed to Ayush OPD Room 2.`
      : `Your consultation token is ready. Token number is ${tokenNumber || 'OPD-042'}. Please proceed to Doctor Consultation Room 4.`;
    speakText(narration);
  }, [isAyush]);

  // Auto-backtrack countdown to return home for the next patient
  useEffect(() => {
    if (isPaused) return;

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current as NodeJS.Timeout);
          handleFinishAndHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isPaused]);

  const handlePrint = () => {
    window.print();
  };

  const handleFinishAndHome = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    try {
      sessionStorage.removeItem('medikiosk_last_token');
      sessionStorage.removeItem('medikiosk_last_token_time');
    } catch {}
    resetKioskSession();
    router.push('/');
  };

  const assignedRoom = isAyush
    ? 'Ayush OPD Room #2 • Vaidya Consultation Chamber'
    : 'Doctor Consultation Room #4 • Allopathic Desk';

  const assignedDoctor = isAyush
    ? 'Dr. V. Raman, BAMS (Senior Ayurvedic Physician)'
    : 'Dr. A. Sharma, MD (General & Internal Medicine)';

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 space-y-6">
      {/* Top Controls (Hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
              isAyush ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-sky-100 text-sky-800 border border-sky-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAyush ? '🪷 Ayurvedic Token Generated' : '🏥 Clinical Token Generated'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            Consultation Token & Slip
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            Your clinical summary has been delivered to your doctor. Please print or note your token.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AudioPromptButton
            textToSpeak={
              isAyush
                ? `Your Ayurvedic consultation token is ${tokenNumber}. Please proceed to Ayush OPD Room 2.`
                : `Your consultation token is ${tokenNumber}. Please proceed to Doctor Consultation Room 4.`
            }
          />
          <KioskButton
            variant="outline"
            size="default"
            onClick={handleFinishAndHome}
            icon={<Home className="w-4 h-4" />}
          >
            Return to Home
          </KioskButton>
        </div>
      </div>

      {/* Auto-Backtrack Notification Bar (Hidden in print) */}
      <div className="no-print p-3.5 bg-slate-100 border border-slate-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-kiosk-blue animate-spin" />
          <span>
            Auto-returning to Home Page in <strong className="text-kiosk-navy text-sm font-black">{countdown}s</strong> for next patient...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isPaused ? 'Resume Timer' : 'Pause Timer'}</span>
          </button>
          <button
            type="button"
            onClick={handleFinishAndHome}
            className="px-3 py-1.5 rounded-xl bg-kiosk-navy text-white hover:bg-slate-800 font-bold transition flex items-center gap-1"
          >
            <span>Backtrack Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. PRINTABLE CONSULTATION TOKEN & APPOINTMENT SLIP            */}
      {/* ============================================================= */}
      <div
        id="printable-token"
        className="bg-white rounded-3xl p-6 sm:p-10 border-3 border-slate-300 shadow-xl space-y-6 relative overflow-hidden"
      >
        {/* Hospital Header */}
        <div className="border-b-2 border-dashed border-slate-300 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kiosk-blue to-kiosk-navy text-white flex items-center justify-center font-black text-xl shadow-md">
              <Hospital className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-kiosk-navy tracking-tight">
                NATIONAL HEALTH AUTHORITY • MEDIKIOSK
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isAyush ? 'AYUSH & AYURVEDIC OPD CLINICAL SERVICES' : 'OUTPATIENT GENERAL CONSULTATION SERVICES'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs font-bold text-slate-500 space-y-0.5">
            <div>SLIP ISSUE: {tokenTime || 'TODAY'}</div>
            <div className="text-emerald-700">ABDM VERIFIED DIGITAL INTAKE</div>
          </div>
        </div>

        {/* Large Token Badge */}
        <div
          className={`p-6 sm:p-8 rounded-3xl text-center space-y-2 border-2 ${
            isAyush
              ? 'bg-gradient-to-b from-emerald-50 to-teal-50/50 border-emerald-300'
              : 'bg-gradient-to-b from-sky-50 to-blue-50/50 border-sky-300'
          }`}
        >
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            YOUR CONSULTATION TOKEN NUMBER
          </span>

          <div
            className={`text-5xl sm:text-7xl font-black tracking-tight ${
              isAyush ? 'text-emerald-800' : 'text-kiosk-blue'
            }`}
          >
            {tokenNumber || (isAyush ? 'AYU-018' : 'OPD-042')}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-white border border-slate-300 text-slate-700 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Queue Status: Active • Est. Wait: ~10-15 mins</span>
            </span>
          </div>
        </div>

        {/* Patient & Room Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-kiosk-blue" />
              <span>Patient Details</span>
            </div>
            <div className="font-bold text-slate-800 space-y-1">
              <p>Name: <strong className="text-kiosk-navy text-base">{patient?.full_name || 'Patient'}</strong></p>
              <p>Age / Gender: {patient?.age || '35'} Yrs • {patient?.gender || 'Other'}</p>
              <p>Phone: {patient?.phone || 'Registered'}</p>
              <p>ABHA ID: <span className="font-mono text-xs">{patient?.abha_id || 'ABHA-LINKED'}</span></p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-600 font-black text-xs uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>Consultation Room & Doctor</span>
            </div>
            <div className="font-bold text-slate-800 space-y-1">
              <p className="text-base font-black text-kiosk-navy">{assignedRoom}</p>
              <p className="text-xs text-slate-600">{assignedDoctor}</p>
              <p className="text-xs font-semibold text-emerald-700 pt-1">
                ✓ AI Intake Summary Delivered & Synchronized
              </p>
            </div>
          </div>
        </div>

        {/* Barcode & Verification Footer */}
        <div className="border-t-2 border-dashed border-slate-300 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-black text-slate-700">INSTRUCTIONS FOR PATIENT:</p>
            <p className="text-xs text-slate-500 max-w-md font-medium">
              1. Please proceed directly to the designated OPD waiting area outside your consultation room.
              <br />
              2. Watch the display screen. When your token appears, enter the consultation chamber.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end flex-shrink-0">
            {/* Simulated Barcode */}
            <div className="font-mono tracking-widest text-xs font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border border-slate-300">
              ||| ||||| |||| || |||| ||||| ||
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
              REF: {session?.id ? session.id.slice(0, 16) : 'MK-2026-TOKEN-SLIP'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 3. ACTION CONTROLS BAR (Hidden in print)                      */}
      {/* ============================================================= */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <KioskButton
          variant="outline"
          size="large"
          onClick={handleFinishAndHome}
          icon={<Home className="w-5 h-5" />}
          className="w-full sm:w-auto"
        >
          Finish & Return to Home
        </KioskButton>

        <KioskButton
          variant="primary"
          size="large"
          onClick={handlePrint}
          icon={<Printer className="w-6 h-6" />}
          className="w-full sm:w-auto min-w-[260px] text-lg font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl"
        >
          🖨 Print Consultation Token
        </KioskButton>
      </div>

      {/* Print CSS Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide non-printable elements */
          .no-print,
          header,
          footer,
          nav,
          button {
            display: none !important;
          }
          /* Show only the token card */
          body * {
            visibility: hidden;
          }
          #printable-token,
          #printable-token * {
            visibility: visible;
          }
          #printable-token {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: 2px solid #000 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
