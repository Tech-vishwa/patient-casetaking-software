'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Pill,
  Activity,
  Scissors,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { MedicalDocument } from '@/types/document';
import { useLanguage } from '@/context/LanguageContext';
import { KioskButton } from './KioskButton';
import { AbnormalValueBadge } from './AbnormalValueBadge';

interface MedicalTimelineProps {
  documents: MedicalDocument[];
  onDateChange?: (docId: string, newDate: string) => void;
}

interface TimelineEvent {
  docId: string;
  date: string;
  year: string;
  title: string;
  category: 'diagnosis' | 'medication' | 'procedure' | 'lab' | 'consultation';
  details: string[];
  hasAbnormal?: boolean;
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({
  documents,
  onDateChange,
}) => {
  const { t } = useLanguage();

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [selectedNewDate, setSelectedNewDate] = useState<string>('');

  // 1. Build & Sort Events Chronologically
  const events: TimelineEvent[] = [];

  documents.forEach((doc) => {
    const rawDate = doc.document_date || doc.created_at.split('T')[0];
    const year = rawDate ? rawDate.split('-')[0] : 'Prior';

    const ext = doc.extraction;
    if (ext) {
      if (ext.diagnoses && ext.diagnoses.length > 0) {
        events.push({
          docId: doc.id,
          date: rawDate,
          year,
          title: `Diagnoses: ${ext.diagnoses.join(', ')}`,
          category: 'diagnosis',
          details: [`Extracted from ${doc.document_type.replace('_', ' ')}`],
        });
      }

      if (ext.procedures && ext.procedures.length > 0) {
        events.push({
          docId: doc.id,
          date: rawDate,
          year,
          title: `Procedure: ${ext.procedures.join(', ')}`,
          category: 'procedure',
          details: [`Surgical history recorded in ${doc.file_name}`],
        });
      }

      if (ext.medications && ext.medications.length > 0) {
        events.push({
          docId: doc.id,
          date: rawDate,
          year,
          title: `Prescribed: ${ext.medications.map((m) => m.name).join(', ')}`,
          category: 'medication',
          details: ext.medications.map((m) => `${m.name} ${m.dosage || ''} (${m.frequency || 'Rx'})`),
        });
      }

      if (ext.labResults && ext.labResults.length > 0) {
        const hasAbnormal = ext.labResults.some((l) => l.isOutsideRange);
        events.push({
          docId: doc.id,
          date: rawDate,
          year,
          title: `Lab Investigation (${ext.labResults.length} Tests)`,
          category: 'lab',
          details: ext.labResults.map((l) => `${l.test}: ${l.value} ${l.unit || ''} (Ref: ${l.referenceRange || 'N/A'})`),
          hasAbnormal,
        });
      }
    } else {
      events.push({
        docId: doc.id,
        date: rawDate,
        year,
        title: `Medical Document: ${doc.file_name}`,
        category: 'consultation',
        details: [doc.document_type.replace('_', ' ')],
      });
    }
  });

  // Sort events chronologically (Oldest first)
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by year
  const groupedYears = events.reduce((acc, event) => {
    if (!acc[event.year]) acc[event.year] = [];
    acc[event.year].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const handleSaveDate = (docId: string) => {
    if (selectedNewDate && onDateChange) {
      onDateChange(docId, selectedNewDate);
    }
    setEditingDocId(null);
    setSelectedNewDate('');
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-kiosk-navy flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-kiosk-blue" />
            <span>{t.documents.timelineTitle}</span>
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {t.documents.timelineDesc}
          </p>
        </div>
        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800">
          Auto-Ordered by AI
        </span>
      </div>

      {/* Chronological Timeline Track */}
      <div className="relative pl-6 sm:pl-8 border-l-4 border-sky-300 space-y-8 my-4">
        {Object.entries(groupedYears).map(([year, yearEvents]) => (
          <div key={year} className="relative space-y-4">
            {/* Year Node Badge */}
            <div className="absolute -left-[35px] sm:-left-[43px] -top-1.5 w-12 h-12 rounded-2xl bg-kiosk-blue text-white font-black text-sm flex items-center justify-center shadow-md border-4 border-white">
              {year}
            </div>

            <div className="pt-2 pl-4 sm:pl-6 space-y-3">
              {yearEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-kiosk-blue transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {evt.category === 'medication' && <Pill className="w-5 h-5 text-sky-600" />}
                      {evt.category === 'lab' && <Activity className="w-5 h-5 text-emerald-600" />}
                      {evt.category === 'procedure' && <Scissors className="w-5 h-5 text-purple-600" />}
                      {evt.category === 'diagnosis' && <Sparkles className="w-5 h-5 text-amber-600" />}
                      <h4 className="text-lg font-bold text-kiosk-navy">{evt.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.hasAbnormal && <AbnormalValueBadge />}
                      <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.date).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDocId(evt.docId);
                          setSelectedNewDate(evt.date);
                        }}
                        className="text-slate-400 hover:text-kiosk-blue p-1 rounded-md"
                        title="Correct Date"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    {evt.details.map((d, dIdx) => (
                      <p key={dIdx} className="font-semibold text-slate-700">
                        • {d}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Date Correction Modal */}
      {editingDocId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-slate-300 space-y-4">
            <h4 className="text-xl font-bold text-kiosk-navy">Correct Document Date</h4>
            <p className="text-xs text-slate-500 font-medium">
              If the AI extracted an incorrect date from your document, please select the true date below.
            </p>
            <div>
              <input
                type="date"
                value={selectedNewDate}
                onChange={(e) => setSelectedNewDate(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-300 text-lg font-bold text-kiosk-navy focus:border-kiosk-blue focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <KioskButton
                variant="outline"
                onClick={() => setEditingDocId(null)}
                className="flex-1"
              >
                Cancel
              </KioskButton>
              <KioskButton
                variant="primary"
                onClick={() => handleSaveDate(editingDocId)}
                className="flex-1"
              >
                Save Date
              </KioskButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
