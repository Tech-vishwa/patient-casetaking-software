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
  Utensils,
  Moon,
  Flame,
  Zap,
} from 'lucide-react';

export default function PatientSummaryReviewPage() {
  const router = useRouter();
  const { t, speakText } = useLanguage();
  const { patient, session, consent, consultationMode, isLoading: sessionLoading, resetKioskSession } = usePatientSession();

  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const isAyush = consultationMode === 'AYUSH' || session?.consultation_mode === 'AYUSH' || Boolean(summary?.ayush_summary);

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
  }, [session?.id, patient?.id]);

  const handleGenerateSummary = async () => {
    if (!session || !patient) return;
    setIsGenerating(true);
    try {
      const generated = await SummaryGeneratorService.generateSummary(session.id, patient.id);
      setSummary(generated);
      const narrationText = isAyush
        ? 'Your Ayurvedic intake summary is ready for review.'
        : `${t.summary.title}. ${t.summary.subtitle}`;
      speakText(narrationText);
    } catch (e) {
      console.error('Failed to generate summary', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndDeliver = async () => {
    if (!session) return;
    setIsFinishing(true);

    try {
      await IntakeSessionService.completeSession(session.id);
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Failed to complete session', e);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReturnToDesk = () => {
    resetKioskSession();
    router.push('/patient/dashboard');
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
  const ayush = summary?.ayush_summary;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4 space-y-6">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
              isAyush ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isAyush ? '🪷 AYUSH / Ayurveda Intake Review' : '🏥 Allopathic Clinical Review'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            {isAyush ? 'Ayurvedic Clinical Intake Summary' : t.summary.title}
          </h1>
          <p className="text-lg text-slate-600 font-medium mt-1">
            {isAyush
              ? 'Comprehensive Ayurvedic intake structured for physician evaluation.'
              : t.summary.subtitle}
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

      {/* Mandatory Disclaimer Badge for Both Modes */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs font-bold text-amber-900 leading-relaxed">
          <strong>AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION:</strong>{' '}
          {isAyush
            ? 'This intake assessment was compiled by MediKiosk AI from patient-reported symptoms, dietary habits, and routine for physician review. It does not provide medical diagnoses, dosha conclusions, or prescriptions.'
            : t.summary.disclaimer}
        </div>
      </div>

      {/* Loading state */}
      {isGenerating ? (
        <div className="bg-white rounded-3xl p-12 border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-12 h-12 text-kiosk-blue animate-spin" />
          <p className="text-xl font-bold text-kiosk-navy">
            AI is synthesizing interview data and clinical records...
          </p>
        </div>
      ) : isAyush && ayush ? (
        /* ============================================================ */
        /* AYURVEDIC CLINICAL INTAKE SUMMARY (11 Sections - Part 9)    */
        /* ============================================================ */
        <div className="space-y-6">
          {/* Important Alerts if any */}
          {ayush.important_alerts && ayush.important_alerts.length > 0 && (
            <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-black text-lg">
                <AlertOctagon className="w-6 h-6 text-rose-600" />
                <span>Important Health Alerts</span>
              </div>
              <div className="space-y-1 text-sm font-bold text-rose-900">
                {ayush.important_alerts.map((alt, idx) => (
                  <p key={idx}>{alt}</p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Patient Information */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">1. Patient Information</h3>
              </div>
              <div className="text-sm font-semibold text-slate-700 space-y-1">
                <p>Name: <strong className="text-kiosk-navy">{patient.full_name}</strong></p>
                <p>Age / Gender: <strong className="text-kiosk-navy">{patient.age} yrs • {patient.gender}</strong></p>
                <p>ABHA ID: <strong className="text-kiosk-navy">{patient.abha_id || 'Not linked'}</strong></p>
                <p>Mode: <strong className="text-emerald-700">🪷 AYUSH / Ayurveda OPD</strong></p>
              </div>
            </div>

            {/* 2. Presenting Complaint */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <HeartPulse className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">2. Presenting Complaint</h3>
              </div>
              <p className="text-xl font-black text-emerald-900">{ayush.presenting_complaint}</p>
              {ayush.duration && (
                <p className="text-xs font-bold text-emerald-700">Duration: {ayush.duration}</p>
              )}
            </div>

            {/* 3. Current Symptoms */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Activity className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">3. Current Symptoms</h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {ayush.current_symptoms.map((sym, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold">
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Prakriti Assessment */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">4. Prakriti Assessment (Constitution)</h3>
              </div>
              <div className="text-xs font-semibold text-slate-700 space-y-1">
                <p>Body Build: <strong>{ayush.prakriti_assessment.body_build || 'Madhyama'}</strong></p>
                <p>Skin Type: <strong>{ayush.prakriti_assessment.skin_type || 'Moderate'}</strong></p>
                <p>Temperament: <strong>{ayush.prakriti_assessment.temperament || 'Balanced'}</strong></p>
              </div>
            </div>

            {/* 5. Vikriti Assessment */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Flame className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">5. Vikriti Assessment (Current Imbalance)</h3>
              </div>
              <div className="text-xs font-semibold text-slate-700 space-y-1">
                <p>Digestive Pattern: <strong>{ayush.vikriti_assessment.digestive_changes || 'Reported in interview'}</strong></p>
                <p>Energy & Vitality: <strong>{ayush.vikriti_assessment.energy_changes || 'Reported in interview'}</strong></p>
              </div>
            </div>

            {/* 6. Ahara Assessment */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Utensils className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">6. Ahara Assessment (Dietary Intake)</h3>
              </div>
              <div className="text-xs font-semibold text-slate-700 space-y-1">
                <p>Food Consumed: <strong>{ayush.ahara_assessment.food_types || 'Mixed diet'}</strong></p>
                <p>Meal Timing: <strong>{ayush.ahara_assessment.meal_timing || 'Regular'}</strong></p>
                <p>Water Intake: <strong>{ayush.ahara_assessment.water_intake || '2 Litres'}</strong></p>
              </div>
            </div>

            {/* 7. Vihara Assessment */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Moon className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">7. Vihara Assessment (Lifestyle Routine)</h3>
              </div>
              <div className="text-xs font-semibold text-slate-700 space-y-1">
                <p>Physical Activity: <strong>{ayush.vihara_assessment.physical_activity || 'Sedentary to moderate'}</strong></p>
                <p>Sleep Quality: <strong>{ayush.vihara_assessment.sleep || 'Normal'}</strong></p>
                <p>Stress Level: <strong>{ayush.vihara_assessment.stress || 'Manageable'}</strong></p>
              </div>
            </div>

            {/* 8. Dashavidha Pariksha (10 Extended Parameters) */}
            <div className="p-6 rounded-3xl bg-emerald-50/60 border-2 border-emerald-300 shadow-sm space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Zap className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg text-kiosk-navy">8. Dashavidha Pariksha (10 Ayurvedic Parameters)</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs font-semibold text-slate-800">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">1. Prakriti</span>
                  {ayush.dashavidha_pariksha.prakriti}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">2. Vikriti</span>
                  {ayush.dashavidha_pariksha.vikriti}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">3. Sara (Vitality)</span>
                  {ayush.dashavidha_pariksha.sara}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">4. Samhanana (Build)</span>
                  {ayush.dashavidha_pariksha.samhanana}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">5. Pramana (Proportions)</span>
                  {ayush.dashavidha_pariksha.pramana}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">6. Satmya (Habituation)</span>
                  {ayush.dashavidha_pariksha.satmya}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">7. Sattva (Mental)</span>
                  {ayush.dashavidha_pariksha.sattva}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">8. Ahara Shakti</span>
                  {ayush.dashavidha_pariksha.ahara_shakti}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">9. Vyayama Shakti</span>
                  {ayush.dashavidha_pariksha.vyayama_shakti}
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-slate-400 block font-bold">10. Vaya (Age)</span>
                  {ayush.dashavidha_pariksha.vaya}
                </div>
              </div>
            </div>

            {/* 9. Previous Medical / Treatment History */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">9. Previous Medical / Treatment History</h3>
              </div>
              <div className="text-sm font-semibold text-slate-700 space-y-1">
                {ayush.previous_medical_treatment_history.map((t, idx) => (
                  <p key={idx}>• {t}</p>
                ))}
              </div>
            </div>

            {/* 10. Medications & Investigations */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Pill className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">10. Current Medications & Lab Tests</h3>
              </div>
              <div className="text-xs font-semibold text-slate-700 space-y-1">
                {ayush.medications.length > 0 ? (
                  ayush.medications.map((m, idx) => (
                    <p key={idx}>• Med: {m.name} {m.dosage || ''}</p>
                  ))
                ) : (
                  <p className="text-slate-500">No active medicines reported</p>
                )}
                {ayush.uploaded_investigations.length > 0 ? (
                  ayush.uploaded_investigations.map((inv, idx) => (
                    <p key={idx}>• Lab: {inv.test} = {inv.result} {inv.unit || ''}</p>
                  ))
                ) : (
                  <p className="text-slate-500">No uploaded lab documents</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : structured ? (
        /* ============================================================ */
        /* MODERN MEDICINE SUMMARY (11 Sections)                        */
        /* ============================================================ */
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
              <div className="space-y-2">
                {structured.current_medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-kiosk-navy text-sm">{med.name}</strong>
                      <span className="text-xs text-slate-500 ml-2">{med.dosage || ''}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {med.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Allergies */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Shield className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.allergies}</h3>
              </div>
              <div className="space-y-1">
                {structured.allergies.map((a, idx) => (
                  <div key={idx} className="p-2.5 bg-rose-50/60 rounded-xl text-rose-900 font-bold text-sm">
                    {a.allergen}
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Family History */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.family}</h3>
              </div>
              <div className="space-y-1 text-sm font-semibold text-slate-800">
                {structured.family_history.map((f, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl">
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Prior Investigations */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-bold text-kiosk-navy">{t.summary.investigations}</h3>
              </div>
              <div className="space-y-2">
                {structured.prior_investigations && structured.prior_investigations.length > 0 ? (
                  structured.prior_investigations.map((inv, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-slate-800 text-sm">{inv.test}</strong>
                        <span className="text-xs text-slate-500 ml-2">Ref: {inv.referenceRange || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-kiosk-navy">{inv.result} {inv.unit || ''}</span>
                        {inv.isAbnormal && <AbnormalValueBadge isAbnormal={true} />}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No prior lab records attached</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-slate-200">
        <KioskButton
          variant="outline"
          size="large"
          onClick={() => router.push('/kiosk/conversation')}
          icon={<Edit3 className="w-5 h-5" />}
        >
          {t.summary.editAnswersBtn}
        </KioskButton>

        <KioskButton
          variant="primary"
          size="large"
          onClick={handleConfirmAndDeliver}
          isLoading={isFinishing}
          icon={<ArrowRight className="w-6 h-6" />}
          className={`font-black text-xl px-10 py-5 ${
            isAyush ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-kiosk-blue hover:bg-sky-600'
          }`}
        >
          {isFinishing ? t.summary.savingSummary : t.summary.confirmAndFinishBtn}
        </KioskButton>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 text-center shadow-2xl border-4 border-emerald-500">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy">
                {t.summary.successModalTitle}
              </h2>
              <p className="text-base font-semibold text-slate-600 leading-relaxed">
                {t.summary.successModalBody}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 text-kiosk-navy font-bold text-sm">
              <Hospital className="w-5 h-5 text-kiosk-blue" />
              <span>
                {isAyush
                  ? 'Transmitted to Ayush Department • OPD Room 2'
                  : 'Delivered to Doctor Consultation Room #4'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReturnToDesk}
              className="w-full py-4 px-6 rounded-2xl bg-kiosk-navy hover:bg-slate-800 text-white font-black text-lg shadow-lg transition"
            >
              {t.summary.returnToDesk}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
