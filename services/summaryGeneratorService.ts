import { mockDb } from '@/lib/supabase/mockDb';
import { ClinicalService } from './clinicalService';
import { DocumentProcessingService } from './documentProcessingService';
import { AyushService } from './ayushService';
import {
  StructuredClinicalSummary,
  ClinicalSummaryStructured,
  AyushSummaryStructured,
  CreateClinicalSummaryInput,
} from '@/types/summary';

export class SummaryGeneratorService {
  /**
   * Generates or regenerates a comprehensive clinical summary (Modern Medicine or AYUSH)
   */
  static async generateSummary(
    sessionId: string,
    patientId: string
  ): Promise<StructuredClinicalSummary> {
    const session = await mockDb.getIntakeSessionById(sessionId);
    const consultationMode = session?.consultation_mode || 'MODERN_MEDICINE';

    // -------------------------------------------------------------
    // AYUSH / Ayurveda Summary Synthesis (Part 9)
    // -------------------------------------------------------------
    if (consultationMode === 'AYUSH') {
      return await this.generateAyushSummary(sessionId, patientId);
    }

    // -------------------------------------------------------------
    // Modern Medicine Summary Synthesis (11 Sections)
    // -------------------------------------------------------------
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
            medicationsMap.set(key, {
              ...existing,
              source: 'both',
              dosage: existing.dosage || m.dosage,
              frequency: existing.frequency || m.frequency,
            });
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
    const allergiesList: Array<{ allergen: string; type?: string }> = [];
    if (history?.allergies && history.allergies.length > 0) {
      history.allergies.forEach((a) => {
        if (a.allergen && !a.allergen.toLowerCase().includes('no known')) {
          allergiesList.push({ allergen: a.allergen, type: a.type || 'drug' });
        }
      });
    }
    if (allergiesList.length === 0) {
      allergiesList.push({ allergen: 'No known allergies reported (NKDA)', type: 'other' });
    }

    // 7. Family History
    const familyHistory: string[] = [];
    if (history?.family_history && history.family_history.length > 0) {
      history.family_history.forEach((f) => {
        if (f.condition && !f.condition.toLowerCase().includes('no significant')) {
          familyHistory.push(`${f.relation || 'Relative'}: ${f.condition}`);
        }
      });
    }
    if (familyHistory.length === 0) {
      familyHistory.push('No significant hereditary conditions noted in immediate family.');
    }

    // 8. Personal History
    const personalHistory: string[] = [];
    if (history?.personal_history) {
      const p = history.personal_history;
      if (p.smoking) personalHistory.push(`Smoking: ${p.smoking}`);
      if (p.alcohol) personalHistory.push(`Alcohol: ${p.alcohol}`);
      if (p.diet) personalHistory.push(`Diet: ${p.diet}`);
      if (p.occupation) personalHistory.push(`Occupation: ${p.occupation}`);
      if (p.exercise) personalHistory.push(`Physical activity: ${p.exercise}`);
    }
    if (personalHistory.length === 0) {
      personalHistory.push('Lifestyle and personal habits within standard parameters.');
    }

    // 9. Prior Investigations (Extracted from Lab Reports)
    const priorInvestigations: Array<{
      test: string;
      result: string;
      unit?: string;
      referenceRange?: string;
      isAbnormal?: boolean;
      date?: string;
    }> = [];

    documents.forEach((doc) => {
      if (doc.extraction?.labResults) {
        doc.extraction.labResults.forEach((lr) => {
          priorInvestigations.push({
            test: lr.test || lr.testName || 'Lab Test',
            result: String(lr.value),
            unit: lr.unit,
            referenceRange: lr.referenceRange,
            isAbnormal: Boolean(lr.isOutsideRange || lr.isAbnormal),
            date: doc.document_date || undefined,
          });
        });
      }
    });

    // 10. Important Alerts (Red Flags + Abnormal Lab Values)
    const importantAlerts: string[] = [];
    redFlags.forEach((rf) => {
      if (rf.status === 'active') {
        importantAlerts.push(`🚨 EMERGENCY ALERT (${rf.alert_type}): ${rf.matched_terms?.join(', ') || 'Critical symptom reported'}`);
      }
    });

    priorInvestigations
      .filter((inv) => inv.isAbnormal)
      .forEach((inv) => {
        importantAlerts.push(`⚠️ ABNORMAL LAB VALUE: ${inv.test} (${inv.result} ${inv.unit || ''}) outside normal limits (${inv.referenceRange || 'Ref Range N/A'})`);
      });

    // 11. Structured Summary Object
    const structuredSummary: ClinicalSummaryStructured = {
      chief_complaint: history?.chief_complaint || 'General Clinical Intake Consultation',
      history_of_present_illness: history?.hpi
        ? `Patient reports: ${Object.entries(history.hpi)
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
            .join('; ')}`
        : 'Patient reports for clinical assessment.',
      past_medical_history: pastMedicalHistory,
      past_surgical_history: pastSurgicalHistory,
      current_medications: currentMedications,
      allergies: allergiesList,
      family_history: familyHistory,
      personal_history: personalHistory,
      review_of_systems: history?.review_of_systems || {},
      prior_investigations: priorInvestigations,
      important_alerts: importantAlerts,
    };

    const summaryText = `
PATIENT CLINICAL SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

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
${structuredSummary.personal_history.join('\n')}

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

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. This clinical intake summary was compiled by MediKiosk AI for physician review and does not provide medical evaluation or treatment recommendations.
    `.trim();

    const input: CreateClinicalSummaryInput = {
      patient_id: patientId,
      intake_session_id: sessionId,
      consultation_mode: 'MODERN_MEDICINE',
      summary_content: summaryText,
      structured_summary: structuredSummary,
      status: 'draft',
    };

    return await mockDb.saveClinicalSummary(input);
  }

