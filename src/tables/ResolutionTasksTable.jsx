import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const TASK_TYPE_OPTS = [
  { value: 'REJECTED_INCOMPLETE_RESOLUTION', label: 'Rejected-Incomplete Resolution' },
  { value: 'AAR_DELTA_CLEANUP',              label: 'AAR Delta Cleanup' },
  { value: 'DOUBLE_COUNT_WARNING',           label: 'Double-Count Warning' },
  { value: 'SYNC_ERROR',                     label: 'Sync Error' },
  { value: 'MANUAL',                         label: 'Manual' },
];

const STATUS_OPTS = [
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved' },
  { value: 'CLOSED',      label: 'Closed' },
];

const ENTITY_TYPE_OPTS = [
  { value: 'CRN',               label: 'CRN' },
  { value: 'CRNRevision',       label: 'CRN Revision' },
  { value: 'OperationRevision', label: 'Operation Revision' },
  { value: 'ChangeFlag',        label: 'Change Flag' },
];

const STATUS_COLOUR = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-200 text-gray-500',
};

const BLANK = {
  project_id: '', entity_type: 'CRN', entity_id: '',
  task_type: 'REJECTED_INCOMPLETE_RESOLUTION', title: '', description: '',
  assigned_to: '', raised_by: '', raised_at: null, due_date: null,
  status: 'OPEN', resolution_notes: null, resolved_at: null, resolved_by: null,
};

export default function ResolutionTasksTable() {
  const { resolutionTasks, projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.title) return;
    if (editing) resolutionTasks.update(form.id, form);
    else resolutionTasks.add({ ...form, id: resolutionTasks.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this resolution task?')) resolutionTasks.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const openCount = resolutionTasks.data.filter(t => t.status === 'OPEN').length;

  const columns = [
    { key: 'id',          label: 'ID',        width: 80 },
    { key: 'project_id',  label: 'Project',   width: 90 },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id',   label: 'Entity',    width: 100 },
    { key: 'task_type',   label: 'Task Type' },
    { key: 'title',       label: 'Title' },
    {
      key: 'status', label: 'Status',
      render: v => {
        const cls = STATUS_COLOUR[v] ?? 'bg-gray-100 text-gray-600';
        return <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${cls}`}>{v}</span>;
      },
    },
    { key: 'assigned_to', label: 'Assigned To' },
    { key: 'due_date',    label: 'Due' },
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
      {openCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
            <AlertTriangle size={11} /> {openCount} open resolution {openCount === 1 ? 'task' : 'tasks'} require attention
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{resolutionTasks.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Task
        </button>
      </div>
      <DataGrid columns={columns} data={resolutionTasks.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.id}` : 'Add Resolution Task'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <FormField label="Project"><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Entity Type"><SelectInput value={form.entity_type} onChange={f('entity_type')} options={ENTITY_TYPE_OPTS} /></FormField>
            <FormField label="Entity ID"><TextInput value={form.entity_id} onChange={f('entity_id')} /></FormField>
          </div>
          <FormField label="Task Type"><SelectInput value={form.task_type} onChange={f('task_type')} options={TASK_TYPE_OPTS} /></FormField>
          <FormField label="Title" required><TextInput value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} rows={3} /></FormField>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Assigned To"><TextInput value={form.assigned_to} onChange={f('assigned_to')} /></FormField>
            <FormField label="Raised By"><TextInput value={form.raised_by} onChange={f('raised_by')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Raised At (ISO)"><TextInput value={form.raised_at} onChange={f('raised_at')} /></FormField>
            <FormField label="Due Date"><DateInput value={form.due_date} onChange={f('due_date')} /></FormField>
          </div>
          <FormField label="Resolution Notes"><TextAreaInput value={form.resolution_notes} onChange={f('resolution_notes')} rows={2} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Resolved At (ISO)"><TextInput value={form.resolved_at} onChange={f('resolved_at')} /></FormField>
            <FormField label="Resolved By"><TextInput value={form.resolved_by} onChange={f('resolved_by')} /></FormField>
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
