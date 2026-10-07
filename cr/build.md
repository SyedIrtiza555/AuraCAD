# AuraCAD — Technical Architecture & Build Specification

## System Overview & Target
- **Target OS**: Desktop only (Windows 11 / x64)
- **Application Category**: Jewelry CAD Studio & Bespoke Order Management Engine
- **Aesthetic**: Liquid glass, ambient glowing aura borders, dark/light theme persistence, high-density ergonomics

---

## Technical Stack & Dependency Justification

| Dependency | Version | Purpose & Rationale |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.1` | Modern concurrent rendering, transitions, and component composition |
| `vite` | `^6.2.3` | Instant HMR (<700ms), lightning-fast ES module bundler |
| `tailwindcss` / `@tailwindcss/vite` | `^4.1.14` | High-performance CSS engine with atomic utility tokens and native glassmorphism styling |
| `three` / `@types/three` | `^0.186.1` | Procedural 3D WebGL CAD jewelry inspector with PBR alloy metals & refractive gemstones |
| `@tanstack/react-table` | `^8.21.3` | High-performance headless data table with multi-sort, batch actions, and density toggle |
| `dexie` / `dexie-react-hooks` | `^4.4.6` | Offline-first IndexedDB persistence engine with zero data dead-ends |
| `pocketbase` | `^0.25.2` | High-performance Go/SQLite backend with real-time subscriptions, auth, and role management |
| `motion` (Framer Motion) | `^12.23.24` | Fluid liquid animations, accordion peeks, and modal transitions |
| `lucide-react` | `^0.546.0` | Clean vector iconography aligned with luxury jewelry metaphors |
| `@radix-ui/react-tabs` | `^1.1.21` | Accessible primitive for multi-module switching |
| `@radix-ui/react-dropdown-menu` | `^2.1.24` | Headless, accessible context menus and status pickers |
| `uuid` | `^14.0.1` | Collision-free entity IDs for orders, messages, and prospects |

---

## Bundle Metrics & Performance

- **Production Build Time**: ~13.6 seconds (Vite 6 / Rollup)
- **HTML Footprint**: `0.72 kB` (gzip: `0.36 kB`)
- **Stylesheet Footprint**: `105.59 kB` (gzip: `14.96 kB`)
- **JavaScript Bundle**: `540.45 kB` (gzip: `154.05 kB`)
- **Cold Boot Time**: `651 ms`

---

## Native Desktop Packaging Specs (Tauri v2 / Windows)

To package AuraCAD as a high-performance native Windows executable (`.exe` / `.msi`):
1. **Runner**: Tauri v2 with WebView2 runtime.
2. **Resource Footprint**: Minimal (~30MB RAM vs 300MB+ for Electron).
3. **Local Filesystem Access**: Native file dialogues for `.stl`, `.3dm`, and `.obj` CAD asset exports and imports.
4. **Window Ergonomics**: Frameless acrylic / Mica window chrome with custom title bar buttons matching the liquid glass theme.
