# AuraCAD — Launch & Service Operations

## Active Endpoints Matrix

| Layer (Vertical) | 1. Local (Horizontal) | 2. Cloudflare Tunnel (Zero-Firewall / Mobile) | 3. Tailscale Mesh (Encrypted) |
| :--- | :--- | :--- | :--- |
| **1. Frontend (Vite Dev)** | • [http://localhost:3000](http://localhost:3000) *(Vite Dev Server + HMR)* | • [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com) *(Instant Mobile/Anywhere)* | • [http://100.100.56.31:3000](http://100.100.56.31:3000) *(Direct Tailnet)* |
| **2. Backend (PocketBase)** | • **Dashboard (Proxy)**: [http://localhost:3000/_/](http://localhost:3000/_/)<br>• **Direct Port**: [http://localhost:8090/_/](http://localhost:8090/_/) | • **Dashboard (Proxy)**: [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/_/](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/_/)<br>• **REST API**: `/api/...` (Auto-Proxied) | • **Dashboard (Proxy)**: [http://100.100.56.31:3000/_/](http://100.100.56.31:3000/_/)<br>• **Direct Port**: `http://100.100.56.31:8090/_/` |

---

## 🎭 Role-Based UI Direct URLs Matrix

| Role | Local URL | Cloudflare Mobile / Any Device URL | Tailscale URL | Capabilities & Views |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Owner (God)** | [http://localhost:3000/?role=owner](http://localhost:3000/?role=owner) | [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=owner](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=owner) | [http://100.100.56.31:3000/?role=owner](http://100.100.56.31:3000/?role=owner) | Full studio suite: Pipeline KPI ribbon, gross financials, all 4 modules, DB reseed, PB console |
| **🛡️ Superagent (Manager)** | [http://localhost:3000/?role=superagent](http://localhost:3000/?role=superagent) | [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=superagent](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=superagent) | [http://100.100.56.31:3000/?role=superagent](http://100.100.56.31:3000/?role=superagent) | Manager review gate: Orders in review, urgent bottlenecks, 1-click approvals (Billing isolated) |
| **📋 Admin (Operations)** | [http://localhost:3000/?role=admin](http://localhost:3000/?role=admin) | [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=admin](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=admin) | [http://100.100.56.31:3000/?role=admin](http://100.100.56.31:3000/?role=admin) | Operations: Orders, designer assignment, client onboarding, billing status updates |
| **🎨 Designer (CAD)** | [http://localhost:3000/?role=designer](http://localhost:3000/?role=designer) | [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=designer](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=designer) | [http://100.100.56.31:3000/?role=designer](http://100.100.56.31:3000/?role=designer) | Artisan workbench: Assigned orders only (FU/ER/MA/AT), status stepper, revisions (Financials masked) |
| **🤝 Agent (Client Intake)** | [http://localhost:3000/?role=agent](http://localhost:3000/?role=agent) | [https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=agent](https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=agent) | [http://100.100.56.31:3000/?role=agent](http://100.100.56.31:3000/?role=agent) | Client CRM: Prospects directory, new bespoke order intake (3-part PK generator), change requests |

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
npm run dev -- --host 0.0.0.0 --port 3000
```
* Binds to `0.0.0.0:3000` with `allowedHosts: true` for both local, Cloudflare, and Tailscale access.
* Hot Module Replacement (HMR) active across desktop and mobile browsers.

### 2. Cloudflare Tunnel (Zero-Configuration Remote & Phone Testing)
```powershell
& "$env:TEMP\cloudflared.exe" tunnel --url http://127.0.0.1:3000
```

### 3. Tailscale Native Firewall Fix (One-Time PowerShell as Admin)
If you want to access directly via `http://100.100.56.31:3000` over Tailscale:
```powershell
Set-NetFirewallRule -DisplayName "Node.js JavaScript Runtime" -Profile Any
```
*(Windows Firewall defaults to blocking connections on the Private profile where Tailscale resides unless this rule is set).*
