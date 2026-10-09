import React from 'react';
import { Department } from '../types';

interface DepartmentCardProps {
  department: Department;
  matchScore?: number;
  matchReason?: string;
  onSelect?: (department: Department) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  matchScore,
  matchReason,
  onSelect,
}) => {
  return (
    <div className="group relative bg-white border border-mineral-100 rounded-3xl p-8 shadow-glass overflow-hidden transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-1 flex flex-col justify-between">
      
      {matchScore !== undefined && (
        <div className="absolute top-0 right-0 bg-sage-50 border-l border-b border-sage-100 text-sage-700 px-5 py-2 text-xs font-bold rounded-bl-2xl shadow-sm tracking-wider">
          {matchScore}% MATCH
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-6 mt-2">
          <div className="w-14 h-14 rounded-2xl bg-mineral-50 border border-mineral-100 flex items-center justify-center text-2xl text-mineral-700 group-hover:scale-105 transition-transform duration-300">
            🏥
          </div>
          <div>
            <h4 className="font-heading text-2xl font-bold text-mineral-900 tracking-tight">{department.name}</h4>
            <span className="text-xs font-mono font-semibold text-mineral-500 bg-mineral-50 px-2 py-1 rounded-md inline-block mt-1 border border-mineral-100">
              {department.code}
            </span>
          </div>
        </div>

        <p className="text-sm text-mineral-600 font-light leading-relaxed mb-6">{department.description}</p>

        {matchReason && (
          <div className="text-sm bg-clay-50/50 border border-clay-100 text-clay-900 p-4 rounded-xl mb-6 flex gap-3 items-start">
            <span className="text-clay-600 mt-0.5">💡</span>
            <p className="font-light leading-relaxed">
              <span className="font-semibold text-clay-700 block mb-0.5">Clinical rationale: </span>
              {matchReason}
            </p>
          </div>
        )}

        <div className="mb-8">
          <span className="text-xs font-semibold text-mineral-400 uppercase tracking-widest block mb-2">
            Key Services
          </span>
          <p className="text-sm text-mineral-700 font-medium leading-relaxed bg-surface p-3 rounded-lg border border-mineral-100">
            {department.services}
          </p>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(department)}
          className="relative z-10 w-full rounded-xl bg-mineral-900 p-3.5 text-white font-semibold tracking-wide hover:bg-mineral-800 transition-colors shadow-sm"
        >
          Book Consultation
        </button>
      )}
    </div>
  );
};
