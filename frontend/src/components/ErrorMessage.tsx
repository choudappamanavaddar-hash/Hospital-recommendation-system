import React from 'react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-4 text-sm flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs bg-rose-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-rose-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};
