import React from 'react';
import { QueueEntry } from '../types';

interface QueueStatusCardProps {
  queue: QueueEntry;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({ queue }) => {
  const ahead = queue.patientsAhead !== undefined ? queue.patientsAhead : Math.max(0, queue.position - 1);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-glass border border-mineral-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-clay-600 tracking-widest uppercase block mb-1">
            Real-Time Hospital Queue
          </span>
          <h3 className="font-heading text-3xl font-black text-mineral-900">Ticket #{queue.queueNumber}</h3>
        </div>
        <span className="bg-sage-50 text-sage-700 border border-sage-200 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
          {queue.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-surface p-6 rounded-2xl border border-mineral-100">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Queue Position</span>
          <span className="font-heading text-4xl font-extrabold text-clay-700">#{queue.dynamicPosition || queue.position}</span>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-mineral-100">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Patients Ahead</span>
          <span className="font-heading text-4xl font-extrabold text-mineral-900">{ahead}</span>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-mineral-100 col-span-2 sm:col-span-1">
          <span className="text-xs text-mineral-500 font-semibold uppercase tracking-wider block mb-2">Est. Wait Time</span>
          <span className="font-heading text-4xl font-extrabold text-sage-600">~{queue.estimatedWaitMins}m</span>
        </div>
      </div>

      <div className="bg-sage-50/50 p-4 rounded-xl border border-sage-100 flex items-center gap-4 text-sm text-sage-800">
        <span className="text-2xl">📢</span>
        <span className="font-medium leading-relaxed">
          Please remain in the waiting lounge or keep your browser tab open. You will be called into the doctor's consultation room when your ticket is active.
        </span>
      </div>
    </div>
  );
};
