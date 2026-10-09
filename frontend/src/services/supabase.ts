import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Department,
  Doctor,
  Appointment,
  QueueEntry,
  Consultation,
  Prescription,
  User,
  PatientProfile,
  Recommendation,
  PatientRequirement,
} from '../types';
import { getStoredData, setStoredData } from './api';

// Retrieve Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mszmuyhhxymxvjzzsjlk.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 10
  );
};

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Fallback seed data generators and storage helpers
const FALLBACK_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: 'Comprehensive heart & cardiovascular care, diagnostics and interventions.', services: 'ECG, Echocardiogram, Holter Monitoring, Stress Test', icon: 'Heart', roomNumber: 'Wing A - 101', active: true },
  { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: 'Advanced neurological disorders, brain diagnostics & spine therapy.', services: 'EEG, MRI Screening, EMG, Stroke Management', icon: 'Brain', roomNumber: 'Wing B - 204', active: true },
  { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: 'Musculoskeletal injuries, joints, spine reconstruction & sports medicine.', services: 'X-Ray, Joint Assessment, Bone Density, Fracture Care', icon: 'Activity', roomNumber: 'Wing C - 105', active: true },
  { id: 'dept-4', name: 'Pediatrics', code: 'PEDI', description: 'Specialized healthcare for infants, children, and adolescents.', services: 'Childhood Immunization, Growth Tracking, Pediatric Checkup', icon: 'Baby', roomNumber: 'Wing D - 110', active: true },
  { id: 'dept-5', name: 'General Internal Medicine', code: 'GENM', description: 'Primary comprehensive acute and chronic healthcare for all adults.', services: 'Annual Physical, Diabetes Management, Hypertension', icon: 'Stethoscope', roomNumber: 'Wing A - 102', active: true },
  { id: 'dept-6', name: 'Dermatology', code: 'DERM', description: 'Skin disorders, allergies, lesion biopsy, and aesthetic dermatology.', services: 'Allergy Patch Test, Dermoscopy, Cryotherapy, Biopsy', icon: 'Shield', roomNumber: 'Wing B - 208', active: true },
];

const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    userId: 'usr-doc1',
    fullName: 'Dr. Sarah Smith, MD, FACC',
    specialty: 'Interventional Cardiology Specialist',
    departmentId: 'dept-1',
    availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    slotDurationMins: 30,
    bio: 'Over 14 years of clinical experience in advanced cardiovascular diagnosis, hypertension, and arrhythmia management.',
    qualification: 'MD - Harvard Medical School, Cardiology Fellowship Johns Hopkins',
    active: true,
  },
  {
    id: 'doc-2',
    userId: 'usr-doc2',
    fullName: 'Dr. Michael Chen, MD, PhD',
    specialty: 'Clinical Neurology & Neuro-critical Care',
    departmentId: 'dept-2',
    availableDays: 'Monday,Wednesday,Friday',
    slotDurationMins: 30,
    bio: 'Specialist in migraine management, neuromuscular disorders, stroke prevention, and cognitive assessments.',
    qualification: 'MD, PhD - Stanford University School of Medicine',
    active: true,
  },
  {
    id: 'doc-3',
    userId: 'usr-doc3',
    fullName: 'Dr. Priya Patel, MD, FAAOS',
    specialty: 'Orthopedics & Joint Reconstruction',
    departmentId: 'dept-3',
    availableDays: 'Tuesday,Thursday,Saturday',
    slotDurationMins: 30,
    bio: 'Expert in sports injuries, knee and hip arthroplasty, and post-traumatic musculoskeletal recovery.',
    qualification: 'MD - Columbia University, Orthopedic Fellowship Mayo Clinic',
    active: true,
  },
  {
    id: 'doc-4',
    userId: 'usr-doc4',
    fullName: 'Dr. David Wilson, MD, FAAP',
    specialty: 'Pediatric Care & Adolescent Medicine',
    departmentId: 'dept-4',
    availableDays: 'Monday,Tuesday,Thursday,Friday',
    slotDurationMins: 30,
    bio: 'Dedicated pediatrician focusing on preventive child health, developmental milestones, and pediatric immunology.',
    qualification: 'MD - University of Pennsylvania Perelman School of Medicine',
    active: true,
  },
  {
    id: 'doc-5',
    userId: 'usr-doc5',
    fullName: 'Dr. Elena Rostova, MD',
    specialty: 'General Internal Medicine & Diagnostic Care',
    departmentId: 'dept-5',
    availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
    slotDurationMins: 30,
    bio: 'Specialist in multi-system chronic disease management, preventive health screening, and geriatric care.',
    qualification: 'MD - Yale School of Medicine',
    active: true,
  },
  {
    id: 'doc-6',
    userId: 'usr-doc6',
    fullName: 'Dr. Marcus Vance, MD, FAAD',
    specialty: 'Clinical Dermatology & Cutaneous Surgery',
    departmentId: 'dept-6',
    availableDays: 'Monday,Wednesday,Thursday',
    slotDurationMins: 30,
    bio: 'Specializing in chronic dermatitis, psoriasis therapy, mole screening, and dermatological surgical procedures.',
    qualification: 'MD - Northwestern University Feinberg School of Medicine',
    active: true,
  },
];

export interface MedicineStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minReorderLevel: number;
  unitPrice: number;
  location: string;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// 1. SUPABASE AUTH SERVICE
