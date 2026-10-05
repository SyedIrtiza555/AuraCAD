sed -i 's/interface OrderListProps {/interface OrderListProps {\n  getClientName: (id: string) => string;/g' src/components/views/List.tsx
sed -i 's/export function OrderList({ orders, onOrderClick, groupBy }: OrderListProps) {/export function OrderList({ orders, onOrderClick, groupBy, getClientName }: OrderListProps) {/g' src/components/views/List.tsx
sed -i 's/interface OrderCalendarProps {/interface OrderCalendarProps {\n  getClientName: (id: string) => string;/g' src/components/views/Calendar.tsx
sed -i 's/export function OrderCalendar({ orders, onOrderClick }: OrderCalendarProps) {/export function OrderCalendar({ orders, onOrderClick, getClientName }: OrderCalendarProps) {/g' src/components/views/Calendar.tsx
