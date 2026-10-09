import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']).default('PATIENT'),
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    medicalHistory: z.string().optional(),
    allergies: z.string().optional(),
    currentMedications: z.string().optional(),
  }),
});

export const requirementSchema = z.object({
  body: z.object({
    visitReason: z.string().min(3, 'Main reason for visit is required'),
    symptoms: z.string().min(3, 'Symptoms description is required'),
    onsetDate: z.string().optional(),
    durationDays: z.number().optional(),
    previousVisit: z.boolean().default(false),
    existingConditions: z.string().optional(),
    allergies: z.string().optional(),
    medications: z.string().optional(),
    doctorConsultedBefore: z.boolean().default(false),
    preferredDepartmentId: z.string().optional(),
    preferredDoctorId: z.string().optional(),
    preferredBranch: z.string().optional(),
    preferredDate: z.string().optional(),
    preferredTimeSlot: z.string().optional(),
    isNewPatient: z.boolean().default(true),
    additionalNotes: z.string().optional(),
  }),
});

export const appointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, 'Doctor is required'),
    departmentId: z.string().min(1, 'Department is required'),
    appointmentDate: z.string().min(1, 'Appointment date is required'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    notes: z.string().optional(),
  }),
});

export const consultationSchema = z.object({
  body: z.object({
    appointmentId: z.string().min(1, 'Appointment ID is required'),
    chiefComplaint: z.string().min(2, 'Chief complaint is required'),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    prescriptionNotes: z.string().optional(),
    followUpDate: z.string().optional(),
    doctorNotes: z.string().optional(),
    prescriptions: z
      .array(
        z.object({
          medicationName: z.string().min(1, 'Medication name required'),
          dosage: z.string().min(1, 'Dosage required'),
          frequency: z.string().min(1, 'Frequency required'),
          duration: z.string().min(1, 'Duration required'),
          instructions: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export const adminDoctorSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    phone: z.string().optional(),
    specialty: z.string().min(2),
    departmentId: z.string().min(1),
    bio: z.string().optional(),
    qualification: z.string().optional(),
    availableDays: z.string().default('Monday,Tuesday,Wednesday,Thursday,Friday'),
    slotDurationMins: z.number().default(30),
  }),
});

export const adminDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    description: z.string().min(5),
    services: z.string().min(2),
    roomNumber: z.string().optional(),
    icon: z.string().optional(),
  }),
});
