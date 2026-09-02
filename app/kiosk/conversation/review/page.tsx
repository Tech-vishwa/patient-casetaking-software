'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { ClinicalService } from '@/services/clinicalService';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Pill,
  HeartPulse,
  Activity,
  History,
  Users,
  Shield,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function ClinicalReviewPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { patient, session, advanceSessionStep } = usePatientSession();

  const [historyDraft, setHistoryDraft] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('medikiosk_active_history_draft');
      if (stored) {
        setHistoryDraft(JSON.parse(stored));
      } else {
        // Fallback default draft
        setHistoryDraft({
          chief_complaint: 'Fever and body pain',
          hpi: { duration: '3 days', severity: 'Moderate' },
          past_medical_history: [{ condition: 'No previous conditions reported', status: 'no' }],
          surgical_history: [],
          medications: [],
          allergies: [{ allergen: 'No known allergies', type: 'drug' }],
          family_history: [],
          personal_history: { diet: 'Vegetarian' },
        });
      }
    } catch {
      router.push('/kiosk/dashboard');
    }
  }, [router]);

  const handleConfirmAndSave = async () => {
    if (!session || !patient || !historyDraft) return;

    setIsSaving(true);
    setSaveError('');

    try {
      await ClinicalService.saveClinicalHistory({
        intake_session_id: session.id,
        patient_id: patient.id,
        chief_complaint: historyDraft.chief_complaint || 'General clinical consultation',
        hpi: historyDraft.hpi || {},
        past_medical_history: historyDraft.past_medical_history || [],
        surgical_history: historyDraft.surgical_history || [],
        medications: historyDraft.medications || [],
        allergies: historyDraft.allergies || [],
        family_history: historyDraft.family_history || [],
        personal_history: historyDraft.personal_history || {},
      });

      // Advance intake session step to Step 2 (Documents / Next Segment)
      await IntakeSessionService.updateProgress(session.id, 2, 'history_completed');
      await advanceSessionStep(2);

      // Clean draft and return to dashboard
      sessionStorage.removeItem('medikiosk_active_history_draft');
      router.push('/kiosk/dashboard');
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save clinical history. Please try again.');
      setIsSaving(false);
    }
  };

  if (!historyDraft || !patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  const narrationText = `${t.review.title}. ${t.review.subtitle}.`;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interview Stage Complete</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            {t.review.title}
          </h1>
          <p className="text-xl text-slate-600 font-medium mt-1">
            {t.review.subtitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Save Error Banner if any */}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Structured Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Chief Complaint & HPI */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-kiosk-blue">
            <HeartPulse className="w-6 h-6" />
            <h2 className="text-xl font-bold text-kiosk-navy">{t.review.chiefComplaintHeader}</h2>
          </div>
          <p className="text-2xl font-black text-kiosk-blue">
            {historyDraft.chief_complaint || t.review.noneReported}
          </p>
          <div className="pt-2 border-t border-slate-100 text-sm space-y-1">
            <span className="font-bold text-slate-500">{t.review.hpiHeader}:</span>
            {Object.entries(historyDraft.hpi || {}).map(([k, v]) => (
              <p key={k} className="text-slate-700 font-semibold">
                • <strong className="capitalize">{k}</strong>: {String(v)}
              </p>
            ))}
          </div>
        </div>

        {/* 2. Past Medical History */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-indigo-600">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-bold text-kiosk-navy">{t.review.pmhHeader}</h2>
          </div>
          <div className="space-y-2">
            {historyDraft.past_medical_history && historyDraft.past_medical_history.length > 0 ? (
              historyDraft.past_medical_history.map((m: any, idx: number) => (
                <div key={idx} className="px-3.5 py-2 bg-slate-50 rounded-xl text-base font-bold text-slate-800">
                  {m.condition}
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-medium">{t.review.noneReported}</p>
            )}
          </div>
        </div>

        {/* 3. Medications */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-emerald-600">
            <Pill className="w-6 h-6" />
            <h2 className="text-xl font-bold text-kiosk-navy">{t.review.medicationsHeader}</h2>
          </div>
          <div className="space-y-2">
            {historyDraft.medications && historyDraft.medications.length > 0 ? (
              historyDraft.medications.map((m: any, idx: number) => (
                <div key={idx} className="px-3.5 py-2 bg-emerald-50 text-emerald-900 rounded-xl text-base font-bold">
                  {m.name}
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-medium">{t.review.noneReported}</p>
            )}
          </div>
        </div>

        {/* 4. Allergies */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-rose-600">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold text-kiosk-navy">{t.review.allergiesHeader}</h2>
          </div>
          <div className="space-y-2">
            {historyDraft.allergies && historyDraft.allergies.length > 0 ? (
              historyDraft.allergies.map((a: any, idx: number) => (
                <div key={idx} className="px-3.5 py-2 bg-rose-50 text-rose-900 rounded-xl text-base font-bold">
                  {a.allergen}
                </div>
              ))
            ) : (
              <p className="text-slate-500 font-medium">{t.review.noneReported}</p>
            )}
          </div>
        </div>

        {/* 5. Family & Personal History */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3 md:col-span-2">
          <div className="flex items-center gap-3 text-amber-600">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold text-kiosk-navy">
              {t.review.familyHeader} & {t.review.personalHeader}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Family History:</span>
              <p className="text-base font-bold text-slate-800 mt-1">
                {historyDraft.family_history && historyDraft.family_history.length > 0
                  ? historyDraft.family_history.map((f: any) => f.condition).join(', ')
                  : t.review.noneReported}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Lifestyle & Habits:</span>
              <p className="text-base font-bold text-slate-800 mt-1">
                {historyDraft.personal_history?.diet || t.review.noneReported}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs font-semibold text-slate-500">
        ℹ️ {t.review.disclaimer}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => router.push('/kiosk/conversation')}
          icon={<ArrowLeft className="w-6 h-6" />}
          iconPosition="left"
        >
          {t.common.back}
        </KioskButton>

        <KioskButton
          size="huge"
          variant="success"
          onClick={handleConfirmAndSave}
          isLoading={isSaving}
          icon={<ChevronRight className="w-8 h-8 stroke-[3]" />}
          className="w-full sm:w-auto min-w-[340px]"
        >
          {isSaving ? t.review.savingHistory : t.review.confirmAndSave}
        </KioskButton>
      </div>
    </div>
  );
}
