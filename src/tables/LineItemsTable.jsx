import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, NumberInput, SelectInput, TextAreaInput, CheckboxInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const TYPE_OPTS = [
  { value: 'LABOUR', label: 'Labour' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'PLANT', label: 'Plant' },
  { value: 'SUBCONTRACT', label: 'Subcontract' },
  { value: 'SUNDRY', label: 'Sundry' },
];
const UOM_OPTS = [
  { value: 'HR', label: 'HR' }, { value: 'DAY', label: 'DAY' }, { value: 'WK', label: 'WK' },
  { value: 'M', label: 'M' }, { value: 'M2', label: 'M2' }, { value: 'M3', label: 'M3' },
  { value: 'T', label: 'T' }, { value: 'KG', label: 'KG' }, { value: 'EA', label: 'EA' },
  { value: 'LS', label: 'LS' }, { value: 'NR', label: 'NR' }, { value: 'LT', label: 'LT' },
];
const REV_TYPE_OPTS = [
  { value: 'Variation', label: 'Variation' },
  { value: 'Labour', label: 'Labour' },
  { value: 'Material Items', label: 'Material Items' },
  { value: 'Bought In Services', label: 'Bought In Services' },
  { value: 'Contract', label: 'Contract' },
];
const SUNDRY_CAT_OPTS = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Misc', label: 'Misc' },
  { value: 'Consumables', label: 'Consumables' },
];

const BLANK = {
  op_revision_id: '', line_number: 1, line_item_type: 'LABOUR', revenue_type: 'Labour',
  short_text: '', additional_details: null, resource_code: null, resource_description: null,
  trade: null, item_number: null, description: null,
  unit_of_measure: 'HR', quantity: null, unit_rate_gbp: null, total_revenue_gbp: null,
  number_of_resources: null, duration: null, total_units: null,
  hire_period: null, rate_unit: null, revenue_per_period_gbp: null, hire_revenue_gbp: null,
  extras_gbp: null, apply_uplift: false,
  supplier: null, subcontractor: null, date_required: null, required_by: null,
  goods_received_date: null, on_hire_date: null, off_hire_date: null, location: null,
  po_number: null, supplier_invoice_number: null, subcontractor_invoice_number: null,
  has_norm: false, manual_override: false, rate_type: null, sundry_category: null,
  issued_to: null, destruct_flag: false,
  // CoA reference
  code_of_accounts_ref: null,
};

