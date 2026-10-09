// src/data.ts
// Digital Office System Seed Data with 3-Part Order Code PK: <DesignerCode>-<ClientCode>-<OrderName>

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
    code: 'ER',
    name: 'Elena Rostova',
    email: 'elena@auracad.local',
    phone: '+1 555-0144',
    specialty: 'High-Jewelry Rings & Diamond Solitaires'
  },
  {
    id: 'des-2',
    code: 'FU', // Farooq Qureshi (Matches user's FU example)
    name: 'Farooq Qureshi',
    email: 'farooq@auracad.local',
    phone: '+1 555-0182',
    specialty: 'Vintage Filigree & Three-Stone Custom Mounts'
  },
  {
    id: 'des-3',
    code: 'MA',
    name: 'Muneeb Al-Mansoor',
    email: 'muneeb@auracad.local',
    phone: '+1 555-0199',
    specialty: 'Men’s Signets & Platinum Heavy Castings'
  },
  {
    id: 'des-4',
    code: 'AT',
    name: 'Abdullah Tariq',
    email: 'abdullah@auracad.local',
    phone: '+1 555-0112',
    specialty: 'Articulated Tennis Bracelets & Bangles'
  }
];

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'prosp-1',
    code: 'CA', // Crown Atelier (Matches user's CA example)
    name: 'Sarah Jenkins',
    email: 'sarah@jenkinsdiamonds.com',
    phone: '+1 555-0101',
    company: 'Crown Atelier Fine Jewels'
  },
  {
    id: 'prosp-2',
    code: 'VC',
    name: 'Julian Vance',
    email: 'julian.v@vancecap.com',
    phone: '+1 555-0190',
    company: 'Vance Capital Private Office'
  },
  {
    id: 'prosp-3',
    code: 'LA',
    name: 'Maya Lin',
    email: 'maya@linatelier.design',
    phone: '+1 555-0214',
    company: 'Lin Atelier Architecture'
  },
  {
    id: 'prosp-4',
    code: 'WH',
    name: 'David Wright',
    email: 'david@wrightinvest.com',
    phone: '+1 555-0103',
    company: 'Wright Luxury Holdings'
  },
  {
    id: 'prosp-5',
    code: 'CH',
    name: 'Emily Chen',
    email: 'emily@chenluxury.co',
    phone: '+1 555-0104',
    company: 'Chen Haute Horlogerie'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    // Exact schema requested: "FU-CA-Three stone ring"
    id: 'FU-CA-Three stone ring',
    order_code: 'FU-CA-Three stone ring',
    name: 'Three stone ring',
    status: 'Designing',
    effort_level: 'High',
    order_value: 9400,
    created_at: '2024-01-01',
    designer_id: 'des-2', // Farooq Qureshi (FU)
    prospect_id: 'prosp-1'  // Crown Atelier (CA)
  },
  {
    id: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    order_code: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    name: 'Solitaire 1.5ct Diamond Ring',
    status: 'Review',
    effort_level: 'Urgent',
    order_value: 8200,
    created_at: '2024-01-02',
    designer_id: 'des-1', // Elena Rostova (ER)
    prospect_id: 'prosp-1'  // Crown Atelier (CA)
  },
  {
    id: 'FU-VC-Vintage Emerald Pendant',
    order_code: 'FU-VC-Vintage Emerald Pendant',
    name: 'Vintage Emerald Pendant',
    status: 'Pending',
    effort_level: 'Medium',
    order_value: 5800,
    created_at: '2024-01-02',
    designer_id: 'des-2', // Farooq Qureshi (FU)
    prospect_id: 'prosp-2'  // Vance Capital (VC)
  },
  {
    id: 'MA-WH-Platinum Signet Crest Ring',
    order_code: 'MA-WH-Platinum Signet Crest Ring',
    name: 'Platinum Signet Crest Ring',
    status: 'Completed',
    effort_level: 'High',
    order_value: 7200,
    created_at: '2023-12-28',
    designer_id: 'des-3', // Muneeb Al-Mansoor (MA)
    prospect_id: 'prosp-4'  // Wright Holdings (WH)
  },
  {
    id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    order_code: 'AT-CH-Tennis Bracelet 5ct Box Link',
    name: 'Tennis Bracelet 5ct Box Link',
    status: 'Completed',
    effort_level: 'Low',
    order_value: 14500,
    created_at: '2023-12-28',
    designer_id: 'des-4', // Abdullah Tariq (AT)
    prospect_id: 'prosp-5'  // Chen Horlogerie (CH)
  },
  {
    id: 'ER-LA-Art Deco Sapphire Choker',
    order_code: 'ER-LA-Art Deco Sapphire Choker',
    name: 'Art Deco Sapphire Choker',
    status: 'Review',
    effort_level: 'High',
    order_value: 11200,
    created_at: '2024-01-03',
    designer_id: 'des-1', // Elena Rostova (ER)
    prospect_id: 'prosp-3'  // Lin Atelier (LA)
  },
  {
    id: 'AT-VC-Toi et Moi Radiant Cut Ring',
    order_code: 'AT-VC-Toi et Moi Radiant Cut Ring',
    name: 'Toi et Moi Radiant Cut Ring',
    status: 'Designing',
    effort_level: 'Urgent',
    order_value: 18500,
    created_at: '2024-01-04',
    designer_id: 'des-4', // Abdullah Tariq (AT)
    prospect_id: 'prosp-2'  // Vance Capital (VC)
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    order_id: 'FU-CA-Three stone ring',
    invoice_number: 'INV-2024-001',
    amount: 9400,
    status: 'Paid',
    created_at: '2024-01-01',
    due_date: '2024-01-15'
  },
  {
    id: 'inv-2',
    order_id: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    invoice_number: 'INV-2024-002',
    amount: 8200,
    status: 'Sent',
    created_at: '2024-01-02',
    due_date: '2024-01-16'
  },
  {
    id: 'inv-3',
    order_id: 'FU-VC-Vintage Emerald Pendant',
    invoice_number: 'INV-2024-003',
    amount: 5800,
    status: 'Sent',
    created_at: '2024-01-02',
    due_date: '2024-01-16'
  },
  {
    id: 'inv-4',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    invoice_number: 'INV-2024-004',
    amount: 7200,
    status: 'Paid',
    created_at: '2023-12-28',
    due_date: '2024-01-11'
  },
  {
    id: 'inv-5',
    order_id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    invoice_number: 'INV-2024-005',
    amount: 14500,
    status: 'Paid',
    created_at: '2023-12-28',
    due_date: '2024-01-11'
  },
  {
    id: 'inv-6',
    order_id: 'ER-LA-Art Deco Sapphire Choker',
    invoice_number: 'INV-2024-006',
    amount: 11200,
    status: 'Draft',
    created_at: '2024-01-03',
    due_date: '2024-01-20'
  },
  {
    id: 'inv-7',
    order_id: 'AT-VC-Toi et Moi Radiant Cut Ring',
    invoice_number: 'INV-2024-007',
    amount: 18500,
    status: 'Sent',
    created_at: '2024-01-04',
    due_date: '2024-01-18'
  }
];

