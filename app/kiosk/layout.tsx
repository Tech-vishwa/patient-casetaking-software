'use client';

import React, { useState } from 'react';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { Bell, Phone, HelpCircle, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 selection:bg-sky-200">
      <KioskHeader />

      {/* Main Kiosk Content Canvas */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-8 md:p-10">
        {children}
      </main>

      {/* Persistent Bottom Accessibility & Emergency Bar */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 px-6 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Kiosk Terminal #04 • Outpatient Intake Wing A</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold px-4 py-2 rounded-full border border-rose-200 transition active:scale-95"
            >
              <Bell className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>{t.common.emergencyExit}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Hospital Staff Assistance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-4 border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-kiosk-navy">Hospital Staff Help</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              If you have severe symptoms, chest pain, or difficulty using this screen, please inform the intake desk receptionist immediately.
            </p>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 mb-6 flex items-center gap-4">
              <Phone className="w-8 h-8 text-kiosk-blue flex-shrink-0" />
              <div>
                <p className="font-bold text-kiosk-navy">Kiosk Support Desk:</p>
                <p className="text-xl font-extrabold text-kiosk-blue">Extension #402</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full h-14 bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 rounded-2xl text-lg transition"
            >
              Close & Continue Kiosk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
