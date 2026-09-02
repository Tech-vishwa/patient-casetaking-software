import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessingService } from '@/services/documentProcessingService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, intakeSessionId, fileName, fileSize, mimeType, fileUrl, documentType, base64Data } = body;

    if (!patientId || !intakeSessionId || !fileName || !documentType) {
      return NextResponse.json(
        { success: false, error: 'patientId, intakeSessionId, fileName, and documentType are required.' },
        { status: 400 }
      );
    }

    const result = await DocumentProcessingService.processDocument({
      patientId,
      intakeSessionId,
      fileName,
      fileSize: fileSize || 1024,
      mimeType: mimeType || 'image/jpeg',
      fileUrl: fileUrl || 'https://storage.mock/demo-doc.jpg',
      documentType,
      base64Data,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing document' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const docs = await DocumentProcessingService.getSessionDocuments(sessionId);
    return NextResponse.json({ success: true, data: docs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching documents' },
      { status: 500 }
    );
  }
}
