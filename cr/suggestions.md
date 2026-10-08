# AuraCAD — Architectural Specifications, FOSS Implementations & Roadmap

## Implemented Architecture & FOSS Solutions

### 1. Digital Office System Relational Engine — [COMPLETED]
- **Implementation**: Strict entity relationship model matching the user's ER diagram:
  - `ORDERS` (1:N with Designers, 1:N with Prospects, 1:1 with Invoices, 1:N with Corrections, 1:N with Status History).
  - Strongly typed schema in [`src/types.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/types.ts).
  - Reactive Dexie IndexedDB persistence in [`src/db/database.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/db/database.ts) under `AuraCAD_DigitalOffice_DB`.

### 2. Universal Creative Tim Table Blocks — [COMPLETED]
- **Implementation**: Reconstructed from Creative Tim block specifications across all 4 entity perspectives:
  - `OrdersTable`: Search, status filters, effort levels, financial values, and inspector triggers.
  - `DesignersTableView`: Staff contact directory, CAD specialties, and active handled order counts.
  - `ProspectsTableView`: VIP client portfolio, direct contacts, order counts, and pipeline totals.
  - `InvoicesTableView`: 1:1 billing ledger with payment status tracking and export.

### 3. Sliding Order Inspector Drawer with Duration Calculations — [COMPLETED]
- **Implementation**: [`src/components/digital-office/OrderDetailDrawer.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/digital-office/OrderDetailDrawer.tsx).
- **Features**:
  - Live 4-stage progression bar (`Pending` → `Designing` → `Review` → `Completed`).
  - Designer and Client relational cards with direct contact links and 1-click reassign.
  - 1:1 Invoice financial summary with status switcher.
  - Chronological Status History timeline displaying exact stage duration (e.g. "Took 2d 4h"), answering workflow turnaround questions.
  - Corrections and feedback feed with image attachments and inline submission form.

### 4. PocketBase Staff Role Hierarchy — [COMPLETED]
- **Implementation**: RBAC in [`src/lib/pocketbase.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/lib/pocketbase.ts) & [`src/components/RoleManagementModal.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/RoleManagementModal.tsx).
- **Roles**:
  - `owner`: God User (`dev@auracad.local` / `Goto hell 555`)
  - `superagent`: Manager role
  - `admin`: Studio Master
  - `designer`: CAD Design Specialist
  - `agent`: Client Liaison / Sales

---

## Proactive Architectural Suggestions & Roadmap

### 1. Stage Turnaround Analytics & Designer Velocity Reporting
- Leverage the `ORDER_STATUS_HISTORY` dataset (`start_date` and `end_date`) to compute studio-wide operational benchmarks:
  - Average time spent in `Designing` vs `Review`.
  - Bottleneck alerts (e.g. flag orders stuck in `Review` for > 3 days).
  - Designer turnaround benchmarks to see average completion days per designer.

### 2. Native Offline Invoice PDF Export
- Add a client-side vector PDF generator (using deterministic SVG/canvas or `@react-pdf/renderer`) so the studio can generate printable bespoke invoices with order codes and client details directly offline.

### 3. Local Drag-and-Drop Image Attachments for Corrections
- Allow users to drag and drop design proof screenshots directly into the Order Inspector Drawer, storing them as local object URLs or base64 blobs in IndexedDB.
