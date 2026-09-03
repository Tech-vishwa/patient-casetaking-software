-- ==============================================================================
-- MEDIKIOSK — COMPLETE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Segment 1: Patient Profile, Consent Audit, Intake Session Lifecycle
-- Segment 2: Clinical Conversations, Structured Clinical History, Red Flag Alerts
-- Segment 3: Medical Documents, Document Extractions, Clinical Summaries
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PATIENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 125),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(20) NOT NULL,
    abha_id VARCHAR(50) UNIQUE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta', 'hi')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_abha_id ON patients(abha_id);

-- ------------------------------------------------------------------------------
-- 2. CONSENT RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    data_collection_consent BOOLEAN NOT NULL,
    data_sharing_consent BOOLEAN NOT NULL,
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_consent_patient_id ON consent_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_records(status);

-- ------------------------------------------------------------------------------
-- 3. INTAKE SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS intake_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'onboarding' CHECK (
        status IN (
            'onboarding',
            'history_in_progress',
            'history_completed',
            'documents_in_progress',
            'summary_ready',
            'completed'
        )
    ),
    current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
    consultation_mode VARCHAR(30) NOT NULL DEFAULT 'MODERN_MEDICINE' CHECK (consultation_mode IN ('MODERN_MEDICINE', 'AYUSH')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_intake_sessions_mode ON intake_sessions(consultation_mode);

CREATE INDEX IF NOT EXISTS idx_intake_sessions_patient ON intake_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_intake_sessions_status ON intake_sessions(status);

-- ------------------------------------------------------------------------------
-- 4. CLINICAL CONVERSATIONS TABLE (SEGMENT 2)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clinical_conv_session ON clinical_conversations(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_conv_patient ON clinical_conversations(patient_id);

-- ------------------------------------------------------------------------------
-- 5. CLINICAL HISTORY TABLE (SEGMENT 2)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    chief_complaint TEXT NOT NULL,
    hpi JSONB NOT NULL DEFAULT '{}'::jsonb,
    past_medical_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    surgical_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    family_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    personal_history JSONB NOT NULL DEFAULT '{}'::jsonb,
    review_of_systems JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_history_session ON clinical_history(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_history_patient ON clinical_history(patient_id);

-- ------------------------------------------------------------------------------
-- 6. RED FLAG ALERTS TABLE (SEGMENT 2)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS red_flag_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'critical' CHECK (severity IN ('critical', 'high', 'moderate')),
    matched_terms JSONB DEFAULT '[]'::jsonb,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved'))
);

CREATE INDEX IF NOT EXISTS idx_red_flags_session ON red_flag_alerts(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_severity ON red_flag_alerts(severity);

-- ------------------------------------------------------------------------------
-- 7. MEDICAL DOCUMENTS TABLE (SEGMENT 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('prescription', 'lab_report', 'discharge_summary', 'other')),
    extracted_text TEXT,
    processing_status VARCHAR(30) NOT NULL DEFAULT 'uploading' CHECK (processing_status IN ('uploading', 'processing', 'completed', 'failed')),
    document_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medical_docs_session ON medical_documents(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_medical_docs_patient ON medical_documents(patient_id);

-- ------------------------------------------------------------------------------
-- 8. DOCUMENT EXTRACTIONS TABLE (SEGMENT 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    diagnoses JSONB NOT NULL DEFAULT '[]'::jsonb,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    lab_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    procedures JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_structured_data JSONB DEFAULT '{}'::jsonb,
    confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.95,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_extractions_doc ON document_extractions(document_id);

-- ------------------------------------------------------------------------------
-- 9. CLINICAL SUMMARIES TABLE (SEGMENT 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    summary_content TEXT NOT NULL,
    structured_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_summaries_session ON clinical_summaries(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_summaries_patient ON clinical_summaries(patient_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_flag_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public kiosk patient registration" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public kiosk consent management" ON consent_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public kiosk intake sessions" ON intake_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public kiosk clinical conversations" ON clinical_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public kiosk clinical history" ON clinical_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public kiosk red flag alerts" ON red_flag_alerts FOR ALL USING (true) WITH CHECK (true);
-- ------------------------------------------------------------------------------
-- 10. USERS TABLE (SEGMENT 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'doctor' CHECK (role IN ('patient', 'doctor', 'admin')),
    department VARCHAR(100) NOT NULL DEFAULT 'General Medicine',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 11. DOCTOR PROFILES TABLE (SEGMENT 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL DEFAULT 'General Physician',
    hospital_room VARCHAR(50) NOT NULL DEFAULT 'Room 4',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user ON doctor_profiles(user_id);

-- ------------------------------------------------------------------------------
-- 12. SUMMARY REVIEWS TABLE (SEGMENT 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS summary_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    original_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    edited_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved' CHECK (review_status IN ('approved', 'modified', 'rejected')),
    doctor_notes TEXT,
    his_synced BOOLEAN NOT NULL DEFAULT false,
    his_sync_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_summary_reviews_session ON summary_reviews(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_summary_reviews_doctor ON summary_reviews(doctor_id);

-- ------------------------------------------------------------------------------
-- 13. INTEGRATION LOGS TABLE (SEGMENT 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    external_system VARCHAR(100) NOT NULL DEFAULT 'Mock_Hospital_HIS',
    status VARCHAR(30) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_session ON integration_logs(intake_session_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SEGMENT 4
-- ------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE summary_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public users access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public doctor profiles access" ON doctor_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public summary reviews access" ON summary_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public integration logs access" ON integration_logs FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- SAMPLE SEED DATA FOR DEMO & TESTING (DOCTOR & ADMIN)
-- ------------------------------------------------------------------------------
INSERT INTO patients (id, full_name, age, gender, phone, abha_id, preferred_language)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rajesh Sharma', 62, 'male', '9876543210', '91-1234-5678-9012', 'hi'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kavitha Ramachandran', 45, 'female', '9840123456', '91-9876-5432-1098', 'ta'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Ramesh Sundaram', 42, 'male', '9123456780', '91-5555-6666-7777', 'en')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, full_name, role, department)
VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'doctor@ayushman.gov.in', 'Dr. S. K. Venkatraman, MD', 'doctor', 'General & Internal Medicine'),
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'admin@ayushman.gov.in', 'Hospital Chief Medical Administrator', 'admin', 'Hospital Administration'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'ayush@ayushman.gov.in', 'Vaidya Ananya Nambiar, BAMS, MD (Ayu)', 'doctor', 'Ayurveda & Panchakarma Department')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. AYUSH / AYURVEDIC ASSESSMENTS TABLE (PART 12)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ayush_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    intake_session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    presenting_complaint TEXT NOT NULL,
    duration VARCHAR(100),
    previous_treatment TEXT,
    current_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    prakriti JSONB NOT NULL DEFAULT '{}'::jsonb,
    vikriti JSONB NOT NULL DEFAULT '{}'::jsonb,
    ahara_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
    vihara_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
    sara TEXT,
    samhanana TEXT,
    pramana TEXT,
    satmya TEXT,
    sattva TEXT,
    ahara_shakti TEXT,
    vyayama_shakti TEXT,
    vaya TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ayush_assessments_session ON ayush_assessments(intake_session_id);
CREATE INDEX IF NOT EXISTS idx_ayush_assessments_patient ON ayush_assessments(patient_id);
ALTER TABLE ayush_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public ayush assessments access" ON ayush_assessments FOR ALL USING (true) WITH CHECK (true);

