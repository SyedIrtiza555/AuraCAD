# 🗜️ TOON (Token-Optimized Object Notation) & CSV Data Standard
**For AI Context Window Optimization**

When generating, storing, or passing large amounts of data, logs, or schemas for AI consumption, strictly use the **TOON** and **CSV** formatting rules below.

## 🎯 Usability Purpose
To drastically reduce token bloat, prevent AI context-window exhaustion, and speed up generation times during complex multi-agent workflows.

---

### 1. Large Relational Objects -> Strictly CSV
Never use JSON arrays of objects or Markdown tables for large relational datasets. CSV uses ~60% fewer tokens.

**❌ Bad (Token Heavy - JSON)**
```json
[
  {"id": "FU-CA-1", "status": "Pending", "effort": "High"},
  {"id": "ER-VC-2", "status": "Designing", "effort": "Low"}
]
```

**❌ Bad (Token Heavy - Markdown)**
```markdown
| id | status | effort |
|---|---|---|
| FU-CA-1 | Pending | High |
```

**✅ Good (TOON Standard - CSV)**
```csv
id,status,effort
FU-CA-1,Pending,High
ER-VC-2,Designing,Low
```
*Rule: Use a single header row. No spaces after commas. No quotes unless the value contains a comma.*

---

### 2. TOON (Token-Optimized Object Notation) for Metadata
For deep, non-relational configurations or single objects, use **TOON**: A hybrid of minified YAML/JSON stripped of all formatting fat.

**Rules of TOON:**
1. No quotes around keys.
2. No quotes around string values unless they contain spaces or special characters.
3. 2-space indentation (no tabs).
4. No trailing commas.
5. Arrays are inline comma-separated strings bracketed `[]` if simple, or standard CSV if complex.

**❌ Bad (Standard JSON)**
```json
{
  "project_name": "AuraCAD",
  "version": "1.0.0",
  "features": [
    "rbac",
    "cad_viewer"
  ],
  "active": true
}
```

**✅ Good (TOON Format)**
```text
project_name: AuraCAD
version: 1.0.0
features: [rbac,cad_viewer]
active: true
```
