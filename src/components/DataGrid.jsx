import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * Generic dense data grid with inline sort and row selection.
 *
 * columns: [{ key, label, render?, width? }]
 * data: array of records
 * onRowClick: (row) => void
 */
export default function DataGrid({ columns, data, onRowClick, selectedId, emptyText = 'No records' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
                style={col.width ? { width: col.width } : {}}
                onClick={() => toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key
                    ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    : <ChevronsUpDown size={12} className="text-gray-300" />
                  }
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-400 text-xs">{emptyText}</td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={`border-b border-gray-100 cursor-pointer transition-colors
                  ${selectedId === row.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-1.5 text-sm text-gray-700 align-top whitespace-nowrap max-w-xs truncate">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? <span className="text-gray-300 text-xs">—</span>)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
