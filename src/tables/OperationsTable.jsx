import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, NumberInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETE', label: 'Complete' },
];

const BLANK = {
  work_order_id: '', line_number: null, operation_number: '', variation: null,
  short_description: '', operation_type: '', trade: '', phase: null,
  client_work_centre: null, priority: null, purchase_order: null,
  plant: null, area: null, work_location: null,
  functional_location: null, functional_location_description: null,
  cost_category: null, discipline: null, cost_element: null, booking_code: null,
  status: 'PLANNED', planned_hours: null, actual_hours: null,
};

export default function OperationsTable() {
  const { operations, workOrders, coa } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const woOpts = workOrders.data.map(w => ({ value: w.id, label: w.id + ' - ' + w.work_order_number }));

  // CoA dropdown options
  const catOpts = useMemo(() => coa.categories.data.map(c => ({
    value: c.cost_category, label: `${c.cost_category} — ${c.description}`,
  })), [coa.categories.data]);

  const discOpts = useMemo(() => coa.disciplines.data.map(d => ({
    value: d.discipline_code, label: `${d.discipline_code} — ${d.description}`,
  })), [coa.disciplines.data]);

  // Booking codes filtered by current category + discipline selection
  const bookingOpts = useMemo(() => {
    let rows = coa.codes.data;
    if (form.cost_category) rows = rows.filter(r => r.cost_category === form.cost_category);
    if (form.discipline)    rows = rows.filter(r => r.discipline_code === form.discipline);
    return rows.map(r => ({ value: r.booking_code, label: `${r.booking_code} — ${r.cost_element_description}` }));
  }, [coa.codes.data, form.cost_category, form.discipline]);

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.short_description) return;
    if (editing) operations.update(form.id, form);
    else operations.add({ ...form, id: operations.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this operation?')) operations.remove(id); }

  const f = (k) => (v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // When booking_code is selected, auto-fill cost_element from CoA
      if (k === 'booking_code' && v) {
        const code = coa.codesByBooking[v];
        if (code) {
          next.cost_element = code.cost_element;
          if (!next.cost_category) next.cost_category = code.cost_category;
          if (!next.discipline)    next.discipline = code.discipline_code;
        }
      }
      // When category/discipline changes, clear booking_code if it no longer matches
      if ((k === 'cost_category' || k === 'discipline') && next.booking_code) {
        const code = coa.codesByBooking[next.booking_code];
        if (code) {
          if (k === 'cost_category' && code.cost_category !== v) next.booking_code = null;
          if (k === 'discipline'    && code.discipline_code !== v) next.booking_code = null;
        }
      }
      return next;
    });
  };

  const columns = [
    { key: 'id',               label: 'ID',          width: 90 },
    { key: 'work_order_id',    label: 'Work Order',  width: 90 },
    { key: 'line_number',      label: 'Line #',      width: 55 },
    { key: 'operation_number', label: 'Op #',        width: 90 },
    { key: 'short_description',label: 'Description' },
    { key: 'trade',            label: 'Trade',       width: 80 },
    { key: 'phase',            label: 'Phase',       width: 60 },
    // CoA helper columns
    {
      key: 'cost_category', label: 'Cat', width: 45,
      render: v => v ? (
        <span className="text-xs font-medium tabular-nums text-amber-700">{v}</span>
      ) : <span className="text-gray-300">—</span>,
    },
    {
      key: 'discipline', label: 'Disc.', width: 55,
      render: v => v ? (
        <span className="text-xs font-mono text-amber-600">{v}</span>
      ) : <span className="text-gray-300">—</span>,
    },
    {
      key: 'booking_code', label: 'Booking', width: 95,
      render: (v, row) => {
        const code = v ? coa.codesByBooking[v] : null;
        return v ? (
          <span className="text-xs font-mono text-gray-700" title={code?.cost_element_description ?? ''}>{v}</span>
        ) : <span className="text-gray-300">—</span>;
      },
    },
    {
      key: '_coa_desc', label: 'CoA Description', width: 180,
      render: (_, row) => {
        const code = row.booking_code ? coa.codesByBooking[row.booking_code] : null;
        return code ? (
          <span className="text-xs text-gray-400 truncate" title={code.cost_element_description}>{code.cost_element_description}</span>
        ) : null;
      },
    },
    { key: 'status',        label: 'Status',  render: v => <Badge value={v} /> },
    { key: 'planned_hours', label: 'Pl. Hrs', width: 65 },
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
        <span className="text-xs text-gray-500">{operations.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Operation
        </button>
      </div>
      <DataGrid columns={columns} data={operations.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Operation'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <FormField label="Work Order" required><SelectInput value={form.work_order_id} onChange={f('work_order_id')} options={woOpts} /></FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Line #"><NumberInput value={form.line_number} onChange={f('line_number')} /></FormField>
            <FormField label="Operation Number"><TextInput value={form.operation_number} onChange={f('operation_number')} placeholder="C-CE001" /></FormField>
            <FormField label="Variation"><TextInput value={form.variation} onChange={f('variation')} placeholder="V001" /></FormField>
          </div>
          <FormField label="Short Description" required><TextInput value={form.short_description} onChange={f('short_description')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Operation Type"><TextInput value={form.operation_type} onChange={f('operation_type')} /></FormField>
            <FormField label="Trade"><TextInput value={form.trade} onChange={f('trade')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phase"><TextInput value={form.phase} onChange={f('phase')} /></FormField>
            <FormField label="Client Work Centre"><TextInput value={form.client_work_centre} onChange={f('client_work_centre')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Plant"><TextInput value={form.plant} onChange={f('plant')} /></FormField>
            <FormField label="Area"><TextInput value={form.area} onChange={f('area')} /></FormField>
          </div>
          <FormField label="Work Location"><TextAreaInput value={form.work_location} onChange={f('work_location')} rows={1} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Functional Location"><TextInput value={form.functional_location} onChange={f('functional_location')} /></FormField>
            <FormField label="FL Description"><TextInput value={form.functional_location_description} onChange={f('functional_location_description')} /></FormField>
          </div>
          {/* ── CoA Reference ─────────────────────────────────── */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col gap-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Code of Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cost Category">
                <SelectInput value={form.cost_category} onChange={f('cost_category')} options={catOpts} placeholder="— select —" />
              </FormField>
              <FormField label="Discipline">
                <SelectInput value={form.discipline} onChange={f('discipline')} options={discOpts} placeholder="— select —" />
              </FormField>
            </div>
            <FormField label="Booking Code">
              <SelectInput value={form.booking_code} onChange={f('booking_code')} options={bookingOpts} placeholder="— select booking code —" />
            </FormField>
            {form.booking_code && coa.codesByBooking[form.booking_code] && (
              <div className="text-xs text-amber-800 bg-amber-100 rounded px-2 py-1">
                <span className="font-medium">{form.booking_code}</span>
                {' — '}{coa.codesByBooking[form.booking_code].cost_element_description}
              </div>
            )}
            <FormField label="Cost Element (auto-filled)">
              <TextInput value={form.cost_element ?? ''} onChange={f('cost_element')} placeholder="auto-fills from booking code" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority"><TextInput value={form.priority} onChange={f('priority')} /></FormField>
            <FormField label="Purchase Order"><TextInput value={form.purchase_order} onChange={f('purchase_order')} /></FormField>
          </div>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Planned Hours"><NumberInput value={form.planned_hours} onChange={f('planned_hours')} /></FormField>
            <FormField label="Actual Hours"><NumberInput value={form.actual_hours} onChange={f('actual_hours')} /></FormField>
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
