// src/db/database.ts
// Digital Office System Dexie IndexedDB Store with Mantine UI & Order Code PK
import Dexie, { Table } from 'dexie';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus,
  CorrectionAttachment,
  formatOrderCode
} from '../types';
import { 
  INITIAL_ORDERS, 
  INITIAL_DESIGNERS, 
  INITIAL_PROSPECTS, 
  INITIAL_INVOICES, 
  INITIAL_CORRECTIONS, 
  INITIAL_STATUS_HISTORY 
} from '../data';

export interface AppSetting {
  key: string;
  value: any;
}

export class AuraCADDatabase extends Dexie {
  orders!: Table<Order, string>;
  designers!: Table<Designer, string>;
  prospects!: Table<Prospect, string>;
  invoices!: Table<Invoice, string>;
  corrections!: Table<Correction, string>;
  status_history!: Table<OrderStatusHistory, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('AuraCAD_DigitalOffice_v2');
    this.version(1).stores({
      orders: 'id, order_code, name, status, effort_level, order_value, created_at, designer_id, prospect_id',
      designers: 'id, code, name, email, phone',
      prospects: 'id, code, name, email, phone, company',
      invoices: 'id, order_id, invoice_number, status, due_date',
      corrections: 'id, order_id, created_at',
      status_history: 'id, order_id, status, start_date, end_date',
      settings: 'key'
    });
  }
}

export const db = new AuraCADDatabase();

/**
 * Initializes and seeds the Dexie local database with initial seed data.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const orderCount = await db.orders.count();
    if (orderCount === 0) {
      await db.transaction('rw', [
        db.orders, 
        db.designers, 
        db.prospects, 
        db.invoices, 
        db.corrections, 
        db.status_history
      ], async () => {
        await db.designers.bulkPut(INITIAL_DESIGNERS);
        await db.prospects.bulkPut(INITIAL_PROSPECTS);
        await db.orders.bulkPut(INITIAL_ORDERS);
        await db.invoices.bulkPut(INITIAL_INVOICES);
        await db.corrections.bulkPut(INITIAL_CORRECTIONS);
        await db.status_history.bulkPut(INITIAL_STATUS_HISTORY);
      });
      console.log('⚡ [AuraCAD Digital Office] Seeded Designers, Prospects, Orders, Invoices, Corrections, and Status History.');
    }
  } catch (error) {
    console.error('Failed to initialize local IndexedDB database:', error);
  }
}

/**
 * Resets database back to default seed data.
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [
    db.orders, 
    db.designers, 
    db.prospects, 
    db.invoices, 
    db.corrections, 
    db.status_history
  ], async () => {
    await db.orders.clear();
    await db.designers.clear();
    await db.prospects.clear();
    await db.invoices.clear();
    await db.corrections.clear();
    await db.status_history.clear();

    await db.designers.bulkPut(INITIAL_DESIGNERS);
    await db.prospects.bulkPut(INITIAL_PROSPECTS);
    await db.orders.bulkPut(INITIAL_ORDERS);
    await db.invoices.bulkPut(INITIAL_INVOICES);
    await db.corrections.bulkPut(INITIAL_CORRECTIONS);
    await db.status_history.bulkPut(INITIAL_STATUS_HISTORY);
  });
  console.log('🔄 [AuraCAD Digital Office] Reset database to default clean seed.');
}

// -------------------------------------------------------------
// Relational Resolution Handlers
// -------------------------------------------------------------

/**
 * Enriches a single order with its linked designer, prospect, invoice, corrections, and status history.
 */
export async function dbEnrichOrder(order: Order): Promise<Order> {
  const [designer, prospect, invoice, corrections, status_history] = await Promise.all([
    order.designer_id ? db.designers.get(order.designer_id) : Promise.resolve(undefined),
    order.prospect_id ? db.prospects.get(order.prospect_id) : Promise.resolve(undefined),
    db.invoices.where('order_id').equals(order.id).first(),
    db.corrections.where('order_id').equals(order.id).toArray(),
    db.status_history.where('order_id').equals(order.id).toArray()
  ]);

  const sortedHistory = status_history.sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  return {
    ...order,
    designer,
    prospect,
    invoice,
    corrections: corrections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    status_history: sortedHistory
  };
}

/**
 * Gets all orders enriched with their relations.
 */
export async function dbGetEnrichedOrders(): Promise<Order[]> {
  const allOrders = await db.orders.toArray();
  return Promise.all(allOrders.map(dbEnrichOrder));
}

// -------------------------------------------------------------
// Orders CRUD & Status History Lifecycle (Order Code as PK)
// -------------------------------------------------------------

