'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDoctorAuth } from '@/context/DoctorAuthContext';
import {
  Stethoscope,
  Users,
  ShieldAlert,
  BarChart3,
  LogOut,
  Hospital,
  Activity,
  Layers,
} from 'lucide-react';

interface DoctorHeaderProps {
  emergencyCount?: number;
  queueCount?: number;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  emergencyCount = 0,
  queueCount = 0,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useDoctorAuth();

  const handleLogout = () => {
    logout();
    router.push('/doctor/login');
  };

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Hospital Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/doctor/queue"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-kiosk-navy to-kiosk-blue text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-kiosk-navy tracking-tight">
                    MediKiosk <span className="text-kiosk-blue font-bold">Physician Portal</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800">
                    {role === 'admin' ? 'ADMIN CONSOLE' : 'DOCTOR DESK'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400">
                  Ayushman Hospital & Research Centre • Room 4
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/doctor/dashboard"
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition ${
                pathname === '/doctor/dashboard'
                  ? 'bg-sky-50 text-kiosk-blue border-2 border-kiosk-blue/40 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/doctor/queue"
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition ${
                pathname.startsWith('/doctor/queue') || pathname.startsWith('/doctor/patient')
                  ? 'bg-sky-50 text-kiosk-blue border-2 border-kiosk-blue/40 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patient Queue</span>
              {queueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-kiosk-blue text-white text-xs font-black">
                  {queueCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/dashboard"
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition ${
                pathname.startsWith('/admin')
                  ? 'bg-purple-50 text-purple-700 border-2 border-purple-300 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Hospital Analytics</span>
            </Link>

            <Link
              href="/kiosk/welcome"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 border border-slate-200"
              title="Open Patient Kiosk in New Tab"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Launch Kiosk Terminal ↗</span>
            </Link>
          </nav>

          {/* User Profile & Emergency Badge & Logout */}
          <div className="flex items-center gap-3">
            {emergencyCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-black animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{emergencyCount} CRITICAL TRIAGE</span>
              </div>
            )}

            <div className="hidden lg:block text-right">
              <p className="text-sm font-black text-kiosk-navy leading-tight truncate max-w-[180px]">
                {user?.full_name || 'Dr. Attending Doctor'}
              </p>
              <p className="text-xs text-slate-400 font-semibold">{user?.department || 'Internal Medicine'}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-2xl border-2 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition font-bold text-xs flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
