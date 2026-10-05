import React from 'react';
import { Order } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { AuraColorRule, getOrderAura } from '../../theme/auraTheme';

interface OrderCalendarProps {
  getClientName: (id: string) => string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onDateChange?: (orderId: string, newDate: string) => void;
  colorRule?: AuraColorRule;
}

export function OrderCalendar({ orders, onOrderClick, getClientName, onDateChange, colorRule = 'status' }: OrderCalendarProps) {
  // Simple calendar generation for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
  
  const daysInMonth = lastDay.getDate();
  const weeks = [];
  let day = 1;

  for (let i = 0; i < 6; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const getOrdersForDay = (d: number) => {
    return orders.filter(o => {
      const orderDate = new Date(o.dueDate);
      return orderDate.getDate() === d && 
             orderDate.getMonth() === month && 
             orderDate.getFullYear() === year;
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-800">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {firstDay.toLocaleString('default', { month: 'long' })} {year}
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 border border-slate-200 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer">
            <ChevronLeft size={14} />
          </button>
          <button className="p-1.5 border border-slate-200 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
        {daysOfWeek.map(d => (
          <div key={d} className="bg-slate-50 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {d}
          </div>
        ))}
        {weeks.map((week, i) => (
          <React.Fragment key={i}>
            {week.map((d, j) => {
              const dayOrders = d ? getOrdersForDay(d) : [];
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              
              const handleDragOver = (e: React.DragEvent) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              };

              const handleDrop = (e: React.DragEvent) => {
                e.preventDefault();
                if (!d || !onDateChange) return;
                const dataStr = e.dataTransfer.getData('application/json');
                if (!dataStr) return;
                const data = JSON.parse(dataStr);
                if (data.type === 'order' && data.id) {
                  const newDate = new Date(year, month, d).toLocaleDateString('en-CA');
                  onDateChange(data.id, newDate);
                }
              };

              return (
                <div 
                  key={`${i}-${j}`} 
                  className={`bg-white min-h-[110px] p-2 hover:bg-slate-50/80 transition-colors ${!d ? 'bg-slate-50/40 opacity-40' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {d && (
                    <>
                      <div className={`text-[11px] font-bold mb-1.5 flex items-center justify-center w-5 h-5 rounded-full ${isToday ? 'bg-[#ff943c] text-white' : 'text-slate-700'}`}>
                        {d}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {dayOrders.map(order => {
                           const isOverdue = new Date(order.dueDate) < new Date() && order.status !== 'Delivered';
                           const aura = getOrderAura(order, colorRule);
                           return (
                            <div 
                              key={order.id}
                              onClick={() => onOrderClick(order)}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              className={`text-[10px] px-2 py-1 rounded-xl cursor-pointer font-medium tracking-tight active:cursor-grabbing border transition-all flex items-center justify-between gap-1.5 shadow-2xs hover:scale-[1.02] ${
                                isOverdue 
                                  ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs' 
                                  : `${aura.glassBg} ${aura.border} text-slate-800 hover:shadow-xs`
                              }`}
                              title={`${order.id} • ${order.title} • ${order.status}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOverdue ? 'bg-rose-500' : aura.dot}`} />
                                <span className="font-mono font-bold text-[9px] text-slate-500 shrink-0">{order.id.split('-')[1]}</span>
                                <span className="truncate">{order.title}</span>
                              </div>
                              {order.value && (
                                <span className="font-mono text-[9px] text-slate-500 shrink-0 tabular-nums">${(order.value / 1000).toFixed(1)}k</span>
                              )}
                            </div>
                           );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
