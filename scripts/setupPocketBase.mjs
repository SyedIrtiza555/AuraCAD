// scripts/setupPocketBase.mjs
import PocketBase from 'pocketbase';

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

async function run() {
  console.log(`[PocketBase Setup] Connecting to ${PB_URL}...`);

  // 1. Authenticate as Superuser
  try {
    await pb.collection('_superusers').authWithPassword('dev@auracad.local', 'Goto hell 555');
    console.log('[PocketBase Setup] Authenticated successfully as Superuser (dev@auracad.local)');
  } catch (err) {
    console.error('[PocketBase Setup] Failed to auth as superuser:', err.message);
    process.exit(1);
  }

  // 2. Update 'users' collection to include 'role' field
  try {
    const userCol = await pb.collections.getOne('users');
    const hasRole = userCol.fields.some(f => f.name === 'role');
    if (!hasRole) {
      console.log("[PocketBase Setup] Adding 'role' select field to 'users' collection...");
      userCol.fields.push({
        name: 'role',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['admin', 'designer', 'agent', 'superagent'],
      });
      await pb.collections.update('users', userCol);
      console.log("[PocketBase Setup] 'users' collection updated with 'role' field.");
    } else {
      console.log("[PocketBase Setup] 'role' field already exists on 'users' collection.");
    }

    // Set open API rules for users collection during development
    userCol.listRule = '';
    userCol.viewRule = '';
    userCol.createRule = '';
    userCol.updateRule = '';
    userCol.deleteRule = '';
    await pb.collections.update('users', userCol);
  } catch (err) {
    console.error("[PocketBase Setup] Error configuring 'users' collection:", err.message);
  }

  // 3. Helper to create collections if they don't exist
  async function ensureCollection(name, fields) {
    try {
      await pb.collections.getOne(name);
      console.log(`[PocketBase Setup] Collection '${name}' exists.`);
    } catch {
      console.log(`[PocketBase Setup] Creating collection '${name}'...`);
      await pb.collections.create({
        name,
        type: 'base',
        fields,
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
      });
      console.log(`[PocketBase Setup] Collection '${name}' created.`);
    }
  }

  // Orders collection
  await ensureCollection('orders', [
    { name: 'order_id', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'client_id', type: 'text' },
    { name: 'client_name', type: 'text' },
    { name: 'designer', type: 'text' },
    { name: 'closer', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'order_type', type: 'text' },
    { name: 'priority', type: 'text' },
    { name: 'value', type: 'number' },
    { name: 'due_date', type: 'text' },
    { name: 'cad_stage', type: 'text' },
    { name: 'cad_revisions', type: 'number' },
    { name: 'notes', type: 'text' },
    { name: 'images', type: 'json' },
    { name: 'corrections', type: 'json' },
    { name: 'raw_data', type: 'json' }
  ]);

  // Clients collection
  await ensureCollection('clients', [
    { name: 'client_id', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'tier', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'notes', type: 'text' }
  ]);

  // Prospects collection
  await ensureCollection('prospects', [
    { name: 'prospect_id', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'budget', type: 'number' },
    { name: 'stage', type: 'text' },
    { name: 'agent', type: 'text' },
    { name: 'designer', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'jewelry_type', type: 'text' },
    { name: 'target_due_date', type: 'text' },
    { name: 'notes', type: 'text' },
    { name: 'images', type: 'json' }
  ]);

  // Calls / Powerdialler collection
  await ensureCollection('call_logs', [
    { name: 'contact_name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'agent_name', type: 'text' },
    { name: 'status', type: 'text' }, // 'Completed', 'Scheduled', 'Missed', 'Voicemail'
    { name: 'duration_seconds', type: 'number' },
    { name: 'outcome', type: 'text' }, // 'Qualified', 'Follow-up Needed', 'Not Interested', 'Bespoke Quote Sent'
    { name: 'notes', type: 'text' },
    { name: 'call_time', type: 'text' }
  ]);

  // 4. Seed Default Users with roles (admin, designer, agent, superagent)
  const defaultUsers = [
    {
      username: 'dev',
      email: 'dev@auracad.local',
      name: 'God User (Dev)',
      role: 'superagent',
      password: 'Goto hell 555',
      passwordConfirm: 'Goto hell 555',
      verified: true
    },
    {
      username: 'admin',
      email: 'admin@auracad.local',
      name: 'Studio Master Admin',
      role: 'admin',
      password: 'Goto hell 555',
      passwordConfirm: 'Goto hell 555',
      verified: true
    },
    {
      username: 'designer',
      email: 'designer@auracad.local',
      name: 'Elena Rostova (Lead CAD)',
      role: 'designer',
      password: 'Goto hell 555',
      passwordConfirm: 'Goto hell 555',
      verified: true
    },
    {
      username: 'agent',
      email: 'agent@auracad.local',
      name: 'Marcus Vance (Senior Agent)',
      role: 'agent',
      password: 'Goto hell 555',
      passwordConfirm: 'Goto hell 555',
      verified: true
    }
  ];

  console.log('[PocketBase Setup] Seeding default users...');
  for (const u of defaultUsers) {
    try {
      const existing = await pb.collection('users').getFirstListItem(`username="${u.username}"`);
      // Update role if changed
      await pb.collection('users').update(existing.id, {
        role: u.role,
        name: u.name
      });
      console.log(`[PocketBase Setup] Updated user: ${u.username} (${u.role})`);
    } catch {
      await pb.collection('users').create(u);
      console.log(`[PocketBase Setup] Created user: ${u.username} (${u.role})`);
    }
  }

  // 5. Seed Call Logs for Powerdialler CRM preview
  try {
    const existingCalls = await pb.collection('call_logs').getList(1, 1);
    if (existingCalls.totalItems === 0) {
      console.log('[PocketBase Setup] Seeding sample powerdialler call records...');
      const sampleCalls = [
        {
          contact_name: 'Julian Vance',
          phone: '+1 (555) 0199',
          agent_name: 'Marcus Vance',
          status: 'Completed',
          duration_seconds: 245,
          outcome: 'Qualified',
          notes: 'Client confirmed budget of $18,500 for 3.5ct Toi et Moi platinum mount. Sent CAD intake brief.',
          call_time: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          contact_name: 'Maya Lin',
          phone: '+1 (555) 0214',
          agent_name: 'Marcus Vance',
          status: 'Completed',
          duration_seconds: 180,
          outcome: 'Follow-up Needed',
          notes: 'Discussed Art Deco choker specs. Client requesting stone spacing adjustment before deposit.',
          call_time: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          contact_name: 'Robert Chase',
          phone: '+1 (555) 0102',
          agent_name: 'Marcus Vance',
          status: 'Scheduled',
          duration_seconds: 0,
          outcome: 'Bespoke Quote Sent',
          notes: 'Scheduled discovery call tomorrow at 2:00 PM for custom vintage signet ring.',
          call_time: new Date(Date.now() + 86400000).toISOString()
        }
      ];
      for (const call of sampleCalls) {
        await pb.collection('call_logs').create(call);
      }
      console.log('[PocketBase Setup] Seeded 3 sample call records.');
    }
  } catch (err) {
    console.error('[PocketBase Setup] Error seeding call logs:', err.message);
  }

  console.log('[PocketBase Setup] All collections and users successfully initialized!');
}

run().catch((err) => {
  console.error('[PocketBase Setup] Unhandled error:', err);
  process.exit(1);
});
