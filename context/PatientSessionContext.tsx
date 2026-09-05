'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient } from '@/types/patient';
import { IntakeSession, WorkflowState, ConsultationMode } from '@/types/intakeSession';
import { ConsentRecord } from '@/types/consent';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { WorkflowStateMachine } from '@/services/workflowStateMachine';
import { mockDb } from '@/lib/supabase/mockDb';

interface PatientSessionContextType {
  patient: Patient | null;
  session: IntakeSession | null;
  consent: ConsentRecord | null;
  consultationMode: ConsultationMode;
  isLoading: boolean;
  setPatient: (patient: Patient | null) => void;
  setSession: (session: IntakeSession | null) => void;
  setConsent: (consent: ConsentRecord | null) => void;
  setConsultationMode: (mode: ConsultationMode) => Promise<void>;
  initializeSession: (patient: Patient, initialState?: WorkflowState, mode?: ConsultationMode) => Promise<IntakeSession>;
  advanceSessionStep: (step: number) => Promise<void>;
  updateWorkflowState: (state: WorkflowState, step?: number, draftHistory?: any) => Promise<void>;
  resetKioskSession: () => void;
  hasActiveSession: boolean;
}

const PatientSessionContext = createContext<PatientSessionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_PATIENT: 'medikiosk_active_patient_v2',
  ACTIVE_SESSION: 'medikiosk_active_session_v2',
  ACTIVE_CONSENT: 'medikiosk_active_consent_v2',
  ACTIVE_MODE: 'medikiosk_active_consultation_mode_v2',
};

export const PatientSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatientState] = useState<Patient | null>(null);
  const [session, setSessionState] = useState<IntakeSession | null>(null);
  const [consent, setConsentState] = useState<ConsentRecord | null>(null);
  const [consultationMode, setConsultationModeState] = useState<ConsultationMode>('MODERN_MEDICINE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on browser mount
  useEffect(() => {
    try {
      const storedPatient = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
      const storedSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      const storedConsent = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONSENT);
      const storedMode = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE) as ConsultationMode | null;

      if (storedPatient) setPatientState(JSON.parse(storedPatient));
      if (storedSession) {
        const parsedSession: IntakeSession = JSON.parse(storedSession);
        setSessionState(parsedSession);
        if (parsedSession.consultation_mode) {
          setConsultationModeState(parsedSession.consultation_mode);
        }
      }
      if (storedConsent) setConsentState(JSON.parse(storedConsent));
      if (storedMode) setConsultationModeState(storedMode);
    } catch (e) {
      console.error('Failed to load session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPatient = (p: Patient | null) => {
    setPatientState(p);
    try {
      if (p) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, JSON.stringify(p));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
      }
    } catch {}
  };

  const setSession = (s: IntakeSession | null) => {
    setSessionState(s);
    try {
      if (s) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(s));
        if (s.consultation_mode) {
          setConsultationModeState(s.consultation_mode);
          localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, s.consultation_mode);
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch {}
  };

  const setConsent = (c: ConsentRecord | null) => {
    setConsentState(c);
    try {
      if (c) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONSENT, JSON.stringify(c));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONSENT);
      }
    } catch {}
  };

  const setConsultationMode = async (mode: ConsultationMode) => {
    setConsultationModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
    } catch {}

    if (session) {
      const updated = await mockDb.updateIntakeSession(session.id, { consultation_mode: mode });
      if (updated) {
        setSession(updated);
      }
    }
  };

  const initializeSession = async (
    newPatient: Patient,
    initialState: WorkflowState = 'ONBOARDING',
    mode: ConsultationMode = consultationMode
  ): Promise<IntakeSession> => {
    setPatient(newPatient);
    // Check if existing active session exists to prevent duplicate creation
    const existing = await mockDb.getIncompleteSessionByPatient(newPatient.id);
    if (existing && existing.status !== 'completed') {
      setSession(existing);
      return existing;
    }
    const newSession = await IntakeSessionService.startSession(newPatient.id, initialState);
    if (mode && newSession) {
      newSession.consultation_mode = mode;
      await mockDb.updateIntakeSession(newSession.id, { consultation_mode: mode });
    }
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

  const updateWorkflowState = async (state: WorkflowState, step?: number, draftHistory?: any) => {
    if (!session) return;
    const updated = await IntakeSessionService.updateWorkflowState(
      session.id,
      state,
      step,
      WorkflowStateMachine.mapWorkflowStateToStatus(state),
      draftHistory
    );
    if (updated) {
      setSession(updated);
    }
  };

  const resetKioskSession = () => {
    setPatientState(null);
    setSessionState(null);
    setConsentState(null);
    setConsultationModeState('MODERN_MEDICINE');
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONSENT);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MODE);
    } catch {}
  };

  const hasActiveSession = Boolean(patient && session);

  return (
    <PatientSessionContext.Provider
      value={{
        patient,
        session,
        consent,
        consultationMode,
        isLoading,
        setPatient,
        setSession,
        setConsent,
        setConsultationMode,
        initializeSession,
        advanceSessionStep,
        updateWorkflowState,
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
