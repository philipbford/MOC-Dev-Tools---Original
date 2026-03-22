import { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, BookOpen, Search, X } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Drawer from '../components/Drawer';
import { FormField, TextInput, SelectInput } from '../components/FormField';
import { useStore } from '../store/DataStore';

const BLANK = {
  booking_code: '', cost_element: '', cost_element_description: '',
  cost_category: '', cost_category_description: '',
  discipline_code: '', discipline_description: '',
};

export default function CoACodesTable() {
  const { coa } = useStore();
  const { data, set } = coa.codes;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [filterCat, setFilterCat] = useState('');
  const [filterDisc, setFilterDisc] = useState('');
  const [search, setSearch] = useState('');

  function openAdd() { setForm(BLANK); setEditing(false); setDrawerOpen(true); }
  function openEdit(row) { setForm({ ...row }); setEditing(true); setDrawerOpen(true); }
  function handleDelete(id) {
    if (confirm('Delete this CoA code?')) set(prev => prev.filter(r => r.id !== id));
  }
  function handleSave() {
    if (!form.booking_code) return;
    if (editing) {
      set(prev => prev.map(r => r.id === form.id ? { ...form, id: form.booking_code } : r));
    } else {
      set(prev => [...prev, { ...form, id: form.booking_code }]);
    }
    setDrawerOpen(false);
  }
  const f = k => v => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // Auto-fill descriptions when codes change
      if (k === 'discipline_code') {
        next.discipline_description = coa.disciplineByCode[v] ?? '';
      }
      if (k === 'cost_category') {
        next.cost_category_description = coa.categoryByCode[v] ?? '';
      }
      return next;
    });
  };

  // Unique categories and disciplines for filter dropdowns
  const allCats = useMemo(() => (
    [...new Set(data.map(c => c.cost_category))].sort((a, b) => +a - +b)
  ), [data]);

  const allDiscs = useMemo(() => {
    const discs = filterCat
      ? [...new Set(data.filter(c => c.cost_category === filterCat).map(c => c.discipline_code))]
      : [...new Set(data.map(c => c.discipline_code))];
    return discs.sort();
  }, [data, filterCat]);

  const catOpts = coa.categories.data.map(c => ({ value: c.cost_category, label: `${c.cost_category} — ${c.description}` }));
  const discOpts = coa.disciplines.data.map(d => ({ value: d.discipline_code, label: `${d.discipline_code} — ${d.description}` }));

  const filtered = useMemo(() => {
    let rows = data;
    if (filterCat)  rows = rows.filter(r => r.cost_category === filterCat);
    if (filterDisc) rows = rows.filter(r => r.discipline_code === filterDisc);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.booking_code.toLowerCase().includes(q) ||
        r.cost_element_description.toLowerCase().includes(q) ||
        r.cost_element.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, filterCat, filterDisc, search]);

  function clearFilters() { setFilterCat(''); setFilterDisc(''); setSearch(''); }
  const hasFilter = filterCat || filterDisc || search;

  const columns = [
    { key: 'booking_code',           label: 'Booking Code', width: 110 },
    { key: 'cost_element',           label: 'Cost El.',     width: 80 },
    { key: 'cost_element_description', label: 'Description' },
    {
      key: 'cost_category', label: 'Cat', width: 50,
      render: v => <span className="text-xs tabular-nums text-gray-500 font-medium">{v}</span>,
    },
    {
      key: 'discipline_code', label: 'Disc.', width: 60,
      render: v => <span className="text-xs font-mono text-gray-600">{v}</span>,
    },
    {
      key: 'discipline_description', label: 'Discipline',
      render: v => <span className="text-xs text-gray-400 truncate">{v}</span>,
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
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <BookOpen size={14} className="text-amber-600 shrink-0" />
        <span className="text-xs text-gray-500 shrink-0">{data.length} codes</span>
        <span className="text-xs text-gray-400 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">iPlan CoA reference</span>

        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {/* Category filter */}
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setFilterDisc(''); }}
            className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 bg-white"
          >
            <option value="">All categories</option>
            {allCats.map(cat => (
              <option key={cat} value={cat}>Cat {cat} — {coa.categoryByCode[cat] ?? ''}</option>
            ))}
          </select>

          {/* Discipline filter */}
          <select
            value={filterDisc}
            onChange={e => setFilterDisc(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 bg-white"
          >
            <option value="">All disciplines</option>
            {allDiscs.map(d => (
              <option key={d} value={d}>{d} — {coa.disciplineByCode[d] ?? ''}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search booking code / description…"
              className="text-xs border border-gray-300 rounded pl-6 pr-6 py-1 text-gray-600 bg-white w-56"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
          </div>

          {hasFilter && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 underline">
              Clear
            </button>
          )}
          {hasFilter && (
            <span className="text-xs text-gray-400">→ {filtered.length} shown</span>
          )}
        </div>

        <button onClick={openAdd} className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shrink-0">
          <Plus size={13} /> Add Code
        </button>
      </div>

      <DataGrid columns={columns} data={filtered} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${form.booking_code}` : 'Add CoA Code'}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Booking Code" required>
              <TextInput value={form.booking_code} onChange={f('booking_code')} placeholder="e.g. C0001" />
            </FormField>
            <FormField label="Cost Element">
              <TextInput value={form.cost_element} onChange={f('cost_element')} placeholder="e.g. 0001" />
            </FormField>
          </div>
          <FormField label="Cost Element Description">
            <TextInput value={form.cost_element_description} onChange={f('cost_element_description')} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cost Category" required>
              <SelectInput value={form.cost_category} onChange={f('cost_category')} options={catOpts} placeholder="— select —" />
            </FormField>
            <FormField label="Discipline Code" required>
              <SelectInput value={form.discipline_code} onChange={f('discipline_code')} options={discOpts} placeholder="— select —" />
            </FormField>
          </div>
          {form.discipline_code && (
            <p className="text-xs text-gray-500 -mt-2">
              Discipline: <span className="font-medium text-gray-700">{coa.disciplineByCode[form.discipline_code]}</span>
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 font-medium">Save</button>
            <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
