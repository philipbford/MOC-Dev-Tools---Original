import { useState } from 'react';
import { Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import { FormField, TextInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const BLANK = { discipline_code: '', description: '' };

export default function CoADisciplinesTable() {
  const { coa } = useStore();
  const { data, set } = coa.disciplines;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filterCat, setFilterCat] = useState('');

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleDelete(id) {
    if (confirm('Delete this discipline?')) set(prev => prev.filter(r => r.id !== id));
  }
  function handleSave() {
    if (!form.discipline_code || !form.description) return;
    if (editing) {
      set(prev => prev.map(r => r.id === form.id ? form : r));
    } else {
      set(prev => [...prev, { ...form, id: form.discipline_code }]);
    }
    setDrawerOpen(false);
  }
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  // Count codes per discipline
  const codeCounts = {};
  coa.codes.data.forEach(c => {
    codeCounts[c.discipline_code] = (codeCounts[c.discipline_code] ?? 0) + 1;
  });

  // Derive which categories each discipline appears in
  const discCategories = {};
  coa.codes.data.forEach(c => {
    if (!discCategories[c.discipline_code]) discCategories[c.discipline_code] = new Set();
    discCategories[c.discipline_code].add(c.cost_category);
  });

  // All unique categories for filter
  const allCats = [...new Set(coa.codes.data.map(c => c.cost_category))].sort((a, b) => +a - +b);

  const filtered = filterCat
    ? data.filter(d => discCategories[d.discipline_code]?.has(filterCat))
    : data;

  const columns = [
    { key: 'discipline_code', label: 'Code',        width: 80 },
    { key: 'description',     label: 'Description' },
    {
      key: '_cats', label: 'Categories', width: 120,
      render: (_, row) => {
        const cats = [...(discCategories[row.discipline_code] ?? [])].sort((a, b) => +a - +b);
        return (
          <span className="text-xs text-gray-400">{cats.join(', ') || '—'}</span>
        );
      },
    },
    {
      key: '_codes', label: '# Codes', width: 80,
      render: (_, row) => (
        <span className="text-xs text-gray-500 tabular-nums">{codeCounts[row.discipline_code] ?? 0}</span>
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
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BookOpen size={14} className="text-amber-600" />
          <span className="text-xs text-gray-500">{data.length} disciplines</span>
          <span className="text-xs text-gray-400 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">iPlan CoA reference</span>
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 bg-white"
          >
            <option value="">All categories</option>
            {allCats.map(cat => (
              <option key={cat} value={cat}>Cat {cat} — {coa.categoryByCode[cat] ?? ''}</option>
            ))}
          </select>
          {filterCat && <span className="text-xs text-gray-400">Showing {filtered.length}</span>}
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Discipline
        </button>
      </div>
      <DataGrid columns={columns} data={filtered} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit Discipline ${form.discipline_code}` : 'Add Discipline'}>
        <div className="flex flex-col gap-4">
          <FormField label="Discipline Code" required>
            <TextInput value={form.discipline_code} onChange={f('discipline_code')} placeholder="e.g. C" />
          </FormField>
          <FormField label="Description" required>
            <TextInput value={form.description} onChange={f('description')} placeholder="e.g. Civil / Structural" />
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
