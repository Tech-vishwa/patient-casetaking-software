import { ConsultationMode } from './intakeSession';

export type QueuePriority = 'critical' | 'high' | 'normal';

export type PatientReviewStatus = 'pending' | 'reviewed' | 'modified' | 'approved' | 'rejected';

export interface PatientQueueItem {
  sessionId: string;
  patientId: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  abhaId?: string | null;
  chiefComplaint: string;
  consultationMode?: ConsultationMode;
  priority: QueuePriority;
  hasRedFlag: boolean;
  redFlagCategories: string[];
  completedAt: string;
  waitingTimeMinutes: number;
  documentCount: number;
  reviewStatus: PatientReviewStatus;
  preferredLanguage: string;
}

export interface QueueFilterOptions {
  searchQuery?: string;
  priorityFilter?: 'all' | 'critical' | 'high' | 'normal';
  statusFilter?: 'all' | 'pending' | 'approved' | 'modified' | 'rejected';
  consultationModeFilter?: 'all' | 'MODERN_MEDICINE' | 'AYUSH';
}