  /**
   * Generates the 11-section Ayurvedic Clinical Intake Summary (Part 9)
   */
  private static async generateAyushSummary(
    sessionId: string,
    patientId: string
  ): Promise<StructuredClinicalSummary> {
    const patient = await mockDb.getPatientById(patientId);
    const ayushAssessment = await AyushService.getAssessment(sessionId);
    const redFlags = await mockDb.getRedFlagAlertsBySessionId(sessionId);
    const documents = await DocumentProcessingService.getSessionDocuments(sessionId);

    // Synthesize investigations from documents
    const investigations: Array<{
      test: string;
      result: string;
      unit?: string;
      referenceRange?: string;
      isAbnormal?: boolean;
      date?: string;
    }> = [];

    documents.forEach((doc) => {
      if (doc.extraction?.labResults) {
        doc.extraction.labResults.forEach((lr) => {
          investigations.push({
            test: lr.test || lr.testName || 'Lab Test',
            result: String(lr.value),
            unit: lr.unit,
            referenceRange: lr.referenceRange,
            isAbnormal: Boolean(lr.isOutsideRange || lr.isAbnormal),
            date: doc.document_date || undefined,
          });
        });
      }
    });

    // Synthesize medications
    const medicationsList: Array<{ name: string; dosage?: string; frequency?: string; source: 'patient' | 'document' | 'both' }> = [];
    documents.forEach((doc) => {
      if (doc.extraction?.medications) {
        doc.extraction.medications.forEach((m) => {
          medicationsList.push({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            source: 'document',
          });
        });
      }
    });

    // Important Alerts
    const alerts: string[] = [];
    redFlags.forEach((rf) => {
      if (rf.status === 'active') {
        alerts.push(`🚨 EMERGENCY RED FLAG (${rf.alert_type}): ${rf.matched_terms?.join(', ') || 'Critical symptom reported'}`);
      }
    });

    investigations
      .filter((inv) => inv.isAbnormal)
      .forEach((inv) => {
        alerts.push(`⚠️ INVESTIGATION OUTSIDE LIMITS: ${inv.test} (${inv.result} ${inv.unit || ''})`);
      });

    const presentingComplaint = ayushAssessment?.presenting_complaint || 'Ayurvedic Clinical Intake Consultation';
    const duration = ayushAssessment?.duration || 'Not specified';
    const previousTreatment = ayushAssessment?.previous_treatment || 'None reported';
    const currentSymptoms = ayushAssessment?.current_symptoms && ayushAssessment.current_symptoms.length > 0
      ? ayushAssessment.current_symptoms
      : [presentingComplaint];

    const prakritiAssessment = ayushAssessment?.prakriti || {
      body_build: 'Moderate / Madhyama frame',
      skin_type: 'Normal skin texture',
      temperament: 'Balanced mental state',
    };

    const vikritiAssessment = ayushAssessment?.vikriti || {
      digestive_changes: 'Digestive pattern documented during interview',
      energy_changes: 'Vitality level documented',
    };

    const aharaAssessment = ayushAssessment?.ahara_assessment || {
      food_types: 'Regular mixed diet',
      meal_timing: 'Consistent meal hours',
      water_intake: '2 litres daily',
    };

    const viharaAssessment = ayushAssessment?.vihara_assessment || {
      daily_routine: 'Normal daily routine',
      physical_activity: 'Routine daily activities',
      sleep: 'Normal nighttime rest',
    };

    const dashavidhaPariksha = {
      prakriti: ayushAssessment?.prakriti?.dominant_dosha_tendency || prakritiAssessment.body_build || 'Prakriti traits observed',
      vikriti: vikritiAssessment.digestive_changes || 'Current doshic imbalance indicators',
      sara: ayushAssessment?.sara || 'Madhyama Sara (Moderate tissue vitality)',
      samhanana: ayushAssessment?.samhanana || 'Madhyama Samhanana (Moderate compact build)',
      pramana: ayushAssessment?.pramana || 'Madhyama Pramana (Normal body proportion)',
      satmya: ayushAssessment?.satmya || 'Satmya to regional traditional diet',
      sattva: ayushAssessment?.sattva || 'Madhyama Sattva (Balanced mental strength)',
      ahara_shakti: ayushAssessment?.ahara_shakti || aharaAssessment.appetite || 'Madhyama Ahara Shakti',
      vyayama_shakti: ayushAssessment?.vyayama_shakti || 'Madhyama Vyayama Shakti (Normal physical exertion)',
      vaya: ayushAssessment?.vaya || AyushService.mapAgeToVaya(patient?.age || 45),
    };

    const ayushSummaryStructured: AyushSummaryStructured = {
      presenting_complaint: presentingComplaint,
      duration,
      previous_treatment: previousTreatment,
      current_symptoms: currentSymptoms,
      prakriti_assessment: prakritiAssessment,
      vikriti_assessment: vikritiAssessment,
      ahara_assessment: aharaAssessment,
      vihara_assessment: viharaAssessment,
      dashavidha_pariksha: dashavidhaPariksha,
      previous_medical_treatment_history: [previousTreatment],
      medications: medicationsList,
      uploaded_investigations: investigations,
      important_alerts: alerts,
    };

    // Modern medicine fallback object so legacy components do not break
    const allopathicFallback: ClinicalSummaryStructured = {
      chief_complaint: presentingComplaint,
      history_of_present_illness: `Duration: ${duration}. Previous treatment: ${previousTreatment}.`,
      past_medical_history: [previousTreatment],
      past_surgical_history: ['None reported'],
      current_medications: medicationsList,
      allergies: [{ allergen: 'No known allergies reported', type: 'other' }],
      family_history: ['Standard family history'],
      personal_history: [
        `Diet: ${aharaAssessment.food_types || 'Normal'}`,
        `Routine: ${viharaAssessment.daily_routine || 'Standard'}`,
        `Sleep: ${viharaAssessment.sleep || 'Normal'}`,
      ],
      review_of_systems: {},
      prior_investigations: investigations,
      important_alerts: alerts,
    };

    const summaryText = `
AYURVEDIC CLINICAL INTAKE SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

1. PATIENT INFORMATION:
• Name: ${patient?.full_name || 'Anonymous'}
• Age: ${patient?.age || 'N/A'} yrs | Gender: ${patient?.gender || 'N/A'}
• ABHA ID: ${patient?.abha_id || 'Not linked'}

2. PRESENTING COMPLAINT:
${presentingComplaint} (Duration: ${duration})

3. CURRENT SYMPTOMS:
${currentSymptoms.map((s) => `• ${s}`).join('\n')}

4. PRAKRITI ASSESSMENT (CONSTITUTION):
• Body Build: ${prakritiAssessment.body_build || 'Not specified'}
• Skin Type: ${prakritiAssessment.skin_type || 'Not specified'}
• Temperament: ${prakritiAssessment.temperament || 'Not specified'}

5. VIKRITI ASSESSMENT (CURRENT IMBALANCE):
• Digestive Changes: ${vikritiAssessment.digestive_changes || 'None reported'}
• Energy Changes: ${vikritiAssessment.energy_changes || 'None reported'}

6. AHARA ASSESSMENT (DIETARY HABITS):
• Food Types: ${aharaAssessment.food_types || 'Mixed'}
• Meal Timing: ${aharaAssessment.meal_timing || 'Regular'}
• Water Intake: ${aharaAssessment.water_intake || 'Standard'}

7. VIHARA ASSESSMENT (LIFESTYLE & ROUTINE):
• Daily Routine: ${viharaAssessment.daily_routine || 'Standard'}
• Physical Activity: ${viharaAssessment.physical_activity || 'Moderate'}
• Sleep Routine: ${viharaAssessment.sleep || 'Normal'}
• Stress Level: ${viharaAssessment.stress || 'Manageable'}

8. DASHAVIDHA PARIKSHA (10 EXTENDED PARAMETERS):
1. Prakriti: ${dashavidhaPariksha.prakriti}
2. Vikriti: ${dashavidhaPariksha.vikriti}
3. Sara: ${dashavidhaPariksha.sara}
4. Samhanana: ${dashavidhaPariksha.samhanana}
5. Pramana: ${dashavidhaPariksha.pramana}
6. Satmya: ${dashavidhaPariksha.satmya}
7. Sattva: ${dashavidhaPariksha.sattva}
8. Ahara Shakti: ${dashavidhaPariksha.ahara_shakti}
9. Vyayama Shakti: ${dashavidhaPariksha.vyayama_shakti}
10. Vaya: ${dashavidhaPariksha.vaya}

9. PREVIOUS MEDICAL / TREATMENT HISTORY:
• ${previousTreatment}

10. MEDICATIONS & UPLOADED INVESTIGATIONS:
${
  medicationsList.length > 0
    ? medicationsList.map((m) => `• Medicine: ${m.name} (${m.dosage || ''})`).join('\n')
    : '• No active medications reported'
}
${
  investigations.length > 0
    ? investigations.map((i) => `• Lab: ${i.test} = ${i.result} (${i.unit || ''})`).join('\n')
    : '• No lab reports uploaded'
}

11. IMPORTANT ALERTS:
${alerts.length > 0 ? alerts.map((a) => `• ${a}`).join('\n') : '• No active safety alerts'}

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. The AI intake platform collects and structures patient-reported findings for qualified Ayurvedic physician assessment. It does not provide final diagnoses, dosha conclusions, or medical prescriptions.
    `.trim();

    const input: CreateClinicalSummaryInput = {
      patient_id: patientId,
      intake_session_id: sessionId,
      consultation_mode: 'AYUSH',
      summary_content: summaryText,
      structured_summary: allopathicFallback,
      ayush_summary: ayushSummaryStructured,
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
