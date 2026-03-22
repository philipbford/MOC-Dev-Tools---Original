import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import Badge from '../components/Badge';
import { FormField, TextInput, DateInput, SelectInput, TextAreaInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const STATUS_OPTS = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETE', label: 'Complete' },
];
const WORK_CATEGORY_OPTS = [
  { value: 'Additional', label: 'Additional' },
  { value: 'Discovery', label: 'Discovery' },
  { value: 'Original', label: 'Original' },
];
const ORDER_TYPE_OPTS = [
  { value: 'Construction', label: 'Construction' },
  { value: 'Variation', label: 'Variation' },
  { value: 'Maintenance', label: 'Maintenance' },
];

const BLANK = {
  project_id: '', work_order_number: '', work_order_description: '',
  allocation_charge_type: 'Measure', work_requestor: '', priority: 'Normal',
  trade_superintendent: '', main_work_centre: '', tag_numbers: null,
  order_type: 'Construction', work_type: null, department: null,
  planner: null, client: null, purchase_order: null, nav_element_4ps: null,
  target_start_date: null, target_finish_date: null, work_category: 'Additional',
  plant: null, area: null, work_location: null,
  functional_location: null, functional_location_description: null,
  status: 'PLANNED', actual_start: null, actual_finish: null,
};

export default function WorkOrdersTable() {
  const { workOrders, projects } = useStore();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const projectOpts = projects.data.map(p => ({ value: p.id, label: p.id + ' - ' + p.name }));

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleSave() {
    if (!form.work_order_description) return;
    if (editing) workOrders.update(form.id, form);
    else workOrders.add({ ...form, id: workOrders.nextId() });
    setDrawerOpen(false);
  }
  function handleDelete(id) { if (confirm('Delete this work order?')) workOrders.remove(id); }
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: 'id',                   label: 'ID',         width: 90 },
    { key: 'project_id',           label: 'Project',    width: 90 },
    { key: 'work_order_number',    label: 'WO #' },
    { key: 'work_order_description', label: 'Description' },
    { key: 'order_type',           label: 'Type' },
    { key: 'work_category',        label: 'Category' },
    { key: 'plant',                label: 'Plant' },
    { key: 'area',                 label: 'Area' },
    { key: 'status',               label: 'Status',     render: v => <Badge value={v} /> },
    { key: 'target_start_date',    label: 'Tgt Start' },
    { key: 'target_finish_date',   label: 'Tgt Finish' },
    { key: 'purchase_order',       label: 'PO' },
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
        <span className="text-xs text-gray-500">{workOrders.data.length} records</span>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Work Order
        </button>
      </div>
      <DataGrid columns={columns} data={workOrders.data} onRowClick={setSelected} selectedId={selected?.id} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit ' + form.id : 'Add Work Order'} width="max-w-2xl">
        <div className="flex flex-col gap-4">
          <FormField label="Project" required><SelectInput value={form.project_id} onChange={f('project_id')} options={projectOpts} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="WO Number"><TextInput value={form.work_order_number} onChange={f('work_order_number')} placeholder="NGE-OWA-001" /></FormField>
            <FormField label="Allocation Charge Type"><TextInput value={form.allocation_charge_type} onChange={f('allocation_charge_type')} /></FormField>
          </div>
          <FormField label="Description" required><TextAreaInput value={form.work_order_description} onChange={f('work_order_description')} rows={2} /></FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Order Type"><SelectInput value={form.order_type} onChange={f('order_type')} options={ORDER_TYPE_OPTS} /></FormField>
            <FormField label="Work Category"><SelectInput value={form.work_category} onChange={f('work_category')} options={WORK_CATEGORY_OPTS} /></FormField>
            <FormField label="Priority"><TextInput value={form.priority} onChange={f('priority')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Work Requestor"><TextInput value={form.work_requestor} onChange={f('work_requestor')} /></FormField>
            <FormField label="Trade Superintendent"><TextInput value={form.trade_superintendent} onChange={f('trade_superintendent')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Main Work Centre"><TextInput value={form.main_work_centre} onChange={f('main_work_centre')} /></FormField>
            <FormField label="Department"><TextInput value={form.department} onChange={f('department')} /></FormField>
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tag Numbers"><TextInput value={form.tag_numbers} onChange={f('tag_numbers')} /></FormField>
            <FormField label="Purchase Order"><TextInput value={form.purchase_order} onChange={f('purchase_order')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Client"><TextInput value={form.client} onChange={f('client')} /></FormField>
            <FormField label="4PS NAV Element"><TextInput value={form.nav_element_4ps} onChange={f('nav_element_4ps')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Target Start"><DateInput value={form.target_start_date} onChange={f('target_start_date')} /></FormField>
            <FormField label="Target Finish"><DateInput value={form.target_finish_date} onChange={f('target_finish_date')} /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Status"><SelectInput value={form.status} onChange={f('status')} options={STATUS_OPTS} /></FormField>
            <FormField label="Actual Start"><DateInput value={form.actual_start} onChange={f('actual_start')} /></FormField>
            <FormField label="Actual Finish"><DateInput value={form.actual_finish} onChange={f('actual_finish')} /></FormField>
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
