// src/types.ts
// Digital Office System Data Types (Strict ER Alignment with Mantine UI & Order Code PK)

export type OrderStatus = 'Pending' | 'Designing' | 'Review' | 'Completed' | 'Cancelled';

export type EffortLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Designer {
  id: string;
  code: string; // e.g. "FU", "ER", "MA", "AT"
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialty?: string;
}

export interface Prospect {
  id: string;
  code: string; // e.g. "CA", "VC", "LA", "WH", "CH"
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
  // Order code is the primary key (PK): <DesignerCode>-<ClientCode>-<OrderName>
  // e.g. "FU-CA-Three stone ring"
  id: string; // Same as order_code (PK)
  order_code: string; // <DesignerCode>-<ClientCode>-<OrderName>
  name: string; // e.g. "Three stone ring"
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

/**
 * Formats a 3-part Order Code PK: <DesignerCode>-<ClientCode>-<OrderName>
 * e.g. ("FU", "CA", "Three stone ring") => "FU-CA-Three stone ring"
 */
export function formatOrderCode(designerCode: string, clientCode: string, orderName: string): string {
  const dCode = (designerCode || 'DES').trim().toUpperCase();
  const cCode = (clientCode || 'CLI').trim().toUpperCase();
  const name = (orderName || 'Bespoke Order').trim();
  return `${dCode}-${cCode}-${name}`;
}

/**
 * Parses a 3-part Order Code PK into its components.
 */
export function parseOrderCode(orderCode: string): { designerCode: string; clientCode: string; orderName: string } {
  if (!orderCode) return { designerCode: '', clientCode: '', orderName: '' };
  const parts = orderCode.split('-');
  if (parts.length >= 3) {
    return {
      designerCode: parts[0],
      clientCode: parts[1],
      orderName: parts.slice(2).join('-')
    };
  }
  return { designerCode: '', clientCode: '', orderName: orderCode };
}
