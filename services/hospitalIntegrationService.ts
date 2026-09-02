import { mockDb } from '@/lib/supabase/mockDb';
import { HISSyncResult, IntegrationLog } from '@/types/integration';

export interface IHospitalIntegrationService {
  pushClinicalSummary(sessionId: string, payload: any): Promise<HISSyncResult>;
  getPatientRecord(abhaIdOrPhone: string): Promise<any>;
  updateConsultationStatus(sessionId: string, status: string): Promise<boolean>;
  getSyncLogs(sessionId: string): Promise<IntegrationLog[]>;
}

export class MockHospitalIntegrationService implements IHospitalIntegrationService {
  private hospitalSystemName = 'Ayushman HIS / NIC e-Hospital Gateway';

  /**
   * Pushes the approved clinical summary and digitized record to the hospital EMR/HIS.
   */
  async pushClinicalSummary(sessionId: string, payload: any): Promise<HISSyncResult> {
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 300));

    const externalRefId = 'HIS-DOC-' + Math.floor(100000 + Math.random() * 900000);
    const syncTimestamp = new Date().toISOString();

    const response = {
      status: 'ACKNOWLEDGED',
      his_transaction_id: externalRefId,
      hl7_message_id: 'HL7-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      received_at: syncTimestamp,
    };

    // Audit log integration payload & response
    await mockDb.logIntegration(sessionId, this.hospitalSystemName, 'success', payload, response);

    return {
      success: true,
      external_id: externalRefId,
      synced_at: syncTimestamp,
      hospital_system: this.hospitalSystemName,
      message: `Clinical summary successfully transmitted to ${this.hospitalSystemName}. Reference: ${externalRefId}`,
      payload_summary: {
        chief_complaint: payload?.chief_complaint,
        sections_synced: Object.keys(payload || {}).length,
      },
    };
  }

  /**
   * Mock query to retrieve past clinical record from external hospital database.
   */
  async getPatientRecord(abhaIdOrPhone: string): Promise<any> {
    await new Promise((res) => setTimeout(res, 200));
    return {
      source: this.hospitalSystemName,
      patient_identifier: abhaIdOrPhone,
      last_visit_date: '2026-03-12',
      registered_department: 'General OPD',
      active_allergies: ['Penicillin (mild)'],
    };
  }

  /**
   * Update consultation status in hospital central queue.
   */
  async updateConsultationStatus(sessionId: string, status: string): Promise<boolean> {
    await mockDb.logIntegration(sessionId, this.hospitalSystemName, 'success', { action: 'status_update', status }, { ok: true });
    return true;
  }

  /**
   * Fetch sync audit logs for a given session.
   */
  async getSyncLogs(sessionId: string): Promise<IntegrationLog[]> {
    return mockDb.getIntegrationLogs(sessionId);
  }
}

// Export singleton instance for app-wide use
export const HospitalIntegrationService = new MockHospitalIntegrationService();