export const INITIAL_CORRECTIONS: Correction[] = [
  {
    id: 'cor-1',
    order_id: 'FU-CA-Three stone ring',
    message: 'Thicken prong tips to 0.85mm for diamond retention safety guarantee on center stone.',
    created_at: '2024-01-03T14:30:00Z',
    author_name: 'Sarah Jenkins (Client)',
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
    order_id: 'FU-CA-Three stone ring',
    message: 'Adjust side trilliant stone orientation by 2 degrees for seamless flush seating.',
    created_at: '2024-01-04T10:15:00Z',
    author_name: 'Farooq Qureshi (Designer)',
    attachments: []
  },
  {
    id: 'cor-3',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    message: 'Deepen family crest relief depth to 0.4mm for master hand-engraver clearance.',
    created_at: '2024-01-04T16:45:00Z',
    author_name: 'David Wright (Client)',
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
    order_id: 'AT-VC-Toi et Moi Radiant Cut Ring',
    message: 'Adjust radiant cut stone orientation by 15 degrees in bypass platinum setting.',
    created_at: '2024-01-05T11:20:00Z',
    author_name: 'Julian Vance (Client)',
    attachments: []
  }
];

export const INITIAL_STATUS_HISTORY: OrderStatusHistory[] = [
  // FU-CA-Three stone ring
  {
    id: 'sh-101',
    order_id: 'FU-CA-Three stone ring',
    status: 'Pending',
    start_date: '2024-01-01T09:00:00Z',
    end_date: '2024-01-02T18:00:00Z'
  },
  {
    id: 'sh-102',
    order_id: 'FU-CA-Three stone ring',
    status: 'Designing',
    start_date: '2024-01-03T09:00:00Z',
    end_date: null // Active
  },

  // ER-CA-Solitaire 1.5ct Diamond Ring
  {
    id: 'sh-201',
    order_id: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    status: 'Pending',
    start_date: '2024-01-02T10:00:00Z',
    end_date: '2024-01-03T11:00:00Z'
  },
  {
    id: 'sh-202',
    order_id: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    status: 'Designing',
    start_date: '2024-01-03T11:00:00Z',
    end_date: '2024-01-05T16:00:00Z'
  },
  {
    id: 'sh-203',
    order_id: 'ER-CA-Solitaire 1.5ct Diamond Ring',
    status: 'Review',
    start_date: '2024-01-05T16:00:00Z',
    end_date: null // Active
  },

  // FU-VC-Vintage Emerald Pendant
  {
    id: 'sh-301',
    order_id: 'FU-VC-Vintage Emerald Pendant',
    status: 'Pending',
    start_date: '2024-01-02T11:30:00Z',
    end_date: null // Active
  },

  // MA-WH-Platinum Signet Crest Ring (Completed)
  {
    id: 'sh-401',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    status: 'Pending',
    start_date: '2023-12-28T08:00:00Z',
    end_date: '2023-12-29T10:00:00Z'
  },
  {
    id: 'sh-402',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    status: 'Designing',
    start_date: '2023-12-29T10:00:00Z',
    end_date: '2024-01-04T15:00:00Z'
  },
  {
    id: 'sh-403',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    status: 'Review',
    start_date: '2024-01-04T15:00:00Z',
    end_date: '2024-01-06T11:00:00Z'
  },
  {
    id: 'sh-404',
    order_id: 'MA-WH-Platinum Signet Crest Ring',
    status: 'Completed',
    start_date: '2024-01-06T11:00:00Z',
    end_date: null
  },

  // AT-CH-Tennis Bracelet 5ct Box Link (Completed)
  {
    id: 'sh-501',
    order_id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    status: 'Pending',
    start_date: '2023-12-28T10:00:00Z',
    end_date: '2023-12-29T14:00:00Z'
  },
  {
    id: 'sh-502',
    order_id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    status: 'Designing',
    start_date: '2023-12-29T14:00:00Z',
    end_date: '2024-01-03T18:00:00Z'
  },
  {
    id: 'sh-503',
    order_id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    status: 'Review',
    start_date: '2024-01-03T18:00:00Z',
    end_date: '2024-01-05T12:00:00Z'
  },
  {
    id: 'sh-504',
    order_id: 'AT-CH-Tennis Bracelet 5ct Box Link',
    status: 'Completed',
    start_date: '2024-01-05T12:00:00Z',
    end_date: null
  },

  // ER-LA-Art Deco Sapphire Choker
  {
    id: 'sh-601',
    order_id: 'ER-LA-Art Deco Sapphire Choker',
    status: 'Pending',
    start_date: '2024-01-03T09:00:00Z',
    end_date: '2024-01-04T14:00:00Z'
  },
  {
    id: 'sh-602',
    order_id: 'ER-LA-Art Deco Sapphire Choker',
    status: 'Designing',
    start_date: '2024-01-04T14:00:00Z',
    end_date: '2024-01-07T16:00:00Z'
  },
  {
    id: 'sh-603',
    order_id: 'ER-LA-Art Deco Sapphire Choker',
    status: 'Review',
    start_date: '2024-01-07T16:00:00Z',
    end_date: null // Active
  },

  // AT-VC-Toi et Moi Radiant Cut Ring
  {
    id: 'sh-701',
    order_id: 'AT-VC-Toi et Moi Radiant Cut Ring',
    status: 'Pending',
    start_date: '2024-01-04T08:30:00Z',
    end_date: '2024-01-05T09:00:00Z'
  },
  {
    id: 'sh-702',
    order_id: 'AT-VC-Toi et Moi Radiant Cut Ring',
    status: 'Designing',
    start_date: '2024-01-05T09:00:00Z',
    end_date: null // Active
  }
];
