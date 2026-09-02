'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { ConsentService } from '@/services/consentService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { KioskProgress } from '@/components/kiosk/KioskProgress';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Lock,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function DigitalConsentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { patient, setConsent, isLoading: sessionLoading, resetKioskSession } = usePatientSession();

  const [consent1, setConsent1] = useState<boolean>(true);
  const [consent2, setConsent2] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Guard: Redirect if no active patient
  useEffect(() => {
    if (!sessionLoading && !patient) {
      router.replace('/kiosk/identification');
    }
  }, [sessionLoading, patient, router]);

  const narrationText = `${t.consent.title}. ${t.consent.subtitle}. ${t.consent.noticeHeader}: ${t.consent.noticeBody}. ${t.consent.consent1Label}. ${t.consent.consent2Label}.`;

  const handleAcceptConsent = async () => {
    if (!consent1 || !consent2) {
      setErrorMessage('Please check both consent checkboxes to proceed with the AI intake.');
      return;
    }
    if (!patient) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const record = await ConsentService.recordConsent({
        patient_id: patient.id,
        data_collection_consent: consent1,
        data_sharing_consent: consent2,
      });

      setConsent(record);
      router.push('/kiosk/dashboard');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to save consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDecline = () => {
    setShowDeclineModal(false);
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

  const bothChecked = consent1 && consent2;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      {/* Step Indicator */}
      <KioskProgress currentStep={3} />

      {/* Screen Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight mb-1">
            {t.consent.title}
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            {t.consent.subtitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Patient Identification Card */}
      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-kiosk-blue text-white flex items-center justify-center font-bold text-xl">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Patient Profile</p>
            <p className="text-xl font-black text-kiosk-navy">{patient.full_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
          <div>Age: <strong className="text-kiosk-navy">{patient.age} yrs</strong></div>
          <div>Gender: <strong className="text-kiosk-navy capitalize">{patient.gender}</strong></div>
          {patient.abha_id && (
            <div className="px-3 py-1 bg-white rounded-full border border-sky-300 text-sky-900 font-bold text-xs">
              ABHA: {patient.abha_id}
            </div>
          )}
        </div>
      </div>

      {/* Main Consent Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-6 mb-6">
        {/* Why Notice */}
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-kiosk-navy mb-1">{t.consent.noticeHeader}</h3>
            <p className="text-base text-slate-600 leading-relaxed">{t.consent.noticeBody}</p>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-2xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Consent Checkbox 1 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setConsent1(!consent1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setConsent1(!consent1);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none ${
            consent1
              ? 'bg-sky-50/70 border-kiosk-blue ring-2 ring-sky-100'
              : 'bg-white border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="mt-1 flex-shrink-0 text-kiosk-blue">
            {consent1 ? (
              <CheckSquare className="w-8 h-8 text-kiosk-blue fill-sky-100" />
            ) : (
              <Square className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-kiosk-navy mb-1">{t.consent.consent1Label}</p>
            <p className="text-sm font-medium text-slate-500">{t.consent.consent1Sub}</p>
          </div>
        </div>

        {/* Consent Checkbox 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setConsent2(!consent2)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setConsent2(!consent2);
          }}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none ${
            consent2
              ? 'bg-sky-50/70 border-kiosk-blue ring-2 ring-sky-100'
              : 'bg-white border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="mt-1 flex-shrink-0 text-kiosk-blue">
            {consent2 ? (
              <CheckSquare className="w-8 h-8 text-kiosk-blue fill-sky-100" />
            ) : (
              <Square className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-kiosk-navy mb-1">{t.consent.consent2Label}</p>
            <p className="text-sm font-medium text-slate-500">{t.consent.consent2Sub}</p>
          </div>
        </div>

        {/* Audit & Compliance Disclaimer */}
        <div className="pt-2 text-xs font-semibold text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>{t.consent.timestampLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>{t.consent.privacyPolicyNote}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => setShowDeclineModal(true)}
          className="w-full sm:w-auto text-rose-700 border-rose-300 hover:bg-rose-50"
        >
          {t.consent.declineBtn}
        </KioskButton>

        <KioskButton
          size="large"
          variant="success"
          disabled={!bothChecked}
          isLoading={isSubmitting}
          onClick={handleAcceptConsent}
          icon={<ChevronRight className="w-7 h-7 stroke-[3]" />}
          className="w-full sm:w-auto min-w-[280px]"
        >
          {t.consent.acceptBtn}
        </KioskButton>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-amber-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-kiosk-navy">
                {t.consent.declineWarningTitle}
              </h3>
            </div>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              {t.consent.declineWarningBody}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <KioskButton
                variant="outline"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1"
              >
                Go Back & Review
              </KioskButton>

              <KioskButton
                variant="danger"
                onClick={handleConfirmDecline}
                className="flex-1"
              >
                Confirm Decline
              </KioskButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
