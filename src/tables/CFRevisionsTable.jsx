import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, NumberInput, SelectInput, TextAreaInput, CheckboxInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const REV_TYPE_OPTS = [
  { value: 'INITIAL', label: 'Initial' },
  { value: 'REVISED', label: 'Revised' },
  { value: 'REBASELINE', label: 'Rebaseline' },
];

const BLANK = {
  cf_id: '', revision_number: 1, revision_type: 'INITIAL',
  description: '', created_by: '', created_date: null,
  estimated_cost: null, is_current: false,
};

export default function CFRevisionsTable() {
  const { cfRevisions, changeFlags } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const cfOpts = changeFlags.data.map(c => ({ value: c.id, label: `${c.id} – ${c.title}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.cf_id) return;
    if (editing) cfRevisions.update(form.id, form);
    else cfRevisions.add({ ...form, id: cfRevisions.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this CF revision?')) cfRevisions.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',              label: 'ID',         width: 100 },
    { key: 'cf_id',           label: 'CF',         width: 90 },
    { key: 'revision_number', label: 'Rev #',      width: 55 },
    { key: 'revision_type',   label: 'Type',       render: v => <Badge value={v} /> },
    { key: 'description',     label: 'Description' },
    { key: 'created_by',      label: 'Created By' },
    { key: 'created_date',    label: 'Created' },
    { key: 'estimated_cost',  label: 'Est. Cost',  render: v => v != null ? `$${Number(v).toLocaleString()}` : '—' },
    { key: 'is_current',      label: 'Current',    render: v => v ? <span className="text-xs font-medium text-green-600">Yes</span> : <span className="text-xs text-gray-300">No</span> },
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
        <span className="text-xs text-gray-500">{cfRevisions.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add CF Revision
        </button>
      </div>
      <DataGrid columns={columns} data={cfRevisions.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add CF Revision'}>
        <div className="flex flex-col gap-4">
          <FormField label="Change Flag" required><SelectInput value={form.cf_id} onChange={f('cf_id')} options={cfOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Revision #"><NumberInput value={form.revision_number} onChange={f('revision_number')} /></FormField>
            <FormField label="Type"><SelectInput value={form.revision_type} onChange={f('revision_type')} options={REV_TYPE_OPTS} /></FormField>
          </div>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <FormField label="Created By"><TextInput value={form.created_by} onChange={f('created_by')} /></FormField>
          <FormField label="Created Date"><DateInput value={form.created_date} onChange={f('created_date')} /></FormField>
          <FormField label="Estimated Cost ($)"><NumberInput value={form.estimated_cost} onChange={f('estimated_cost')} /></FormField>
          <CheckboxInput value={form.is_current} onChange={f('is_current')} label="Is Current Revision" />
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
