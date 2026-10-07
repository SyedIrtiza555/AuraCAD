# AuraCAD — Launch & Service Operations

## Active Endpoints Matrix

| Layer (Vertical) | 1. Local (Horizontal) | 2. Tailscale (Horizontal) |
| :--- | :--- | :--- |
| **1. Frontend** | • [http://localhost:3000](http://localhost:3000) *(Vite Dev Server + HMR)* | • [http://100.100.56.31:3000](http://100.100.56.31:3000) *(Encrypted Mesh)* |
| **2. Backend** | • **Dashboard (Proxy)**: [http://localhost:3000/_/](http://localhost:3000/_/) *(Recommended)*<br>• **Direct Port**: [http://localhost:8090/_/](http://localhost:8090/_/)<br>• **Root Redirect**: [http://localhost:8090](http://localhost:8090) | • **Dashboard (Proxy)**: [http://100.100.56.31:3000/_/](http://100.100.56.31:3000/_/) *(Firewall-Free)*<br>• **REST API**: `http://100.100.56.31:8090/api/` |
| **3. Other** | • **Watcher Telemetry**: [http://localhost:4141](http://localhost:4141) | • **Watcher Telemetry**: [http://100.100.56.31:4141](http://100.100.56.31:4141) |

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
* Binds to `0.0.0.0:3000`.
* Injected with `<script src="http://localhost:4141/watcher.js" defer></script>` for autonomous error triage.

### 2. Antigravity Watcher Hub Daemon
```powershell
node "C:\Users\TheAuditLabs\.gemini\config\scripts\agy-watcher-hub.mjs"
```
* Automatically receives browser errors, WebGL crashes, and element quotes from the desktop UI.
* Streams incidents directly into `agy-triage.json` and feedback into `agy-feedback.json`.

### 3. Production Build & Preview
```powershell
npm run build
npm run preview
```

---

## Authentication & GitHub Access
* **GitHub CLI (`gh`)**: Installed and authenticated as `SyedIrtiza555`.
* **Git Credential Manager**: Integrated with stored Personal Access Token for seamless non-interactive `git pull` / `git push`.
