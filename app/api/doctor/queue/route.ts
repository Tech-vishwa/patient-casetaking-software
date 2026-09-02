import { NextRequest, NextResponse } from 'next/server';
import { DoctorQueueService } from '@/services/doctorQueueService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const priorityFilter = (searchParams.get('priorityFilter') as any) || undefined;
    const statusFilter = (searchParams.get('statusFilter') as any) || undefined;

    const queue = await DoctorQueueService.getQueue({
      searchQuery,
      priorityFilter,
      statusFilter,
    });

    const metrics = await DoctorQueueService.getQueueMetrics();

    return NextResponse.json({
      success: true,
      data: {
        queue,
        metrics,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch doctor patient queue' },
      { status: 500 }
    );
  }
}
