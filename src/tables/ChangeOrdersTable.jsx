import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ShieldAlert, Info } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, NumberInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'EXECUTED', label: 'Executed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const BLANK = {
  crn_revision_id: '', co_number: '', title: '', description: '',
  status: 'DRAFT', total_value: null, issued_by: '', issued_date: null,
  client_reference: null, notes: null,
  // crn_id and project_id are derived — stored but not independently editable
  crn_id: null, project_id: null,
};

export default function ChangeOrdersTable() {
  const { changeOrders, projects, crns, crnRevisions } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  // Only APPROVED (not APPROVED_AT_RISK) revisions are eligible for a final CO
  const eligibleRevisions = useMemo(() =>
    crnRevisions.data.filter(r => r.internal_status === 'APPROVED'),
    [crnRevisions.data]
  );

  const crnrOpts = eligibleRevisions.map(r => ({
    value: r.id,
    label: r.id + ' — ' + r.crn_id + ' Rev ' + r.revision_number + ' — $' + Number(r.total_value).toLocaleString(),
  }));

  // When crn_revision_id changes, derive crn_id and project_id automatically
  function handleRevisionChange(revId) {
    const rev = crnRevisions.data.find(r => r.id === revId);
    const crn = rev ? crns.data.find(c => c.id === rev.crn_id) : null;
    setForm(p => ({
      ...p,
      crn_revision_id: revId,
      crn_id: rev?.crn_id ?? null,
      project_id: crn?.project_id ?? null,
      total_value: p.total_value ?? rev?.total_value ?? null,
    }));
  }

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.crn_revision_id || !form.title) return;
    if (editing) changeOrders.update(form.id, form);
    else changeOrders.add({ ...form, id: changeOrders.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this change order?')) changeOrders.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',             label: 'ID',           width: 90 },
    { key: 'co_number',      label: 'CO #' },
    { key: 'project_id',     label: 'Project',      width: 90 },
    { key: 'crn_id',         label: 'CRN',          width: 90, render: v => <span className="text-xs text-gray-500 italic">{v ?? '—'}</span> },
    { key: 'crn_revision_id',label: 'CRN Rev',      width: 100, render: v => <span className="text-xs font-mono font-semibold text-purple-700">{v}</span> },
    { key: 'title',          label: 'Title' },
    { key: 'status',         label: 'Status',       render: v => <Badge value={v} /> },
    { key: 'total_value',    label: 'Total',        render: v => v != null ? '$' + Number(v).toLocaleString() : '—' },
    { key: 'issued_by',      label: 'Issued By' },
    { key: 'issued_date',    label: 'Issued Date' },
    { key: 'client_reference', label: 'Client Ref' },
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

  // Derived context from selected revision
  const selectedRev = form.crn_revision_id ? crnRevisions.data.find(r => r.id === form.crn_revision_id) : null;
  const derivedCrn = selectedRev ? crns.data.find(c => c.id === selectedRev.crn_id) : null;
  const derivedProject = derivedCrn ? projects.data.find(p => p.id === derivedCrn.project_id) : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
          <ShieldAlert size={11} />
          COs must reference a client-approved (APPROVED) CRN Revision. APPROVED_AT_RISK revisions are not eligible.
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">
          <Info size={11} />
          crn_id and project_id are derived from the selected CRN Revision.
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{changeOrders.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Change Order
        </button>
      </div>
      <DataGrid columns={columns} data={changeOrders.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Change Order'} width="max-w-2xl">
        <div className="flex flex-col gap-4">

          {/* Primary relationship: CRN Revision (primary editable FK) */}
          <FormField label="CRN Revision (client-approved only)" required>
            <SelectInput value={form.crn_revision_id} onChange={handleRevisionChange} options={crnrOpts} placeholder="— select approved CRN Revision —" />
          </FormField>

          {/* Derived context — read-only display */}
          {selectedRev && (
            <div className="bg-purple-50 border border-purple-200 rounded p-3 space-y-1">
              <p className="text-[10px] text-purple-500 uppercase tracking-wide font-semibold">Derived from selected revision</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">CRN</span>
                  <span className="font-mono font-semibold text-purple-700">{selectedRev.crn_id}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Project</span>
                  <span className="font-mono font-semibold text-purple-700">{derivedCrn?.project_id ?? '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Approved Value</span>
                  <span className="font-mono font-semibold text-purple-700">${Number(selectedRev.total_value).toLocaleString()}</span>
                </div>
              </div>
              {derivedProject && (
                <p className="text-[10px] text-purple-500 pt-0.5">{derivedProject.name}</p>
              )}
            </div>
          )}

          <FormField label="CO Number"><TextInput value={form.co_number} onChange={f('co_number')} placeholder="CO-XXX-YYY" /></FormField>
          <FormField label="Title" required><TextInput value={form.title} onChange={f('title')} /></FormField>
          <FormField label="Description"><TextAreaInput value={form.description} onChange={f('description')} /></FormField>
          <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
          <FormField label="Total Value"><NumberInput value={form.total_value} onChange={f('total_value')} /></FormField>
          <FormField label="Issued By"><TextInput value={form.issued_by} onChange={f('issued_by')} /></FormField>
          <FormField label="Issued Date"><DateInput value={form.issued_date} onChange={f('issued_date')} /></FormField>
          <FormField label="Client Reference"><TextInput value={form.client_reference} onChange={f('client_reference')} /></FormField>
          <FormField label="Notes"><TextAreaInput value={form.notes} onChange={f('notes')} rows={2} /></FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
