'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, AlertOctagon, Activity, FileText, ArrowRight, UserCheck } from 'lucide-react';

export const DemoPatientSwitcher: React.FC = () => {
  const demoCases = [
    {
      id: 'demo-sess-001',
      patientId: 'demo-pat-001',
      name: 'Rajesh Sharma (62M)',
      caseTitle: 'Case C: Acute Chest Pain (🚨 Emergency Red Flag)',
      complaint: 'Crushing central chest pain with left arm radiation',
      priority: 'critical',
      tag: 'RED FLAG EMERGENCY',
      color: 'border-rose-500 bg-rose-50/70',
      badgeColor: 'bg-rose-600 text-white',
      desc: 'Simulates acute cardiac symptoms triggering automated deterministic red-flag triage, priority queueing, and physician alerts.',
    },
    {
      id: 'demo-sess-002',
      patientId: 'demo-pat-002',
      name: 'Kavitha Ramachandran (45F)',
      caseTitle: 'Case B: Type 2 Diabetes (📄 OCR Documents & Labs)',
      complaint: '3-Month diabetic follow-up with knee pain',
      priority: 'high',
      tag: 'DOCUMENTS & ABNORMAL LABS',
      color: 'border-purple-500 bg-purple-50/70',
      badgeColor: 'bg-purple-600 text-white',
      desc: 'Simulates previous Apollo prescriptions and Lal Pathlabs blood reports with abnormal HbA1c (7.8%) and rule-based range detection.',
    },
    {
      id: 'demo-sess-003',
      patientId: 'demo-pat-003',
      name: 'Ramesh Sundaram (42M)',
      caseTitle: 'Case A: Tension Headache (🟢 Standard Intake)',
      complaint: 'Frontal headache and eye strain for 4 days',
      priority: 'normal',
      tag: 'STANDARD INTAKE',
      color: 'border-emerald-500 bg-emerald-50/70',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Simulates smooth 8-stage SOCRATES symptom history collection without acute red-flags or prior medical documents.',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Hackathon Demonstration Tools</span>
          </div>
          <h3 className="text-2xl font-black text-kiosk-navy">1-Click Clinical Scenario Switcher</h3>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Instantly load and test different patient workflows in the Physician Workspace without manual entry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {demoCases.map((c) => (
          <div
            key={c.id}
            className={`p-6 rounded-3xl border-3 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all ${c.color}`}
          >
            <div className="space-y-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${c.badgeColor}`}>
                {c.tag}
              </span>

              <h4 className="text-lg font-black text-kiosk-navy leading-snug pt-1">
                {c.caseTitle}
              </h4>

              <p className="text-xs font-bold text-slate-700">
                Patient: <span className="underline">{c.name}</span>
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {c.desc}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href={`/doctor/patient/${c.id}`}
                className="w-full py-3 px-4 rounded-2xl bg-kiosk-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <span>Open in Doctor Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
