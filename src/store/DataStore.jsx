import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  initialProjects, initialWorkOrders, initialOperations,
  initialChangeFlags, initialCFRevisions, initialCRNs, initialCRNRevisions,
  initialOperationRevisions, initialLineItems,
  initialQuoteSnapshots, initialQuoteSnapshotLines,
  initialChangeOrders, initialApprovals, initialAuditEvents,
  initialResolutionTasks, initialProjectSettings,
} from "../data/mockData";
import { statuses, roles, units, lineItemTypes, revisionTypes, changeTypes } from "../data/lookups";
import { coaCategories, coaDisciplines, coaCodes } from "../data/coaData";

const STORAGE_KEY = "moc_devtools_v2";
const DataStoreContext = createContext(null);

const SEED = {
  projects: initialProjects, workOrders: initialWorkOrders, operations: initialOperations,
  changeFlags: initialChangeFlags, cfRevisions: initialCFRevisions,
  crns: initialCRNs, crnRevisions: initialCRNRevisions,
  operationRevisions: initialOperationRevisions, lineItems: initialLineItems,
  quoteSnapshots: initialQuoteSnapshots, quoteSnapshotLines: initialQuoteSnapshotLines,
  changeOrders: initialChangeOrders, approvals: initialApprovals,
  auditEvents: initialAuditEvents, resolutionTasks: initialResolutionTasks,
  projectSettings: initialProjectSettings,
  lookupStatuses: statuses, lookupRoles: roles, lookupUnits: units,
  lookupLineItemTypes: lineItemTypes, lookupRevisionTypes: revisionTypes, lookupChangeTypes: changeTypes,
  coaCategories, coaDisciplines, coaCodes,
};

function loadFromStorage() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch (_) {}
  return null;
}

