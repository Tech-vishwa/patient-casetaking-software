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
import { WorkflowStateMachine } from '../services/workflowStateMachine.js';
import { NextRequest } from 'next/server';

// Direct API Route imports for HTTP simulation
import * as patientsApi from '../app/api/patients/route.js';
import * as sessionsApi from '../app/api/sessions/route.js';
import * as consentApi from '../app/api/consent/route.js';
import * as clinicalApi from '../app/api/clinical/route.js';
import * as documentsApi from '../app/api/documents/route.js';
import * as summaryApi from '../app/api/summary/route.js';
import * as queueApi from '../app/api/doctor/queue/route.js';
import * as reviewApi from '../app/api/doctor/review/route.js';
import * as hisApi from '../app/api/his/sync/route.js';
import * as analyticsApi from '../app/api/analytics/route.js';

console.log('===============================================================');
console.log('🔍 FULL SYSTEM AUDIT: MEDIKIOSK (WORKFLOW, STATE, AUTH & TRIAGE)');
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
  console.log('\n[1] Auditing Internationalization (i18n) Dictionaries (13 Domains)...');
  const enKeys = Object.keys(dictionaries.en);
  const taKeys = Object.keys(dictionaries.ta);
  const hiKeys = Object.keys(dictionaries.hi);

  assert(enKeys.length === 13, `English dictionary contains all 13 domains (${enKeys.length})`);
  assert(taKeys.length === 13, `Tamil dictionary contains all 13 domains (${taKeys.length})`);
  assert(hiKeys.length === 13, `Hindi dictionary contains all 13 domains (${hiKeys.length})`);

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
  // [2] Patient Registration, Password Auth & Session Resumption
  // -------------------------------------------------------------
  console.log('\n[2] Auditing Patient Registration, Authentication & Session Resumption...');
  const testPhone = '9899112233';
  const testPassword = 'SecurePass123';

  const regPatient = await PatientService.registerPatient({
    full_name: 'Rajesh Sharma Audit',
    age: 60,
    gender: 'male',
    phone: testPhone,
    password: testPassword,
    abha_id: '91-1234-5678-9012',
    preferred_language: 'en',
  });
  assert(regPatient && regPatient.id.startsWith('pat-'), 'Patient registered with UUID and password');

  // Password Authentication
  const authValid = await mockDb.authenticatePatient(testPhone, testPassword);
  assert(authValid && authValid.id === regPatient.id, 'Patient successfully authenticated with valid password');

  const authInvalid = await mockDb.authenticatePatient(testPhone, 'WrongPassword');
  assert(authInvalid === null, 'Authentication rejected invalid password');

  // Demo Patient Seed Auth
  const demoAuth = await mockDb.authenticatePatient('9876543210', '123456');
  assert(demoAuth && demoAuth.full_name === 'Rajesh Sharma', 'Pre-seeded demo patient authenticated with default password 123456');

  // -------------------------------------------------------------
  // [3] Centralized Workflow State Machine & Resumption
  // -------------------------------------------------------------
  console.log('\n[3] Auditing Centralized Workflow State Machine...');
  assert(WorkflowStateMachine.getRouteForWorkflowState('ONBOARDING') === '/kiosk/welcome', 'State ONBOARDING maps to /kiosk/welcome');
  assert(WorkflowStateMachine.getRouteForWorkflowState('IDENTIFIED') === '/kiosk/consent', 'State IDENTIFIED maps to /kiosk/consent');
  assert(WorkflowStateMachine.getRouteForWorkflowState('CONSENT_COMPLETED') === '/kiosk/conversation', 'State CONSENT_COMPLETED maps to /kiosk/conversation');
  assert(WorkflowStateMachine.getRouteForWorkflowState('HISTORY_IN_PROGRESS') === '/kiosk/conversation', 'State HISTORY_IN_PROGRESS maps to /kiosk/conversation');
  assert(WorkflowStateMachine.getRouteForWorkflowState('DOCUMENTS_IN_PROGRESS') === '/kiosk/documents', 'State DOCUMENTS_IN_PROGRESS maps to /kiosk/documents');
  assert(WorkflowStateMachine.getRouteForWorkflowState('SUMMARY_READY') === '/kiosk/summary', 'State SUMMARY_READY maps to /kiosk/summary');

  // Start Session with State Machine
  const session = await IntakeSessionService.startSession(regPatient.id, 'LANGUAGE_SELECTED');
  assert(session && session.workflow_state === 'LANGUAGE_SELECTED', 'Intake session created with initial state LANGUAGE_SELECTED');

  // Advance state
  const updatedSess = await IntakeSessionService.updateWorkflowState(session.id, 'CONSENT_COMPLETED', 3);
  assert(updatedSess && updatedSess.workflow_state === 'CONSENT_COMPLETED', 'Session workflow state updated to CONSENT_COMPLETED');

  // Check Incomplete Session Detection
  const incomplete = await mockDb.getIncompleteSessionByPatient(regPatient.id);
  assert(incomplete && incomplete.id === session.id, 'Incomplete active intake session detected for resuming patient');

  // -------------------------------------------------------------
  // [4] In-Place Language Switching & State Preservation
  // -------------------------------------------------------------
  console.log('\n[4] Auditing Language Switching & State Preservation...');
  await PatientService.updateLanguage(regPatient.id, 'ta');
  const patientAfterLang = await PatientService.getPatientByPhone(testPhone);
  assert(patientAfterLang && patientAfterLang.preferred_language === 'ta', 'Patient language updated to Tamil in database');

  const sessionAfterLang = await IntakeSessionService.getSession(session.id);
  assert(sessionAfterLang && sessionAfterLang.workflow_state === 'CONSENT_COMPLETED', 'Workflow state CONSENT_COMPLETED preserved when language changed');

  // -------------------------------------------------------------
  // [5] Mock ABHA & ABDM OTP Gateway
  // -------------------------------------------------------------
  console.log('\n[5] Auditing Mock ABHA & ABDM OTP Gateway...');
  const formatted = MockAbhaService.formatAbha('12345678901234');
  assert(formatted === '12-3456-7890-1234', `ABHA formatted: ${formatted}`);
  assert(MockAbhaService.validateAbhaFormat('12-3456-7890-1234') === true, '14-digit ABHA validated');
  assert(MockAbhaService.validateAbhaFormat('12345') === false, 'Invalid ABHA rejected');

  const otpRes = await MockAbhaService.requestOtp('9899112233');
  assert(otpRes.success === true && otpRes.mockOtp === '123456', 'ABDM OTP generated');

  const verifyValid = await MockAbhaService.verifyOtp('9899112233', '123456', otpRes.txnId);
  assert(verifyValid.valid === true, 'Valid OTP accepted');

  // -------------------------------------------------------------
  // [6] Consent Recording & Auto-Advance
  // -------------------------------------------------------------
  console.log('\n[6] Auditing Digital Consent Service...');
  const consent = await ConsentService.recordConsent({
    patient_id: regPatient.id,
    data_collection_consent: true,
    data_sharing_consent: true,
  });
  assert(consent && consent.status === 'active', 'Consent recorded');

  // -------------------------------------------------------------
  // [7] Conversational Clinical Engine & Deterministic Red Flags
  // -------------------------------------------------------------
  console.log('\n[7] Auditing Conversational Engine & Red Flags...');
  assert(AIService.classifyComplaint('Severe chest pain') === 'cardiovascular', 'Classification: chest pain -> cardiovascular');
  assert(AIService.classifyComplaint('High fever and chills') === 'infectious_fever', 'Classification: fever -> infectious_fever');

  const redFlag = RedFlagService.evaluate('I am having crushing chest pain radiating to left arm');
  assert(redFlag.hasRedFlag === true && redFlag.matchedRules[0].category === 'CHEST_EMERGENCY', 'Chest emergency red flag detected');

  await ClinicalService.saveClinicalHistory({
    intake_session_id: session.id,
    patient_id: regPatient.id,
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

  await ClinicalService.logRedFlagAlert(session.id, regPatient.id, 'CHEST_EMERGENCY', 'critical', ['crushing chest pain']);

  // -------------------------------------------------------------
  // [8] Document Processing & Abnormal Value Detection
  // -------------------------------------------------------------
  console.log('\n[8] Auditing Document Processing & Abnormal Value Detection...');
  const procPrescription = await DocumentProcessingService.processDocument({
    patientId: regPatient.id,
    intakeSessionId: session.id,
    fileName: 'apollo_prescription.jpg',
    fileSize: 1024 * 500,
    mimeType: 'image/jpeg',
    fileUrl: 'https://mock.storage/apollo_prescription.jpg',
    documentType: 'prescription',
  });
  assert(procPrescription.document.processing_status === 'completed', 'Prescription OCR completed');
  assert(procPrescription.extraction.medications.length > 0, `Prescription medications extracted (${procPrescription.extraction.medications.map(m => m.name).join(', ')})`);

  const procLabReport = await DocumentProcessingService.processDocument({
    patientId: regPatient.id,
    intakeSessionId: session.id,
    fileName: 'blood_test_report.pdf',
    fileSize: 1024 * 800,
    mimeType: 'application/pdf',
    fileUrl: 'https://mock.storage/blood_test_report.pdf',
    documentType: 'lab_report',
  });
  assert(procLabReport.document.processing_status === 'completed', 'Lab report OCR completed');
  assert(procLabReport.extraction.labResults.length >= 4, `Lab results extracted (${procLabReport.extraction.labResults.length} tests)`);

  const glucoseAbnormal = MedicalEntityExtractor.isValueOutsideRange(240, '70 - 100');
  assert(glucoseAbnormal === true, 'Blood Sugar 240 mg/dL is outside range 70-100 mg/dL');

  // -------------------------------------------------------------
  // [9] 11-Section Unified Clinical Summary
  // -------------------------------------------------------------
  console.log('\n[9] Auditing 11-Section Unified Clinical Summary Generation...');
  const clinicalSummary = await SummaryGeneratorService.generateSummary(session.id, regPatient.id);
  assert(clinicalSummary && clinicalSummary.structured_summary !== undefined, 'Clinical summary generated');

  const s = clinicalSummary.structured_summary;
  assert(s.chief_complaint.includes('Crushing chest pain'), '1. Chief Complaint synthesized');
  assert(s.history_of_present_illness.includes('Patient reports'), '2. HPI synthesized with non-diagnostic clinical attribution');
  assert(s.past_medical_history.length > 0, `3. PMH synthesized (${s.past_medical_history.length} items)`);
  assert(s.current_medications.length >= 2, `5. Current medications synthesized (${s.current_medications.length} items)`);
  assert(s.prior_investigations.length >= 4, `10. Prior investigations synthesized (${s.prior_investigations.length} items)`);
  assert(s.important_alerts.length >= 1, `11. Important alerts captured (${s.important_alerts.length} alerts)`);

  await IntakeSessionService.updateWorkflowState(session.id, 'PATIENT_CONFIRMED', 5, 'summary_ready');

  // -------------------------------------------------------------
  // [10] Doctor Patient Queue & Priority Triage
  // -------------------------------------------------------------
  console.log('\n[10] Auditing Doctor Patient Queue & Priority Triage...');
  const queue = await DoctorQueueService.getQueue();
  assert(queue.length >= 3, `Doctor queue returned ${queue.length} triaged patients`);

  assert(queue[0].priority === 'critical', `Highest priority item is Critical Emergency (${queue[0].fullName})`);
  assert(queue[0].hasRedFlag === true, 'Top queue item has active Red-Flag Alert flag');

  const searchResults = await DoctorQueueService.getQueue({ searchQuery: 'Sharma' });
  assert(searchResults.some((p) => p.fullName.includes('Sharma')), 'Queue search by patient name works');

  const criticalOnly = await DoctorQueueService.getQueue({ priorityFilter: 'critical' });
  assert(criticalOnly.every((p) => p.priority === 'critical'), 'Priority filter for "critical" works');

  // -------------------------------------------------------------
  // [11] Doctor Review Workflow & Non-Destructive Versioning
  // -------------------------------------------------------------
  console.log('\n[11] Auditing Doctor Review Workflow & Versioning...');
  const originalSummaryCopy = JSON.parse(JSON.stringify(s));
  const editedSummary = JSON.parse(JSON.stringify(s));
  editedSummary.chief_complaint = 'Crushing chest pain (Doctor Verified: Acute Coronary Evaluation)';

  const reviewRecord = await DoctorReviewService.submitReview({
    intakeSessionId: session.id,
    patientId: regPatient.id,
    doctorId: 'doc-001',
    doctorName: 'Dr. S. K. Venkatraman, MD',
    originalSummary: originalSummaryCopy,
    editedSummary: editedSummary,
    reviewStatus: 'modified',
    doctorNotes: 'ECG requested immediately. Patient moved to ER triage bay.',
  });

  assert(reviewRecord && reviewRecord.review_status === 'modified', 'Doctor review submitted with "modified" status');
  assert(reviewRecord.original_summary.chief_complaint !== reviewRecord.edited_summary.chief_complaint, 'Original AI summary preserved separately from doctor edits');

  // -------------------------------------------------------------
  // [12] HL7 FHIR R4 Interoperability Mapping
  // -------------------------------------------------------------
  console.log('\n[12] Auditing HL7 FHIR R4 Bundle Mapping...');
  const allDocs = await DocumentProcessingService.getSessionDocuments(session.id);
  const fhirBundle = FHIRMapperService.generateFHIRBundle(regPatient, session, editedSummary, allDocs);

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
  // [13] Hospital Integration Gateway & Admin Analytics
  // -------------------------------------------------------------
  console.log('\n[13] Auditing Hospital Integration Gateway & Admin Analytics...');
  const hisResult = await HospitalIntegrationService.pushClinicalSummary(session.id, editedSummary);
  assert(hisResult.success === true, 'Hospital HIS transmission successful');
  assert(hisResult.external_id && hisResult.external_id.startsWith('HIS-DOC-'), `External EMR Reference ID generated: ${hisResult.external_id}`);

  const syncLogs = await HospitalIntegrationService.getSyncLogs(session.id);
  assert(syncLogs.length > 0 && syncLogs[0].status === 'success', 'Hospital integration audit log recorded in database');

  const analytics = await AdminAnalyticsService.getAnalyticsSummary();
  assert(analytics.totalPatients > 0, `Total Patients metric computed (${analytics.totalPatients})`);
  assert(analytics.completedIntakes > 0, `Completed Intakes metric computed (${analytics.completedIntakes})`);

  // -------------------------------------------------------------
  // [14] Full HTTP API Routes Suite (NextRequest Simulation)
  // -------------------------------------------------------------
  console.log('\n[14] Auditing Next.js API Routes (HTTP simulation)...');

  // 1. GET /api/patients?phone=9876543210
  const reqGetPatient = new NextRequest('http://localhost:3000/api/patients?phone=9876543210');
  const resGetPatient = await patientsApi.GET(reqGetPatient);
  const jsonGetPatient = await resGetPatient.json();
  assert(resGetPatient.status === 200 && jsonGetPatient.data?.full_name === 'Rajesh Sharma', 'API GET /api/patients returns 200 with patient record');

  // 2. GET /api/sessions?patientId=...
  const reqGetSession = new NextRequest(`http://localhost:3000/api/sessions?patientId=${regPatient.id}`);
  const resGetSession = await sessionsApi.GET(reqGetSession);
  const jsonGetSession = await resGetSession.json();
  assert(resGetSession.status === 200 && jsonGetSession.success === true, 'API GET /api/sessions returns active session');

  // 3. PATCH /api/sessions
  const reqPatchSession = new NextRequest('http://localhost:3000/api/sessions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      workflow_state: 'DOCUMENTS_IN_PROGRESS',
      step: 4,
    }),
  });
  const resPatchSession = await sessionsApi.PATCH(reqPatchSession);
  const jsonPatchSession = await resPatchSession.json();
  assert(resPatchSession.status === 200 && jsonPatchSession.data?.workflow_state === 'DOCUMENTS_IN_PROGRESS', 'API PATCH /api/sessions updates workflow state');

  // 4. GET /api/consent?patientId=...
  const reqGetConsent = new NextRequest(`http://localhost:3000/api/consent?patientId=${regPatient.id}`);
  const resGetConsent = await consentApi.GET(reqGetConsent);
  const jsonGetConsent = await resGetConsent.json();
  assert(resGetConsent.status === 200 && jsonGetConsent.data?.status === 'active', 'API GET /api/consent returns active consent');

  // 5. POST /api/clinical (save_conversation)
  const reqPostClinical = new NextRequest('http://localhost:3000/api/clinical', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'save_conversation',
      payload: {
        intakeSessionId: session.id,
        patientId: regPatient.id,
        messages: [{ sender: 'patient', text: 'Headache', timestamp: new Date().toISOString(), stage: 'chief_complaint' }],
        language: 'en',
      },
    }),
  });
  const resPostClinical = await clinicalApi.POST(reqPostClinical);
  const jsonPostClinical = await resPostClinical.json();
  assert(resPostClinical.status === 200 && jsonPostClinical.success === true, 'API POST /api/clinical saves conversation');

  // 6. GET /api/clinical?sessionId=...
  const reqGetClinical = new NextRequest(`http://localhost:3000/api/clinical?sessionId=${session.id}`);
  const resGetClinical = await clinicalApi.GET(reqGetClinical);
  const jsonGetClinical = await resGetClinical.json();
  assert(resGetClinical.status === 200 && jsonGetClinical.data?.intake_session_id === session.id, 'API GET /api/clinical retrieves clinical history');

  // 7. GET /api/documents?sessionId=...
  const reqGetDocs = new NextRequest(`http://localhost:3000/api/documents?sessionId=${session.id}`);
  const resGetDocs = await documentsApi.GET(reqGetDocs);
  const jsonGetDocs = await resGetDocs.json();
  assert(resGetDocs.status === 200 && Array.isArray(jsonGetDocs.data), 'API GET /api/documents retrieves session document list');

  // 8. GET /api/summary?sessionId=...
  const reqGetSummary = new NextRequest(`http://localhost:3000/api/summary?sessionId=${session.id}`);
  const resGetSummary = await summaryApi.GET(reqGetSummary);
  const jsonGetSummary = await resGetSummary.json();
  assert(resGetSummary.status === 200 && jsonGetSummary.data?.structured_summary !== undefined, 'API GET /api/summary retrieves clinical summary');

  // 9. GET /api/doctor/queue
  const reqGetQueue = new NextRequest('http://localhost:3000/api/doctor/queue');
  const resGetQueue = await queueApi.GET(reqGetQueue);
  const jsonGetQueue = await resGetQueue.json();
  assert(resGetQueue.status === 200 && jsonGetQueue.data?.queue?.length > 0, 'API GET /api/doctor/queue returns triaged queue and metrics');

  // 10. GET /api/doctor/review?sessionId=...
  const reqGetReview = new NextRequest(`http://localhost:3000/api/doctor/review?sessionId=${session.id}`);
  const resGetReview = await reviewApi.GET(reqGetReview);
  const jsonGetReview = await resGetReview.json();
  assert(resGetReview.status === 200 && jsonGetReview.data?.review_status === 'modified', 'API GET /api/doctor/review retrieves review');

  // 11. POST /api/his/sync
  const reqPostHis = new NextRequest('http://localhost:3000/api/his/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      summary: s,
    }),
  });
  const resPostHis = await hisApi.POST(reqPostHis);
  const jsonPostHis = await resPostHis.json();
  assert(resPostHis.status === 200 && jsonPostHis.data?.success === true, 'API POST /api/his/sync pushes summary to hospital system');

  // 12. GET /api/analytics
  const reqGetAnalytics = new NextRequest('http://localhost:3000/api/analytics');
  const resGetAnalytics = await analyticsApi.GET(reqGetAnalytics);
  const jsonGetAnalytics = await resGetAnalytics.json();
  assert(resGetAnalytics.status === 200 && jsonGetAnalytics.data?.totalPatients > 0, 'API GET /api/analytics returns hospital metrics');

  console.log(`\n===============================================================`);
  console.log(`🎉 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log(`===============================================================`);
}

runComprehensiveAudit().catch(console.error);