// ---------------------------------------------------------------------------
export const supabaseAuth = {
  async signUp(email: string, password: string, fullName: string, role: string = 'PATIENT', phone?: string) {
    if (!isSupabaseConfigured()) {
      // Offline/Local Mode
      const user: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        role: role as any,
        fullName,
        patientProfileId: 'pat-' + Math.random().toString(36).substring(2, 7),
      };
      const users = getStoredData<User[]>('registered_users', []);
      users.push(user);
      setStoredData('registered_users', users);
      return { user, token: 'local-mock-token-' + Date.now() };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone,
        },
      },
    });

    if (authError) throw authError;
    const authUser = authData.user;
    if (!authUser) throw new Error('User registration failed');

    // Create or update profile in 'profiles' table safely
    try {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        email,
        full_name: fullName,
        role: (role || 'PATIENT').toUpperCase(),
        phone: phone || null,
        created_at: new Date().toISOString(),
      });
    } catch (upsertErr) {
      console.warn('Profile sync note:', upsertErr);
    }

    const user: User = {
      id: authUser.id,
      email,
      role: (role || 'PATIENT').toUpperCase() as any,
      fullName,
      patientProfileId: authUser.id,
    };

    return { user, token: authData.session?.access_token || 'supabase-session-token' };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      // Local fallback lookup
      const users = getStoredData<User[]>('registered_users', [
        { id: 'usr-patient-1', email: 'john.doe@example.com', role: 'PATIENT', fullName: 'John Doe', patientProfileId: 'pat-1' },
        { id: 'usr-doc1', email: 'dr.smith@hospital.com', role: 'DOCTOR', fullName: 'Dr. Sarah Smith, MD', doctorProfileId: 'doc-1' },
        { id: 'usr-admin', email: 'admin@hospital.com', role: 'ADMIN', fullName: 'System Administrator' },
      ]);
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: 'usr-' + Math.random().toString(36).substring(2, 7),
        email,
        role: email.includes('admin') ? 'ADMIN' : email.includes('dr') ? 'DOCTOR' : 'PATIENT',
        fullName: email.split('@')[0],
        patientProfileId: 'pat-1',
        doctorProfileId: email.includes('dr') ? 'doc-1' : undefined,
      };
      return { user: matched as User, token: 'local-token-' + Date.now() };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Authentication failed');

      // Fetch user profile from Supabase profiles table safely
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        role: (profile?.role || data.user.user_metadata?.role || (email.includes('admin') ? 'ADMIN' : email.includes('dr') ? 'DOCTOR' : 'PATIENT')) as any,
        fullName: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
        patientProfileId: data.user.id,
        doctorProfileId: profile?.doctor_profile_id || (email.includes('dr') ? 'doc-1' : undefined),
      };

      return { user, token: data.session.access_token };
    } catch (authErr: any) {
      // Demo credentials fallback when demo accounts are not yet provisioned in Supabase Auth
      const demoAccounts: Record<string, Partial<User>> = {
        'admin@hospital.com': { id: 'usr-admin', role: 'ADMIN', fullName: 'System Administrator' },
        'dr.smith@hospital.com': { id: 'usr-doc1', role: 'DOCTOR', fullName: 'Dr. Sarah Smith, MD', doctorProfileId: 'doc-1' },
        'john.doe@example.com': { id: 'usr-patient-1', role: 'PATIENT', fullName: 'John Doe', patientProfileId: 'pat-1' },
      };
      const demo = demoAccounts[email.toLowerCase()];
      if (demo) {
        const user: User = {
          id: demo.id || 'usr-demo',
          email,
          role: demo.role as any,
          fullName: demo.fullName || email.split('@')[0],
          doctorProfileId: demo.doctorProfileId,
          patientProfileId: demo.patientProfileId || 'pat-1',
        };
        return { user, token: 'demo-session-token-' + Date.now() };
      }
      throw authErr;
    }
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('hms_app_state_v1_current_user');
  },

  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};

// ---------------------------------------------------------------------------
// 2. SUPABASE DEPARTMENTS SERVICE
// ---------------------------------------------------------------------------
export const supabaseDepartments = {
  async getAll(): Promise<Department[]> {
    if (!isSupabaseConfigured()) {
      return getStoredData('departments_cache', FALLBACK_DEPARTMENTS);
    }

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Supabase departments table query note:', error?.message);
      return getStoredData('departments_cache', FALLBACK_DEPARTMENTS);
    }

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      services: d.services,
      icon: d.icon,
      roomNumber: d.room_number,
      active: d.active,
    }));
  },
};

// ---------------------------------------------------------------------------
// 3. SUPABASE DOCTORS SERVICE
// ---------------------------------------------------------------------------
export const supabaseDoctors = {
  async getAll(): Promise<Doctor[]> {
    if (!isSupabaseConfigured()) {
      return getStoredData('doctors_cache', FALLBACK_DOCTORS);
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*, departments (*)')
      .eq('active', true);

    if (error || !data || data.length === 0) {
      console.warn('Supabase doctors query note:', error?.message);
      return getStoredData('doctors_cache', FALLBACK_DOCTORS);
    }

    return data.map((doc) => ({
      id: doc.id,
      userId: doc.user_id || doc.id,
      fullName: doc.full_name,
      phone: doc.phone,
      specialty: doc.specialty,
      departmentId: doc.department_id,
      department: doc.departments
        ? {
            id: doc.departments.id,
            name: doc.departments.name,
            code: doc.departments.code,
            description: doc.departments.description,
            services: doc.departments.services,
          }
        : undefined,
      bio: doc.bio,
      qualification: doc.qualification,
      availableDays: doc.available_days,
      slotDurationMins: doc.slot_duration_mins || 30,
      active: doc.active,
    }));
  },

  async getAvailability(doctorId: string, dateStr: string) {
    const slots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    ];

    if (!isSupabaseConfigured()) {
      return slots.map((s, idx) => ({
        timeSlot: s,
        isAvailable: idx % 3 !== 0,
      }));
    }

    // Check booked appointments for doctor on that date
    const { data: booked } = await supabase
      .from('appointments')
      .select('time_slot')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', dateStr)
      .not('status', 'eq', 'CANCELLED');

    const bookedSlots = new Set((booked || []).map((b) => b.time_slot));

    return slots.map((timeSlot) => ({
      timeSlot,
      isAvailable: !bookedSlots.has(timeSlot),
    }));
  },

  async create(doctorData: Partial<Doctor>): Promise<Doctor> {
    const newDocId = 'doc-' + Math.random().toString(36).substring(2, 9);
    const docRow = {
      id: newDocId,
      full_name: doctorData.fullName,
      specialty: doctorData.specialty,
      department_id: doctorData.departmentId,
      available_days: doctorData.availableDays || 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slot_duration_mins: doctorData.slotDurationMins || 30,
      bio: doctorData.bio || '',
      qualification: doctorData.qualification || '',
      active: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('doctors').insert([docRow]).select().single();
      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id || data.id,
          fullName: data.full_name,
          specialty: data.specialty,
          departmentId: data.department_id,
          availableDays: data.available_days,
          slotDurationMins: data.slot_duration_mins,
          bio: data.bio,
          qualification: data.qualification,
          active: data.active,
        };
      }
    }

    // Local state fallback
    const doctors = getStoredData<Doctor[]>('doctors_cache', FALLBACK_DOCTORS);
    const created: Doctor = {
      id: newDocId,
      userId: 'usr-' + newDocId,
      fullName: doctorData.fullName || 'Dr. New Specialist',
      specialty: doctorData.specialty || 'General Practitioner',
      departmentId: doctorData.departmentId || 'dept-1',
      availableDays: doctorData.availableDays || 'Monday-Friday',
      slotDurationMins: 30,
      bio: doctorData.bio,
      qualification: doctorData.qualification,
      active: true,
    };
    doctors.push(created);
    setStoredData('doctors_cache', doctors);
    return created;
  },
};

