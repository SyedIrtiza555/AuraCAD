import React from 'react';
import { Order, STATUSES, OrderStatus } from '../../types';

interface OrderListProps {
  getClientName: (id: string) => string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  groupBy: 'status' | 'dueDate';
}

export function OrderList({ orders, onOrderClick, groupBy, getClientName }: OrderListProps) {
  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Inception': return 'text-zinc-500';
      case 'CAD Design': return 'text-white';
      case 'Review': return 'text-white';
      case 'Production': return 'text-white';
      case 'Delivered': return 'text-white';
      default: return 'text-zinc-500';
    }
  };

  const renderGroup = (title: string, groupOrders: Order[]) => {
    if (groupOrders.length === 0) return null;
    return (
      <div key={title} className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{title}</h3>
          <div className="h-px bg-zinc-800 flex-1"></div>
          <span className="text-[10px] font-bold text-zinc-600">{groupOrders.length} ORDERS</span>
        </div>
        
        <div className="flex flex-col border-t border-zinc-800">
          {groupOrders.map((order, idx) => {
            const isOverdue = new Date(order.dueDate) < new Date() && order.status !== 'Delivered';
            return (
              <div 
                key={order.id} 
                onClick={() => onOrderClick(order)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="group flex items-center py-6 border-b border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer active:cursor-grabbing"
              >
                <span className="text-zinc-700 font-mono text-xs mr-8 w-6">{String(idx + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase group-hover:text-white truncate">{order.title}</h2>
                    {isOverdue && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 font-bold uppercase tracking-widest border border-red-500/20 whitespace-nowrap">Overdue</span>}
                    {order.priority && (
                      <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest border whitespace-nowrap ${
                        order.priority === 'Urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        order.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        order.priority === 'Medium' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {order.priority}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase"><span className="text-zinc-600">CLIENT /</span> {getClientName(order.clientId)}</p>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase"><span className="text-zinc-600">SALES /</span> {order.closer}</p>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase"><span className="text-zinc-600">DESIGN /</span> {order.designer}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${getStatusColor(order.status)}`}>{order.status}</p>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">DUE: {new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (groupBy === 'status') {
    return (
      <div className="w-full pb-10">
        {STATUSES.map(status => renderGroup(status, orders.filter(o => o.status === status)))}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-[10px] uppercase font-bold tracking-widest">No orders found</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback to un-grouped simple list or alternative grouping if needed
  return (
    <div className="w-full pb-10">
      {renderGroup('All Orders', orders)}
    </div>
  );
}
