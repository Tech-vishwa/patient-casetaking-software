import { Patient, CreatePatientInput } from '@/types/patient';
import { ConsentRecord, CreateConsentInput } from '@/types/consent';
import { IntakeSession, CreateIntakeSessionInput, ConsultationMode } from '@/types/intakeSession';
import {
  ConversationMessage,
  StructuredClinicalHistory,
  CreateClinicalHistoryInput,
  RedFlagAlert,
} from '@/types/clinical';
import {
  AyushAssessment,
  CreateAyushAssessmentInput,
  AyushSummaryStructured,
} from '@/types/ayush';
import {
  MedicalDocument,
  CreateMedicalDocumentInput,
  DocumentExtraction,
} from '@/types/document';
import {
  StructuredClinicalSummary,
  CreateClinicalSummaryInput,
  ClinicalSummaryStructured,
} from '@/types/summary';
import { DoctorUser } from '@/types/user';
import { SummaryReview, CreateSummaryReviewInput } from '@/types/review';
import { IntegrationLog } from '@/types/integration';
import { PatientQueueItem } from '@/types/doctorQueue';

const STORAGE_KEYS = {
  PATIENTS: 'medikiosk_patients_v1',
  CONSENT: 'medikiosk_consent_records_v1',
  SESSIONS: 'medikiosk_intake_sessions_v1',
  CONVERSATIONS: 'medikiosk_conversations_v1',
  CLINICAL_HISTORY: 'medikiosk_clinical_history_v1',
  AYUSH_ASSESSMENTS: 'medikiosk_ayush_assessments_v1',
  RED_FLAGS: 'medikiosk_red_flags_v1',
  DOCUMENTS: 'medikiosk_medical_documents_v1',
  EXTRACTIONS: 'medikiosk_document_extractions_v1',
  SUMMARIES: 'medikiosk_clinical_summaries_v1',
  USERS: 'medikiosk_users_v1',
  REVIEWS: 'medikiosk_summary_reviews_v1',
  INTEGRATION_LOGS: 'medikiosk_integration_logs_v1',
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'demo-pat-001',
    full_name: 'Rajesh Sharma',
    age: 62,
    gender: 'male',
    phone: '9876543210',
    password: '123456',
    abha_id: '91-1234-5678-9012',
    preferred_language: 'hi',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-pat-002',
    full_name: 'Kavitha Ramachandran',
    age: 45,
    gender: 'female',
    phone: '9840123456',
    password: '123456',
    abha_id: '91-9876-5432-1098',
    preferred_language: 'ta',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-pat-003',
    full_name: 'Ramesh Sundaram',
    age: 42,
    gender: 'male',
    phone: '9123456780',
    password: '123456',
    abha_id: '91-5555-6666-7777',
    preferred_language: 'en',
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-pat-004',
    full_name: 'Lakshmi Devi',
    age: 48,
    gender: 'female',
    phone: '9840998877',
    password: '123456',
    abha_id: '91-4444-3333-2222',
    preferred_language: 'ta',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const INITIAL_USERS: DoctorUser[] = [
  {
    id: 'doc-001',
    doctor_id: 'DOC-101',
    email: 'doctor@ayushman.gov.in',
    full_name: 'Dr. S. K. Venkatraman, MD',
    role: 'doctor',
    department: 'General & Internal Medicine',
    hospital_name: 'District Government Hospital',
    registration_number: 'MCI-TN-2012-48291',
    hospital_room: 'Room 4',
  },
  {
    id: 'doc-002',
    doctor_id: 'AYUSH-102',
    email: 'ayush@ayushman.gov.in',
    full_name: 'Vaidya Ananya Nambiar, BAMS, MD (Ayu)',
    role: 'doctor',
    department: 'Ayurveda & Panchakarma Department',
    hospital_name: 'District Government Hospital & Ayush Wing',
    registration_number: 'AYUSH-KL-2015-8831',
    hospital_room: 'Ayush OPD Room 2',
  },
  {
    id: 'admin-001',
    doctor_id: 'ADM-001',
    email: 'admin@ayushman.gov.in',
    full_name: 'Hospital Chief Medical Administrator',
    role: 'admin',
    department: 'Hospital Administration & Quality Control',
    hospital_name: 'District Government Hospital',
    hospital_room: 'Admin Block A',
  },
];

const INITIAL_SESSIONS: IntakeSession[] = [
  {
    id: 'demo-sess-001',
    patient_id: 'demo-pat-001',
    status: 'summary_ready',
    workflow_state: 'SUMMARY_READY',
    consultation_mode: 'MODERN_MEDICINE',
    current_step: 5,
    started_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-sess-002',
    patient_id: 'demo-pat-002',
    status: 'summary_ready',
    workflow_state: 'SUMMARY_READY',
    consultation_mode: 'MODERN_MEDICINE',
    current_step: 5,
    started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-sess-003',
    patient_id: 'demo-pat-003',
    status: 'summary_ready',
    workflow_state: 'SUMMARY_READY',
    consultation_mode: 'MODERN_MEDICINE',
    current_step: 5,
    started_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-sess-004',
    patient_id: 'demo-pat-004',
    status: 'summary_ready',
    workflow_state: 'SUMMARY_READY',
    consultation_mode: 'AYUSH',
    current_step: 5,
    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

const INITIAL_RED_FLAGS: RedFlagAlert[] = [
  {
    id: 'rf-demo-001',
    intake_session_id: 'demo-sess-001',
    patient_id: 'demo-pat-001',
    alert_type: 'CHEST_EMERGENCY',
    severity: 'critical',
    matched_terms: ['crushing chest pain', 'pain radiating to left arm'],
    triggered_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: 'active',
  },
];

const INITIAL_SUMMARIES: StructuredClinicalSummary[] = [
  {
    id: 'sum-demo-001',
    patient_id: 'demo-pat-001',
    intake_session_id: 'demo-sess-001',
    version: 1,
    status: 'draft',
    generated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    summary_content: 'Chief Complaint: Crushing central chest pain with left arm radiation',
    structured_summary: {
      chief_complaint: 'Crushing central chest pain with left arm radiation for 2 hours',
      history_of_present_illness:
        'Patient reports sudden onset of retrosternal heaviness radiating to the left arm and jaw since 2 hours ago. Accompanied by mild diaphoresis. Pain intensity rated 8/10. No relief with rest.',
      past_medical_history: ['Type 2 Diabetes Mellitus (Document indicated)', 'Essential Hypertension (Document indicated)'],
      past_surgical_history: ['Appendectomy (2014)'],
      current_medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', source: 'document' },
        { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily (morning)', source: 'document' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (night)', source: 'document' },
      ],
      allergies: [{ allergen: 'No known drug allergies reported', type: 'drug' }],
      family_history: ['Father had premature myocardial infarction at age 54'],
      personal_history: ['Non-smoker', 'Vegetarian diet', 'Sedentary occupation'],
      review_of_systems: { cardiovascular: 'Chest tightness, palpitations', respiratory: 'Mild shortness of breath' },
      prior_investigations: [
        { test: 'Fasting Blood Sugar', result: '188 mg/dL', unit: 'mg/dL', referenceRange: '70 - 100', isAbnormal: true },
        { test: 'HbA1c', result: '8.4%', unit: '%', referenceRange: '4.0 - 5.6', isAbnormal: true },
      ],
      important_alerts: [
        '🚨 RED FLAG DETECTED: CHEST_EMERGENCY (Crushing chest pain radiating to left arm). Requires immediate physician evaluation.',
        '⚠️ Fasting Blood Sugar (188 mg/dL) is outside reference range (70 - 100 mg/dL)',
      ],
    },
  },
  {
    id: 'sum-demo-002',
    patient_id: 'demo-pat-002',
    intake_session_id: 'demo-sess-002',
    version: 1,
    status: 'draft',
    generated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    summary_content: 'Chief Complaint: Routine 3-month diabetic follow-up and chronic bilateral knee joint ache',
    structured_summary: {
      chief_complaint: 'Routine 3-month diabetic follow-up and chronic bilateral knee joint ache',
      history_of_present_illness:
        'Patient reports ongoing follow-up for Type 2 Diabetes diagnosed 4 years ago. Reports mild morning stiffness and pain in bilateral knees for 6 months. No acute fever, dysuria, or chest pain.',
      past_medical_history: ['Type 2 Diabetes Mellitus', 'Bilateral Osteoarthritis (Grade 1)'],
      past_surgical_history: ['None reported'],
      current_medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', source: 'patient' },
        { name: 'Glimepiride', dosage: '1mg', frequency: 'Once daily before breakfast', source: 'document' },
      ],
      allergies: [{ allergen: 'Penicillin (mild skin rash)', type: 'drug' }],
      family_history: ['Mother had Type 2 Diabetes'],
      personal_history: ['Vegetarian', 'Moderate daily walking'],
      review_of_systems: { musculoskeletal: 'Bilateral knee pain with walking', endocrine: 'Mild polyuria at night' },
      prior_investigations: [
        { test: 'HbA1c', result: '7.8%', unit: '%', referenceRange: '4.0 - 5.6', isAbnormal: true },
        { test: 'Serum Creatinine', result: '0.9 mg/dL', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
      ],
      important_alerts: ['⚠️ HbA1c (7.8%) is outside reference range (4.0 - 5.6%)'],
    },
  },
  {
    id: 'sum-demo-003',
    patient_id: 'demo-pat-003',
    intake_session_id: 'demo-sess-003',
    version: 1,
    status: 'draft',
    generated_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    summary_content: 'Chief Complaint: Generalized tension headache and eye strain for 4 days',
    structured_summary: {
      chief_complaint: 'Generalized tension headache and eye strain for 4 days',
      history_of_present_illness:
        'Patient reports dull, bilateral frontal headache associated with prolonged computer work. No nausea, vomiting, photophobia, or neurological weakness. Relieved partially by sleep.',
      past_medical_history: ['Myopia (-2.5 D)'],
      past_surgical_history: ['None reported'],
      current_medications: [{ name: 'Paracetamol', dosage: '650mg', frequency: 'PRN for headache', source: 'patient' }],
      allergies: [{ allergen: 'No known allergies', type: 'drug' }],
      family_history: ['No significant chronic illnesses in immediate family'],
      personal_history: ['Software engineer', 'Excessive screen exposure (10+ hrs/day)'],
      review_of_systems: { neurological: 'Frontal headache without focal deficits', ocular: 'Eye strain' },
      prior_investigations: [],
      important_alerts: [],
    },
  },
  {
    id: 'sum-demo-004',
    patient_id: 'demo-pat-004',
    intake_session_id: 'demo-sess-004',
    consultation_mode: 'AYUSH',
    version: 1,
    status: 'draft',
    generated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    summary_content: 'Presenting Complaint: Chronic indigestion, hyperacidity, and abdominal bloating after meals (Amlapitta & Agnimandya)',
    structured_summary: {
      chief_complaint: 'Chronic indigestion and hyperacidity (Amlapitta)',
      history_of_present_illness: 'Patient reports sour belching, heartburn after spicy/fried food, and sluggish bowel movements for 3 months.',
      past_medical_history: ['Occasional mild migraine'],
      past_surgical_history: ['None reported'],
      current_medications: [{ name: 'Avipattikar Churna', dosage: '3g', frequency: 'Twice daily before meals', source: 'patient' }],
      allergies: [{ allergen: 'No known drug allergies', type: 'drug' }],
      family_history: ['Mother had osteoarthritis'],
      personal_history: ['Sedentary office routine', 'Irregular meal timings', 'Prefers warm cooked foods'],
      review_of_systems: { gastrointestinal: 'Acid reflux, bloating (Adhmana)', nervous: 'Mild evening tension' },
      prior_investigations: [],
      important_alerts: [],
    },
    ayush_summary: {
      presenting_complaint: 'Chronic indigestion, hyperacidity, and abdominal bloating after meals (Amlapitta & Agnimandya)',
      duration: '3 months',
      previous_treatment: 'Self-medicated with over-the-counter antacids; seeking holistic Ayurvedic management',
      current_symptoms: ['Amlapitta (Hyperacidity & sour belching)', 'Adhmana (Abdominal bloating)', 'Mandagni (Sluggish appetite & digestion)', 'Alasya (Mild post-meal lethargy)'],
      prakriti_assessment: {
        body_build: 'Madhyama (Medium body frame)',
        skin_type: 'Warm, oily Pitta tendency with mild warmth',
        appetite: 'Vishamagni/Tikshnagni (Irregular to sharp appetite)',
        sleep_pattern: 'Disturbed sleep, tends to wake around 2:00 AM',
        temperament: 'Alert, observant, prone to frustration when hungry (Pitta-Vata)',
        dominant_dosha_tendency: 'Pitta-Vata',
      },
      vikriti_assessment: {
        recent_changes: 'Aggravated burning sensation in epigastrium after fried or sour meals',
        current_symptoms: ['Acid regurgitation', 'Lower abdomen bloating', 'Slow digestion'],
        digestive_changes: 'Sluggish gastric emptying after lunch',
        sleep_changes: 'Interrupted sleep due to gastric discomfort',
        energy_changes: 'Low energy in late afternoon',
      },
      ahara_assessment: {
        food_types: 'Mixed diet, frequent consumption of tea and sour/fermented foods',
        meal_timing: 'Irregular lunch (between 2:00 PM - 3:30 PM) due to work',
        appetite: 'Variable (sometimes sharp, sometimes dull)',
        food_preferences: 'Prefers warm, spicy foods; needs to switch to cooling/soothing diet',
        water_intake: 'Around 2 to 2.5 litres per day (room temperature)',
      },
      vihara_assessment: {
        daily_routine: 'Sedentary desk job with prolonged sitting',
        physical_activity: 'Walking 20 minutes in morning 2-3 days a week',
        sleep: '6 hours, restless',
        stress: 'Moderate workplace mental stress',
        work_pattern: 'Office clerical hours 9:00 AM to 6:00 PM',
      },
      dashavidha_pariksha: {
        prakriti: 'Pitta-Vata (Medium frame, warm body, active temperament)',
        vikriti: 'Pitta-Kapha Dushti presenting as Amlapitta and Agnimandya',
        sara: 'Madhyama Sara (Moderate tissue vitality)',
        samhanana: 'Madhyama Samhanana (Moderate compact build)',
        pramana: 'Madhyama Pramana (Normal body proportions)',
        satmya: 'Satmya to South Indian traditional grains and spices',
        sattva: 'Madhyama Sattva (Moderate mental resilience)',
        ahara_shakti: 'Avara-Madhyama (Sub-optimal digestive power - Agnimandya)',
        vyayama_shakti: 'Madhyama Vyayama Shakti (Moderate exertion tolerance)',
        vaya: 'Madhyama Vaya (Adult / Middle age - 48 years)',
      },
      previous_medical_treatment_history: ['Occasional PPI/Antacid syrups with temporary symptomatic relief'],
      medications: [{ name: 'Avipattikar Churna', dosage: '3g', frequency: 'Twice daily before meals', source: 'patient' }],
      uploaded_investigations: [],
      important_alerts: [],
    },
  },
];

const INITIAL_AYUSH_ASSESSMENTS: AyushAssessment[] = [
  {
    id: 'ayush-demo-001',
    patient_id: 'demo-pat-004',
    intake_session_id: 'demo-sess-004',
    presenting_complaint: 'Chronic indigestion, hyperacidity, and abdominal bloating after meals (Amlapitta & Agnimandya)',
    duration: '3 months',
    previous_treatment: 'Self-medicated with over-the-counter antacids; seeking holistic Ayurvedic management',
    current_symptoms: ['Amlapitta (Hyperacidity & sour belching)', 'Adhmana (Abdominal bloating)', 'Mandagni (Sluggish appetite & digestion)', 'Alasya (Mild post-meal lethargy)'],
    prakriti: {
      body_build: 'Madhyama (Medium body frame)',
      skin_type: 'Warm, oily Pitta tendency with mild warmth',
      appetite: 'Vishamagni/Tikshnagni (Irregular to sharp appetite)',
      sleep_pattern: 'Disturbed sleep, tends to wake around 2:00 AM',
      temperament: 'Alert, observant, prone to frustration when hungry (Pitta-Vata)',
      dominant_dosha_tendency: 'Pitta-Vata',
    },
    vikriti: {
      recent_changes: 'Aggravated burning sensation in epigastrium after fried or sour meals',
      current_symptoms: ['Acid regurgitation', 'Lower abdomen bloating', 'Slow digestion'],
      digestive_changes: 'Sluggish gastric emptying after lunch',
      sleep_changes: 'Interrupted sleep due to gastric discomfort',
      energy_changes: 'Low energy in late afternoon',
    },
    ahara_assessment: {
      food_types: 'Mixed diet, frequent consumption of tea and sour/fermented foods',
      meal_timing: 'Irregular lunch (between 2:00 PM - 3:30 PM) due to work',
      appetite: 'Variable (sometimes sharp, sometimes dull)',
      food_preferences: 'Prefers warm, spicy foods; needs to switch to cooling/soothing diet',
      water_intake: 'Around 2 to 2.5 litres per day (room temperature)',
    },
    vihara_assessment: {
      daily_routine: 'Sedentary desk job with prolonged sitting',
      physical_activity: 'Walking 20 minutes in morning 2-3 days a week',
      sleep: '6 hours, restless',
      stress: 'Moderate workplace mental stress',
      work_pattern: 'Office clerical hours 9:00 AM to 6:00 PM',
    },
    sara: 'Madhyama Sara (Moderate tissue vitality)',
    samhanana: 'Madhyama Samhanana (Moderate compact build)',
    pramana: 'Madhyama Pramana (Normal body proportions)',
    satmya: 'Satmya to South Indian traditional grains and spices',
    sattva: 'Madhyama Sattva (Moderate mental resilience)',
    ahara_shakti: 'Avara-Madhyama (Sub-optimal digestive power - Agnimandya)',
    vyayama_shakti: 'Madhyama Vyayama Shakti (Moderate exertion tolerance)',
    vaya: 'Madhyama Vaya (Adult / Middle age - 48 years)',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

class MockDatabase {
  private memoryStore: Record<string, any> = {};

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private getItem<T>(key: string, defaultVal: T): T {
    if (this.isBrowser()) {
      try {
        const item = window.localStorage.getItem(key);
        if (!item) {
          window.localStorage.setItem(key, JSON.stringify(defaultVal));
          return defaultVal;
        }
        return JSON.parse(item);
      } catch {
        return this.memoryStore[key] ?? defaultVal;
      }
    }
    if (!(key in this.memoryStore)) {
      this.memoryStore[key] = defaultVal;
    }
    return this.memoryStore[key];
  }

  private setItem<T>(key: string, value: T): void {
    if (this.isBrowser()) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
    this.memoryStore[key] = value;
  }

  // ---------------- Patients ----------------
  private getPatients(): Patient[] {
    return this.getItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    const patients = this.getPatients();
    const newPatient: Patient = {
      id: 'pat-' + Math.random().toString(36).substring(2, 9),
      full_name: input.full_name,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      password: input.password || '123456',
      abha_id: input.abha_id || null,
      preferred_language: input.preferred_language || 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    patients.push(newPatient);
    this.setItem(STORAGE_KEYS.PATIENTS, patients);
    return newPatient;
  }

  async authenticatePatient(phone: string, password?: string): Promise<Patient | null> {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.phone === phone);
    if (!patient) return null;
    if (password && patient.password && patient.password !== password) {
      return null;
    }
    return patient;
  }

  async findPatientByPhone(phone: string): Promise<Patient | null> {
    const patients = this.getPatients();
    return patients.find((p) => p.phone === phone) || null;
  }

  async getPatientByPhone(phone: string): Promise<Patient | null> {
    return this.findPatientByPhone(phone);
  }

  async findPatientByAbha(abhaId: string): Promise<Patient | null> {
    const patients = this.getPatients();
    return patients.find((p) => p.abha_id === abhaId) || null;
  }

  async getPatientByAbha(abhaId: string): Promise<Patient | null> {
    return this.findPatientByAbha(abhaId);
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const patients = this.getPatients();
    return patients.find((p) => p.id === id) || null;
  }

  // ---------------- Consent Records ----------------
  private getConsentRecords(): ConsentRecord[] {
    return this.getItem(STORAGE_KEYS.CONSENT, []);
  }

  async createConsent(input: CreateConsentInput): Promise<ConsentRecord> {
    const records = this.getConsentRecords();
    const newConsent: ConsentRecord = {
      id: 'con-' + Math.random().toString(36).substring(2, 9),
      patient_id: input.patient_id,
      data_collection_consent: input.data_collection_consent,
      data_sharing_consent: input.data_sharing_consent,
      consent_timestamp: new Date().toISOString(),
      status: 'active',
    };
    records.push(newConsent);
    this.setItem(STORAGE_KEYS.CONSENT, records);
    return newConsent;
  }

  async createConsentRecord(input: CreateConsentInput): Promise<ConsentRecord> {
    return this.createConsent(input);
  }

  async getActiveConsentByPatient(patientId: string): Promise<ConsentRecord | null> {
    const records = this.getConsentRecords();
    return (
      records
        .filter((c) => c.patient_id === patientId && c.status === 'active')
        .sort((a, b) => new Date(b.consent_timestamp).getTime() - new Date(a.consent_timestamp).getTime())[0] || null
    );
  }

  async getActiveConsentByPatientId(patientId: string): Promise<ConsentRecord | null> {
    return this.getActiveConsentByPatient(patientId);
  }

  // ---------------- Intake Sessions ----------------
  private getIntakeSessions(): IntakeSession[] {
    return this.getItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  }

  async createIntakeSession(input: CreateIntakeSessionInput): Promise<IntakeSession> {
    const sessions = this.getIntakeSessions();
    const newSession: IntakeSession = {
      id: 'sess-' + Math.random().toString(36).substring(2, 9),
      patient_id: input.patient_id,
      status: input.status || 'onboarding',
      workflow_state: input.workflow_state || 'ONBOARDING',
      consultation_mode: input.consultation_mode || 'MODERN_MEDICINE',
      current_step: input.current_step || 1,
      draft_history: input.draft_history || null,
      started_at: new Date().toISOString(),
      completed_at: null,
    };
    sessions.push(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  async updateIntakeSession(id: string, updates: Partial<IntakeSession>): Promise<IntakeSession | null> {
    const sessions = this.getIntakeSessions();
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updated = {
      ...sessions[index],
      ...updates,
    };
    sessions[index] = updated;
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return updated;
  }

  async getIntakeSessionById(id: string): Promise<IntakeSession | null> {
    const sessions = this.getIntakeSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  async getActiveSessionByPatient(patientId: string): Promise<IntakeSession | null> {
    const sessions = this.getIntakeSessions();
    return (
      sessions
        .filter((s) => s.patient_id === patientId && s.status !== 'completed')
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0] || null
    );
  }

  async getIncompleteSessionByPatient(patientId: string): Promise<IntakeSession | null> {
    return this.getActiveSessionByPatient(patientId);
  }

  async getPatientConsultationHistory(patientId: string): Promise<any[]> {
    const sessions = this.getIntakeSessions();
    const summaries = this.getClinicalSummaries();
    const reviews = this.getSummaryReviews();

    return sessions
      .filter((s) => s.patient_id === patientId)
      .map((session) => {
        const summary = summaries.find((sum) => sum.intake_session_id === session.id);
        const review = reviews.find((r) => r.intake_session_id === session.id);
        return {
          sessionId: session.id,
          date: session.completed_at || session.started_at,
          status: session.status,
          workflowState: session.workflow_state,
          chiefComplaint: summary?.structured_summary?.chief_complaint || 'General Clinical Consultation',
          reviewStatus: review ? review.review_status : 'pending',
          doctorName: review ? review.doctor_name : 'Pending Physician Review',
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // ---------------- Clinical Conversations (Segment 2) ----------------
  private getConversations(): Record<string, ConversationMessage[]> {
    return this.getItem(STORAGE_KEYS.CONVERSATIONS, {});
  }

  async saveConversationMessages(sessionId: string, messages: ConversationMessage[]): Promise<void> {
    const convs = this.getConversations();
    convs[sessionId] = messages;
    this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
  }

  async saveConversation(sessionId: string, patientId: string, messages: ConversationMessage[], language: string = 'en'): Promise<void> {
    return this.saveConversationMessages(sessionId, messages);
  }

  async getConversationMessages(sessionId: string): Promise<ConversationMessage[]> {
    const convs = this.getConversations();
    return convs[sessionId] || [];
  }

  // ---------------- Structured Clinical History (Segment 2) ----------------
  private getClinicalHistories(): StructuredClinicalHistory[] {
    return this.getItem(STORAGE_KEYS.CLINICAL_HISTORY, []);
  }

  async saveClinicalHistory(input: CreateClinicalHistoryInput): Promise<StructuredClinicalHistory> {
    const histories = this.getClinicalHistories();
    const existingIndex = histories.findIndex((h) => h.intake_session_id === input.intake_session_id);

    const history: StructuredClinicalHistory = {
      id: existingIndex !== -1 ? histories[existingIndex].id : 'hist-' + Math.random().toString(36).substring(2, 9),
      intake_session_id: input.intake_session_id,
      patient_id: input.patient_id,
      chief_complaint: input.chief_complaint,
      hpi: input.hpi,
      past_medical_history: input.past_medical_history,
      surgical_history: input.surgical_history,
      medications: input.medications,
      allergies: input.allergies,
      family_history: input.family_history,
      personal_history: input.personal_history,
      review_of_systems: input.review_of_systems,
      created_at: existingIndex !== -1 ? histories[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      histories[existingIndex] = history;
    } else {
      histories.push(history);
    }

    this.setItem(STORAGE_KEYS.CLINICAL_HISTORY, histories);
    return history;
  }

  async getClinicalHistoryBySession(sessionId: string): Promise<StructuredClinicalHistory | null> {
    const histories = this.getClinicalHistories();
    return histories.find((h) => h.intake_session_id === sessionId) || null;
  }

  async getClinicalHistoryBySessionId(sessionId: string): Promise<StructuredClinicalHistory | null> {
    return this.getClinicalHistoryBySession(sessionId);
  }

  // ---------------- AYUSH Assessments (Part 12) ----------------
  private getAyushAssessmentsList(): AyushAssessment[] {
    return this.getItem(STORAGE_KEYS.AYUSH_ASSESSMENTS, INITIAL_AYUSH_ASSESSMENTS);
  }

  async saveAyushAssessment(input: CreateAyushAssessmentInput): Promise<AyushAssessment> {
    const list = this.getAyushAssessmentsList();
    const existingIndex = list.findIndex((a) => a.intake_session_id === input.intake_session_id);

    const record: AyushAssessment = {
      id: existingIndex !== -1 ? list[existingIndex].id : 'ayush-' + Math.random().toString(36).substring(2, 9),
      patient_id: input.patient_id,
      intake_session_id: input.intake_session_id,
      presenting_complaint: input.presenting_complaint,
      duration: input.duration,
      previous_treatment: input.previous_treatment,
      current_symptoms: input.current_symptoms || [],
      prakriti: input.prakriti || {},
      vikriti: input.vikriti || {},
      ahara_assessment: input.ahara_assessment || {},
      vihara_assessment: input.vihara_assessment || {},
      sara: input.sara,
      samhanana: input.samhanana,
      pramana: input.pramana,
      satmya: input.satmya,
      sattva: input.sattva,
      ahara_shakti: input.ahara_shakti,
      vyayama_shakti: input.vyayama_shakti,
      vaya: input.vaya,
      created_at: existingIndex !== -1 ? list[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }

    this.setItem(STORAGE_KEYS.AYUSH_ASSESSMENTS, list);
    return record;
  }

  async getAyushAssessmentBySession(sessionId: string): Promise<AyushAssessment | null> {
    const list = this.getAyushAssessmentsList();
    return list.find((a) => a.intake_session_id === sessionId) || null;
  }

  // ---------------- Red Flag Alerts (Segment 2) ----------------
  private getRedFlags(): RedFlagAlert[] {
    return this.getItem(STORAGE_KEYS.RED_FLAGS, INITIAL_RED_FLAGS);
  }

  async createRedFlagAlert(
    sessionId: string,
    patientId: string,
    alertType: string,
    severity: 'critical' | 'high' | 'moderate',
    matchedTerms: string[]
  ): Promise<RedFlagAlert> {
    const redFlags = this.getRedFlags();
    const alert: RedFlagAlert = {
      id: 'rf-' + Math.random().toString(36).substring(2, 9),
      intake_session_id: sessionId,
      patient_id: patientId,
      alert_type: alertType,
      severity,
      matched_terms: matchedTerms,
      triggered_at: new Date().toISOString(),
      status: 'active',
    };
    redFlags.push(alert);
    this.setItem(STORAGE_KEYS.RED_FLAGS, redFlags);
    return alert;
  }

  async saveRedFlagAlert(
    sessionIdOrInput: string | any,
    patientId?: string,
    alertType?: string,
    severity?: 'critical' | 'high' | 'moderate',
    matchedTerms?: string[]
  ): Promise<RedFlagAlert> {
    if (typeof sessionIdOrInput === 'object') {
      return this.createRedFlagAlert(
        sessionIdOrInput.intake_session_id,
        sessionIdOrInput.patient_id,
        sessionIdOrInput.alert_type,
        sessionIdOrInput.severity,
        sessionIdOrInput.matched_terms || []
      );
    }
    return this.createRedFlagAlert(sessionIdOrInput, patientId!, alertType!, severity!, matchedTerms || []);
  }

  async getRedFlagsBySession(sessionId: string): Promise<RedFlagAlert[]> {
    const redFlags = this.getRedFlags();
    return redFlags.filter((rf) => rf.intake_session_id === sessionId);
  }

  async getRedFlagAlertsBySessionId(sessionId: string): Promise<RedFlagAlert[]> {
    return this.getRedFlagsBySession(sessionId);
  }

  async updateRedFlagStatus(id: string, status: 'active' | 'acknowledged' | 'resolved'): Promise<RedFlagAlert | null> {
    const redFlags = this.getRedFlags();
    const index = redFlags.findIndex((r) => r.id === id);
    if (index === -1) return null;
    redFlags[index].status = status;
    this.setItem(STORAGE_KEYS.RED_FLAGS, redFlags);
    return redFlags[index];
  }

  // ---------------- Medical Documents (Segment 3) ----------------
  private getMedicalDocuments(): MedicalDocument[] {
    return this.getItem(STORAGE_KEYS.DOCUMENTS, []);
  }

  async createMedicalDocument(input: CreateMedicalDocumentInput): Promise<MedicalDocument> {
    const docs = this.getMedicalDocuments();
    const newDoc: MedicalDocument = {
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      patient_id: input.patient_id,
      intake_session_id: input.intake_session_id,
      file_name: input.file_name,
      file_url: input.file_url,
      file_size: input.file_size,
      mime_type: input.mime_type,
      document_type: input.document_type,
      extracted_text: (input as any).extracted_text || null,
      processing_status: (input as any).processing_status || 'uploading',
      document_date: input.document_date || null,
      created_at: new Date().toISOString(),
    };
    docs.push(newDoc);
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);
    return newDoc;
  }

  async updateMedicalDocument(id: string, updates: Partial<MedicalDocument>): Promise<MedicalDocument | null> {
    const docs = this.getMedicalDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index === -1) return null;
    const updated = { ...docs[index], ...updates };
    docs[index] = updated;
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);
    return updated;
  }

  async getMedicalDocumentsBySession(sessionId: string): Promise<MedicalDocument[]> {
    const docs = this.getMedicalDocuments();
    const extractions = this.getDocumentExtractions();
    return docs
      .filter((d) => d.intake_session_id === sessionId)
      .map((d) => ({
        ...d,
        extraction: extractions.find((e) => e.document_id === d.id),
      }));
  }

  async deleteMedicalDocument(id: string): Promise<boolean> {
    const docs = this.getMedicalDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.DOCUMENTS, filtered);
    return true;
  }

  // ---------------- Document Extractions (Segment 3) ----------------
  private getDocumentExtractions(): DocumentExtraction[] {
    return this.getItem(STORAGE_KEYS.EXTRACTIONS, []);
  }

  async saveDocumentExtraction(extraction: any): Promise<DocumentExtraction> {
    const extractions = this.getDocumentExtractions();
    const existingIndex = extractions.findIndex((e) => e.document_id === extraction.document_id);

    const record: DocumentExtraction = {
      id: extraction.id || 'ext-' + Math.random().toString(36).substring(2, 9),
      document_id: extraction.document_id,
      diagnoses: extraction.diagnoses || [],
      medications: extraction.medications || [],
      labResults: extraction.labResults || [],
      procedures: extraction.procedures || [],
      documentDate: extraction.documentDate,
      confidence: extraction.confidence || 0.95,
      raw_structured_data: extraction.raw_structured_data || {},
      created_at: extraction.created_at || new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      extractions[existingIndex] = record;
    } else {
      extractions.push(record);
    }

    this.setItem(STORAGE_KEYS.EXTRACTIONS, extractions);
    return record;
  }

  async getDocumentExtraction(documentId: string): Promise<DocumentExtraction | null> {
    const extractions = this.getDocumentExtractions();
    return extractions.find((e) => e.document_id === documentId) || null;
  }

  // ---------------- Clinical Summaries (Segment 3) ----------------
  private getClinicalSummaries(): StructuredClinicalSummary[] {
    return this.getItem(STORAGE_KEYS.SUMMARIES, INITIAL_SUMMARIES);
  }

  async saveClinicalSummary(input: CreateClinicalSummaryInput): Promise<StructuredClinicalSummary> {
    const summaries = this.getClinicalSummaries();
    const existingIndex = summaries.findIndex((s) => s.intake_session_id === input.intake_session_id);

    const record: StructuredClinicalSummary = {
      id: existingIndex !== -1 ? summaries[existingIndex].id : 'sum-' + Math.random().toString(36).substring(2, 9),
      patient_id: input.patient_id,
      intake_session_id: input.intake_session_id,
      consultation_mode: input.consultation_mode || 'MODERN_MEDICINE',
      summary_content: input.summary_content,
      structured_summary: input.structured_summary,
      ayush_summary: input.ayush_summary,
      version: existingIndex !== -1 ? (summaries[existingIndex].version || 1) + 1 : 1,
      status: input.status || 'draft',
      generated_at: existingIndex !== -1 ? summaries[existingIndex].generated_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      summaries[existingIndex] = record;
    } else {
      summaries.push(record);
    }

    this.setItem(STORAGE_KEYS.SUMMARIES, summaries);
    return record;
  }

  async getClinicalSummaryBySession(sessionId: string): Promise<StructuredClinicalSummary | null> {
    const summaries = this.getClinicalSummaries();
    return summaries.find((s) => s.intake_session_id === sessionId) || null;
  }

  // ---------------- Users & Auth (Segment 4) ----------------
  private getUsers(): DoctorUser[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  async findUserByEmail(email: string): Promise<DoctorUser | null> {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // ---------------- Doctor Reviews (Segment 4) ----------------
  private getSummaryReviews(): SummaryReview[] {
    return this.getItem(STORAGE_KEYS.REVIEWS, []);
  }

  async saveSummaryReview(input: CreateSummaryReviewInput): Promise<SummaryReview> {
    const reviews = this.getSummaryReviews();
    const existingIndex = reviews.findIndex((r) => r.intake_session_id === input.intakeSessionId);

    const review: SummaryReview = {
      id: existingIndex !== -1 ? reviews[existingIndex].id : 'rev-' + Math.random().toString(36).substring(2, 9),
      intake_session_id: input.intakeSessionId,
      patient_id: input.patientId,
      doctor_id: input.doctorId,
      doctor_name: input.doctorName,
      original_summary: input.originalSummary,
      edited_summary: input.editedSummary,
      original_ayush_summary: input.originalAyushSummary,
      edited_ayush_summary: input.editedAyushSummary,
      review_status: input.reviewStatus,
      doctor_notes: input.doctorNotes,
      his_synced: false,
      created_at: existingIndex !== -1 ? reviews[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      reviews[existingIndex] = review;
    } else {
      reviews.push(review);
    }

    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return review;
  }

  async getSummaryReviewBySession(sessionId: string): Promise<SummaryReview | null> {
    const reviews = this.getSummaryReviews();
    return reviews.find((r) => r.intake_session_id === sessionId) || null;
  }

  // ---------------- Integration Logs (Segment 4) ----------------
  private getIntegrationLogsList(): IntegrationLog[] {
    return this.getItem(STORAGE_KEYS.INTEGRATION_LOGS, []);
  }

  async logIntegration(
    sessionId: string,
    system: string,
    status: 'success' | 'failed' | 'pending',
    payload: any,
    response: any
  ): Promise<IntegrationLog> {
    const logs = this.getIntegrationLogsList();
    const log: IntegrationLog = {
      id: 'int-' + Math.random().toString(36).substring(2, 9),
      intake_session_id: sessionId,
      external_system: system,
      status,
      payload,
      response,
      created_at: new Date().toISOString(),
    };
    logs.push(log);
    this.setItem(STORAGE_KEYS.INTEGRATION_LOGS, logs);
    return log;
  }

  async getIntegrationLogs(sessionId: string): Promise<IntegrationLog[]> {
    const logs = this.getIntegrationLogsList();
    return logs.filter((l) => l.intake_session_id === sessionId);
  }

  // ---------------- Doctor Patient Queue (Segment 4) ----------------
  async getDoctorPatientQueue(): Promise<PatientQueueItem[]> {
    const sessions = this.getIntakeSessions();
    const patients = this.getPatients();
    const summaries = this.getClinicalSummaries();
    const redFlags = this.getRedFlags();
    const reviews = this.getSummaryReviews();
    const docs = this.getMedicalDocuments();

    // Filter sessions ready for doctor review or completed
    const eligibleSessions = sessions.filter(
      (s) => s.status === 'summary_ready' || s.status === 'completed' || s.status === 'history_completed'
    );

    const queueItems: PatientQueueItem[] = eligibleSessions.map((session) => {
      const patient = patients.find((p) => p.id === session.patient_id);
      const summary = summaries.find((s) => s.intake_session_id === session.id);
      const sessionRedFlags = redFlags.filter((rf) => rf.intake_session_id === session.id);
      const review = reviews.find((r) => r.intake_session_id === session.id);
      const sessionDocs = docs.filter((d) => d.intake_session_id === session.id);

      const hasRedFlag = sessionRedFlags.some((rf) => rf.status === 'active');
      const redFlagCategories = sessionRedFlags.map((rf) => rf.alert_type);

      let priority: 'critical' | 'high' | 'normal' = 'normal';
      if (hasRedFlag) {
        priority = 'critical';
      } else if (sessionDocs.length > 0 || (summary?.structured_summary?.important_alerts?.length || 0) > 0) {
        priority = 'high';
      }

      const completedTime = session.completed_at || session.started_at;
      const waitingMinutes = Math.max(1, Math.round((Date.now() - new Date(completedTime).getTime()) / (1000 * 60)));

      return {
        sessionId: session.id,
        patientId: session.patient_id,
        fullName: patient?.full_name || 'Anonymous Patient',
        age: patient?.age || 0,
        gender: patient?.gender || 'other',
        phone: patient?.phone || '',
        abhaId: patient?.abha_id || null,
        chiefComplaint:
          session.consultation_mode === 'AYUSH'
            ? (summary?.ayush_summary?.presenting_complaint || summary?.structured_summary?.chief_complaint || 'Ayurvedic Clinical Assessment')
            : (summary?.structured_summary?.chief_complaint || 'Clinical Consultation'),
        consultationMode: session.consultation_mode || 'MODERN_MEDICINE',
        priority,
        hasRedFlag,
        redFlagCategories,
        completedAt: completedTime,
        waitingTimeMinutes: waitingMinutes,
        documentCount: sessionDocs.length,
        reviewStatus: review ? (review.review_status as any) : 'pending',
        preferredLanguage: patient?.preferred_language || 'en',
      };
    });

    // Sort: 1. Critical (Red Flag) first -> 2. High -> 3. Waiting longest first
    queueItems.sort((a, b) => {
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (b.priority === 'critical' && a.priority !== 'critical') return 1;
      if (a.priority === 'high' && b.priority === 'normal') return -1;
      if (b.priority === 'high' && a.priority === 'normal') return 1;
      return b.waitingTimeMinutes - a.waitingTimeMinutes;
    });

    return queueItems;
  }
}

export const mockDb = new MockDatabase();
