'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, Camera, Check, AlertCircle, FileText } from 'lucide-react';
import { MedicalDocumentType } from '@/types/document';
import { useLanguage } from '@/context/LanguageContext';
import { KioskButton } from './KioskButton';

interface DocumentUploadZoneProps {
  onFileSelected: (file: File, docType: MedicalDocumentType) => void;
  disabled?: boolean;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<MedicalDocumentType>('prescription');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const docTypes: Array<{ type: MedicalDocumentType; label: string }> = [
    { type: 'prescription', label: t.documents.typePrescription },
    { type: 'lab_report', label: t.documents.typeLabReport },
    { type: 'discharge_summary', label: t.documents.typeDischargeSummary },
    { type: 'other', label: t.documents.typeOther },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndDispatch(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMessage('');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndDispatch(file);
    }
  };

  const validateAndDispatch = (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit.');
      return;
    }
    onFileSelected(file, selectedType);
  };

  // Demo helper: Upload sample dummy document
  const handleSampleUpload = (sampleName: string, type: MedicalDocumentType) => {
    const blob = new Blob(['Sample Medical Document Text'], { type: 'text/plain' });
    const file = new File([blob], sampleName, { type: 'image/jpeg' });
    onFileSelected(file, type);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
      {/* 1. Category Selection Tabs */}
      <div>
        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t.documents.selectTypeLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {docTypes.map((dt) => {
            const isSelected = selectedType === dt.type;
            return (
              <button
                key={dt.type}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedType(dt.type)}
                className={`p-3.5 rounded-2xl font-bold text-sm transition-all border-2 flex items-center justify-center gap-2 active:scale-95 ${
                  isSelected
                    ? 'bg-kiosk-blue text-white border-kiosk-blue shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                <span>{dt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Drag and Drop Touch Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-10 rounded-3xl border-3 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
          isDragOver
            ? 'border-kiosk-blue bg-sky-50 ring-4 ring-sky-100 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/70 hover:bg-sky-50/40 hover:border-kiosk-blue'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="w-20 h-20 rounded-full bg-sky-100 text-kiosk-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
          <UploadCloud className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-kiosk-navy">
          {t.documents.uploadAreaTitle}
        </h3>
        <p className="text-sm font-medium text-slate-500 max-w-md mt-1.5 leading-relaxed">
          {t.documents.uploadAreaDesc}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <KioskButton
            size="default"
            icon={<FileUp className="w-5 h-5" />}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {t.documents.chooseFileBtn}
          </KioskButton>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Demo Quick Upload Samples */}
      <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-600">
          Demo Test Samples (Tap to simulate instant scan):
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSampleUpload('apollo_cardiology_rx.jpg', 'prescription')}
            className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 font-bold text-sky-800 hover:bg-sky-100"
          >
            + Sample Rx
          </button>
          <button
            type="button"
            onClick={() => handleSampleUpload('lalpathlabs_blood_report.pdf', 'lab_report')}
            className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-100"
          >
            + Sample Lab Report
          </button>
          <button
            type="button"
            onClick={() => handleSampleUpload('hospital_discharge_summary.png', 'discharge_summary')}
            className="px-3 py-1.5 rounded-xl bg-white border border-purple-300 font-bold text-purple-800 hover:bg-purple-100"
          >
            + Sample Discharge Note
          </button>
        </div>
      </div>
    </div>
  );
};