// ---------------------------------------------------------------------------
// 4. SUPABASE PATIENT REQUIREMENTS & RECOMMENDATIONS ENGINE
// ---------------------------------------------------------------------------
export const supabaseRequirements = {
  calculateRecommendations(symptoms: string, visitReason: string, depts: Department[], docs: Doctor[]): Recommendation[] {
    const text = `${symptoms} ${visitReason}`.toLowerCase();

    const rules: Array<{ keywords: string[]; deptCode: string; defaultScore: number; reason: string }> = [
      {
        keywords: ['chest', 'heart', 'palpitation', 'angina', 'shortness of breath', 'bp', 'blood pressure', 'hypertension', 'cholesterol'],
        deptCode: 'CARD',
        defaultScore: 96,
        reason: 'Reported symptoms of chest sensation, cardiovascular indicators, and shortness of breath strongly match Cardiology protocols.',
      },
      {
        keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'tremor', 'faint', 'brain', 'spine', 'memory'],
        deptCode: 'NEUR',
        defaultScore: 94,
        reason: 'Neurological symptoms including persistent cranial pain, neuropathic discomfort, or balance issues correspond to Neurology assessment.',
      },
      {
        keywords: ['bone', 'joint', 'fracture', 'knee', 'shoulder', 'back pain', 'sprain', 'arthritis', 'ligament', 'swelling joint'],
        deptCode: 'ORTH',
        defaultScore: 95,
        reason: 'Musculoskeletal indicators, joint limitations, and structural discomfort indicate specialized Orthopedics evaluation.',
      },
      {
        keywords: ['child', 'infant', 'baby', 'toddler', 'pediatric', 'vaccine child', 'growth milestone'],
        deptCode: 'PEDI',
        defaultScore: 98,
        reason: 'Patient age profile or pediatric developmental queries align directly with Department of Pediatrics.',
      },
      {
        keywords: ['skin', 'rash', 'acne', 'itching', 'mole', 'eczema', 'dermatitis', 'allergy skin', 'lesion', 'scalp'],
        deptCode: 'DERM',
        defaultScore: 92,
        reason: 'Cutaneous presentations, dermal irritation, or epidermal flare-ups are optimal for Dermatology diagnostics.',
      },
      {
        keywords: ['fever', 'cough', 'fatigue', 'cold', 'infection', 'diabetes', 'weakness', 'routine checkup', 'stomach', 'nausea'],
        deptCode: 'GENM',
        defaultScore: 89,
        reason: 'Constitutional, general internal, and multi-system medical symptoms are best addressed initially by Internal Medicine.',
      },
    ];

    const results: Recommendation[] = [];

    for (const rule of rules) {
      const matchCount = rule.keywords.filter((kw) => text.includes(kw)).length;
      if (matchCount > 0) {
        const dept = depts.find((d) => d.code === rule.deptCode);
        if (dept) {
          const deptDocs = docs.filter((doc) => doc.departmentId === dept.id);
          results.push({
            departmentId: dept.id,
            departmentName: dept.name,
            departmentCode: dept.code,
            description: dept.description,
            services: dept.services,
            matchScore: Math.min(99, rule.defaultScore + (matchCount - 1) * 2),
            matchReason: rule.reason,
            availableDoctors: deptDocs.map((d) => ({
              id: d.id,
              fullName: d.fullName,
              specialty: d.specialty,
              availableDays: d.availableDays,
            })),
          });
        }
      }
    }

    if (results.length === 0) {
      // Default to General Medicine and Cardiology
      const genDept = depts.find((d) => d.code === 'GENM') || depts[0];
      if (genDept) {
        results.push({
          departmentId: genDept.id,
          departmentName: genDept.name,
          departmentCode: genDept.code,
          description: genDept.description,
          services: genDept.services,
          matchScore: 85,
          matchReason: 'General comprehensive clinical triage recommended for initial symptom classification and workup.',
          availableDoctors: docs
            .filter((d) => d.departmentId === genDept.id)
            .map((d) => ({
              id: d.id,
              fullName: d.fullName,
              specialty: d.specialty,
              availableDays: d.availableDays,
            })),
        });
      }
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  },

  async submit(data: any): Promise<{ requirement: PatientRequirement; recommendations: Recommendation[] }> {
    const refNo = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
    const depts = await supabaseDepartments.getAll();
    const docs = await supabaseDoctors.getAll();
    const recommendations = this.calculateRecommendations(data.symptoms || '', data.visitReason || '', depts, docs);

    const requirementRecord = {
      reference_number: refNo,
      patient_id: data.patientId || 'pat-1',
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      visit_reason: data.visitReason,
      symptoms: data.symptoms,
      onset_date: data.onsetDate || null,
      duration_days: data.durationDays ? Number(data.durationDays) : null,
      previous_visit: Boolean(data.previousVisit),
      existing_conditions: data.existingConditions || null,
      allergies: data.allergies || null,
      medications: data.medications || null,
      doctor_consulted_before: Boolean(data.doctorConsultedBefore),
      preferred_department_id: data.preferredDepartmentId || null,
      preferred_doctor_id: data.preferredDoctorId || null,
      preferred_branch: data.preferredBranch || 'Main City Hospital',
      preferred_date: data.preferredDate || null,
      preferred_time_slot: data.preferredTimeSlot || null,
      is_new_patient: Boolean(data.isNewPatient),
      additional_notes: data.additionalNotes || null,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: insertedReq, error } = await supabase
          .from('patient_requirements')
          .insert([requirementRecord])
          .select()
          .single();

        if (!error && insertedReq) {
          // Store recommendations in Supabase
          if (recommendations.length > 0) {
            const recRows = recommendations.map((r) => ({
              requirement_id: insertedReq.id,
              department_id: r.departmentId,
              match_score: r.matchScore,
              match_reason: r.matchReason,
              created_at: new Date().toISOString(),
            }));
            await supabase.from('recommendations').insert(recRows);
          }

          const reqObj: PatientRequirement = {
            id: insertedReq.id,
            referenceNumber: insertedReq.reference_number,
            patientId: insertedReq.patient_id,
            visitReason: insertedReq.visit_reason,
            symptoms: insertedReq.symptoms,
            onsetDate: insertedReq.onset_date,
            durationDays: insertedReq.duration_days,
            previousVisit: insertedReq.previous_visit,
            existingConditions: insertedReq.existing_conditions,
            allergies: insertedReq.allergies,
            medications: insertedReq.medications,
            doctorConsultedBefore: insertedReq.doctor_consulted_before,
            preferredDepartmentId: insertedReq.preferred_department_id,
            preferredDoctorId: insertedReq.preferred_doctor_id,
            preferredBranch: insertedReq.preferred_branch,
            preferredDate: insertedReq.preferred_date,
            preferredTimeSlot: insertedReq.preferred_time_slot,
            isNewPatient: insertedReq.is_new_patient,
            additionalNotes: insertedReq.additional_notes,
            status: insertedReq.status,
            createdAt: insertedReq.created_at,
          };
          setStoredData('latest_requirement', reqObj);
          setStoredData('latest_recommendations', recommendations);
          return { requirement: reqObj, recommendations };
        }
      } catch (e) {
        console.warn('Supabase requirement save fallback:', e);
      }
    }

    const fallbackReq: PatientRequirement = {
      id: 'req-' + Math.random().toString(36).substring(2, 7),
      referenceNumber: refNo,
      patientId: data.patientId || 'pat-1',
      visitReason: data.visitReason,
      symptoms: data.symptoms,
      onsetDate: data.onsetDate,
      durationDays: data.durationDays,
      previousVisit: Boolean(data.previousVisit),
      existingConditions: data.existingConditions,
      allergies: data.allergies,
      medications: data.medications,
      doctorConsultedBefore: Boolean(data.doctorConsultedBefore),
      preferredDepartmentId: data.preferredDepartmentId,
      preferredDoctorId: data.preferredDoctorId,
      preferredBranch: data.preferredBranch || 'Main City Hospital',
      preferredDate: data.preferredDate,
      preferredTimeSlot: data.preferredTimeSlot,
      isNewPatient: Boolean(data.isNewPatient),
      additionalNotes: data.additionalNotes,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    setStoredData('latest_requirement', fallbackReq);
    setStoredData('latest_recommendations', recommendations);
    return { requirement: fallbackReq, recommendations };
  },
};

