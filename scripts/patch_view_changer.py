import re

def main():
    file_path = r"C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD\src\App.tsx"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    if "FloatingViewChanger" not in content:
        import_replacement = """import { InvoicesTableView } from './components/digital-office/InvoicesTableView';
import { FloatingViewChanger, ViewMode } from './components/digital-office/FloatingViewChanger';
import { UniversalDataView } from './components/digital-office/UniversalDataView';
"""
        content = content.replace("import { InvoicesTableView } from './components/digital-office/InvoicesTableView';", import_replacement)

    # 2. View Mode state
    if "const [viewMode, setViewMode] = useState<ViewMode>('table');" not in content:
        state_replacement = """  const [orderViewMode, setOrderViewMode] = useState<'table' | 'details'>('table');
  const [viewMode, setViewMode] = useState<ViewMode>('table');"""
        content = content.replace("  const [orderViewMode, setOrderViewMode] = useState<'table' | 'details'>('table');", state_replacement)


    # 3. Remove old orderViewMode buttons
    old_buttons = """            {currentModule === 'orders' && selectedOrder && (
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-[#12141c] border border-slate-200 dark:border-[#262938] text-xs">
                <button
                  onClick={() => setOrderViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    orderViewMode === 'table'
                      ? 'bg-white dark:bg-[#1a1d28] text-[#29aae0] shadow-xs'
                      : 'text-slate-600 dark:text-[#8c8fa3] hover:text-slate-900'
                  }`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setOrderViewMode('details')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    orderViewMode === 'details'
                      ? 'bg-white dark:bg-[#1a1d28] text-[#29aae0] shadow-xs'
                      : 'text-slate-600 dark:text-[#8c8fa3] hover:text-slate-900'
                  }`}
                >
                  Details Section
                </button>
              </div>
            )}"""
    content = content.replace(old_buttons, "")


    # 4. Replace content area with UniversalDataView logic
    content_area = """          {currentModule === 'orders' && (
            <OrdersTable 
              orders={displayedOrders}
              onSelectOrder={(ord) => handleSelectOrder(ord)}
              onUpdateStatus={handleUpdateOrderStatus}
              hideFinancials={isDesigner}
            />
          )}

          {currentModule === 'designers' && canViewDesigners && (
            <DesignersTableView 
              designers={designers}
              orders={orders}
              onOpenNewDesignerModal={() => setIsNewDesignerOpen(true)}
              onSelectOrder={handleSelectOrder}
              onDeleteDesigner={handleDeleteDesigner}
            />
          )}

          {currentModule === 'prospects' && canViewProspects && (
            <ProspectsTableView 
              prospects={prospects}
              orders={orders}
              onOpenNewProspectModal={() => setIsNewProspectOpen(true)}
              onSelectOrder={handleSelectOrder}
              onDeleteProspect={handleDeleteProspect}
              onCreateOrderForProspect={handleCreateOrderForProspect}
            />
          )}

          {currentModule === 'invoices' && canViewInvoices && (
            <InvoicesTableView 
              invoices={invoices}
              orders={orders}
              prospects={prospects}
              onSelectOrder={handleSelectOrder}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          )}"""

    new_content_area = """          {viewMode === 'table' ? (
            <>
              {currentModule === 'orders' && (
                <OrdersTable 
                  orders={displayedOrders}
                  onSelectOrder={(ord) => handleSelectOrder(ord)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  hideFinancials={isDesigner}
                />
              )}

              {currentModule === 'designers' && canViewDesigners && (
                <DesignersTableView 
                  designers={designers}
                  orders={orders}
                  onOpenNewDesignerModal={() => setIsNewDesignerOpen(true)}
                  onSelectOrder={handleSelectOrder}
                  onDeleteDesigner={handleDeleteDesigner}
                />
              )}

              {currentModule === 'prospects' && canViewProspects && (
                <ProspectsTableView 
                  prospects={prospects}
                  orders={orders}
                  onOpenNewProspectModal={() => setIsNewProspectOpen(true)}
                  onSelectOrder={handleSelectOrder}
                  onDeleteProspect={handleDeleteProspect}
                  onCreateOrderForProspect={handleCreateOrderForProspect}
                />
              )}

              {currentModule === 'invoices' && canViewInvoices && (
                <InvoicesTableView 
                  invoices={invoices}
                  orders={orders}
                  prospects={prospects}
                  onSelectOrder={handleSelectOrder}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                />
              )}
            </>
          ) : (
            <UniversalDataView 
              module={currentModule}
              viewMode={viewMode}
              data={
                currentModule === 'orders' ? displayedOrders :
                currentModule === 'designers' ? designers :
                currentModule === 'prospects' ? prospects :
                invoices
              }
              onItemClick={(item) => currentModule === 'orders' ? handleSelectOrder(item) : null}
            />
          )}"""

    content = content.replace(content_area, new_content_area)

    # 5. Add FloatingViewChanger inside <main> just before </main>
    if "<FloatingViewChanger" not in content:
        content = content.replace("</main>", "\n        <FloatingViewChanger currentView={viewMode} onChange={setViewMode} />\n      </main>")


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
