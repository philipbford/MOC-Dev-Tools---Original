import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const APPROVAL_TYPE_OPTS = [
  { value: 'CLIENT_APPROVAL',   label: 'Client Approval' },
  { value: 'APPROVED_AT_RISK',  label: 'Approved-at-Risk' },
  { value: 'PM_APPROVAL',       label: 'PM Approval' },
  { value: 'INTERNAL_REVIEW',   label: 'Internal Review' },
];

const OUTCOME_OPTS = [
  { value: 'APPROVED',          label: 'Approved' },
  { value: 'REJECTED',          label: 'Rejected' },
  { value: 'APPROVED_AT_RISK',  label: 'Approved-at-Risk' },
  { value: 'PENDING',           label: 'Pending' },
];

const ENTITY_TYPE_OPTS = [
  { value: 'CRNRevision',        label: 'CRN Revision' },
  { value: 'OperationRevision',  label: 'Operation Revision' },
  { value: 'ChangeOrder',        label: 'Change Order' },
  { value: 'CRN',                label: 'CRN' },
];

const BLANK = {
  project_id: '', entity_type: 'CRNRevision', entity_id: '',
  approval_type: 'CLIENT_APPROVAL', approved_by: '', approved_at: null,
  authority_reference: null, outcome: 'APPROVED', notes: null,
};

export default function ApprovalsTable() {
  const { approvals, projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.entity_id) return;
    if (editing) approvals.update(form.id, form);
    else approvals.add({ ...form, id: approvals.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this approval record?')) approvals.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',                 label: 'ID',           width: 90 },
    { key: 'project_id',         label: 'Project',      width: 90 },
    { key: 'entity_type',        label: 'Entity Type' },
    { key: 'entity_id',          label: 'Entity ID',    width: 100 },
    { key: 'approval_type',      label: 'Type' },
    { key: 'outcome',            label: 'Outcome',      render: v => <Badge value={v} /> },
    { key: 'approved_by',        label: 'By' },
    { key: 'approved_at',        label: 'At' },
    { key: 'authority_reference',label: 'Auth Ref' },
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
        <span className="text-xs text-gray-500">{approvals.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Approval
        </button>
      </div>
      <DataGrid columns={columns} data={approvals.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add Approval'}>
        <div className="flex flex-col gap-4">
          <FormField label="Project"><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Entity Type" required><SelectInput value={form.entity_type} onChange={f('entity_type')} options={ENTITY_TYPE_OPTS} /></FormField>
            <FormField label="Entity ID" required><TextInput value={form.entity_id} onChange={f('entity_id')} placeholder="CRNR-001" /></FormField>
          </div>
          <FormField label="Approval Type"><SelectInput value={form.approval_type} onChange={f('approval_type')} options={APPROVAL_TYPE_OPTS} /></FormField>
          <FormField label="Outcome"><SelectInput value={form.outcome} onChange={f('outcome')} options={OUTCOME_OPTS} /></FormField>
          <FormField label="Approved By"><TextInput value={form.approved_by} onChange={f('approved_by')} /></FormField>
          <FormField label="Approved At"><TextInput value={form.approved_at} onChange={f('approved_at')} placeholder="2025-04-18T14:30:00Z" /></FormField>
          <FormField label="Authority Reference"><TextInput value={form.authority_reference} onChange={f('authority_reference')} /></FormField>
          <FormField label="Notes"><TextAreaInput value={form.notes} onChange={f('notes')} rows={2} /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