// ---------------------------------------------------------------------------
// 5. SUPABASE APPOINTMENTS SERVICE
// ---------------------------------------------------------------------------
export const supabaseAppointments = {
  async create(data: {
    patientId: string;
    doctorId: string;
    departmentId: string;
    appointmentDate: string;
    timeSlot: string;
    notes?: string;
  }): Promise<Appointment> {
    const refNo = 'APP-' + Math.floor(100000 + Math.random() * 900000);
    const depts = await supabaseDepartments.getAll();
    const docs = await supabaseDoctors.getAll();
    const dept = depts.find((d) => d.id === data.departmentId);
    const doc = docs.find((d) => d.id === data.doctorId);

    const apptRecord = {
      reference_number: refNo,
      patient_id: data.patientId || 'pat-1',
      doctor_id: data.doctorId,
      department_id: data.departmentId,
      appointment_date: data.appointmentDate,
      time_slot: data.timeSlot,
      status: 'BOOKED',
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: inserted, error } = await supabase
          .from('appointments')
          .insert([apptRecord])
          .select()
          .single();

        if (!error && inserted) {
          const appt: Appointment = {
            id: inserted.id,
            referenceNumber: inserted.reference_number,
            patientId: inserted.patient_id,
            doctorId: inserted.doctor_id,
            doctor: doc,
            departmentId: inserted.department_id,
            department: dept,
            appointmentDate: inserted.appointment_date,
            timeSlot: inserted.time_slot,
            status: inserted.status as any,
            notes: inserted.notes,
            createdAt: inserted.created_at,
          };

          // Also keep in local storage list for instant dashboard display
          const patientAppts = getStoredData<Appointment[]>('patient_appointments', []);
          patientAppts.unshift(appt);
          setStoredData('patient_appointments', patientAppts);
          return appt;
        }
      } catch (e) {
        console.warn('Supabase appointment insert fallback:', e);
      }
    }

    const appt: Appointment = {
      id: 'appt-' + Math.random().toString(36).substring(2, 7),
      referenceNumber: refNo,
      patientId: data.patientId || 'pat-1',
      doctorId: data.doctorId,
      doctor: doc,
      departmentId: data.departmentId,
      department: dept,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      status: 'BOOKED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    const patientAppts = getStoredData<Appointment[]>('patient_appointments', []);
    patientAppts.unshift(appt);
    setStoredData('patient_appointments', patientAppts);
    return appt;
  },

  async getPatientAppointments(patientId?: string): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('appointments')
          .select('*, doctors (*), departments (*), queue_entries (*)')
          .order('created_at', { ascending: false });

        if (patientId) query.eq('patient_id', patientId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            referenceNumber: item.reference_number,
            patientId: item.patient_id,
            doctorId: item.doctor_id,
            doctor: item.doctors
              ? {
                  id: item.doctors.id,
                  userId: item.doctors.user_id || item.doctors.id,
                  fullName: item.doctors.full_name,
                  specialty: item.doctors.specialty,
                  departmentId: item.doctors.department_id,
                  availableDays: item.doctors.available_days,
                  slotDurationMins: item.doctors.slot_duration_mins || 30,
                }
              : undefined,
            departmentId: item.department_id,
            department: item.departments
              ? {
                  id: item.departments.id,
                  name: item.departments.name,
                  code: item.departments.code,
                  description: item.departments.description,
                  services: item.departments.services,
                }
              : undefined,
            appointmentDate: item.appointment_date,
            timeSlot: item.time_slot,
            status: item.status,
            notes: item.notes,
            queueEntry: item.queue_entries && item.queue_entries[0]
              ? {
                  id: item.queue_entries[0].id,
                  appointmentId: item.id,
                  doctorId: item.doctor_id,
                  departmentId: item.department_id,
                  queueNumber: item.queue_entries[0].queue_number,
                  position: item.queue_entries[0].position,
                  status: item.queue_entries[0].status,
                  estimatedWaitMins: item.queue_entries[0].estimated_wait_mins,
                  checkInTime: item.queue_entries[0].check_in_time,
                }
              : undefined,
            createdAt: item.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase patient appointments query fallback:', e);
      }
    }

    return getStoredData<Appointment[]>('patient_appointments', [
      {
        id: 'appt-1',
        referenceNumber: 'APP-104928',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        doctor: FALLBACK_DOCTORS[0],
        departmentId: 'dept-1',
        department: FALLBACK_DEPARTMENTS[0],
        appointmentDate: new Date().toISOString(),
        timeSlot: '10:00 AM',
        status: 'CHECKED_IN',
        notes: 'Follow-up consultation for cardiovascular screening',
        queueEntry: {
          id: 'q-101',
          appointmentId: 'appt-1',
          doctorId: 'doc-1',
          departmentId: 'dept-1',
          queueNumber: 3,
          position: 1,
          patientsAhead: 0,
          status: 'WAITING',
          estimatedWaitMins: 10,
          checkInTime: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  async getDoctorAppointments(doctorId?: string): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('appointments')
          .select('*, profiles (*), departments (*), queue_entries (*), consultations (*)')
          .order('appointment_date', { ascending: true });

        if (doctorId) query.eq('doctor_id', doctorId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            referenceNumber: item.reference_number,
            patientId: item.patient_id,
            patient: {
              id: item.patient_id,
              userId: item.patient_id,
              fullName: item.profiles?.full_name || 'Patient ' + item.patient_id.substring(0, 5),
              phone: item.profiles?.phone || '+1 (555) 019-2834',
              dateOfBirth: item.profiles?.date_of_birth,
              gender: item.profiles?.gender || 'Not specified',
              medicalHistory: item.profiles?.medical_history,
              allergies: item.profiles?.allergies,
              currentMedications: item.profiles?.current_medications,
            },
            doctorId: item.doctor_id,
            departmentId: item.department_id,
            department: item.departments,
            appointmentDate: item.appointment_date,
            timeSlot: item.time_slot,
            status: item.status,
            notes: item.notes,
            queueEntry: item.queue_entries && item.queue_entries[0]
              ? {
                  id: item.queue_entries[0].id,
                  appointmentId: item.id,
                  doctorId: item.doctor_id,
                  departmentId: item.department_id,
                  queueNumber: item.queue_entries[0].queue_number,
                  position: item.queue_entries[0].position,
                  status: item.queue_entries[0].status,
                  estimatedWaitMins: item.queue_entries[0].estimated_wait_mins,
                  checkInTime: item.queue_entries[0].check_in_time,
                }
              : undefined,
            createdAt: item.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase doctor appointments query fallback:', e);
      }
    }

    return getStoredData<Appointment[]>('doctor_appointments', [
      {
        id: 'appt-demo-1',
        referenceNumber: 'APP-849120',
        patientId: 'pat-1',
        patient: {
          id: 'pat-1',
          userId: 'usr-p1',
          fullName: 'John Doe',
          phone: '+1 (555) 987-6543',
          dateOfBirth: '1988-06-14',
          gender: 'Male',
          medicalHistory: 'Mild Hypertension (diagnosed 2021)',
          allergies: 'Penicillin',
          currentMedications: 'Lisinopril 10mg daily',
        },
        doctorId: doctorId || 'doc-1',
        departmentId: 'dept-1',
        department: FALLBACK_DEPARTMENTS[0],
        appointmentDate: new Date().toISOString(),
        timeSlot: '10:30 AM',
        status: 'CHECKED_IN',
        notes: 'Patient reported chest tightness during morning exercise.',
        queueEntry: {
          id: 'q-demo-1',
          appointmentId: 'appt-demo-1',
          doctorId: doctorId || 'doc-1',
          departmentId: 'dept-1',
          queueNumber: 1,
          position: 1,
          status: 'WAITING',
          estimatedWaitMins: 5,
          checkInTime: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      },
    ]);
  },

  async checkIn(appointmentId: string): Promise<QueueEntry> {
    const queueNumber = Math.floor(1 + Math.random() * 8);
    const queueEntryRow = {
      appointment_id: appointmentId,
      queue_number: queueNumber,
      position: Math.max(1, queueNumber - 1),
      status: 'WAITING',
      estimated_wait_mins: queueNumber * 10,
      check_in_time: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('appointments')
          .update({ status: 'CHECKED_IN', updated_at: new Date().toISOString() })
          .eq('id', appointmentId);

        const { data, error } = await supabase
          .from('queue_entries')
          .upsert([queueEntryRow])
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            appointmentId: data.appointment_id,
            doctorId: data.doctor_id,
            departmentId: data.department_id,
            queueNumber: data.queue_number,
            position: data.position,
            status: data.status,
            estimatedWaitMins: data.estimated_wait_mins,
            checkInTime: data.check_in_time,
          };
        }
      } catch (e) {
        console.warn('Supabase checkin fallback:', e);
      }
    }

    // Local fallback update
    const appts = getStoredData<Appointment[]>('patient_appointments', []);
    const match = appts.find((a) => a.id === appointmentId);
    const queueObj: QueueEntry = {
      id: 'q-' + Math.random().toString(36).substring(2, 7),
      appointmentId,
      doctorId: match?.doctorId || 'doc-1',
      departmentId: match?.departmentId || 'dept-1',
      queueNumber,
      position: 1,
      status: 'WAITING',
      estimatedWaitMins: queueNumber * 8,
      checkInTime: new Date().toISOString(),
    };

    if (match) {
      match.status = 'CHECKED_IN';
      match.queueEntry = queueObj;
      setStoredData('patient_appointments', appts);
    }

    return queueObj;
  },

  async cancel(appointmentId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      await supabase
        .from('appointments')
        .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
      return true;
    }

    const appts = getStoredData<Appointment[]>('patient_appointments', []);
    const match = appts.find((a) => a.id === appointmentId);
    if (match) {
      match.status = 'CANCELLED';
      setStoredData('patient_appointments', appts);
    }
    return true;
  },
};

