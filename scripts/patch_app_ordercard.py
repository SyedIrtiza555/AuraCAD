import re

def main():
    file_path = r"C:\Users\TheAuditLabs\Desktop\Projects\AuraCAD\src\App.tsx"
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Imports
    content = content.replace(
        "import { OrderDetailDrawer } from './components/digital-office/OrderDetailDrawer';",
        ""
    )
    content = content.replace(
        "import { OrderDetailsSection } from './components/digital-office/OrderDetailsSection';",
        "import { OrderCard } from './components/digital-office/OrderCard';"
    )

    # State for Card view
    state_to_add = """  const [orderViewMode, setOrderViewMode] = useState<'table' | 'details'>('table');
  const [cardViewMode, setCardViewMode] = useState<'sidepeek' | 'center' | 'fullscreen' | 'inline'>('sidepeek');
  const [cardSize, setCardSize] = useState<'narrow' | 'default' | 'wide'>('default');"""
    
    content = content.replace(
        "const [orderViewMode, setOrderViewMode] = useState<'table' | 'details'>('table');",
        state_to_add
    )

    # Content Area
    old_details_section = """          {currentModule === 'orders' && (
            orderViewMode === 'details' && selectedOrder ? (
              <div className="max-w-5xl mx-auto space-y-4">
                <button
                  onClick={() => setOrderViewMode('table')}
                  className="text-xs text-[#29aae0] hover:underline flex items-center gap-1 cursor-pointer font-semibold mb-2"
                >
                  ← Back to Orders Table
                </button>
                <OrderDetailsSection 
                  order={selectedOrder}
                  designers={designers}
                  prospects={prospects}
                  invoices={invoices}
                  corrections={corrections}
                  statusHistory={statusHistory}
                  onClose={() => setOrderViewMode('table')}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onUpdateDesigner={handleUpdateOrderDesigner}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onAddCorrection={handleAddCorrection}
                  hideFinancials={isDesigner}
                  hideClientContact={isDesigner}
                />
              </div>
            ) : (
              <OrdersTable 
                orders={displayedOrders}
                onSelectOrder={(ord) => handleSelectOrder(ord)}
                onUpdateStatus={handleUpdateOrderStatus}
                hideFinancials={isDesigner}
              />
            )
          )}"""

    new_details_section = """          {currentModule === 'orders' && (
            <OrdersTable 
              orders={displayedOrders}
              onSelectOrder={(ord) => handleSelectOrder(ord)}
              onUpdateStatus={handleUpdateOrderStatus}
              hideFinancials={isDesigner}
            />
          )}"""

    content = content.replace(old_details_section, new_details_section)

    # Drawer replacement
    old_drawer = """      {/* Flyout Drawer for Order Inspector */}
      <OrderDetailDrawer 
        order={selectedOrder}
        designers={designers}
        prospects={prospects}
        invoices={invoices}
        corrections={corrections}
        statusHistory={statusHistory}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdateDesigner={handleUpdateOrderDesigner}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        onAddCorrection={handleAddCorrection}
        hideFinancials={isDesigner}
        hideClientContact={isDesigner}
      />"""

    new_drawer = """      {/* Unified Order Card Modal/Drawer */}
      <OrderCard 
        order={selectedOrder}
        designers={designers}
        prospects={prospects}
        invoices={invoices}
        corrections={corrections}
        statusHistory={statusHistory}
        role={activeRole}
        viewMode={cardViewMode}
        size={cardSize}
        onViewModeChange={(m) => setCardViewMode(m)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdateDesigner={handleUpdateOrderDesigner}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        onAddCorrection={handleAddCorrection}
      />"""

    content = content.replace(old_drawer, new_drawer)

    # Breadcrumb clean up (remove details mode tracking)
    breadcrumb_old = "{currentModule === 'orders' && (orderViewMode === 'details' && selectedOrder ? `Order: ${selectedOrder.order_code}` : (isDesigner ? `${currentDesigner.name} (${currentDesigner.code}) CAD Bench` : 'Bespoke Studio Orders'))}"
    breadcrumb_new = "{currentModule === 'orders' && (isDesigner ? `${currentDesigner.name} (${currentDesigner.code}) CAD Bench` : 'Bespoke Studio Orders')}"
    content = content.replace(breadcrumb_old, breadcrumb_new)


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
