'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { RedFlagAlert } from '@/types/clinical';
import { mockDb } from '@/lib/supabase/mockDb';

interface RedFlagAlertBannerProps {
  alerts: RedFlagAlert[];
  onStatusChange?: (alertId: string, status: 'active' | 'acknowledged' | 'resolved') => void;
}

export const RedFlagAlertBanner: React.FC<RedFlagAlertBannerProps> = ({
  alerts,
  onStatusChange,
}) => {
  const [localAlerts, setLocalAlerts] = useState<RedFlagAlert[]>(alerts);

  if (!alerts || alerts.length === 0) return null;

  const handleUpdateStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    await mockDb.updateRedFlagStatus(alertId, status);
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
    if (onStatusChange) {
      onStatusChange(alertId, status);
    }
  };

  return (
    <div className="space-y-3">
      {localAlerts.map((alert) => {
        const isResolved = alert.status === 'resolved';
        const isAck = alert.status === 'acknowledged';

        return (
          <div
            key={alert.id}
            className={`rounded-3xl p-5 sm:p-6 border-3 shadow-lg transition-all ${
              isResolved
                ? 'bg-slate-50 border-slate-300 opacity-70'
                : 'bg-rose-50 border-rose-500 ring-4 ring-rose-200/60'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isResolved
                      ? 'bg-slate-400 text-white'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  <AlertOctagon className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white">
                      🚨 PRIORITY ATTENTION REQUIRED
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-rose-800 border border-rose-300">
                      Category: {alert.alert_type}
                    </span>
                    <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Triggered: {new Date(alert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-lg font-black text-rose-950">
                    Patient reported potential emergency symptoms during AI intake.
                  </p>

                  {alert.matched_terms && alert.matched_terms.length > 0 && (
                    <p className="text-xs font-semibold text-rose-800">
                      Trigger keywords: <span className="font-bold underline">{alert.matched_terms.join(', ')}</span>
                    </p>
                  )}

                  <p className="text-xs text-rose-600 font-medium italic pt-1">
                    * Automated clinical safety alert — requires direct physician evaluation. Not a diagnostic decision.
                  </p>
                </div>
              </div>

              {/* Triage Actions */}
              <div className="flex items-center gap-2.5 self-end lg:self-center">
                {alert.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition active:scale-95"
                  >
                    Acknowledge Alert
                  </button>
                )}

                {alert.status !== 'resolved' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-2xl bg-slate-200 text-slate-700 text-xs font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    Resolved by Staff
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
