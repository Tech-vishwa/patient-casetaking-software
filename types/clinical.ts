import { AyushStage } from './ayush';

export type ModernMedicineStage =
  | 'chief_complaint'
  | 'hpi'
  | 'past_medical_history'
  | 'surgical_history'
  | 'medications'
  | 'allergies'
  | 'family_history'
  | 'personal_history'
  | 'completed';

export type ClinicalStage = ModernMedicineStage | AyushStage;

export type QuestionInputType = 'text' | 'multiple_choice' | 'scale' | 'yes_no_unsure';

export interface ClinicalQuestion {
  id: string;
  stage: ClinicalStage;
  question: string;
  questionType: QuestionInputType;
  options?: string[];
  fieldKey?: string;
  isOptional?: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  timestamp: string;
  stage: ClinicalStage;
  inputMode?: 'voice' | 'text' | 'touch' | 'quick_select' | 'typed';
}

export interface RedFlagAlert {
  id: string;
  intake_session_id: string;
  patient_id: string;
  alert_type: string;
  severity: 'critical' | 'high' | 'moderate';
  triggered_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
  matched_terms?: string[];
}

export interface StructuredClinicalHistory {
  id: string;
  intake_session_id: string;
  patient_id: string;
  chief_complaint: string;
  hpi: {
    duration?: string;
    onset?: string;
    severity?: string | number;
    location?: string;
    character?: string;
    radiation?: string;
    associated_symptoms?: string[];
    aggravating_factors?: string;
    relieving_factors?: string;
    notes?: string;
  };
  past_medical_history: Array<{ condition: string; status: 'yes' | 'no' | 'not_sure'; details?: string }>;
  surgical_history: Array<{ surgery: string; year?: string }>;
  medications: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies: Array<{ allergen: string; reaction?: string; type: 'drug' | 'food' | 'environmental' | 'other' }>;
  family_history: Array<{ relation: string; condition: string }>;
  personal_history: {
    smoking?: string;
    alcohol?: string;
    diet?: string;
    sleep?: string;
    exercise?: string;
  };
  review_of_systems?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateClinicalHistoryInput {
  intake_session_id: string;
  patient_id: string;
  chief_complaint: string;
  hpi: StructuredClinicalHistory['hpi'];
  past_medical_history: StructuredClinicalHistory['past_medical_history'];
  surgical_history: StructuredClinicalHistory['surgical_history'];
  medications: StructuredClinicalHistory['medications'];
  allergies: StructuredClinicalHistory['allergies'];
  family_history: StructuredClinicalHistory['family_history'];
  personal_history: StructuredClinicalHistory['personal_history'];
  review_of_systems?: Record<string, string>;
}
