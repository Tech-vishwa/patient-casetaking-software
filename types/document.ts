export type MedicalDocumentType =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'other';

export type DocumentProcessingStatus =
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ExtractedLabResult {
  test: string;
  testName?: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  isOutsideRange?: boolean;
  isAbnormal?: boolean;
}

export interface ExtractedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  diagnoses: string[];
  medications: ExtractedMedication[];
  labResults: ExtractedLabResult[];
  procedures: string[];
  documentDate?: string | null;
  confidence: number;
  raw_structured_data?: any;
  created_at: string;
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  intake_session_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  document_type: MedicalDocumentType;
  extracted_text?: string;
  processing_status: DocumentProcessingStatus;
  document_date?: string | null;
  extraction?: DocumentExtraction;
  created_at: string;
}

export interface CreateMedicalDocumentInput {
  patient_id: string;
  intake_session_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  document_type: MedicalDocumentType;
  document_date?: string | null;
}
