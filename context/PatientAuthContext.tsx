'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, CreatePatientInput } from '@/types/patient';
import { IntakeSession } from '@/types/intakeSession';
import { mockDb } from '@/lib/supabase/mockDb';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { WorkflowStateMachine } from '@/services/workflowStateMachine';

interface PatientAuthContextType {
  patient: Patient | null;
  session: IntakeSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  incompleteSession: IntakeSession | null;
  hasIncompleteSession: boolean;
  login: (phone: string, password?: string) => Promise<{ success: boolean; hasIncomplete?: boolean; error?: string }>;
  register: (data: CreatePatientInput) => Promise<{ success: boolean; error?: string }>;
  resumeSession: () => Promise<string>;
  startNewSession: () => Promise<string>;
  setSession: (session: IntakeSession | null) => void;
  setPatient: (patient: Patient | null) => void;
  logout: () => void;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

const PATIENT_AUTH_KEY = 'medikiosk_active_patient_auth_v1';
const PATIENT_SESSION_KEY = 'medikiosk_active_patient_session_v1';

export const PatientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatientState] = useState<Patient | null>(null);
  const [session, setSessionState] = useState<IntakeSession | null>(null);
  const [incompleteSession, setIncompleteSession] = useState<IntakeSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated patient & active session on mount
  useEffect(() => {
    try {
      const storedPatient = localStorage.getItem(PATIENT_AUTH_KEY);
      const storedSession = localStorage.getItem(PATIENT_SESSION_KEY);

      if (storedPatient) {
        const parsedPatient: Patient = JSON.parse(storedPatient);
        setPatientState(parsedPatient);

        // Check for active / incomplete session
        if (storedSession) {
          const parsedSession: IntakeSession = JSON.parse(storedSession);
          setSessionState(parsedSession);
        } else {
          // Look up in database
          mockDb.getIncompleteSessionByPatient(parsedPatient.id).then((activeSess) => {
            if (activeSess) {
              setIncompleteSession(activeSess);
              setSessionState(activeSess);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error restoring patient auth:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPatient = (p: Patient | null) => {
    setPatientState(p);
    try {
      if (p) {
        localStorage.setItem(PATIENT_AUTH_KEY, JSON.stringify(p));
        localStorage.setItem('medikiosk_active_patient_v2', JSON.stringify(p));
      } else {
        localStorage.removeItem(PATIENT_AUTH_KEY);
        localStorage.removeItem('medikiosk_active_patient_v2');
      }
    } catch {}
  };

  const setSession = (s: IntakeSession | null) => {
    setSessionState(s);
    try {
      if (s) {
        localStorage.setItem(PATIENT_SESSION_KEY, JSON.stringify(s));
        localStorage.setItem('medikiosk_active_session_v2', JSON.stringify(s));
      } else {
        localStorage.removeItem(PATIENT_SESSION_KEY);
        localStorage.removeItem('medikiosk_active_session_v2');
      }
    } catch {}
  };

  const login = async (phone: string, password?: string): Promise<{ success: boolean; hasIncomplete?: boolean; error?: string }> => {
    try {
      const found = await mockDb.authenticatePatient(phone.trim(), password ? password.trim() : undefined);
      if (!found) {
        return { success: false, error: 'Invalid mobile number or password.' };
      }

      setPatient(found);

      // Check for incomplete session
      const existingIncomplete = await mockDb.getIncompleteSessionByPatient(found.id);
      if (existingIncomplete && existingIncomplete.status !== 'completed') {
        setIncompleteSession(existingIncomplete);
        setSession(existingIncomplete);
        return { success: true, hasIncomplete: true };
      }

      return { success: true, hasIncomplete: false };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const register = async (data: CreatePatientInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check for duplicate mobile
      const existing = await mockDb.findPatientByPhone(data.phone.trim());
      if (existing) {
        return { success: false, error: 'A patient with this mobile number is already registered. Please log in.' };
      }

      const newPatient = await mockDb.createPatient(data);
      setPatient(newPatient);

      // Start fresh intake session
      const newSession = await IntakeSessionService.startSession(newPatient.id, 'LANGUAGE_SELECTED');
      setSession(newSession);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const resumeSession = async (): Promise<string> => {
    const targetSession = session || incompleteSession;
    if (!targetSession) {
      return '/kiosk/welcome';
    }

    const state = targetSession.workflow_state || 'ONBOARDING';
    const targetRoute = WorkflowStateMachine.getRouteForWorkflowState(state);
    return targetRoute;
  };

  const startNewSession = async (): Promise<string> => {
    if (!patient) return '/patient/login';

    const freshSession = await IntakeSessionService.startSession(patient.id, 'LANGUAGE_SELECTED');
    setSession(freshSession);
    setIncompleteSession(null);
    return '/kiosk/consent';
  };

  const logout = () => {
    setPatientState(null);
    setSessionState(null);
    setIncompleteSession(null);
    try {
      localStorage.removeItem(PATIENT_AUTH_KEY);
      localStorage.removeItem(PATIENT_SESSION_KEY);
      localStorage.removeItem('medikiosk_active_patient_v2');
      localStorage.removeItem('medikiosk_active_session_v2');
      localStorage.removeItem('medikiosk_active_consent_v2');
    } catch {}
  };

  const isAuthenticated = Boolean(patient);
  const hasIncompleteSession = Boolean(incompleteSession && incompleteSession.status !== 'completed');

  return (
    <PatientAuthContext.Provider
      value={{
        patient,
        session,
        isAuthenticated,
        isLoading,
        incompleteSession,
        hasIncompleteSession,
        login,
        register,
        resumeSession,
        startNewSession,
        setSession,
        setPatient,
        logout,
      }}
    >
      {children}
    </PatientAuthContext.Provider>
  );
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};
