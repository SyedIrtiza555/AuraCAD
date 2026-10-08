// src/data.ts
// Digital Office System Seed Data

import { 
  Designer, 
  Prospect, 
  Order, 
  Invoice, 
  Correction, 
  OrderStatusHistory 
} from './types';

export const INITIAL_DESIGNERS: Designer[] = [
  {
    id: 'des-1',
    name: 'Elena Rostova',
    email: 'elena@auracad.local',
    phone: '+1 555-0144',
    specialty: 'High-Jewelry Rings & Diamond Solitaires'
  },
  {
    id: 'des-2',
    name: 'Farooq Qureshi',
    email: 'farooq@auracad.local',
    phone: '+1 555-0182',
    specialty: 'Vintage Filigree & Milgrain Pendants'
  },
  {
    id: 'des-3',
    name: 'Muneeb Al-Mansoor',
    email: 'muneeb@auracad.local',
    phone: '+1 555-0199',
    specialty: 'Men’s Signets & Platinum Heavy Castings'
  },
  {
    id: 'des-4',
    name: 'Abdullah Tariq',
    email: 'abdullah@auracad.local',
    phone: '+1 555-0112',
    specialty: 'Articulated Tennis Bracelets & Bangles'
  }
];

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'prosp-1',
    name: 'Sarah Jenkins',
    email: 'sarah@jenkinsdiamonds.com',
    phone: '+1 555-0101',
    company: 'Jenkins Fine Jewels LLC'
  },
  {
    id: 'prosp-2',
    name: 'Julian Vance',
    email: 'julian.v@vancecap.com',
    phone: '+1 555-0190',
    company: 'Vance Capital Private Office'
  },
  {
    id: 'prosp-3',
    name: 'Maya Lin',
    email: 'maya@linatelier.design',
    phone: '+1 555-0214',
    company: 'Lin Atelier Architecture'
  },
  {
    id: 'prosp-4',
    name: 'David Wright',
    email: 'david@wrightinvest.com',
    phone: '+1 555-0103',
    company: 'Wright Luxury Holdings'
  },
  {
    id: 'prosp-5',
    name: 'Emily Chen',
    email: 'emily@chenluxury.co',
    phone: '+1 555-0104',
    company: 'Chen Haute Horlogerie'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_code: 'ORD-10421',
    name: 'Custom Engagement Ring - Solitaire 1.5ct',
    status: 'Designing',
    effort_level: 'High',
    order_value: 9400,
    created_at: '2024-01-01',
    designer_id: 'des-1',
    prospect_id: 'prosp-1'
  },
  {
    id: 'ord-2',
    order_code: 'ORD-10422',
    name: 'Vintage Inspired Emerald Pendant',
    status: 'Pending',
    effort_level: 'Medium',
    order_value: 5800,
    created_at: '2024-01-02',
    designer_id: 'des-2',
    prospect_id: 'prosp-2'
  },
  {
    id: 'ord-3',
    order_code: 'ORD-10423',
    name: "Men's Platinum Signet Ring with Crest",
    status: 'Review',
    effort_level: 'Urgent',
    order_value: 7200,
    created_at: '2024-01-01',
    designer_id: 'des-3',
    prospect_id: 'prosp-4'
  },
  {
    id: 'ord-4',
    order_code: 'ORD-10424',
    name: 'Tennis Bracelet - 5ct tw Box Link',
    status: 'Completed',
    effort_level: 'Low',
    order_value: 14500,
    created_at: '2023-12-28',
    designer_id: 'des-4',
    prospect_id: 'prosp-5'
  },
  {
    id: 'ord-5',
    order_code: 'ORD-10425',
    name: 'Art Deco Sapphire Choker Links',
    status: 'Review',
    effort_level: 'High',
    order_value: 11200,
    created_at: '2024-01-03',
    designer_id: 'des-1',
    prospect_id: 'prosp-3'
  },
  {
    id: 'ord-6',
    order_code: 'ORD-10426',
    name: '3.5ct Radiant Cut Toi et Moi Ring',
    status: 'Designing',
    effort_level: 'Urgent',
    order_value: 18500,
    created_at: '2024-01-04',
    designer_id: 'des-4',
    prospect_id: 'prosp-2'
  },
  {
    id: 'ord-7',
    order_code: 'ORD-10427',
    name: 'Diamond Waterfall Chandelier Earrings',
    status: 'Completed',
    effort_level: 'Medium',
    order_value: 12800,
    created_at: '2023-12-20',
    designer_id: 'des-1',
    prospect_id: 'prosp-5'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    order_id: 'ord-1',
    invoice_number: 'INV-2024-001',
    amount: 9400,
    status: 'Paid',
    created_at: '2024-01-01',
    due_date: '2024-01-15'
  },
  {
    id: 'inv-2',
    order_id: 'ord-2',
    invoice_number: 'INV-2024-002',
    amount: 5800,
    status: 'Sent',
    created_at: '2024-01-02',
    due_date: '2024-01-16'
  },
  {
    id: 'inv-3',
    order_id: 'ord-3',
    invoice_number: 'INV-2024-003',
    amount: 7200,
    status: 'Sent',
    created_at: '2024-01-01',
    due_date: '2024-01-10'
  },
  {
    id: 'inv-4',
    order_id: 'ord-4',
    invoice_number: 'INV-2024-004',
    amount: 14500,
    status: 'Paid',
    created_at: '2023-12-28',
    due_date: '2024-01-11'
  },
  {
    id: 'inv-5',
    order_id: 'ord-5',
    invoice_number: 'INV-2024-005',
    amount: 11200,
    status: 'Draft',
    created_at: '2024-01-03',
    due_date: '2024-01-20'
  },
  {
    id: 'inv-6',
    order_id: 'ord-6',
    invoice_number: 'INV-2024-006',
    amount: 18500,
    status: 'Sent',
    created_at: '2024-01-04',
    due_date: '2024-01-18'
  },
  {
    id: 'inv-7',
    order_id: 'ord-7',
    invoice_number: 'INV-2024-007',
    amount: 12800,
    status: 'Paid',
    created_at: '2023-12-20',
    due_date: '2024-01-05'
  }
];

