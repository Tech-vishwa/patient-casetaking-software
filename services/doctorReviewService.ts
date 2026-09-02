import { mockDb } from '@/lib/supabase/mockDb';
import { SummaryReview, CreateSummaryReviewInput } from '@/types/review';
import { IntakeSessionService } from './intakeSessionService';

export class DoctorReviewService {
  /**
   * Submit a physician review (Approval, In-line Modification, or Rejection).
   * Preserves original AI summary and doctor edits side-by-side with full auditability.
   */
  static async submitReview(input: CreateSummaryReviewInput): Promise<SummaryReview> {
    const review = await mockDb.saveSummaryReview(input);

    // Update intake session lifecycle status to completed
    await IntakeSessionService.updateProgress(input.intakeSessionId, 3, 'completed');

    return review;
  }

  /**
   * Fetch physician review for a given intake session.
   */
  static async getReviewBySession(sessionId: string): Promise<SummaryReview | null> {
    return mockDb.getSummaryReviewBySession(sessionId);
  }
}
