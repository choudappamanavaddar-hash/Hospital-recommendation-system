import React from 'react';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records available.',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-mineral-100 p-12 text-center text-mineral-500 shadow-glass">
        <svg className="animate-spin h-8 w-8 mx-auto text-sage-600 mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading data table records...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-mineral-100 p-8 text-center text-mineral-500 text-sm shadow-glass">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-mineral-100 overflow-hidden shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-mineral-700">
          <thead className="bg-surface text-mineral-600 font-semibold border-b border-mineral-100 text-xs uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-mineral-50">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-mineral-50/50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
