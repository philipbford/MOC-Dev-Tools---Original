import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, NumberInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CLOSED', label: 'Closed' },
];
const CONTRACT_HIERARCHY_OPTS = [
  { value: 'Single', label: 'Single' },
  { value: 'Sub Project', label: 'Sub Project' },
  { value: 'Main', label: 'Main' },
];
const CONTRACT_TYPE_OPTS = [
  { value: 'Projects', label: 'Projects' },
  { value: 'Framework', label: 'Framework' },
  { value: 'Term', label: 'Term' },
];
const DIVISION_OPTS = [
  { value: 'NORTH', label: 'North' },
  { value: 'SOUTH', label: 'South' },
  { value: 'EAST', label: 'East' },
  { value: 'WEST', label: 'West' },
];

const BLANK = {
  contract_number: '', main_contract_number: null, name: '', description: '',
  client: '', site: '', division: 'NORTH', contract_type: 'Projects',
  contract_hierarchy_type: 'Sub Project', import_reference: null,
  project_manager: '', start_date: null, end_date: null, status: 'ACTIVE', contract_value: null,
};

export default function ProjectsTable() {
  const { projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.name) return;
    if (editing) projects.update(form.id, form);
    else projects.add({ ...form, id: projects.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this project?')) projects.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',                    label: 'ID',          width: 90 },
    { key: 'contract_number',       label: 'Contract #',  width: 110 },
    { key: 'main_contract_number',  label: 'Main #',      width: 100 },
    { key: 'name',                  label: 'Name' },
    { key: 'client',                label: 'Client' },
    { key: 'site',                  label: 'Site' },
    { key: 'division',              label: 'Division',    width: 80 },
    { key: 'contract_hierarchy_type', label: 'Hierarchy', width: 100 },
    { key: 'project_manager',       label: 'PM' },
    { key: 'status',                label: 'Status',      render: v => <Badge value={v} /> },
    { key: 'contract_value',        label: 'Value',       render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'start_date',            label: 'Start' },
    { key: 'end_date',              label: 'End' },
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
        <span className="text-xs text-gray-500">{projects.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Project
        </button>
      </div>
      <DataGrid columns={columns} data={projects.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Project'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contract Number"><TextInput value={form.contract_number} onChange={f('contract_number')} /></FormField>
            <FormField label="Main Contract #"><TextInput value={form.main_contract_number} onChange={f('main_contract_number')} /></FormField>
          </div>
          <FormField label="Name" required><TextInput value={form.name} onChange={f('name')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} rows={2} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Client"><TextInput value={form.client} onChange={f('client')} /></FormField>
            <FormField label="Site"><TextInput value={form.site} onChange={f('site')} /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Division"><SelectInput value={form.division} onChange={f('division')} options={DIVISION_OPTS} /></FormField>
            <FormField label="Contract Type"><SelectInput value={form.contract_type} onChange={f('contract_type')} options={CONTRACT_TYPE_OPTS} /></FormField>
            <FormField label="Hierarchy"><SelectInput value={form.contract_hierarchy_type} onChange={f('contract_hierarchy_type')} options={CONTRACT_HIERARCHY_OPTS} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Import Reference"><TextInput value={form.import_reference} onChange={f('import_reference')} /></FormField>
            <FormField label="Project Manager"><TextInput value={form.project_manager} onChange={f('project_manager')} /></FormField>
          </div>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <FormField label="Contract Value"><NumberInput value={form.contract_value} onChange={f('contract_value')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date"><DateInput value={form.start_date} onChange={f('start_date')} /></FormField>
            <FormField label="End Date"><DateInput value={form.end_date} onChange={f('end_date')} /></FormField>
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
