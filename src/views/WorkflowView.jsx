import { useState, useMemo } from 'react';
import {
  GitBranch, Flag, FileText, CheckCircle2, XCircle, AlertTriangle,
  Clock, Lock, ChevronDown, ChevronRight, ShieldAlert, Layers,
  Receipt, ArrowRight, Box, User, Calendar, DollarSign, Info,
} from 'lucide-react';
import { useStore } from '../store/DataStore';

// ─── Status badge helpers ─────────────────────────────────────────────────────
function StatusPill({ value, size = 'sm' }) {
  if (!value) return null;
  const base = 'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide';
  const sz = size === 'xs' ? 'text-[10px] px-1.5 py-px' : 'text-xs px-2 py-0.5';
  const map = {
    APPROVED:           'bg-green-100 text-green-700',
    APPROVED_AT_RISK:   'bg-orange-100 text-orange-700',
    REJECTED:           'bg-red-100 text-red-600',
    REJECTED_INCOMPLETE:'bg-red-200 text-red-800',
    PENDING:            'bg-gray-100 text-gray-600',
    CONVERTED_TO_CRN:   'bg-blue-100 text-blue-700',
    CONVERTED_TO_CO:    'bg-purple-100 text-purple-700',
    OPEN:               'bg-yellow-100 text-yellow-700',
    IN_PROGRESS:        'bg-blue-100 text-blue-700',
    COMPLETE:           'bg-green-100 text-green-700',
    PLANNED:            'bg-gray-100 text-gray-500',
    ISSUED:             'bg-violet-100 text-violet-700',
    SYNCED:             'bg-green-50 text-green-600',
    ERROR:              'bg-red-100 text-red-600',
    PENDING_CLIENT:     'bg-amber-100 text-amber-700',
    DELTA:              'bg-teal-100 text-teal-700',
    REBASELINE:         'bg-indigo-100 text-indigo-700',
  };
  const cls = map[value] ?? 'bg-gray-100 text-gray-500';
  return <span className={`${base} ${sz} ${cls}`}>{value.replace(/_/g, ' ')}</span>;
}

function LockIcon({ locked }) {
  return locked
    ? <Lock size={11} className="text-gray-400 shrink-0" title="Locked" />
    : null;
}

function WarningBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-orange-50 border border-orange-200 text-orange-600 rounded px-1.5 py-px font-medium">
      <AlertTriangle size={9} /> {label}
    </span>
  );
}

