import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, NumberInput, SelectInput, TextAreaInput, CheckboxInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const REV_TYPE_OPTS = [
  { value: 'INITIAL', label: 'Initial' },
  { value: 'REVISED', label: 'Revised' },
  { value: 'DELTA', label: 'Delta' },
  { value: 'REBASELINE', label: 'Rebaseline' },
];
const STATUS_OPTS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'APPROVED_AT_RISK', label: 'Approved-at-Risk' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUPERSEDED', label: 'Superseded' },
];
const SYNC_STATUS_OPTS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Synced', label: 'Synced' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Not Required', label: 'Not Required' },
];

const BLANK = {
  operation_id: '', cf_revision_id: null, crn_revision_id: null,
  revision_type: 'DELTA', revision_number: 1, description: '',
  hours_delta: null, cost_delta: null, created_by: '', created_date: null,
  is_current: false, status: 'DRAFT', sync_status: 'Pending', is_locked: false, lock_owner_reference: null,
  approved_at_risk: false, approved_at_risk_by: null, approved_at_risk_at: null,
  approved_at_risk_justification: null, overbook_flag: false, effective_headroom_hours: null,
  actual_hours: null, closed_as_consolidated: false, consolidated_by_rebaseline: null,
  baseline_reference_used: null, stale_baseline_warning: false,
};

function validateParent(form) {
  const hasCFR = !!form.cf_revision_id;
  const hasCRNR = !!form.crn_revision_id;
  if (hasCFR && hasCRNR) return 'Only one parent (CF Revision OR CRN Revision) can be set.';
  if (!hasCFR && !hasCRNR) return 'Exactly one parent (CF Revision or CRN Revision) must be set.';
  return null;
}

