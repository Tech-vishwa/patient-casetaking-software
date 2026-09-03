import { ConsultationMode } from './intakeSession';
import { DashavidhaPariksha, PrakritiAssessment, VikritiAssessment, AharaAssessment, ViharaAssessment } from './ayush';

export interface ClinicalSummaryStructured {
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string[];
  past_surgical_history: string[];
  current_medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    source: 'patient' | 'document' | 'both';
  }>;
  allergies: Array<{
    allergen: string;
    type?: string;
  }>;
  family_history: string[];
  personal_history: string[];
  review_of_systems: Record<string, string>;
  prior_investigations: Array<{
    test: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
    date?: string;
  }>;
  important_alerts: string[];
}

export interface AyushSummaryStructured {
  presenting_complaint: string;
  duration?: string;
  previous_treatment?: string;
  current_symptoms: string[];
  prakriti_assessment: PrakritiAssessment;
  vikriti_assessment: VikritiAssessment;
  ahara_assessment: AharaAssessment;
  vihara_assessment: ViharaAssessment;
  dashavidha_pariksha: DashavidhaPariksha;
  previous_medical_treatment_history: string[];
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    source: 'patient' | 'document' | 'both';
  }>;
  uploaded_investigations: Array<{
    test: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
    date?: string;
  }>;
  important_alerts: string[];
}

export interface StructuredClinicalSummary {
  id: string;
  patient_id: string;
  intake_session_id: string;
  consultation_mode?: ConsultationMode;
  summary_content: string;
  structured_summary: ClinicalSummaryStructured;
  ayush_summary?: AyushSummaryStructured;
  version: number;
  status: 'draft' | 'final';
  generated_at: string;
  updated_at: string;
}

export interface CreateClinicalSummaryInput {
  patient_id: string;
  intake_session_id: string;
  consultation_mode?: ConsultationMode;
  summary_content: string;
  structured_summary: ClinicalSummaryStructured;
  ayush_summary?: AyushSummaryStructured;
  version?: number;
  status?: 'draft' | 'final';
}
