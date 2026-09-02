import { NextRequest, NextResponse } from 'next/server';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { CreateIntakeSessionInput, IntakeSessionStatus } from '@/types/intakeSession';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateIntakeSessionInput;
    if (!body.patient_id) {
      return NextResponse.json(
        { success: false, error: 'patient_id is required' },
        { status: 400 }
      );
    }
    const session = await IntakeSessionService.startSession(body.patient_id);
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start session' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, step, status } = body as {
      sessionId: string;
      step: number;
      status?: IntakeSessionStatus;
    };

    if (!sessionId || !step) {
      return NextResponse.json(
        { success: false, error: 'sessionId and step are required' },
        { status: 400 }
      );
    }

    const session = await IntakeSessionService.updateProgress(sessionId, step, status);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
