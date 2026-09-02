export type IntakeSessionStatus =
  | 'onboarding'
  | 'history_in_progress'
  | 'history_completed'
  | 'documents_in_progress'
  | 'summary_ready'
  | 'completed';

export type IntakeWorkflowStep = 1 | 2 | 3;

export interface IntakeSession {
  id: string;
  patient_id: string;
  status: IntakeSessionStatus;
  current_step: number;
  started_at: string;
  completed_at?: string | null;
}

export interface CreateIntakeSessionInput {
  patient_id: string;
  status?: IntakeSessionStatus;
  current_step?: number;
}
