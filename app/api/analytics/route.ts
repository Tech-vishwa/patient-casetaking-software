import { NextRequest, NextResponse } from 'next/server';
import { AdminAnalyticsService } from '@/services/adminAnalyticsService';

export async function GET(req: NextRequest) {
  try {
    const summary = await AdminAnalyticsService.getAnalyticsSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve admin analytics' },
      { status: 500 }
    );
  }
}
