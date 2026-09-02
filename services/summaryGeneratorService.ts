import { mockDb } from '@/lib/supabase/mockDb';
import { ClinicalService } from './clinicalService';
import { DocumentProcessingService } from './documentProcessingService';
import {
  StructuredClinicalSummary,
  ClinicalSummaryStructured,
  CreateClinicalSummaryInput,
} from '@/types/summary';

export class SummaryGeneratorService {
  /**
   * Generates or regenerates a comprehensive 11-section clinical summary
   */
  static async generateSummary(
    sessionId: string,
    patientId: string
  ): Promise<StructuredClinicalSummary> {
    // 1. Fetch Segment 2 Conversational History & Alerts
    const history = await ClinicalService.getClinicalHistory(sessionId);
    const redFlags = await mockDb.getRedFlagAlertsBySessionId(sessionId);

    // 2. Fetch Segment 3 Medical Documents & Extractions
    const documents = await DocumentProcessingService.getSessionDocuments(sessionId);

    // 3. Synthesize Past Medical History (Combine Patient Reported + Document Extracted)
    const pmhSet = new Set<string>();
    if (history?.past_medical_history) {
      history.past_medical_history.forEach((pmh) => {
        if (pmh.status === 'yes' && pmh.condition) {
          pmhSet.add(`${pmh.condition} (Patient reported)`);
        }
      });
    }
    documents.forEach((doc) => {
      if (doc.extraction?.diagnoses) {
        doc.extraction.diagnoses.forEach((diag) => {
          pmhSet.add(`${diag} (Document dated ${doc.document_date || 'prior'})`);
        });
      }
    });
    const pastMedicalHistory = Array.from(pmhSet);
    if (pastMedicalHistory.length === 0) {
      pastMedicalHistory.push('No significant past medical conditions reported or identified.');
    }

    // 4. Synthesize Past Surgical History
    const surgicalList: string[] = [];
    if (history?.surgical_history) {
      history.surgical_history.forEach((s) => {
        if (s.surgery && !s.surgery.toLowerCase().includes('no')) {
          surgicalList.push(`${s.surgery} (Patient reported)`);
        }
      });
    }
    documents.forEach((doc) => {
      if (doc.extraction?.procedures) {
        doc.extraction.procedures.forEach((proc) => {
          surgicalList.push(`${proc} (Document dated ${doc.document_date || 'prior'})`);
        });
      }
    });
    const pastSurgicalHistory = surgicalList.length > 0 ? surgicalList : ['No prior surgeries reported.'];

    // 5. Synthesize Current Medications
    const medicationsMap = new Map<string, { name: string; dosage?: string; frequency?: string; source: 'patient' | 'document' | 'both' }>();

    if (history?.medications) {
      history.medications.forEach((m) => {
        if (m.name && !m.name.toLowerCase().includes('no regular')) {
          medicationsMap.set(m.name.toLowerCase(), {
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            source: 'patient',
          });
        }
      });
    }

    documents.forEach((doc) => {
      if (doc.extraction?.medications) {
        doc.extraction.medications.forEach((m) => {
          const key = m.name.toLowerCase();
          if (medicationsMap.has(key)) {
            const existing = medicationsMap.get(key)!;
            existing.source = 'both';
            if (m.dosage && !existing.dosage) existing.dosage = m.dosage;
            if (m.frequency && !existing.frequency) existing.frequency = m.frequency;
          } else {
            medicationsMap.set(key, {
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              source: 'document',
            });
          }
        });
      }
    });

    const currentMedications = Array.from(medicationsMap.values());

    // 6. Synthesize Allergies
    const allergies = history?.allergies && history.allergies.length > 0
      ? history.allergies.map((a) => ({ allergen: a.allergen, type: a.type }))
      : [{ allergen: 'No known drug or food allergies reported.' }];

    // 7. Synthesize Family History
    const familyHistory = history?.family_history && history.family_history.length > 0
      ? history.family_history.map((f) => `${f.relation}: ${f.condition}`)
      : ['No notable early family disease history reported.'];

    // 8. Personal History
    const personalHistory: string[] = history?.personal_history?.diet
      ? [`Diet & Lifestyle: ${history.personal_history.diet}`]
      : ['Standard diet and lifestyle reported.'];

    // 9. Prior Investigations (Lab Reports + Abnormal Highlighting)
    const priorInvestigations: ClinicalSummaryStructured['prior_investigations'] = [];
    documents.forEach((doc) => {
      if (doc.extraction?.labResults) {
        doc.extraction.labResults.forEach((lab) => {
          priorInvestigations.push({
            test: lab.test,
            result: `${lab.value} ${lab.unit || ''}`.trim(),
            referenceRange: lab.referenceRange,
            isAbnormal: lab.isOutsideRange,
            date: doc.document_date || undefined,
          });
        });
      }
    });

    // 10. Important Alerts (Red Flags from Interview)
    const importantAlerts: string[] = [];
    if (redFlags && redFlags.length > 0) {
      redFlags.forEach((rf: any) => {
        importantAlerts.push(`🚨 EMERGENCY TRIAGE ALERT: ${rf.alert_type} flagged at intake. Matched symptoms: ${(rf.matched_terms || []).join(', ')}.`);
      });
    }
    if (priorInvestigations.some((p) => p.isAbnormal)) {
      importantAlerts.push('⚠️ DOCUMENT ALERT: One or more lab investigation values fall outside the printed reference range.');
    }

    // 11. Chief Complaint & HPI Synthesis
    const chiefComplaint = history?.chief_complaint || 'General health evaluation';
    const hpiDetails = history?.hpi
      ? Object.entries(history.hpi)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join('; ')
      : 'Patient presented for clinical assessment.';
    const historyOfPresentIllness = `Patient reports chief concern of "${chiefComplaint}". ${hpiDetails}.`;

    // Build Structured JSON Summary
    const structuredSummary: ClinicalSummaryStructured = {
      chief_complaint: chiefComplaint,
      history_of_present_illness: historyOfPresentIllness,
      past_medical_history: pastMedicalHistory,
      past_surgical_history: pastSurgicalHistory,
      current_medications: currentMedications,
      allergies,
      family_history: familyHistory,
      personal_history: personalHistory,
      review_of_systems: history?.review_of_systems || { general: 'Denies acute systemic distress' },
      prior_investigations: priorInvestigations,
      important_alerts: importantAlerts,
    };

    // Build Formatted Human-Readable Summary Text
    const summaryText = `
PATIENT CLINICAL INTAKE SUMMARY

1. CHIEF COMPLAINT:
${structuredSummary.chief_complaint}

2. HISTORY OF PRESENT ILLNESS:
${structuredSummary.history_of_present_illness}

3. PAST MEDICAL HISTORY:
${structuredSummary.past_medical_history.map((m) => `• ${m}`).join('\n')}

4. PAST SURGICAL HISTORY:
${structuredSummary.past_surgical_history.map((s) => `• ${s}`).join('\n')}

5. CURRENT MEDICATIONS:
${
  structuredSummary.current_medications.length > 0
    ? structuredSummary.current_medications
        .map((m) => `• ${m.name} ${m.dosage || ''} (${m.frequency || 'as prescribed'}) [Source: ${m.source}]`)
        .join('\n')
    : '• None reported'
}

6. ALLERGIES:
${structuredSummary.allergies.map((a) => `• ${a.allergen}`).join('\n')}

7. FAMILY HISTORY:
${structuredSummary.family_history.map((f) => `• ${f}`).join('\n')}

8. PERSONAL HISTORY:
${structuredSummary.personal_history}

9. PRIOR INVESTIGATIONS:
${
  structuredSummary.prior_investigations.length > 0
    ? structuredSummary.prior_investigations
        .map((inv) => `• ${inv.test}: ${inv.result} (Ref: ${inv.referenceRange || 'N/A'})${inv.isAbnormal ? ' [⚠️ OUTSIDE RANGE]' : ''}`)
        .join('\n')
    : '• No uploaded lab reports'
}

10. IMPORTANT ALERTS:
${
  structuredSummary.important_alerts.length > 0
    ? structuredSummary.important_alerts.map((a) => `• ${a}`).join('\n')
    : '• No active red-flag triggers'
}

CONFIDENTIALITY NOTICE: This clinical intake summary was compiled by MediKiosk AI for physician review and does not provide medical evaluation or treatment recommendations.
    `.trim();

    const input: CreateClinicalSummaryInput = {
      patient_id: patientId,
      intake_session_id: sessionId,
      summary_content: summaryText,
      structured_summary: structuredSummary,
      status: 'draft',
    };

    return await mockDb.saveClinicalSummary(input);
  }

  /**
   * Retrieve existing clinical summary for session
   */
  static async getSummary(sessionId: string): Promise<StructuredClinicalSummary | null> {
    return await mockDb.getClinicalSummaryBySession(sessionId);
  }
}
