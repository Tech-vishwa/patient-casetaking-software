export type Gender = 'male' | 'female' | 'other';
export type PreferredLanguage = 'en' | 'ta' | 'hi';

export interface Patient {
  id: string;
  full_name: string;
  age: number;
  gender: Gender;
  phone: string;
  abha_id?: string | null;
  preferred_language: PreferredLanguage;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientInput {
  full_name: string;
  age: number;
  gender: Gender;
  phone: string;
  abha_id?: string | null;
  preferred_language?: PreferredLanguage;
}

export interface PatientIdentificationInput {
  type: 'abha' | 'patient_id' | 'new_registration';
  identifierValue?: string;
  registrationData?: CreatePatientInput;
}
