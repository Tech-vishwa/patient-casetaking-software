import { NextRequest, NextResponse } from 'next/server';
import { ConsentService } from '@/services/consentService';
import { CreateConsentInput } from '@/types/consent';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateConsentInput;
    const consent = await ConsentService.recordConsent(body);
    return NextResponse.json({ success: true, data: consent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record consent' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'patientId parameter is required' },
        { status: 400 }
      );
    }

    const consent = await ConsentService.getActiveConsent(patientId);
    if (!consent) {
      return NextResponse.json(
        { success: false, message: 'No active consent found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: consent });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching consent' },
      { status: 500 }
    );
  }
}
