import { useState } from 'react';
import { Plus, Lock, Unlock, Eye } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, NumberInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const BLANK = {
  crn_revision_id: '', snapshot_date: null, locked_by: '', total_value: null, notes: '',
};

export default function QuoteSnapshotsTable() {
  const { quoteSnapshots, crnRevisions } = useStore();
  const [selected, setSelected] = useState(null);
  const [devOverride, setDevOverride] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const crnrOpts = crnRevisions.data.map(r => ({ value: r.id, label: r.id + ' - ' + r.crn_id + ' Rev' + r.revision_number }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.crn_revision_id) return;
    if (editing) quoteSnapshots.update(form.id, form);
    else quoteSnapshots.add({ ...form, id: quoteSnapshots.nextId() });
    setDrawerOpen(false);
  }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',              label: 'ID',          width: 90 },
    { key: 'crn_revision_id', label: 'CRN Rev',     width: 100 },
    { key: 'snapshot_date',   label: 'Snapshot Date' },
    { key: 'locked_by',       label: 'Locked By' },
    { key: 'total_value',     label: 'Total',       render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'notes',           label: 'Notes' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
            <Lock size={11} /> Immutable once locked. Read-only in production.
          </span>
          <button
            onClick={() => setDevOverride(v => !v)}
            className={'inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ' + (devOverride ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-500')}>
            {devOverride ? <Unlock size={11} /> : <Lock size={11} />}
            Dev Override: {devOverride ? 'ON' : 'OFF'}
          </button>
        </div>
        {devOverride && (
          <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700">
            <Plus size={13} /> Add Snapshot (Dev)
          </button>
        )}
      </div>
      <DataGrid columns={columns} data={quoteSnapshots.data} onRowClick={row => { setSelected(row); if (devOverride) openEdit(row); }} selectedId={selected?.id} />

      {devOverride && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={(editing ? 'Edit ' + form.id : 'Add Quote Snapshot') + ' [DEV OVERRIDE]'}>
          <div className="bg-amber-50 border border-amber-300 rounded px-3 py-2 mb-4 text-xs text-amber-800">
            Dev override active. Changes here bypass immutability rules.
          </div>
          <div className="flex flex-col gap-4">
            <FormField label="CRN Revision" required><SelectInput value={form.crn_revision_id} onChange={f('crn_revision_id')} options={crnrOpts} /></FormField>
            <FormField label="Snapshot Date"><DateInput value={form.snapshot_date} onChange={f('snapshot_date')} /></FormField>
            <FormField label="Locked By"><TextInput value={form.locked_by} onChange={f('locked_by')} /></FormField>
            <FormField label="Total Value"><NumberInput value={form.total_value} onChange={f('total_value')} /></FormField>
            <FormField label="Notes"><TextAreaInput value={form.notes} onChange={f('notes')} /></FormField>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="flex-1 bg-amber-600 text-white text-sm py-2 rounded hover:bg-amber-700 font-medium">Save (Dev)</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
