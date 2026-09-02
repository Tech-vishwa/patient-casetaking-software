'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DoctorUser, UserRole } from '@/types/user';
import { mockDb } from '@/lib/supabase/mockDb';

interface DoctorAuthContextType {
  user: DoctorUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLogin: (role: 'doctor' | 'admin') => Promise<void>;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'medikiosk_doctor_auth_session_v1';

export const DoctorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DoctorUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (e) {
      console.error('Error restoring doctor session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    // Prototype validation: accept PIN 1234 or any 4-digit pin for demo accounts
    if (pin.length < 4) {
      return { success: false, error: 'Please enter a valid 4-digit security PIN.' };
    }

    const foundUser = await mockDb.findUserByEmail(email);
    if (!foundUser) {
      // Fallback dynamic doctor user
      const customUser: DoctorUser = {
        id: 'doc-' + Math.random().toString(36).substring(2, 7),
        email,
        full_name: email.includes('admin') ? 'Hospital Administrator' : 'Dr. Attending Physician, MD',
        role: email.includes('admin') ? 'admin' : 'doctor',
        department: 'Outpatient Clinical Services',
        hospital_room: 'Consultation Room 4',
      };
      setUser(customUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      return { success: true };
    }

    setUser(foundUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
    return { success: true };
  };

  const quickLogin = async (targetRole: 'doctor' | 'admin') => {
    const email = targetRole === 'doctor' ? 'doctor@ayushman.gov.in' : 'admin@ayushman.gov.in';
    await login(email, '1234');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAuthenticated = Boolean(user);
  const role: UserRole = user?.role || 'patient';

  return (
    <DoctorAuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        quickLogin,
      }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = () => {
  const context = useContext(DoctorAuthContext);
  if (!context) {
    throw new Error('useDoctorAuth must be used within a DoctorAuthProvider');
  }
  return context;
};
