import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import { IntakeSession, CreateIntakeSessionInput, IntakeSessionStatus } from '@/types/intakeSession';

export class IntakeSessionService {
  /**
   * Initialize a new intake session for a registered patient
   */
  static async startSession(patientId: string): Promise<IntakeSession> {
    const input: CreateIntakeSessionInput = {
      patient_id: patientId,
      status: 'onboarding',
      current_step: 1,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('intake_sessions')
          .insert([
            {
              patient_id: input.patient_id,
              status: input.status,
              current_step: input.current_step,
              started_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.warn('Supabase session start failed, using fallback:', error.message);
          return await mockDb.createIntakeSession(input);
        }
        return data as IntakeSession;
      } catch (err) {
        console.warn('Supabase session connection error:', err);
        return await mockDb.createIntakeSession(input);
      }
    }

    return await mockDb.createIntakeSession(input);
  }

  /**
   * Get intake session by ID
   */
  static async getSession(sessionId: string): Promise<IntakeSession | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('intake_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error || !data) {
          return await mockDb.getIntakeSessionById(sessionId);
        }
        return data as IntakeSession;
      } catch {
        return await mockDb.getIntakeSessionById(sessionId);
      }
    }
    return await mockDb.getIntakeSessionById(sessionId);
  }

  /**
   * Update current step and status of an active session
   */
  static async updateProgress(
    sessionId: string,
    step: number,
    status?: IntakeSessionStatus
  ): Promise<IntakeSession | null> {
    const updates: Partial<IntakeSession> = {
      current_step: step,
    };
    if (status) {
      updates.status = status;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('intake_sessions')
          .update(updates)
          .eq('id', sessionId)
          .select()
          .single();

        if (error) {
          return await mockDb.updateIntakeSession(sessionId, updates);
        }
        return data as IntakeSession;
      } catch {
        return await mockDb.updateIntakeSession(sessionId, updates);
      }
    }

    return await mockDb.updateIntakeSession(sessionId, updates);
  }
}
