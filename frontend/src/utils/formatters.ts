export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  return timeString;
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'BOOKED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'CHECKED_IN':
    case 'WAITING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'IN_CONSULTATION':
    case 'IN_PROGRESS':
      return 'bg-sage-100 text-sage-800 border-sage-300 font-semibold animate-pulse';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'CANCELLED':
    case 'SKIPPED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};
