import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, NumberInput, SelectInput, TextAreaInput, CheckboxInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const INTERNAL_STATUS_OPTS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'APPROVED_AT_RISK', label: 'Approved-at-Risk' },
];
const CLIENT_STATUS_OPTS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'QUERY', label: 'Query' },
];
const SYNC_STATE_OPTS = [
  { value: 'SYNCED', label: 'Synced' },
  { value: 'PENDING_CLIENT', label: 'Pending Client' },
  { value: 'ERROR', label: 'Error' },
  { value: 'OUT_OF_SYNC', label: 'Out of Sync' },
];
const REV_TYPE_OPTS = [
  { value: 'INITIAL', label: 'Initial' },
  { value: 'REVISED', label: 'Revised' },
  { value: 'DELTA', label: 'Delta' },
];

const BLANK = {
  crn_id: '', revision_number: 1, revision_type: 'INITIAL', description: '',
  created_by: '', created_date: null, internal_status: 'DRAFT', client_status: 'PENDING',
  review_outcome_notes: null, reviewed_by: null, reviewed_date: null, total_value: null,
  is_current: false, is_submitted: false, is_locked: false, locked_at: null, locked_by: null,
  submitted_at: null, submitted_by: null, exception_state: null, sync_state: 'PENDING_CLIENT',
  baseline_shift_context: null,
};

export default function CRNRevisionsTable() {
  const { crnRevisions, crns } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const crnOpts = crns.data.map(c => ({ value: c.id, label: c.id + ' - ' + c.title }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.crn_id) return;
    if (editing) crnRevisions.update(form.id, form);
    else crnRevisions.add({ ...form, id: crnRevisions.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this CRN revision?')) crnRevisions.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',              label: 'ID',           width: 100 },
    { key: 'crn_id',          label: 'CRN',          width: 90 },
    { key: 'revision_number', label: 'Rev #',        width: 50 },
    { key: 'revision_type',   label: 'Type',         render: v => <Badge value={v} /> },
    { key: 'internal_status', label: 'Int. Status',  render: v => <Badge value={v} /> },
    { key: 'client_status',   label: 'Cli. Status',  render: v => <Badge value={v} /> },
    { key: 'sync_state',      label: 'Sync',         width: 100 },
    { key: 'exception_state', label: 'Exception',    render: v => v ? <Badge value={v} /> : <span className="text-gray-300 text-xs">—</span> },
    { key: 'description',     label: 'Description' },
    { key: 'created_by',      label: 'Created By' },
    { key: 'created_date',    label: 'Created' },
    { key: 'reviewed_by',     label: 'Reviewed By' },
    { key: 'reviewed_date',   label: 'Reviewed' },
    { key: 'total_value',     label: 'Total',        render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'is_submitted',    label: 'Submitted',    render: v => v ? <span className="text-xs font-medium text-blue-600">Yes</span> : <span className="text-xs text-gray-300">No</span> },
    { key: 'is_current',      label: 'Current',      render: v => v ? <span className="text-xs font-medium text-green-600">Yes</span> : <span className="text-xs text-gray-300">No</span> },
    { key: 'is_locked',       label: 'Locked',       render: v => v ? <span className="text-xs text-amber-600">Locked</span> : <span className="text-xs text-gray-300">Open</span> },
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
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{crnRevisions.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add CRN Revision
        </button>
      </div>
      <DataGrid columns={columns} data={crnRevisions.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add CRN Revision'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <FormField label="CRN" required><SelectInput value={form.crn_id} onChange={f('crn_id')} options={crnOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Revision #"><NumberInput value={form.revision_number} onChange={f('revision_number')} /></FormField>
            <FormField label="Type"><SelectInput value={form.revision_type} onChange={f('revision_type')} options={REV_TYPE_OPTS} /></FormField>
          </div>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Internal Status"><SelectInput value={form.internal_status} onChange={f('internal_status')} options={INTERNAL_STATUS_OPTS} /></FormField>
            <FormField label="Client Status"><SelectInput value={form.client_status} onChange={f('client_status')} options={CLIENT_STATUS_OPTS} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Sync State"><SelectInput value={form.sync_state} onChange={f('sync_state')} options={SYNC_STATE_OPTS} /></FormField>
            <FormField label="Exception State"><TextInput value={form.exception_state} onChange={f('exception_state')} placeholder="APPROVED_AT_RISK etc." /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Created By"><TextInput value={form.created_by} onChange={f('created_by')} /></FormField>
            <FormField label="Created Date"><TextInput value={form.created_date} onChange={f('created_date')} placeholder="YYYY-MM-DD" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Submitted By"><TextInput value={form.submitted_by} onChange={f('submitted_by')} /></FormField>
            <FormField label="Submitted At (ISO)"><TextInput value={form.submitted_at} onChange={f('submitted_at')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Reviewed By"><TextInput value={form.reviewed_by} onChange={f('reviewed_by')} /></FormField>
            <FormField label="Reviewed Date"><TextInput value={form.reviewed_date} onChange={f('reviewed_date')} placeholder="YYYY-MM-DD" /></FormField>
          </div>
          <FormField label="Review Outcome Notes"><TextAreaInput value={form.review_outcome_notes} onChange={f('review_outcome_notes')} rows={2} /></FormField>
          <FormField label="Total Value"><NumberInput value={form.total_value} onChange={f('total_value')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Locked By"><TextInput value={form.locked_by} onChange={f('locked_by')} /></FormField>
            <FormField label="Locked At (ISO)"><TextInput value={form.locked_at} onChange={f('locked_at')} /></FormField>
          </div>
          <FormField label="Baseline Shift Context"><TextAreaInput value={form.baseline_shift_context} onChange={f('baseline_shift_context')} rows={2} /></FormField>
          <div className="flex gap-4 flex-wrap">
            <CheckboxInput value={form.is_submitted} onChange={f('is_submitted')} label="Is Submitted" />
            <CheckboxInput value={form.is_current} onChange={f('is_current')} label="Is Current Revision" />
            <CheckboxInput value={form.is_locked} onChange={f('is_locked')} label="Is Locked" />
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
