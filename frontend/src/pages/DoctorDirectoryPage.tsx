import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorCard } from '../components/DoctorCard';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Doctor, Department } from '../types';
import { apiClient, fetchWithFallback } from '../services/api';

export const DoctorDirectoryPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const docs = await fetchWithFallback<Doctor[]>(
      () => apiClient.get('/doctors'),
      () => [
        { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiovascular Medicine', departmentId: 'dept-1', department: { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: 'Heart care', services: 'ECG' }, bio: 'Senior Cardiologist with over 14 years of clinical experience in interventional cardiology and preventative heart care.', qualification: 'MD - Harvard Medical School', availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday', slotDurationMins: 30 },
        { id: 'doc-2', userId: 'usr-2', fullName: 'Dr. Michael Chen, MD', specialty: 'Clinical Neurology & Epilepsy', departmentId: 'dept-2', department: { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: 'Brain care', services: 'EEG' }, bio: 'Board-certified Neurologist focusing on headaches, neuropathies, memory disorders, and electroencephalography.', qualification: 'MD, PhD - Stanford University', availableDays: 'Monday,Wednesday,Friday', slotDurationMins: 30 },
        { id: 'doc-3', userId: 'usr-3', fullName: 'Dr. Priya Patel, MD', specialty: 'Orthopedic Surgery & Sports Medicine', departmentId: 'dept-3', department: { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: 'Bone care', services: 'Joint pain' }, bio: 'Specialist in joint reconstruction, knee & shoulder arthroscopy, spine health, and sports injury rehabilitative medicine.', qualification: 'MD - Mayo Clinic', availableDays: 'Tuesday,Thursday,Saturday', slotDurationMins: 30 },
        { id: 'doc-4', userId: 'usr-4', fullName: 'Dr. Robert Adams, MD', specialty: 'Internal Medicine & Diagnostic Primary Care', departmentId: 'dept-5', department: { id: 'dept-5', name: 'General Medicine', code: 'GENM', description: 'Primary care', services: 'Fever' }, bio: 'Primary care provider emphasizing preventative health screenings, multi-system symptom diagnosis, and chronic condition control.', qualification: 'MD - Columbia University', availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday', slotDurationMins: 20 },
      ]
    );
    setDoctors(docs);

    const depts = await fetchWithFallback<Department[]>(
      () => apiClient.get('/departments'),
      () => [
        { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: '', services: '' },
        { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: '', services: '' },
        { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: '', services: '' },
        { id: 'dept-5', name: 'General Internal Medicine', code: 'GENM', description: '', services: '' },
      ]
    );
    setDepartments(depts);

    setLoading(false);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDepartment ? doc.departmentId === selectedDepartment : true;
    const matchesSpec = selectedSpecialty ? doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) : true;

    return matchesSearch && matchesDept && matchesSpec;
  });

  const handleBook = (doc: Doctor) => {
    navigate(`/booking?doctorId=${doc.id}&departmentId=${doc.departmentId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title */}
      <div>
        <span className="text-xs font-semibold text-sage-600 uppercase tracking-widest block mb-2">
          Clinical Staff Directory
        </span>
        <h1 className="font-heading text-4xl font-black text-mineral-900 tracking-tight">
          Find a Doctor & Medical Specialist
        </h1>
        <p className="text-mineral-500 text-sm mt-2 font-light max-w-2xl">
          Browse verified healthcare practitioners across clinical departments, review credentials, check weekly schedules, and reserve appointments.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6 rounded-2xl border border-mineral-200/80 shadow-glass grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField
          label="Search by Doctor / Specialty"
          placeholder="e.g. Dr. Sarah Smith, Cardiology..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <SelectField
          label="Filter by Clinical Department"
          placeholder="-- All Departments --"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          options={departments.map((d) => ({ value: d.id, label: d.name }))}
        />

        <SelectField
          label="Filter by Specialty Discipline"
          placeholder="-- All Specialties --"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          options={[
            { value: 'Cardiovascular', label: 'Cardiovascular Medicine' },
            { value: 'Neurology', label: 'Neurology & Neuroscience' },
            { value: 'Orthopedic', label: 'Orthopedic Surgery & Joints' },
            { value: 'Internal', label: 'Internal Medicine & Primary Care' },
            { value: 'Pediatric', label: 'Pediatrics & Adolescent Care' },
            { value: 'Dermatology', label: 'Clinical Dermatology' },
          ]}
        />
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mineral-500 font-medium">Loading clinical directory...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-mineral-200 text-mineral-500 font-light">
          No medical specialists match your current search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} onBookAppointment={handleBook} />
          ))}
        </div>
      )}
    </div>
  );
};