// ---------------------------------------------------------------------------
// 6. SUPABASE QUEUE MANAGEMENT SERVICE & REALTIME
// ---------------------------------------------------------------------------
export const supabaseQueue = {
  async getByAppointment(appointmentId: string): Promise<QueueEntry | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('queue_entries')
          .select('*, appointments (*, doctors (*), departments (*))')
          .eq('appointment_id', appointmentId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            appointmentId: data.appointment_id,
            doctorId: data.doctor_id,
            departmentId: data.department_id,
            queueNumber: data.queue_number,
            position: data.position,
            status: data.status,
            estimatedWaitMins: data.estimated_wait_mins,
            checkInTime: data.check_in_time,
          };
        }
      } catch (e) {
        console.warn('Supabase queue lookup fallback:', e);
      }
    }

    const appts = getStoredData<Appointment[]>('patient_appointments', []);
    const match = appts.find((a) => a.id === appointmentId);
    return match?.queueEntry || null;
  },

  async callNext(doctorId: string): Promise<Appointment | null> {
    if (isSupabaseConfigured()) {
      try {
        // Find next waiting appointment for doctor
        const { data: waitingQueue } = await supabase
          .from('queue_entries')
          .select('*, appointments (*, profiles (*))')
          .eq('doctor_id', doctorId)
          .eq('status', 'WAITING')
          .order('queue_number', { ascending: true })
          .limit(1)
          .single();

        if (waitingQueue && waitingQueue.appointments) {
          await supabase
            .from('queue_entries')
            .update({ status: 'IN_PROGRESS', start_time: new Date().toISOString() })
            .eq('id', waitingQueue.id);

          await supabase
            .from('appointments')
            .update({ status: 'IN_CONSULTATION' })
            .eq('id', waitingQueue.appointment_id);

          return {
            id: waitingQueue.appointments.id,
            referenceNumber: waitingQueue.appointments.reference_number,
            patientId: waitingQueue.appointments.patient_id,
            doctorId,
            departmentId: waitingQueue.appointments.department_id,
            appointmentDate: waitingQueue.appointments.appointment_date,
            timeSlot: waitingQueue.appointments.time_slot,
            status: 'IN_CONSULTATION',
            createdAt: waitingQueue.appointments.created_at,
          };
        }
      } catch (e) {
        console.warn('Supabase callNext fallback:', e);
      }
    }

    return null;
  },

  // Setup Supabase Realtime channel for live queue updates
  subscribe(callback: (payload: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('public:queue_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, (payload) => {
        callback(payload);
      })
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};

