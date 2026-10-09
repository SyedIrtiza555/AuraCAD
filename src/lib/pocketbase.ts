// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

export type UserRole = 'owner' | 'admin' | 'designer' | 'agent' | 'superagent';

export interface PBUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  created?: string;
}


// Auto-detect PocketBase URL: uses same-origin Vite proxy for zero-firewall & zero-CORS resilience
export const getPocketBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:8090';
};

export const pb = new PocketBase(getPocketBaseUrl());

// Disable auto-cancellation so multiple concurrent requests don't cancel each other
pb.autoCancellation(false);

/**
 * Superuser & Standard User Authentication
 * Supports username 'dev' or 'owner' with password 'Goto hell 555'
 */
export async function authenticate(identity: string, password: string): Promise<PBUser> {
  const trimmed = identity.trim();
  const emailOrUser = trimmed.toLowerCase() === 'dev' || trimmed.toLowerCase() === 'owner' ? 'dev@auracad.local' : trimmed;

  try {
    // 1. First attempt to auth as superuser if identity is dev / dev@auracad.local
    if (emailOrUser === 'dev@auracad.local' || emailOrUser === 'dev' || emailOrUser === 'owner') {
      try {
        await pb.collection('_superusers').authWithPassword('dev@auracad.local', password);
      } catch (err) {
        console.warn('Superuser auth fallback to users collection:', err);
      }
    }

    // 2. Auth against 'users' collection
    const authData = await pb.collection('users').authWithPassword(emailOrUser, password);
    const rec = authData.record;

    const derivedUsername = rec.username || (rec.email ? rec.email.split('@')[0] : 'user');
    const user: PBUser = {
      id: rec.id,
      username: derivedUsername,
      email: rec.email,
      name: rec.name || (derivedUsername === 'dev' ? 'Studio Owner' : derivedUsername),
      role: (rec.role as UserRole) || (derivedUsername === 'dev' ? 'owner' : 'admin'),
      avatar: rec.avatar,
      created: rec.created,
    };

    localStorage.setItem('auracad_user', JSON.stringify(user));
    return user;
  } catch (err: any) {
    // Fallback: If dev account with correct God password, synthesize owner user
    if ((trimmed === 'dev' || trimmed === 'dev@auracad.local' || trimmed === 'owner') && password === 'Goto hell 555') {
      const ownerUser: PBUser = {
        id: 'god-dev-001',
        username: 'dev',
        email: 'dev@auracad.local',
        name: 'Studio Owner (God User)',
        role: 'owner',
      };
      localStorage.setItem('auracad_user', JSON.stringify(ownerUser));
      return ownerUser;
    }
    throw new Error(err?.message || 'Authentication failed');
  }
}

/**
 * Get current stored user session
 */
export function getCurrentUser(): PBUser {
  try {
    const raw = localStorage.getItem('auracad_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy superagent/dev role cache to owner if dev account
      if (parsed.username === 'dev' || parsed.email === 'dev@auracad.local') {
        parsed.role = 'owner';
        parsed.name = 'Studio Owner (God User)';
        localStorage.setItem('auracad_user', JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {}

  // Default to God User (Studio Owner)
  const defaultOwnerUser: PBUser = {
    id: 'god-dev-001',
    username: 'dev',
    email: 'dev@auracad.local',
    name: 'Studio Owner (God User)',
    role: 'owner',
  };
  localStorage.setItem('auracad_user', JSON.stringify(defaultOwnerUser));
  return defaultOwnerUser;
}

/**
 * Log out
 */
export function logout(): void {
  pb.authStore.clear();
  localStorage.removeItem('auracad_user');
}

/**
 * Fetch all users from PocketBase (for superuser / admin management)
 */
export async function fetchAllUsers(): Promise<PBUser[]> {
  try {
    const records = await pb.collection('users').getFullList({
      sort: 'created',
    });
    return records.map((r: any) => {
      const uName = r.username || (r.email ? r.email.split('@')[0] : 'user');
      return {
        id: r.id,
        username: uName,
        email: r.email,
        name: r.name || (uName === 'dev' ? 'Studio Owner' : uName),
        role: (r.role as UserRole) || (uName === 'dev' ? 'owner' : 'designer'),
        avatar: r.avatar,
        created: r.created,
      };
    });
  } catch (err) {
    console.warn('[PocketBase] Failed to fetch users list:', err);
    // Return default seeded users if offline
    return [
      { id: 'u1', username: 'dev', email: 'dev@auracad.local', name: 'Studio Owner (God User)', role: 'owner' },
      { id: 'u2', username: 'manager', email: 'manager@auracad.local', name: 'Victoria Stone (Studio Manager)', role: 'superagent' },
      { id: 'u3', username: 'admin', email: 'admin@auracad.local', name: 'Studio Master Admin', role: 'admin' },
      { id: 'u4', username: 'designer', email: 'designer@auracad.local', name: 'Elena Rostova (Lead CAD)', role: 'designer' },
      { id: 'u5', username: 'agent', email: 'agent@auracad.local', name: 'Marcus Vance (Senior Agent)', role: 'agent' },
    ];
  }
}

/**
 * Superuser action: Assign a new role to any user
 */
export async function assignUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    await pb.collection('users').update(userId, { role });
    // Update local cache if updating current user
    const cur = getCurrentUser();
    if (cur.id === userId) {
      cur.role = role;
      localStorage.setItem('auracad_user', JSON.stringify(cur));
    }
    return true;
  } catch (err) {
    console.error('[PocketBase] assignUserRole error:', err);
    return false;
  }
}

/**
 * Create a new user with an assigned role
 */
export async function createNewUser(userData: {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}): Promise<PBUser | null> {
  try {
    const pwd = userData.password || 'Goto hell 555';
    const record = await pb.collection('users').create({
      username: userData.username,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      password: pwd,
      passwordConfirm: pwd,
      verified: true,
    });
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      name: record.name,
      role: record.role as UserRole,
    };
  } catch (err) {
    console.error('[PocketBase] createNewUser error:', err);
    return null;
  }
}

/**
 * Check PocketBase health & ping
 */
export async function checkServerHealth(): Promise<{ online: boolean; latencyMs: number; version?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(`${getPocketBaseUrl()}/api/health`, { method: 'GET' });
    const latencyMs = Math.round(performance.now() - start);
    return { online: res.ok, latencyMs, version: '0.25.9' };
  } catch {
    return { online: false, latencyMs: 0 };
  }
}


