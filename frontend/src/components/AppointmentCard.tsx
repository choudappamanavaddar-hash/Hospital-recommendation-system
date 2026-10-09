import React from 'react';
import { Appointment } from '../types';
import { formatDate, getStatusBadgeColor } from '../utils/formatters';
import { Button } from './Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onCheckIn?: (appt: Appointment) => void;
  onCancel?: (appt: Appointment) => void;
  onViewQueue?: (appt: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCheckIn,
  onCancel,
  onViewQueue,
}) => {
  return (
    <div className="glass-card rounded-2xl border border-mineral-200/80 p-6 shadow-sm hover:shadow-glass transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-mineral-100 pb-3 mb-4">
          <span className="font-mono text-xs font-bold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-lg border border-sage-200/80">
            Ref: {appointment.referenceNumber}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeColor(
              appointment.status
            )}`}
          >
            {appointment.status.replace('_', ' ')}
          </span>
        </div>

        <h4 className="font-heading text-lg font-bold text-mineral-900 leading-snug">
          {appointment.doctor?.fullName || 'Physician Assigned'}
        </h4>
        <p className="text-xs text-clay-700 font-semibold mb-3">
          {appointment.department?.name || 'Clinical Department'}
        </p>

        <div className="space-y-1.5 text-xs text-mineral-600 mb-4 bg-surface p-3.5 rounded-xl border border-mineral-100">
          <div className="flex justify-between">
            <span className="text-mineral-400 font-light">Consultation Date:</span>
            <span className="font-semibold text-mineral-800">{formatDate(appointment.appointmentDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mineral-400 font-light">Assigned Slot:</span>
            <span className="font-semibold text-mineral-800">{appointment.timeSlot}</span>
          </div>
        </div>

        {appointment.queueEntry && (
          <div className="text-xs bg-clay-50/80 border border-clay-200/70 p-3 rounded-xl mb-4 text-clay-900 flex justify-between items-center shadow-2xs">
            <span>
              Queue Ticket: <strong className="text-sm font-heading font-black">#{appointment.queueEntry.queueNumber}</strong>
            </span>
            <span>Est. Wait: <strong className="font-semibold">{appointment.queueEntry.estimatedWaitMins} mins</strong></span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-mineral-100">
        {appointment.status === 'BOOKED' && onCheckIn && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold transition-all"
            onClick={() => onCheckIn(appointment)}
          >
            Check In Now
          </Button>
        )}
        {appointment.status === 'CHECKED_IN' && onViewQueue && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 py-2 rounded-xl bg-clay-100 hover:bg-clay-200 text-clay-800 font-semibold transition-all"
            onClick={() => onViewQueue(appointment)}
          >
            View Live Queue
          </Button>
        )}
        {['BOOKED', 'CHECKED_IN'].includes(appointment.status) && onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="py-2 rounded-xl border-mineral-200 text-mineral-600 hover:bg-mineral-100 font-medium"
            onClick={() => onCancel(appointment)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