export const INITIAL_CORRECTIONS: Correction[] = [
  {
    id: 'cor-1',
    order_id: 'ord-1',
    message: 'Thicken prong tips to 0.85mm for diamond retention safety guarantee.',
    created_at: '2024-01-03T14:30:00Z',
    author_name: 'Sarah Jenkins (Customer)',
    attachments: [
      {
        id: 'att-1',
        correction_id: 'cor-1',
        file_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        file_name: 'prong_profile_reference.jpg',
        file_size: '240 KB'
      }
    ]
  },
  {
    id: 'cor-2',
    order_id: 'ord-1',
    message: 'Re-space halo melee stones to 0.08mm uniform spacing to eliminate gaps in 2D preview.',
    created_at: '2024-01-04T10:15:00Z',
    author_name: 'Elena Rostova (Designer)',
    attachments: []
  },
  {
    id: 'cor-3',
    order_id: 'ord-3',
    message: 'Deepen family crest relief depth to 0.4mm so the master engraver has sufficient metal clearance.',
    created_at: '2024-01-04T16:45:00Z',
    author_name: 'David Wright (Customer)',
    attachments: [
      {
        id: 'att-2',
        correction_id: 'cor-3',
        file_url: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=800&q=80',
        file_name: 'crest_vector_proof.png',
        file_size: '480 KB'
      }
    ]
  },
  {
    id: 'cor-4',
    order_id: 'ord-6',
    message: 'Adjust radiant cut stone orientation by 15 degrees in bypass platinum setting.',
    created_at: '2024-01-05T11:20:00Z',
    author_name: 'Julian Vance (Customer)',
    attachments: []
  }
];

