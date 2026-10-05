import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, FileText, Mail, Upload, Image as ImageIcon, CircleDot } from 'lucide-react';
import { Order, OrderStatus, STATUSES, Client, OrderHistoryEvent } from '../types';
import { OrderPictureCarousel } from './OrderPictureCarousel';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<Order>) => void;
  order?: Order | null;
  clients: Client[];
}

export function OrderModal({ isOpen, onClose, onSave, order, clients }: OrderModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files) as File[];
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFiles = (files: File[]) => {
    const newImages = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => URL.createObjectURL(f));
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImages]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };
  const [formData, setFormData] = useState<Partial<Order>>({
    title: '',
    clientId: '',
    closer: '',
    designer: '',
    production: '',
    status: 'Inbox',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    images: [],
    history: []
  });

  useEffect(() => {
    if (order) {
      setFormData(order);
    } else {
      setFormData({
        title: '',
        clientId: clients[0]?.id || '',
        closer: 'Jerry',
        designer: 'Hamza',
        production: 'Marcus Forge',
        status: 'Inbox',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
        ],
        history: [{ status: 'Inbox', date: new Date().toISOString() }]
      });
    }
  }, [order, clients]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Subtle, non-intrusive backdrop allowing user to click outside to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-14">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-xl xl:max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden text-slate-800"
          >
            <div className="flex items-center justify-between p-5 px-6 border-b border-slate-200 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight uppercase text-slate-900">
                {order ? 'Edit Order' : 'New Order'}
              </h2>
              {order && (
                <OrderStatusBadge 
                  order={{ 
                    status: formData.status || order.status, 
                    dueDate: formData.dueDate || order.dueDate, 
                    createdAt: order.createdAt 
                  }}
                  variant="pill"
                  size="sm"
                  showCountdownHint={true}
                />
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Project Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-transparent border-b border-slate-300 pb-2 text-xl font-bold uppercase text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#ff943c] transition-colors"
                  placeholder="e.g. 2ct Oval Halo"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Client</label>
                  <select
                    value={formData.clientId}
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff943c] transition-colors"
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                  <select
                    value={formData.priority || 'Medium'}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff943c] transition-colors"
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Due Date</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff943c] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Team Allocation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sales / Closer</label>
                  <div className="flex flex-wrap gap-2">
                    {['Jerry', 'Ryan', 'Alex'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({...formData, closer: name})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${formData.closer === name ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CAD Designer</label>
                  <div className="flex flex-wrap gap-2">
                    {['Abdullah', 'Farooq', 'Muneeb', 'Hamza'].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({...formData, designer: name})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${formData.designer === name ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Production</label>
                  <input 
                    type="text"
                    value={formData.production}
                    onChange={e => setFormData({...formData, production: e.target.value})}
                    placeholder="Marcus Forge"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff943c]"
                  />
                </div>
              </div>
            </div>

            {/* Picture Carousel & Image Manager */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Project Visuals ({formData.images?.length || 0})
              </label>

              {formData.images && formData.images.length > 0 && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2">
                  <OrderPictureCarousel 
                    images={formData.images} 
                    title={formData.title} 
                    onRemoveImage={removeImage}
                    allowZoom={true}
                  />
                </div>
              )}

              {/* Upload Drop Zone */}
              <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-[#ff943c] bg-amber-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={e => e.target.files && handleFiles(Array.from(e.target.files))}
                  className="hidden" 
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload size={18} className="text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Drop jewelry renders or click to browse</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP supported</span>
                </label>
              </div>
            </div>

            {/* Status and Notes */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Order Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#ff943c] transition-colors"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Design Notes & Specs</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 px-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4 shrink-0">
            <div className="relative">
              {order && (
                <button 
                  type="button"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${showQuickActions ? 'bg-[#ff943c] text-white border-[#ff943c]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                >
                  <Zap size={13} className={showQuickActions ? 'fill-white' : ''} /> Quick Actions
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  onSave(formData);
                  onClose();
                }}
                className="px-5 py-1.5 rounded-full bg-[#ff943c] hover:bg-[#e07d2c] text-white font-bold text-xs tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {order ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
