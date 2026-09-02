import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import {
  ConversationMessage,
  StructuredClinicalHistory,
  CreateClinicalHistoryInput,
  RedFlagAlert,
} from '@/types/clinical';

export class ClinicalService {
  /**
   * Save conversational messages exchange
   */
  static async saveConversation(
    intakeSessionId: string,
    patientId: string,
    messages: ConversationMessage[],
    language: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('clinical_conversations').upsert(
          {
            intake_session_id: intakeSessionId,
            patient_id: patientId,
            messages: messages as any,
            language,
          },
          { onConflict: 'intake_session_id' }
        );

        if (error) {
          console.warn('Supabase conversation save error, using fallback:', error.message);
          await mockDb.saveConversation(intakeSessionId, patientId, messages, language);
        }
      } catch (err) {
        console.warn('Supabase connection error:', err);
        await mockDb.saveConversation(intakeSessionId, patientId, messages, language);
      }
      return;
    }

    await mockDb.saveConversation(intakeSessionId, patientId, messages, language);
  }

  /**
   * Save final structured clinical history
   */
  static async saveClinicalHistory(
    input: CreateClinicalHistoryInput
  ): Promise<StructuredClinicalHistory> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinical_history')
          .upsert(
            {
              intake_session_id: input.intake_session_id,
              patient_id: input.patient_id,
              chief_complaint: input.chief_complaint,
              hpi: input.hpi,
              past_medical_history: input.past_medical_history,
              surgical_history: input.surgical_history,
              medications: input.medications,
              allergies: input.allergies,
              family_history: input.family_history,
              personal_history: input.personal_history,
              review_of_systems: input.review_of_systems || {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'intake_session_id' }
          )
          .select()
          .single();

        if (error || !data) {
          console.warn('Supabase clinical history save error, using fallback:', error?.message);
          return await mockDb.saveClinicalHistory(input);
        }
        return data as StructuredClinicalHistory;
      } catch (err) {
        console.warn('Supabase connection error saving history:', err);
        return await mockDb.saveClinicalHistory(input);
      }
    }

    return await mockDb.saveClinicalHistory(input);
  }

  /**
   * Retrieve clinical history for session
   */
  static async getClinicalHistory(
    intakeSessionId: string
  ): Promise<StructuredClinicalHistory | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clinical_history')
          .select('*')
          .eq('intake_session_id', intakeSessionId)
          .single();

        if (error || !data) {
          return await mockDb.getClinicalHistoryBySessionId(intakeSessionId);
        }
        return data as StructuredClinicalHistory;
      } catch {
        return await mockDb.getClinicalHistoryBySessionId(intakeSessionId);
      }
    }
    return await mockDb.getClinicalHistoryBySessionId(intakeSessionId);
  }

  /**
   * Log deterministic red flag alert into audit log
   */
  static async logRedFlagAlert(
    intakeSessionId: string,
    patientId: string,
    alertType: string,
    severity: 'critical' | 'high' | 'moderate',
    matchedTerms?: string[]
  ): Promise<RedFlagAlert> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('red_flag_alerts')
          .insert([
            {
              intake_session_id: intakeSessionId,
              patient_id: patientId,
              alert_type: alertType,
              severity,
              matched_terms: matchedTerms || [],
            },
          ])
          .select()
          .single();

        if (error || !data) {
          return await mockDb.saveRedFlagAlert({
            intake_session_id: intakeSessionId,
            patient_id: patientId,
            alert_type: alertType,
            severity,
            matched_terms: matchedTerms,
          });
        }
        return data as RedFlagAlert;
      } catch {
        return await mockDb.saveRedFlagAlert({
          intake_session_id: intakeSessionId,
          patient_id: patientId,
          alert_type: alertType,
          severity,
          matched_terms: matchedTerms,
        });
      }
    }

    return await mockDb.saveRedFlagAlert({
      intake_session_id: intakeSessionId,
      patient_id: patientId,
      alert_type: alertType,
      severity,
      matched_terms: matchedTerms,
    });
  }
}
