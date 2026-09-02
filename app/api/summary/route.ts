import { NextRequest, NextResponse } from 'next/server';
import { SummaryGeneratorService } from '@/services/summaryGeneratorService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, patientId } = body;

    if (!sessionId || !patientId) {
      return NextResponse.json(
        { success: false, error: 'sessionId and patientId are required.' },
        { status: 400 }
      );
    }

    const summary = await SummaryGeneratorService.generateSummary(sessionId, patientId);
    return NextResponse.json({ success: true, data: summary }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error generating clinical summary' },
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

    const summary = await SummaryGeneratorService.getSummary(sessionId);
    if (!summary) {
      return NextResponse.json({ success: false, message: 'Summary not yet generated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching summary' },
      { status: 500 }
    );
  }
}
