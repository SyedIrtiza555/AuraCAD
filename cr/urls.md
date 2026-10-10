# 🌐 AuraCAD Digital Office - Environment URLs

## 1. Frontend (Vite Dev Server)
- **Local:** http://localhost:3000
- **Tailscale:** http://100.100.56.31:3000
- **Cloudflare:** https://rise-gamecube-tobacco-comprehensive.trycloudflare.com

## 2. Backend (PocketBase API & DB)
- **Local Proxy:** http://localhost:3000/_/
- **Local Direct:** http://localhost:8090/_/
- **Cloudflare Proxy:** https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/_/

## 3. Role-Based Testing URLs (RBAC)
- **Owner (God User):**
  - Local: http://localhost:3000/?role=owner
  - Remote: https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=owner
- **Admin (Operations):**
  - Local: http://localhost:3000/?role=admin
  - Remote: https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=admin
- **Designer (CAD Artisan):**
  - Local: http://localhost:3000/?role=designer
  - Remote: https://rise-gamecube-tobacco-comprehensive.trycloudflare.com/?role=designer
