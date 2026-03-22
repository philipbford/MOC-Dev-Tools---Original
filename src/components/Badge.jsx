const COLOUR_MAP = {
  // Statuses
  DRAFT: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-blue-100 text-blue-700',
  CONVERTED_TO_CRN: 'bg-purple-100 text-purple-700',
  CONVERTED_TO_CO: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-200 text-gray-500',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  APPROVED_AT_RISK: 'bg-orange-100 text-orange-700',
  REJECTED_INCOMPLETE: 'bg-red-200 text-red-800',
  ISSUED: 'bg-blue-100 text-blue-700',
  EXECUTED: 'bg-green-200 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-500',
  PLANNED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETE: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  // Types
  LABOUR: 'bg-violet-100 text-violet-700',
  MATERIAL: 'bg-teal-100 text-teal-700',
  PLANT: 'bg-amber-100 text-amber-700',
  SUBCONTRACT: 'bg-sky-100 text-sky-700',
  SUNDRY: 'bg-pink-100 text-pink-700',
  // Rev types
  INITIAL: 'bg-gray-100 text-gray-600',
  REVISED: 'bg-blue-100 text-blue-700',
  REBASELINE: 'bg-orange-100 text-orange-700',
  DELTA: 'bg-purple-100 text-purple-700',
};

export default function Badge({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-300 text-xs">—</span>;
  const cls = COLOUR_MAP[value] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}