function KeyVal({ label, value, mono = false }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-px">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-xs text-gray-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon, color = 'border-gray-200', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-lg overflow-hidden ${color}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {icon}{title}
        </span>
        {open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Cost breakdown by CoA category ──────────────────────────────────────────
function CostBreakdown({ lineItems, coa }) {
  if (!lineItems.length) return <span className="text-xs text-gray-400">No line items.</span>;

  const byType = lineItems.reduce((acc, li) => {
    acc[li.line_item_type] = (acc[li.line_item_type] || 0) + (Number(li.total_revenue_gbp) || 0);
    return acc;
  }, {});

  const byCat = lineItems.reduce((acc, li) => {
    const code = li.code_of_accounts_ref ? coa.codesByBooking[li.code_of_accounts_ref] : null;
    const key = code ? `${code.cost_category}` : '—';
    acc[key] = (acc[key] || 0) + (Number(li.total_revenue_gbp) || 0);
    return acc;
  }, {});

  const total = lineItems.reduce((sum, li) => sum + (Number(li.total_revenue_gbp) || 0), 0);
  const fmt = v => '$' + Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const typeColors = {
    LABOUR: 'bg-blue-50 text-blue-700 border-blue-200',
    MATERIAL: 'bg-green-50 text-green-700 border-green-200',
    PLANT: 'bg-orange-50 text-orange-700 border-orange-200',
    SUBCONTRACT: 'bg-purple-50 text-purple-700 border-purple-200',
    SUNDRY: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-3">
      {/* By type */}
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">By Type</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(byType).map(([type, val]) => (
            <span key={type} className={`text-xs px-2 py-0.5 rounded border font-medium ${typeColors[type] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {type} <span className="font-mono">{fmt(val)}</span>
            </span>
          ))}
          <span className="text-xs px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold">
            TOTAL <span className="font-mono">{fmt(total)}</span>
          </span>
        </div>
      </div>
      {/* By CoA category */}
      {Object.keys(byCat).length > 1 || (Object.keys(byCat).length === 1 && !Object.keys(byCat)[0].startsWith('—')) ? (
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">By CoA Category</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <span key={cat} className="text-xs px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 font-medium">
                Cat {cat} <span className="font-mono">{fmt(val)}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {/* Line items table */}
      <div className="overflow-x-auto rounded border border-gray-200 mt-1">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">#</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Type</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">Short Text</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-2 py-1.5 text-right text-[10px] font-medium text-gray-500 uppercase">Total</th>
              <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase">CoA</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map(li => {
              const code = li.code_of_accounts_ref ? coa.codesByBooking[li.code_of_accounts_ref] : null;
              return (
                <tr key={li.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-1 text-gray-400 tabular-nums">{li.line_number}</td>
                  <td className="px-2 py-1">
                    <span className={`text-[10px] font-medium px-1 py-px rounded ${
                      li.line_item_type === 'LABOUR' ? 'text-blue-700 bg-blue-50' :
                      li.line_item_type === 'MATERIAL' ? 'text-green-700 bg-green-50' :
                      li.line_item_type === 'PLANT' ? 'text-orange-700 bg-orange-50' :
                      li.line_item_type === 'SUBCONTRACT' ? 'text-purple-700 bg-purple-50' :
                      'text-gray-600 bg-gray-50'
                    }`}>{li.line_item_type}</span>
                  </td>
                  <td className="px-2 py-1 text-gray-700 max-w-xs truncate" title={li.short_text}>{li.short_text}</td>
                  <td className="px-2 py-1 text-right text-gray-500 tabular-nums">{li.quantity} {li.unit_of_measure}</td>
                  <td className="px-2 py-1 text-right text-gray-500 tabular-nums">{li.unit_rate_gbp != null ? '$' + Number(li.unit_rate_gbp).toLocaleString() : '—'}</td>
                  <td className="px-2 py-1 text-right font-mono text-gray-700 font-medium">{li.total_revenue_gbp != null ? '$' + Number(li.total_revenue_gbp).toLocaleString() : '—'}</td>
                  <td className="px-2 py-1">
                    {code ? (
                      <span className="text-[10px] font-mono text-amber-600" title={code.cost_element_description}>{code.booking_code}</span>
                    ) : li.code_of_accounts_ref ? (
                      <span className="text-[10px] font-mono text-amber-500">{li.code_of_accounts_ref}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Op Revision card ─────────────────────────────────────────────────────────
function OpRevisionCard({ rev, operations, lineItems, coa }) {
  const op = operations.data.find(o => o.id === rev.operation_id);
  const revLineItems = lineItems.data.filter(li => li.op_revision_id === rev.id);
  const [open, setOpen] = useState(false);

  const statusColor =
    rev.status === 'APPROVED' ? 'border-l-green-400' :
    rev.status === 'APPROVED_AT_RISK' ? 'border-l-orange-400' :
    rev.status === 'REJECTED' ? 'border-l-red-300' :
    'border-l-gray-200';

  return (
    <div className={`border border-gray-200 border-l-2 ${statusColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left gap-2"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-gray-700">{rev.id}</span>
            <StatusPill value={rev.status} size="xs" />
            <StatusPill value={rev.revision_type} size="xs" />
            {rev.is_locked && <LockIcon locked />}
            {rev.approved_at_risk && <WarningBadge label="AAR" />}
            {rev.overbook_flag && <WarningBadge label="OVERBOOK" />}
            {rev.stale_baseline_warning && <WarningBadge label="STALE BASELINE" />}
          </div>
          <p className="text-xs text-gray-600 truncate">{rev.description}</p>
          {op && <p className="text-[10px] text-gray-400">Op: <span className="font-medium text-gray-500">{op.id} – {op.short_description}</span></p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs font-mono font-semibold text-gray-700">${Number(rev.cost_delta).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">{rev.hours_delta}h delta</p>
          </div>
          {open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-3 my-3">
            <KeyVal label="Revision #" value={rev.revision_number} />
            <KeyVal label="Created by" value={rev.created_by} />
            <KeyVal label="Created" value={rev.created_date} />
            <KeyVal label="Lock owner ref" value={rev.lock_owner_reference} mono />
            <KeyVal label="Baseline ref" value={rev.baseline_reference_used} mono />
            <KeyVal label="Actual hours" value={rev.actual_hours != null ? rev.actual_hours + 'h' : null} />
          </div>
          {rev.approved_at_risk_justification && (
            <div className="text-xs bg-orange-50 border border-orange-200 rounded p-2 mb-3 flex items-start gap-2">
              <ShieldAlert size={13} className="text-orange-500 shrink-0 mt-px" />
              <span className="text-orange-800"><span className="font-medium">AAR Justification:</span> {rev.approved_at_risk_justification}</span>
            </div>
          )}
          {revLineItems.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">Line Items ({revLineItems.length})</p>
              <CostBreakdown lineItems={revLineItems} coa={coa} />
            </div>
          )}
          {revLineItems.length === 0 && (
            <p className="text-xs text-gray-400 italic">No line items linked to this revision.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CRN Revision card ────────────────────────────────────────────────────────
function CrnRevisionCard({ rev, operationRevisions, operations, lineItems, coa, approvals }) {
  const [open, setOpen] = useState(rev.is_current);
  const opRevs = operationRevisions.data.filter(r => r.crn_revision_id === rev.id);
  const revApprovals = approvals.data.filter(a => a.entity_id === rev.id);

  const borderColor =
    rev.internal_status === 'APPROVED' ? 'border-l-green-500' :
    rev.internal_status === 'APPROVED_AT_RISK' ? 'border-l-orange-400' :
    rev.internal_status === 'REJECTED' ? 'border-l-red-400' :
    'border-l-gray-200';

  return (
    <div className={`border border-gray-200 border-l-4 ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left gap-2"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-gray-800">{rev.id}</span>
            <span className="text-[10px] text-gray-500">Rev {rev.revision_number}</span>
            <StatusPill value={rev.internal_status} size="xs" />
            {rev.is_current && <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-600 rounded px-1.5 py-px font-semibold">CURRENT</span>}
            {rev.is_locked && <LockIcon locked />}
            {rev.exception_state && <WarningBadge label={rev.exception_state.replace(/_/g,' ')} />}
          </div>
          <p className="text-xs text-gray-600 truncate">{rev.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs font-mono font-semibold text-gray-700">${Number(rev.total_value).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">{rev.revision_type}</p>
          </div>
          {open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-3 gap-3 pt-3">
            <KeyVal label="Submitted by" value={rev.submitted_by} />
            <KeyVal label="Submitted" value={rev.submitted_at ? rev.submitted_at.slice(0,10) : rev.created_date} />
            <KeyVal label="Reviewed by" value={rev.reviewed_by} />
            <KeyVal label="Reviewed date" value={rev.reviewed_date} />
            <KeyVal label="Sync state" value={rev.sync_state} mono />
            <KeyVal label="Locked by" value={rev.locked_by} />
          </div>
          {rev.review_outcome_notes && (
            <div className="text-xs bg-gray-50 border border-gray-200 rounded p-2 flex items-start gap-2">
              <Info size={12} className="text-gray-400 shrink-0 mt-px" />
              <span className="text-gray-600">{rev.review_outcome_notes}</span>
            </div>
          )}
          {rev.baseline_shift_context && (
            <div className="text-xs bg-orange-50 border border-orange-200 rounded p-2 flex items-start gap-2">
              <AlertTriangle size={12} className="text-orange-500 shrink-0 mt-px" />
              <span className="text-orange-700">{rev.baseline_shift_context}</span>
            </div>
          )}
          {/* Approvals */}
          {revApprovals.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Approvals</p>
              <div className="space-y-1">
                {revApprovals.map(apr => (
                  <div key={apr.id} className="flex items-center gap-2 text-xs">
                    {apr.outcome === 'APPROVED' ? <CheckCircle2 size={12} className="text-green-500 shrink-0" /> :
                     apr.outcome === 'REJECTED' ? <XCircle size={12} className="text-red-400 shrink-0" /> :
                     <Clock size={12} className="text-amber-400 shrink-0" />}
                    <span className="text-gray-600">{apr.approved_by}</span>
                    <span className="text-gray-400">·</span>
                    <StatusPill value={apr.outcome} size="xs" />
                    {apr.authority_reference && <span className="font-mono text-[10px] text-gray-400">{apr.authority_reference}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Op Revisions */}
          {opRevs.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1.5">Op Revisions ({opRevs.length})</p>
              <div className="space-y-2">
                {opRevs.map(r => (
                  <OpRevisionCard key={r.id} rev={r} operations={operations} lineItems={lineItems} coa={coa} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CRN panel ────────────────────────────────────────────────────────────────
function CrnPanel({ crn, crnRevisions, operationRevisions, operations, lineItems, changeOrders, approvals, quoteSnapshots, coa }) {
  const [open, setOpen] = useState(true);
  const revs = crnRevisions.data.filter(r => r.crn_id === crn.id).sort((a, b) => a.revision_number - b.revision_number);
  const co = changeOrders.data.find(c => c.crn_id === crn.id);
  const qs = quoteSnapshots.data.filter(q => revs.some(r => r.id === q.crn_revision_id));

  const statusColor =
    crn.status === 'CONVERTED_TO_CO' ? 'border-purple-200 bg-purple-50/30' :
    crn.status === 'REJECTED_INCOMPLETE' ? 'border-red-200 bg-red-50/30' :
    'border-gray-200 bg-white';

  return (
    <div className={`border rounded-xl overflow-hidden ${statusColor}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-4 py-3 hover:bg-black/5 transition-colors text-left gap-2"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <GitBranch size={14} className="text-purple-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-800">{crn.id}</span>
            <StatusPill value={crn.status} />
            {qs.length > 0 && (
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-600 rounded px-1.5 py-px font-medium flex items-center gap-1">
                <Receipt size={9} /> {qs.length} QS
              </span>
            )}
          </div>
          <p className="text-xs text-gray-700 font-medium">{crn.title}</p>
          <p className="text-xs text-gray-400 truncate">{crn.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {co && (
            <span className="text-[10px] bg-violet-50 border border-violet-200 text-violet-700 rounded px-2 py-0.5 font-semibold flex items-center gap-1">
              <FileText size={9} /> {co.id}
            </span>
          )}
          {open ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-4 pt-3">
          <div className="grid grid-cols-3 gap-3">
            <KeyVal label="Submitted by" value={crn.submitted_by} />
            <KeyVal label="Submitted" value={crn.submitted_date} />
            <KeyVal label="Linked CO" value={crn.linked_co_id} mono />
          </div>

          {/* Change Order summary */}
          {co && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-start gap-3">
              <FileText size={14} className="text-violet-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-violet-800">{co.id} — {co.co_number}</span>
                  <StatusPill value={co.status} size="xs" />
                </div>
                <p className="text-xs text-violet-700 truncate">{co.title}</p>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  <span className="text-xs text-violet-600 flex items-center gap-1"><DollarSign size={10} />${Number(co.total_value).toLocaleString()}</span>
                  <span className="text-xs text-violet-600 flex items-center gap-1"><User size={10} />{co.issued_by}</span>
                  <span className="text-xs text-violet-600 flex items-center gap-1"><Calendar size={10} />{co.issued_date}</span>
                  {co.client_reference && <span className="text-xs font-mono text-violet-500">{co.client_reference}</span>}
                </div>
                {co.notes && <p className="text-[10px] text-violet-500 mt-1">{co.notes}</p>}
              </div>
            </div>
          )}

          {/* Quote Snapshots */}
          {qs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-[10px] text-amber-600 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1"><Receipt size={10} /> Quote Snapshots</p>
              <div className="space-y-1">
                {qs.map(q => (
                  <div key={q.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-amber-700 font-medium">{q.id}</span>
                    <ArrowRight size={10} className="text-amber-400" />
                    <span className="text-amber-600 font-mono">{q.crn_revision_id}</span>
                    <span className="text-amber-500">·</span>
                    <span className="font-mono font-semibold text-amber-700">${Number(q.total_value).toLocaleString()}</span>
                    <span className="text-amber-400">{q.snapshot_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revisions */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-2">CRN Revisions ({revs.length})</p>
            <div className="space-y-2">
              {revs.map(r => (
                <CrnRevisionCard
                  key={r.id} rev={r}
                  operationRevisions={operationRevisions}
                  operations={operations}
                  lineItems={lineItems}
                  coa={coa}
                  approvals={approvals}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Change Flag panel ────────────────────────────────────────────────────────
function ChangeFlagPanel({ cf, cfRevisions, crns, crnRevisions, operationRevisions, operations, lineItems, changeOrders, approvals, quoteSnapshots, resolutionTasks, coa }) {
  const [open, setOpen] = useState(true);
  const cfRevs = cfRevisions.data.filter(r => r.cf_id === cf.id).sort((a, b) => a.revision_number - b.revision_number);
  const linkedCrns = crns.data.filter(c => c.cf_id === cf.id);
  const tasks = resolutionTasks.data.filter(t => linkedCrns.some(c => c.id === t.entity_id));

  const statusColor =
    cf.status === 'CONVERTED_TO_CRN' ? 'border-blue-200 bg-blue-50/30' :
    cf.status === 'OPEN' ? 'border-yellow-200 bg-yellow-50/20' :
    'border-gray-200';

  return (
    <div className={`border-2 rounded-xl overflow-hidden ${statusColor}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-4 py-3 hover:bg-black/5 transition-colors text-left gap-2"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Flag size={14} className="text-yellow-500 shrink-0" />
            <span className="text-sm font-bold text-gray-800">{cf.id}</span>
            <StatusPill value={cf.status} />
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-px rounded font-medium">{cf.change_type.replace(/_/g,' ')}</span>
            {tasks.length > 0 && <WarningBadge label={`${tasks.length} resolution task${tasks.length > 1 ? 's' : ''}`} />}
          </div>
          <p className="text-sm text-gray-700 font-semibold">{cf.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <span className="text-[10px] text-gray-400">{cf.raised_date}</span>
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-4 pt-3">
          <div className="grid grid-cols-3 gap-3">
            <KeyVal label="Raised by" value={cf.raised_by} />
            <KeyVal label="Raised date" value={cf.raised_date} />
            <KeyVal label="Linked CRN" value={cf.linked_crn_id} mono />
          </div>
          <p className="text-xs text-gray-500">{cf.description}</p>

          {/* CF Revisions summary */}
          {cfRevs.length > 0 && (
            <SectionCard title={`CF Revisions (${cfRevs.length})`} icon={<Layers size={12} />} color="border-blue-100" defaultOpen={false}>
              <div className="space-y-2">
                {cfRevs.map(cfr => (
                  <div key={cfr.id} className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded p-2 border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-semibold text-gray-600">{cfr.id}</span>
                      <span className="text-gray-400">Rev {cfr.revision_number}</span>
                      <StatusPill value={cfr.revision_type} size="xs" />
                      {cfr.is_current && <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-600 rounded px-1.5 py-px">CURRENT</span>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-gray-700">${Number(cfr.estimated_cost).toLocaleString()}</span>
                      <span className="text-gray-400 ml-1 text-[10px]">{cfr.created_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Resolution Tasks */}
          {tasks.length > 0 && (
            <SectionCard title={`Resolution Tasks (${tasks.length})`} icon={<AlertTriangle size={12} className="text-orange-500" />} color="border-orange-200">
              <div className="space-y-2">
                {tasks.map(t => (
                  <div key={t.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-orange-700">{t.id}</span>
                      <StatusPill value={t.status} size="xs" />
                      <span className="text-[10px] text-orange-600 bg-white border border-orange-200 rounded px-1.5 py-px">{t.task_type.replace(/_/g,' ')}</span>
                    </div>
                    <p className="text-xs font-medium text-orange-800 mb-1">{t.title}</p>
                    <p className="text-xs text-orange-700">{t.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-[10px] text-orange-500 flex items-center gap-1"><User size={9} />{t.assigned_to}</span>
                      <span className="text-[10px] text-orange-500 flex items-center gap-1"><Calendar size={9} />Due {t.due_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Linked CRNs */}
          {linkedCrns.length > 0 && (
            <div className="space-y-3">
              {linkedCrns.map(c => (
                <CrnPanel
                  key={c.id}
                  crn={c}
                  crnRevisions={crnRevisions}
                  operationRevisions={operationRevisions}
                  operations={operations}
                  lineItems={lineItems}
                  changeOrders={changeOrders}
                  approvals={approvals}
                  quoteSnapshots={quoteSnapshots}
                  coa={coa}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orphan CRNs (no CF parent) ───────────────────────────────────────────────
function OrphanCrnSection({ crns, crnRevisions, operationRevisions, operations, lineItems, changeOrders, approvals, quoteSnapshots, resolutionTasks, coa }) {
  const orphans = crns.data.filter(c => !c.cf_id);
  if (!orphans.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Box size={14} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-600">CRNs without Change Flag</h3>
      </div>
      <div className="space-y-3">
        {orphans.map(crn => (
          <CrnPanel
            key={crn.id}
            crn={crn}
            crnRevisions={crnRevisions}
            operationRevisions={operationRevisions}
            operations={operations}
            lineItems={lineItems}
            changeOrders={changeOrders}
            approvals={approvals}
            quoteSnapshots={quoteSnapshots}
            coa={coa}
          />
        ))}
      </div>
      {/* Resolution tasks for orphan CRNs */}
      {orphans.map(crn => {
        const tasks = resolutionTasks.data.filter(t => t.entity_id === crn.id || operationRevisions.data.filter(r => r.crn_revision_id && crnRevisions.data.find(rv => rv.crn_id === crn.id && rv.id === r.crn_revision_id)).some(r => r.id === t.entity_id));
        if (!tasks.length) return null;
        return (
          <div key={crn.id + '-tasks'} className="mt-3 space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-orange-700">{t.id}</span>
                  <StatusPill value={t.status} size="xs" />
                  <span className="text-[10px] text-orange-600 bg-white border border-orange-200 rounded px-1.5 py-px">{t.task_type.replace(/_/g,' ')}</span>
                </div>
                <p className="text-xs font-medium text-orange-800 mb-1">{t.title}</p>
                <p className="text-xs text-orange-700">{t.description}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-[10px] text-orange-500 flex items-center gap-1"><User size={9} />{t.assigned_to}</span>
                  <span className="text-[10px] text-orange-500 flex items-center gap-1"><Calendar size={9} />Due {t.due_date}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Project summary bar ──────────────────────────────────────────────────────
function ProjectSummaryBar({ project, changeFlags, changeOrders, resolutionTasks, crnRevisions, operationRevisions }) {
  const flags = changeFlags.data.filter(f => f.project_id === project.id);
  const orders = changeOrders.data.filter(co => co.project_id === project.id);
  const tasks = resolutionTasks.data.filter(t => t.project_id === project.id);
  const openTasks = tasks.filter(t => t.status === 'OPEN');

  const totalCO = orders.reduce((sum, co) => sum + (Number(co.total_value) || 0), 0);
  const aarRevs = operationRevisions.data.filter(r => r.approved_at_risk);
  const stalRevs = operationRevisions.data.filter(r => r.stale_baseline_warning);

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap gap-4 items-start mb-4">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Project</p>
        <p className="text-sm font-bold text-gray-800">{project.id}</p>
        <p className="text-xs text-gray-500">{project.name}</p>
      </div>
      <div className="w-px bg-gray-200 self-stretch" />
      <div className="flex flex-wrap gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{flags.length}</p>
          <p className="text-[10px] text-gray-400">Change Flags</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-700">{orders.length}</p>
          <p className="text-[10px] text-gray-400">Change Orders</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-indigo-700">${(totalCO/1000).toFixed(0)}k</p>
          <p className="text-[10px] text-gray-400">CO Total</p>
        </div>
        {aarRevs.length > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">{aarRevs.length}</p>
            <p className="text-[10px] text-gray-400">AAR Revisions</p>
          </div>
        )}
        {openTasks.length > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">{openTasks.length}</p>
            <p className="text-[10px] text-gray-400">Open Tasks</p>
          </div>
        )}
        {stalRevs.length > 0 && (
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{stalRevs.length}</p>
            <p className="text-[10px] text-gray-400">Stale Baseline</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Workflow View ───────────────────────────────────────────────────────
export default function WorkflowView() {
  const {
    projects, changeFlags, cfRevisions, crns, crnRevisions,
    operationRevisions, operations, lineItems,
    changeOrders, approvals, quoteSnapshots, quoteSnapshotLines,
    resolutionTasks, auditEvents, coa,
  } = useStore();

  const [selectedProject, setSelectedProject] = useState(projects.data[0]?.id ?? null);

  const project = projects.data.find(p => p.id === selectedProject);
  const projectFlags = changeFlags.data.filter(f => f.project_id === selectedProject);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Prototype inspection banner */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-2 flex items-center gap-2">
        <Info size={12} className="text-slate-400 shrink-0" />
        <span className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Lineage &amp; Traceability Inspection View</span>
          {' '}— Read-only prototype for tracing Change Flag → CRN → Op Revision → Line Item relationships.
          Not a production workflow screen. No actions, approvals, or submissions here.
        </span>
      </div>
      {/* Project selector strip */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Project:</span>
        {projects.data.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProject(p.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              selectedProject === p.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {p.id} — {p.name}
          </button>
        ))}
      </div>

      <div className="px-6 py-5 space-y-5 max-w-5xl">
        {project && (
          <ProjectSummaryBar
            project={project}
            changeFlags={changeFlags}
            changeOrders={changeOrders}
            resolutionTasks={resolutionTasks}
            crnRevisions={crnRevisions}
            operationRevisions={operationRevisions}
          />
        )}

        {/* Change Flag → CRN → Op Rev → Line Items chain */}
        {projectFlags.length > 0 ? (
          <div className="space-y-4">
            {projectFlags.map(cf => (
              <ChangeFlagPanel
                key={cf.id}
                cf={cf}
                cfRevisions={cfRevisions}
                crns={crns}
                crnRevisions={crnRevisions}
                operationRevisions={operationRevisions}
                operations={operations}
                lineItems={lineItems}
                changeOrders={changeOrders}
                approvals={approvals}
                quoteSnapshots={quoteSnapshots}
                resolutionTasks={resolutionTasks}
                coa={coa}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <GitBranch size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No change flags for this project.</p>
          </div>
        )}

        {/* Orphan CRNs */}
        <OrphanCrnSection
          crns={crns}
          crnRevisions={crnRevisions}
          operationRevisions={operationRevisions}
          operations={operations}
          lineItems={lineItems}
          changeOrders={changeOrders}
          approvals={approvals}
          quoteSnapshots={quoteSnapshots}
          resolutionTasks={resolutionTasks}
          coa={coa}
        />
      </div>
    </div>
  );
}