export const INITIAL_STATUS_HISTORY: OrderStatusHistory[] = [
  // Order 1
  {
    id: 'sh-101',
    order_id: 'ord-1',
    status: 'Pending',
    start_date: '2024-01-01T09:00:00Z',
    end_date: '2024-01-02T18:00:00Z'
  },
  {
    id: 'sh-102',
    order_id: 'ord-1',
    status: 'Designing',
    start_date: '2024-01-03T09:00:00Z',
    end_date: null // Active
  },

  // Order 2
  {
    id: 'sh-201',
    order_id: 'ord-2',
    status: 'Pending',
    start_date: '2024-01-02T11:30:00Z',
    end_date: null // Active
  },

  // Order 3
  {
    id: 'sh-301',
    order_id: 'ord-3',
    status: 'Pending',
    start_date: '2024-01-01T10:00:00Z',
    end_date: '2024-01-02T12:00:00Z'
  },
  {
    id: 'sh-302',
    order_id: 'ord-3',
    status: 'Designing',
    start_date: '2024-01-02T12:00:00Z',
    end_date: '2024-01-05T17:00:00Z'
  },
  {
    id: 'sh-303',
    order_id: 'ord-3',
    status: 'Review',
    start_date: '2024-01-05T17:00:00Z',
    end_date: null // Active
  },

  // Order 4 (Completed)
  {
    id: 'sh-401',
    order_id: 'ord-4',
    status: 'Pending',
    start_date: '2023-12-28T08:00:00Z',
    end_date: '2023-12-29T10:00:00Z'
  },
  {
    id: 'sh-402',
    order_id: 'ord-4',
    status: 'Designing',
    start_date: '2023-12-29T10:00:00Z',
    end_date: '2024-01-04T15:00:00Z'
  },
  {
    id: 'sh-403',
    order_id: 'ord-4',
    status: 'Review',
    start_date: '2024-01-04T15:00:00Z',
    end_date: '2024-01-06T11:00:00Z'
  },
  {
    id: 'sh-404',
    order_id: 'ord-4',
    status: 'Completed',
    start_date: '2024-01-06T11:00:00Z',
    end_date: null
  },

  // Order 5
  {
    id: 'sh-501',
    order_id: 'ord-5',
    status: 'Pending',
    start_date: '2024-01-03T09:00:00Z',
    end_date: '2024-01-04T14:00:00Z'
  },
  {
    id: 'sh-502',
    order_id: 'ord-5',
    status: 'Designing',
    start_date: '2024-01-04T14:00:00Z',
    end_date: '2024-01-07T16:00:00Z'
  },
  {
    id: 'sh-503',
    order_id: 'ord-5',
    status: 'Review',
    start_date: '2024-01-07T16:00:00Z',
    end_date: null
  },

  // Order 6
  {
    id: 'sh-601',
    order_id: 'ord-6',
    status: 'Pending',
    start_date: '2024-01-04T08:30:00Z',
    end_date: '2024-01-05T09:00:00Z'
  },
  {
    id: 'sh-602',
    order_id: 'ord-6',
    status: 'Designing',
    start_date: '2024-01-05T09:00:00Z',
    end_date: null
  },

  // Order 7
  {
    id: 'sh-701',
    order_id: 'ord-7',
    status: 'Pending',
    start_date: '2023-12-20T10:00:00Z',
    end_date: '2023-12-21T12:00:00Z'
  },
  {
    id: 'sh-702',
    order_id: 'ord-7',
    status: 'Designing',
    start_date: '2023-12-21T12:00:00Z',
    end_date: '2023-12-27T17:00:00Z'
  },
  {
    id: 'sh-703',
    order_id: 'ord-7',
    status: 'Review',
    start_date: '2023-12-27T17:00:00Z',
    end_date: '2023-12-29T14:00:00Z'
  },
  {
    id: 'sh-704',
    order_id: 'ord-7',
    status: 'Completed',
    start_date: '2023-12-29T14:00:00Z',
    end_date: null
  }
];
