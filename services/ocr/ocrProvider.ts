import { MedicalDocumentType } from '@/types/document';

export interface OCRResult {
  text: string;
  confidence: number;
  detectedType?: MedicalDocumentType;
}

export interface IOCRProvider {
  name: string;
  isAvailable(): boolean;
  extractText(
    fileInput: {
      fileName: string;
      mimeType: string;
      base64Data?: string;
      fileBuffer?: ArrayBuffer;
    },
    docTypeHint?: MedicalDocumentType
  ): Promise<OCRResult>;
}

/**
 * Intelligent Simulated / Hybrid Medical OCR Provider
 * Formulates realistic OCR text extraction with clinical regexes,
 * and contains extensible adapter points for Google Cloud Vision / Gemini Multimodal API.
 */
export class SimulatedVisionOCRProvider implements IOCRProvider {
  name = 'MediKiosk Simulated Vision OCR';

  isAvailable(): boolean {
    return true;
  }

  async extractText(
    fileInput: {
      fileName: string;
      mimeType: string;
      base64Data?: string;
      fileBuffer?: ArrayBuffer;
    },
    docTypeHint?: MedicalDocumentType
  ): Promise<OCRResult> {
    // Simulate slight OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerName = fileInput.fileName.toLowerCase();

    // 1. Prescription Pattern
    if (docTypeHint === 'prescription' || lowerName.includes('presc') || lowerName.includes('rx') || lowerName.includes('med')) {
      return {
        text: `
APOLLO MULTISPECIALITY CLINIC
Dr. S. K. Venkatraman, MD, DM (Cardiology)
Reg No: MCI-28491
Date: 14/05/2023

Patient Name: Rajesh Sharma
Age: 59 Yrs  Gender: Male

Diagnosis / Impression:
1. Essential Hypertension
2. Type 2 Diabetes Mellitus

Rx (Medications):
1. Tab. Metformin 500mg - 1 tab twice daily after food (B.D)
2. Tab. Telmisartan 40mg - 1 tab once daily in morning (O.D)
3. Tab. Atorvastatin 10mg - 1 tab at bedtime (H.S)

Advice: Low salt & low carbohydrate diet. Check fasting blood sugar regularly.
Next Review: 3 Months
        `.trim(),
        confidence: 0.96,
        detectedType: 'prescription',
      };
    }

    // 2. Lab Report Pattern
    if (docTypeHint === 'lab_report' || lowerName.includes('lab') || lowerName.includes('blood') || lowerName.includes('test') || lowerName.includes('report')) {
      return {
        text: `
LAL PATHLABS CLINICAL DIAGNOSTIC REPORT
Patient: Rajesh Sharma   Age/Sex: 60/M
Sample Collected: 10/11/2024
Report Status: Final

BIOCHEMISTRY INVESTIGATIONS:
Test Name              Observed Value   Units    Reference Range
----------------------------------------------------------------
Fasting Blood Sugar    240              mg/dL    70 - 100
Post Prandial Sugar    310              mg/dL    110 - 140
HbA1c (Glycated Hb)    8.8              %        4.0 - 5.6
Serum Creatinine       1.1              mg/dL    0.7 - 1.3
Total Cholesterol      215              mg/dL    125 - 200
Hemoglobin             14.2             g/dL     13.0 - 17.0

Comments: Elevated glycemic parameters noted. Clinical correlation suggested.
        `.trim(),
        confidence: 0.98,
        detectedType: 'lab_report',
      };
    }

    // 3. Discharge Summary Pattern
    if (docTypeHint === 'discharge_summary' || lowerName.includes('discharge') || lowerName.includes('summary') || lowerName.includes('hospital')) {
      return {
        text: `
CITY GENERAL HOSPITAL - DISCHARGE SUMMARY
IP No: 884920   Date of Admission: 12/03/2022   Date of Discharge: 16/03/2022
Patient: Rajesh Sharma   Age: 58   Gender: Male

Final Diagnosis:
Acute Appendicitis (Resolved)

Surgical / Interventional Procedure:
Laparoscopic Appendectomy performed on 13/03/2022 under General Anesthesia.

Hospital Course:
Patient underwent uneventful laparoscopic appendectomy. Post-operative recovery was smooth.
Wound healthy, afebrile at discharge.

Discharge Medications:
1. Tab. Amoxicillin-Clavulanate 625mg - 1 tab twice daily for 5 days
2. Tab. Paracetamol 650mg - 1 tab as needed for pain
        `.trim(),
        confidence: 0.97,
        detectedType: 'discharge_summary',
      };
    }

    // 4. Default / Generic Medical Document
    return {
      text: `
CLINICAL CONSULTATION NOTE
Date: 05/01/2024
Patient: Rajesh Sharma

Assessment:
Chronic mild knee osteoarthritis with bilateral morning stiffness.

Medications:
1. Tab. Glucosamine Sulfate 1500mg once daily
2. Topical Diclofenac Gel for local knee application
      `.trim(),
      confidence: 0.92,
      detectedType: 'other',
    };
  }
}

export const defaultOCRProvider: IOCRProvider = new SimulatedVisionOCRProvider();
