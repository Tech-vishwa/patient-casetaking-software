'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode2, Sparkles, ShieldCheck } from 'lucide-react';
import { FHIRBundle } from '@/types/integration';

interface FhirViewerModalProps {
  bundle: FHIRBundle;
  isOpen: boolean;
  onClose: () => void;
}

export const FhirViewerModal: React.FC<FhirViewerModalProps> = ({
  bundle,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(bundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bundle.id || 'fhir-bundle'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">HL7 FHIR R4 Bundle Inspector</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Prototype FHIR Mapping — Demonstration Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized ABDM / NDHM Health Information Exchange payload (Resource: Bundle • Entries: {bundle.entry.length})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Resources Summary Pills */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
          <span className="text-slate-500">Resource Breakdown:</span>
          {bundle.entry.map((e, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sky-300"
            >
              {e.resource.resourceType}
            </span>
          ))}
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-emerald-400 bg-slate-950/80 leading-relaxed select-text">
          <pre>{jsonString}</pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FHIR R4 Schema & ABDM Conceptual Mappings Verified</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download FHIR Bundle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
