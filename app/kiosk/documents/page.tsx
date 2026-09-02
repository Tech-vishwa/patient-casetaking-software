'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { DocumentProcessingService } from '@/services/documentProcessingService';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { DocumentUploadZone } from '@/components/kiosk/DocumentUploadZone';
import { DocumentCard } from '@/components/kiosk/DocumentCard';
import { MedicalTimeline } from '@/components/kiosk/MedicalTimeline';
import { KioskButton } from '@/components/kiosk/KioskButton';
import { AudioPromptButton } from '@/components/kiosk/AudioPromptButton';
import { KioskProgress } from '@/components/kiosk/KioskProgress';
import { MedicalDocument, MedicalDocumentType } from '@/types/document';
import { ArrowLeft, ChevronRight, FileText, Sparkles, AlertCircle } from 'lucide-react';

export default function MedicalDocumentsPage() {
  const router = useRouter();
  const { t, speakText } = useLanguage();
  const { patient, session, consent, isLoading: sessionLoading, advanceSessionStep } = usePatientSession();

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  // Load existing session documents
  useEffect(() => {
    if (session) {
      DocumentProcessingService.getSessionDocuments(session.id).then((docs) => {
        setDocuments(docs);
      });
    }
  }, [session]);

  const handleFileSelected = async (file: File, docType: MedicalDocumentType) => {
    if (!session || !patient) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      // Execute document processing pipeline (Validation -> OCR -> Entity Extraction -> DB)
      const result = await DocumentProcessingService.processDocument({
        patientId: patient.id,
        intakeSessionId: session.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'image/jpeg',
        fileUrl: URL.createObjectURL(file),
        documentType: docType,
      });

      // Update local state with new processed document
      setDocuments((prev) => [result.document, ...prev.filter((d) => d.id !== result.document.id)]);
      speakText(`${docType.replace('_', ' ')} processed successfully.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process medical document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    await DocumentProcessingService.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDateChange = async (docId: string, newDate?: string | null) => {
    if (!newDate) return;
    const updated = await DocumentProcessingService.updateDocumentDate(docId, newDate);
    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    }
  };

  const handleProceedToSummary = async () => {
    if (session) {
      await IntakeSessionService.updateProgress(session.id, 3, 'summary_ready');
      await advanceSessionStep(3);
    }
    router.push('/kiosk/summary');
  };

  if (sessionLoading || !patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-500">{t.common.loading}</p>
      </div>
    );
  }

  const narration = `${t.documents.title}. ${t.documents.subtitle}.`;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full py-4 space-y-6">
      {/* Progress Tracker */}
      <KioskProgress currentStep={5} />

      {/* Screen Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kiosk-blue" />
            <span>Step 2 of 3 • Document Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-kiosk-navy tracking-tight">
            {t.documents.title}
          </h1>
          <p className="text-lg text-slate-600 font-medium mt-1">
            {t.documents.subtitle}
          </p>
        </div>

        <AudioPromptButton textToSpeak={narration} />
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-800 font-bold flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Document Upload Area */}
      <DocumentUploadZone
        onFileSelected={handleFileSelected}
        disabled={isUploading}
      />

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-kiosk-navy flex items-center gap-2">
            <FileText className="w-6 h-6 text-kiosk-blue" />
            <span>{t.documents.uploadedDocsTitle} ({documents.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
                onEditDate={handleDateChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Chronological Medical Timeline */}
      {documents.length > 0 && (
        <MedicalTimeline
          documents={documents}
          onDateChange={handleDateChange}
        />
      )}

      {/* Footer Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <KioskButton
          variant="outline"
          size="default"
          onClick={() => router.push('/kiosk/dashboard')}
          icon={<ArrowLeft className="w-6 h-6" />}
          iconPosition="left"
        >
          {t.common.back}
        </KioskButton>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {documents.length === 0 && (
            <KioskButton
              variant="outline"
              size="default"
              onClick={handleProceedToSummary}
            >
              {t.documents.skipDocuments}
            </KioskButton>
          )}

          <KioskButton
            size="huge"
            variant="primary"
            onClick={handleProceedToSummary}
            icon={<ChevronRight className="w-8 h-8 stroke-[3]" />}
            className="flex-1 sm:flex-initial min-w-[320px]"
          >
            {t.documents.proceedToSummary}
          </KioskButton>
        </div>
      </div>
    </div>
  );
}
