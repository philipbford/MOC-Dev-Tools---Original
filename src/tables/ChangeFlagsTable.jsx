import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CONVERTED_TO_CRN', label: 'Converted to CRN' },
  { value: 'CLOSED', label: 'Closed' },
];

const CHANGE_TYPE_OPTS = [
  { value: 'SCOPE_ADDITION', label: 'Scope Addition' },
  { value: 'SCOPE_REDUCTION', label: 'Scope Reduction' },
  { value: 'DESIGN_CHANGE', label: 'Design Change' },
  { value: 'CLIENT_REQUEST', label: 'Client Request' },
  { value: 'SITE_CONDITION', label: 'Site Condition' },
  { value: 'REBASELINE', label: 'Rebaseline' },
];

const BLANK = {
  project_id: '', title: '', description: '', change_type: 'SCOPE_ADDITION',
  raised_by: '', raised_date: null, status: 'DRAFT', linked_crn_id: null,
};

export default function ChangeFlagsTable() {
  const { changeFlags, projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.title) return;
    if (editing) changeFlags.update(form.id, form);
    else changeFlags.add({ ...form, id: changeFlags.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this change flag?')) changeFlags.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',           label: 'ID',          width: 90 },
    { key: 'project_id',   label: 'Project',     width: 90 },
    { key: 'title',        label: 'Title' },
    { key: 'change_type',  label: 'Type',        render: v => <Badge value={v} /> },
    { key: 'status',       label: 'Status',      render: v => <Badge value={v} /> },
    { key: 'raised_by',    label: 'Raised By' },
    { key: 'raised_date',  label: 'Raised' },
    { key: 'linked_crn_id', label: 'CRN Link',  width: 90 },
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
        <span className="text-xs text-gray-500">{changeFlags.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Change Flag
        </button>
      </div>
      <DataGrid columns={columns} data={changeFlags.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add Change Flag'}>
        <div className="flex flex-col gap-4">
          <FormField label="Project" required><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <FormField label="Title" required><TextInput value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <FormField label="Change Type"><SelectInput value={form.change_type} onChange={f('change_type')} options={CHANGE_TYPE_OPTS} /></FormField>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <FormField label="Raised By"><TextInput value={form.raised_by} onChange={f('raised_by')} /></FormField>
          <FormField label="Raised Date"><DateInput value={form.raised_date} onChange={f('raised_date')} /></FormField>
          <FormField label="Linked CRN ID"><TextInput value={form.linked_crn_id} onChange={f('linked_crn_id')} placeholder="CRN-XXX" /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
