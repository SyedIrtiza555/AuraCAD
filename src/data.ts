import { Order, Client, Prospect } from './types';

export const INITIAL_CLIENTS: Client[] = [
  { id: 'CLI-001', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '555-0101', status: 'Active', notes: 'Prefers lab-grown diamonds.' },
  { id: 'CLI-002', name: 'Robert Chase', email: 'robert@example.com', phone: '555-0102', status: 'Lead', notes: 'Looking for vintage styles.' },
  { id: 'CLI-003', name: 'David Wright', email: 'david@example.com', phone: '555-0103', status: 'Active', notes: 'Frequent buyer of custom pieces.' },
  { id: 'CLI-004', name: 'Emily Chen', email: 'emily@example.com', phone: '555-0104', status: 'Active', notes: 'Loves high carat weights.' },
  { id: 'CLI-005', name: 'Julian Vance', email: 'julian.v@vancecap.com', phone: '555-0199', status: 'Lead', notes: 'Private collector, high-budget bespoke commissions.' },
  { id: 'CLI-006', name: 'Maya Lin', email: 'maya@designhaus.co', phone: '555-0214', status: 'Lead', notes: 'Interested in Art Deco geometric pieces.' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-A1B2C3D4',
    title: 'Custom Engagement Ring - Diamond Solitaire',
    clientId: 'CLI-001',
    closer: 'Alex',
    designer: 'Abdullah',
    production: 'Marcus Forge',
    status: 'In progress',
    orderType: 'Ring',
    priority: 'High',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Approaching due date (2 days)
    value: 9400,
    valueTrend: {
      percentage: 5.6,
      direction: 'up',
      reason: 'Diamond upgrade to 1.5ct hidden halo'
    },
    cadRevisions: 2,
    prospectId: 'PROSP-001',
    cadStage: 'Stone Setting',
    notes: 'Client wants a 1.5ct lab-grown diamond with a hidden halo and cathedral shoulders.',
    corrections: [
      'Resize shank to 52mm interior circumference',
      'Thicken prong tips to 0.85mm for diamond retention'
    ],
    designerMessages: [
      {
        id: 'msg-001',
        type: 'correction',
        text: 'Thicken prong tips to 0.85mm - client requested safety claw guarantee.',
        sender: 'Closer (Alex)',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        resolved: true,
        isUnread: false,
        comments: [
          {
            id: 'c-1',
            author: 'Abdullah (CAD)',
            text: 'Updated prong profile to 0.88mm with rounded claw caps.',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
          }
        ]
      },
      {
        id: 'msg-002',
        type: 'anomaly',
        text: 'Cathedral shoulder hollow thickness is currently 0.65mm; minimum recommended for platinum casting is 0.75mm.',
        sender: 'Marcus (Forge)',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        resolved: false,
        isUnread: true,
        severity: 'critical',
        comments: []
      },
      {
        id: 'msg-003',
        type: 'complaint',
        text: 'Client complained about halo stone spacing looking uneven in the 2D preview.',
        sender: 'Client (Sarah)',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        resolved: false,
        isUnread: true,
        severity: 'critical',
        comments: [
          {
            id: 'c-2',
            author: 'Abdullah (CAD)',
            text: 'Re-spaced all 16 melee stones to uniform 0.08mm gaps.',
            createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
          }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 5).toISOString() },
      { status: 'In progress', date: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
  },
  {
    id: 'ORD-E5F6G7H8',
    title: 'Vintage Inspired Emerald Pendant',
    clientId: 'CLI-002',
    closer: 'Ryan',
    designer: 'Farooq',
    production: 'Marcus Forge',
    status: 'Inbox',
    orderType: 'Pendant',
    priority: 'Low',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // Healthy timeline (14 days)
    value: 5800,
    valueTrend: {
      percentage: -3.2,
      direction: 'down',
      reason: 'Bezel metal weight optimization'
    },
    cadRevisions: 1,
    prospectId: 'PROSP-002',
    cadStage: 'Initial Wireframe',
    notes: 'Awaiting reference images from the client. Colombian emerald with milgrain bezel.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 1).toISOString() }
    ]
  },
  {
    id: 'ORD-I9J0K1L2',
    title: "Men's Platinum Signet Ring",
    clientId: 'CLI-003',
    closer: 'Jerry',
    designer: 'Muneeb',
    production: 'Sarah Oconnell',
    status: 'In Review',
    orderType: 'Ring',
    priority: 'Urgent',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], // Approaching due date (1 day)
    value: 7200,
    valueTrend: {
      percentage: 8.4,
      direction: 'up',
      reason: 'Platinum spot market adjustment'
    },
    cadRevisions: 3,
    prospectId: 'PROSP-003',
    cadStage: 'Client Review',
    notes: 'CAD is ready, pending final approval from David. Hand-engraved crest on flat face.',
    corrections: [
      'Increase crest depth relief to 0.4mm for hand graver clearance'
    ],
    designerMessages: [
      {
        id: 'msg-004',
        type: 'complaint',
        text: 'Client feels initial signet flat surface looked too thin; wants substantial masculine weight.',
        sender: 'Closer (Jerry)',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        resolved: true
      },
      {
        id: 'msg-005',
        type: 'change',
        text: 'Upgrade alloy from 14k White Gold to 950 Platinum.',
        sender: 'Client (David)',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        resolved: true
      },
      {
        id: 'msg-006',
        type: 'correction',
        text: 'Deepen family crest relief to 0.4mm so the master engraver has sufficient depth.',
        sender: 'Production (Sarah)',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        resolved: false
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 6).toISOString() },
      { status: 'In progress', date: new Date(Date.now() - 86400000 * 4).toISOString() },
      { status: 'In Review', date: new Date(Date.now() - 86400000 * 1).toISOString() }
    ]
  },
  {
    id: 'ORD-M3N4O5P6',
    title: 'Tennis Bracelet - 5ct tw',
    clientId: 'CLI-004',
    closer: 'Alex',
    designer: 'Hamza',
    production: 'Marcus Forge',
    status: 'In progress',
    orderType: 'Bracelet',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], // Due soon (6 days)
    value: 14500,
    valueTrend: {
      percentage: 2.1,
      direction: 'up',
      reason: 'Additional diamond melee links'
    },
    cadRevisions: 2,
    prospectId: 'PROSP-004',
    cadStage: 'Casting Approved',
    notes: 'CAD approved. In casting phase. 4-prong box links with safety clasp.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1611591475877-22a8efae586b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 10).toISOString() },
      { status: 'In progress', date: new Date(Date.now() - 86400000 * 8).toISOString() }
    ]
  },
  {
    id: 'ORD-P8Q9R0S1',
    title: 'Art Deco Sapphire Choker Pendant',
    clientId: 'CLI-006',
    closer: 'Sophia',
    designer: 'Elena',
    production: 'Crown Castings',
    status: 'Backlog',
    orderType: 'Pendant',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 21).toISOString().split('T')[0], // Calm (21 days)
    value: 11200,
    valueTrend: {
      percentage: -1.8,
      direction: 'down',
      reason: 'Alternative royal blue sapphire parcel'
    },
    cadRevisions: 1,
    cadStage: 'Detailed Model',
    notes: 'Geometric step-cut sapphire links framed in 18k white gold milgrain.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Backlog', date: new Date(Date.now() - 86400000 * 3).toISOString() }
    ]
  },
  {
    id: 'ORD-K3L4M5N6',
    title: 'Diamond Waterfall Chandelier Earrings',
    clientId: 'CLI-004',
    closer: 'Alex',
    designer: 'Elena',
    production: 'Crown Castings',
    status: 'Delivered',
    orderType: 'Earring',
    priority: 'High',
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    value: 12800,
    valueTrend: {
      percentage: 3.5,
      direction: 'up',
      reason: 'Extra pavé diamond tier added'
    },
    cadRevisions: 2,
    cadStage: 'Casting Approved',
    notes: 'Delivered to client on schedule. Platinum setting with 4ct total weight pear & round brilliant diamonds.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 20).toISOString() },
      { status: 'In progress', date: new Date(Date.now() - 86400000 * 14).toISOString() },
      { status: 'In Review', date: new Date(Date.now() - 86400000 * 7).toISOString() },
      { status: 'Delivered', date: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
  },
  {
    id: 'ORD-Z7Y8X9W0',
    title: 'Artisan Huggie Diamond Hoop Earrings',
    clientId: 'CLI-005',
    closer: 'Sophia',
    designer: 'Abdullah',
    production: 'Marcus Forge',
    status: 'Inbox',
    orderType: 'Earring',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    value: 4600,
    valueTrend: {
      percentage: 1.2,
      direction: 'up',
      reason: '18k yellow gold alloy specification'
    },
    cadRevisions: 1,
    cadStage: 'Initial Wireframe',
    notes: 'Everyday luxury diamond huggies. 18k yellow gold with invisible hinge mechanism.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
    ],
    history: [
      { status: 'Inbox', date: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
  }
];

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'PROSP-001',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '555-0101',
    budget: 10000,
    stage: 'Approved / Active Order',
    agent: 'Alex',
    designer: 'Abdullah',
    source: 'Private Concierge',
    targetDueDate: '2026-07-15',
    jewelryType: 'Custom Engagement Ring - Diamond Solitaire',
    orderId: 'ORD-A1B2C3D4',
    cadNotes: 'Hidden halo, 1.5ct lab diamond, finger size 5.75.',
    notes: 'Very detail-oriented client. Prefers WhatsApp updates.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    cadRevisions: 2,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-002',
    name: 'Robert Chase',
    email: 'robert@example.com',
    phone: '555-0102',
    budget: 6500,
    stage: 'Approved / Active Order',
    agent: 'Ryan',
    designer: 'Farooq',
    source: 'Referral',
    targetDueDate: '2026-07-20',
    jewelryType: 'Vintage Inspired Emerald Pendant',
    orderId: 'ORD-E5F6G7H8',
    cadNotes: 'Artisan milgrain bezel with pear halo.',
    notes: 'Anniversary gift for spouse. Strict delivery date.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    cadRevisions: 1,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-003',
    name: 'David Wright',
    email: 'david@example.com',
    phone: '555-0103',
    budget: 8000,
    stage: 'Approved / Active Order',
    agent: 'Jerry',
    designer: 'Muneeb',
    source: 'Walk-in',
    targetDueDate: '2026-07-10',
    jewelryType: "Men's Platinum Signet Ring",
    orderId: 'ORD-I9J0K1L2',
    cadNotes: 'Substantial solid heavy back, crest engraving.',
    notes: 'Repeat client, 4th custom build.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    cadRevisions: 3,
    images: [
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-004',
    name: 'Emily Chen',
    email: 'emily@example.com',
    phone: '555-0104',
    budget: 15000,
    stage: 'Approved / Active Order',
    agent: 'Alex',
    designer: 'Hamza',
    source: 'Instagram',
    targetDueDate: '2026-07-08',
    jewelryType: 'Tennis Bracelet - 5ct tw',
    orderId: 'ORD-M3N4O5P6',
    cadNotes: 'Double safety clasp, F/VS diamonds.',
    notes: 'Wants expedited delivery if possible.',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    cadRevisions: 2,
    images: [
      'https://images.unsplash.com/photo-1611591475877-22a8efae586b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-005',
    name: 'Julian Vance',
    email: 'julian.v@vancecap.com',
    phone: '555-0199',
    budget: 18500,
    stage: 'Consultation & Discovery',
    agent: 'Alex',
    designer: 'Abdullah',
    source: 'Private Concierge',
    targetDueDate: '2026-08-01',
    jewelryType: '3.5ct Radiant Cut Toi et Moi Ring',
    cadNotes: 'Emerald cut sapphire paired with radiant cut diamond in platinum bypass mount.',
    notes: 'Very high net worth. Looking to initiate CAD as soon as discovery call finishes.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    cadRevisions: 0,
    images: [
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-006',
    name: 'Maya Lin',
    email: 'maya@designhaus.co',
    phone: '555-0214',
    budget: 12000,
    stage: 'CAD Proposal',
    agent: 'Jerry',
    designer: 'Farooq',
    source: 'Website',
    targetDueDate: '2026-07-28',
    jewelryType: 'Art Deco Baguette Choker Necklace',
    cadNotes: 'Articulated geometric links, 18k white gold with channel-set baguettes.',
    notes: 'Initial CAD draft shared with client yesterday. Waiting on stone spacing tweak.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    cadRevisions: 1,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'PROSP-007',
    name: 'Liam Gallagher',
    email: 'liam.g@soundtrack.fm',
    phone: '555-0331',
    budget: 5200,
    stage: 'New Inquiry',
    agent: 'Ryan',
    designer: 'Muneeb',
    source: 'Instagram',
    targetDueDate: '2026-08-15',
    jewelryType: 'Custom Skull Signet with Ruby Eyes',
    cadNotes: 'Heavy gothic engraving, oxidized 925 silver with cabochon rubies.',
    notes: 'Submitted inquiry through Instagram DM.',
    createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
    cadRevisions: 0,
    images: [
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

