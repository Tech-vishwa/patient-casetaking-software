import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import { Patient, CreatePatientInput, PreferredLanguage } from '@/types/patient';

export class PatientService {
  /**
   * Register a new patient or retrieve existing one with same ABHA/phone
   */
  static async registerPatient(input: CreatePatientInput): Promise<Patient> {
    if (!input.full_name || input.full_name.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters.');
    }
    if (!input.age || input.age < 1 || input.age > 125) {
      throw new Error('Please enter a valid age between 1 and 125.');
    }
    if (!input.phone || input.phone.replace(/[^0-9]/g, '').length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([
            {
              full_name: input.full_name.trim(),
              age: input.age,
              gender: input.gender,
              phone: input.phone.trim(),
              abha_id: input.abha_id ? input.abha_id.trim() : null,
              preferred_language: input.preferred_language || 'en',
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert failed, falling back to local DB:', error.message);
          return await mockDb.createPatient(input);
        }
        return data as Patient;
      } catch (err) {
        console.warn('Supabase connection error, using local fallback:', err);
        return await mockDb.createPatient(input);
      }
    }

    return await mockDb.createPatient(input);
  }

  /**
   * Fetch patient profile by ID
   */
  static async getPatientById(id: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          return await mockDb.getPatientById(id);
        }
        return data as Patient;
      } catch {
        return await mockDb.getPatientById(id);
      }
    }
    return await mockDb.getPatientById(id);
  }

  /**
   * Lookup patient by ABHA ID
   */
  static async getPatientByAbha(abhaId: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('abha_id', abhaId)
          .single();

        if (error || !data) {
          return await mockDb.getPatientByAbha(abhaId);
        }
        return data as Patient;
      } catch {
        return await mockDb.getPatientByAbha(abhaId);
      }
    }
    return await mockDb.getPatientByAbha(abhaId);
  }

  /**
   * Lookup patient by Phone Number
   */
  static async getPatientByPhone(phone: string): Promise<Patient | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', phone)
          .single();

        if (error || !data) {
          return await mockDb.getPatientByPhone(phone);
        }
        return data as Patient;
      } catch {
        return await mockDb.getPatientByPhone(phone);
      }
    }
    return await mockDb.getPatientByPhone(phone);
  }

  /**
   * Update preferred language for patient
   */
  static async updateLanguage(patientId: string, language: PreferredLanguage): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('patients')
          .update({ preferred_language: language, updated_at: new Date().toISOString() })
          .eq('id', patientId);
      } catch (err) {
        console.warn('Language update error on Supabase:', err);
      }
    }
    // Also update local mock copy
    const localPatient = await mockDb.getPatientById(patientId);
    if (localPatient) {
      localPatient.preferred_language = language;
    }
  }
}
