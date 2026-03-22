// ─── Lookup Tables ───────────────────────────────────────────────────────────

export const statuses = [
  { id: 'ST-01', entity: 'ChangeFlag',    code: 'DRAFT',               label: 'Draft' },
  { id: 'ST-02', entity: 'ChangeFlag',    code: 'OPEN',                label: 'Open' },
  { id: 'ST-03', entity: 'ChangeFlag',    code: 'CONVERTED_TO_CRN',    label: 'Converted to CRN' },
  { id: 'ST-04', entity: 'ChangeFlag',    code: 'CLOSED',              label: 'Closed' },
  { id: 'ST-05', entity: 'CRN',           code: 'DRAFT',               label: 'Draft' },
  { id: 'ST-06', entity: 'CRN',           code: 'SUBMITTED',           label: 'Submitted' },
  { id: 'ST-07', entity: 'CRN',           code: 'APPROVED',            label: 'Approved' },
  { id: 'ST-08', entity: 'CRN',           code: 'REJECTED',            label: 'Rejected' },
  { id: 'ST-09', entity: 'CRN',           code: 'APPROVED_AT_RISK',    label: 'Approved-at-Risk' },
  { id: 'ST-10', entity: 'CRN',           code: 'REJECTED_INCOMPLETE', label: 'Rejected-Incomplete' },
  { id: 'ST-11', entity: 'CRN',           code: 'CONVERTED_TO_CO',     label: 'Converted to CO' },
  { id: 'ST-12', entity: 'ChangeOrder',   code: 'DRAFT',               label: 'Draft' },
  { id: 'ST-13', entity: 'ChangeOrder',   code: 'ISSUED',              label: 'Issued' },
  { id: 'ST-14', entity: 'ChangeOrder',   code: 'EXECUTED',            label: 'Executed' },
  { id: 'ST-15', entity: 'ChangeOrder',   code: 'CANCELLED',           label: 'Cancelled' },
  { id: 'ST-16', entity: 'WorkOrder',     code: 'PLANNED',             label: 'Planned' },
  { id: 'ST-17', entity: 'WorkOrder',     code: 'IN_PROGRESS',         label: 'In Progress' },
  { id: 'ST-18', entity: 'WorkOrder',     code: 'COMPLETE',            label: 'Complete' },
  { id: 'ST-19', entity: 'Operation',     code: 'PLANNED',             label: 'Planned' },
  { id: 'ST-20', entity: 'Operation',     code: 'IN_PROGRESS',         label: 'In Progress' },
  { id: 'ST-21', entity: 'Operation',     code: 'COMPLETE',            label: 'Complete' },
  { id: 'ST-22', entity: 'Project',       code: 'ACTIVE',              label: 'Active' },
  { id: 'ST-23', entity: 'Project',       code: 'ON_HOLD',             label: 'On Hold' },
  { id: 'ST-24', entity: 'Project',       code: 'CLOSED',              label: 'Closed' },
];

export const roles = [
  { id: 'RL-01', code: 'PROJECT_MANAGER',   label: 'Project Manager' },
  { id: 'RL-02', code: 'SITE_ENGINEER',     label: 'Site Engineer' },
  { id: 'RL-03', code: 'ESTIMATOR',         label: 'Estimator' },
  { id: 'RL-04', code: 'APPROVER',          label: 'Approver' },
  { id: 'RL-05', code: 'SUBCONTRACTOR',     label: 'Subcontractor' },
  { id: 'RL-06', code: 'CLIENT_REP',        label: 'Client Representative' },
  { id: 'RL-07', code: 'QUANTITY_SURVEYOR', label: 'Quantity Surveyor' },
];

export const units = [
  { id: 'UN-01', code: 'HR',   label: 'Hour' },
  { id: 'UN-02', code: 'DAY',  label: 'Day' },
  { id: 'UN-03', code: 'WK',   label: 'Week' },
  { id: 'UN-04', code: 'M',    label: 'Metre' },
  { id: 'UN-05', code: 'M2',   label: 'Square Metre' },
  { id: 'UN-06', code: 'M3',   label: 'Cubic Metre' },
  { id: 'UN-07', code: 'T',    label: 'Tonne' },
  { id: 'UN-08', code: 'KG',   label: 'Kilogram' },
  { id: 'UN-09', code: 'EA',   label: 'Each' },
  { id: 'UN-10', code: 'LS',   label: 'Lump Sum' },
  { id: 'UN-11', code: 'NR',   label: 'Number' },
  { id: 'UN-12', code: 'LT',   label: 'Litre' },
];

export const lineItemTypes = [
  { id: 'LT-01', code: 'LABOUR',      label: 'Labour' },
  { id: 'LT-02', code: 'MATERIAL',    label: 'Material' },
  { id: 'LT-03', code: 'PLANT',       label: 'Plant' },
  { id: 'LT-04', code: 'SUBCONTRACT', label: 'Subcontract' },
  { id: 'LT-05', code: 'SUNDRY',      label: 'Sundry' },
];

export const revisionTypes = [
  { id: 'RT-01', code: 'INITIAL',   label: 'Initial' },
  { id: 'RT-02', code: 'REVISED',   label: 'Revised' },
  { id: 'RT-03', code: 'REBASELINE',label: 'Rebaseline' },
  { id: 'RT-04', code: 'DELTA',     label: 'Delta' },
];

export const changeTypes = [
  { id: 'CT-01', code: 'SCOPE_ADDITION',   label: 'Scope Addition' },
  { id: 'CT-02', code: 'SCOPE_REDUCTION',  label: 'Scope Reduction' },
  { id: 'CT-03', code: 'DESIGN_CHANGE',    label: 'Design Change' },
  { id: 'CT-04', code: 'CLIENT_REQUEST',   label: 'Client Request' },
  { id: 'CT-05', code: 'SITE_CONDITION',   label: 'Site Condition' },
  { id: 'CT-06', code: 'REBASELINE',       label: 'Rebaseline' },
];