export default function OperationRevisionsTable() {
  const { operationRevisions, operations, cfRevisions, crnRevisions } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [validationError, setValidationError] = useState(null);

  const opOpts = operations.data.map(o => ({ value: o.id, label: o.id + ' - ' + o.short_description }));
  const cfrOpts = cfRevisions.data.map(r => ({ value: r.id, label: r.id + ' (' + r.cf_id + ' Rev' + r.revision_number + ')' }));
  const crnrOpts = crnRevisions.data.map(r => ({ value: r.id, label: r.id + ' (' + r.crn_id + ' Rev' + r.revision_number + ')' }));

  function openAdd() { setForm(BLANK); setEditing(false); setValidationError(null); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setValidationError(null); setDrawerOpen(true); }
  function handleSave() {
    const err = validateParent(form);
    if (err) { setValidationError(err); return; }
    if (!form.operation_id) { setValidationError('Operation is required.'); return; }
    setValidationError(null);
    if (editing) operationRevisions.update(form.id, form);
    else operationRevisions.add({ ...form, id: operationRevisions.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete?')) operationRevisions.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',              label: 'ID',            width: 100 },
    { key: 'operation_id',    label: 'Operation',     width: 90 },
    { key: 'cf_revision_id',  label: 'CF Rev',        width: 90 },
    { key: 'crn_revision_id', label: 'CRN Rev',       width: 90 },
    { key: 'revision_type',   label: 'Type',          render: v => <Badge value={v} /> },
    { key: 'revision_number', label: 'Rev #',         width: 50 },
    { key: 'status',          label: 'Status',        render: v => <Badge value={v} /> },
    { key: 'sync_status',     label: 'Sync Status',   render: v => {
      const colors = { Synced: 'text-green-600', Pending: 'text-amber-600', Failed: 'text-red-500', 'Not Required': 'text-gray-400' };
      return <span className={`text-xs font-medium ${colors[v] ?? 'text-gray-400'}`}>{v ?? '—'}</span>;
    }},
    { key: 'description',     label: 'Description' },
    { key: 'hours_delta',     label: 'Hrs D',         width: 60 },
    { key: 'cost_delta',      label: 'Cost D',        render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'actual_hours',    label: 'Act. Hrs',      width: 65 },
    { key: 'effective_headroom_hours', label: 'Headroom', width: 75 },
    { key: 'approved_at_risk',label: 'AAR',           render: v => v ? <span className="text-xs text-orange-600 font-medium">AAR</span> : <span className="text-gray-300 text-xs">—</span> },
    { key: 'overbook_flag',   label: 'Overbook',      render: v => v ? <span className="text-xs text-red-600 font-medium">YES</span> : <span className="text-gray-300 text-xs">—</span> },
    { key: 'stale_baseline_warning', label: 'Stale', render: v => v ? <AlertTriangle size={12} className="text-amber-500" /> : <span className="text-gray-300 text-xs">—</span> },
    { key: 'is_current',      label: 'Current',       render: v => v ? <span className="text-xs font-medium text-green-600">Yes</span> : <span className="text-xs text-gray-300">No</span> },
    { key: 'is_locked',       label: 'Locked',        render: v => v ? <span className="text-xs text-amber-600">Locked</span> : <span className="text-xs text-gray-300">Open</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <span className="inline-flex gap-2">
          <button onClick={e => { e.stopPropagation(); openEdit(row); }} className="text-gray-400 hover:text-blue-600"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
          <AlertTriangle size={11} />
          Rule: exactly one of cf_revision_id / crn_revision_id must be set per record
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{operationRevisions.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Op Revision
        </button>
      </div>
      <DataGrid columns={columns} data={operationRevisions.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Operation Revision'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded flex items-center gap-2">
              <AlertTriangle size={12} /> {validationError}
            </div>
          )}
          <FormField label="Operation" required><SelectInput value={form.operation_id} onChange={f('operation_id')} options={opOpts} /></FormField>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-3">
            <p className="text-xs font-semibold text-amber-800">Parent — set exactly one</p>
            <FormField label="CF Revision ID (nullable)">
              <SelectInput value={form.cf_revision_id} onChange={v => setForm(p => ({ ...p, cf_revision_id: v, crn_revision_id: v ? null : p.crn_revision_id }))} options={cfrOpts} placeholder="— none —" />
            </FormField>
            <FormField label="CRN Revision ID (nullable)">
              <SelectInput value={form.crn_revision_id} onChange={v => setForm(p => ({ ...p, crn_revision_id: v, cf_revision_id: v ? null : p.cf_revision_id }))} options={crnrOpts} placeholder="— none —" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Revision #"><NumberInput value={form.revision_number} onChange={f('revision_number')} /></FormField>
            <FormField label="Type"><SelectInput value={form.revision_type} onChange={f('revision_type')} options={REV_TYPE_OPTS} /></FormField>
          </div>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
            <FormField label="Sync Status"><SelectInput value={form.sync_status} onChange={f('sync_status')} options={SYNC_STATUS_OPTS} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hours Delta"><NumberInput value={form.hours_delta} onChange={f('hours_delta')} /></FormField>
            <FormField label="Cost Delta"><NumberInput value={form.cost_delta} onChange={f('cost_delta')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Actual Hours"><NumberInput value={form.actual_hours} onChange={f('actual_hours')} /></FormField>
            <FormField label="Effective Headroom Hrs"><NumberInput value={form.effective_headroom_hours} onChange={f('effective_headroom_hours')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Created By"><TextInput value={form.created_by} onChange={f('created_by')} /></FormField>
            <FormField label="Created Date"><TextInput value={form.created_date} onChange={f('created_date')} placeholder="YYYY-MM-DD" /></FormField>
          </div>
          <FormField label="Lock Owner Reference"><TextInput value={form.lock_owner_reference} onChange={f('lock_owner_reference')} /></FormField>
          <div className="bg-orange-50 border border-orange-200 rounded p-3 space-y-3">
            <p className="text-xs font-semibold text-orange-800">Approved-at-Risk Fields</p>
            <FormField label="AAR Approved By"><TextInput value={form.approved_at_risk_by} onChange={f('approved_at_risk_by')} /></FormField>
            <FormField label="AAR Approved At (ISO)"><TextInput value={form.approved_at_risk_at} onChange={f('approved_at_risk_at')} /></FormField>
            <FormField label="AAR Justification"><TextAreaInput value={form.approved_at_risk_justification} onChange={f('approved_at_risk_justification')} rows={2} /></FormField>
          </div>
          <FormField label="Baseline Reference Used"><TextInput value={form.baseline_reference_used} onChange={f('baseline_reference_used')} /></FormField>
          <FormField label="Consolidated By Rebaseline"><TextInput value={form.consolidated_by_rebaseline} onChange={f('consolidated_by_rebaseline')} /></FormField>
          <div className="flex flex-wrap gap-4">
            <CheckboxInput value={form.is_current} onChange={f('is_current')} label="Is Current" />
            <CheckboxInput value={form.is_locked} onChange={f('is_locked')} label="Is Locked" />
            <CheckboxInput value={form.approved_at_risk} onChange={f('approved_at_risk')} label="Approved-at-Risk" />
            <CheckboxInput value={form.overbook_flag} onChange={f('overbook_flag')} label="Overbook Flag" />
            <CheckboxInput value={form.closed_as_consolidated} onChange={f('closed_as_consolidated')} label="Closed as Consolidated" />
            <CheckboxInput value={form.stale_baseline_warning} onChange={f('stale_baseline_warning')} label="Stale Baseline Warning" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
