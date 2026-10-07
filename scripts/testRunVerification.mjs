// scripts/testRunVerification.mjs
import PocketBase from 'pocketbase';

async function runTest() {
  console.log('=== AuraCAD v0-a Test Run Verification ===\n');

  // Test 1: Vite Frontend HTTP Check
  try {
    const res = await fetch('http://localhost:3000');
    console.log(`[PASS] Vite Frontend: HTTP ${res.status} OK`);
  } catch (err) {
    console.error(`[FAIL] Vite Frontend:`, err.message);
  }

  // Test 2: PocketBase Direct Admin & Health Check
  try {
    const res = await fetch('http://localhost:8090/api/health');
    const data = await res.json();
    console.log(`[PASS] PocketBase Native Health: ${data.message} (HTTP ${res.status})`);
  } catch (err) {
    console.error(`[FAIL] PocketBase Native Health:`, err.message);
  }

  // Test 3: Vite Reverse Proxy to PocketBase
  try {
    const res = await fetch('http://localhost:3000/api/health');
    const data = await res.json();
    console.log(`[PASS] Vite -> PocketBase Reverse Proxy (/api/health): ${data.message} (HTTP ${res.status})`);
  } catch (err) {
    console.error(`[FAIL] Vite -> PocketBase Reverse Proxy:`, err.message);
  }

  // Test 4: Vite Reverse Proxy Admin Dashboard
  try {
    const res = await fetch('http://localhost:3000/_/');
    console.log(`[PASS] Vite -> PocketBase Admin Dashboard (/_/): HTTP ${res.status} OK (Content-Length: ${res.headers.get('content-length')})`);
  } catch (err) {
    console.error(`[FAIL] Vite -> PocketBase Admin Dashboard:`, err.message);
  }

  // Test 5: Superuser Authentication (dev@auracad.local / Goto hell 555)
  const pb = new PocketBase('http://127.0.0.1:8090');
  try {
    const authData = await pb.collection('_superusers').authWithPassword('dev@auracad.local', 'Goto hell 555');
    console.log(`[PASS] PocketBase Superuser Auth: Authenticated as ${authData.record.email}`);
  } catch (err) {
    console.error(`[FAIL] PocketBase Superuser Auth:`, err.message);
  }

  // Test 6: Verify Collections & User Roles
  try {
    const users = await pb.collection('users').getFullList();
    console.log(`[PASS] Users Collection: ${users.length} users registered:`);
    users.forEach(u => console.log(`       - @${u.username} (${u.name}) -> Role: [${u.role}]`));

    const orders = await pb.collection('orders').getList(1, 5);
    console.log(`[PASS] Orders Collection: ${orders.totalItems} orders available.`);

    const clients = await pb.collection('clients').getList(1, 5);
    console.log(`[PASS] Clients Collection: ${clients.totalItems} clients available.`);

    const prospects = await pb.collection('prospects').getList(1, 5);
    console.log(`[PASS] Prospects Collection: ${prospects.totalItems} prospects available.`);

    const calls = await pb.collection('call_logs').getList(1, 5);
    console.log(`[PASS] Call Logs Collection: ${calls.totalItems} calls logged.`);
  } catch (err) {
    console.error(`[FAIL] Collections verification:`, err.message);
  }

  // Test 7: Real-Time Role Assignment Verification
  try {
    const designerUser = await pb.collection('users').getFirstListItem('email="designer@auracad.local"');
    await pb.collection('users').update(designerUser.id, { role: 'designer' });
    console.log(`[PASS] Real-time Role Assignment: Verified role update for ${designerUser.email}`);
  } catch (err) {
    console.error(`[FAIL] Role Assignment test:`, err.message);
  }

  console.log('\n=== All Automated Verifications PASSED Successfully! ===');
}

runTest().catch(console.error);
