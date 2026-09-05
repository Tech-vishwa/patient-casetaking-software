import { mockDb } from '@/lib/supabase/mockDb';
import { PatientQueueItem, QueueFilterOptions } from '@/types/doctorQueue';

export class DoctorQueueService {
  /**
   * Retrieves the triaged patient queue sorted by Priority (Emergency/Red Flag -> High -> Normal -> Waiting Longest).
   */
  static async getQueue(filters?: QueueFilterOptions): Promise<PatientQueueItem[]> {
    const queue = await mockDb.getDoctorPatientQueue();

    if (!filters) return queue;

    return queue.filter((item) => {
      // Search filter (Name, Phone, ABHA, Complaint)
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesPhone = item.phone.includes(q);
        const matchesAbha = item.abhaId?.toLowerCase().includes(q) || false;
        const matchesComplaint = item.chiefComplaint.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesAbha && !matchesComplaint) {
          return false;
        }
      }

      // Priority filter
      if (filters.priorityFilter && filters.priorityFilter !== 'all') {
        if (item.priority !== filters.priorityFilter) return false;
      }

      // Status filter
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        if (item.reviewStatus !== filters.statusFilter) return false;
      }

      // Consultation mode filter
      if (filters.consultationModeFilter && filters.consultationModeFilter !== 'all') {
        if (item.consultationMode !== filters.consultationModeFilter) return false;
      }

      return true;
    });
  }

  /**
   * Quick counts for dashboard badges
   */
  static async getQueueMetrics(): Promise<{
    totalWaiting: number;
    emergencyCount: number;
    reviewedCount: number;
    averageWaitMinutes: number;
  }> {
    const queue = await mockDb.getDoctorPatientQueue();
    const totalWaiting = queue.length;
    const emergencyCount = queue.filter((q) => q.priority === 'critical').length;
    const reviewedCount = queue.filter((q) => q.reviewStatus !== 'pending').length;
    const avgWait =
      totalWaiting > 0
        ? Math.round(queue.reduce((acc, curr) => acc + curr.waitingTimeMinutes, 0) / totalWaiting)
        : 0;

    return {
      totalWaiting,
      emergencyCount,
      reviewedCount,
      averageWaitMinutes: avgWait,
    };
  }
}
