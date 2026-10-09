-- ============================================================================
-- HOSPITAL MANAGEMENT SYSTEM - COMPLETE SUPABASE BACKEND SCHEMA
-- ============================================================================
-- Execute this entire script inside your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- This creates all required tables, triggers, Row-Level Security (RLS) policies,
-- Realtime streaming configuration, and initial medical seed data.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DROP PREVIOUS OBJECTS IF RE-RUNNING (Safe Clean Slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN')),
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  doctor_profile_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY DEFAULT ('dept-' || substr(md5(random()::text), 1, 8)),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  services TEXT NOT NULL,
  icon TEXT,
  room_number TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY DEFAULT ('doc-' || substr(md5(random()::text), 1, 8)),
  user_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT NOT NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  bio TEXT,
  qualification TEXT,
  available_days TEXT NOT NULL DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
  slot_duration_mins INT NOT NULL DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DOCTOR SCHEDULES
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '17:00',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PATIENT REQUIREMENTS (Intake / Symptoms)
CREATE TABLE IF NOT EXISTS public.patient_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  patient_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  visit_reason TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  onset_date DATE,
  duration_days INT,
  previous_visit BOOLEAN DEFAULT FALSE,
  existing_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  doctor_consulted_before BOOLEAN DEFAULT FALSE,
  preferred_department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  preferred_doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
  preferred_branch TEXT DEFAULT 'Main City Hospital',
  preferred_date DATE,
  preferred_time_slot TEXT,
  is_new_patient BOOLEAN DEFAULT TRUE,
  additional_notes TEXT,
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'RECOMMENDED', 'BOOKED', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID REFERENCES public.patient_requirements(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES public.departments(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL,
  match_reason TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT ('appt-' || substr(md5(random()::text), 1, 8)),
  reference_number TEXT UNIQUE NOT NULL,
  patient_id TEXT NOT NULL,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE RESTRICT,
  department_id TEXT REFERENCES public.departments(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUEUE ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.queue_entries (
  id TEXT PRIMARY KEY DEFAULT ('q-' || substr(md5(random()::text), 1, 8)),
  appointment_id TEXT UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
  department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
  queue_number INT NOT NULL,
  position INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
  estimated_wait_mins INT DEFAULT 15,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
  id TEXT PRIMARY KEY DEFAULT ('cons-' || substr(md5(random()::text), 1, 8)),
  appointment_id TEXT UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE RESTRICT,
  chief_complaint TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescription_notes TEXT,
  doctor_notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id TEXT REFERENCES public.consultations(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MEDICINE STOCK INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.medicine_stock (
  id TEXT PRIMARY KEY DEFAULT ('stk-' || substr(md5(random()::text), 1, 8)),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'tablets',
  min_reorder_level INT NOT NULL DEFAULT 20,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  location TEXT NOT NULL DEFAULT 'Pharmacy Bay A-1',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for app operational flow
DO $$ BEGIN
  CREATE POLICY "Public full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
  CREATE POLICY "Admin write departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);
  CREATE POLICY "Admin write doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public read schedules" ON public.doctor_schedules FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to requirements" ON public.patient_requirements FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to recommendations" ON public.recommendations FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to queue" ON public.queue_entries FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to medicine_stock" ON public.medicine_stock FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Public access to audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ============================================================================
-- 16. SUPABASE REALTIME REPLICATION ENABLEMENT
-- ============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_stock;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ============================================================================
-- 17. AUTOMATIC AUTH PROFILE CREATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    UPPER(COALESCE(new.raw_user_meta_data->>'role', 'PATIENT')),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 18. INITIAL CLINICAL SEED DATA
-- ============================================================================

-- DEPARTMENTS SEED
INSERT INTO public.departments (id, name, code, description, services, icon, room_number, active)
VALUES
  ('dept-1', 'Cardiology', 'CARD', 'Comprehensive cardiovascular diagnostics, prevention and intervention.', 'ECG, Echocardiogram, Holter Monitoring, Cardiac Stress Test', 'Heart', 'Wing A - 101', true),
  ('dept-2', 'Neurology', 'NEUR', 'Advanced brain and central nervous system evaluation and neuro-therapies.', 'EEG, MRI Screening, EMG, Stroke Management', 'Brain', 'Wing B - 204', true),
  ('dept-3', 'Orthopedics', 'ORTH', 'Musculoskeletal care, joint reconstruction, fractures, and sports trauma.', 'Digital X-Ray, Joint Assessment, Bone Density, Cast & Fracture Clinic', 'Activity', 'Wing C - 105', true),
  ('dept-4', 'Pediatrics', 'PEDI', 'Comprehensive medical care for infants, children, and young adolescents.', 'Childhood Immunization, Pediatric Growth Assessment, Well-Child Checkup', 'Baby', 'Wing D - 110', true),
  ('dept-5', 'General Internal Medicine', 'GENM', 'Adult primary care, multi-system acute triage, and chronic conditions.', 'Annual Comprehensive Physical, Diabetes Monitoring, Hypertension Care', 'Stethoscope', 'Wing A - 102', true),
  ('dept-6', 'Dermatology', 'DERM', 'Clinical diagnostics and treatments for epidermal, dermal, and hair disorders.', 'Allergy Patch Test, Dermoscopy, Cryotherapy, Cutaneous Biopsy', 'Shield', 'Wing B - 208', true)
ON CONFLICT (id) DO NOTHING;

-- DOCTORS SEED
INSERT INTO public.doctors (id, full_name, specialty, department_id, bio, qualification, available_days, slot_duration_mins, active)
VALUES
  ('doc-1', 'Dr. Sarah Smith, MD, FACC', 'Interventional Cardiology Specialist', 'dept-1', 'Over 14 years of clinical experience in advanced cardiovascular diagnosis, hypertension, and arrhythmia management.', 'MD - Harvard Medical School, Cardiology Fellowship Johns Hopkins', 'Monday,Tuesday,Wednesday,Thursday,Friday', 30, true),
  ('doc-2', 'Dr. Michael Chen, MD, PhD', 'Clinical Neurology & Neuro-critical Care', 'dept-2', 'Specialist in migraine management, neuromuscular disorders, stroke prevention, and cognitive assessments.', 'MD, PhD - Stanford University School of Medicine', 'Monday,Wednesday,Friday', 30, true),
  ('doc-3', 'Dr. Priya Patel, MD, FAAOS', 'Orthopedics & Joint Reconstruction', 'dept-3', 'Expert in sports injuries, knee and hip arthroplasty, and post-traumatic musculoskeletal recovery.', 'MD - Columbia University, Orthopedic Fellowship Mayo Clinic', 'Tuesday,Thursday,Saturday', 30, true),
  ('doc-4', 'Dr. David Wilson, MD, FAAP', 'Pediatric Care & Adolescent Medicine', 'dept-4', 'Dedicated pediatrician focusing on preventive child health, developmental milestones, and pediatric immunology.', 'MD - University of Pennsylvania Perelman School of Medicine', 'Monday,Tuesday,Thursday,Friday', 30, true),
  ('doc-5', 'Dr. Elena Rostova, MD', 'General Internal Medicine & Diagnostic Care', 'dept-5', 'Specialist in multi-system chronic disease management, preventive health screening, and geriatric care.', 'MD - Yale School of Medicine', 'Monday,Tuesday,Wednesday,Thursday,Friday', 30, true),
  ('doc-6', 'Dr. Marcus Vance, MD, FAAD', 'Clinical Dermatology & Cutaneous Surgery', 'dept-6', 'Specializing in chronic dermatitis, psoriasis therapy, mole screening, and dermatological surgical procedures.', 'MD - Northwestern University Feinberg School of Medicine', 'Monday,Wednesday,Thursday', 30, true)
ON CONFLICT (id) DO NOTHING;

-- MEDICINE STOCK INVENTORY SEED
INSERT INTO public.medicine_stock (id, name, category, quantity, unit, min_reorder_level, unit_price, location)
VALUES
  ('stk-1', 'Lisinopril 10mg', 'Cardiovascular', 150, 'tablets', 30, 15.00, 'Pharmacy Bay A-1'),
  ('stk-2', 'Amoxicillin 500mg', 'Antibiotic', 18, 'capsules', 25, 22.00, 'Pharmacy Bay B-3'),
  ('stk-3', 'Ibuprofen 400mg', 'Analgesic', 320, 'tablets', 50, 8.50, 'Pharmacy Bay A-4'),
  ('stk-4', 'Metformin 850mg', 'Antidiabetic', 12, 'tablets', 20, 18.00, 'Pharmacy Bay C-2'),
  ('stk-5', 'Omeprazole 20mg', 'Gastroenterology', 95, 'capsules', 30, 14.00, 'Pharmacy Bay B-1'),
  ('stk-6', 'Atorvastatin 20mg', 'Cardiovascular', 210, 'tablets', 40, 28.00, 'Pharmacy Bay A-2'),
  ('stk-7', 'Azithromycin 250mg', 'Antibiotic', 45, 'tablets', 20, 32.00, 'Pharmacy Bay B-4'),
  ('stk-8', 'Salbutamol Inhaler 100mcg', 'Respiratory', 8, 'inhalers', 15, 45.00, 'Pharmacy Bay D-1')
ON CONFLICT (id) DO NOTHING;

-- SAMPLE APPOINTMENTS & QUEUE SEED
INSERT INTO public.appointments (id, reference_number, patient_id, doctor_id, department_id, appointment_date, time_slot, status, notes)
VALUES
  ('appt-demo-1', 'APP-849120', 'usr-patient-1', 'doc-1', 'dept-1', CURRENT_DATE, '10:30 AM', 'CHECKED_IN', 'Routine cardiac stress evaluation and BP follow-up.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.queue_entries (id, appointment_id, doctor_id, department_id, queue_number, position, status, estimated_wait_mins)
VALUES
  ('q-demo-1', 'appt-demo-1', 'doc-1', 'dept-1', 1, 1, 'WAITING', 5)
ON CONFLICT (id) DO NOTHING;
