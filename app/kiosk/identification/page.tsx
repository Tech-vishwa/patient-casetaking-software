'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { PatientService } from '@/services/patientService';
import { MockAbhaService, OtpGenerationResult } from '@/services/mockAbhaService';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { KioskInput } from '@/components/kiosk/KioskInput';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { KioskProgress } from '@/components/kiosk/KioskProgress';
import {
  CreditCard,
  UserCheck,
  UserPlus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Calendar,
} from 'lucide-react';
import { Gender, CreatePatientInput } from '@/types/patient';

type TabType = 'abha' | 'patient_id' | 'new_patient';

export default function PatientIdentificationPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { initializeSession } = usePatientSession();

  const [activeTab, setActiveTab] = useState<TabType>('abha');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string>('');

  // ABHA flow state
  const [abhaInput, setAbhaInput] = useState<string>('91-1234-5678-9012');
  const [otpSentData, setOtpSentData] = useState<OtpGenerationResult | null>(null);
  const [otpInput, setOtpInput] = useState<string>('123456');

  // Existing Patient Phone lookup state
  const [phoneLookupInput, setPhoneLookupInput] = useState<string>('');

  // New Patient Registration state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regAge, setRegAge] = useState<string>('');
  const [regGender, setRegGender] = useState<Gender>('female');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAbha, setRegAbha] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const narrationText = `${t.identification.title}. ${t.identification.subtitle}.`;

  // -------------------------------------------------------------
  // ABHA Flow Handlers
  // -------------------------------------------------------------
  const handleFormatAbhaChange = (val: string) => {
    setAbhaInput(MockAbhaService.formatAbha(val));
    setGlobalError('');
  };

  const handleRequestAbhaOtp = async () => {
    setGlobalError('');
    setIsLoading(true);
    try {
      const cleanAbha = abhaInput.replace(/[^0-9]/g, '');
      if (cleanAbha.length !== 14) {
        setGlobalError('Please enter a valid 14-digit ABHA number.');
        setIsLoading(false);
        return;
      }

      const res = await MockAbhaService.requestOtp(cleanAbha);
      if (res.success) {
        setOtpSentData(res);
      } else {
        setGlobalError(res.message);
      }
    } catch (e: any) {
      setGlobalError(e.message || 'Failed to request OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAbhaOtp = async () => {
    if (!otpSentData) return;
    setGlobalError('');
    setIsLoading(true);

    try {
      const result = await MockAbhaService.verifyOtp(abhaInput, otpInput, otpSentData.txnId);
      if (!result.valid || !result.patientInfo) {
        setGlobalError(result.message);
        setIsLoading(false);
        return;
      }

      // Check if patient exists or register them
      let patient = await PatientService.getPatientByAbha(result.patientInfo.abhaId);
      if (!patient) {
        patient = await PatientService.registerPatient({
          full_name: result.patientInfo.fullName,
          age: result.patientInfo.age,
          gender: result.patientInfo.gender,
          phone: result.patientInfo.phone,
          abha_id: result.patientInfo.abhaId,
          preferred_language: language,
        });
      }

      await initializeSession(patient);
      router.push('/kiosk/consent');
    } catch (e: any) {
      setGlobalError(e.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Existing Patient Phone Lookup
  // -------------------------------------------------------------
  const handlePhoneLookup = async () => {
    setGlobalError('');
    const cleanPhone = phoneLookupInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setGlobalError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const patient = await PatientService.getPatientByPhone(cleanPhone);
      if (!patient) {
        setGlobalError('No existing record found for this number. Please register as a New Patient.');
        setIsLoading(false);
        return;
      }

      await initializeSession(patient);
      router.push('/kiosk/consent');
    } catch (e: any) {
      setGlobalError(e.message || 'Failed to find record.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // New Patient Registration
  // -------------------------------------------------------------
  const validateNewPatient = (): boolean => {
    const errors: Record<string, string> = {};
    if (!regFullName.trim() || regFullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (minimum 2 letters).';
    }
    const parsedAge = parseInt(regAge, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 125) {
      errors.age = 'Please enter a valid age between 1 and 125.';
    }
    const cleanPhone = regPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (regAbha.trim() && regAbha.replace(/[^0-9]/g, '').length !== 14) {
      errors.abha = 'If provided, ABHA must be 14 digits.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (!validateNewPatient()) return;

    setIsLoading(true);
    try {
      const input: CreatePatientInput = {
        full_name: regFullName.trim(),
        age: parseInt(regAge, 10),
        gender: regGender,
        phone: regPhone.trim(),
        abha_id: regAbha.trim() ? regAbha.trim() : null,
        preferred_language: language,
      };

      const newPatient = await PatientService.registerPatient(input);
      await initializeSession(newPatient);
      router.push('/kiosk/consent');
    } catch (e: any) {
      setGlobalError(e.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      {/* Step Indicator */}
      <KioskProgress currentStep={2} />

      {/* Screen Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight mb-2">
            {t.identification.title}
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            {t.identification.subtitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narrationText} />
      </div>

      {/* Global Error Banner if any */}
      {globalError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <span className="text-lg font-bold">{globalError}</span>
        </div>
      )}

      {/* 3 Identification Options (Tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Option 1: ABHA */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('abha');
            setGlobalError('');
          }}
          className={`p-5 rounded-3xl font-bold transition-all text-left flex items-center gap-4 ${
            activeTab === 'abha'
              ? 'bg-kiosk-navy text-white shadow-lg ring-4 ring-sky-200'
              : 'bg-white text-kiosk-navy border-2 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`p-3 rounded-2xl ${
              activeTab === 'abha' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xl font-extrabold">{t.identification.tabAbha}</p>
            <p className={`text-xs ${activeTab === 'abha' ? 'text-sky-200' : 'text-slate-500'}`}>
              Fastest • National ID
            </p>
          </div>
        </button>

        {/* Option 2: Existing Patient ID */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('patient_id');
            setGlobalError('');
          }}
          className={`p-5 rounded-3xl font-bold transition-all text-left flex items-center gap-4 ${
            activeTab === 'patient_id'
              ? 'bg-kiosk-navy text-white shadow-lg ring-4 ring-sky-200'
              : 'bg-white text-kiosk-navy border-2 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`p-3 rounded-2xl ${
              activeTab === 'patient_id' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xl font-extrabold">{t.identification.tabAadhaar}</p>
            <p className={`text-xs ${activeTab === 'patient_id' ? 'text-sky-200' : 'text-slate-500'}`}>
              Phone / Patient Lookup
            </p>
          </div>
        </button>

        {/* Option 3: New Patient Registration */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('new_patient');
            setGlobalError('');
          }}
          className={`p-5 rounded-3xl font-bold transition-all text-left flex items-center gap-4 ${
            activeTab === 'new_patient'
              ? 'bg-kiosk-navy text-white shadow-lg ring-4 ring-sky-200'
              : 'bg-white text-kiosk-navy border-2 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`p-3 rounded-2xl ${
              activeTab === 'new_patient' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xl font-extrabold">{t.identification.tabNewPatient}</p>
            <p className={`text-xs ${activeTab === 'new_patient' ? 'text-sky-200' : 'text-slate-500'}`}>
              First Time Visit
            </p>
          </div>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-slate-200 shadow-sm mb-6">
        {/* TAB 1: ABHA Flow */}
        {activeTab === 'abha' && (
          <div className="space-y-6">
            {!otpSentData ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                  <ShieldCheck className="w-7 h-7 text-kiosk-blue flex-shrink-0" />
                  <p className="text-base font-semibold text-slate-700">
                    {t.identification.abhaHelper}
                  </p>
                </div>

                <KioskInput
                  label={t.identification.abhaLabel}
                  placeholder={t.identification.abhaPlaceholder}
                  value={abhaInput}
                  onChange={(e) => handleFormatAbhaChange(e.target.value)}
                  icon={<CreditCard className="w-6 h-6" />}
                  helperText="Format: 14 digits (e.g. 91-1234-5678-9012)"
                />

                <div className="pt-2">
                  <KioskButton
                    size="large"
                    onClick={handleRequestAbhaOtp}
                    isLoading={isLoading}
                    icon={<KeyRound className="w-6 h-6" />}
                    className="w-full"
                  >
                    {t.identification.verifyAbhaBtn}
                  </KioskButton>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-bold text-emerald-900">{otpSentData.message}</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      Demo OTP automatically set to: <strong className="text-base">123456</strong>
                    </p>
                  </div>
                </div>

                <KioskInput
                  label={t.identification.otpTitle}
                  placeholder={t.identification.otpPlaceholder}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  icon={<KeyRound className="w-6 h-6" />}
                  helperText={t.identification.otpSubtitle}
                />

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <KioskButton
                    variant="outline"
                    onClick={() => setOtpSentData(null)}
                    className="flex-1"
                  >
                    Change ABHA ID
                  </KioskButton>

                  <KioskButton
                    size="large"
                    onClick={handleVerifyAbhaOtp}
                    isLoading={isLoading}
                    icon={<ChevronRight className="w-7 h-7 stroke-[3]" />}
                    className="flex-1"
                  >
                    {t.identification.verifyOtpBtn}
                  </KioskButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Patient ID / Phone Lookup */}
        {activeTab === 'patient_id' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-base font-semibold text-slate-700">
                Already registered at this hospital? Enter your 10-digit mobile number to pull your medical record.
              </p>
            </div>

            <KioskInput
              label={t.identification.patientIdLabel}
              placeholder={t.identification.patientIdPlaceholder}
              value={phoneLookupInput}
              onChange={(e) => setPhoneLookupInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              icon={<Phone className="w-6 h-6" />}
              helperText="Demo test phone numbers: 9876543210 or 9840123456"
            />

            <div className="pt-2">
              <KioskButton
                size="large"
                onClick={handlePhoneLookup}
                isLoading={isLoading}
                icon={<ChevronRight className="w-7 h-7 stroke-[3]" />}
                className="w-full"
              >
                {t.identification.lookupBtn}
              </KioskButton>
            </div>
          </div>
        )}

        {/* TAB 3: New Patient Registration */}
        {activeTab === 'new_patient' && (
          <form onSubmit={handleRegisterNewPatient} className="space-y-6">
            {/* Full Name */}
            <KioskInput
              label={t.identification.fullNameLabel}
              placeholder={t.identification.fullNamePlaceholder}
              value={regFullName}
              onChange={(e) => {
                setRegFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
              }}
              error={fieldErrors.fullName}
              icon={<User className="w-6 h-6" />}
              required
            />

            {/* Age & Gender Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <KioskInput
                label={t.identification.ageLabel}
                placeholder={t.identification.agePlaceholder}
                type="number"
                min="1"
                max="125"
                value={regAge}
                onChange={(e) => {
                  setRegAge(e.target.value);
                  if (fieldErrors.age) setFieldErrors({ ...fieldErrors, age: '' });
                }}
                error={fieldErrors.age}
                icon={<Calendar className="w-6 h-6" />}
                required
              />

              <div>
                <label className="block text-xl font-bold text-kiosk-navy mb-2.5">
                  {t.identification.genderLabel} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['female', 'male', 'other'] as Gender[]).map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setRegGender(gen)}
                      className={`h-16 rounded-2xl font-bold text-lg transition-all capitalize ${
                        regGender === gen
                          ? 'bg-kiosk-blue text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {gen === 'male'
                        ? t.identification.genderMale
                        : gen === 'female'
                        ? t.identification.genderFemale
                        : t.identification.genderOther}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <KioskInput
              label={t.identification.phoneLabel}
              placeholder={t.identification.phonePlaceholder}
              type="tel"
              value={regPhone}
              onChange={(e) => {
                setRegPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
              }}
              error={fieldErrors.phone}
              icon={<Phone className="w-6 h-6" />}
              required
            />

            {/* Optional ABHA */}
            <KioskInput
              label={`${t.identification.abhaLabel} (Optional)`}
              placeholder="XX-XXXX-XXXX-XXXX"
              value={regAbha}
              onChange={(e) => {
                setRegAbha(MockAbhaService.formatAbha(e.target.value));
                if (fieldErrors.abha) setFieldErrors({ ...fieldErrors, abha: '' });
              }}
              error={fieldErrors.abha}
              icon={<CreditCard className="w-6 h-6" />}
              helperText="Optional: Link your existing ABHA address"
            />

            <div className="pt-4">
              <KioskButton
                type="submit"
                size="large"
                isLoading={isLoading}
                icon={<ChevronRight className="w-7 h-7 stroke-[3]" />}
                className="w-full"
              >
                {t.identification.registerBtn}
              </KioskButton>
            </div>
          </form>
        )}
      </div>

      {/* Demo helper banner */}
      <div className="p-4 bg-slate-200/80 rounded-2xl text-center text-sm font-semibold text-slate-600 mb-6">
        ℹ️ {t.identification.demoNote}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => router.push('/kiosk/language')}
          icon={<ArrowLeft className="w-6 h-6" />}
          iconPosition="left"
        >
          {t.common.back}
        </KioskButton>
      </div>
    </div>
  );
}
