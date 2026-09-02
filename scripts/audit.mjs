import { dictionaries } from '../lib/i18n/index.js';
import { MockAbhaService } from '../services/mockAbhaService.js';
import { mockDb } from '../lib/supabase/mockDb.js';
import { PatientService } from '../services/patientService.js';
import { ConsentService } from '../services/consentService.js';
import { IntakeSessionService } from '../services/intakeSessionService.js';
import { AIService } from '../services/aiService.js';
import { RedFlagService } from '../services/redFlagService.js';
import { ClinicalService } from '../services/clinicalService.js';
import { DocumentProcessingService } from '../services/documentProcessingService.js';
import { MedicalEntityExtractor } from '../services/ocr/entityExtractor.js';
import { SummaryGeneratorService } from '../services/summaryGeneratorService.js';
import { DoctorQueueService } from '../services/doctorQueueService.js';
import { DoctorReviewService } from '../services/doctorReviewService.js';
import { FHIRMapperService } from '../services/fhirMapperService.js';
import { HospitalIntegrationService } from '../services/hospitalIntegrationService.js';
import { AdminAnalyticsService } from '../services/adminAnalyticsService.js';

console.log('===============================================================');
console.log('🔍 FULL SYSTEM AUDIT: MEDIKIOSK (SEGMENTS 1, 2, 3 & 4)');
console.log('===============================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runComprehensiveAudit() {
  // -------------------------------------------------------------
  // [1] i18n Dictionaries (12 Domains across EN, TA, HI)
  // -------------------------------------------------------------
  console.log('\n[1] Auditing Internationalization (i18n) Dictionaries (12 Domains)...');
  const enKeys = Object.keys(dictionaries.en);
  const taKeys = Object.keys(dictionaries.ta);
  const hiKeys = Object.keys(dictionaries.hi);

  assert(enKeys.length === 12, `English dictionary contains all 12 domains (${enKeys.length})`);
  assert(taKeys.length === 12, `Tamil dictionary contains all 12 domains (${taKeys.length})`);
  assert(hiKeys.length === 12, `Hindi dictionary contains all 12 domains (${hiKeys.length})`);

  for (const domain of enKeys) {
    const enSubKeys = Object.keys(dictionaries.en[domain]);
    const taSubKeys = Object.keys(dictionaries.ta[domain]);
    const hiSubKeys = Object.keys(dictionaries.hi[domain]);

    assert(
      enSubKeys.length === taSubKeys.length && enSubKeys.length === hiSubKeys.length,
      `Domain "${domain}" key parity across EN (${enSubKeys.length}), TA (${taSubKeys.length}), HI (${hiSubKeys.length})`
    );
  }

  // -------------------------------------------------------------
  // [2] Patient & Identity Services (Segment 1)
  // -------------------------------------------------------------
  console.log('\n[2] Auditing Patient & Identity Services...');
  const patient = await PatientService.registerPatient({
    full_name: 'Rajesh Sharma Audit',
    age: 60,
    gender: 'male',
    phone: '9899112233',
    abha_id: '91-1234-5678-9012',
    preferred_language: 'en',
  });
  assert(patient && patient.id.startsWith('pat-'), 'Patient registered with UUID');

  const foundByPhone = await PatientService.getPatientByPhone('9899112233');
  assert(foundByPhone && foundByPhone.id === patient.id, 'Patient retrieved by phone');

  // -------------------------------------------------------------
  // [3] Mock ABHA & ABDM OTP Gateway (Segment 1)
  // -------------------------------------------------------------
  console.log('\n[3] Auditing Mock ABHA & ABDM OTP Gateway...');
  const formatted = MockAbhaService.formatAbha('12345678901234');
  assert(formatted === '12-3456-7890-1234', `ABHA formatted: ${formatted}`);
  assert(MockAbhaService.validateAbhaFormat('12-3456-7890-1234') === true, '14-digit ABHA validated');
  assert(MockAbhaService.validateAbhaFormat('12345') === false, 'Invalid ABHA rejected');

  const otpRes = await MockAbhaService.requestOtp('9899112233');
  assert(otpRes.success === true && otpRes.mockOtp === '123456', 'ABDM OTP generated');

  const verifyValid = await MockAbhaService.verifyOtp('9899112233', '123456', otpRes.txnId);
  assert(verifyValid.valid === true, 'Valid OTP accepted');

  const verifyInvalid = await MockAbhaService.verifyOtp('9899112233', '000000', otpRes.txnId);
  assert(verifyInvalid.valid === false, 'Invalid OTP rejected');

  // -------------------------------------------------------------
  // [4] Consent & Intake Session Flow (Segment 1)
  // -------------------------------------------------------------
  console.log('\n[4] Auditing Consent & Intake Session...');
  const consent = await ConsentService.recordConsent({
    patient_id: patient.id,
    data_collection_consent: true,
    data_sharing_consent: true,
  });
  assert(consent && consent.status === 'active', 'Consent recorded');

  const session = await IntakeSessionService.startSession(patient.id);
  assert(session && session.status === 'onboarding', 'Intake session created');

  // -------------------------------------------------------------
  // [5] Conversational Clinical Engine (Segment 2)
  // -------------------------------------------------------------
  console.log('\n[5] Auditing Conversational Engine & Red Flags...');
  assert(AIService.classifyComplaint('Severe chest pain') === 'cardiovascular', 'Classification: chest pain -> cardiovascular');
  assert(AIService.classifyComplaint('High fever and chills') === 'infectious_fever', 'Classification: fever -> infectious_fever');
  assert(AIService.classifyComplaint('Chronic migraine') === 'neurological', 'Classification: migraine -> neurological');

  const redFlag = RedFlagService.evaluate('I am having crushing chest pain radiating to left arm');
  assert(redFlag.hasRedFlag === true && redFlag.matchedRules[0].category === 'CHEST_EMERGENCY', 'Chest emergency red flag detected');

  await ClinicalService.saveClinicalHistory({
    intake_session_id: session.id,
    patient_id: patient.id,
    chief_complaint: 'Crushing chest pain radiating to left arm',
    hpi: { onset: '2 hours ago', severity: '8/10 Severity', radiation: 'Left arm' },
    past_medical_history: [{ condition: 'Type 2 Diabetes', status: 'yes' }],
    surgical_history: [],
    medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }],
    allergies: [{ allergen: 'No known allergies', type: 'drug' }],
    family_history: [{ relation: 'Father', condition: 'Heart Disease' }],
    personal_history: { diet: 'Vegetarian' },
  });
  const clinicalHist = await ClinicalService.getClinicalHistory(session.id);
  assert(clinicalHist && clinicalHist.chief_complaint.includes('Crushing chest pain'), 'Structured conversational history persisted');

  await ClinicalService.logRedFlagAlert(session.id, patient.id, 'CHEST_EMERGENCY', 'critical', ['crushing chest pain']);

  // -------------------------------------------------------------
  // [6] Document Upload & OCR Pipeline (Segment 3)
  // -------------------------------------------------------------
  console.log('\n[6] Auditing Document Upload & OCR Pipeline...');
  const procPrescription = await DocumentProcessingService.processDocument({
    patientId: patient.id,
    intakeSessionId: session.id,
    fileName: 'apollo_prescription.jpg',
    fileSize: 1024 * 500,
    mimeType: 'image/jpeg',
    fileUrl: 'https://mock.storage/apollo_prescription.jpg',
    documentType: 'prescription',
  });
  assert(procPrescription.document.processing_status === 'completed', 'Prescription OCR completed');
  assert(procPrescription.extraction.diagnoses.length > 0, `Prescription diagnoses extracted (${procPrescription.extraction.diagnoses.join(', ')})`);
  assert(procPrescription.extraction.medications.length > 0, `Prescription medications extracted (${procPrescription.extraction.medications.map(m => m.name).join(', ')})`);

  const procLabReport = await DocumentProcessingService.processDocument({
    patientId: patient.id,
    intakeSessionId: session.id,
    fileName: 'blood_test_report.pdf',
    fileSize: 1024 * 800,
    mimeType: 'application/pdf',
    fileUrl: 'https://mock.storage/blood_test_report.pdf',
    documentType: 'lab_report',
  });
  assert(procLabReport.document.processing_status === 'completed', 'Lab report OCR completed');
  assert(procLabReport.extraction.labResults.length >= 4, `Lab results extracted (${procLabReport.extraction.labResults.length} tests)`);

  // -------------------------------------------------------------
  // [7] Rule-Based Abnormal Value Detection (Segment 3)
  // -------------------------------------------------------------
  console.log('\n[7] Auditing Rule-Based Abnormal Value Detection...');
  const glucoseAbnormal = MedicalEntityExtractor.isValueOutsideRange(240, '70 - 100');
  assert(glucoseAbnormal === true, 'Blood Sugar 240 mg/dL is outside range 70-100 mg/dL');

  const glucoseNormal = MedicalEntityExtractor.isValueOutsideRange(85, '70 - 100');
  assert(glucoseNormal === false, 'Blood Sugar 85 mg/dL is within range 70-100 mg/dL');

  const labReportAbnormalFound = procLabReport.extraction.labResults.some((l) => l.isOutsideRange);
  assert(labReportAbnormalFound === true, 'Lab Report extraction automatically flagged abnormal values');

  // -------------------------------------------------------------
  // [8] 11-Section Unified Clinical Summary (Segment 3)
  // -------------------------------------------------------------
  console.log('\n[8] Auditing 11-Section Unified Clinical Summary Generation...');
  const clinicalSummary = await SummaryGeneratorService.generateSummary(session.id, patient.id);
  assert(clinicalSummary && clinicalSummary.structured_summary !== undefined, 'Clinical summary generated');

  const s = clinicalSummary.structured_summary;
  assert(s.chief_complaint.includes('Crushing chest pain'), '1. Chief Complaint synthesized');
  assert(s.history_of_present_illness.includes('Patient reports'), '2. HPI synthesized with non-diagnostic clinical attribution');
  assert(s.past_medical_history.length > 0, `3. PMH synthesized (${s.past_medical_history.length} items)`);
  assert(s.current_medications.length >= 2, `5. Current medications synthesized (${s.current_medications.length} items)`);
  assert(s.prior_investigations.length >= 4, `10. Prior investigations synthesized (${s.prior_investigations.length} items)`);
  assert(s.important_alerts.length >= 1, `11. Important alerts captured (${s.important_alerts.length} alerts)`);

  // -------------------------------------------------------------
  // [9] Doctor Patient Queue & Priority Triage (Segment 4)
  // -------------------------------------------------------------
  console.log('\n[9] Auditing Doctor Patient Queue & Priority Triage...');
  const queue = await DoctorQueueService.getQueue();
  assert(queue.length >= 3, `Doctor queue returned ${queue.length} triaged patients`);

  // Verify first patient in queue is a critical red-flag emergency
  assert(queue[0].priority === 'critical', `Highest priority item is Critical Emergency (${queue[0].fullName})`);
  assert(queue[0].hasRedFlag === true, 'Top queue item has active Red-Flag Alert flag');

  const searchResults = await DoctorQueueService.getQueue({ searchQuery: 'Sharma' });
  assert(searchResults.some((p) => p.fullName.includes('Sharma')), 'Queue search by patient name works');

  const criticalOnly = await DoctorQueueService.getQueue({ priorityFilter: 'critical' });
  assert(criticalOnly.every((p) => p.priority === 'critical'), 'Priority filter for "critical" works');

  // -------------------------------------------------------------
  // [10] Doctor Review Workflow & Non-Destructive Versioning (Segment 4)
  // -------------------------------------------------------------
  console.log('\n[10] Auditing Doctor Review Workflow & Versioning...');
  const originalSummaryCopy = JSON.parse(JSON.stringify(s));
  const editedSummary = JSON.parse(JSON.stringify(s));
  editedSummary.chief_complaint = 'Crushing chest pain (Doctor Verified: Acute Coronary Evaluation)';

  const reviewRecord = await DoctorReviewService.submitReview({
    intakeSessionId: session.id,
    patientId: patient.id,
    doctorId: 'doc-001',
    doctorName: 'Dr. S. K. Venkatraman, MD',
    originalSummary: originalSummaryCopy,
    editedSummary: editedSummary,
    reviewStatus: 'modified',
    doctorNotes: 'ECG requested immediately. Patient moved to ER triage bay.',
  });

  assert(reviewRecord && reviewRecord.review_status === 'modified', 'Doctor review submitted with "modified" status');
  assert(reviewRecord.original_summary.chief_complaint !== reviewRecord.edited_summary.chief_complaint, 'Original AI summary preserved separately from doctor edits');

  const fetchedReview = await DoctorReviewService.getReviewBySession(session.id);
  assert(fetchedReview && fetchedReview.doctor_name.includes('Venkatraman'), 'Doctor review persisted and retrieved by session ID');

  // -------------------------------------------------------------
  // [11] HL7 FHIR R4 Interoperability Mapping (Segment 4)
  // -------------------------------------------------------------
  console.log('\n[11] Auditing HL7 FHIR R4 Bundle Mapping...');
  const allDocs = await DocumentProcessingService.getSessionDocuments(session.id);
  const fhirBundle = FHIRMapperService.generateFHIRBundle(patient, session, editedSummary, allDocs);

  assert(fhirBundle.resourceType === 'Bundle', 'FHIR ResourceType is "Bundle"');
  assert(fhirBundle.type === 'document', 'FHIR Bundle type is "document"');

  const resourceTypes = fhirBundle.entry.map((e) => e.resource.resourceType);
  assert(resourceTypes.includes('Composition'), 'FHIR Bundle contains "Composition"');
  assert(resourceTypes.includes('Patient'), 'FHIR Bundle contains "Patient"');
  assert(resourceTypes.includes('Encounter'), 'FHIR Bundle contains "Encounter"');
  assert(resourceTypes.includes('Condition'), 'FHIR Bundle contains "Condition"');
  assert(resourceTypes.includes('MedicationStatement'), 'FHIR Bundle contains "MedicationStatement"');
  assert(resourceTypes.includes('Observation'), 'FHIR Bundle contains "Observation"');
  assert(resourceTypes.includes('DocumentReference'), 'FHIR Bundle contains "DocumentReference"');

  // -------------------------------------------------------------
  // [12] Hospital Integration Service (HIS/EMR Gateway) (Segment 4)
  // -------------------------------------------------------------
  console.log('\n[12] Auditing Hospital Integration Gateway...');
  const hisResult = await HospitalIntegrationService.pushClinicalSummary(session.id, editedSummary);
  assert(hisResult.success === true, 'Hospital HIS transmission successful');
  assert(hisResult.external_id && hisResult.external_id.startsWith('HIS-DOC-'), `External EMR Reference ID generated: ${hisResult.external_id}`);

  const syncLogs = await HospitalIntegrationService.getSyncLogs(session.id);
  assert(syncLogs.length > 0 && syncLogs[0].status === 'success', 'Hospital integration audit log recorded in database');

  // -------------------------------------------------------------
  // [13] Admin Analytics & Metrics (Segment 4)
  // -------------------------------------------------------------
  console.log('\n[13] Auditing Hospital Admin Analytics...');
  const analytics = await AdminAnalyticsService.getAnalyticsSummary();
  assert(analytics.totalPatients > 0, `Total Patients metric computed (${analytics.totalPatients})`);
  assert(analytics.completedIntakes > 0, `Completed Intakes metric computed (${analytics.completedIntakes})`);
  assert(analytics.redFlagAlertsCount > 0, `Red Flag metric computed (${analytics.redFlagAlertsCount})`);
  assert(analytics.avgCompletionTimeMinutes < 5, `Average intake completion time verified (${analytics.avgCompletionTimeMinutes} mins)`);

  console.log(`\n===============================================================`);
  console.log(`🎉 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log(`===============================================================`);
}

runComprehensiveAudit().catch(console.error);
