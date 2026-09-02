'use client';

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCheck2,
  Calendar,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Pill,
  Activity,
  Scissors,
} from 'lucide-react';
import { MedicalDocument } from '@/types/document';
import { useLanguage } from '@/context/LanguageContext';
import { AbnormalValueBadge } from './AbnormalValueBadge';

interface DocumentCardProps {
  document: MedicalDocument;
  onDelete: (id: string) => void;
  onEditDate?: (id: string, currentDate?: string | null) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDelete,
  onEditDate,
}) => {
  const { t } = useLanguage();

  const isCompleted = document.processing_status === 'completed';
  const isProcessing = document.processing_status === 'processing' || document.processing_status === 'uploading';
  const isFailed = document.processing_status === 'failed';

  const typeIcons: Record<string, React.ReactNode> = {
    prescription: <Pill className="w-6 h-6 text-sky-600" />,
    lab_report: <Activity className="w-6 h-6 text-emerald-600" />,
    discharge_summary: <FileSpreadsheet className="w-6 h-6 text-purple-600" />,
    other: <FileText className="w-6 h-6 text-slate-600" />,
  };

  const typeLabels: Record<string, string> = {
    prescription: t.documents.typePrescription,
    lab_report: t.documents.typeLabReport,
    discharge_summary: t.documents.typeDischargeSummary,
    other: t.documents.typeOther,
  };

  const extraction = document.extraction;
  const hasAbnormalLabs = extraction?.labResults?.some((l) => l.isOutsideRange);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
            {typeIcons[document.document_type] || <FileText className="w-6 h-6 text-slate-600" />}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
              {typeLabels[document.document_type] || document.document_type}
            </span>
            <h4 className="text-lg font-bold text-kiosk-navy truncate max-w-[220px] sm:max-w-[280px] mt-0.5">
              {document.file_name}
            </h4>
          </div>
        </div>

        {/* Processing Status Badge */}
        <div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t.documents.statusCompleted}
            </span>
          )}
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold animate-pulse">
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
              {t.documents.statusProcessing}
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {t.documents.statusFailed}
            </span>
          )}
        </div>
      </div>

      {/* Extracted Entities Snippets */}
      {isCompleted && extraction && (
        <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-sm">
          {extraction.diagnoses && extraction.diagnoses.length > 0 && (
            <p className="text-slate-700 font-semibold truncate">
              <strong className="text-kiosk-navy">Diagnoses:</strong> {extraction.diagnoses.join(', ')}
            </p>
          )}

          {extraction.medications && extraction.medications.length > 0 && (
            <p className="text-slate-700 font-semibold truncate">
              <strong className="text-kiosk-navy">Rx:</strong> {extraction.medications.map((m) => `${m.name} ${m.dosage || ''}`).join(', ')}
            </p>
          )}

          {extraction.procedures && extraction.procedures.length > 0 && (
            <p className="text-slate-700 font-semibold truncate">
              <strong className="text-kiosk-navy">Procedure:</strong> {extraction.procedures.join(', ')}
            </p>
          )}

          {extraction.labResults && extraction.labResults.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-xs text-slate-500 font-bold">
                {extraction.labResults.length} Lab Test(s) Extracted
              </span>
              {hasAbnormalLabs && <AbnormalValueBadge />}
            </div>
          )}
        </div>
      )}

      {/* Footer Details & Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {document.document_date
              ? `Date: ${new Date(document.document_date).toLocaleDateString()}`
              : `Uploaded: ${new Date(document.created_at).toLocaleDateString()}`}
          </span>
          {onEditDate && (
            <button
              type="button"
              onClick={() => onEditDate(document.id, document.document_date)}
              className="text-kiosk-blue font-bold hover:underline ml-1"
            >
              (Edit)
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(document.id)}
          className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:bg-rose-50 p-1.5 rounded-lg transition"
          title="Remove document"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.documents.deleteDocBtn}</span>
        </button>
      </div>
    </div>
  );
};
