'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientSession } from '@/context/PatientSessionContext';
import { PatientService } from '@/services/patientService';
import { PreferredLanguage } from '@/types/patient';

export const LanguageBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { patient, setPatient } = usePatientSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = async (code: PreferredLanguage) => {
    // 1. In-place language change without page reload or route navigation
    setLanguage(code);
    setIsOpen(false);

    // 2. Persist to active patient record in database if patient is logged in
    if (patient) {
      try {
        await PatientService.updateLanguage(patient.id, code);
        setPatient({ ...patient, preferred_language: code });
      } catch (err) {
        console.warn('Failed to update patient language preference:', err);
      }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-kiosk-navy rounded-full border border-slate-200 shadow-sm transition active:scale-95 ${className}`}
        title="Change Language in-place"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-5 h-5 text-kiosk-blue" />
        <span className="text-base font-bold">{current.nativeName}</span>
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
          {current.code.toUpperCase()}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {/* In-Place Language Selector Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white shadow-2xl border-2 border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Choose Interface Language
            </p>
          </div>
          <div className="py-1 space-y-1">
            {availableLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left font-bold transition ${
                    isSelected
                      ? 'bg-sky-50 text-kiosk-blue border border-sky-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="text-base font-black text-kiosk-navy">{lang.nativeName}</div>
                      <div className="text-xs text-slate-500 font-medium">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-kiosk-blue text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
