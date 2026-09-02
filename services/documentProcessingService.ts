import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockDb } from '@/lib/supabase/mockDb';
import { defaultOCRProvider, IOCRProvider } from './ocr/ocrProvider';
import { MedicalEntityExtractor } from './ocr/entityExtractor';
import {
  MedicalDocument,
  MedicalDocumentType,
  DocumentExtraction,
  CreateMedicalDocumentInput,
} from '@/types/document';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf',
];

export interface ProcessDocumentRequest {
  patientId: string;
  intakeSessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  documentType: MedicalDocumentType;
  base64Data?: string;
}

export class DocumentProcessingService {
  private static ocrProvider: IOCRProvider = defaultOCRProvider;

  /**
   * Allows injecting custom OCR providers (e.g. Cloud Vision, Gemini Vision)
   */
  static setOCRProvider(provider: IOCRProvider) {
    this.ocrProvider = provider;
  }

  /**
   * Validates file properties before processing
   */
  static validateFile(fileName: string, fileSize: number, mimeType: string): { valid: boolean; error?: string } {
    if (!fileName || fileName.trim().length === 0) {
      return { valid: false, error: 'File name is missing.' };
    }

    if (fileSize > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds maximum allowed limit of 15MB.' };
    }

    const isExtensionAllowed = /\.(jpg|jpeg|png|webp|pdf)$/i.test(fileName);
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase()) || mimeType === '';

    if (!isExtensionAllowed && !isMimeAllowed) {
      return { valid: false, error: 'Unsupported file type. Please upload JPG, PNG, or PDF documents.' };
    }

    return { valid: true };
  }

  /**
   * Complete End-to-End Document Upload & Extraction Pipeline
   */
  static async processDocument(req: ProcessDocumentRequest): Promise<{
    document: MedicalDocument;
    extraction: DocumentExtraction;
  }> {
    // 1. Validate File
    const validation = this.validateFile(req.fileName, req.fileSize, req.mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // 2. Create Initial Document Record in Database (Status: Uploading -> Processing)
    const docInput: CreateMedicalDocumentInput = {
      patient_id: req.patientId,
      intake_session_id: req.intakeSessionId,
      file_name: req.fileName,
      file_url: req.fileUrl,
      file_size: req.fileSize,
      mime_type: req.mimeType,
      document_type: req.documentType,
    };

    let doc = await mockDb.createMedicalDocument(docInput);

    try {
      // Update status to processing
      await mockDb.updateMedicalDocument(doc.id, { processing_status: 'processing' });

      // 3. OCR Pipeline Execution
      const ocrResult = await this.ocrProvider.extractText(
        {
          fileName: req.fileName,
          mimeType: req.mimeType,
          base64Data: req.base64Data,
        },
        req.documentType
      );

      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        throw new Error('OCR produced empty text. Please ensure document image is clear.');
      }

      // 4. Medical Entity & Date Extraction (NLP + Rule Matcher)
      const extraction = MedicalEntityExtractor.extractEntities(ocrResult.text, doc.id);

      // 5. Update Medical Document Record
      const updatedDoc = await mockDb.updateMedicalDocument(doc.id, {
        extracted_text: ocrResult.text,
        processing_status: 'completed',
        document_date: extraction.documentDate || new Date().toISOString().split('T')[0],
      });

      // 6. Save Document Extraction
      await mockDb.saveDocumentExtraction({
        document_id: doc.id,
        diagnoses: extraction.diagnoses,
        medications: extraction.medications,
        labResults: extraction.labResults,
        procedures: extraction.procedures,
        documentDate: extraction.documentDate,
        confidence: extraction.confidence,
        raw_structured_data: extraction.raw_structured_data,
      });

      return {
        document: updatedDoc || doc,
        extraction,
      };
    } catch (err: any) {
      await mockDb.updateMedicalDocument(doc.id, { processing_status: 'failed' });
      throw new Error(err.message || 'Document OCR and extraction pipeline failed');
    }
  }

  /**
   * Retrieve all uploaded documents and extractions for an intake session
   */
  static async getSessionDocuments(sessionId: string): Promise<MedicalDocument[]> {
    return await mockDb.getMedicalDocumentsBySession(sessionId);
  }

  /**
   * Delete a document and its extractions
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    return await mockDb.deleteMedicalDocument(documentId);
  }

  /**
   * Update document date (e.g. patient corrected date)
   */
  static async updateDocumentDate(documentId: string, newDate: string): Promise<MedicalDocument | null> {
    return await mockDb.updateMedicalDocument(documentId, { document_date: newDate });
  }
}
