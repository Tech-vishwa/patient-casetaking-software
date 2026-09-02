import { NextRequest, NextResponse } from 'next/server';
import { ClinicalService } from '@/services/clinicalService';
import { CreateClinicalHistoryInput } from '@/types/clinical';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body as {
      action: 'save_conversation' | 'save_history' | 'log_red_flag';
      payload: any;
    };

    if (action === 'save_conversation') {
      const { intakeSessionId, patientId, messages, language } = payload;
      await ClinicalService.saveConversation(intakeSessionId, patientId, messages, language);
      return NextResponse.json({ success: true, message: 'Conversation saved' });
    }

    if (action === 'save_history') {
      const history = await ClinicalService.saveClinicalHistory(payload as CreateClinicalHistoryInput);
      return NextResponse.json({ success: true, data: history }, { status: 201 });
    }

    if (action === 'log_red_flag') {
      const { intakeSessionId, patientId, alertType, severity, matchedTerms } = payload;
      const alert = await ClinicalService.logRedFlagAlert(
        intakeSessionId,
        patientId,
        alertType,
        severity,
        matchedTerms
      );
      return NextResponse.json({ success: true, data: alert }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Unknown action specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing clinical request' },
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

    const history = await ClinicalService.getClinicalHistory(sessionId);
    if (!history) {
      return NextResponse.json({ success: false, message: 'Clinical history not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error retrieving clinical record' },
      { status: 500 }
    );
  }
}
