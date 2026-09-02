'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { IntakeSession } from '@/types/intakeSession';
import { ConsentRecord } from '@/types/consent';
import { IntakeSessionService } from '@/services/intakeSessionService';

interface PatientSessionContextType {
  patient: Patient | null;
  session: IntakeSession | null;
  consent: ConsentRecord | null;
  isLoading: boolean;
  setPatient: (patient: Patient | null) => void;
  setSession: (session: IntakeSession | null) => void;
  setConsent: (consent: ConsentRecord | null) => void;
  initializeSession: (patient: Patient) => Promise<IntakeSession>;
  advanceSessionStep: (step: number) => Promise<void>;
  resetKioskSession: () => void;
  hasActiveSession: boolean;
}

const PatientSessionContext = createContext<PatientSessionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_PATIENT: 'medikiosk_active_patient',
  ACTIVE_SESSION: 'medikiosk_active_session',
  ACTIVE_CONSENT: 'medikiosk_active_consent',
};

export const PatientSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<IntakeSession | null>(null);
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from sessionStorage on browser mount
  useEffect(() => {
    try {
      const storedPatient = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
      const storedSession = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      const storedConsent = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_CONSENT);

      if (storedPatient) setPatient(JSON.parse(storedPatient));
      if (storedSession) setSession(JSON.parse(storedSession));
      if (storedConsent) setConsent(JSON.parse(storedConsent));
    } catch (e) {
      console.error('Failed to load session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      if (patient) {
        sessionStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, JSON.stringify(patient));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
      }
    } catch {}
  }, [patient]);

  useEffect(() => {
    try {
      if (session) {
        sessionStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch {}
  }, [session]);

  useEffect(() => {
    try {
      if (consent) {
        sessionStorage.setItem(STORAGE_KEYS.ACTIVE_CONSENT, JSON.stringify(consent));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_CONSENT);
      }
    } catch {}
  }, [consent]);

  const initializeSession = async (newPatient: Patient): Promise<IntakeSession> => {
    setPatient(newPatient);
    const newSession = await IntakeSessionService.startSession(newPatient.id);
    setSession(newSession);
    return newSession;
  };

  const advanceSessionStep = async (step: number) => {
    if (!session) return;
    const updated = await IntakeSessionService.updateProgress(session.id, step);
    if (updated) {
      setSession(updated);
    }
  };

  const resetKioskSession = () => {
    setPatient(null);
    setSession(null);
    setConsent(null);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_CONSENT);
    } catch {}
  };

  const hasActiveSession = Boolean(patient && session);

  return (
    <PatientSessionContext.Provider
      value={{
        patient,
        session,
        consent,
        isLoading,
        setPatient,
        setSession,
        setConsent,
        initializeSession,
        advanceSessionStep,
        resetKioskSession,
        hasActiveSession,
      }}
    >
      {children}
    </PatientSessionContext.Provider>
  );
};

export const usePatientSession = (): PatientSessionContextType => {
  const context = useContext(PatientSessionContext);
  if (!context) {
    throw new Error('usePatientSession must be used within a PatientSessionProvider');
  }
  return context;
};