export async function dbAddOrder(
  orderInput: {
    name: string;
    status: OrderStatus;
    effort_level: Order['effort_level'];
    order_value: number;
    designer_id: string;
    prospect_id: string;
    custom_order_code?: string;
  }, 
  customInvoiceAmount?: number
): Promise<Order> {
  // Resolve designer code and prospect code
  const designer = await db.designers.get(orderInput.designer_id);
  const prospect = await db.prospects.get(orderInput.prospect_id);

  const designerCode = designer?.code || 'DES';
  const clientCode = prospect?.code || 'CLI';

  // Construct PK: <DesignerCode>-<ClientCode>-<OrderName>
  const finalCode = orderInput.custom_order_code?.trim() || 
    formatOrderCode(designerCode, clientCode, orderInput.name);

  const now = new Date().toISOString();
  
  const fullOrder: Order = {
    id: finalCode, // Order code is PK
    order_code: finalCode,
    name: orderInput.name.trim(),
    status: orderInput.status,
    effort_level: orderInput.effort_level,
    order_value: orderInput.order_value,
    created_at: now.split('T')[0],
    designer_id: orderInput.designer_id,
    prospect_id: orderInput.prospect_id
  };

  // 1:1 Invoice linked by order.id (the order code)
  const newInvoice: Invoice = {
    id: `inv-${Date.now().toString(36)}`,
    order_id: fullOrder.id,
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: customInvoiceAmount ?? fullOrder.order_value,
    status: 'Sent',
    created_at: fullOrder.created_at,
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  };

  // Initial Status History record
  const initialHistory: OrderStatusHistory = {
    id: `sh-${Date.now().toString(36)}`,
    order_id: fullOrder.id,
    status: fullOrder.status,
    start_date: now,
    end_date: null // Active
  };

  await db.transaction('rw', [db.orders, db.invoices, db.status_history], async () => {
    await db.orders.put(fullOrder);
    await db.invoices.put(newInvoice);
    await db.status_history.put(initialHistory);
  });

  return dbEnrichOrder(fullOrder);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>): Promise<void> {
  await db.orders.update(id, updates);
}

/**
 * Updates order status and automatically closes the active status history log and opens a new active one.
 */
export async function dbUpdateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
  const now = new Date().toISOString();
  
  await db.transaction('rw', [db.orders, db.status_history], async () => {
    // 1. Update order status
    await db.orders.update(orderId, { status: newStatus });

    // 2. Find currently active status history item for this order
    const activeHistory = await db.status_history
      .where('order_id')
      .equals(orderId)
      .and(item => item.end_date === null)
      .first();

    if (activeHistory) {
      await db.status_history.update(activeHistory.id, { end_date: now });
    }

    // 3. Create new active status history log
    const nextHistory: OrderStatusHistory = {
      id: `sh-${Date.now().toString(36)}`,
      order_id: orderId,
      status: newStatus,
      start_date: now,
      end_date: null
    };

    await db.status_history.put(nextHistory);
  });
}

export async function dbDeleteOrder(id: string): Promise<void> {
  await db.transaction('rw', [db.orders, db.invoices, db.corrections, db.status_history], async () => {
    await db.orders.delete(id);
    await db.invoices.where('order_id').equals(id).delete();
    await db.corrections.where('order_id').equals(id).delete();
    await db.status_history.where('order_id').equals(id).delete();
  });
}

// -------------------------------------------------------------
// Corrections CRUD (1:N)
// -------------------------------------------------------------

export async function dbAddCorrection(
  orderId: string, 
  message: string, 
  authorName: string = 'Staff / Client',
  attachments: CorrectionAttachment[] = []
): Promise<Correction> {
  const newCorrection: Correction = {
    id: `cor-${Date.now().toString(36)}`,
    order_id: orderId,
    message,
    created_at: new Date().toISOString(),
    author_name: authorName,
    attachments
  };

  await db.corrections.put(newCorrection);
  return newCorrection;
}

export async function dbDeleteCorrection(correctionId: string): Promise<void> {
  await db.corrections.delete(correctionId);
}

// -------------------------------------------------------------
// Designers CRUD
// -------------------------------------------------------------

export async function dbAddDesigner(designer: Omit<Designer, 'id'>): Promise<Designer> {
  const newDesigner: Designer = {
    ...designer,
    id: `des-${Date.now().toString(36)}`
  };
  await db.designers.put(newDesigner);
  return newDesigner;
}

export async function dbUpdateDesigner(id: string, updates: Partial<Designer>): Promise<void> {
  await db.designers.update(id, updates);
}

export async function dbDeleteDesigner(id: string): Promise<void> {
  await db.designers.delete(id);
}

// -------------------------------------------------------------
// Prospects CRUD
// -------------------------------------------------------------

export async function dbAddProspect(prospect: Omit<Prospect, 'id'>): Promise<Prospect> {
  const newProspect: Prospect = {
    ...prospect,
    id: `prosp-${Date.now().toString(36)}`
  };
  await db.prospects.put(newProspect);
  return newProspect;
}

export async function dbUpdateProspect(id: string, updates: Partial<Prospect>): Promise<void> {
  await db.prospects.update(id, updates);
}

export async function dbDeleteProspect(id: string): Promise<void> {
  await db.prospects.delete(id);
}

// -------------------------------------------------------------
// Invoices CRUD (1:1 with Orders)
// -------------------------------------------------------------

export async function dbUpdateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
  await db.invoices.update(id, updates);
}
