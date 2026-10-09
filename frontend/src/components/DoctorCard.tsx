import React from 'react';
import { Doctor } from '../types';
import { Button } from './Button';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment }) => {
  return (
    <div className="glass-card rounded-2xl border border-mineral-200/80 p-6 shadow-sm hover:shadow-glass hover:-translate-y-1 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md bg-sage-50 text-sage-700 border border-sage-200/80 mb-2">
              {doctor.department?.name || 'Clinical Specialist'}
            </span>
            <h4 className="font-heading text-lg font-bold text-mineral-900 leading-snug">{doctor.fullName}</h4>
            <p className="text-xs text-clay-700 font-semibold mt-0.5">{doctor.specialty}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-clay-50 border border-clay-200 flex items-center justify-center font-heading font-black text-clay-700 text-lg flex-shrink-0 shadow-xs">
            {doctor.fullName.replace(/^Dr\.\s*/, '').charAt(0)}
          </div>
        </div>

        <p className="text-xs text-mineral-600 line-clamp-3 mb-4 leading-relaxed font-light">
          {doctor.bio || 'Experienced board-certified healthcare consultant.'}
        </p>

        {doctor.qualification && (
          <div className="text-xs text-mineral-600 mb-3 bg-surface p-2.5 rounded-xl border border-mineral-100 flex items-center gap-2">
            <span>🎓</span>
            <span className="font-medium text-mineral-800">{doctor.qualification}</span>
          </div>
        )}

        <div className="text-xs text-mineral-500 mb-5 flex items-center gap-1.5 font-light">
          <span>📅</span>
          <span>Available:</span>
          <span className="font-semibold text-mineral-800">{doctor.availableDays}</span>
        </div>
      </div>

      {onBookAppointment && (
        <Button
          variant="primary"
          size="sm"
          className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold transition-all shadow-xs"
          onClick={() => onBookAppointment(doctor)}
        >
          Schedule Consultation
        </Button>
      )}
    </div>
  );
};
