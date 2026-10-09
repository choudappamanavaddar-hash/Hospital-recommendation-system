import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QueueStatusCard } from '../components/QueueStatusCard';
import { Button } from '../components/Button';
import { QueueEntry } from '../types';
import { apiClient, fetchWithFallback, getStoredData } from '../services/api';

export const QueueTrackerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || 'appt-demo-1';
  const [queue, setQueue] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadQueueData();
    const interval = setInterval(() => {
      loadQueueData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [appointmentId]);

  const loadQueueData = async () => {
    try {
      const res = await apiClient.get(`/queues/appointment/${appointmentId}`);
      if (res.data?.success) {
        setQueue(res.data.data);
        setLoading(false);
        return;
      }
    } catch (e) {}

    // Fallback Client Queue Simulation
    const mockQueue: QueueEntry = {
      id: 'q-101',
      appointmentId,
      doctorId: 'doc-1',
      doctor: { id: 'doc-1', userId: 'usr-1', fullName: 'Dr. Sarah Smith, MD', specialty: 'Cardiology Specialist', departmentId: 'dept-1', availableDays: '', slotDurationMins: 30 },
      departmentId: 'dept-1',
      department: { id: 'dept-1', name: 'Cardiology', code: 'CARD', description: '', services: '' },
      queueNumber: 104,
      position: 2,
      patientsAhead: 1,
      dynamicPosition: 2,
      status: 'WAITING',
      estimatedWaitMins: 15,
      checkInTime: new Date().toISOString(),
    };

    setQueue(mockQueue);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className="w-10 h-10 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-mineral-500 font-medium">Connecting to live queue system...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center">
        <span className="text-xs font-semibold text-sage-600 uppercase tracking-widest block mb-2">
          Live Hospital Queue System
        </span>
        <h1 className="font-heading text-4xl font-black text-mineral-900 tracking-tight">
          Patient Waiting Queue Tracker
        </h1>
        <p className="text-mineral-500 text-sm mt-2 max-w-xl mx-auto font-light">
          Auto-updates every 10 seconds. You may wait comfortably anywhere in the clinic. We will notify you when it's time to proceed.
        </p>
      </div>

      {queue ? (
        <div className="space-y-6">
          <QueueStatusCard queue={queue} />

          <div className="bg-white p-6 rounded-2xl border border-mineral-100 shadow-sm space-y-4">
            <h4 className="font-heading font-bold text-mineral-900 text-base">Appointment Ticket Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-mineral-700 bg-surface p-5 rounded-xl border border-mineral-100">
              <div>
                <span className="text-mineral-500 block mb-1 text-xs uppercase tracking-wider font-semibold">Attending Physician</span>
                <span className="font-bold text-mineral-900">{queue.appointment?.doctor?.fullName || queue.doctor?.fullName}</span>
              </div>
              <div>
                <span className="text-mineral-500 block mb-1 text-xs uppercase tracking-wider font-semibold">Department</span>
                <span className="font-bold text-mineral-900">{queue.appointment?.department?.name || queue.department?.name}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-mineral-200 text-center text-mineral-500 shadow-sm">
          No active queue ticket found for this appointment. Please check in at the hospital portal first.
        </div>
      )}

      <div className="flex justify-center gap-4 pt-6">
        <button 
          onClick={() => navigate('/patient-dashboard')}
          className="px-6 py-2.5 rounded-lg border border-mineral-200 text-mineral-700 hover:bg-mineral-50 transition-colors font-medium text-sm"
        >
          ← Back to Patient Dashboard
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 rounded-lg bg-mineral-900 text-white hover:bg-mineral-800 transition-colors font-medium text-sm shadow-sm"
        >
          🖨️ Print Queue Ticket
        </button>
      </div>
    </div>
  );
};
