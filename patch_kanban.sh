sed -i 's/interface ColumnProps {/interface ColumnProps {\n  getClientName: (id: string) => string;/g' src/components/Kanban.tsx
sed -i 's/interface OrderCardProps {/interface OrderCardProps {\n  getClientName: (id: string) => string;/g' src/components/Kanban.tsx
sed -i 's/function Column({ status, orders, onOrderClick, onStatusChange }: ColumnProps) {/function Column({ status, orders, onOrderClick, onStatusChange, getClientName }: ColumnProps) {/g' src/components/Kanban.tsx
sed -i 's/function OrderCard({ order, idx, onClick }: OrderCardProps) {/function OrderCard({ order, idx, onClick, getClientName }: OrderCardProps) {/g' src/components/Kanban.tsx
sed -i 's/onStatusChange={onStatusChange}/onStatusChange={onStatusChange}\n          getClientName={getClientName}/g' src/components/Kanban.tsx
sed -i 's/onClick={() => onOrderClick(order)}/onClick={() => onOrderClick(order)}\n            getClientName={getClientName}/g' src/components/Kanban.tsx
