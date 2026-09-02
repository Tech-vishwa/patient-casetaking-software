'use client';

import React, { useState } from 'react';
import { X, FileText, Scan, Sparkles, Calendar, Pill, Activity, Scissors } from 'lucide-react';
import { MedicalDocument } from '@/types/document';
import { AbnormalValueBadge } from '@/components/kiosk/AbnormalValueBadge';

interface DocumentViewerModalProps {
  documents: MedicalDocument[];
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  documents,
  isOpen,
  onClose,
}) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'structured' | 'ocr' | 'preview'>('structured');

  if (!isOpen || documents.length === 0) return null;

  const currentDoc = documents[selectedDocIndex] || documents[0];
  const extraction = currentDoc.extraction;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-kiosk-navy">Medical Document OCR & Intelligence</h3>
              <p className="text-xs font-bold text-slate-500">
                {documents.length} Document(s) digitized for this patient
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Document Selector Pills if multiple */}
        {documents.length > 1 && (
          <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex gap-2 overflow-x-auto">
            {documents.map((doc, idx) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDocIndex === idx
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                {doc.file_name} ({doc.document_type.replace('_', ' ')})
              </button>
            ))}
          </div>
        )}

        {/* View Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            className={`pb-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'structured'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Structured Entities</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ocr')}
            className={`pb-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ocr'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw OCR Text</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {activeTab === 'structured' && (
            <div className="space-y-6">
              {/* Document Meta */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase">File:</span>{' '}
                  <strong className="text-kiosk-navy text-sm">{currentDoc.file_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase">Category:</span>{' '}
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    {currentDoc.document_type.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase">Document Date:</span>{' '}
                  <strong className="text-kiosk-navy">
                    {currentDoc.document_date || 'Not detected'}
                  </strong>
                </div>
              </div>

              {/* Entities Grid */}
              {extraction ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Diagnoses */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="text-sm font-black text-kiosk-navy flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Extracted Diagnoses</span>
                    </h4>
                    {extraction.diagnoses && extraction.diagnoses.length > 0 ? (
                      <ul className="space-y-1 text-sm font-semibold text-slate-700 list-disc list-inside">
                        {extraction.diagnoses.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">None detected</p>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="text-sm font-black text-kiosk-navy flex items-center gap-2">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span>Prescribed Medications</span>
                    </h4>
                    {extraction.medications && extraction.medications.length > 0 ? (
                      <ul className="space-y-1.5 text-xs font-semibold text-slate-700">
                        {extraction.medications.map((m, i) => (
                          <li key={i} className="p-2 bg-sky-50 rounded-xl flex items-center justify-between">
                            <span>{m.name} {m.dosage || ''}</span>
                            <span className="text-sky-700 font-bold">{m.frequency || 'Rx'}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">None detected</p>
                    )}
                  </div>

                  {/* Lab Results */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 md:col-span-2">
                    <h4 className="text-sm font-black text-kiosk-navy flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Extracted Lab Investigations</span>
                    </h4>
                    {extraction.labResults && extraction.labResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {extraction.labResults.map((l, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              l.isOutsideRange
                                ? 'bg-rose-50 border-rose-300 text-rose-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-xs">{l.test}</p>
                              <p className="text-[11px] text-slate-500">
                                {l.value} {l.unit || ''} (Ref: {l.referenceRange || 'N/A'})
                              </p>
                            </div>
                            {l.isOutsideRange && <AbnormalValueBadge />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No laboratory test values found</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">No extraction data available for this document.</p>
              )}
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="p-6 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
              {currentDoc.extracted_text || '// No raw OCR output available.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
