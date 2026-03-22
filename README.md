# MoC Dev Tools — Data Model Workspace

A developer-facing workspace for inspecting and editing the MoC (Management of Change) + iPlan prototype data model.

## Stack
- Vite 8 + React 19 + Tailwind CSS v4
- `lucide-react` icons
- localStorage persistence (`moc_devtools_v2`)

## Modes
- **Data Tables** — Editable grids for all 20+ tables in the data model
- **Lineage Inspect** — Read-only prototype view tracing Change Flag → CRN → Op Revision → Line Item relationships

## Tables
- iPlan Operational: Projects, Work Orders, Operations
- MoC Governance: Change Flags, CF Revisions, CRNs, CRN Revisions, Change Orders
- Shared Cost & Revisions: Op Revisions, Line Items, Quote Snapshots, QS Lines
- Governance & Audit: Approvals, Audit Events, Resolution Tasks, Project Settings
- CoA Reference: CoA Categories, CoA Disciplines, CoA Codes (1,055 codes)
- Reference: Lookup Tables

## Data Controls
- **Export** — Download full dataset as JSON
- **Import** — Load a previously exported JSON file
- **Reset** — Reset all data to seed state (5 scenarios: S1–S5)

## Dev Only
This workspace is for data model prototyping only. Not a production application.
