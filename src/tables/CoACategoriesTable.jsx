import { useState } from 'react';
import { Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import { FormField, TextInput, NumberInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const BLANK = { cost_category: '', description: '' };

export default function CoACategoriesTable() {
  const { coa } = useStore();
  const { data, set } = coa.categories;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleDelete(id) {
    if (confirm('Delete this category?')) set(prev => prev.filter(r => r.id !== id));
  }
  function handleSave() {
    if (!form.cost_category || !form.description) return;
    if (editing) {
      set(prev => prev.map(r => r.id === form.id ? form : r));
    } else {
      set(prev => [...prev, { ...form, id: parseInt(form.cost_category) || Date.now() }]);
    }
    setDrawerOpen(false);
  }
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  // Count codes per category
  const codeCounts = {};
  coa.codes.data.forEach(c => {
    codeCounts[c.cost_category] = (codeCounts[c.cost_category] ?? 0) + 1;
  });

  const columns = [
    { key: 'cost_category', label: 'Cat #',      width: 70 },
    { key: 'description',   label: 'Description' },
    {
      key: '_codes', label: '# Codes', width: 90,
      render: (_, row) => (
        <span className="text-xs text-gray-500 tabular-nums">{codeCounts[row.cost_category] ?? 0}</span>
      ),
    },
    {
      key: '_actions', label: '', width: 60,
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
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-amber-600" />
          <span className="text-xs text-gray-500">{data.length} categories</span>
          <span className="text-xs text-gray-400 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">iPlan CoA reference</span>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Category
        </button>
      </div>
      <DataGrid columns={columns} data={data} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit Category ${form.cost_category}` : 'Add Category'}>
        <div className="flex flex-col gap-4">
          <FormField label="Category Number" required>
            <TextInput value={form.cost_category} onChange={f('cost_category')} placeholder="e.g. 11" />
          </FormField>
          <FormField label="Description" required>
            <TextInput value={form.description} onChange={f('description')} placeholder="e.g. Professional Services" />
          </FormField>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
