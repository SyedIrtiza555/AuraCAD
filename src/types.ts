export type OrderStatus = 
  | 'Inbox' 
  | 'In progress' 
  | 'In Review' 
  | 'Delivered' 
  | 'Backlog'
  | 'Inception' 
  | 'CAD Design' 
  | 'Review' 
  | 'Production';

export type OrderType = 'Ring' | 'Bracelet' | 'Pendant' | 'Earring';

export const ORDER_TYPES: OrderType[] = ['Ring', 'Bracelet', 'Pendant', 'Earring'];

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProspectStage = 
  | 'New Inquiry' 
  | 'Consultation & Discovery' 
  | 'CAD Proposal' 
  | 'Approved / Active Order' 
  | 'Delivered' 
  | 'Closed Lost';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Lead' | 'Active' | 'Inactive';
  notes: string;
  color?: string;
}

export interface OrderHistoryEvent {
  status: OrderStatus;
  date: string;
}

export type DesignerMessageType = 'correction' | 'complaint' | 'change' | 'anomaly' | 'query';

export interface DesignerMessageComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface DesignerMessage {
  id: string;
  type: DesignerMessageType;
  text: string;
  sender: string; // e.g. "Closer (Alex)", "Client Julian", "Forge Marcus"
  createdAt: string;
  resolved?: boolean;
  isUnread?: boolean;
  isArchived?: boolean;
  severity?: 'critical' | 'normal' | 'low';
  orderId?: string;
  comments?: DesignerMessageComment[];
}

export interface Order {
  id: string;
  title: string;
  clientId: string;
  closer: string; // Who secured the deal / Agent
  designer: string; // Who is doing the CAD
  production: string; // Who receives it for production
  status: OrderStatus;
  orderType?: OrderType;
  color?: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  images?: string[];
  priority?: Priority;
  history?: OrderHistoryEvent[];
  value?: number;
  cadRevisions?: number;
  prospectId?: string;
  cadStage?: 'Initial Wireframe' | 'Detailed Model' | 'Stone Setting' | 'Client Review' | 'Casting Approved';
  valueTrend?: ValueTrend;
  corrections?: string[];
  designerMessages?: DesignerMessage[];
}

export interface ValueTrend {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  reason?: string;
}

export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: number;
  stage: ProspectStage;
  agent: string; // Closer / Sales Rep
  designer: string; // Assigned CAD Designer
  source: 'Instagram' | 'Referral' | 'Walk-in' | 'Private Concierge' | 'Website';
  targetDueDate: string;
  jewelryType: string;
  orderId?: string;
  notes?: string;
  cadNotes?: string;
  images?: string[];
  createdAt: string;
  cadRevisions?: number;
}

export interface UnifiedProject {
  id: string;
  prospect: Prospect;
  order?: Order;
}

export const STATUSES: OrderStatus[] = [
  'Inbox',
  'In progress',
  'In Review',
  'Delivered',
  'Backlog'
];

export const normalizeStatus = (status?: string): OrderStatus => {
  if (!status) return 'Inbox';
  switch (status) {
    case 'Inception': return 'Inbox';
    case 'CAD Design': return 'In progress';
    case 'Review': return 'In Review';
    case 'Production': return 'In progress';
    case 'Delivered': return 'Delivered';
    case 'Backlog': return 'Backlog';
    case 'Inbox': return 'Inbox';
    case 'In progress': return 'In progress';
    case 'In Review': return 'In Review';
    default: return 'Inbox';
  }
};

export const detectOrderType = (order: Pick<Order, 'title' | 'orderType'>): OrderType => {
  if (order.orderType) return order.orderType;
  const t = (order.title || '').toLowerCase();
  if (t.includes('bracelet') || t.includes('bangle') || t.includes('cuff') || t.includes('tennis')) return 'Bracelet';
  if (t.includes('pendant') || t.includes('necklace') || t.includes('choker') || t.includes('chain')) return 'Pendant';
  if (t.includes('earring') || t.includes('hoop') || t.includes('drop') || t.includes('stud') || t.includes('chandelier')) return 'Earring';
  return 'Ring';
};

export const PROSPECT_STAGES: ProspectStage[] = [
  'New Inquiry',
  'Consultation & Discovery',
  'CAD Proposal',
  'Approved / Active Order',
  'Delivered'
];

export const SALES_AGENTS = ['Jerry', 'Ryan', 'Alex', 'Sophia'];
export const CAD_DESIGNERS = ['Abdullah', 'Farooq', 'Muneeb', 'Hamza', 'Elena'];
export const PRODUCTION_FORGES = ['Marcus Forge', 'Sarah Oconnell', 'Crown Castings'];

export type ViewPreset = 'minimal' | 'basic';

