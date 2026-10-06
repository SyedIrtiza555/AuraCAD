# AuraCAD — Architectural Specifications, FOSS Implementations & Roadmap

## Implemented Architecture & FOSS Solutions

### 1. FOSS 3D CAD Model Inspection Engine (Three.js) — [COMPLETED]
- **Implementation**: Procedural 3D jewelry renderer located at [`src/components/Jewelry3DViewer.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/Jewelry3DViewer.tsx).
- **Features**:
  - PBR metal materials: 18K Yellow Gold, 18K White Gold, 18K Rose Gold, 950 Platinum.
  - Refractive faceted gemstones: Solitaire Diamond, Emerald, Sapphire, Ruby.
  - Interactive mouse orbit controls, auto-rotation toggle, and wireframe topology inspection.
  - Integrated into the right-hand Entity Inspector drawer with a clean segmented toggle (3D WebGL vs 2D Photo renders).
  - 100% local, zero external network requests or proprietary licensing.

### 2. TanStack Table Integration — [COMPLETED]
- **Implementation**: `@tanstack/react-table` v8 integrated in [`src/components/views/Table.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/components/views/Table.tsx).
- **Features**:
  - Multi-column sortable headers (`ID`, `Title`, `Status`, `Value`, `Due Date`).
  - Real-time global text filter across order titles, clients, and technical specs.
  - Row selection checkboxes with floating batch action bar (`Start`, `Review`, `Deliver`).
  - Native JSON export of filtered datasets.
  - Ergonomic display density switcher (`Compact` vs `Comfortable`) and page sizing controls.

### 3. Zero-Dead-End Offline Persistence (Dexie.js / IndexedDB) — [COMPLETED]
- **Implementation**: IndexedDB database layer in [`src/db/database.ts`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/db/database.ts).
- **Features**:
  - Strongly typed tables: `orders`, `clients`, `prospects`, `settings`.
  - Automatic seed migration on first boot with fail-safe fallback to memory state.
  - Reactive live updates via `useLiveQuery` from `dexie-react-hooks`.
  - History event tracking on every state transition.

### 4. Desktop Keyboard Shortcut Matrix & Clipboard Integration — [COMPLETED]
- **Implementation**: Dense desktop shortcuts mapped in [`src/App.tsx`](file:///C:/Users/TheAuditLabs/Desktop/Projects/AuraCAD/src/App.tsx).
- **Matrix**:
  - `J` / `K`: Previous / Next order traversal.
  - `1`–`5`: Rapid status assignment (`1`: Inbox, `2`: In progress, `3`: In Review, `4`: Delivered, `5`: Backlog).
  - `Space`: Quick peek toggle for the right-hand entity drawer.
  - `Esc`: Close modals, drawers, and command palettes.
  - `Ctrl+V` / Paste: Native clipboard image listener that automatically attaches screenshots to the active order.
  - Floating Desktop Shortcuts HUD pill rendered at the bottom-left of the viewport.

### 5. Elimination of AI / Gemini Dependencies — [COMPLETED]
- **Directives Executed**:
  - Removed `@google/genai` dependency and uninstalled AI modules.
  - Removed `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` from `metadata.json`.
  - Replaced AI concepts with deterministic, local FOSS validation logic (e.g. wall thickness checks, carat weight estimation tables).

---

## Next Architectural Horizons & FOSS Enhancements

### 1. Direct 3D CAD File Dropper (`.stl` & `.obj` Loader)
- Integrate Three.js `STLLoader` and `OBJLoader` into `Jewelry3DViewer.tsx`.
- Allow jewelry designers to drag and drop real MatrixGold/Rhino `.stl` or `.obj` exports straight into the browser window for instant viewport visualization.

### 2. Deterministic Jewelry Spec & Casting Safety Calculator
- Implement mathematical formulas in TypeScript for:
  - Metal casting shrinkage allowance (1.5% - 2.5% depending on alloy).
  - Carat-to-gram conversion and gold weight estimation based on ring finger size and shank cross-section dimensions.
  - Wall thickness safety threshold flags (e.g. highlighting warning if shank thickness < 1.0mm for platinum or < 0.8mm for 14K gold).

### 3. FOSS Client Proofing Export (HTML/PDF Invoice & Spec Sheet)
- Generate standalone, client-ready printable HTML / PDF proofing sheets with 3D canvas snapshot and dimension details without any server dependencies.
