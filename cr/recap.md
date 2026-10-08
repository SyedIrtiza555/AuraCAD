# AuraCAD — Session Recap & Project State

## Executive Summary & Milestones

1. **Repository Discovery & Synchronization**:
   - Cloned private repository `SyedIrtiza555/AuraCAD` into `C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD`.
   - Mirrored changes cleanly into the active workspace `c:\Users\TheAuditLabs\AuraCAD`.
   - Purged obsolete root patch files (`fix_*.patch`, `patch_*.sh`, `temp.txt`) committed in previous branches.

2. **Purging AI & Establishing 100% Deterministic FOSS**:
   - Uninstalled `@google/genai` from `package.json`.
   - Cleared `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` in `metadata.json`.
   - Audited all TypeScript source files: confirmed 0 AI endpoints or external LLM dependencies.

3. **FOSS 3D CAD Visualization Engine (Three.js)**:
   - Built procedural 3D jewelry CAD inspector in [`src/components/Jewelry3DViewer.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/Jewelry3DViewer.tsx).
   - Real-time PBR material rendering for yellow gold, white gold, rose gold, and platinum.
   - Refractive gemstone shaders for diamond, ruby, sapphire, and emerald.
   - Integrated into the right-hand inspection drawer alongside standard 2D photos.

4. **TanStack Table Implementation**:
   - Upgraded Table View ([`src/components/views/Table.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/views/Table.tsx)) with `@tanstack/react-table` v8.
   - Multi-column sort, real-time multi-field search, multi-row batch actions (`Start`, `Review`, `Deliver`), JSON export, and density switching.

5. **Offline Zero-Dead-End Persistence (Dexie.js / IndexedDB)**:
   - Configured [`src/db/database.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/db/database.ts) with IndexedDB collections for `orders`, `clients`, `prospects`, and `settings`.
   - Auto-seeding default data on first launch with live reactive UI updates.

6. **Power-User Desktop Navigation & Shortcut Matrix**:
   - `J` / `K` list traversal, `1`–`5` status keys, `Space` quick peek, and `Esc` dismiss.
   - Native clipboard image pasting directly onto active CAD orders.
   - Desktop shortcuts HUD pill rendered at bottom-left.

7. **Aura Glass Theming & Tailwind v4 Dark Mode Alignment**:
   - Fixed Tailwind v4 `@custom-variant dark (&:where(.theme-dark, .theme-dark *))` to prevent light-theme contrast glitches.
   - Full palette support across both light and dark aesthetics.

8. **PocketBase Backend & God User Superuser Controls**:
   - Initialized PocketBase v0.25.9 Go/SQLite backend on port `8090` (`http://localhost:8090` / Tailscale `http://100.100.56.31:8090`).
   - Configured God User Superuser: username `dev` (`dev@auracad.local`) with password `Goto hell 555`.
   - Setup RBAC role matrix: `owner`, `admin`, `designer`, `agent`, `superagent`.
   - Built interactive Superuser Role Management console with live role reassignment and user creation.
   - Created dedicated UI perspectives:
     - **Admin UI**: Full studio oversight, financial metrics, TanStack table, team workload.
     - **Designer Workbench**: Centered on Three.js procedural 3D CAD inspector, PBR alloy metals (18K Yellow/White/Rose Gold, Platinum), gemstones (Diamond, Ruby, Sapphire, Emerald), and casting shrinkage/wall thickness safety verification.
     - **Agent CRM & Powerdialler Hub**: Outbound lead queue with 1-click dial simulation, call timer, outcome tagging ("Qualified", "Bespoke Quote Sent", "Follow-up Needed"), and real-time sync with PocketBase `call_logs`.

9. **Branch v0-b Fork & Creative Tim Block Installation**:
   - Forked repository to branch **`v0-b`** (`origin/v0-b` tracking) preserving baseline `v0` and `v0-a`.
   - Removed `dev` user type; God User now holds the role of **Owner** (`owner`), and `superagent` is designated as **Manager**.
   - Installed the Creative Tim `orders-table` block at [`src/components/creative-tim/blocks/orders-table.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/creative-tim/blocks/orders-table.tsx).
   - Added dedicated top-bar navigation button (`Creative Tim Table [Block]`) and sidebar link to navigate directly to the installed block.
   - Dual data mode: supports switching between the original Creative Tim sample catalog and live AuraCAD studio orders.

---

## Universal Testing Protocol Verification

- **Dev Server**: Vite daemon active on port `3000` with active HMR.
  - Local URL: [http://localhost:3000](http://localhost:3000)
  - Tailscale Mesh URL: [http://100.100.56.31:3000](http://100.100.56.31:3000)
- **Production Build**: Verified with `vite build` — 2,145 modules bundled cleanly with 0 errors.
- **Watcher Bot**: Active error trap embedded in `index.html`.

---

## Quick Navigation Links
- [cr/launch.md](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/cr/launch.md)
- [cr/build.md](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/cr/build.md)
- [cr/suggestions.md](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/cr/suggestions.md)