export function DataStoreProvider({ children }) {
  const saved = loadFromStorage();
  const init = saved ?? SEED;

  const [projects,            setProjects]            = useState(init.projects);
  const [workOrders,          setWorkOrders]          = useState(init.workOrders);
  const [operations,          setOperations]          = useState(init.operations);
  const [changeFlags,         setChangeFlags]         = useState(init.changeFlags);
  const [cfRevisions,         setCfRevisions]         = useState(init.cfRevisions);
  const [crns,                setCrns]                = useState(init.crns);
  const [crnRevisions,        setCrnRevisions]        = useState(init.crnRevisions);
  const [operationRevisions,  setOperationRevisions]  = useState(init.operationRevisions);
  const [lineItems,           setLineItems]           = useState(init.lineItems);
  const [quoteSnapshots,      setQuoteSnapshots]      = useState(init.quoteSnapshots);
  const [quoteSnapshotLines,  setQuoteSnapshotLines]  = useState(init.quoteSnapshotLines);
  const [changeOrders,        setChangeOrders]        = useState(init.changeOrders);
  const [approvals,           setApprovals]           = useState(init.approvals);
  const [auditEvents,         setAuditEvents]         = useState(init.auditEvents);
  const [resolutionTasks,     setResolutionTasks]     = useState(init.resolutionTasks);
  const [projectSettings,     setProjectSettings]     = useState(init.projectSettings);
  const [lookupStatuses,      setLookupStatuses]      = useState(init.lookupStatuses);
  const [lookupRoles,         setLookupRoles]         = useState(init.lookupRoles);
  const [lookupUnits,         setLookupUnits]         = useState(init.lookupUnits);
  const [lookupLineItemTypes, setLookupLineItemTypes] = useState(init.lookupLineItemTypes);
  const [lookupRevisionTypes, setLookupRevisionTypes] = useState(init.lookupRevisionTypes);
  const [lookupChangeTypes,   setLookupChangeTypes]   = useState(init.lookupChangeTypes);
  // CoA reference — stored in state so import/export/reset works; seeded from coaData.js
  const [coaCategoriesState,  setCoaCategories]  = useState(init.coaCategories ?? coaCategories);
  const [coaDisciplinesState, setCoaDisciplines] = useState(init.coaDisciplines ?? coaDisciplines);
  const [coaCodesState,       setCoaCodes]       = useState(init.coaCodes       ?? coaCodes);

  useEffect(() => {
    const snapshot = {
      projects, workOrders, operations, changeFlags, cfRevisions, crns, crnRevisions,
      operationRevisions, lineItems, quoteSnapshots, quoteSnapshotLines, changeOrders,
      approvals, auditEvents, resolutionTasks, projectSettings,
      lookupStatuses, lookupRoles, lookupUnits, lookupLineItemTypes, lookupRevisionTypes, lookupChangeTypes,
      coaCategories: coaCategoriesState, coaDisciplines: coaDisciplinesState, coaCodes: coaCodesState,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch (_) {}
  }, [projects, workOrders, operations, changeFlags, cfRevisions, crns, crnRevisions, operationRevisions, lineItems, quoteSnapshots, quoteSnapshotLines, changeOrders, approvals, auditEvents, resolutionTasks, projectSettings, lookupStatuses, lookupRoles, lookupUnits, lookupLineItemTypes, lookupRevisionTypes, lookupChangeTypes, coaCategoriesState, coaDisciplinesState, coaCodesState]);

  function makeTable(state, setter, prefix) {
    return {
      data: state,
      add: (r) => setter(prev => [...prev, r]),
      update: (id, patch) => setter(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)),
      remove: (id) => setter(prev => prev.filter(r => r.id !== id)),
      nextId: () => {
        if (!state.length) return prefix + "-001";
        const nums = state.map(r => parseInt((r.id ?? "").split("-").pop())).filter(n => !isNaN(n));
        return prefix + "-" + String(Math.max(...nums) + 1).padStart(3, "0");
      },
    };
  }

  const resetToSeed = useCallback(() => {
    setProjects(SEED.projects); setWorkOrders(SEED.workOrders); setOperations(SEED.operations);
    setChangeFlags(SEED.changeFlags); setCfRevisions(SEED.cfRevisions);
    setCrns(SEED.crns); setCrnRevisions(SEED.crnRevisions);
    setOperationRevisions(SEED.operationRevisions); setLineItems(SEED.lineItems);
    setQuoteSnapshots(SEED.quoteSnapshots); setQuoteSnapshotLines(SEED.quoteSnapshotLines);
    setChangeOrders(SEED.changeOrders); setApprovals(SEED.approvals);
    setAuditEvents(SEED.auditEvents); setResolutionTasks(SEED.resolutionTasks);
    setProjectSettings(SEED.projectSettings);
    setLookupStatuses(SEED.lookupStatuses); setLookupRoles(SEED.lookupRoles);
    setLookupUnits(SEED.lookupUnits); setLookupLineItemTypes(SEED.lookupLineItemTypes);
    setLookupRevisionTypes(SEED.lookupRevisionTypes); setLookupChangeTypes(SEED.lookupChangeTypes);
    setCoaCategories(SEED.coaCategories); setCoaDisciplines(SEED.coaDisciplines); setCoaCodes(SEED.coaCodes);
  }, []);

  const exportJSON = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "moc_devtools_export.json"; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importJSON = useCallback((jsonString) => {
    try {
      const p = JSON.parse(jsonString);
      if (p.projects)           setProjects(p.projects);
      if (p.workOrders)         setWorkOrders(p.workOrders);
      if (p.operations)         setOperations(p.operations);
      if (p.changeFlags)        setChangeFlags(p.changeFlags);
      if (p.cfRevisions)        setCfRevisions(p.cfRevisions);
      if (p.crns)               setCrns(p.crns);
      if (p.crnRevisions)       setCrnRevisions(p.crnRevisions);
      if (p.operationRevisions) setOperationRevisions(p.operationRevisions);
      if (p.lineItems)          setLineItems(p.lineItems);
      if (p.quoteSnapshots)     setQuoteSnapshots(p.quoteSnapshots);
      if (p.quoteSnapshotLines) setQuoteSnapshotLines(p.quoteSnapshotLines);
      if (p.changeOrders)       setChangeOrders(p.changeOrders);
      if (p.approvals)          setApprovals(p.approvals);
      if (p.auditEvents)        setAuditEvents(p.auditEvents);
      if (p.resolutionTasks)    setResolutionTasks(p.resolutionTasks);
      if (p.projectSettings)    setProjectSettings(p.projectSettings);
      if (p.lookupStatuses)     setLookupStatuses(p.lookupStatuses);
      if (p.lookupRoles)        setLookupRoles(p.lookupRoles);
      if (p.lookupUnits)        setLookupUnits(p.lookupUnits);
      if (p.lookupLineItemTypes) setLookupLineItemTypes(p.lookupLineItemTypes);
      if (p.lookupRevisionTypes) setLookupRevisionTypes(p.lookupRevisionTypes);
      if (p.lookupChangeTypes)  setLookupChangeTypes(p.lookupChangeTypes);
      if (p.coaCategories)      setCoaCategories(p.coaCategories);
      if (p.coaDisciplines)     setCoaDisciplines(p.coaDisciplines);
      if (p.coaCodes)           setCoaCodes(p.coaCodes);
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  }, []);

  const store = {
    projects:           makeTable(projects,           setProjects,           "PRJ"),
    workOrders:         makeTable(workOrders,         setWorkOrders,         "WO"),
    operations:         makeTable(operations,         setOperations,         "OP"),
    changeFlags:        makeTable(changeFlags,        setChangeFlags,        "CF"),
    cfRevisions:        makeTable(cfRevisions,        setCfRevisions,        "CFR"),
    crns:               makeTable(crns,               setCrns,               "CRN"),
    crnRevisions:       makeTable(crnRevisions,       setCrnRevisions,       "CRNR"),
    operationRevisions: makeTable(operationRevisions, setOperationRevisions, "OPREV"),
    lineItems:          makeTable(lineItems,          setLineItems,          "LI"),
    quoteSnapshots:     makeTable(quoteSnapshots,     setQuoteSnapshots,     "QS"),
    quoteSnapshotLines: makeTable(quoteSnapshotLines, setQuoteSnapshotLines, "QSL"),
    changeOrders:       makeTable(changeOrders,       setChangeOrders,       "CO"),
    approvals:          makeTable(approvals,          setApprovals,          "APR"),
    auditEvents:        makeTable(auditEvents,        setAuditEvents,        "AUD"),
    resolutionTasks:    makeTable(resolutionTasks,    setResolutionTasks,    "RT"),
    projectSettings:    makeTable(projectSettings,    setProjectSettings,    "PS"),
    lookups: {
      statuses:      { data: lookupStatuses,       set: setLookupStatuses },
      roles:         { data: lookupRoles,           set: setLookupRoles },
      units:         { data: lookupUnits,           set: setLookupUnits },
      lineItemTypes: { data: lookupLineItemTypes,   set: setLookupLineItemTypes },
      revisionTypes: { data: lookupRevisionTypes,   set: setLookupRevisionTypes },
      changeTypes:   { data: lookupChangeTypes,     set: setLookupChangeTypes },
    },
    coa: {
      categories:  { data: coaCategoriesState,  set: setCoaCategories },
      disciplines: { data: coaDisciplinesState, set: setCoaDisciplines },
      codes:       { data: coaCodesState,       set: setCoaCodes },
      // Pre-built lookup maps for fast access in table components
      codesByBooking:   Object.fromEntries(coaCodesState.map(c => [c.booking_code, c])),
      disciplineByCode: Object.fromEntries(coaDisciplinesState.map(d => [d.discipline_code, d.description])),
      categoryByCode:   Object.fromEntries(coaCategoriesState.map(c => [c.cost_category, c.description])),
    },
    resetToSeed, exportJSON, importJSON,
  };

  return (
    <DataStoreContext.Provider value={store}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useStore() {
  return useContext(DataStoreContext);
}
