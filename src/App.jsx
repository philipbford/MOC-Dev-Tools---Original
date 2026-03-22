import { useState, useRef } from 'react';
import { Database, GitBranch, FileText, Settings, ChevronRight, ShieldCheck, Download, Upload, RotateCcw, BookMarked, Workflow } from 'lucide-react';
import { DataStoreProvider, useStore } from './store/DataStore';
import WorkflowView from './views/WorkflowView';
import ProjectsTable from './tables/ProjectsTable';
import WorkOrdersTable from './tables/WorkOrdersTable';
import OperationsTable from './tables/OperationsTable';
import ChangeFlagsTable from './tables/ChangeFlagsTable';
import CFRevisionsTable from './tables/CFRevisionsTable';
import CRNsTable from './tables/CRNsTable';
import CRNRevisionsTable from './tables/CRNRevisionsTable';
import OperationRevisionsTable from './tables/OperationRevisionsTable';
import LineItemsTable from './tables/LineItemsTable';
import QuoteSnapshotsTable from './tables/QuoteSnapshotsTable';
import QuoteSnapshotLinesTable from './tables/QuoteSnapshotLinesTable';
import ChangeOrdersTable from './tables/ChangeOrdersTable';
import ApprovalsTable from './tables/ApprovalsTable';
import AuditEventsTable from './tables/AuditEventsTable';
import ResolutionTasksTable from './tables/ResolutionTasksTable';
import ProjectSettingsTable from './tables/ProjectSettingsTable';
import CoACategoriesTable from './tables/CoACategoriesTable';
import CoADisciplinesTable from './tables/CoADisciplinesTable';
import CoACodesTable from './tables/CoACodesTable';
import LookupsTable from './tables/LookupsTable';

