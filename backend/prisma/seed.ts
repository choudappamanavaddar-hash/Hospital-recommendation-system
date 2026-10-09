import { PrismaClient, Role, AppointmentStatus, QueueStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // Password hash for all sample accounts: "Password123!"
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Departments
  console.log('--> Creating Departments...');
  const cardiology = await prisma.department.upsert({
    where: { code: 'CARD' },
    update: {},
    create: {
      name: 'Cardiology',
      code: 'CARD',
      description: 'Comprehensive cardiovascular care including heart disease diagnosis, hypertension, ECG, echocardiography, and preventative heart care.',
      services: 'ECG, Echocardiogram, Stress Test, Lipid Panel, Blood Pressure Monitoring, Angiography Consultation',
      icon: 'Heart',
      roomNumber: '101-A',
    },
  });

  const neurology = await prisma.department.upsert({
    where: { code: 'NEUR' },
    update: {},
    create: {
      name: 'Neurology',
      code: 'NEUR',
      description: 'Diagnosis and non-surgical treatment of disorders of the brain, spinal cord, nerves, and muscles.',
      services: 'EEG, Brain MRI Review, Migraine Therapy, Epilepsy Management, Neuropathy Evaluation, Stroke Follow-up',
      icon: 'Brain',
      roomNumber: '204-B',
    },
  });

  const orthopedics = await prisma.department.upsert({
    where: { code: 'ORTH' },
    update: {},
    create: {
      name: 'Orthopedics',
      code: 'ORTH',
      description: 'Expert care for bones, joints, ligaments, tendons, muscles, spinal issues, and sports injuries.',
      services: 'Joint Pain Assessment, Fracture Management, X-Ray Evaluation, Physical Therapy Planning, Spine Care',
      icon: 'Bone',
      roomNumber: '302-C',
    },
  });

  const pediatrics = await prisma.department.upsert({
    where: { code: 'PEDI' },
    update: {},
    create: {
      name: 'Pediatrics',
      code: 'PEDI',
      description: 'Specialized healthcare for infants, children, and adolescents up to 18 years of age.',
      services: 'Child Vaccinations, Routine Growth Checkups, Childhood Asthma Care, Pediatric Acute Infection Care',
      icon: 'Baby',
      roomNumber: '108-D',
    },
  });

  const generalMedicine = await prisma.department.upsert({
    where: { code: 'GENM' },
    update: {},
    create: {
      name: 'General Internal Medicine',
      code: 'GENM',
      description: 'Primary medical care for adult illnesses, chronic disease prevention, fever, fatigue, and general health evaluations.',
      services: 'Routine Physical Exam, Blood Work Interpretation, Acute Infection Care, Diabetes Management, Thyroid Check',
      icon: 'Stethoscope',
      roomNumber: '105-E',
    },
  });

  const dermatology = await prisma.department.upsert({
    where: { code: 'DERM' },
    update: {},
    create: {
      name: 'Dermatology',
      code: 'DERM',
      description: 'Advanced diagnosis and treatment of skin, hair, nail disorders, rashes, eczema, and allergies.',
      services: 'Skin Rash Assessment, Acne Therapy, Eczema Treatment, Mole Inspection, Allergy Testing',
      icon: 'Sparkles',
      roomNumber: '210-F',
    },
  });

  // 2. Create Admin Account
  console.log('--> Creating Admin Account...');
  await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // 3. Create Doctor Accounts & Profiles
  console.log('--> Creating Doctors...');
  const doc1User = await prisma.user.upsert({
    where: { email: 'dr.smith@hospital.com' },
    update: {},
    create: {
      email: 'dr.smith@hospital.com',
      passwordHash,
      role: Role.DOCTOR,
    },
  });
  const doc1 = await prisma.doctorProfile.upsert({
    where: { userId: doc1User.id },
    update: {},
    create: {
      userId: doc1User.id,
      fullName: 'Dr. Sarah Smith, MD',
      phone: '+1 (555) 234-5678',
      specialty: 'Cardiovascular Medicine',
      departmentId: cardiology.id,
      bio: 'Senior Cardiologist with over 14 years of clinical experience in interventional cardiology and preventative heart care.',
      qualification: 'MD - Harvard Medical School, Fellowship in Cardiology (Johns Hopkins)',
      availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMins: 30,
    },
  });

  const doc2User = await prisma.user.upsert({
    where: { email: 'dr.chen@hospital.com' },
    update: {},
    create: {
      email: 'dr.chen@hospital.com',
      passwordHash,
      role: Role.DOCTOR,
    },
  });
  const doc2 = await prisma.doctorProfile.upsert({
    where: { userId: doc2User.id },
    update: {},
    create: {
      userId: doc2User.id,
      fullName: 'Dr. Michael Chen, MD',
      phone: '+1 (555) 345-6789',
      specialty: 'Clinical Neurology & Epilepsy',
      departmentId: neurology.id,
      bio: 'Board-certified Neurologist focusing on headaches, neuropathies, memory disorders, and electroencephalography.',
      qualification: 'MD, PhD - Stanford University',
      availableDays: 'Monday,Wednesday,Friday',
      slotDurationMins: 30,
    },
  });

  const doc3User = await prisma.user.upsert({
    where: { email: 'dr.patel@hospital.com' },
    update: {},
    create: {
      email: 'dr.patel@hospital.com',
      passwordHash,
      role: Role.DOCTOR,
    },
  });
  const doc3 = await prisma.doctorProfile.upsert({
    where: { userId: doc3User.id },
    update: {},
    create: {
      userId: doc3User.id,
      fullName: 'Dr. Priya Patel, MD',
      phone: '+1 (555) 456-7890',
      specialty: 'Orthopedic Surgery & Sports Medicine',
      departmentId: orthopedics.id,
      bio: 'Specialist in joint reconstruction, knee & shoulder arthroscopy, spine health, and sports injury rehabilitative medicine.',
      qualification: 'MD - Mayo Clinic School of Medicine',
      availableDays: 'Tuesday,Thursday,Saturday',
      slotDurationMins: 30,
    },
  });

  const doc4User = await prisma.user.upsert({
    where: { email: 'dr.adams@hospital.com' },
    update: {},
    create: {
      email: 'dr.adams@hospital.com',
      passwordHash,
      role: Role.DOCTOR,
    },
  });
  const doc4 = await prisma.doctorProfile.upsert({
    where: { userId: doc4User.id },
    update: {},
    create: {
      userId: doc4User.id,
      fullName: 'Dr. Robert Adams, MD',
      phone: '+1 (555) 567-8901',
      specialty: 'Internal Medicine & Diagnostic Primary Care',
      departmentId: generalMedicine.id,
      bio: 'Primary care provider emphasizing preventative health screenings, multi-system symptom diagnosis, and chronic condition control.',
      qualification: 'MD - Columbia University',
      availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday',
      slotDurationMins: 20,
    },
  });

  // 4. Create Doctor Schedules
  console.log('--> Creating Doctor Schedules...');
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const doc of [doc1, doc2, doc3, doc4]) {
    for (const day of days) {
      await prisma.doctorSchedule.upsert({
        where: { doctorId_dayOfWeek: { doctorId: doc.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      });
    }
  }

  // 5. Create Sample Patient User & Profile
  console.log('--> Creating Sample Patient...');
  const patientUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      passwordHash,
      role: Role.PATIENT,
    },
  });

  const patient = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      fullName: 'John Doe',
      phone: '+1 (555) 987-6543',
      dateOfBirth: new Date('1988-06-14'),
      gender: 'Male',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: 'Jane Doe (Wife) - +1 (555) 987-6544',
      medicalHistory: 'Mild Hypertension (diagnosed 2021)',
      allergies: 'Penicillin',
      currentMedications: 'Lisinopril 10mg daily',
    },
  });

  // 6. Create Sample Appointment & Queue Entry
  console.log('--> Creating Sample Appointment & Queue Entry...');
  const today = new Date();
  const appointmentRef = 'APP-' + Math.floor(100000 + Math.random() * 900000);

  const sampleAppt = await prisma.appointment.upsert({
    where: { referenceNumber: appointmentRef },
    update: {},
    create: {
      referenceNumber: appointmentRef,
      patientId: patient.id,
      doctorId: doc1.id,
      departmentId: cardiology.id,
      appointmentDate: today,
      timeSlot: '10:30 AM',
      status: AppointmentStatus.CHECKED_IN,
      notes: 'Patient reported mild chest tightness during morning exercise.',
    },
  });

  await prisma.queueEntry.upsert({
    where: { appointmentId: sampleAppt.id },
    update: {},
    create: {
      appointmentId: sampleAppt.id,
      doctorId: doc1.id,
      departmentId: cardiology.id,
      queueNumber: 102,
      position: 2,
      status: QueueStatus.WAITING,
      estimatedWaitMins: 15,
      checkInTime: new Date(),
    },
  });

  console.log('✅ Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
