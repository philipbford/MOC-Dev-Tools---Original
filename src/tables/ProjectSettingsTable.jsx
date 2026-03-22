import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const SETTING_KEY_OPTS = [
  { value: 'APPROVER_PM',             label: 'APPROVER_PM' },
  { value: 'APPROVER_CLIENT_REP',     label: 'APPROVER_CLIENT_REP' },
  { value: 'CRN_REPLY_PERIOD_DAYS',   label: 'CRN_REPLY_PERIOD_DAYS' },
  { value: 'AAR_MAX_VALUE',           label: 'AAR_MAX_VALUE' },
  { value: 'DISTRIBUTION_LIST_CRN',   label: 'DISTRIBUTION_LIST_CRN' },
  { value: 'ESCALATION_CONTACT',      label: 'ESCALATION_CONTACT' },
  { value: 'CONTRACT_CURRENCY',       label: 'CONTRACT_CURRENCY' },
  { value: 'CUSTOM',                  label: 'CUSTOM (free text key)' },
];

const BLANK = {
  project_id: '', setting_key: 'APPROVER_PM', setting_value: '',
  description: '', updated_by: '', updated_at: null,
};

export default function ProjectSettingsTable() {
  const { projectSettings, projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.setting_key || !form.setting_value) return;
    if (editing) projectSettings.update(form.id, form);
    else projectSettings.add({ ...form, id: projectSettings.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this setting?')) projectSettings.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',            label: 'ID',        width: 80 },
    { key: 'project_id',    label: 'Project',   width: 90 },
    { key: 'setting_key',   label: 'Key' },
    { key: 'setting_value', label: 'Value' },
    { key: 'description',   label: 'Description' },
    { key: 'updated_by',    label: 'Updated By' },
    { key: 'updated_at',    label: 'Updated At' },
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
        <span className="text-xs text-gray-500">{projectSettings.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Setting
        </button>
      </div>
      <DataGrid columns={columns} data={projectSettings.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add Project Setting'}>
        <div className="flex flex-col gap-4">
          <FormField label="Project" required><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <FormField label="Setting Key" required>
            <SelectInput value={form.setting_key} onChange={f('setting_key')} options={SETTING_KEY_OPTS} />
          </FormField>
          <FormField label="Setting Value" required><TextInput value={form.setting_value} onChange={f('setting_value')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} rows={2} /></FormField>
          <FormField label="Updated By"><TextInput value={form.updated_by} onChange={f('updated_by')} /></FormField>
          <FormField label="Updated At (ISO)"><TextInput value={form.updated_at} onChange={f('updated_at')} placeholder="2025-03-01T00:00:00Z" /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
