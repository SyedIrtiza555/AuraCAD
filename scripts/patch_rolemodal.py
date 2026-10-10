import re

def main():
    file_path = r"C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD\src\components\RoleManagementModal.tsx"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Props type
    content = content.replace(
        "activeRoleView: 'all' | 'admin' | 'designer' | 'agent' | 'superagent';",
        "activeRoleView: 'all' | 'admin' | 'designer';"
    )
    content = content.replace(
        "onSelectRoleView: (roleView: 'all' | 'admin' | 'designer' | 'agent' | 'superagent') => void;",
        "onSelectRoleView: (roleView: 'all' | 'admin' | 'designer') => void;"
    )

    # 2. Remove role filter buttons for superagent and agent
    superagent_button = """              <button
                onClick={() => onSelectRoleView('superagent')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'superagent'
                    ? 'bg-indigo-500/10 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-300 mb-1">
                  <Shield size={14} />
                  <span>Superagent</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Senior manager: pipeline oversight, review & approvals
                </p>
              </button>"""
    
    agent_button = """              <button
                onClick={() => onSelectRoleView('agent')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRoleView === 'agent'
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                  <UserCheck size={14} />
                  <span>Agent</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Client intake: prospect directory, new orders & feedback
                </p>
              </button>"""

    content = content.replace(superagent_button, "")
    content = content.replace(agent_button, "")

    # 3. Remove from <option> lists
    content = content.replace('<option value="agent">Agent (Client Intake)</option>', "")
    content = content.replace('<option value="superagent">Superagent (Manager)</option>', "")
    content = content.replace('<option value="agent">Agent</option>', "")
    

    # 4. Remove from user list badge rendering
    content = content.replace(
        """                              u.role === 'owner'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-700 dark:text-amber-300'
                                : u.role === 'superagent'
                                ? 'bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:border-indigo-700 dark:text-indigo-300'
                                : u.role === 'admin'
                                ? 'bg-blue-500/10 text-blue-700 border-blue-300 dark:border-blue-700 dark:text-blue-300'
                                : u.role === 'designer'
                                ? 'bg-purple-500/10 text-purple-700 border-purple-300 dark:border-purple-700 dark:text-purple-300'
                                : 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-700 dark:text-emerald-300'""",
        """                              u.role === 'owner'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-700 dark:text-amber-300'
                                : u.role === 'admin'
                                ? 'bg-blue-500/10 text-blue-700 border-blue-300 dark:border-blue-700 dark:text-blue-300'
                                : 'bg-purple-500/10 text-purple-700 border-purple-300 dark:border-purple-700 dark:text-purple-300'"""
    )
    
    content = content.replace(
        "{u.role === 'owner' ? 'OWNER (GOD)' : u.role === 'superagent' ? 'MANAGER' : u.role.toUpperCase()}",
        "{u.role === 'owner' ? 'OWNER (GOD)' : u.role.toUpperCase()}"
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