const TAB_GROUPS = [
  {
    group: 'iPlan – Operational',
    icon: <Database size={13} />,
    color: 'text-indigo-400',
    tabs: [
      { id: 'projects',    label: 'Projects',    component: ProjectsTable },
      { id: 'workorders',  label: 'Work Orders', component: WorkOrdersTable },
      { id: 'operations',  label: 'Operations',  component: OperationsTable },
    ],
  },
  {
    group: 'MoC – Governance',
    icon: <GitBranch size={13} />,
    color: 'text-purple-400',
    tabs: [
      { id: 'changeflags',  label: 'Change Flags',  component: ChangeFlagsTable },
      { id: 'cfrevisions',  label: 'CF Revisions',  component: CFRevisionsTable },
      { id: 'crns',         label: 'CRNs',          component: CRNsTable },
      { id: 'crnrevisions', label: 'CRN Revisions', component: CRNRevisionsTable },
      { id: 'changeorders', label: 'Change Orders', component: ChangeOrdersTable },
    ],
  },
  {
    group: 'Shared – Cost & Revisions',
    icon: <FileText size={13} />,
    color: 'text-teal-400',
    tabs: [
      { id: 'oprevisions',       label: 'Op Revisions',    component: OperationRevisionsTable },
      { id: 'lineitems',         label: 'Line Items',      component: LineItemsTable },
      { id: 'quotesnapshots',    label: 'Quote Snapshots', component: QuoteSnapshotsTable },
      { id: 'quotesnapshotlines',label: 'QS Lines',        component: QuoteSnapshotLinesTable },
    ],
  },
  {
    group: 'Governance & Audit',
    icon: <ShieldCheck size={13} />,
    color: 'text-rose-400',
    tabs: [
      { id: 'approvals',       label: 'Approvals',         component: ApprovalsTable },
      { id: 'auditevents',     label: 'Audit Events',      component: AuditEventsTable },
      { id: 'resolutiontasks', label: 'Resolution Tasks',  component: ResolutionTasksTable },
      { id: 'projectsettings', label: 'Project Settings',  component: ProjectSettingsTable },
    ],
  },
  {
    group: 'CoA Reference',
    icon: <BookMarked size={13} />,
    color: 'text-amber-500',
    tabs: [
      { id: 'coa-categories',  label: 'CoA Categories',  component: CoACategoriesTable },
      { id: 'coa-disciplines', label: 'CoA Disciplines', component: CoADisciplinesTable },
      { id: 'coa-codes',       label: 'CoA Codes',       component: CoACodesTable },
    ],
  },
  {
    group: 'Reference',
    icon: <Settings size={13} />,
    color: 'text-gray-400',
    tabs: [
      { id: 'lookups', label: 'Lookup Tables', component: LookupsTable },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs);

const SCENARIOS = [
  { id: 'S1', label: 'CF→CRN',         desc: 'CF-001 revised (CFR-001→CFR-002) → CRN-001 → CO-001 issued', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700' },
  { id: 'S2', label: 'Reject→Accept',   desc: 'CRN-002: CRNR-002 rejected, CRNR-003 approved', color: 'bg-purple-900/60 text-purple-300 border-purple-700' },
  { id: 'S3', label: 'DELTA WO',        desc: 'WO-003 + OP-004/005 + OPREV-001/002 + LI-001–005', color: 'bg-teal-900/60 text-teal-300 border-teal-700' },
  { id: 'S4', label: 'Appr-at-Risk',    desc: 'CRN-003: CRNR-004 Approved-at-Risk → CRNR-005 Rejected → Rejected-Incomplete', color: 'bg-orange-900/60 text-orange-300 border-orange-700' },
  { id: 'S5', label: 'Rebaseline',      desc: 'CF-003 + CFR-004 + OPREV-005 + LI-010/011 (Q2 rebaseline)', color: 'bg-green-900/60 text-green-300 border-green-700' },
];

function DataToolbar() {
  const store = useStore();
  const importRef = useRef(null);

  function handleExport() {
    store.exportJSON();
  }

  function handleImportClick() {
    importRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        store.importJSON(evt.target.result);
      } catch {
        alert('Import failed: invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (confirm('Reset all data to seed state? This cannot be undone.')) {
      store.resetToSeed();
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded transition-colors"
        title="Export all data as JSON"
      >
        <Download size={11} /> Export
      </button>
      <button
        onClick={handleImportClick}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded transition-colors"
        title="Import data from JSON file"
      >
        <Upload size={11} /> Import
      </button>
      <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
      <button
        onClick={handleReset}
        className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-gray-800 hover:bg-red-950 border border-gray-700 hover:border-red-800 px-2 py-1 rounded transition-colors"
        title="Reset to seed data"
      >
        <RotateCcw size={11} /> Reset
      </button>
    </div>
  );
}

function AppShell() {
  const [mode, setMode] = useState('devtools'); // 'devtools' | 'workflow'
  const [activeTab, setActiveTab] = useState('projects');

  const activeTabDef = ALL_TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabDef?.component;

  const activeGroup = TAB_GROUPS.find(g => g.tabs.some(t => t.id === activeTab));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif" }}>
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 h-11 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
            <Database size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Dev Tools</span>
          <span className="text-gray-600 text-sm">/</span>
          <span className="text-xs text-gray-400">Data Model Workspace</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded overflow-hidden">
            <button
              onClick={() => setMode('devtools')}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors font-medium ${
                mode === 'devtools'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Database size={11} /> Data Tables
            </button>
            <button
              onClick={() => setMode('workflow')}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 transition-colors font-medium ${
                mode === 'workflow'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Workflow size={11} /> Lineage Inspect
            </button>
          </div>
          <DataToolbar />
          <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded font-mono">
            Phase 3 — CoA Integration
          </span>
          <span className="text-xs font-medium text-amber-400 bg-amber-950 border border-amber-800/60 px-2 py-0.5 rounded">
            DEV ONLY
          </span>
        </div>
      </header>

      {/* ── Scenario Strip ───────────────────────────────────── */}
      <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500 font-medium">Seed Scenarios:</span>
        {SCENARIOS.map(s => (
          <span
            key={s.id}
            title={s.desc}
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border cursor-help ${s.color}`}
          >
            <span className="font-bold">{s.id}</span>
            <span className="opacity-80">{s.label}</span>
          </span>
        ))}
      </div>

      {mode === 'workflow' ? (
        <div className="flex-1 overflow-auto">
          <WorkflowView />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="w-52 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-y-auto">
            <nav className="p-2 space-y-4 mt-2">
              {TAB_GROUPS.map(group => (
                <div key={group.group}>
                  <div className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wider ${group.color} mb-0.5`}>
                    {group.icon}
                    <span>{group.group}</span>
                  </div>
                  {group.tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-between gap-1
                        ${activeTab === tab.id
                          ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500 pl-[10px]'
                          : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-200'
                        }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && <ChevronRight size={10} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ─────────────────────────────────────── */}
          <main className="flex-1 overflow-auto bg-white">
            <div className="p-5">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <span className={`font-medium ${activeGroup?.color.replace('text-', 'text-').replace('-400', '-600') || ''}`}>
                  {activeGroup?.group}
                </span>
                <ChevronRight size={10} className="text-gray-300" />
                <span className="text-gray-600 font-medium">{activeTabDef?.label}</span>
              </div>

              {/* Table heading */}
              <h1 className="text-base font-semibold text-gray-900 mb-4">{activeTabDef?.label}</h1>

              {ActiveComponent && <ActiveComponent />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataStoreProvider>
      <AppShell />
    </DataStoreProvider>
  );
}
