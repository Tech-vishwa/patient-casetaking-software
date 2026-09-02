'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDoctorAuth } from '@/context/DoctorAuthContext';
import { DoctorHeader } from '@/components/doctor/DoctorHeader';
import { RedFlagAlertBanner } from '@/components/doctor/RedFlagAlertBanner';
import { ChatHistoryDrawer } from '@/components/doctor/ChatHistoryDrawer';
import { DocumentViewerModal } from '@/components/doctor/DocumentViewerModal';
import { FhirViewerModal } from '@/components/doctor/FhirViewerModal';
import { AbnormalValueBadge } from '@/components/kiosk/AbnormalValueBadge';
import { mockDb } from '@/lib/supabase/mockDb';
import { DoctorReviewService } from '@/services/doctorReviewService';
import { HospitalIntegrationService } from '@/services/hospitalIntegrationService';
import { FHIRMapperService } from '@/services/fhirMapperService';
import { Patient } from '@/types/patient';
import { IntakeSession } from '@/types/intakeSession';
import { StructuredClinicalSummary, ClinicalSummaryStructured } from '@/types/summary';
import { RedFlagAlert, ConversationMessage } from '@/types/clinical';
import { MedicalDocument } from '@/types/document';
import { SummaryReview } from '@/types/review';
import { FHIRBundle, HISSyncResult } from '@/types/integration';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  XCircle,
  MessageSquare,
  FileText,
  FileCode2,
  Share2,
  Save,
  AlertTriangle,
  Hospital,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function DoctorPatientWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useDoctorAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [existingReview, setExistingReview] = useState<SummaryReview | null>(null);

  // Doctor Edit Mode State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedStructured, setEditedStructured] = useState<ClinicalSummaryStructured | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // Modals & Drawers
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState<boolean>(false);
  const [isFhirModalOpen, setIsFhirModalOpen] = useState<boolean>(false);
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);

  // Sync & Action States
  const [isSyncingHis, setIsSyncingHis] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<HISSyncResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/doctor/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Session Data
  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    const sess = await mockDb.getIntakeSessionById(sessionId);
    if (!sess) return;
    setSession(sess);

    const pat = await mockDb.getPatientById(sess.patient_id);
    setPatient(pat);

    const sum = await mockDb.getClinicalSummaryBySession(sessionId);
    if (sum) {
      setSummary(sum);
      setEditedStructured(JSON.parse(JSON.stringify(sum.structured_summary)));
    }

    const rfs = await mockDb.getRedFlagsBySession(sessionId);
    setRedFlags(rfs);

    const msgs = await mockDb.getConversationMessages(sessionId);
    setMessages(msgs);

    const docs = await mockDb.getMedicalDocumentsBySession(sessionId);
    setDocuments(docs);

    const rev = await mockDb.getSummaryReviewBySession(sessionId);
    if (rev) {
      setExistingReview(rev);
      setDoctorNotes(rev.doctor_notes || '');
      setEditedStructured(rev.edited_summary);
    }
  };

  // Generate FHIR Bundle for viewing
  const handleOpenFhirModal = () => {
    if (patient && session && (editedStructured || summary?.structured_summary)) {
      const bundle = FHIRMapperService.generateFHIRBundle(
        patient,
        session,
        editedStructured || summary!.structured_summary,
        documents
      );
      setFhirBundle(bundle);
      setIsFhirModalOpen(true);
    }
  };

  // Approve Summary
  const handleApprove = async () => {
    if (!session || !patient || !summary || !user) return;
    setIsSaving(true);
    try {
      const review = await DoctorReviewService.submitReview({
        intakeSessionId: session.id,
        patientId: patient.id,
        doctorId: user.id,
        doctorName: user.full_name,
        originalSummary: summary.structured_summary,
        editedSummary: editedStructured || summary.structured_summary,
        reviewStatus: 'approved',
        doctorNotes,
      });
      setExistingReview(review);
      setIsEditing(false);
      setSaveSuccessMsg('Clinical Summary Approved by Physician.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Doctor Modifications
  const handleSaveEdits = async () => {
    if (!session || !patient || !summary || !user || !editedStructured) return;
    setIsSaving(true);
    try {
      const review = await DoctorReviewService.submitReview({
        intakeSessionId: session.id,
        patientId: patient.id,
        doctorId: user.id,
        doctorName: user.full_name,
        originalSummary: summary.structured_summary,
        editedSummary: editedStructured,
        reviewStatus: 'modified',
        doctorNotes,
      });
      setExistingReview(review);
      setIsEditing(false);
      setSaveSuccessMsg('Doctor modifications saved in new version. Original AI draft preserved.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reject / Request Re-intake
  const handleReject = async () => {
    if (!session || !patient || !summary || !user) return;
    if (!confirm('Are you sure you wish to reject this summary and request a new intake?')) return;
    setIsSaving(true);
    try {
      const review = await DoctorReviewService.submitReview({
        intakeSessionId: session.id,
        patientId: patient.id,
        doctorId: user.id,
        doctorName: user.full_name,
        originalSummary: summary.structured_summary,
        editedSummary: editedStructured || summary.structured_summary,
        reviewStatus: 'rejected',
        doctorNotes,
      });
      setExistingReview(review);
      setSaveSuccessMsg('Intake summary marked rejected.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Transmit to Hospital HIS
  const handleSyncHis = async () => {
    if (!session || !summary) return;
    setIsSyncingHis(true);
    try {
      const res = await HospitalIntegrationService.pushClinicalSummary(
        session.id,
        editedStructured || summary.structured_summary
      );
      setSyncResult(res);
    } finally {
      setIsSyncingHis(false);
    }
  };

  if (!patient || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-bold text-slate-500">Loading patient clinical workspace...</p>
      </div>
    );
  }

  const structured = editedStructured || summary.structured_summary;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <DoctorHeader queueCount={1} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Top Return & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/doctor/queue"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-kiosk-blue transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Queue</span>
            </Link>

            <div className="flex items-center gap-3">
              {existingReview && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Reviewed by {existingReview.doctor_name} ({existingReview.review_status})
                </span>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 font-bold text-sm flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Red Flag Alert Banner */}
          {redFlags.length > 0 && <RedFlagAlertBanner alerts={redFlags} />}

          {/* Patient Profile Strip */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-kiosk-blue text-white flex items-center justify-center font-black text-2xl shadow-md">
                {patient.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-kiosk-navy">
                  {patient.full_name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                  <span>{patient.age} Years • <span className="capitalize">{patient.gender}</span></span>
                  <span>• Mobile: +91 {patient.phone}</span>
                  {patient.abha_id && <span>• ABHA: <strong className="text-kiosk-blue">{patient.abha_id}</strong></span>}
                </div>
              </div>
            </div>

            {/* Quick Inspection Drawers Triggers */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition"
              >
                <MessageSquare className="w-4 h-4 text-kiosk-blue" />
                <span>Original Conversation ({messages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDocViewerOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-2 border border-purple-200 transition"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Medical Documents ({documents.length})</span>
              </button>

              <button
                type="button"
                onClick={handleOpenFhirModal}
                className="px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-2 border border-sky-200 transition"
              >
                <FileCode2 className="w-4 h-4 text-sky-600" />
                <span>View FHIR Bundle</span>
              </button>
            </div>
          </div>

          {/* AI Clinical Draft Notice */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>AI-generated draft — requires physician verification before prescription or clinical orders.</span>
            </span>
            <span className="text-[11px] uppercase tracking-wider text-amber-700 font-black">
              Version {summary.version}
            </span>
          </div>

          {/* 11-Section Unified Clinical Summary (Read / Live Edit Mode) */}
          <div className="space-y-5">
            {/* Grid of Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Chief Complaint */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Chief Complaint</h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={structured.chief_complaint}
                    onChange={(e) =>
                      setEditedStructured({ ...structured, chief_complaint: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border-2 border-kiosk-blue text-lg font-bold text-kiosk-navy"
                  />
                ) : (
                  <p className="text-xl font-black text-kiosk-navy">{structured.chief_complaint}</p>
                )}
              </div>

              {/* 2. HPI */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">2. History of Present Illness</h3>
                </div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={structured.history_of_present_illness}
                    onChange={(e) =>
                      setEditedStructured({ ...structured, history_of_present_illness: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border-2 border-kiosk-blue text-sm font-semibold text-slate-800"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                    {structured.history_of_present_illness}
                  </p>
                )}
              </div>

              {/* 3. Past Medical History */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">3. Past Medical History</h3>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={structured.past_medical_history.join('\n')}
                    onChange={(e) =>
                      setEditedStructured({
                        ...structured,
                        past_medical_history: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full p-3 rounded-xl border-2 border-kiosk-blue text-xs font-semibold text-slate-800"
                  />
                ) : (
                  <div className="space-y-1 text-sm font-semibold text-slate-800">
                    {structured.past_medical_history.map((pmh, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-xl">
                        {pmh}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Past Surgical History */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">4. Past Surgical History</h3>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={structured.past_surgical_history.join('\n')}
                    onChange={(e) =>
                      setEditedStructured({
                        ...structured,
                        past_surgical_history: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full p-3 rounded-xl border-2 border-kiosk-blue text-xs font-semibold text-slate-800"
                  />
                ) : (
                  <div className="space-y-1 text-sm font-semibold text-slate-800">
                    {structured.past_surgical_history.map((surg, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-xl">
                        {surg}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Current Medications */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">5. Current Medications & Prescriptions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {structured.current_medications.map((med, i) => (
                    <div key={i} className="p-3 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold">{med.name} {med.dosage || ''}</p>
                        <p className="text-emerald-700">{med.frequency || 'Rx'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white text-emerald-800 text-[10px] uppercase font-black">
                        {med.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Allergies & 7. Family */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 mb-2">6. Allergies & Sensitivities</h3>
                  <div className="space-y-1 text-xs font-semibold text-slate-800">
                    {structured.allergies.map((a, i) => (
                      <p key={i} className="p-2 bg-rose-50 text-rose-900 rounded-xl">
                        {a.allergen}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 mb-2">7. Family Health History</h3>
                  <div className="space-y-1 text-xs font-semibold text-slate-800">
                    {structured.family_history.map((f, i) => (
                      <p key={i} className="p-2 bg-amber-50 text-amber-950 rounded-xl">
                        {f}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* 8. Personal History & 9. Systems */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">8. Lifestyle & Habits</h3>
                  <div className="space-y-1 text-xs font-semibold text-slate-800">
                    {structured.personal_history.map((p, i) => (
                      <p key={i} className="p-2 bg-slate-50 rounded-xl">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">9. Review of Systems</h3>
                  <div className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-2xl space-y-1">
                    {Object.entries(structured.review_of_systems || {}).map(([sys, note]) => (
                      <p key={sys}>
                        <strong className="capitalize">{sys}:</strong> {note as string}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10. Prior Investigations */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-3 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">10. Prior Investigations & Lab Tests</h3>
                {structured.prior_investigations && structured.prior_investigations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {structured.prior_investigations.map((inv, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          inv.isAbnormal
                            ? 'bg-rose-50 border-rose-300 text-rose-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm">{inv.test}</p>
                          <p className="text-xs text-slate-500">
                            Observed: <strong className="text-kiosk-navy">{inv.result} {inv.unit || ''}</strong> (Ref: {inv.referenceRange || 'N/A'})
                          </p>
                        </div>
                        {inv.isAbnormal && <AbnormalValueBadge />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No laboratory test values recorded.</p>
                )}
              </div>
            </div>

            {/* Doctor Clinical Notes */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                Doctor Consultation Notes / Clinical Impression:
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter attending doctor diagnosis, clinical notes, and physical examination findings here..."
                className="w-full p-4 rounded-2xl border-2 border-slate-300 text-sm font-semibold text-kiosk-navy focus:border-kiosk-blue focus:outline-none transition"
              />
            </div>
          </div>

          {/* Action Bar (Approve, Edit, Reject, Sync HIS) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 transition active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Summary Sections</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  disabled={isSaving}
                  className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Doctor Edits'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReject}
                disabled={isSaving}
                className="px-4 py-3 rounded-2xl text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSyncHis}
                disabled={isSyncingHis}
                className="px-5 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
              >
                <Hospital className="w-4 h-4" />
                <span>{isSyncingHis ? 'Transmitting to EMR...' : 'Push to Hospital HIS'}</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isSaving}
                className="flex-1 md:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSaving ? 'Approving...' : 'Approve Summary'}</span>
              </button>
            </div>
          </div>

          {/* Sync Success Modal/Notification */}
          {syncResult && (
            <div className="p-5 rounded-3xl bg-purple-50 border-2 border-purple-300 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>{syncResult.message}</span>
              </div>
              <p className="text-xs text-purple-700">
                Transaction Ref: <strong className="font-mono">{syncResult.external_id}</strong> • Timestamp: {syncResult.synced_at}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Conversation Transcript */}
      <ChatHistoryDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        messages={messages}
        patientName={patient.full_name}
      />

      {/* Document Inspector Modal */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        documents={documents}
      />

      {/* FHIR Bundle JSON Viewer */}
      {fhirBundle && (
        <FhirViewerModal
          bundle={fhirBundle}
          isOpen={isFhirModalOpen}
          onClose={() => setIsFhirModalOpen(false)}
        />
      )}
    </div>
  );
}
