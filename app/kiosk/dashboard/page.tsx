'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { ClinicalService } from '@/services/clinicalService';
import { DocumentProcessingService } from '@/services/documentProcessingService';
import { SummaryGeneratorService } from '@/services/summaryGeneratorService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { KioskProgress } from '@/components/kiosk/KioskProgress';
import {
  MessageSquarePlus,
  FileText,
  FileCheck2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FilePlus,
  FileCheck,
} from 'lucide-react';
import { StructuredClinicalHistory } from '@/types/clinical';
import { MedicalDocument } from '@/types/document';
import { StructuredClinicalSummary } from '@/types/summary';

export default function PatientIntakeDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { patient, session, consent, isLoading: sessionLoading } = usePatientSession();

  const [clinicalHistory, setClinicalHistory] = useState<StructuredClinicalHistory | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);

  // Guard: Redirect if no active patient session or consent
  useEffect(() => {
    if (!sessionLoading) {
      if (!patient) {
        router.replace('/kiosk/identification');
      } else if (!consent) {
        router.replace('/kiosk/consent');
      }
    }
  }, [sessionLoading, patient, consent, router]);

  // Load existing data for session
  useEffect(() => {
    if (session) {
      ClinicalService.getClinicalHistory(session.id).then((hist) => {
        if (hist) setClinicalHistory(hist);
      });
      DocumentProcessingService.getSessionDocuments(session.id).then((docs) => {
        setDocuments(docs);
      });
      SummaryGeneratorService.getSummary(session.id).then((sum) => {
        if (sum) setSummary(sum);
      });
    }
  }, [session]);

  const isStep1Done = Boolean(clinicalHistory || (session && (session.status === 'history_completed' || session.current_step >= 2)));
  const isStep2Done = Boolean(documents.length > 0 || (session && (session.status === 'summary_ready' || session.current_step >= 3)));
  const isStep3Done = Boolean(summary || (session && session.status === 'summary_ready'));

  const narrationText = `${t.dashboard.welcomePatient} ${patient?.full_name || ''}. ${t.dashboard.progressTitle}.`;

  const handleStartStep1 = () => router.push('/kiosk/conversation');
  const handleStartStep2 = () => router.push('/kiosk/documents');
  const handleStartStep3 = () => router.push('/kiosk/summary');

  if (sessionLoading || !patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4">
      {/* Progress Bar */}
      <KioskProgress currentStep={isStep3Done ? 5 : isStep1Done ? 5 : 4} />

      {/* Screen Header with Patient Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Onboarding Verified
            </span>
            <span className="text-xs font-bold text-slate-500">
              Session #{session?.id.slice(-6) || 'LIVE'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight mt-1">
            {t.dashboard.welcomePatient}, <span className="text-kiosk-blue">{patient.full_name}</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            {t.dashboard.progressTitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Patient Profile & Verified Badges Strip */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="pt-2 sm:pt-0 sm:px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
            <p className="text-lg font-black text-kiosk-navy truncate">{patient.full_name}</p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age / Gender</p>
            <p className="text-lg font-black text-kiosk-navy">
              {patient.age} yrs • <span className="capitalize">{patient.gender}</span>
            </p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
            <p className="text-lg font-black text-kiosk-navy">+91 {patient.phone}</p>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ABHA Health ID</p>
            <p className="text-lg font-black text-kiosk-blue truncate">
              {patient.abha_id || 'Not Linked'}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Intake Workflow Steps */}
      <div className="space-y-4 mb-8">
        {/* STEP 1: AI Health Conversation */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleStartStep1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartStep1();
          }}
          className={`p-6 sm:p-8 rounded-3xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
            isStep1Done
              ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-4 border-emerald-500 shadow-md ring-4 ring-emerald-100'
              : 'bg-gradient-to-r from-sky-50 via-white to-sky-50/40 border-4 border-kiosk-blue shadow-kiosk-elevated hover:brightness-105 ring-4 ring-sky-100'
          }`}
        >
          <div className="flex items-start sm:items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isStep1Done
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-kiosk-blue text-white shadow-sky-500/30'
              }`}
            >
              {isStep1Done ? <CheckCircle className="w-9 h-9" /> : <MessageSquarePlus className="w-9 h-9" />}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isStep1Done ? 'bg-emerald-600 text-white' : 'bg-sky-500 text-white'
                  }`}
                >
                  Step 1 • {isStep1Done ? 'Completed' : 'Active'}
                </span>
                <span
                  className={`text-sm font-bold flex items-center gap-1 ${
                    isStep1Done ? 'text-emerald-700' : 'text-kiosk-blue'
                  }`}
                >
                  {isStep1Done ? 'Clinical History Recorded' : t.dashboard.statusNotStarted}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy tracking-tight">
                {t.dashboard.step1Title}
              </h2>
              <p className="text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {isStep1Done
                  ? `Chief complaint: "${clinicalHistory?.chief_complaint || 'Recorded'}". Tap to re-take or review.`
                  : t.dashboard.step1Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isStep1Done ? (
              <KioskButton variant="outline" size="default" icon={<RotateCcw className="w-5 h-5" />} onClick={handleStartStep1}>
                Re-take Interview
              </KioskButton>
            ) : (
              <KioskButton size="default" icon={<ArrowRight className="w-6 h-6 stroke-[3]" />} onClick={handleStartStep1}>
                {t.dashboard.step1Action}
              </KioskButton>
            )}
          </div>
        </div>

        {/* STEP 2: Medical Documents & Reports (ACTIVE) */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleStartStep2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartStep2();
          }}
          className={`p-6 sm:p-8 rounded-3xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
            isStep2Done
              ? 'bg-gradient-to-r from-purple-50 via-white to-purple-50/30 border-4 border-purple-500 shadow-md ring-4 ring-purple-100'
              : 'bg-gradient-to-r from-sky-50 via-white to-sky-50/40 border-4 border-sky-400 shadow-sm hover:brightness-105 ring-4 ring-sky-50'
          }`}
        >
          <div className="flex items-start sm:items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isStep2Done
                  ? 'bg-purple-600 text-white shadow-purple-500/30'
                  : 'bg-sky-600 text-white shadow-sky-500/30'
              }`}
            >
              {isStep2Done ? <FileCheck className="w-9 h-9" /> : <FileText className="w-9 h-9" />}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isStep2Done ? 'bg-purple-600 text-white' : 'bg-sky-600 text-white'
                  }`}
                >
                  Step 2 • {isStep2Done ? `${documents.length} Document(s) Processed` : 'Active'}
                </span>
                <span className="text-sm font-bold text-purple-700">
                  {isStep2Done ? 'Intelligence Extracted' : 'Optional / Ready'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy tracking-tight">
                {t.dashboard.step2Title}
              </h2>
              <p className="text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {isStep2Done
                  ? `${documents.length} record(s) digitized and organized chronologically. Tap to manage or add more.`
                  : t.dashboard.step2Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <KioskButton
              size="default"
              variant={isStep2Done ? 'outline' : 'primary'}
              icon={<ArrowRight className="w-6 h-6 stroke-[3]" />}
              onClick={handleStartStep2}
            >
              {isStep2Done ? 'Manage Documents' : t.dashboard.step2Action}
            </KioskButton>
          </div>
        </div>

        {/* STEP 3: Review Clinical Summary (ACTIVE) */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleStartStep3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStartStep3();
          }}
          className={`p-6 sm:p-8 rounded-3xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
            isStep3Done
              ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 border-4 border-emerald-600 shadow-kiosk-elevated ring-4 ring-emerald-100'
              : 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-4 border-slate-300 shadow-sm hover:border-kiosk-blue'
          }`}
        >
          <div className="flex items-start sm:items-center gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isStep3Done
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-slate-700 text-white shadow-slate-500/30'
              }`}
            >
              <FileCheck2 className="w-9 h-9" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isStep3Done ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                  }`}
                >
                  Step 3 • {isStep3Done ? 'Ready for Doctor' : 'Final Step'}
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {isStep3Done ? 'Ready for Doctor Review' : 'Ready to Synthesize'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy tracking-tight">
                {t.dashboard.step3Title}
              </h2>
              <p className="text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {t.dashboard.step3Desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <KioskButton
              size="default"
              variant={isStep3Done ? 'success' : 'primary'}
              icon={<ArrowRight className="w-6 h-6 stroke-[3]" />}
              onClick={handleStartStep3}
            >
              {t.dashboard.step3Action}
            </KioskButton>
          </div>
        </div>
      </div>

      {/* Segment 3 Status Notice */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-sky-950 text-sm font-semibold mb-4">
        <Sparkles className="w-5 h-5 text-kiosk-blue flex-shrink-0" />
        <span>
          Segment 3 Document Intelligence & AI Summary Engine is active. You can upload documents or review your unified clinical summary.
        </span>
      </div>
    </div>
  );
}
