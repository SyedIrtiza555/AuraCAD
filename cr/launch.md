# AuraCAD — Launch & Service Operations

## Active Endpoints

| Service | Target URL | Protocol & Ports | Status |
| :--- | :--- | :--- | :--- |
| **Vite App (Local)** | [http://localhost:3000](http://localhost:3000) | `HTTP/HMR :3000` | **ONLINE** |
| **Vite App (Tailscale Mesh)** | [http://100.100.56.31:3000](http://100.100.56.31:3000) | `Encrypted Mesh :3000` | **ONLINE** |
| **Antigravity Watcher Telemetry** | [http://localhost:4141](http://localhost:4141) | `HTTP Telemetry :4141` | **ONLINE** |
| **Watcher Telemetry (Tailnet)** | [http://100.100.56.31:4141](http://100.100.56.31:4141) | `Mesh Telemetry :4141` | **ONLINE** |

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
