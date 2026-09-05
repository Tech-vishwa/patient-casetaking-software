'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorAuth } from '@/context/DoctorAuthContext';
import { DoctorQueueService } from '@/services/doctorQueueService';
import { PatientQueueItem, QueuePriority } from '@/types/doctorQueue';
import {
  Stethoscope,
  Users,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  LogOut,
  RefreshCw,
  AlertOctagon,
  Sparkles,
  HeartPulse,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useDoctorAuth();

  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'normal'>('all');
  const [consultationModeFilter, setConsultationModeFilter] = useState<'all' | 'MODERN_MEDICINE' | 'AYUSH'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/doctor/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const items = await DoctorQueueService.getQueue({
        searchQuery,
        priorityFilter,
        consultationModeFilter,
      });
      setQueue(items);
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadQueue();
    }
  }, [isAuthenticated, searchQuery, priorityFilter, consultationModeFilter]);

  const handleLogout = () => {
    logout();
    router.push('/doctor/login');
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-500">Checking physician credentials...</p>
      </div>
    );
  }

  const criticalCount = queue.filter((q) => q.priority === 'critical').length;
  const highCount = queue.filter((q) => q.priority === 'high').length;
  const normalCount = queue.filter((q) => q.priority === 'normal').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Doctor Dashboard Header */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Stethoscope className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-kiosk-navy tracking-tight">DOCTOR DASHBOARD</h1>
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Physician Workstation
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500">
                {user.hospital_name || 'District Government Hospital'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-kiosk-navy">{user.full_name}</p>
              <p className="text-xs font-semibold text-slate-500">{user.department}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-bold transition shadow-sm"
              title="Logout from Physician Desk"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Welcome & Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-kiosk-navy to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Patient Intake Queue</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Dr. {user.full_name.replace('Dr. ', '')} — {user.department}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl font-medium">
              Review completed AI patient intake summaries and digitized medical documents prior to consultation.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-center">
              <div className="text-2xl font-black text-rose-400">{criticalCount}</div>
              <div className="text-[11px] font-bold text-rose-200 uppercase">Emergency</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-center">
              <div className="text-2xl font-black text-amber-400">{highCount}</div>
              <div className="text-[11px] font-bold text-amber-200 uppercase">High Priority</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-700/50 border border-slate-600 text-center">
              <div className="text-2xl font-black text-white">{queue.length}</div>
              <div className="text-[11px] font-bold text-slate-300 uppercase">Total in Queue</div>
            </div>
          </div>
        </div>

        {/* Search and Priority Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by name or complaint..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-kiosk-navy placeholder:text-slate-400 focus:border-emerald-600 outline-none"
              />
            </div>

            {/* Priority Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              <button
                type="button"
                onClick={() => setPriorityFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  priorityFilter === 'all'
                    ? 'bg-kiosk-navy text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Patients ({queue.length})
              </button>

              <button
                type="button"
                onClick={() => setPriorityFilter('critical')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  priorityFilter === 'critical'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>🔴 Critical / Red Flag ({criticalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPriorityFilter('high')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  priorityFilter === 'high'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                <span>🟡 High Priority ({highCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPriorityFilter('normal')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  priorityFilter === 'normal'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>Normal Queue ({normalCount})</span>
              </button>

              {/* Consultation Mode Filter Tabs */}
              <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={() => setConsultationModeFilter('all')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'all'
                    ? 'bg-kiosk-navy text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Modes
              </button>

              <button
                type="button"
                onClick={() => setConsultationModeFilter('MODERN_MEDICINE')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'MODERN_MEDICINE'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                }`}
              >
                🏥 Modern Medicine
              </button>

              <button
                type="button"
                onClick={() => setConsultationModeFilter('AYUSH')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'AYUSH'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                🪷 AYUSH / Ayurveda
              </button>

              <button
                type="button"
                onClick={loadQueue}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition ml-auto"
                title="Refresh Queue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Patient Queue Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-kiosk-navy">
              Patients Ready for Review (Sorted: 1. Emergency Red Flag, 2. High Priority, 3. Normal Queue)
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              Showing {queue.length} patients
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-slate-200">
              <RefreshCw className="w-8 h-8 text-kiosk-blue animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500">Loading triaged patients...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-slate-200 space-y-2">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-lg font-bold text-kiosk-navy">No Patients in this Queue</h4>
              <p className="text-sm text-slate-500">
                Patients will appear here automatically as they finish their self-service kiosk intake.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {queue.map((item) => {
                const isCritical = item.priority === 'critical';
                const isHigh = item.priority === 'high';
                const isAyushItem = item.consultationMode === 'AYUSH';

                return (
                  <div
                    key={item.sessionId}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                      isCritical
                        ? 'border-rose-300 ring-4 ring-rose-50 bg-rose-50/20'
                        : isHigh
                        ? 'border-amber-300'
                        : isAyushItem
                        ? 'border-emerald-200 hover:border-emerald-400'
                        : 'border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {/* Left: Patient Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-2xl font-black text-kiosk-navy">
                          {item.fullName}
                        </h4>
                        <span className="text-sm font-bold text-slate-600 px-3 py-0.5 rounded-full bg-slate-100">
                          {item.age} Years | <span className="capitalize">{item.gender}</span>
                        </span>

                        {/* Consultation Mode Tag */}
                        {isAyushItem ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs">
                            🪷 AYUSH / Ayurveda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black text-xs">
                            🏥 Modern Medicine
                          </span>
                        )}

                        {/* Priority Badge */}
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-sm animate-pulse">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            🔴 EMERGENCY RED FLAG
                          </span>
                        ) : isHigh ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs uppercase">
                            🟡 HIGH PRIORITY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                            🟢 Normal Queue
                          </span>
                        )}

                        {item.reviewStatus === 'approved' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                            Approved ✓
                          </span>
                        )}
                        {item.reviewStatus === 'modified' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-black border border-sky-300">
                            Modified ✎
                          </span>
                        )}
                      </div>

                      {/* Chief Complaint */}
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                          Chief Complaint:
                        </div>
                        <div className="text-lg font-bold text-slate-800">
                          {item.chiefComplaint}
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Waiting: <strong>{item.waitingTimeMinutes} mins</strong></span>
                        </div>

                        {item.documentCount > 0 && (
                          <div className="flex items-center gap-1 text-sky-700">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{item.documentCount} Document(s) Attached</span>
                          </div>
                        )}

                        {item.abhaId && (
                          <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                            ABHA: {item.abhaId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Review Action Button */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/doctor/patient/${item.sessionId}`}
                        className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                            : 'bg-kiosk-blue hover:bg-kiosk-navy text-white shadow-sky-500/20'
                        }`}
                      >
                        <span>Review Patient</span>
                        <ChevronRight className="w-5 h-5 stroke-[3]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200 text-xs font-medium text-slate-400 flex items-center justify-between">
        <span>MediKiosk Physician Workstation • Role: Doctor</span>
        <span>ABDM Compliant • FHIR R4 Integration Ready</span>
      </footer>
    </div>
  );
}
