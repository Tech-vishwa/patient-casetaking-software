'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { SummaryGeneratorService } from '@/services/summaryGeneratorService';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { AbnormalValueBadge } from '@/components/kiosk/AbnormalValueBadge';
import { StructuredClinicalSummary } from '@/types/summary';
import {
  FileCheck2,
  RefreshCw,
  Edit3,
  CheckCircle2,
  HeartPulse,
  Activity,
  Pill,
  Shield,
  Users,
  AlertOctagon,
  FileText,
  Hospital,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function PatientSummaryReviewPage() {
  const router = useRouter();
  const { t, speakText } = useLanguage();
  const { patient, session, consent, isLoading: sessionLoading, resetKioskSession } = usePatientSession();

  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Guard: Redirect if no active patient or consent
  useEffect(() => {
    if (!sessionLoading) {
      if (!patient) {
        router.replace('/kiosk/identification');
      } else if (!consent) {
        router.replace('/kiosk/consent');
      }
    }
  }, [sessionLoading, patient, consent, router]);

  // Generate / Fetch Unified Summary on Mount
  useEffect(() => {
    if (session && patient) {
      handleGenerateSummary();
    }
  }, [session, patient]);

  const handleGenerateSummary = async () => {
    if (!session || !patient) return;
    setIsGenerating(true);
    try {
      const res = await SummaryGeneratorService.generateSummary(session.id, patient.id);
      setSummary(res);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndFinish = async () => {
    if (!session) return;
    setIsFinishing(true);
    try {
      await IntakeSessionService.updateProgress(session.id, 3, 'summary_ready');
      setShowSuccessModal(true);
      speakText(t.summary.successModalTitle);
    } catch (err) {
      console.error('Error completing session:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleFinishToWelcome = () => {
    resetKioskSession();
    router.push('/kiosk/welcome');
  };

  if (sessionLoading || !patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  const narration = `${t.summary.title}. ${t.summary.subtitle}.`;
  const structured = summary?.structured_summary;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4 space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 3 of 3 • Final Clinical Review</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            {t.summary.title}
          </h1>
          <p className="text-lg text-slate-600 font-medium mt-1">
            {t.summary.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AudioPromptButton textToSpeak={narration} />
          <KioskButton
            variant="outline"
            size="default"
            onClick={handleGenerateSummary}
            isLoading={isGenerating}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {isGenerating ? t.summary.regenerating : t.summary.regenerateBtn}
          </KioskButton>
        </div>
      </div>

      {/* Structured Summary Cards Grid (11 Sections) */}
      {isGenerating ? (
        <div className="bg-white rounded-3xl p-12 border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-12 h-12 text-kiosk-blue animate-spin" />
          <p className="text-xl font-bold text-kiosk-navy">
            AI is synthesizing interview data and medical documents...
          </p>
        </div>
      ) : structured ? (
        <div className="space-y-6">
          {/* Important Alerts Banner if any */}
          {structured.important_alerts && structured.important_alerts.length > 0 && (
            <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-black text-lg">
                <AlertOctagon className="w-6 h-6 text-rose-600" />
                <span>{t.summary.alerts}</span>
              </div>
              <div className="space-y-1 text-sm font-bold text-rose-900">
                {structured.important_alerts.map((alt, idx) => (
                  <p key={idx}>{alt}</p>
                ))}
              </div>
            </div>
          )}

          {/* Grid Layout of 11 Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Chief Complaint */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-kiosk-blue">
                <HeartPulse className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.chiefComplaint}</h3>
              </div>
              <p className="text-2xl font-black text-kiosk-blue">{structured.chief_complaint}</p>
            </div>

            {/* 2. History of Present Illness */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sky-600">
                <Activity className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.hpi}</h3>
              </div>
              <p className="text-base font-semibold text-slate-700 leading-relaxed">
                {structured.history_of_present_illness}
              </p>
            </div>

            {/* 3. Past Medical History */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.pmh}</h3>
              <div className="space-y-1 text-sm font-semibold text-slate-800">
                {structured.past_medical_history.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Past Surgical History */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.surgical}</h3>
              <div className="space-y-1 text-sm font-semibold text-slate-800">
                {structured.past_surgical_history.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Current Medications */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Pill className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.medications}</h3>
              </div>
              <div className="space-y-2 text-sm font-semibold text-slate-800">
                {structured.current_medications.length > 0 ? (
                  structured.current_medications.map((med, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50 text-emerald-950 rounded-xl flex items-center justify-between">
                      <span>{med.name} {med.dosage || ''} ({med.frequency || 'Rx'})</span>
                      <span className="text-xs uppercase px-2 py-0.5 bg-white text-emerald-800 rounded-md font-bold border border-emerald-200">
                        {med.source}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">None reported</p>
                )}
              </div>
            </div>

            {/* 6. Allergies & Family */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2 text-rose-600 mb-2">
                  <Shield className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.allergies}</h3>
                </div>
                <div className="space-y-1 text-sm font-semibold text-slate-800">
                  {structured.allergies.map((a, idx) => (
                    <p key={idx} className="p-2 bg-rose-50 text-rose-900 rounded-xl">
                      {a.allergen}
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Users className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.family}</h3>
                </div>
                <div className="space-y-1 text-sm font-semibold text-slate-800">
                  {structured.family_history.map((f, idx) => (
                    <p key={idx} className="p-2 bg-amber-50 text-amber-950 rounded-xl">
                      {f}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Prior Investigations (Lab Reports) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.investigations}</h3>
                <span className="text-xs font-bold text-slate-400">
                  {structured.prior_investigations.length} Lab Test(s) Identified
                </span>
              </div>

              {structured.prior_investigations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {structured.prior_investigations.map((inv, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        inv.isAbnormal
                          ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-base">{inv.test}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          Observed: <strong className="text-kiosk-navy text-sm">{inv.result}</strong> (Ref: {inv.referenceRange || 'N/A'})
                        </p>
                      </div>
                      {inv.isAbnormal && <AbnormalValueBadge />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No uploaded lab investigations.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Safety & Non-Diagnostic Notice */}
      <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs font-semibold text-slate-500">
        ℹ️ {t.summary.disclaimer}
      </div>

      {/* Actions & Modification Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <KioskButton
            variant="outline"
            size="default"
            onClick={() => router.push('/kiosk/conversation')}
            icon={<Edit3 className="w-4 h-4" />}
          >
            {t.summary.editAnswersBtn}
          </KioskButton>

          <KioskButton
            variant="outline"
            size="default"
            onClick={() => router.push('/kiosk/documents')}
            icon={<FileText className="w-4 h-4" />}
          >
            Manage Documents
          </KioskButton>
        </div>

        <KioskButton
          size="huge"
          variant="success"
          onClick={handleConfirmAndFinish}
          isLoading={isFinishing}
          icon={<ArrowRight className="w-8 h-8 stroke-[3]" />}
          className="w-full sm:w-auto min-w-[340px]"
        >
          {isFinishing ? t.summary.savingSummary : t.summary.confirmAndFinishBtn}
        </KioskButton>
      </div>

      {/* Success Completion Dialog */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-xl w-full shadow-2xl border-4 border-emerald-500 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-kiosk-navy">
                {t.summary.successModalTitle}
              </h2>
              <p className="text-lg font-medium text-slate-600 mt-2 leading-relaxed">
                {t.summary.successModalBody}
              </p>
            </div>

            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-center gap-3">
              <Hospital className="w-7 h-7 text-kiosk-blue" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase">Consultation Queue:</p>
                <p className="text-lg font-extrabold text-kiosk-navy">Token #A-104 • Dr. Venkatraman (Room 4)</p>
              </div>
            </div>

            <KioskButton
              size="large"
              variant="primary"
              onClick={handleFinishToWelcome}
              className="w-full"
            >
              {t.summary.returnToDesk}
            </KioskButton>
          </div>
        </div>
      )}
    </div>
  );
}
