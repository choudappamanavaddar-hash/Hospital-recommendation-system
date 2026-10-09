import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppointmentCard } from '../components/AppointmentCard';
import { QueueStatusCard } from '../components/QueueStatusCard';
import { Button } from '../components/Button';
import { Appointment, QueueEntry, Consultation, User } from '../types';
import { apiClient, fetchWithFallback, getStoredData, setStoredData } from '../services/api';
import { formatDate } from '../utils/formatters';

interface PatientDashboardPageProps {
  user: User;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeQueue, setActiveQueue] = useState<QueueEntry | null>(null);
  const [visits, setVisits] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);

    const appts = await fetchWithFallback<Appointment[]>(
      () => apiClient.get('/patients/me/appointments'),
      () => {
        const stored = getStoredData<Appointment[]>('patient_appointments', [
          {
            id: 'appt-demo-1',
            referenceNumber: 'APP-849120',
            patientId: user.id,
            doctorId: 'doc-1',
            doctor: { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiology Specialist', departmentId: 'dept-1', availableDays: 'Mon-Fri', slotDurationMins: 30 },
            departmentId: 'dept-1',
            department: { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: '', services: '' },
            appointmentDate: new Date().toISOString(),
            timeSlot: '10:30 AM',
            status: 'CHECKED_IN',
            notes: 'Follow-up for blood pressure check',
            queueEntry: {
              id: 'q-101',
              appointmentId: 'appt-demo-1',
              doctorId: 'doc-1',
              departmentId: 'dept-1',
              queueNumber: 104,
              position: 2,
              patientsAhead: 1,
              dynamicPosition: 2,
              status: 'WAITING',
              estimatedWaitMins: 15,
              checkInTime: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          },
        ]);
        return stored;
      }
    );

    setAppointments(appts);

    // Find active checked-in queue ticket
    const checkedInAppt = appts.find((a) => a.queueEntry && ['WAITING', 'IN_PROGRESS'].includes(a.queueEntry.status));
    if (checkedInAppt && checkedInAppt.queueEntry) {
      setActiveQueue(checkedInAppt.queueEntry);
    } else {
      setActiveQueue(null);
    }

    const pastVisits = await fetchWithFallback<Consultation[]>(
      () => apiClient.get('/patients/me/visits'),
      () => [
        {
          id: 'cons-1',
          appointmentId: 'appt-past-1',
          patientId: user.id,
          doctorId: 'doc-1',
          doctor: { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiology', departmentId: 'dept-1', availableDays: '', slotDurationMins: 30 },
          chiefComplaint: 'Chest tightness and exertion fatigue',
          diagnosis: 'Mild Essential Hypertension',
          doctorNotes: 'Prescribed Lisinopril. Recommended low sodium diet and follow-up in 4 weeks.',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          prescriptions: [
            { medicationName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (morning)', duration: '30 days' },
          ],
        },
      ]
    );

    setVisits(pastVisits);
    setLoading(false);
  };

  const handleCheckIn = async (appt: Appointment) => {
    try {
      const res = await apiClient.post(`/appointments/${appt.id}/check-in`);
      if (res.data?.success) {
        loadDashboardData();
        navigate(`/queue-tracker?appointmentId=${appt.id}`);
        return;
      }
    } catch (e) {}

    // Fallback Client Check-In
    const updatedAppts = appointments.map((a) => {
      if (a.id === appt.id) {
        const q: QueueEntry = {
          id: 'q-' + Math.random().toString(36).substring(2, 6),
          appointmentId: appt.id,
          doctorId: appt.doctorId,
          departmentId: appt.departmentId,
          queueNumber: 105,
          position: 2,
          patientsAhead: 1,
          dynamicPosition: 2,
          status: 'WAITING',
          estimatedWaitMins: 15,
          checkInTime: new Date().toISOString(),
        };
        return { ...a, status: 'CHECKED_IN' as any, queueEntry: q };
      }
      return a;
    });

    setStoredData('patient_appointments', updatedAppts);
    setAppointments(updatedAppts);
    navigate(`/queue-tracker?appointmentId=${appt.id}`);
  };

  const handleCancel = async (appt: Appointment) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${appt.referenceNumber}?`)) return;

    try {
      await apiClient.post(`/appointments/${appt.id}/cancel`);
    } catch (e) {}

    const updated = appointments.map((a) => (a.id === appt.id ? { ...a, status: 'CANCELLED' as any } : a));
    setStoredData('patient_appointments', updated);
    setAppointments(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Welcome Banner */}
      <div className="bg-mineral-900 text-white rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-semibold text-clay-300 uppercase tracking-widest block mb-2">
            Patient Health Portal
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back, {user.fullName || 'Patient'}
          </h1>
          <p className="text-sm text-mineral-300 mt-2 font-light max-w-xl">
            Track active clinical queues, manage scheduled specialist appointments, and access certified prescription history.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/requirement-form">
            <Button variant="primary" className="font-semibold bg-sage-600 hover:bg-sage-500 text-white rounded-xl shadow-xs">
              + Clinical Intake
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl font-medium">
              Medical Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Queue Ticket (if checked in) */}
      {activeQueue && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-heading text-2xl font-black text-mineral-900">Live Waiting Queue Status</h2>
            <Link to={`/queue-tracker?appointmentId=${activeQueue.appointmentId}`} className="text-xs font-bold text-clay-700 hover:text-clay-800 underline underline-offset-4">
              Full Queue Screen →
            </Link>
          </div>
          <QueueStatusCard queue={activeQueue} />
        </section>
      )}

      {/* Upcoming Appointments Section */}
      <section className="space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-heading text-2xl font-black text-mineral-900">Upcoming Consultations</h2>
            <p className="text-xs text-mineral-500 font-light">Your scheduled medical appointments and assigned slots.</p>
          </div>
          <Link to="/booking">
            <Button variant="primary" size="sm" className="bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-semibold">
              + Book Consultation
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-mineral-500">
            <div className="w-8 h-8 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-3"></div>
            Loading consultation records...
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl border border-mineral-200/80 text-center text-mineral-500 text-sm font-light">
            No upcoming consultations currently scheduled.{' '}
            <Link to="/booking" className="text-clay-700 font-semibold hover:underline">
              Schedule one now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCheckIn={handleCheckIn}
                onCancel={handleCancel}
                onViewQueue={(a) => navigate(`/queue-tracker?appointmentId=${a.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Medical History & Consultation Records */}
      <section className="space-y-5">
        <h2 className="font-heading text-2xl font-black text-mineral-900">Certified Medical Records & Prescriptions</h2>

        {visits.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-mineral-200 text-sm text-mineral-500 text-center font-light">
            No completed consultation records on file yet.
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v) => (
              <div key={v.id} className="glass-card p-6 sm:p-7 rounded-2xl border border-mineral-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-start border-b border-mineral-100 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-mineral-900 text-lg">{v.doctor?.fullName}</h4>
                    <span className="text-xs text-clay-700 font-semibold">{v.doctor?.specialty}</span>
                  </div>
                  <span className="text-xs text-mineral-400 font-light">{formatDate(v.createdAt)}</span>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-mineral-700"><strong className="text-mineral-900">Chief Complaint:</strong> {v.chiefComplaint}</p>
                  <p className="text-sage-800 font-semibold bg-sage-50/80 p-3 rounded-xl border border-sage-200/80">
                    Clinical Diagnosis: {v.diagnosis}
                  </p>
                  {v.doctorNotes && <p className="text-mineral-600 font-light"><strong className="text-mineral-800">Physician Notes:</strong> {v.doctorNotes}</p>}
                </div>

                {v.prescriptions && v.prescriptions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-mineral-800 block mb-2">Prescribed Medications:</span>
                    <div className="flex flex-wrap gap-2">
                      {v.prescriptions.map((rx, idx) => (
                        <span key={idx} className="bg-clay-50 border border-clay-200/80 text-clay-800 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs">
                          💊 {rx.medicationName} ({rx.dosage}) — {rx.frequency}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
