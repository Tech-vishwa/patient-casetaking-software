export type AyushStage =
  | 'presenting_complaint'
  | 'prakriti'
  | 'vikriti'
  | 'ahara'
  | 'vihara'
  | 'dashavidha_pariksha'
  | 'completed';

export interface PrakritiAssessment {
  body_build?: string;
  skin_type?: string;
  appetite?: string;
  sleep_pattern?: string;
  temperament?: string;
  dominant_dosha_tendency?: string;
  notes?: string;
}

export interface VikritiAssessment {
  recent_changes?: string;
  current_symptoms?: string[];
  current_complaints?: string[];
  digestive_changes?: string;
  digestive_fire?: string;
  sleep_changes?: string;
  energy_changes?: string;
  bowel_habits?: string;
  imbalance_notes?: string;
}

export interface AharaAssessment {
  food_types?: string;
  dietary_pattern?: string;
  meal_timing?: string;
  appetite?: string;
  food_preferences?: string;
  water_intake?: string;
  dietary_notes?: string;
}

export interface ViharaAssessment {
  daily_routine?: string;
  physical_activity?: string;
  sleep?: string;
  sleep_pattern?: string;
  stress?: string;
  mental_stress?: string;
  work_pattern?: string;
  lifestyle_notes?: string;
}

export interface DashavidhaPariksha {
  prakriti: string;          // 1. Constitution
  vikriti: string;           // 2. Current Morbidity/Imbalance
  sara: string;              // 3. Tissue Essence / Vitality
  samhanana: string;         // 4. Body Compactness & Build
  pramana: string;           // 5. Body Proportions & Measurements
  satmya: string;            // 6. Habituation & Suitability
  sattva: string;            // 7. Mental Strength & Resilience
  ahara_shakti: string;      // 8. Digestive Capacity & Food Intake
  vyayama_shakti: string;    // 9. Physical Capacity & Endurance
  vaya: string;              // 10. Age Category (Balya/Madhyama/Vardhakya)
}

export interface AyushAssessment {
  id: string;
  patient_id: string;
  intake_session_id: string;
  presenting_complaint: string;
  duration?: string;
  previous_treatment?: string;
  current_symptoms: string[];
  prakriti: PrakritiAssessment;
  vikriti: VikritiAssessment;
  ahara_assessment: AharaAssessment;
  vihara_assessment: ViharaAssessment;
  sara?: string;
  samhanana?: string;
  pramana?: string;
  satmya?: string;
  sattva?: string;
  ahara_shakti?: string;
  vyayama_shakti?: string;
  vaya?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAyushAssessmentInput {
  patient_id: string;
  intake_session_id: string;
  presenting_complaint: string;
  duration?: string;
  previous_treatment?: string;
  current_symptoms?: string[];
  prakriti?: PrakritiAssessment;
  vikriti?: VikritiAssessment;
  ahara_assessment?: AharaAssessment;
  vihara_assessment?: ViharaAssessment;
  sara?: string;
  samhanana?: string;
  pramana?: string;
  satmya?: string;
  sattva?: string;
  ahara_shakti?: string;
  vyayama_shakti?: string;
  vaya?: string;
}

export type { AyushSummaryStructured } from './summary';