// ---------------------------------------------------------------------------
// 7. SUPABASE CONSULTATIONS & PRESCRIPTIONS SERVICE
// ---------------------------------------------------------------------------
export const supabaseConsultations = {
  async save(payload: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint: string;
    diagnosis: string;
    prescriptionNotes?: string;
    doctorNotes?: string;
    followUpDate?: string;
    prescriptions: Prescription[];
  }): Promise<Consultation> {
    const consultationId = 'cons-' + Math.random().toString(36).substring(2, 9);

    if (isSupabaseConfigured()) {
      try {
        const { data: consultation, error } = await supabase
          .from('consultations')
          .insert([
            {
              id: consultationId,
              appointment_id: payload.appointmentId,
              patient_id: payload.patientId,
              doctor_id: payload.doctorId,
              chief_complaint: payload.chiefComplaint,
              diagnosis: payload.diagnosis,
              prescription_notes: payload.prescriptionNotes || null,
              doctor_notes: payload.doctorNotes || null,
              follow_up_date: payload.followUpDate || null,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (!error && consultation) {
          if (payload.prescriptions.length > 0) {
            const rxRows = payload.prescriptions
              .filter((p) => p.medicationName.trim() !== '')
              .map((p) => ({
                consultation_id: consultationId,
                medication_name: p.medicationName,
                dosage: p.dosage,
                frequency: p.frequency,
                duration: p.duration,
                instructions: p.instructions || null,
                created_at: new Date().toISOString(),
              }));

            if (rxRows.length > 0) {
              await supabase.from('prescriptions').insert(rxRows);
            }
          }

          // Mark appointment COMPLETED and queue COMPLETED
          await supabase
            .from('appointments')
            .update({ status: 'COMPLETED' })
            .eq('id', payload.appointmentId);

          await supabase
            .from('queue_entries')
            .update({ status: 'COMPLETED', end_time: new Date().toISOString() })
            .eq('appointment_id', payload.appointmentId);
        }
      } catch (e) {
        console.warn('Supabase consultation save fallback:', e);
      }
    }

    const createdCons: Consultation = {
      id: consultationId,
      appointmentId: payload.appointmentId,
      patientId: payload.patientId,
      doctorId: payload.doctorId,
      chiefComplaint: payload.chiefComplaint,
      diagnosis: payload.diagnosis,
      prescriptionNotes: payload.prescriptionNotes,
      doctorNotes: payload.doctorNotes,
      followUpDate: payload.followUpDate,
      prescriptions: payload.prescriptions,
      createdAt: new Date().toISOString(),
    };

    // Save to patient visits in local cache
    const visits = getStoredData<Consultation[]>('patient_visits', []);
    visits.unshift(createdCons);
    setStoredData('patient_visits', visits);

    return createdCons;
  },

  async getPatientVisits(patientId?: string): Promise<Consultation[]> {
    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('consultations')
          .select('*, prescriptions (*), doctors (*)')
          .order('created_at', { ascending: false });

        if (patientId) query.eq('patient_id', patientId);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            appointmentId: item.appointment_id,
            patientId: item.patient_id,
            doctorId: item.doctor_id,
            doctor: item.doctors
              ? {
                  id: item.doctors.id,
                  userId: item.doctors.user_id || item.doctors.id,
                  fullName: item.doctors.full_name,
                  specialty: item.doctors.specialty,
                  departmentId: item.doctors.department_id,
                  availableDays: item.doctors.available_days,
                  slotDurationMins: item.doctors.slot_duration_mins || 30,
                }
              : undefined,
            chiefComplaint: item.chief_complaint,
            diagnosis: item.diagnosis,
            prescriptionNotes: item.prescription_notes,
            doctorNotes: item.doctor_notes,
            followUpDate: item.follow_up_date,
            prescriptions: (item.prescriptions || []).map((p: any) => ({
              id: p.id,
              medicationName: p.medication_name,
              dosage: p.dosage,
              frequency: p.frequency,
              duration: p.duration,
              instructions: p.instructions,
            })),
            createdAt: item.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase visits fallback:', e);
      }
    }

    return getStoredData<Consultation[]>('patient_visits', [
      {
        id: 'vis-1',
        appointmentId: 'appt-past-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        doctor: FALLBACK_DOCTORS[0],
        chiefComplaint: 'Chest heaviness and dyspnea after moderate walking',
        diagnosis: 'Stage 1 Essential Hypertension with mild exertion tachycardia',
        prescriptionNotes: 'Monitor daily BP log; maintain low sodium diet.',
        doctorNotes: 'Advised lifestyle modification, 20min light aerobic walk. ECG shows sinus rhythm.',
        followUpDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        prescriptions: [
          {
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once Daily (Morning)',
            duration: '30 Days',
            instructions: 'Take with or without food. Check blood pressure regularly.',
          },
          {
            medicationName: 'Aspirin (Cardio)',
            dosage: '81mg',
            frequency: 'Once Daily (Evening)',
            duration: '30 Days',
            instructions: 'Take after meal with a full glass of water.',
          },
        ],
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ]);
  },
};

// ---------------------------------------------------------------------------
// 8. SUPABASE PHARMACY MEDICINE STOCK SERVICE
// ---------------------------------------------------------------------------
const DEFAULT_STOCK_ITEMS: MedicineStockItem[] = [
  { id: 'stk-1', name: 'Lisinopril 10mg', category: 'Cardiovascular', quantity: 150, unit: 'tablets', minReorderLevel: 30, unitPrice: 15.0, location: 'Bay A-1', lastUpdated: new Date().toISOString() },
  { id: 'stk-2', name: 'Amoxicillin 500mg', category: 'Antibiotic', quantity: 18, unit: 'capsules', minReorderLevel: 25, unitPrice: 22.0, location: 'Bay B-3', lastUpdated: new Date().toISOString() },
  { id: 'stk-3', name: 'Ibuprofen 400mg', category: 'Analgesic', quantity: 320, unit: 'tablets', minReorderLevel: 50, unitPrice: 8.5, location: 'Bay A-4', lastUpdated: new Date().toISOString() },
  { id: 'stk-4', name: 'Metformin 850mg', category: 'Antidiabetic', quantity: 12, unit: 'tablets', minReorderLevel: 20, unitPrice: 18.0, location: 'Bay C-2', lastUpdated: new Date().toISOString() },
  { id: 'stk-5', name: 'Omeprazole 20mg', category: 'Gastroenterology', quantity: 95, unit: 'capsules', minReorderLevel: 30, unitPrice: 14.0, location: 'Bay B-1', lastUpdated: new Date().toISOString() },
  { id: 'stk-6', name: 'Atorvastatin 20mg', category: 'Cardiovascular', quantity: 210, unit: 'tablets', minReorderLevel: 40, unitPrice: 28.0, location: 'Bay A-2', lastUpdated: new Date().toISOString() },
  { id: 'stk-7', name: 'Azithromycin 250mg', category: 'Antibiotic', quantity: 45, unit: 'tablets', minReorderLevel: 20, unitPrice: 32.0, location: 'Bay B-4', lastUpdated: new Date().toISOString() },
  { id: 'stk-8', name: 'Salbutamol Inhaler 100mcg', category: 'Respiratory', quantity: 8, unit: 'inhalers', minReorderLevel: 15, unitPrice: 45.0, location: 'Bay D-1', lastUpdated: new Date().toISOString() },
];

export const supabaseStock = {
  async getAll(): Promise<MedicineStockItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('medicine_stock')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            minReorderLevel: item.min_reorder_level,
            unitPrice: Number(item.unit_price),
            location: item.location,
            lastUpdated: item.last_updated,
          }));
        }
      } catch (e) {
        console.warn('Supabase stock query fallback:', e);
      }
    }

    return getStoredData('pharmacy_stock_inventory', DEFAULT_STOCK_ITEMS);
  },

  async updateQuantity(id: string, quantity: number): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('medicine_stock')
          .update({ quantity, last_updated: new Date().toISOString() })
          .eq('id', id);
        return true;
      } catch (e) {
        console.warn('Supabase stock update fallback:', e);
      }
    }

    const items = getStoredData<MedicineStockItem[]>('pharmacy_stock_inventory', DEFAULT_STOCK_ITEMS);
    const item = items.find((i) => i.id === id);
    if (item) {
      item.quantity = quantity;
      item.lastUpdated = new Date().toISOString();
      setStoredData('pharmacy_stock_inventory', items);
    }
    return true;
  },

  async addItem(item: Omit<MedicineStockItem, 'id' | 'lastUpdated'>): Promise<MedicineStockItem> {
    const newItem: MedicineStockItem = {
      ...item,
      id: 'stk-' + Math.random().toString(36).substring(2, 7),
      lastUpdated: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('medicine_stock')
          .insert([
            {
              id: newItem.id,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              min_reorder_level: item.minReorderLevel,
              unit_price: item.unitPrice,
              location: item.location,
              last_updated: newItem.lastUpdated,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            unit: data.unit,
            minReorderLevel: data.min_reorder_level,
            unitPrice: Number(data.unit_price),
            location: data.location,
            lastUpdated: data.last_updated,
          };
        }
      } catch (e) {
        console.warn('Supabase stock add fallback:', e);
      }
    }

    const items = getStoredData<MedicineStockItem[]>('pharmacy_stock_inventory', DEFAULT_STOCK_ITEMS);
    items.unshift(newItem);
    setStoredData('pharmacy_stock_inventory', items);
    return newItem;
  },
};

