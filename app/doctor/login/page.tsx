'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorAuth } from '@/context/DoctorAuthContext';
import { Stethoscope, Lock, Mail, ShieldCheck, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function DoctorLoginPage() {
  const router = useRouter();
  const { login, quickLogin, isAuthenticated } = useDoctorAuth();

  const [email, setEmail] = useState<string>('doctor@ayushman.gov.in');
  const [pin, setPin] = useState<string>('1234');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await login(email, pin);
      if (res.success) {
        router.push('/doctor/dashboard');
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'doctor' | 'admin') => {
    setIsLoading(true);
    await quickLogin(role);
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/doctor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-kiosk-navy to-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center shadow-lg">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              MediKiosk <span className="text-sky-400 font-bold">Physician Portal</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Ayushman Hospital & Research Centre • Clinical Desk
            </p>
          </div>
        </div>

        <Link
          href="/kiosk/welcome"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
        >
          ← Return to Patient Terminal
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 text-kiosk-blue border-2 border-sky-200 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-kiosk-navy">Doctor / Staff Sign In</h2>
            <p className="text-xs text-slate-500 font-medium">
              Access the clinical review desk, triaged patient queue, and EMR integration.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Hospital Email / Doctor ID
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@ayushman.gov.in"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 text-sm font-bold text-kiosk-navy focus:border-kiosk-blue focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Demo PIN: 1234"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 text-sm font-bold text-kiosk-navy focus:border-kiosk-blue focus:outline-none transition tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-kiosk-blue hover:bg-sky-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-98 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Doctor Desk'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              ⚡ 1-Click Demo Logins for Evaluators:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('doctor')}
                className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-kiosk-blue text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Doctor Mode</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 font-semibold">
        MediKiosk Physician Subsystem • Compliant with ABDM & NDHM Healthcare Standards
      </div>
    </div>
  );
}
