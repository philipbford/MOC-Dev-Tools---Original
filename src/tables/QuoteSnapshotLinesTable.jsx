import { useState } from 'react';
import { Plus, Lock, Unlock, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, NumberInput, SelectInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const TYPE_OPTS = [
  { value: 'LABOUR', label: 'Labour' }, { value: 'MATERIAL', label: 'Material' },
  { value: 'PLANT', label: 'Plant' }, { value: 'SUBCONTRACT', label: 'Subcontract' }, { value: 'SUNDRY', label: 'Sundry' },
];
const UOM_OPTS = [
  { value: 'HR', label: 'HR' }, { value: 'DAY', label: 'DAY' }, { value: 'M3', label: 'M3' },
  { value: 'EA', label: 'EA' }, { value: 'LS', label: 'LS' }, { value: 'M2', label: 'M2' },
];

const BLANK = {
  quote_snapshot_id: '', source_line_item_id: null,
  line_number: 1, line_item_type: 'LABOUR',
  short_text: '', quantity: null, unit_of_measure: 'HR', unit_rate_gbp: null, total_revenue_gbp: null,
};

export default function QuoteSnapshotLinesTable() {
  const { quoteSnapshotLines, quoteSnapshots, lineItems } = useStore();
  const [selected, setSelected] = useState(null);
  const [devOverride, setDevOverride] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const qsOpts = quoteSnapshots.data.map(s => ({ value: s.id, label: s.id + ' (' + s.snapshot_date + ')' }));
  const liOpts = lineItems.data.map(li => ({ value: li.id, label: li.id + ' - ' + (li.short_text || '').slice(0,40) }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.quote_snapshot_id) return;
    const q = Number(form.quantity) || 0, r = Number(form.unit_rate_gbp) || 0;
    const total = form.total_revenue_gbp ?? q * r;
    if (editing) quoteSnapshotLines.update(form.id, { ...form, total_revenue_gbp: total });
    else quoteSnapshotLines.add({ ...form, id: quoteSnapshotLines.nextId(), total_revenue_gbp: total });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete?')) quoteSnapshotLines.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',                  label: 'ID',        width: 90 },
    { key: 'quote_snapshot_id',   label: 'Snapshot',  width: 90 },
    { key: 'source_line_item_id', label: 'Source LI', width: 90 },
    { key: 'line_number',         label: '#',         width: 40 },
    { key: 'line_item_type',      label: 'Type',      render: v => <Badge value={v} /> },
    { key: 'short_text',          label: 'Description' },
    { key: 'quantity',            label: 'Qty',       width: 50 },
    { key: 'unit_of_measure',     label: 'UoM',       width: 55 },
    { key: 'unit_rate_gbp',       label: 'Rate',      render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'total_revenue_gbp',   label: 'Total',     render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    ...(devOverride ? [{
      key: '_actions', label: '',
      render: (_, row) => (
        <button onClick={e => { e.stopPropagation(); handleDelete(row.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
      ),
    }] : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
            <Lock size={11} /> Read-only snapshot lines
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
            <Plus size={13} /> Add Line (Dev)
          </button>
        )}
      </div>
      <DataGrid columns={columns} data={quoteSnapshotLines.data} onRowClick={row => { setSelected(row); if (devOverride) openEdit(row); }} selectedId={selected?.id} />

      {devOverride && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={(editing ? 'Edit ' + form.id : 'Add QS Line') + ' [DEV OVERRIDE]'} width="max-w-xl">
          <div className="bg-amber-50 border border-amber-300 rounded px-3 py-2 mb-4 text-xs text-amber-800">
            Dev override active.
          </div>
          <div className="flex flex-col gap-4">
            <FormField label="Quote Snapshot" required><SelectInput value={form.quote_snapshot_id} onChange={f('quote_snapshot_id')} options={qsOpts} /></FormField>
            <FormField label="Source Line Item"><SelectInput value={form.source_line_item_id} onChange={f('source_line_item_id')} options={liOpts} placeholder="— none —" /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Line #"><NumberInput value={form.line_number} onChange={f('line_number')} /></FormField>
              <FormField label="Type"><SelectInput value={form.line_item_type} onChange={f('line_item_type')} options={TYPE_OPTS} /></FormField>
            </div>
            <FormField label="Short Text"><TextInput value={form.short_text} onChange={f('short_text')} /></FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Qty"><NumberInput value={form.quantity} onChange={f('quantity')} /></FormField>
              <FormField label="UoM"><SelectInput value={form.unit_of_measure} onChange={f('unit_of_measure')} options={UOM_OPTS} /></FormField>
              <FormField label="Rate"><NumberInput value={form.unit_rate_gbp} onChange={f('unit_rate_gbp')} /></FormField>
            </div>
            <FormField label="Total"><NumberInput value={form.total_revenue_gbp} onChange={f('total_revenue_gbp')} /></FormField>
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
