import { NextRequest, NextResponse } from 'next/server';
import { HospitalIntegrationService } from '@/services/hospitalIntegrationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, summary } = body;

    if (!sessionId || !summary) {
      return NextResponse.json(
        { success: false, error: 'sessionId and summary are required.' },
        { status: 400 }
      );
    }

    const result = await HospitalIntegrationService.pushClinicalSummary(sessionId, summary);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error transmitting to hospital HIS' },
      { status: 500 }
    );
  }
}
