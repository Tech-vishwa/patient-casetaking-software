export interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document' | 'collection' | 'transaction';
  timestamp: string;
  entry: Array<{
    fullUrl?: string;
    resource: FHIRResource;
  }>;
}

export interface HISSyncResult {
  success: boolean;
  external_id?: string;
  synced_at: string;
  hospital_system: string;
  message: string;
  payload_summary?: any;
}

export interface IntegrationLog {
  id: string;
  intake_session_id: string;
  external_system: string;
  status: 'success' | 'failed' | 'pending';
  payload: any;
  response: any;
  created_at: string;
}
