export type UserRole = 'patient' | 'doctor' | 'admin';

export interface DoctorUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  registration_number?: string;
  hospital_room?: string;
}

export interface AuthSession {
  user: DoctorUser;
  token: string;
  expiresAt: string;
}
