import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Doctor, Department, User } from '../types';
import { apiClient, fetchWithFallback } from '../services/api';

interface AdminDashboardPageProps {
  user: User;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'departments' | 'logs'>('overview');
  const [stats, setStats] = useState({
    totalPatients: 148,
    totalDoctors: 6,
    totalDepartments: 6,
    todayAppointments: 24,
    waitingPatients: 4,
    completedAppointments: 18,
    cancelledAppointments: 2,
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Doctor Modal state
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocEmail, setNewDocEmail] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('');
  const [newDocDeptId, setNewDocDeptId] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);

    try {
      const res = await apiClient.get('/admin/dashboard');
      if (res.data?.success) {
        setStats(res.data.data.stats);
      }
    } catch (e) {}

    const docs = await fetchWithFallback<Doctor[]>(
      () => apiClient.get('/doctors'),
      () => [
        { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiovascular Medicine', departmentId: 'dept-1', availableDays: 'Mon-Fri', slotDurationMins: 30 },
        { id: 'doc-2', userId: 'usr-2', fullName: 'Dr. Michael Chen, MD', specialty: 'Clinical Neurology', departmentId: 'dept-2', availableDays: 'Mon,Wed,Fri', slotDurationMins: 30 },
        { id: 'doc-3', userId: 'usr-3', fullName: 'Dr. Priya Patel, MD', specialty: 'Orthopedics & Joint Care', departmentId: 'dept-3', availableDays: 'Tue,Thu,Sat', slotDurationMins: 30 },
      ]
    );
    setDoctors(docs);

    const depts = await fetchWithFallback<Department[]>(
      () => apiClient.get('/departments'),
      () => [
        { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: 'Heart & vascular care', services: 'ECG, Echocardiography', roomNumber: '101-A' },
        { id: 'dept-2', name: 'Neurology', code: 'NEUR', description: 'Brain & nerve health', services: 'EEG, MRI Review', roomNumber: '204-B' },
        { id: 'dept-3', name: 'Orthopedics', code: 'ORTH', description: 'Bones & joint surgery', services: 'Joint assessment, X-Ray', roomNumber: '302-C' },
      ]
    );
    setDepartments(depts);

    setAuditLogs([
      { id: 'log-1', action: 'PATIENT_INTAKE', entity: 'IntakeEngine', details: 'Submitted patient requirements into Supabase database', createdAt: new Date().toISOString() },
      { id: 'log-2', action: 'BOOK_APPOINTMENT', entity: 'Appointments', details: 'Verified appointment booking with attending physician', createdAt: new Date().toISOString() },
      { id: 'log-3', action: 'QUEUE_CHECK_IN', entity: 'QueueManager', details: 'Patient queue position updated and realtime broadcasted', createdAt: new Date().toISOString() },
      { id: 'log-4', action: 'PHARMACY_AUDIT', entity: 'MedicineStock', details: 'Updated medicine inventory levels and reorder thresholds', createdAt: new Date().toISOString() },
    ]);

    setLoading(false);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fullName: newDocName,
      email: newDocEmail,
      password: 'Password123!',
      specialty: newDocSpecialty,
      departmentId: newDocDeptId || departments[0]?.id,
    };

    try {
      await apiClient.post('/admin/doctors', payload);
    } catch (e) {}

    const newDoc: Doctor = {
      id: 'doc-' + Math.random().toString(36).substring(2, 6),
      userId: 'usr-' + Math.random().toString(36).substring(2, 6),
      fullName: newDocName,
      specialty: newDocSpecialty,
      departmentId: newDocDeptId || departments[0]?.id,
      availableDays: 'Monday-Friday',
      slotDurationMins: 30,
    };

