export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  patientProfileId?: string;
  doctorProfileId?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  services: string;
  icon?: string;
  roomNumber?: string;
  active?: boolean;
  doctors?: Doctor[];
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  phone?: string;
  specialty: string;
  departmentId: string;
  department?: Department;
  bio?: string;
  qualification?: string;
  availableDays: string;
  slotDurationMins: number;
  active?: boolean;
}

export interface PatientRequirement {
  id: string;
  referenceNumber: string;
  patientId: string;
  visitReason: string;
  symptoms: string;
  onsetDate?: string;
  durationDays?: number;
  previousVisit: boolean;
  existingConditions?: string;
  allergies?: string;
  medications?: string;
  doctorConsultedBefore: boolean;
  preferredDepartmentId?: string;
  preferredDoctorId?: string;
  preferredBranch?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  isNewPatient: boolean;
  additionalNotes?: string;
  status: string;
  createdAt: string;
}

export interface Recommendation {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  description: string;
  services: string;
  matchScore: number;
  matchReason: string;
  urgentCareNotice?: string;
  availableDoctors: Array<{
    id: string;
    fullName: string;
    specialty: string;
    availableDays: string;
  }>;
}

export interface Appointment {
  id: string;
  referenceNumber: string;
  patientId: string;
  patient?: PatientProfile;
  doctorId: string;
  doctor?: Doctor;
  departmentId: string;
  department?: Department;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  queueEntry?: QueueEntry;
  consultation?: Consultation;
  createdAt: string;
}

export interface QueueEntry {
  id: string;
  appointmentId: string;
  appointment?: Appointment;
  doctorId: string;
  doctor?: Doctor;
  departmentId: string;
  department?: Department;
  queueNumber: number;
  position: number;
  patientsAhead?: number;
  dynamicPosition?: number;
  status: QueueStatus;
  estimatedWaitMins: number;
  checkInTime: string;
  startTime?: string;
  endTime?: string;
}

export interface Prescription {
  id?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  patient?: PatientProfile;
  doctorId: string;
  doctor?: Doctor;
  chiefComplaint: string;
  diagnosis: string;
  prescriptionNotes?: string;
  followUpDate?: string;
  doctorNotes?: string;
  prescriptions?: Prescription[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
