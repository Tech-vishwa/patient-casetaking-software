import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import { ConsentRecord, CreateConsentInput } from '@/types/consent';

export class ConsentService {
  /**
   * Record digital healthcare data collection and sharing consent
   */
  static async recordConsent(input: CreateConsentInput): Promise<ConsentRecord> {
    if (!input.patient_id) {
      throw new Error('Patient ID is required for recording consent.');
    }
    if (!input.data_collection_consent || !input.data_sharing_consent) {
      throw new Error('Both data collection and doctor data sharing consents are required to proceed.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('consent_records')
          .insert([
            {
              patient_id: input.patient_id,
              data_collection_consent: input.data_collection_consent,
              data_sharing_consent: input.data_sharing_consent,
              consent_timestamp: new Date().toISOString(),
              status: 'active',
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase consent insert failed, using fallback:', error.message);
          return await mockDb.createConsentRecord(input);
        }
        return data as ConsentRecord;
      } catch (err) {
        console.warn('Supabase error recording consent:', err);
        return await mockDb.createConsentRecord(input);
      }
    }

    return await mockDb.createConsentRecord(input);
  }

  /**
   * Get active consent record for patient
   */
  static async getActiveConsent(patientId: string): Promise<ConsentRecord | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('consent_records')
          .select('*')
          .eq('patient_id', patientId)
          .eq('status', 'active')
          .order('consent_timestamp', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          return await mockDb.getActiveConsentByPatientId(patientId);
        }
        return data as ConsentRecord;
      } catch {
        return await mockDb.getActiveConsentByPatientId(patientId);
      }
    }
    return await mockDb.getActiveConsentByPatientId(patientId);
  }
}
