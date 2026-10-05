import React from 'react';
import { Order } from '../../types';

interface TeamViewProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

export function TeamView({ orders, onOrderClick }: TeamViewProps) {
  const designers = ['Abdullah', 'Farooq', 'Muneeb', 'Hamza'];

  return (
    <div className="flex gap-5 h-full overflow-x-auto pb-8 snap-x text-slate-800">
      {designers.map(designer => {
        const designerOrders = orders.filter(o => o.designer === designer && o.status !== 'Delivered');
        return (
          <div key={designer} className="flex-1 min-w-[300px] max-w-[380px] flex flex-col bg-white rounded-2xl border border-slate-200 p-5 snap-start shadow-sm">
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shadow-xs">
                {designer.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">{designer}</h3>
                <p className="text-[10px] text-slate-500 font-mono uppercase">{designerOrders.length} active orders</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 overflow-y-auto">
              {designerOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-[10px] font-mono uppercase tracking-widest border border-dashed border-slate-200 rounded-xl">No Active Orders</div>
              ) : (
                designerOrders.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => onOrderClick(order)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{order.id}</span>
                      <span className="text-[9px] font-mono font-bold text-amber-800 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{order.status}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 tracking-tight line-clamp-2">{order.title}</h4>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