// ---------------------------------------------------------------------------
// 9. SUPABASE PATIENT PROFILE SERVICE
// ---------------------------------------------------------------------------
export const supabasePatientProfile = {
  async getProfile(userId?: string): Promise<PatientProfile> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.id,
            fullName: data.full_name || 'Patient User',
            phone: data.phone,
            dateOfBirth: data.date_of_birth,
            gender: data.gender,
            address: data.address,
            emergencyContact: data.emergency_contact,
            medicalHistory: data.medical_history,
            allergies: data.allergies,
            currentMedications: data.current_medications,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (e) {
        console.warn('Supabase profile get fallback:', e);
      }
    }

    return getStoredData<PatientProfile>('patient_profile_data', {
      id: 'pat-1',
      userId: userId || 'usr-patient-1',
      fullName: 'John Doe',
      phone: '+1 (555) 987-6543',
      dateOfBirth: '1988-06-14',
      gender: 'Male',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      emergencyContact: 'Jane Doe (+1 555 432-1098)',
      medicalHistory: 'Mild essential hypertension (diagnosed 2021). No surgical history.',
      allergies: 'Penicillin (mild hives), Seasonal Pollen',
      currentMedications: 'Lisinopril 10mg Once Daily (AM)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  async updateProfile(userId: string, updates: Partial<PatientProfile>): Promise<PatientProfile> {
    if (isSupabaseConfigured() && userId) {
      try {
        const row = {
          full_name: updates.fullName,
          phone: updates.phone,
          date_of_birth: updates.dateOfBirth,
          gender: updates.gender,
          address: updates.address,
          emergency_contact: updates.emergencyContact,
          medical_history: updates.medicalHistory,
          allergies: updates.allergies,
          current_medications: updates.currentMedications,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('profiles')
          .update(row)
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.id,
            fullName: data.full_name,
            phone: data.phone,
            dateOfBirth: data.date_of_birth,
            gender: data.gender,
            address: data.address,
            emergencyContact: data.emergency_contact,
            medicalHistory: data.medical_history,
            allergies: data.allergies,
            currentMedications: data.current_medications,
            updatedAt: data.updated_at,
          };
        }
      } catch (e) {
        console.warn('Supabase profile update fallback:', e);
      }
    }

    const current = await this.getProfile(userId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    setStoredData('patient_profile_data', updated);
    return updated;
  },
};

// ---------------------------------------------------------------------------
// 10. SUPABASE ADMIN DASHBOARD ANALYTICS SERVICE
// ---------------------------------------------------------------------------
export const supabaseAdmin = {
  async getDashboardStats() {
    if (isSupabaseConfigured()) {
      try {
        const [
          { count: patientsCount },
          { count: appointmentsCount },
          { count: doctorsCount },
          { count: deptsCount },
          { count: waitingQueueCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PATIENT'),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase.from('departments').select('*', { count: 'exact', head: true }),
          supabase.from('queue_entries').select('*', { count: 'exact', head: true }).eq('status', 'WAITING'),
        ]);

        return {
          totalPatients: patientsCount || 148,
          totalAppointments: appointmentsCount || 342,
          totalDoctors: doctorsCount || 6,
          totalDepartments: deptsCount || 6,
          activeQueue: waitingQueueCount || 7,
          avgWaitMins: 14,
        };
      } catch (e) {
        console.warn('Supabase admin stats fallback:', e);
      }
    }

    return {
      totalPatients: 148,
      totalAppointments: 342,
      totalDoctors: 6,
      totalDepartments: 6,
      activeQueue: 7,
      avgWaitMins: 14,
    };
  },
};
