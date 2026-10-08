// src/types.ts
// Digital Office System Data Types (Strict ER Alignment)

export type OrderStatus = 'Pending' | 'Designing' | 'Review' | 'Completed' | 'Cancelled';

export type EffortLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Designer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialty?: string;
}

export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  created_at: string;
  due_date?: string;
}

export interface CorrectionAttachment {
  id: string;
  correction_id: string;
  file_url: string;
  file_name?: string;
  file_size?: string;
}

export interface Correction {
  id: string;
  order_id: string;
  message: string;
  created_at: string;
  author_name?: string;
  attachments: CorrectionAttachment[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  start_date: string;
  end_date: string | null; // null for currently active status
}

export interface Order {
  id: string;
  order_code: string;
  name: string;
  status: OrderStatus;
  effort_level: EffortLevel;
  order_value: number;
  created_at: string;
  designer_id: string;
  prospect_id: string;
  
  // In-memory or resolved relationships
  designer?: Designer;
  prospect?: Prospect;
  invoice?: Invoice;
  corrections?: Correction[];
  status_history?: OrderStatusHistory[];
}

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Designing',
  'Review',
  'Completed',
  'Cancelled'
];

export const EFFORT_LEVELS: EffortLevel[] = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'Draft',
  'Sent',
  'Paid',
  'Overdue',
  'Cancelled'
];
