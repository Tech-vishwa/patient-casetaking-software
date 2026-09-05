'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  User,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  ShieldCheck,
  Activity,
  ArrowLeft,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function PatientLoginPage() {
  const router = useRouter();
  const { login, resumeSession, startNewSession, patient, incompleteSession, hasIncompleteSession } = usePatientAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your registered 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await login(phone, password || undefined);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Login failed. Please check your credentials.');
      return;
    }

    if (res.hasIncomplete) {
      setShowIncompleteModal(true);
    } else {
      router.push('/patient/dashboard');
    }
  };

  const handleQuickLogin = async (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword('123456');
    setIsLoading(true);
    setError('');

    const res = await login(demoPhone, '123456');
    setIsLoading(false);

    if (res.success) {
      if (res.hasIncomplete) {
        setShowIncompleteModal(true);
      } else {
        router.push('/patient/dashboard');
      }
    }
  };

  const handleResume = async () => {
    setShowIncompleteModal(false);
    const route = await resumeSession();
    router.push(route);
  };

  const handleStartFresh = async () => {
    setShowIncompleteModal(false);
    const route = await startNewSession();
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-kiosk-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Portal</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center mx-auto shadow-sm">
              <User className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black text-kiosk-navy">Patient Login</h1>
            <p className="text-sm font-medium text-slate-500">
              Enter your mobile number to access your self-service intake and records.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 text-lg font-bold text-kiosk-navy outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <span className="text-xs font-semibold text-slate-400">Default demo: 123456</span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-kiosk-blue focus:ring-4 focus:ring-sky-100 text-lg font-bold text-kiosk-navy outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-kiosk-blue to-kiosk-blue-dark hover:from-sky-600 hover:to-kiosk-navy text-white text-lg font-black shadow-kiosk-button transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In to Intake</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins for Judges/Evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Demo Accounts (1-Click Login)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('9876543210')}
                className="p-3 text-left bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-kiosk-blue transition"
              >
                <div>Rajesh Sharma (Chest Emergency)</div>
                <div className="text-[10px] text-slate-400 font-normal">9876543210</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('9840123456')}
                className="p-3 text-left bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-kiosk-blue transition"
              >
                <div>Kavitha R. (Diabetic Followup)</div>
                <div className="text-[10px] text-slate-400 font-normal">9840123456</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm font-medium text-slate-600">
              Do not have an account?{' '}
              <Link href="/patient/register" className="font-bold text-kiosk-blue hover:underline">
                Register New Patient
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Incomplete Session Prompt Modal */}
      {showIncompleteModal && (
        <div
          onClick={() => setShowIncompleteModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-sky-300 space-y-6 cursor-default"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowIncompleteModal(false)}
              aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-kiosk-blue flex items-center justify-center flex-shrink-0">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-kiosk-navy">
                  Welcome back, {patient?.full_name}!
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  You have an incomplete health intake session from your earlier visit.
                </p>
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sm font-semibold text-sky-900">
              Current Stage:{' '}
              <strong className="uppercase">{incompleteSession?.workflow_state || 'In Progress'}</strong>
              <div className="text-xs text-slate-500 mt-1">
                Started: {new Date(incompleteSession?.started_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleStartFresh}
                className="flex-1 py-3.5 px-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start New Session</span>
              </button>

              <button
                type="button"
                onClick={handleResume}
                className="flex-1 py-3.5 px-4 rounded-xl bg-kiosk-blue hover:bg-kiosk-navy text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resume Previous Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center py-4 text-xs font-semibold text-slate-400">
        MediKiosk Patient Authentication • Secure ABHA Integration
      </footer>
    </div>
  );
}
