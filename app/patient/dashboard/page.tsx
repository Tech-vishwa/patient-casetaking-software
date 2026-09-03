'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { mockDb } from '@/lib/supabase/mockDb';
import { WorkflowStateMachine } from '@/services/workflowStateMachine';
import {
  User,
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  LogOut,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const router = useRouter();
  const { patient, session, logout, resumeSession, startNewSession, isAuthenticated, isLoading: authLoading } = usePatientAuth();
  const { setPatient, setSession } = usePatientSession();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/patient/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Consultation History
  useEffect(() => {
    if (patient) {
      setPatient(patient);
      if (session) setSession(session);

      mockDb.getPatientConsultationHistory(patient.id).then((history) => {
        setConsultations(history);
        setIsLoadingHistory(false);
      });
    }
  }, [patient, session]);

  if (authLoading || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-500">Loading patient portal...</p>
      </div>
    );
  }

  // Derive stage status from session
  const workflowState = session?.workflow_state || 'ONBOARDING';

  const isConversationComplete = [
    'HISTORY_COMPLETED',
    'DOCUMENTS_IN_PROGRESS',
    'DOCUMENTS_COMPLETED',
    'SUMMARY_READY',
    'PATIENT_CONFIRMED',
    'DOCTOR_REVIEW',
    'COMPLETED',
  ].includes(workflowState);

  const isDocumentsComplete = [
    'DOCUMENTS_COMPLETED',
    'SUMMARY_READY',
    'PATIENT_CONFIRMED',
    'DOCTOR_REVIEW',
    'COMPLETED',
  ].includes(workflowState);

  const isSummaryComplete = [
    'SUMMARY_READY',
    'PATIENT_CONFIRMED',
    'DOCTOR_REVIEW',
    'COMPLETED',
  ].includes(workflowState);

  const handleResume = async () => {
    const route = await resumeSession();
    router.push(route);
  };

  const handleStartFresh = async () => {
    const route = await startNewSession();
    router.push(route);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kiosk-blue text-white flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-kiosk-navy">MediKiosk Patient Portal</h1>
              <p className="text-xs font-semibold text-slate-500">Government Health Kiosk Network</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-black text-kiosk-navy">{patient.full_name}</div>
              <div className="text-xs text-slate-400 font-semibold">{patient.phone}</div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-kiosk-navy to-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Patient Health Dashboard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome, {patient.full_name}
            </h2>
            <p className="text-slate-300 text-base max-w-xl">
              Age: <strong>{patient.age} yrs</strong> • Gender: <strong className="capitalize">{patient.gender}</strong>
              {patient.abha_id && ` • ABHA: ${patient.abha_id}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {session && session.status !== 'completed' ? (
              <button
                type="button"
                onClick={handleResume}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-kiosk-blue to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Resume Active Intake</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-kiosk-blue to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-black text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" />
                <span>Start New Clinical Intake</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Intake Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-kiosk-navy">Current Intake Status</h3>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 text-sky-800">
              {session?.status === 'completed' ? 'Intake Complete' : 'Active Session'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Health Conversation */}
            <div className="p-5 rounded-2xl border-2 bg-slate-50/70 border-slate-200 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Module 1
                </div>
                <div className="text-lg font-bold text-kiosk-navy">Health Conversation</div>
                <div className="text-xs text-slate-500 mt-1">Symptom Interview & Triage</div>
              </div>
              <div>
                {isConversationComplete ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : workflowState === 'HISTORY_IN_PROGRESS' ? (
                  <span className="inline-flex items-center gap-1 text-sky-600 font-black text-sm bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    <Clock className="w-4 h-4 animate-spin" /> In Progress
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold text-sm">⏳ Pending</span>
                )}
              </div>
            </div>

            {/* Step 2: Medical Documents */}
            <div className="p-5 rounded-2xl border-2 bg-slate-50/70 border-slate-200 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Module 2
                </div>
                <div className="text-lg font-bold text-kiosk-navy">Medical Documents</div>
                <div className="text-xs text-slate-500 mt-1">Prescriptions & Lab OCR</div>
              </div>
              <div>
                {isDocumentsComplete ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : workflowState === 'DOCUMENTS_IN_PROGRESS' ? (
                  <span className="inline-flex items-center gap-1 text-sky-600 font-black text-sm bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    <Clock className="w-4 h-4 animate-spin" /> In Progress
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold text-sm">⏳ Pending</span>
                )}
              </div>
            </div>

            {/* Step 3: Clinical Summary */}
            <div className="p-5 rounded-2xl border-2 bg-slate-50/70 border-slate-200 flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Module 3
                </div>
                <div className="text-lg font-bold text-kiosk-navy">Clinical Summary</div>
                <div className="text-xs text-slate-500 mt-1">11-Section Unified Record</div>
              </div>
              <div>
                {isSummaryComplete ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Ready for Doctor
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold text-sm">⏳ Pending</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium">
              You can resume your intake session at any time without losing any recorded answers or documents.
            </p>
            <button
              type="button"
              onClick={handleResume}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-kiosk-blue hover:bg-kiosk-navy text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
            >
              <span>Resume Intake →</span>
            </button>
          </div>
        </div>

        {/* Previous Consultations History */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-4">
          <h3 className="text-2xl font-black text-kiosk-navy">Past Consultations & Visits</h3>

          {isLoadingHistory ? (
            <p className="text-sm font-semibold text-slate-400">Loading consultation records...</p>
          ) : consultations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-bold text-slate-600">No previous consultations recorded.</p>
              <p className="text-xs text-slate-400 mt-1">Your completed clinical intake summaries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c, idx) => (
                <div
                  key={c.sessionId || idx}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-sky-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                        {new Date(c.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-kiosk-navy">{c.chiefComplaint}</h4>
                    <p className="text-xs text-slate-500 font-medium">Physician: {c.doctorName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        c.reviewStatus === 'approved' || c.reviewStatus === 'modified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {c.reviewStatus === 'approved' ? 'Doctor Verified' : c.reviewStatus === 'modified' ? 'Doctor Modified' : 'Pending Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-4 border-t border-slate-200 text-xs font-semibold text-slate-400 flex items-center justify-between">
        <span>MediKiosk Patient Dashboard</span>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Session</span>
        </div>
      </footer>
    </div>
  );
}
