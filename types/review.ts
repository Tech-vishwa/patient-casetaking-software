import { ClinicalSummaryStructured } from './summary';

export type ReviewDecision = 'approved' | 'modified' | 'rejected';

export interface SummaryReview {
  id: string;
  intake_session_id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  original_summary: ClinicalSummaryStructured;
  edited_summary: ClinicalSummaryStructured;
  review_status: ReviewDecision;
  doctor_notes?: string;
  his_synced: boolean;
  his_sync_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSummaryReviewInput {
  intakeSessionId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  originalSummary: ClinicalSummaryStructured;
  editedSummary: ClinicalSummaryStructured;
  reviewStatus: ReviewDecision;
  doctorNotes?: string;
}
