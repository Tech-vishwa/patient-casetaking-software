import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import {
  IntakeSession,
  CreateIntakeSessionInput,
  IntakeSessionStatus,
  WorkflowState,
} from '@/types/intakeSession';
import { WorkflowStateMachine } from './workflowStateMachine';

export class IntakeSessionService {
  /**
   * Initialize a new intake session for a registered patient
   */
  static async startSession(
    patientId: string,
    initialWorkflowState: WorkflowState = 'ONBOARDING'
  ): Promise<IntakeSession> {
    const input: CreateIntakeSessionInput = {
      patient_id: patientId,
      status: WorkflowStateMachine.mapWorkflowStateToStatus(initialWorkflowState),
      workflow_state: initialWorkflowState,
      current_step: WorkflowStateMachine.mapWorkflowStateToStep(initialWorkflowState),
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
        return {
          ...(data as IntakeSession),
          workflow_state: initialWorkflowState,
        };
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
   * Update workflow state and progress of an active session
   */
  static async updateWorkflowState(
    sessionId: string,
    workflowState: WorkflowState,
    step?: number,
    status?: IntakeSessionStatus,
    draftHistory?: any
  ): Promise<IntakeSession | null> {
    const calculatedStep = step !== undefined ? step : WorkflowStateMachine.mapWorkflowStateToStep(workflowState);
    const calculatedStatus = status || WorkflowStateMachine.mapWorkflowStateToStatus(workflowState);

    const updates: Partial<IntakeSession> = {
      workflow_state: workflowState,
      current_step: calculatedStep,
      status: calculatedStatus,
    };

    if (draftHistory !== undefined) {
      updates.draft_history = draftHistory;
    }

    if (workflowState === 'COMPLETED') {
      updates.completed_at = new Date().toISOString();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('intake_sessions')
          .update({
            current_step: calculatedStep,
            status: calculatedStatus,
            ...(updates.completed_at ? { completed_at: updates.completed_at } : {}),
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (error) {
          return await mockDb.updateIntakeSession(sessionId, updates);
        }
        return {
          ...(data as IntakeSession),
          workflow_state: workflowState,
          draft_history: draftHistory,
        };
      } catch {
        return await mockDb.updateIntakeSession(sessionId, updates);
      }
    }

    return await mockDb.updateIntakeSession(sessionId, updates);
  }

  /**
   * Backward compatible updateProgress
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

  /**
   * Find unfinished intake session for a patient
   */
  static async getIncompleteSession(patientId: string): Promise<IntakeSession | null> {
    return await mockDb.getIncompleteSessionByPatient(patientId);
  }
}
