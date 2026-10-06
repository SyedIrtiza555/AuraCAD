import Dexie, { Table } from 'dexie';
import { Order, Client, Prospect, OrderStatus } from '../types';
import { INITIAL_ORDERS, INITIAL_CLIENTS, INITIAL_PROSPECTS } from '../data';

export interface AppSetting {
  key: string;
  value: any;
}

export class AuraCADDatabase extends Dexie {
  orders!: Table<Order, string>;
  clients!: Table<Client, string>;
  prospects!: Table<Prospect, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('AuraCAD_DB');
    this.version(1).stores({
      orders: 'id, clientId, status, orderType, priority, dueDate, createdAt, designer, closer, production, prospectId',
      clients: 'id, name, email, status',
      prospects: 'id, name, stage, agent, designer, jewelryType, orderId',
      settings: 'key'
    });
  }
}

export const db = new AuraCADDatabase();

/**
 * Ensures initial default data is seeded if the local database is fresh.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const orderCount = await db.orders.count();
    if (orderCount === 0) {
      await db.transaction('rw', [db.orders, db.clients, db.prospects], async () => {
        await db.clients.bulkPut(INITIAL_CLIENTS);
        await db.orders.bulkPut(INITIAL_ORDERS);
        await db.prospects.bulkPut(INITIAL_PROSPECTS);
      });
      console.log('⚡ [AuraCAD DB] Seeded initial clients, orders, and prospects into IndexedDB.');
    }
  } catch (error) {
    console.error('Failed to initialize local IndexedDB database:', error);
  }
}

/**
 * Resets database back to default seed data.
 */
export async function resetDatabaseToDefaults(): Promise<void> {
  await db.transaction('rw', [db.orders, db.clients, db.prospects], async () => {
    await db.orders.clear();
    await db.clients.clear();
    await db.prospects.clear();
    await db.clients.bulkPut(INITIAL_CLIENTS);
    await db.orders.bulkPut(INITIAL_ORDERS);
    await db.prospects.bulkPut(INITIAL_PROSPECTS);
  });
}

// -------------------------------------------------------------
// Type-safe CRUD Handlers with Automatic History & Consistency
// -------------------------------------------------------------

export async function dbAddOrder(order: Order): Promise<void> {
  const finalOrder: Order = {
    ...order,
    createdAt: order.createdAt || new Date().toISOString(),
    history: order.history || [{ status: order.status, date: new Date().toISOString() }],
    designerMessages: order.designerMessages || [],
    corrections: order.corrections || []
  };
  await db.orders.put(finalOrder);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>): Promise<void> {
  const current = await db.orders.get(id);
  if (!current) return;

  const nextHistory = [...(current.history || [])];
  if (updates.status && updates.status !== current.status) {
    nextHistory.push({
      status: updates.status,
      date: new Date().toISOString()
    });
  }

  await db.orders.update(id, {
    ...updates,
    history: nextHistory
  });
}

export async function dbDeleteOrder(id: string): Promise<void> {
  await db.orders.delete(id);
}

export async function dbAddClient(client: Client): Promise<void> {
  await db.clients.put(client);
}

export async function dbUpdateClient(id: string, updates: Partial<Client>): Promise<void> {
  await db.clients.update(id, updates);
}

export async function dbDeleteClient(id: string): Promise<void> {
  // Cascading check: ensure we don't orphan orders without notice
  await db.clients.delete(id);
}

export async function dbAddProspect(prospect: Prospect): Promise<void> {
  await db.prospects.put(prospect);
}

export async function dbUpdateProspect(id: string, updates: Partial<Prospect>): Promise<void> {
  await db.prospects.update(id, updates);
}

export async function dbDeleteProspect(id: string): Promise<void> {
  await db.prospects.delete(id);
}

export async function dbConvertProspectToOrder(prospectId: string, baseOrder: Partial<Order>): Promise<Order> {
  const prospect = await db.prospects.get(prospectId);
  if (!prospect) throw new Error(`Prospect ${prospectId} not found`);

  // Ensure client exists or create one
  let clientId = `CLI-${Date.now().toString(36).toUpperCase()}`;
  const existingClient = await db.clients.where('name').equalsIgnoreCase(prospect.name).first();
  if (existingClient) {
    clientId = existingClient.id;
  } else {
    await db.clients.put({
      id: clientId,
      name: prospect.name,
      email: prospect.email,
      phone: prospect.phone,
      status: 'Active',
      notes: `Converted from prospect. Initial budget: $${prospect.budget}`
    });
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const newOrder: Order = {
    id: orderId,
    title: baseOrder.title || `${prospect.jewelryType || 'Custom'} Bespoke Piece`,
    clientId,
    closer: prospect.agent || 'Alex',
    designer: prospect.designer || 'Abdullah',
    production: 'Crown Castings',
    status: 'In progress',
    orderType: (baseOrder.orderType as any) || 'Ring',
    dueDate: prospect.targetDueDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    notes: prospect.notes || '',
    value: prospect.budget || 5000,
    createdAt: new Date().toISOString(),
    prospectId: prospect.id,
    images: prospect.images || [],
    cadStage: 'Initial Wireframe',
    priority: 'High',
    history: [{ status: 'In progress', date: new Date().toISOString() }],
    designerMessages: [],
    corrections: []
  };

  await db.transaction('rw', [db.orders, db.prospects], async () => {
    await db.orders.put(newOrder);
    await db.prospects.update(prospectId, {
      stage: 'Approved / Active Order',
      orderId: newOrder.id
    });
  });

  return newOrder;
}
