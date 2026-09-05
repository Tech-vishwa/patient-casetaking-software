'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDoctorAuth } from '@/context/DoctorAuthContext';
import { DoctorQueueService } from '@/services/doctorQueueService';
import { DoctorHeader } from '@/components/doctor/DoctorHeader';
import { PatientQueueItem, QueuePriority } from '@/types/doctorQueue';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorQueuePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useDoctorAuth();

  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'normal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'modified'>('all');
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
        statusFilter,
        consultationModeFilter,
      });
      setQueue(items);
    } catch (err) {
      console.error('Error fetching patient queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadQueue();
    }
  }, [isAuthenticated, searchQuery, priorityFilter, statusFilter, consultationModeFilter]);

  const emergencyCount = queue.filter((q) => q.priority === 'critical').length;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-500">Checking physician authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <DoctorHeader emergencyCount={emergencyCount} queueCount={queue.length} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Welcome & Stats Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  Live Intake Feed Active
                </span>
              </div>
              <h1 className="text-3xl font-black text-kiosk-navy tracking-tight">
                Triaged Patient Waiting Queue
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Review preliminary AI intake summaries and medical document extractions prior to consultation.
              </p>
            </div>

            <button
              type="button"
              onClick={loadQueue}
              className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name, ABHA ID, mobile number, or symptom..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-sm font-semibold text-kiosk-navy focus:border-kiosk-blue focus:outline-none transition"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Priority:
              </span>
              {(['all', 'critical', 'high', 'normal'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                    priorityFilter === p
                      ? p === 'critical'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-kiosk-navy text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p === 'all' ? 'All Priorities' : p}
                </button>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setConsultationModeFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'all'
                    ? 'bg-kiosk-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Modes
              </button>
              <button
                type="button"
                onClick={() => setConsultationModeFilter('MODERN_MEDICINE')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'MODERN_MEDICINE'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                🏥 Modern Medicine
              </button>
              <button
                type="button"
                onClick={() => setConsultationModeFilter('AYUSH')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${
                  consultationModeFilter === 'AYUSH'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                🪷 AYUSH
              </button>
            </div>
          </div>

          {/* Queue List Grid */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-slate-200">
              <RefreshCw className="w-8 h-8 text-kiosk-blue animate-spin mx-auto mb-3" />
              <p className="font-bold text-slate-500">Loading intake queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-slate-200 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-kiosk-navy">No Patients Found in Queue</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No patients match the current search filters, or all intake sessions have been completed.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {queue.map((item) => {
                const isCritical = item.priority === 'critical';
                const isHigh = item.priority === 'high';
                const isReviewed = item.reviewStatus !== 'pending';
                const isAyushItem = item.consultationMode === 'AYUSH';

                return (
                  <div
                    key={item.sessionId}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                      isCritical
                        ? 'border-rose-500 ring-4 ring-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-white'
                        : isHigh
                        ? 'border-purple-300'
                        : isAyushItem
                        ? 'border-emerald-200 hover:border-emerald-300'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Patient & Complaint Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          isCritical
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isHigh
                            ? 'bg-purple-600 text-white'
                            : isAyushItem
                            ? 'bg-emerald-600 text-white'
                            : 'bg-kiosk-blue text-white'
                        }`}
                      >
                        {isCritical ? (
                          <AlertOctagon className="w-8 h-8" />
                        ) : isAyushItem ? (
                          <Sparkles className="w-8 h-8" />
                        ) : (
                          <HeartPulse className="w-8 h-8" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-kiosk-navy">
                            {item.fullName}
                          </h3>
                          <span className="text-sm font-bold text-slate-500">
                            ({item.age} yrs • <span className="capitalize">{item.gender}</span>)
                          </span>

                          {/* Consultation Mode Tag */}
                          {isAyushItem ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🪷 AYUSH / Ayurveda
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300">
                              🏥 Modern Medicine
                            </span>
                          )}

                          {/* Priority Pill */}
                          {isCritical && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                              <AlertOctagon className="w-3.5 h-3.5" /> 🔴 CRITICAL EMERGENCY
                            </span>
                          )}
                          {isHigh && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                              🟡 High Priority
                            </span>
                          )}
                          {item.priority === 'normal' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              🟢 Normal
                            </span>
                          )}

                          {isReviewed && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Reviewed ({item.reviewStatus})
                            </span>
                          )}
                        </div>

                        <p className="text-base font-bold text-slate-800">
                          Chief Complaint: <span className="text-kiosk-blue">{item.chiefComplaint}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                          <span className="flex items-center gap-1 text-slate-600 font-bold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Waiting {item.waitingTimeMinutes} mins (Completed at {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>

                          {item.documentCount > 0 && (
                            <span className="flex items-center gap-1 text-purple-700 font-bold">
                              <FileText className="w-3.5 h-3.5" />
                              {item.documentCount} Uploaded Document(s)
                            </span>
                          )}

                          {item.abhaId && (
                            <span className="text-slate-500">
                              ABHA: <strong className="text-slate-700">{item.abhaId}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="self-end lg:self-center">
                      <Link
                        href={`/doctor/patient/${item.sessionId}`}
                        className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition active:scale-95 ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30'
                            : 'bg-kiosk-navy hover:bg-slate-800 text-white'
                        }`}
                      >
                        <span>Open Clinical Summary</span>
                        <ChevronRight className="w-5 h-5 stroke-[3]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400 border-t border-slate-200 mt-12">
        MediKiosk Physician Console • Standard Clinical Safety Protocol Active
      </footer>
    </div>
  );
}
