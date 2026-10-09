import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  stepNumber?: number;
  active?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  stepNumber,
  active = true,
}) => {
  if (!active) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        {stepNumber && (
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
            {stepNumber}
          </span>
        )}
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
};
