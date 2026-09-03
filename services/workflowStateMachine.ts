import { WorkflowState, IntakeSessionStatus } from '@/types/intakeSession';

export class WorkflowStateMachine {
  /**
   * Deterministic route mapping for each workflow state
   */
  static getRouteForWorkflowState(state: WorkflowState): string {
    switch (state) {
      case 'ONBOARDING':
        return '/kiosk/welcome';
      case 'LANGUAGE_SELECTED':
        return '/kiosk/identification';
      case 'IDENTIFIED':
        return '/kiosk/consent';
      case 'CONSENT_COMPLETED':
      case 'HISTORY_IN_PROGRESS':
        return '/kiosk/conversation';
      case 'HISTORY_COMPLETED':
      case 'DOCUMENTS_IN_PROGRESS':
        return '/kiosk/documents';
      case 'DOCUMENTS_COMPLETED':
      case 'SUMMARY_READY':
        return '/kiosk/summary';
      case 'PATIENT_CONFIRMED':
        return '/kiosk/summary';
      case 'DOCTOR_REVIEW':
        return '/doctor/queue';
      case 'COMPLETED':
        return '/patient/dashboard';
      default:
        return '/kiosk/welcome';
    }
  }

  /**
   * Determine workflow state from current pathname
   */
  static getWorkflowStateForRoute(pathname: string): WorkflowState {
    if (pathname.includes('/kiosk/welcome')) return 'ONBOARDING';
    if (pathname.includes('/kiosk/language')) return 'ONBOARDING';
    if (pathname.includes('/kiosk/identification')) return 'LANGUAGE_SELECTED';
    if (pathname.includes('/kiosk/consent')) return 'IDENTIFIED';
    if (pathname.includes('/kiosk/conversation')) return 'HISTORY_IN_PROGRESS';
    if (pathname.includes('/kiosk/documents')) return 'DOCUMENTS_IN_PROGRESS';
    if (pathname.includes('/kiosk/summary')) return 'SUMMARY_READY';
    if (pathname.includes('/doctor/patient')) return 'DOCTOR_REVIEW';
    if (pathname.includes('/doctor/queue') || pathname.includes('/doctor/dashboard')) return 'DOCTOR_REVIEW';
    if (pathname.includes('/patient/dashboard')) return 'COMPLETED';
    return 'ONBOARDING';
  }

  /**
   * Sequential state progression
   */
  static getNextWorkflowState(currentState: WorkflowState): WorkflowState {
    switch (currentState) {
      case 'ONBOARDING':
        return 'LANGUAGE_SELECTED';
      case 'LANGUAGE_SELECTED':
        return 'IDENTIFIED';
      case 'IDENTIFIED':
        return 'CONSENT_COMPLETED';
      case 'CONSENT_COMPLETED':
        return 'HISTORY_IN_PROGRESS';
      case 'HISTORY_IN_PROGRESS':
        return 'HISTORY_COMPLETED';
      case 'HISTORY_COMPLETED':
        return 'DOCUMENTS_IN_PROGRESS';
      case 'DOCUMENTS_IN_PROGRESS':
        return 'DOCUMENTS_COMPLETED';
      case 'DOCUMENTS_COMPLETED':
        return 'SUMMARY_READY';
      case 'SUMMARY_READY':
        return 'PATIENT_CONFIRMED';
      case 'PATIENT_CONFIRMED':
        return 'DOCTOR_REVIEW';
      case 'DOCTOR_REVIEW':
        return 'COMPLETED';
      case 'COMPLETED':
        return 'COMPLETED';
      default:
        return 'ONBOARDING';
    }
  }

  /**
   * Maps workflow state to 1-5 kiosk progress indicator
   */
  static mapWorkflowStateToStep(state: WorkflowState): number {
    switch (state) {
      case 'ONBOARDING':
        return 1;
      case 'LANGUAGE_SELECTED':
        return 2;
      case 'IDENTIFIED':
        return 2;
      case 'CONSENT_COMPLETED':
        return 3;
      case 'HISTORY_IN_PROGRESS':
      case 'HISTORY_COMPLETED':
        return 3;
      case 'DOCUMENTS_IN_PROGRESS':
      case 'DOCUMENTS_COMPLETED':
        return 4;
      case 'SUMMARY_READY':
      case 'PATIENT_CONFIRMED':
      case 'DOCTOR_REVIEW':
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  }

  /**
   * Maps workflow state to database IntakeSessionStatus
   */
  static mapWorkflowStateToStatus(state: WorkflowState): IntakeSessionStatus {
    switch (state) {
      case 'ONBOARDING':
      case 'LANGUAGE_SELECTED':
      case 'IDENTIFIED':
      case 'CONSENT_COMPLETED':
        return 'onboarding';
      case 'HISTORY_IN_PROGRESS':
        return 'history_in_progress';
      case 'HISTORY_COMPLETED':
        return 'history_completed';
      case 'DOCUMENTS_IN_PROGRESS':
      case 'DOCUMENTS_COMPLETED':
        return 'documents_in_progress';
      case 'SUMMARY_READY':
      case 'PATIENT_CONFIRMED':
        return 'summary_ready';
      case 'DOCTOR_REVIEW':
      case 'COMPLETED':
        return 'completed';
      default:
        return 'onboarding';
    }
  }
}
