import { Patient } from '@/types/patient';
import { IntakeSession } from '@/types/intakeSession';
import { ClinicalSummaryStructured } from '@/types/summary';
import { MedicalDocument } from '@/types/document';
import { FHIRBundle } from '@/types/integration';

export class FHIRMapperService {
  /**
   * Transforms internal MediKiosk structured intake records into standard HL7 FHIR R4 Document Bundle.
   */
  static generateFHIRBundle(
    patient: Patient,
    session: IntakeSession,
    summary: ClinicalSummaryStructured,
    documents: MedicalDocument[] = []
  ): FHIRBundle {
    const bundleId = `bundle-medikiosk-${session.id}`;
    const timestamp = new Date().toISOString();

    const entries: FHIRBundle['entry'] = [];

    // 1. FHIR Composition / Document Header
    entries.push({
      fullUrl: `urn:uuid:composition-${session.id}`,
      resource: {
        resourceType: 'Composition',
        id: `comp-${session.id}`,
        status: 'final',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '34133-9',
              display: 'Summary of episode note',
            },
          ],
          text: 'AI-Powered Pre-Consultation Clinical Intake Summary',
        },
        subject: {
          reference: `Patient/${patient.id}`,
          display: patient.full_name,
        },
        date: timestamp,
        title: 'MediKiosk Clinical Intake Summary',
      },
    });

    // 2. FHIR Patient Resource
    entries.push({
      fullUrl: `urn:uuid:patient-${patient.id}`,
      resource: {
        resourceType: 'Patient',
        id: patient.id,
        identifier: [
          ...(patient.abha_id
            ? [
                {
                  system: 'https://healthid.abdm.gov.in',
                  value: patient.abha_id,
                  type: { text: 'Ayushman Bharat Health Account (ABHA)' },
                },
              ]
            : []),
          {
            system: 'https://ayushman.gov.in/patient-id',
            value: patient.id,
            type: { text: 'Hospital Kiosk Record ID' },
          },
        ],
        name: [
          {
            use: 'official',
            text: patient.full_name,
          },
        ],
        telecom: [
          {
            system: 'phone',
            value: patient.phone,
            use: 'mobile',
          },
        ],
        gender: patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'other',
        birthDate: new Date(Date.now() - patient.age * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    });

    // 3. FHIR Encounter Resource
    entries.push({
      fullUrl: `urn:uuid:encounter-${session.id}`,
      resource: {
        resourceType: 'Encounter',
        id: session.id,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'Ambulatory / Kiosk Intake',
        },
        subject: {
          reference: `Patient/${patient.id}`,
        },
        period: {
          start: session.started_at,
          end: session.completed_at || timestamp,
        },
      },
    });

    // 4. FHIR Condition (Chief Complaint & Problem Details)
    entries.push({
      fullUrl: `urn:uuid:condition-cc-${session.id}`,
      resource: {
        resourceType: 'Condition',
        id: `cond-cc-${session.id}`,
        clinicalStatus: {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
        },
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item',
                display: 'Chief Complaint',
              },
            ],
          },
        ],
        code: {
          text: summary.chief_complaint,
        },
        subject: { reference: `Patient/${patient.id}` },
        note: [{ text: summary.history_of_present_illness }],
      },
    });

    // 5. FHIR Conditions (Past Medical History)
    summary.past_medical_history.forEach((pmh, idx) => {
      entries.push({
        fullUrl: `urn:uuid:condition-pmh-${idx}-${session.id}`,
        resource: {
          resourceType: 'Condition',
          id: `cond-pmh-${idx}`,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'resolved' }],
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'history',
                  display: 'Past Medical History',
                },
              ],
            },
          ],
          code: { text: pmh },
          subject: { reference: `Patient/${patient.id}` },
        },
      });
    });

    // 6. FHIR MedicationStatement Resources
    summary.current_medications.forEach((med, idx) => {
      entries.push({
        fullUrl: `urn:uuid:medication-${idx}-${session.id}`,
        resource: {
          resourceType: 'MedicationStatement',
          id: `med-${idx}`,
          status: 'active',
          medicationCodeableConcept: {
            text: `${med.name} ${med.dosage || ''}`.trim(),
          },
          subject: { reference: `Patient/${patient.id}` },
          dosage: [
            {
              text: med.frequency || 'As directed',
            },
          ],
          note: [{ text: `Reported source: ${med.source}` }],
        },
      });
    });

    // 7. FHIR Observations (Lab Investigations)
    summary.prior_investigations.forEach((inv, idx) => {
      entries.push({
        fullUrl: `urn:uuid:observation-${idx}-${session.id}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-${idx}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory',
                },
              ],
            },
          ],
          code: { text: inv.test },
          subject: { reference: `Patient/${patient.id}` },
          valueString: `${inv.result} ${inv.unit || ''}`.trim(),
          referenceRange: [
            {
              text: inv.referenceRange || 'Standard Lab Range',
            },
          ],
          interpretation: inv.isAbnormal
            ? [
                {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                      code: 'A',
                      display: 'Abnormal / Outside Range',
                    },
                  ],
                },
              ]
            : undefined,
        },
      });
    });

    // 8. FHIR DocumentReference Resources (Uploaded Medical Records)
    documents.forEach((doc, idx) => {
      entries.push({
        fullUrl: `urn:uuid:docref-${doc.id}`,
        resource: {
          resourceType: 'DocumentReference',
          id: doc.id,
          status: 'current',
          type: {
            text: doc.document_type.replace('_', ' ').toUpperCase(),
          },
          subject: { reference: `Patient/${patient.id}` },
          date: doc.document_date ? new Date(doc.document_date).toISOString() : doc.created_at,
          content: [
            {
              attachment: {
                contentType: doc.mime_type || 'image/jpeg',
                url: doc.file_url,
                title: doc.file_name,
                size: doc.file_size,
              },
            },
          ],
        },
      });
    });

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      entry: entries,
    };
  }
}
