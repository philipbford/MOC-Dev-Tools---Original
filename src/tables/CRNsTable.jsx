import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'APPROVED_AT_RISK', label: 'Approved-at-Risk' },
  { value: 'REJECTED_INCOMPLETE', label: 'Rejected-Incomplete' },
  { value: 'CONVERTED_TO_CO', label: 'Converted to CO' },
];

const BLANK = {
  project_id: '', cf_id: null, title: '', description: '',
  status: 'DRAFT', linked_co_id: null,
  submitted_by: '', submitted_date: null,
};

export default function CRNsTable() {
  const { crns, projects, changeFlags } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));
  const cfOpts = changeFlags.data.map(c => ({ value: c.id, label: `${c.id} – ${c.title}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.title) return;
    if (editing) crns.update(form.id, form);
    else crns.add({ ...form, id: crns.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this CRN?')) crns.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',           label: 'ID',        width: 90 },
    { key: 'project_id',   label: 'Project',   width: 90 },
    { key: 'cf_id',        label: 'CF Link',   width: 90 },
    { key: 'title',        label: 'Title' },
    { key: 'status',       label: 'Status',    render: v => <Badge value={v} /> },
    { key: 'submitted_by', label: 'Submitted By' },
    { key: 'submitted_date', label: 'Submitted' },
    { key: 'linked_co_id', label: 'CO Link',   width: 90 },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <span className="inline-flex gap-2">
          <button onClick={e => { e.stopPropagation(); openEdit(row); }} className="text-gray-400 hover:text-blue-600"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
        </span>
      )
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{crns.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add CRN
        </button>
      </div>
      <DataGrid columns={columns} data={crns.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add CRN'}>
        <div className="flex flex-col gap-4">
          <FormField label="Project" required><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <FormField label="Source Change Flag (optional)"><SelectInput value={form.cf_id} onChange={f('cf_id')} options={cfOpts} placeholder="— none —" /></FormField>
          <FormField label="Title" required><TextInput value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <FormField label="Submitted By"><TextInput value={form.submitted_by} onChange={f('submitted_by')} /></FormField>
          <FormField label="Submitted Date"><DateInput value={form.submitted_date} onChange={f('submitted_date')} /></FormField>
          <FormField label="Linked CO ID"><TextInput value={form.linked_co_id} onChange={f('linked_co_id')} placeholder="CO-XXX" /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
