import { NextRequest, NextResponse } from 'next/server';
import { IntakeSessionService } from '@/services/intakeSessionService';
import { CreateIntakeSessionInput, IntakeSessionStatus, WorkflowState } from '@/types/intakeSession';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateIntakeSessionInput;
    if (!body.patient_id) {
      return NextResponse.json(
        { success: false, error: 'patient_id is required' },
        { status: 400 }
      );
    }
    const session = await IntakeSessionService.startSession(body.patient_id, body.workflow_state || 'ONBOARDING');
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start session' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const patientId = searchParams.get('patientId');

    if (sessionId) {
      const session = await IntakeSessionService.getSession(sessionId);
      if (!session) {
        return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: session });
    }

    if (patientId) {
      const incomplete = await IntakeSessionService.getIncompleteSession(patientId);
      return NextResponse.json({ success: true, data: incomplete });
    }

    return NextResponse.json(
      { success: false, error: 'Either sessionId or patientId parameter is required' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, step, status, workflow_state, draft_history } = body as {
      sessionId: string;
      step?: number;
      status?: IntakeSessionStatus;
      workflow_state?: WorkflowState;
      draft_history?: any;
    };

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    let session = null;
    if (workflow_state) {
      session = await IntakeSessionService.updateWorkflowState(sessionId, workflow_state, step, status, draft_history);
    } else if (step !== undefined) {
      session = await IntakeSessionService.updateProgress(sessionId, step, status);
    }

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
