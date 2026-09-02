import { NextRequest, NextResponse } from 'next/server';
import { DoctorReviewService } from '@/services/doctorReviewService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intakeSessionId, patientId, doctorId, doctorName, originalSummary, editedSummary, reviewStatus, doctorNotes } = body;

    if (!intakeSessionId || !patientId || !doctorId || !reviewStatus) {
      return NextResponse.json(
        { success: false, error: 'intakeSessionId, patientId, doctorId, and reviewStatus are required.' },
        { status: 400 }
      );
    }

    const review = await DoctorReviewService.submitReview({
      intakeSessionId,
      patientId,
      doctorId,
      doctorName: doctorName || 'Attending Physician',
      originalSummary,
      editedSummary,
      reviewStatus,
      doctorNotes,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error saving doctor review' },
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
        { success: false, error: 'sessionId parameter is required.' },
        { status: 400 }
      );
    }

    const review = await DoctorReviewService.getReviewBySession(sessionId);
    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching doctor review' },
      { status: 500 }
    );
  }
}
