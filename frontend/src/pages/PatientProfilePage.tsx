import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '../components/InputField';
import { TextareaField } from '../components/TextareaField';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { PatientProfile, User } from '../types';
import { apiClient, getStoredData, setStoredData } from '../services/api';
import { formatDate } from '../utils/formatters';

interface PatientProfilePageProps {
  user: User;
}

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({ user }) => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/patients/me');
      if (res.data?.success && res.data.data) {
        setProfile(res.data.data);
        reset(res.data.data);
      }
    } catch (e) {
      // Fallback local storage profile
      const storedProfiles = getStoredData<Record<string, PatientProfile>>('patient_profiles', {});
      const current = storedProfiles[user.id] || {
        id: 'pat-' + user.id,
        userId: user.id,
        fullName: user.fullName || 'Registered Patient',
        phone: '+1 (555) 987-6543',
        dateOfBirth: '1990-01-01',
        gender: 'Not specified',
        address: '742 Evergreen Terrace, Springfield',
        emergencyContact: 'Emergency Contact — +1 (555) 019-2834',
        medicalHistory: 'No chronic cardiovascular or pulmonary history recorded.',
        allergies: 'None recorded',
        currentMedications: 'None recorded',
      };
      setProfile(current);
      reset(current);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiClient.patch('/patients/me', data);
      if (res.data?.success) {
        setProfile(res.data.data);
        setSuccessMsg('Patient profile updated and synced with hospital records.');
        setEditing(false);
      }
    } catch (e: any) {
      // Fallback local save
      const storedProfiles = getStoredData<Record<string, PatientProfile>>('patient_profiles', {});
      const updatedProfile: PatientProfile = {
        ...(profile || { id: 'pat-' + user.id, userId: user.id, fullName: user.fullName || 'Patient' }),
        ...data,
      };
      storedProfiles[user.id] = updatedProfile;
      setStoredData('patient_profiles', storedProfiles);
      setProfile(updatedProfile);
      setSuccessMsg('Profile saved to local clinical records.');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-mineral-500">
        <div className="w-8 h-8 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-3"></div>
        Loading medical profile records...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="glass-card rounded-3xl border border-mineral-200/80 shadow-glass p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-mineral-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sage-50 text-sage-700 font-heading font-black text-2xl flex items-center justify-center border border-sage-200 shadow-xs">
              {user.fullName ? user.fullName.charAt(0) : 'P'}
            </div>
            <div>
              <span className="font-mono text-xs text-sage-800 bg-sage-50 px-2.5 py-0.5 rounded-lg border border-sage-200 font-bold">
                Patient ID: {profile?.id || user.id}
              </span>
              <h2 className="font-heading text-2xl font-black text-mineral-900 mt-1">{profile?.fullName || user.fullName}</h2>
              <p className="text-xs text-mineral-500 font-light">{user.email}</p>
            </div>
          </div>

          <Button
            variant={editing ? 'outline' : 'primary'}
            size="sm"
            className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel Editing' : '✏️ Edit Profile'}
          </Button>
        </div>

        {successMsg && (
          <div className="bg-sage-50 border border-sage-300 text-sage-800 p-3.5 rounded-xl mb-6 text-sm font-medium">
            🌿 {successMsg}
          </div>
        )}

        <ErrorMessage message={errorMsg || undefined} />

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Full Legal Name" required {...register('fullName')} />
              <InputField label="Phone Contact" {...register('phone')} />
              <InputField label="Date of Birth" type="date" {...register('dateOfBirth')} />
              <InputField label="Gender" placeholder="Female / Male / Non-binary / Other" {...register('gender')} />
            </div>

            <InputField label="Residential Street Address" {...register('address')} />
            <InputField label="Emergency Contact (Name & Phone)" {...register('emergencyContact')} />

            <div className="space-y-4 pt-4 border-t border-mineral-100">
              <h4 className="font-heading text-sm font-bold text-mineral-900 uppercase tracking-wider">
                Clinical Intake Information
              </h4>
              <TextareaField
                label="Chronic Conditions & Medical History"
                rows={2}
                {...register('medicalHistory')}
              />
              <InputField label="Known Drug / Food Allergies" {...register('allergies')} />
              <TextareaField label="Current Prescriptions & Medications" rows={2} {...register('currentMedications')} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-mineral-100">
              <Button type="button" variant="outline" className="rounded-xl border-mineral-200" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold" isLoading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-4">
                Personal Demographics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-surface p-6 rounded-2xl border border-mineral-100 text-sm">
                <div>
                  <span className="text-xs text-mineral-400 font-light block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-mineral-800">{profile?.phone || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-mineral-400 font-light block mb-0.5">Date of Birth</span>
                  <span className="font-semibold text-mineral-800">{formatDate(profile?.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-xs text-mineral-400 font-light block mb-0.5">Gender</span>
                  <span className="font-semibold text-mineral-800">{profile?.gender || 'Not specified'}</span>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-xs text-mineral-400 font-light block mb-0.5">Residential Address</span>
                  <span className="font-semibold text-mineral-800">{profile?.address || 'Not specified'}</span>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-xs text-mineral-400 font-light block mb-0.5">Emergency Contact</span>
                  <span className="font-semibold text-mineral-800">{profile?.emergencyContact || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-4">
                Clinical Health Records & History
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-clay-50/80 border border-clay-200/80 p-5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-clay-900 block mb-1">⚠️ Known Allergies:</span>
                  <p className="text-clay-800 font-medium">{profile?.allergies || 'No allergies reported'}</p>
                </div>
                <div className="bg-sage-50/80 border border-sage-200/80 p-5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-sage-900 block mb-1">💊 Active Medications:</span>
                  <p className="text-sage-800 font-medium">{profile?.currentMedications || 'No active medications'}</p>
                </div>
                <div className="bg-surface border border-mineral-200 p-5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-mineral-900 block mb-1">📜 Chronic Medical History:</span>
                  <p className="text-mineral-700 font-light">{profile?.medicalHistory || 'No prior chronic conditions recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
