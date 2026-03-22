import { useState } from 'react';
import { Activity, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const EVENT_TYPE_OPTS = [
  { value: 'STATUS_CHANGE',    label: 'Status Change' },
  { value: 'SUBMITTED',        label: 'Submitted' },
  { value: 'LOCKED',           label: 'Locked' },
  { value: 'APPROVED',         label: 'Approved' },
  { value: 'REJECTED',         label: 'Rejected' },
  { value: 'APPROVED_AT_RISK', label: 'Approved-at-Risk' },
  { value: 'ISSUED',           label: 'Issued' },
  { value: 'SYNC',             label: 'Sync' },
  { value: 'SYSTEM',           label: 'System' },
];

const ENTITY_TYPE_OPTS = [
  { value: 'ChangeFlag',        label: 'Change Flag' },
  { value: 'CRN',               label: 'CRN' },
  { value: 'CRNRevision',       label: 'CRN Revision' },
  { value: 'OperationRevision', label: 'Operation Revision' },
  { value: 'ChangeOrder',       label: 'Change Order' },
  { value: 'Project',           label: 'Project' },
];

const BLANK = {
  project_id: '', entity_type: 'CRNRevision', entity_id: '',
  event_type: 'STATUS_CHANGE', event_description: '',
  actor: '', occurred_at: null, metadata: null,
};

const EVENT_COLOUR = {
  STATUS_CHANGE:    'bg-blue-100 text-blue-700',
  SUBMITTED:        'bg-yellow-100 text-yellow-700',
  LOCKED:           'bg-gray-200 text-gray-700',
  APPROVED:         'bg-green-100 text-green-700',
  REJECTED:         'bg-red-100 text-red-700',
  APPROVED_AT_RISK: 'bg-orange-100 text-orange-700',
  ISSUED:           'bg-indigo-100 text-indigo-700',
  SYSTEM:           'bg-gray-100 text-gray-500',
  SYNC:             'bg-teal-100 text-teal-700',
};

export default function AuditEventsTable() {
  const { auditEvents, projects } = useStore();
  const [devOverride, setDevOverride] = useState(false);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }));

  function openAppend() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.event_description) return;
    if (editing) auditEvents.update(form.id, form);
    else auditEvents.add({ ...form, id: auditEvents.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) {
    if (confirm('Delete this audit event? This is a destructive dev-only action — audit records should normally be immutable.')) {
      auditEvents.remove(id);
    }
  }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const sortedEvents = [...auditEvents.data].sort((a, b) =>
    (a.occurred_at ?? '').localeCompare(b.occurred_at ?? '')
  );

  // Read-only columns (no actions)
  const readOnlyColumns = [
    { key: 'id',                label: 'ID',          width: 90 },
    { key: 'occurred_at',       label: 'Timestamp',   width: 190 },
    { key: 'project_id',        label: 'Project',     width: 90 },
    { key: 'entity_type',       label: 'Entity Type', width: 140 },
    { key: 'entity_id',         label: 'Entity',      width: 110 },
    {
      key: 'event_type', label: 'Event',
      render: v => {
        const cls = EVENT_COLOUR[v] ?? 'bg-gray-100 text-gray-600';
        return <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${cls}`}>{v}</span>;
      },
    },
    { key: 'event_description', label: 'Description' },
    { key: 'actor',             label: 'Actor',       width: 120 },
  ];

  // Override columns include edit/delete actions
  const overrideColumns = [
    ...readOnlyColumns,
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <span className="inline-flex gap-2">
          <button onClick={e => { e.stopPropagation(); openEdit(row); }} className="text-amber-500 hover:text-amber-700" title="Edit (dev override)"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} className="text-red-400 hover:text-red-600" title="Delete (dev override)"><Trash2 size={13} /></button>
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* System event log notice */}
      <div className="flex items-start gap-2 mb-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
        <Activity size={13} className="text-gray-400 shrink-0 mt-px" />
        <div className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-700">System Event Log</span> — Append-only chronological record of lifecycle events.
          Audit events are immutable in production. Records are ordered by <code className="text-xs bg-gray-100 px-1 rounded">occurred_at</code>.
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <span className="text-xs text-gray-500">{auditEvents.data.length} events</span>
        <div className="flex items-center gap-2">
          {/* Dev override toggle */}
          <label className={`inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded border cursor-pointer select-none transition-colors ${
            devOverride
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
          }`}>
            <AlertTriangle size={11} className={devOverride ? 'text-amber-500' : 'text-gray-300'} />
            Dev Override
            <input
              type="checkbox"
              className="sr-only"
              checked={devOverride}
              onChange={e => setDevOverride(e.target.checked)}
            />
            <span className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${devOverride ? 'bg-amber-400' : 'bg-gray-200'}`}>
              <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${devOverride ? 'translate-x-4' : ''}`} />
            </span>
          </label>

          {/* Append new event — always available (append-only is legitimate) */}
          <button
            onClick={openAppend}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-700 text-gray-100 px-3 py-1.5 rounded hover:bg-gray-600"
          >
            <Plus size={13} /> Append Event
          </button>
        </div>
      </div>

      {/* Dev override warning banner */}
      {devOverride && (
        <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
          <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-px" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Dev Override is ON.</span> Edit and delete actions are now enabled on audit event records.
            These operations are destructive and would not be permitted in a production audit log.
          </p>
        </div>
      )}

      <DataGrid
        columns={devOverride ? overrideColumns : readOnlyColumns}
        data={sortedEvents}
        onRowClick={setSelected}
        selectedId={selected?.id}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Edit ${form.id} (Dev Override)` : 'Append Audit Event'}
        width="max-w-xl"
      >
        <div className="flex flex-col gap-4">
          {editing && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded p-2">
              <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">Editing an existing audit event — dev override only.</p>
            </div>
          )}
          <FormField label="Project"><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Entity Type" required><SelectInput value={form.entity_type} onChange={f('entity_type')} options={ENTITY_TYPE_OPTS} /></FormField>
            <FormField label="Entity ID" required><TextInput value={form.entity_id} onChange={f('entity_id')} /></FormField>
          </div>
          <FormField label="Event Type"><SelectInput value={form.event_type} onChange={f('event_type')} options={EVENT_TYPE_OPTS} /></FormField>
          <FormField label="Description" required><TextAreaInput value={form.event_description} onChange={f('event_description')} rows={2} /></FormField>
          <FormField label="Actor"><TextInput value={form.actor} onChange={f('actor')} /></FormField>
          <FormField label="Occurred At (ISO)"><TextInput value={form.occurred_at} onChange={f('occurred_at')} placeholder="2025-04-18T14:30:00Z" /></FormField>
          <FormField label="Metadata (JSON)"><TextAreaInput value={form.metadata} onChange={f('metadata')} rows={2} placeholder='{"key":"value"}' /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">
              {editing ? 'Save (Dev Override)' : 'Append Event'}
            </button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
