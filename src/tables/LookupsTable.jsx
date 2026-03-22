import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DataGrid from '../components/DataGrid';
import Badge from '../components/Badge';
import { useStore } from '../store/DataStore';

const LOOKUP_TABS = [
  { key: 'statuses',       label: 'Statuses',       cols: ['id','entity','code','label'] },
  { key: 'roles',          label: 'Roles',           cols: ['id','code','label'] },
  { key: 'units',          label: 'Units',           cols: ['id','code','label'] },
  { key: 'lineItemTypes',  label: 'Line Item Types', cols: ['id','code','label'] },
  { key: 'revisionTypes',  label: 'Revision Types',  cols: ['id','code','label'] },
  { key: 'changeTypes',    label: 'Change Types',    cols: ['id','code','label'] },
];

function EditableRow({ row, cols, onSave, onCancel }) {
  const [form, setForm] = useState({ ...row });
  return (
    <tr className="bg-blue-50">
      {cols.map(c => (
        <td key={c} className="px-3 py-1.5">
          <input
            className="w-full border border-blue-300 rounded px-2 py-1 text-xs"
            value={form[c] ?? ''}
            onChange={e => setForm(p => ({ ...p, [c]: e.target.value }))}
          />
        </td>
      ))}
      <td className="px-3 py-1.5">
        <span className="inline-flex gap-2">
          <button onClick={() => onSave(form)} className="text-xs text-green-600 hover:underline">Save</button>
          <button onClick={onCancel} className="text-xs text-gray-400 hover:underline">Cancel</button>
        </span>
      </td>
    </tr>
  );
}

function LookupSubTable({ tableKey, cols }) {
  const store = useStore();
  const { data, set } = store.lookups[tableKey];
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({});

  function save(updated) {
    set(prev => prev.map(r => r.id === updated.id ? updated : r));
    setEditingId(null);
  }
  function add() {
    if (!newRow.id) return;
    set(prev => [...prev, newRow]);
    setAdding(false);
    setNewRow({});
  }
  function remove(id) {
    if (confirm('Delete this lookup entry?')) set(prev => prev.filter(r => r.id !== id));
  }

  const columns = cols.map(c => ({
    key: c, label: c.charAt(0).toUpperCase() + c.slice(1),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{data.length} records</span>
        <button onClick={() => { setAdding(true); setNewRow({}); }}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
          <Plus size={13} /> Add Entry
        </button>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {cols.map(c => <th key={c} className="px-3 py-2 text-left text-xs font-medium text-gray-600">{c}</th>)}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr className="bg-green-50">
                {cols.map(c => (
                  <td key={c} className="px-3 py-1.5">
                    <input
                      className="w-full border border-green-300 rounded px-2 py-1 text-xs"
                      value={newRow[c] ?? ''}
                      onChange={e => setNewRow(p => ({ ...p, [c]: e.target.value }))}
                      placeholder={c}
                    />
                  </td>
                ))}
                <td className="px-3 py-1.5">
                  <span className="inline-flex gap-2">
                    <button onClick={add} className="text-xs text-green-600 hover:underline">Add</button>
                    <button onClick={() => setAdding(false)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                  </span>
                </td>
              </tr>
            )}
            {data.map(row => (
              editingId === row.id
                ? <EditableRow key={row.id} row={row} cols={cols} onSave={save} onCancel={() => setEditingId(null)} />
                : (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {cols.map(c => <td key={c} className="px-3 py-1.5 text-xs text-gray-700">{row[c]}</td>)}
                    <td className="px-3 py-1.5">
                      <span className="inline-flex gap-2">
                        <button onClick={() => setEditingId(row.id)} className="text-gray-400 hover:text-blue-600"><Pencil size={12} /></button>
                        <button onClick={() => remove(row.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </span>
                    </td>
                  </tr>
                )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LookupsTable() {
  const [activeTab, setActiveTab] = useState('statuses');
  const active = LOOKUP_TABS.find(t => t.key === activeTab);

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 pb-2">
        {LOOKUP_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors
              ${activeTab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active && <LookupSubTable key={active.key} tableKey={active.key} cols={active.cols} />}
    </div>
  );
}
