'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserPlus,
  Phone,
  Lock,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Gender, PreferredLanguage } from '@/types/patient';

export default function PatientRegisterPage() {
  const router = useRouter();
  const { register } = usePatientAuth();
  const { language } = useLanguage();

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [abhaId, setAbhaId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
      setError('Please enter a valid age between 1 and 125.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    const res = await register({
      full_name: fullName.trim(),
      phone: phone.trim(),
      age: parsedAge,
      gender,
      password: password.trim(),
      abha_id: abhaId.trim() || null,
      preferred_language: language,
    });

    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Registration failed.');
      return;
    }

    // Auto-advance sequentially to Consent / Intake
    router.push('/kiosk/consent');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-kiosk-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Login</span>
        </Link>
      </header>

      {/* Registration Card */}
      <main className="max-w-2xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center mx-auto shadow-sm">
              <UserPlus className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-kiosk-navy">Patient Registration</h1>
            <p className="text-sm font-medium text-slate-500">
              Create your MediKiosk account to record your health history and begin intake.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                  required
                />
              </div>
            </div>

            {/* Mobile Number & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Age (Years) *
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-3 rounded-2xl font-bold text-sm capitalize transition border-2 ${
                      gender === g
                        ? 'bg-sky-50 border-kiosk-blue text-kiosk-blue shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional ABHA ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                ABHA ID (Optional - Ayushman Bharat Digital Health Account)
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 91-1234-5678-9012"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 font-bold text-kiosk-navy outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-kiosk-blue to-kiosk-blue-dark hover:from-sky-600 hover:to-kiosk-navy text-white text-lg font-black shadow-kiosk-button transition active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account & Begin Intake</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <Link href="/patient/login" className="font-bold text-kiosk-blue hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="max-w-2xl mx-auto w-full text-center py-4 text-xs font-semibold text-slate-400">
        MediKiosk • Ministry of Ayush Health Kiosk System
      </footer>
    </div>
  );
}
