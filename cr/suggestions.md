# AuraCAD — Architectural Specifications, FOSS Implementations & Roadmap

## Implemented Architecture & FOSS Solutions

### 1. Digital Office System Relational Engine — [COMPLETED]
- Strict entity relationship model matching the user's ER diagram:
  - `ORDERS` (1:N with Designers, 1:N with Prospects, 1:1 with Invoices, 1:N with Corrections, 1:N with Status History).
  - Strongly typed schema in [`src/types.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/types.ts).
  - Reactive Dexie IndexedDB persistence in [`src/db/database.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/db/database.ts) under `AuraCAD_DigitalOffice_v2`.

### 2. Universal Creative Tim Table Blocks & Mobile Card Feeds — [COMPLETED]
- Desktop tabular view + Mobile touch cards across all 4 entity perspectives:
  - `OrdersTable`: Search, status filters, effort levels, financial values, and card view toggle.
  - `DesignersTableView`: Staff contact directory, CAD specialties, direct phone/email shortcuts, and active order counts.
  - `ProspectsTableView`: VIP client portfolio, direct contacts, lifetime spend, and quick "+ Order" shortcut.
  - `InvoicesTableView`: 1:1 billing ledger with payment status tracking and linked order codes.

### 3. Sliding Order Inspector Drawer with Duration Calculations — [COMPLETED]
- Full-screen sheet on mobile, flyout drawer on desktop (`OrderDetailDrawer.tsx`).
- Live 4-stage progression bar (`Pending` → `Designing` → `Review` → `Completed`).
- Chronological Status History timeline displaying exact stage duration (e.g. "Designing: 2d 4h").
- Corrections feed with image attachments and inline submission form.

### 4. PocketBase Staff Role Hierarchy — [COMPLETED]
- RBAC in [`src/lib/pocketbase.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/lib/pocketbase.ts) & [`src/components/RoleManagementModal.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/RoleManagementModal.tsx).
- Roles: `owner` (God user), `superagent`, `admin`, `designer`, `agent`.

---

## Proactive Architectural Suggestions & Roadmap

### 1. Mobile Touch Gestures (Swipe to Advance Status)
- Integrate touch swipe interactions on mobile order cards:
  - **Swipe Right**: Advance status to next stage (e.g. `Pending` $\to$ `Designing`).
  - **Swipe Left**: Open order inspector sheet.
- Utilizes CSS touch actions and standard Mantine gesture hooks without bloated third-party animation dependencies.

### 2. Native Camera / Photo Capture for Proofs on Mobile
- Add direct `<input type="file" accept="image/*" capture="environment">` inside the Corrections and New Order forms.
- Allows jewelers and master craftsmen on the workshop floor to snap a photo of a physical casting or diamond setting and instantly attach it to the order's correction feed.

### 3. Offline PDF Invoice Generation
- Add a client-side vector PDF generator so the studio can generate printable bespoke invoices with order codes and client details directly offline from both desktop and mobile.

### 4. Stage Turnaround Analytics & Velocity Benchmarking
- Leverage the `ORDER_STATUS_HISTORY` dataset (`start_date` and `end_date`) to compute studio-wide operational benchmarks:
  - Average time spent in `Designing` vs `Review`.
  - Bottleneck alerts (e.g. flag orders stuck in `Review` for > 3 days).
  - Designer turnaround benchmarks to see average completion days per designer.
