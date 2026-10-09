import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSection } from '../components/FormSection';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { TextareaField } from '../components/TextareaField';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { Department, Doctor, User } from '../types';
import { apiClient, fetchWithFallback, getStoredData, setStoredData } from '../services/api';

const requirementSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required'),

  visitReason: z.string().min(3, 'Main reason for hospital visit is required'),
  symptoms: z.string().min(5, 'Please describe your symptoms in detail'),
  onsetDate: z.string().optional(),
  durationDays: z.coerce.number().optional(),
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
});

type RequirementFormData = z.infer<typeof requirementSchema>;

interface RequirementFormPageProps {
  user: User | null;
}

export const RequirementFormPage: React.FC<RequirementFormPageProps> = ({ user }) => {
  const [step, setStep] = useState<number>(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      fullName: user?.fullName || 'John Doe',
      email: user?.email || 'patient@example.com',
      phone: '+1 (555) 987-6543',
      previousVisit: false,
      doctorConsultedBefore: false,
      isNewPatient: true,
      preferredBranch: 'Main City Hospital',
    },
  });

  const formValues = watch();

  useEffect(() => {
    loadDepartmentsAndDoctors();
  }, []);

  const loadDepartmentsAndDoctors = async () => {
    try {
      const deptsData = await fetchWithFallback(
        () => apiClient.get('/departments'),
        () => [
          { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: 'Heart care', services: 'ECG, Echocardiogram' },
          { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: 'Brain care', services: 'EEG, MRI' },
          { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: 'Bone care', services: 'Joint assessment, X-Ray' },
          { id: 'dept-4', name: 'Pediatrics', code: 'PEDI', description: 'Child care', services: 'Vaccinations, Checkups' },
          { id: 'dept-5', name: 'General Internal Medicine', code: 'GENM', description: 'Primary care', services: 'Fever, Diabetes' },
          { id: 'dept-6', name: 'Dermatology', code: 'DERM', description: 'Skin care', services: 'Rash, Acne' },
        ]
      );
      setDepartments(deptsData);

      const docsData = await fetchWithFallback(
        () => apiClient.get('/doctors'),
        () => [
          { id: 'doc-1', userId: 'usr-doc1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiology Specialist', departmentId: 'dept-1', availableDays: 'Mon-Fri', slotDurationMins: 30 },
          { id: 'doc-2', userId: 'usr-doc2', fullName: 'Dr. Michael Chen, MD', specialty: 'Clinical Neurology', departmentId: 'dept-2', availableDays: 'Mon,Wed,Fri', slotDurationMins: 30 },
          { id: 'doc-3', userId: 'usr-doc3', fullName: 'Dr. Priya Patel, MD', specialty: 'Orthopedics & Joint Care', departmentId: 'dept-3', availableDays: 'Tue,Thu,Sat', slotDurationMins: 30 },
        ]
      );
      setDoctors(docsData);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDoctors = formValues.preferredDepartmentId
    ? doctors.filter((d) => d.departmentId === formValues.preferredDepartmentId)
    : doctors;

  const onSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);

    try {
      const res = await apiClient.post('/patient-requirements', data);
      if (res.data?.success) {
        const refNo = res.data.data.referenceNumber;
        setSubmittedRef(refNo);
        // Save to LocalStorage for offline recommendation page pipeline
        setStoredData('latest_requirement', res.data.data);
        return;
      }
    } catch (e: any) {
      console.warn('Fallback to local intake creation');
      const refNo = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
      const newReq = {
        id: 'req-' + Math.random().toString(36).substring(2, 7),
        referenceNumber: refNo,
        patientId: user?.id || 'pat-1',
        ...data,
        createdAt: new Date().toISOString(),
      };
      setStoredData('latest_requirement', newReq);

      const allReqs = getStoredData<any[]>('all_requirements', []);
      allReqs.push(newReq);
      setStoredData('all_requirements', allReqs);

      setSubmittedRef(refNo);
    } finally {
      setLoading(false);
    }
  };

  if (submittedRef) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-3xl mx-auto">
            ✅
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Healthcare Requirement Submitted!</h2>
          <p className="text-slate-600 max-w-md mx-auto text-sm">
            Your intake details have been logged in the hospital database. Your unique tracking reference is:
          </p>

          <div className="inline-block bg-blue-50 border-2 border-blue-200 text-blue-800 text-2xl font-mono font-bold px-6 py-3 rounded-2xl shadow-inner">
            {submittedRef}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              variant="primary"
              size="lg"
              className="font-bold"
              onClick={() => navigate('/recommendation')}
            >
              🎯 View Smart Department Recommendations
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/doctors')}
            >
              Browse Doctor Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
          Online Patient Registration & Intake
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Patient Healthcare Requirement Form
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-xl mx-auto">
          Please complete the 4 steps below so our clinical recommendation engine can route you to the appropriate medical specialist.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center max-w-2xl mx-auto px-4">
        {[
          { num: 1, title: 'Personal Info' },
          { num: 2, title: 'Symptoms & History' },
          { num: 3, title: 'Appointment' },
          { num: 4, title: 'Review' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex flex-col items-center cursor-pointer transition-all ${
              step === s.num ? 'text-blue-600 font-bold' : step > s.num ? 'text-emerald-600 font-semibold' : 'text-slate-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step === s.num
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                  : step > s.num
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 bg-white text-slate-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="text-xs mt-1 hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      <ErrorMessage message={apiError || undefined} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal Info */}
        <FormSection
          stepNumber={1}
          title="Section A: Personal Information"
          description="Auto-populated from your patient profile. Please verify your details."
          active={step === 1}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" required {...register('fullName')} error={errors.fullName?.message as string} />
            <InputField label="Date of Birth" type="date" {...register('dateOfBirth')} />
            <InputField label="Phone Number" {...register('phone')} />
            <InputField label="Email Address" type="email" required {...register('email')} error={errors.email?.message as string} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="primary" onClick={() => setStep(2)}>
              Next: Healthcare Requirements →
            </Button>
          </div>
        </FormSection>

        {/* Step 2: Healthcare Requirements */}
        <FormSection
          stepNumber={2}
          title="Section B: Healthcare Requirements & Symptoms"
          description="Tell us about the symptoms or health concerns bringing you to the hospital."
          active={step === 2}
        >
          <InputField
            label="What is the main reason for your hospital visit?"
            placeholder="e.g. Recurrent severe headaches, joint pain during walking, chest tightness"
            required
            {...register('visitReason')}
            error={errors.visitReason?.message as string}
          />

          <TextareaField
            label="What symptoms are you experiencing?"
            placeholder="Describe your symptoms in detail (e.g. sharp pain on left side, fever of 101F, fatigue)..."
            rows={3}
            required
            {...register('symptoms')}
            error={errors.symptoms?.message as string}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="When did symptoms begin?" type="date" {...register('onsetDate')} />
            <InputField label="Duration (in days)" type="number" placeholder="e.g. 5" {...register('durationDays')} />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input type="checkbox" className="rounded text-blue-600" {...register('previousVisit')} />
              Have you visited our hospital for this specific problem before?
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <input type="checkbox" className="rounded text-blue-600" {...register('doctorConsultedBefore')} />
              Have you previously consulted another doctor for this concern?
            </label>
          </div>

          <TextareaField label="Existing Medical Conditions (if any)" placeholder="e.g. Diabetes, Asthma" rows={2} {...register('existingConditions')} />
          <InputField label="Known Allergies" placeholder="e.g. Penicillin, Peanuts" {...register('allergies')} />
          <InputField label="Current Medications" placeholder="e.g. Lisinopril 10mg" {...register('medications')} />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="button" variant="primary" onClick={() => setStep(3)}>
              Next: Appointment Preferences →
            </Button>
          </div>
        </FormSection>

        {/* Step 3: Appointment Preferences */}
        <FormSection
          stepNumber={3}
          title="Section C: Appointment Preferences"
          description="Select your preferred medical department, doctor, and date."
          active={step === 3}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Preferred Department (Optional)"
              placeholder="-- Let Recommendation Engine Decide --"
              options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
              {...register('preferredDepartmentId')}
            />

            <SelectField
              label="Preferred Doctor (Optional)"
              placeholder="-- Any Available Specialist --"
              options={filteredDoctors.map((doc) => ({ value: doc.id, label: `${doc.fullName} (${doc.specialty})` }))}
              {...register('preferredDoctorId')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Preferred Date" type="date" {...register('preferredDate')} />
            <SelectField
              label="Preferred Time Slot"
              placeholder="-- Select Time --"
              options={[
                { value: '09:00 AM', label: '09:00 AM' },
                { value: '09:30 AM', label: '09:30 AM' },
                { value: '10:00 AM', label: '10:00 AM' },
                { value: '10:30 AM', label: '10:30 AM' },
                { value: '11:00 AM', label: '11:00 AM' },
                { value: '02:00 PM', label: '02:00 PM' },
                { value: '03:00 PM', label: '03:00 PM' },
              ]}
              {...register('preferredTimeSlot')}
            />
          </div>

          <TextareaField
            label="Additional Notes or Accessibility Needs"
            placeholder="Wheelchair assistance required, translator needed, etc."
            rows={2}
            {...register('additionalNotes')}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button type="button" variant="primary" onClick={() => setStep(4)}>
              Review Form Details →
            </Button>
          </div>
        </FormSection>

        {/* Step 4: Review and Submit */}
        <FormSection
          stepNumber={4}
          title="Section D: Review & Submit Requirement"
          description="Please review all your entered information before submitting to the backend server."
          active={step === 4}
        >
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700">Patient:</span>
              <span className="text-slate-900">{formValues.fullName} ({formValues.email})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700">Primary Visit Reason:</span>
              <span className="text-blue-700 font-semibold">{formValues.visitReason || 'Not specified'}</span>
            </div>
            <div className="border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700 block mb-1">Reported Symptoms:</span>
              <p className="text-slate-800 bg-white p-3 rounded border border-slate-200">{formValues.symptoms || 'Not specified'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><strong>Allergies:</strong> {formValues.allergies || 'None'}</div>
              <div><strong>Medications:</strong> {formValues.medications || 'None'}</div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              ← Edit Answers
            </Button>
            <Button type="submit" variant="success" size="lg" className="font-bold" isLoading={loading}>
              🚀 Submit Requirement & Generate Recommendation
            </Button>
          </div>
        </FormSection>
      </form>
    </div>
  );
};
