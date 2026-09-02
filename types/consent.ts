export type ConsentStatus = 'active' | 'revoked' | 'pending';

export interface ConsentRecord {
  id: string;
  patient_id: string;
  data_collection_consent: boolean;
  data_sharing_consent: boolean;
  consent_timestamp: string;
  status: ConsentStatus;
}

export interface CreateConsentInput {
  patient_id: string;
  data_collection_consent: boolean;
  data_sharing_consent: boolean;
}