export default function LineItemsTable() {
  const { lineItems, operationRevisions, operations, workOrders, projects, crns, crnRevisions, cfRevisions, changeFlags, coa } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filterType, setFilterType] = useState('ALL');

  const opRevOpts = operationRevisions.data.map(r => ({ value: r.id, label: r.id + ' - ' + (r.description || '').slice(0,40) }));

  // Derived context helpers
  function getContext(opRevId) {
    const rev = operationRevisions.data.find(r => r.id === opRevId);
    if (!rev) return {};
    const op = operations.data.find(o => o.id === rev.operation_id);
    const wo = op ? workOrders.data.find(w => w.id === op.work_order_id) : null;
    const prj = wo ? projects.data.find(p => p.id === wo.project_id) : null;
    return { rev, op, wo, prj };
  }

  // Derive parent change reference from an op revision
  function getChangeRef(rev) {
    if (!rev) return null;
    if (rev.crn_revision_id) {
      const crnr = crnRevisions.data.find(r => r.id === rev.crn_revision_id);
      const crn = crnr ? crns.data.find(c => c.id === crnr.crn_id) : null;
      return { ref: rev.crn_revision_id, parent: crnr?.crn_id ?? null, type: 'CRN' };
    }
    if (rev.cf_revision_id) {
      const cfr = cfRevisions.data.find(r => r.id === rev.cf_revision_id);
      const cf = cfr ? changeFlags.data.find(c => c.id === cfr.cf_id) : null;
      return { ref: rev.cf_revision_id, parent: cfr?.cf_id ?? null, type: 'CF' };
    }
    return null;
  }

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.short_text || !form.op_revision_id) return;
    const q = Number(form.quantity) || 0;
    const r = Number(form.unit_rate_gbp) || 0;
    const total = form.total_revenue_gbp != null ? form.total_revenue_gbp : q * r;
    const record = { ...form, total_revenue_gbp: total };
    if (editing) lineItems.update(form.id, record);
    else lineItems.add({ ...record, id: lineItems.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this line item?')) lineItems.remove(id); }
  const f = (k) => (v) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === 'quantity' || k === 'unit_rate_gbp') {
      const q = k === 'quantity' ? Number(v) : Number(next.quantity);
      const r = k === 'unit_rate_gbp' ? Number(v) : Number(next.unit_rate_gbp);
      if (!isNaN(q) && !isNaN(r)) next.total_revenue_gbp = q * r;
    }
    return next;
  });

  // CoA selects — all booking codes, searchable in drawer
  const coaBookingOpts = useMemo(() => coa.codes.data.map(c => ({
    value: c.booking_code,
    label: `${c.booking_code} — ${c.cost_element_description}`,
  })), [coa.codes.data]);

  const filtered = filterType === 'ALL' ? lineItems.data : lineItems.data.filter(li => li.line_item_type === filterType);

  const totals = lineItems.data.reduce((acc, li) => {
    acc.total = (acc.total || 0) + (Number(li.total_revenue_gbp) || 0);
    acc[li.line_item_type] = (acc[li.line_item_type] || 0) + (Number(li.total_revenue_gbp) || 0);
    return acc;
  }, {});

  const columns = [
    { key: 'id',               label: 'ID',        width: 90 },
    { key: 'op_revision_id',   label: 'Op Rev',    width: 100 },
    { key: 'line_number',      label: '#',         width: 40 },
    { key: 'line_item_type',   label: 'Type',      render: v => <Badge value={v} /> },
    { key: 'revenue_type',     label: 'Rev Type',  width: 100 },
    { key: 'short_text',       label: 'Short Text' },
    { key: 'resource_code',    label: 'Res. Code', width: 80 },
    { key: 'trade',            label: 'Trade',     width: 70 },
    { key: 'item_number',      label: 'Item #',    width: 90 },
    { key: 'quantity',         label: 'Qty',       width: 50 },
    { key: 'unit_of_measure',  label: 'UoM',       width: 55 },
    { key: 'unit_rate_gbp',    label: 'Rate',      render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'total_revenue_gbp',label: 'Total',     render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'supplier',         label: 'Supplier' },
    { key: 'subcontractor',    label: 'Subcon' },
    { key: 'po_number',        label: 'PO #' },
    { key: 'has_norm',         label: 'Norm',      render: v => v ? <span className="text-xs text-blue-600">Y</span> : <span className="text-gray-300 text-xs">—</span> },
    // CoA helper columns
    {
      key: 'code_of_accounts_ref', label: 'CoA Ref', width: 95,
      render: v => v ? (
        <span className="text-xs font-mono text-amber-700">{v}</span>
      ) : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: '_coa_cat', label: 'CoA Cat', width: 60,
      render: (_, row) => {
        const code = row.code_of_accounts_ref ? coa.codesByBooking[row.code_of_accounts_ref] : null;
        return code ? (
          <span className="text-xs tabular-nums text-amber-600 font-medium" title={coa.categoryByCode[code.cost_category]}>{code.cost_category}</span>
        ) : null;
      },
    },
    {
      key: '_coa_disc', label: 'CoA Disc', width: 70,
      render: (_, row) => {
        const code = row.code_of_accounts_ref ? coa.codesByBooking[row.code_of_accounts_ref] : null;
        return code ? (
          <span className="text-xs font-mono text-amber-500" title={coa.disciplineByCode[code.discipline_code]}>{code.discipline_code}</span>
        ) : null;
      },
    },
    {
      key: '_coa_desc', label: 'CoA Description', width: 170,
      render: (_, row) => {
        const code = row.code_of_accounts_ref ? coa.codesByBooking[row.code_of_accounts_ref] : null;
        return code ? (
          <span className="text-xs text-gray-400 truncate" title={code.cost_element_description}>{code.cost_element_description}</span>
        ) : null;
      },
    },
    // ── Traceability helper columns (derived, read-only) ──────────────────────
    {
      key: '_trace_project', label: 'Project', width: 90,
      render: (_, row) => {
        const { prj } = getContext(row.op_revision_id);
        return prj
          ? <span className="text-xs font-mono text-indigo-600" title={prj.name}>{prj.id}</span>
          : <span className="text-gray-300 text-xs">—</span>;
      },
    },
    {
      key: '_trace_wo', label: 'Work Order', width: 110,
      render: (_, row) => {
        const { wo } = getContext(row.op_revision_id);
        return wo
          ? <span className="text-xs font-mono text-indigo-500" title={wo.work_order_description}>{wo.work_order_number}</span>
          : <span className="text-gray-300 text-xs">—</span>;
      },
    },
    {
      key: '_trace_op', label: 'Operation', width: 90,
      render: (_, row) => {
        const { op } = getContext(row.op_revision_id);
        return op
          ? <span className="text-xs font-mono text-teal-600" title={op.short_description}>{op.id}</span>
          : <span className="text-gray-300 text-xs">—</span>;
      },
    },
    {
      key: '_trace_change_ref', label: 'Change Ref', width: 105,
      render: (_, row) => {
        const rev = operationRevisions.data.find(r => r.id === row.op_revision_id);
        const chg = getChangeRef(rev);
        return chg
          ? <span className="text-xs font-mono text-purple-600">{chg.ref}</span>
          : <span className="text-gray-300 text-xs">—</span>;
      },
    },
    {
      key: '_trace_change_type', label: 'Change Type', width: 85,
      render: (_, row) => {
        const rev = operationRevisions.data.find(r => r.id === row.op_revision_id);
        const chg = getChangeRef(rev);
        if (!chg) return <span className="text-gray-300 text-xs">—</span>;
        const cls = chg.type === 'CRN'
          ? 'text-purple-600 bg-purple-50 border-purple-200'
          : 'text-blue-600 bg-blue-50 border-blue-200';
        return (
          <span className={`text-[10px] font-semibold border rounded px-1.5 py-px ${cls}`}>
            {chg.type}
            {chg.parent && <span className="ml-1 opacity-70">{chg.parent}</span>}
          </span>
        );
      },
    },
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
      {/* Totals strip */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['LABOUR','MATERIAL','PLANT','SUBCONTRACT','SUNDRY'].map(t => (
          <button key={t} onClick={() => setFilterType(filterType === t ? 'ALL' : t)}
            className={'text-xs rounded px-2 py-1 border transition-colors ' + (filterType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200')}>
            <Badge value={t} /> <span className="ml-1 font-mono">${((totals[t] || 0)).toLocaleString()}</span>
          </button>
        ))}
        <span className="ml-auto text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-1 font-semibold">
          Total: ${((totals.total || 0)).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{filtered.length} / {lineItems.data.length} records {filterType !== 'ALL' && '(filtered)'}</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Line Item
        </button>
      </div>
      <DataGrid columns={columns} data={filtered} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Line Item'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <FormField label="Operation Revision" required><SelectInput value={form.op_revision_id} onChange={f('op_revision_id')} options={opRevOpts} /></FormField>
          {form.op_revision_id && (() => {
            const ctx = getContext(form.op_revision_id);
            return ctx.prj ? (
              <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2 border border-gray-200">
                Project: <strong>{ctx.prj.id}</strong> — WO: <strong>{ctx.wo?.work_order_number}</strong> — Op: <strong>{ctx.op?.operation_number}</strong>
              </div>
            ) : null;
          })()}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Line #"><NumberInput value={form.line_number} onChange={f('line_number')} /></FormField>
            <FormField label="Type"><SelectInput value={form.line_item_type} onChange={f('line_item_type')} options={TYPE_OPTS} /></FormField>
            <FormField label="Revenue Type"><SelectInput value={form.revenue_type} onChange={f('revenue_type')} options={REV_TYPE_OPTS} /></FormField>
          </div>
          <FormField label="Short Text" required><TextInput value={form.short_text} onChange={f('short_text')} /></FormField>
          <FormField label="Additional Details"><TextAreaInput value={form.additional_details} onChange={f('additional_details')} rows={2} /></FormField>
          {(form.line_item_type === 'LABOUR') && (
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Resource Code"><TextInput value={form.resource_code} onChange={f('resource_code')} placeholder="CIV-OP" /></FormField>
              <FormField label="Resource Description"><TextInput value={form.resource_description} onChange={f('resource_description')} /></FormField>
              <FormField label="Trade"><TextInput value={form.trade} onChange={f('trade')} /></FormField>
            </div>
          )}
          {(form.line_item_type === 'MATERIAL' || form.line_item_type === 'PLANT' || form.line_item_type === 'SUBCONTRACT') && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Item Number"><TextInput value={form.item_number} onChange={f('item_number')} /></FormField>
              <FormField label="Description"><TextInput value={form.description} onChange={f('description')} /></FormField>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Quantity"><NumberInput value={form.quantity} onChange={f('quantity')} /></FormField>
            <FormField label="UoM"><SelectInput value={form.unit_of_measure} onChange={f('unit_of_measure')} options={UOM_OPTS} /></FormField>
            <FormField label="Unit Rate (GBP)"><NumberInput value={form.unit_rate_gbp} onChange={f('unit_rate_gbp')} /></FormField>
          </div>
          <FormField label="Total Revenue (GBP)">
            <NumberInput value={form.total_revenue_gbp} onChange={f('total_revenue_gbp')} />
            <span className="text-xs text-gray-400 mt-0.5">Auto-calc from Qty x Rate or override.</span>
          </FormField>
          {(form.line_item_type === 'LABOUR' || form.line_item_type === 'PLANT') && (
            <div className="grid grid-cols-3 gap-3">
              <FormField label="# Resources"><NumberInput value={form.number_of_resources} onChange={f('number_of_resources')} /></FormField>
              <FormField label="Duration"><NumberInput value={form.duration} onChange={f('duration')} /></FormField>
              <FormField label="Total Units"><NumberInput value={form.total_units} onChange={f('total_units')} /></FormField>
            </div>
          )}
          {(form.line_item_type === 'MATERIAL' || form.line_item_type === 'PLANT' || form.line_item_type === 'SUBCONTRACT' || form.line_item_type === 'SUNDRY') && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Extras (GBP)"><NumberInput value={form.extras_gbp} onChange={f('extras_gbp')} /></FormField>
              <FormField label="PO Number"><TextInput value={form.po_number} onChange={f('po_number')} /></FormField>
            </div>
          )}
          {(form.line_item_type === 'PLANT' || form.line_item_type === 'MATERIAL' || form.line_item_type === 'SUNDRY') && (
            <FormField label="Supplier"><TextInput value={form.supplier} onChange={f('supplier')} /></FormField>
          )}
          {form.line_item_type === 'SUBCONTRACT' && (
            <FormField label="Subcontractor"><TextInput value={form.subcontractor} onChange={f('subcontractor')} /></FormField>
          )}
          {form.line_item_type === 'SUNDRY' && (
            <FormField label="Sundry Category"><SelectInput value={form.sundry_category} onChange={f('sundry_category')} options={SUNDRY_CAT_OPTS} /></FormField>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date Required"><TextInput value={form.date_required} onChange={f('date_required')} placeholder="YYYY-MM-DD" /></FormField>
            <FormField label="Location"><TextInput value={form.location} onChange={f('location')} /></FormField>
          </div>
          {/* ── Code of Accounts ──────────────────────────────── */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Code of Accounts Reference</p>
            <FormField label="Booking Code (CoA Ref)">
              <SelectInput
                value={form.code_of_accounts_ref}
                onChange={v => setForm(p => ({ ...p, code_of_accounts_ref: v || null }))}
                options={coaBookingOpts}
                placeholder="— select CoA booking code —"
              />
            </FormField>
            {form.code_of_accounts_ref && coa.codesByBooking[form.code_of_accounts_ref] && (() => {
              const code = coa.codesByBooking[form.code_of_accounts_ref];
              return (
                <div className="text-xs text-amber-800 bg-amber-100 rounded px-2 py-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <span><span className="text-amber-600 font-medium">Category:</span> {code.cost_category} — {code.cost_category_description}</span>
                  <span><span className="text-amber-600 font-medium">Discipline:</span> {code.discipline_code} — {code.discipline_description}</span>
                  <span className="col-span-2"><span className="text-amber-600 font-medium">Description:</span> {code.cost_element_description}</span>
                </div>
              );
            })()}
          </div>
          <div className="flex flex-wrap gap-4">
            <CheckboxInput value={form.has_norm} onChange={f('has_norm')} label="Has Norm" />
            <CheckboxInput value={form.manual_override} onChange={f('manual_override')} label="Manual Override" />
            <CheckboxInput value={form.apply_uplift} onChange={f('apply_uplift')} label="Apply Uplift" />
            {form.line_item_type === 'MATERIAL' && <CheckboxInput value={form.destruct_flag} onChange={f('destruct_flag')} label="Destruct" />}
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
