// scripts/seedPocketBaseData.mjs
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

async function seedData() {
  await pb.collection('_superusers').authWithPassword('dev@auracad.local', 'Goto hell 555');
  console.log('[PocketBase Seed] Authenticated as Superuser.');

  // Check existing orders
  const existingOrders = await pb.collection('orders').getList(1, 1);
  if (existingOrders.totalItems === 0) {
    console.log('[PocketBase Seed] Seeding orders...');
    const sampleOrders = [
      {
        order_id: 'ORD-A1B2C3D4',
        title: 'Custom Engagement Ring - Diamond Solitaire',
        client_id: 'CLI-001',
        client_name: 'Sarah Jenkins',
        designer: 'Elena Rostova',
        closer: 'Alex',
        status: 'In progress',
        order_type: 'Ring',
        priority: 'High',
        value: 9400,
        due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        cad_stage: 'Stone Setting',
        cad_revisions: 2,
        notes: 'Client wants a 1.5ct lab-grown diamond with a hidden halo and cathedral shoulders.',
        corrections: ['Resize shank to 52mm interior circumference', 'Thicken prong tips to 0.85mm for diamond retention'],
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        order_id: 'ORD-E5F6G7H8',
        title: 'Art Deco Sapphire Halo Pendant',
        client_id: 'CLI-002',
        client_name: 'Robert Chase',
        designer: 'Elena Rostova',
        closer: 'Jerry',
        status: 'In Review',
        order_type: 'Pendant',
        priority: 'Medium',
        value: 4800,
        due_date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        cad_stage: 'Milgrain Bezel',
        cad_revisions: 1,
        notes: 'Milgrain detailing with pear halo surrounding royal blue Ceylon sapphire.',
        corrections: ['Tighten halo spacing'],
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        order_id: 'ORD-I9J0K1L2',
        title: "Men's Platinum Signet Ring - Family Crest",
        client_id: 'CLI-003',
        client_name: 'David Wright',
        designer: 'Elena Rostova',
        closer: 'Jerry',
        status: 'Inbox',
        order_type: 'Ring',
        priority: 'High',
        value: 8200,
        due_date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
        cad_stage: 'Rough CAD',
        cad_revisions: 0,
        notes: 'Solid platinum 950 backing, deep reverse-relief crest engraving for wax seal stamping.',
        corrections: [],
        images: [
          'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        order_id: 'ORD-M3N4O5P6',
        title: '5ct Diamond Tennis Bracelet - Platinum Clasp',
        client_id: 'CLI-004',
        client_name: 'Emily Chen',
        designer: 'Elena Rostova',
        closer: 'Alex',
        status: 'Delivered',
        order_type: 'Bracelet',
        priority: 'High',
        value: 15400,
        due_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        cad_stage: 'Delivered',
        cad_revisions: 3,
        notes: 'Double safety figure-8 lock, four-prong basket articulated links.',
        corrections: [],
        images: [
          'https://images.unsplash.com/photo-1611591475877-22a8efae586b?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    for (const ord of sampleOrders) {
      await pb.collection('orders').create(ord);
    }
    console.log(`[PocketBase Seed] Seeded ${sampleOrders.length} orders.`);
  }

  // Check clients
  const existingClients = await pb.collection('clients').getList(1, 1);
  if (existingClients.totalItems === 0) {
    console.log('[PocketBase Seed] Seeding clients...');
    const sampleClients = [
      { client_id: 'CLI-001', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '555-0101', company: 'Jenkins Atelier', tier: 'VIP', status: 'Active', notes: 'Prefers lab-grown diamonds.' },
      { client_id: 'CLI-002', name: 'Robert Chase', email: 'robert@example.com', phone: '555-0102', company: 'Vintage Vault', tier: 'Retail', status: 'Active', notes: 'Looking for vintage styles.' },
      { client_id: 'CLI-003', name: 'David Wright', email: 'david@example.com', phone: '555-0103', company: 'Wright & Co', tier: 'VIP', status: 'Active', notes: 'Frequent buyer of custom pieces.' },
      { client_id: 'CLI-004', name: 'Emily Chen', email: 'emily@example.com', phone: '555-0104', company: 'Chen Luxury', tier: 'Atelier', status: 'Active', notes: 'Loves high carat weights.' },
      { client_id: 'CLI-005', name: 'Julian Vance', email: 'julian.v@vancecap.com', phone: '555-0199', company: 'Vance Capital', tier: 'VIP', status: 'Lead', notes: 'Private collector, high-budget bespoke commissions.' }
    ];
    for (const cli of sampleClients) {
      await pb.collection('clients').create(cli);
    }
    console.log(`[PocketBase Seed] Seeded ${sampleClients.length} clients.`);
  }

  // Check prospects
  const existingProspects = await pb.collection('prospects').getList(1, 1);
  if (existingProspects.totalItems === 0) {
    console.log('[PocketBase Seed] Seeding prospects...');
    const sampleProspects = [
      {
        prospect_id: 'PROSP-001',
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        phone: '555-0101',
        budget: 9500,
        stage: 'Approved / Active Order',
        agent: 'Alex',
        designer: 'Elena Rostova',
        source: 'Referral',
        jewelry_type: 'Custom Diamond Solitaire Ring',
        target_due_date: '2026-07-05',
        notes: 'Client loves cathedral shoulders and hidden halo.'
      },
      {
        prospect_id: 'PROSP-005',
        name: 'Julian Vance',
        email: 'julian.v@vancecap.com',
        phone: '555-0199',
        budget: 18500,
        stage: 'Consultation & Discovery',
        agent: 'Marcus Vance',
        designer: 'Elena Rostova',
        source: 'Private Concierge',
        jewelry_type: '3.5ct Radiant Cut Toi et Moi Ring',
        target_due_date: '2026-08-01',
        notes: 'High net worth. Ready to initiate CAD following powerdialler call.'
      },
      {
        prospect_id: 'PROSP-006',
        name: 'Maya Lin',
        email: 'maya@designhaus.co',
        phone: '555-0214',
        budget: 12000,
        stage: 'CAD Proposal',
        agent: 'Marcus Vance',
        designer: 'Elena Rostova',
        source: 'Website',
        jewelry_type: 'Art Deco Baguette Choker Necklace',
        target_due_date: '2026-07-28',
        notes: 'Initial CAD draft shared yesterday. Needs stone spacing tweak.'
      }
    ];
    for (const prosp of sampleProspects) {
      await pb.collection('prospects').create(prosp);
    }
    console.log(`[PocketBase Seed] Seeded ${sampleProspects.length} prospects.`);
  }

  console.log('[PocketBase Seed] Seed complete.');
}

seedData().catch(err => {
  console.error('[PocketBase Seed] Error:', err);
  process.exit(1);
});