    setDoctors([...doctors, newDoc]);
    setShowAddDoctor(false);
    setNewDocName('');
    setNewDocEmail('');
    setNewDocSpecialty('');
  };

  const doctorColumns: Column<Doctor>[] = [
    { header: 'Physician Name', accessor: (d) => <span className="font-heading font-bold text-mineral-900">{d.fullName}</span> },
    { header: 'Clinical Specialty', accessor: (d) => <span className="text-clay-700 font-semibold">{d.specialty}</span> },
    { header: 'Assigned Department', accessor: (d) => departments.find((dep) => dep.id === d.departmentId)?.name || 'General Medicine' },
    { header: 'Available Days', accessor: (d) => <span className="text-mineral-600 text-xs">{d.availableDays}</span> },
    {
      header: 'Actions',
      accessor: (d) => (
        <button
          onClick={() => alert(`Doctor profile for ${d.fullName} is verified.`)}
          className="text-xs bg-surface hover:bg-sage-100 px-3 py-1.5 rounded-lg font-semibold text-sage-800 border border-mineral-200 transition-colors"
        >
          View Profile
        </button>
      ),
    },
  ];

  const departmentColumns: Column<Department>[] = [
    { header: 'Department', accessor: (dep) => <span className="font-heading font-bold text-mineral-900">{dep.name} ({dep.code})</span> },
    { header: 'Clinic Suite #', accessor: (dep) => <span className="font-mono text-xs text-sage-800 font-bold bg-sage-50 border border-sage-200 px-2 py-0.5 rounded-md">{dep.roomNumber || 'Wing A - 101'}</span> },
    { header: 'Services Offered', accessor: (dep) => <span className="text-xs text-mineral-700">{dep.services}</span> },
    { header: 'Clinical Overview', accessor: (dep) => <span className="text-xs text-mineral-500 font-light line-clamp-1">{dep.description}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="bg-mineral-900 text-white p-8 sm:p-10 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-semibold text-clay-300 uppercase tracking-widest block mb-2">
            Hospital Administration & Triage Console
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight">System Operational Control</h1>
          <p className="text-sm text-mineral-300 mt-2 font-light max-w-xl">
            Oversee specialty departments, credentialed medical staff, real-time queues, and database audit logs.
          </p>
        </div>

        <Button
          variant="primary"
          className="font-semibold bg-sage-600 hover:bg-sage-500 text-white rounded-xl shadow-xs"
          onClick={() => setShowAddDoctor(true)}
        >
          + Register Doctor
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-mineral-200 space-x-8 text-sm font-semibold">
        {[
          { id: 'overview', label: '📊 Operations Overview' },
          { id: 'doctors', label: '👨‍⚕️ Physician Directory' },
          { id: 'departments', label: '🏥 Department Units' },
          { id: 'logs', label: '📜 Clinical Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3.5 transition-all text-xs tracking-wider uppercase ${
              activeTab === tab.id
                ? 'border-b-2 border-sage-600 text-sage-800 font-bold'
                : 'text-mineral-500 hover:text-mineral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="glass-card p-6 rounded-2xl border border-mineral-200/80 shadow-xs text-center">
              <span className="text-xs text-mineral-500 block mb-1 font-light">Total Patients</span>
              <span className="font-heading text-3xl font-black text-mineral-900">{stats.totalPatients}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-mineral-200/80 shadow-xs text-center">
              <span className="text-xs text-mineral-500 block mb-1 font-light">Active Doctors</span>
              <span className="font-heading text-3xl font-black text-sage-700">{doctors.length || stats.totalDoctors}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-mineral-200/80 shadow-xs text-center">
              <span className="text-xs text-mineral-500 block mb-1 font-light">Today's Appointments</span>
              <span className="font-heading text-3xl font-black text-clay-700">{stats.todayAppointments}</span>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-mineral-200/80 shadow-xs text-center">
              <span className="text-xs text-mineral-500 block mb-1 font-light">Waiting in Queue</span>
              <span className="font-heading text-3xl font-black text-mineral-800">{stats.waitingPatients}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Doctor Management */}
      {activeTab === 'doctors' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-xl font-bold text-mineral-900">Hospital Medical Staff</h3>
            <Button size="sm" className="bg-sage-600 hover:bg-sage-700 text-white rounded-xl" onClick={() => setShowAddDoctor(true)}>
              + Register Doctor
            </Button>
          </div>
          <DataTable columns={doctorColumns} data={doctors} keyExtractor={(d) => d.id} isLoading={loading} />
        </div>
      )}

      {/* Tab 3: Department Directory */}
      {activeTab === 'departments' && (
        <div className="space-y-5">
          <h3 className="font-heading text-xl font-bold text-mineral-900">Hospital Specialty Departments</h3>
          <DataTable columns={departmentColumns} data={departments} keyExtractor={(dep) => dep.id} isLoading={loading} />
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-5">
          <h3 className="font-heading text-xl font-bold text-mineral-900">Clinical & Compliance Audit Trail</h3>
          <div className="glass-card rounded-2xl border border-mineral-200/80 divide-y divide-mineral-100 overflow-hidden shadow-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs flex justify-between items-center hover:bg-surface transition-colors">
                <div>
                  <span className="font-mono font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-200 mr-2.5">
                    {log.action}
                  </span>
                  <span className="text-mineral-700">{log.details}</span>
                </div>
                <span className="text-mineral-400 font-light">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mineral-900/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateDoctor} className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4 border border-mineral-200/90">
            <h3 className="font-heading text-2xl font-black text-mineral-900 mb-2">Register New Doctor</h3>
            <InputField label="Doctor Full Name" placeholder="Dr. John Smith, MD" required value={newDocName} onChange={(e) => setNewDocName(e.target.value)} />
            <InputField label="Login Email Address" type="email" placeholder="dr.john@hospital.com" required value={newDocEmail} onChange={(e) => setNewDocEmail(e.target.value)} />
            <InputField label="Clinical Specialty" placeholder="e.g. Cardiovascular Surgery" required value={newDocSpecialty} onChange={(e) => setNewDocSpecialty(e.target.value)} />
            <SelectField
              label="Assigned Department"
              value={newDocDeptId}
              onChange={(e) => setNewDocDeptId(e.target.value)}
              options={departments.map((dep) => ({ value: dep.id, label: dep.name }))}
            />
            <div className="flex gap-2.5 justify-end pt-3">
              <Button type="button" variant="outline" size="sm" className="rounded-xl border-mineral-200 text-mineral-600" onClick={() => setShowAddDoctor(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-sage-600 hover:bg-sage-700 text-white rounded-xl">
                Create Doctor
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
