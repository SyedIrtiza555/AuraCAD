# 🧠 Context Room (`/cr`)
**Permanent Schema, Operating Rules, and Functional Guide**

The `cr/` (Context Room) directory is a dedicated, isolated control plane that sits alongside your source code. Its primary purpose is to manage development lifecycles, orchestrate environments, and act as a perfect "save state" for AI-to-Human collaboration. 

By centralizing execution scripts and context here, the main repository root remains completely free of clutter.

---

## 📂 Permanent Schema (The Working Set)

Every file in the Context Room serves a strict, functional purpose. If a document does not actively assist in building, running, or understanding the current state of the app, it does not belong here.

### 1. `control_panel.py` (The Orchestrator)
- **Purpose**: A lightweight, numpad-driven Terminal User Interface (TUI).
- **Usability**: Replaces the need to memorize long CLI commands or open 5 different terminal tabs. With one keystroke, you can spin up the Vite frontend, the PocketBase backend, and secure Cloudflare tunnels, or forcefully kill hung ports.

### 2. `urls.md` (The Endpoint Directory)
- **Purpose**: A categorized list of all active local, Tailscale, and Cloudflare URLs.
- **Usability**: Eliminates the friction of manual URL manipulation when testing Role-Based Access Control (RBAC). Provides instant, clickable links for Owners, Admins, and Designers across any device.

### 3. `launch.md` (The Playbook)
- **Purpose**: The master execution guide detailing port mappings, firewall rules, and background service setup.
- **Usability**: Acts as the ultimate troubleshooting guide. If a remote device cannot connect via Tailscale, this document holds the exact Windows Defender firewall fixes and network diagnostics needed to unblock it.

### 4. `recap.md` (The Save State)
- **Purpose**: A continuous log of session milestones, the active development state, and state transition walkthroughs.
- **Usability**: Allows you (or a fresh AI Agent) to resume work days or weeks later without having to reverse-engineer the Git commit history. It answers: *"What exactly were we working on last?"*

### 5. `build.md` (The Blueprint)
- **Purpose**: Tracks the technical stack, dependency justifications, and native packaging specs (e.g., Tauri/Desktop configurations).
- **Usability**: Prevents technical debt by recording exactly *why* a specific library was chosen, ensuring future architectural decisions align with the original vision.

### 6. `suggestions.md` (The Roadmap)
- **Purpose**: A non-blocking backlog for proactive architectural suggestions and UI/UX improvements.
- **Usability**: Captures fleeting "good ideas" (like a new layout approach or a performance optimization) without derailing the current active task.

---

## ⚖️ Strict Operating Rules

To maintain its effectiveness, the Context Room adheres to these immutable rules:

### Rule 1: The Zero-Clutter Principle
- **Rule**: The `cr/` directory MUST remain strictly isolated from production code. No application source code (`src/`), UI assets, or database schemas are allowed here.
- **Usability**: Prevents development tooling and AI notes from accidentally leaking into production bundles or bloating deployment artifacts.

### Rule 2: The Auto-Synchronization Mandate
- **Rule**: Any time an environment variable, active port, or external tunnel domain changes, `urls.md` and `launch.md` MUST be immediately updated to reflect the new state.
- **Usability**: Prevents hours of lost time debugging "Connection Refused" errors caused by stale documentation. 

### Rule 3: Actionable Over Aspirational (Skimmability)
- **Rule**: Documents must prioritize dense, copy-pasteable commands, raw data, and clickable links over long-winded paragraphs.
- **Usability**: A developer or agent should be able to open any file in the Context Room and find exactly what they need to execute a task within 5 seconds.

### Rule 4: The Checkpoint Protocol
- **Rule**: Before a major development session concludes, `recap.md` must be updated with the current state of the application.
- **Usability**: Guarantees that the project never enters a state of "abandoned confusion", ensuring a smooth handoff between human sessions or AI agents.
