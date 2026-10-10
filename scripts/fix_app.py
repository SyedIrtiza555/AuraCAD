import re
import sys

def main():
    file_path = r"C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD\src\App.tsx"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update validRoles
    content = content.replace(
        "const validRoles: UserRole[] = ['owner', 'admin', 'superagent', 'designer', 'agent'];",
        "const validRoles: UserRole[] = ['owner', 'admin', 'designer'];"
    )

    # 2. Update RoleMeta
    role_meta_old = """    superagent: {
      label: 'Superagent (Manager)',
      badgeColor: 'indigo',
      icon: <Shield size={14} className="text-indigo-400" />,
      desc: 'Pipeline oversight, quality review & approvals'
    },"""
    content = content.replace(role_meta_old, "")

    role_meta_agent = """    agent: {
      label: 'Agent (Client Intake)',
      badgeColor: 'teal',
      icon: <UserCheck size={14} className="text-emerald-400" />,
      desc: 'Client portfolio, new bespoke orders & feedback'
    }"""
    content = content.replace(role_meta_agent, "")

    # Remove the comma after designer
    content = content.replace(
        """    designer: {
      label: 'Designer (CAD)',
      badgeColor: 'purple',
      icon: <Compass size={14} className="text-purple-400" />,
      desc: 'Assigned CAD orders, stage updates & revisions'
    },""",
        """    designer: {
      label: 'Designer (CAD)',
      badgeColor: 'purple',
      icon: <Compass size={14} className="text-purple-400" />,
      desc: 'Assigned CAD orders, stage updates & revisions'
    }"""
    )


    # 3. Handle `newRole === 'agent'` logic
    agent_logic = """    } else if (newRole === 'agent') {
      setCurrentModule('prospects');"""
    content = content.replace(agent_logic, "")


    # 4. Remove Prospects tab title comment reference
    content = content.replace(
        "{/* 3. Prospects Tab (Owner, Admin, Superagent, Agent) */}",
        "{/* 3. Prospects Tab (Owner, Admin) */}"
    )

    # 5. Dropdown validRoles mapping
    content = content.replace(
        "{(['owner', 'superagent', 'admin', 'designer', 'agent'] as UserRole[]).map((r) => {",
        "{(['owner', 'admin', 'designer'] as UserRole[]).map((r) => {"
    )

    # 6. Remove B. Superagent Quality Review & Approvals Banner
    superagent_banner_pattern = re.compile(r"\{\/\* B\. Superagent Quality Review & Approvals Banner \*\/.*?\}\)\s*\}", re.DOTALL)
    content = superagent_banner_pattern.sub("", content)

    # 7. Hide role switcher for non-owners.
    # We find the quick switch UI and wrap it in activeRole === 'owner'.
    # The switcher is currently in Top Navbar (around line 630):
    switcher_target = """{/* Quick Role Switcher (Digital Office Tooling) */}
          <Menu shadow="md" width={240} position="bottom-end">
            <Menu.Target>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#12141c] border border-slate-200 dark:border-[#1a1d28] hover:bg-slate-200 dark:hover:bg-[#1a1d28] transition-colors cursor-pointer group">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  activeRole === 'owner' ? 'bg-amber-500/20 text-amber-500' :
                  activeRole === 'superagent' ? 'bg-indigo-500/20 text-indigo-500' :
                  activeRole === 'admin' ? 'bg-blue-500/20 text-blue-500' :
                  activeRole === 'designer' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-teal-500/20 text-teal-500'
                }`}>
                  {roleMeta[activeRole]?.icon}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-bold font-mono uppercase text-slate-800 dark:text-slate-200 leading-tight">
                    {activeRole === 'designer' ? currentDesigner.code : activeRole}
                  </span>
                </div>
                <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-1" />
              </button>
            </Menu.Target>

            <Menu.Dropdown className="bg-white dark:bg-[#0a0b10] border-slate-200 dark:border-[#1a1d28]">
              <div className="p-2 border-b border-slate-100 dark:border-[#1a1d28] mb-1">
                <Menu.Label className="text-[9px] uppercase tracking-wider font-bold mb-1">
                  Active UI Role Perspective
                </Menu.Label>

                {(['owner', 'admin', 'designer'] as UserRole[]).map((r) => {
                  const meta = roleMeta[r];
                  const isCurrent = activeRole === r;
                  return (
                    <Menu.Item
                      key={r}
                      onClick={() => handleSwitchRole(r)}
                      leftSection={
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isCurrent ? 'bg-slate-100 dark:bg-[#1a1d28]' : ''}`}>
                          {meta?.icon}
                        </div>
                      }
                      rightSection={isCurrent && <Check size={14} className="text-emerald-500" />}
                      className={isCurrent ? 'bg-slate-50 dark:bg-[#12141c]' : ''}
                    >
                      <div>
                        <div className={`font-semibold text-xs ${isCurrent ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                          {meta?.label}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {meta?.desc}
                        </div>
                      </div>
                    </Menu.Item>
                  );
                })}
              </div>
              <div className="p-1">
                <Menu.Item 
                  leftSection={<ExternalLink size={12} />}
                  onClick={() => setIsRoleManagerOpen(true)}
                  className="text-[10px] font-bold text-slate-500"
                >
                  Manage User Database...
                </Menu.Item>
              </div>
            </Menu.Dropdown>
          </Menu>"""
          
    # Wrap in {activeRole === 'owner' && ( ... )}
    if "{/* Quick Role Switcher (Digital Office Tooling) */}" in content:
        # Extract the whole menu block
        start_idx = content.find("{/* Quick Role Switcher (Digital Office Tooling) */}")
        end_idx = content.find("</Menu>", start_idx) + len("</Menu>")
        menu_block = content[start_idx:end_idx]
        
        # Replace the superagent / agent bg colors from the icon display inside the button
        new_menu_block = menu_block.replace("activeRole === 'superagent' ? 'bg-indigo-500/20 text-indigo-500' :", "")
        new_menu_block = new_menu_block.replace("activeRole === 'designer' ? 'bg-purple-500/20 text-purple-500' :", "activeRole === 'designer' ? 'bg-purple-500/20 text-purple-500' :")
        new_menu_block = new_menu_block.replace("'bg-teal-500/20 text-teal-500'", "'bg-slate-500/20 text-slate-500'")
        
        # Also remove agent and superagent from validRoles map
        new_menu_block = new_menu_block.replace("['owner', 'superagent', 'admin', 'designer', 'agent']", "['owner', 'admin', 'designer']")
        
        wrapped_menu_block = "{activeRole === 'owner' && (\n" + "\n".join(["          " + line for line in new_menu_block.splitlines()]) + "\n        )}"
        content = content[:start_idx] + wrapped_menu_block + content[end_idx:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
