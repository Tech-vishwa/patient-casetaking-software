export type IntakeSessionStatus =
  | 'onboarding'
  | 'history_in_progress'
  | 'history_completed'
  | 'documents_in_progress'
  | 'summary_ready'
  | 'completed';

export type WorkflowState =
  | 'ONBOARDING'
  | 'LANGUAGE_SELECTED'
  | 'IDENTIFIED'
  | 'CONSENT_COMPLETED'
  | 'HISTORY_IN_PROGRESS'
  | 'HISTORY_COMPLETED'
  | 'DOCUMENTS_IN_PROGRESS'
  | 'DOCUMENTS_COMPLETED'
  | 'SUMMARY_READY'
  | 'PATIENT_CONFIRMED'
  | 'DOCTOR_REVIEW'
  | 'COMPLETED';

export type IntakeWorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface IntakeSession {
  id: string;
  patient_id: string;
  status: IntakeSessionStatus;
  workflow_state?: WorkflowState;
  current_step: number;
  draft_history?: any;
  started_at: string;
  completed_at?: string | null;
}

export interface CreateIntakeSessionInput {
  patient_id: string;
  status?: IntakeSessionStatus;
  workflow_state?: WorkflowState;
  current_step?: number;
  draft_history?: any;
}
