# AuraCAD — Launch & Service Operations

## Active Endpoints Matrix

| Layer (Vertical) | 1. Local (Horizontal) | 2. Tailscale Mobile & Remote (Horizontal) |
| :--- | :--- | :--- |
| **1. Frontend (Vite Dev)** | • [http://localhost:3000](http://localhost:3000) *(Vite Dev Server + HMR)* | • [http://100.100.56.31:3000](http://100.100.56.31:3000) *(Direct Encrypted Mesh)* |
| **2. Watcher Bot & Telemetry** | • [http://localhost:4141](http://localhost:4141) *(Reverse Proxy with Error Trap)* | • [http://100.100.56.31:4141](http://100.100.56.31:4141) *(Mobile Testing + Element Quoter)* |
| **3. Backend (PocketBase)** | • **Dashboard (Proxy)**: [http://localhost:3000/_/](http://localhost:3000/_/) *(Recommended)*<br>• **Direct Port**: [http://localhost:8090/_/](http://localhost:8090/_/) | • **Dashboard (Proxy)**: [http://100.100.56.31:3000/_/](http://100.100.56.31:3000/_/) *(Firewall-Free)*<br>• **REST API**: `http://100.100.56.31:8090/api/` |

---

### PocketBase Superuser Credentials
- **Superuser Email**: `dev@auracad.local` *(or username: `dev` in app)*
- **Superuser Password**: `Goto hell 555`
- **Dashboard Direct URL**: [http://localhost:3000/_/](http://localhost:3000/_/) *(or [http://localhost:8090/_/](http://localhost:8090/_/))*
- **Assigned Roles**: `superagent`, `admin`, `designer`, `agent`

---

## Startup & Execution Commands

### 1. Start Development Server (Vite)
```powershell
cd C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD
npm run dev
```
* Binds to `0.0.0.0:3000` for both local and Tailscale access.
* Hot Module Replacement (HMR) active across desktop and mobile browsers.

### 2. Antigravity Watcher Hub Daemon (Reverse Proxy + Error Trap)
```powershell
node "C:\Users\TheAuditLabs\.gemini\config\scripts\agy-watcher-hub.mjs" --proxy 3000
```
* Binds to `0.0.0.0:4141` (`http://localhost:4141` and `http://100.100.56.31:4141`).
* Automatically proxies Vite traffic while injecting the Universal Watcher Bot HUD.
* Captures mobile touch exceptions, unhandled Promise rejections, WebGL crashes, and element quoting.
* Streams triage entries to `agy-triage.json` and feedback to `agy-feedback.json`.

### 3. Production Build & Preview
```powershell
npm run build
npm run preview
```

---

## Mobile Testing Guide (Tailscale)
1. Ensure Tailscale is active on your mobile phone connected to the same tailnet.
2. Open either:
   - **Direct Vite Link**: `http://100.100.56.31:3000`
   - **Watcher Bot Proxy Link**: `http://100.100.56.31:4141` (includes on-screen error HUD & feedback tool)
3. Responsive features active on mobile:
   - Fixed top luxury navigation bar with hamburger drawer.
   - Thumb-friendly bottom dock navigation for instant tab switching (Orders, Designers, Clients, Invoices).
   - Touch-optimized card feeds with direct `tel:` and `mailto:` action buttons.
   - Full-screen sheet drawers for Order Inspections and New Record creation.
