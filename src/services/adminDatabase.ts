import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db, FIRESTORE_CONSOLE_URL } from './firebase';

/**
 * Admin Credentials Database
 * Stores verified administrator identities and credentials in Cloud Firestore.
 * Standard user accounts and customers do not exist here and cannot access the admin panel.
 */

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Stored credential
  name: string;
  authority: 'ROLE_ADMIN';
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  failedAttempts: number;
}

export { FIRESTORE_CONSOLE_URL };

const STORAGE_KEY_ADMIN_DB = 'apex_admin_database_cache_v2';

export const INITIAL_ADMIN_DATABASE: AdminAccount[] = [
  {
    id: 'adm-001',
    username: 'admin',
    email: 'admin@apexstore.com',
    passwordHash: 'Admin@2026!',
    name: 'Sarah Connor',
    authority: 'ROLE_ADMIN',
    createdAt: '2025-01-01',
    lastLogin: 'Today, 09:30 AM',
    status: 'active',
    failedAttempts: 0
  },
  {
    id: 'adm-002',
    username: 'superadmin',
    email: 'root@apexstore.internal',
    passwordHash: 'ApexSecure#99',
    name: 'Chief Security Officer',
    authority: 'ROLE_ADMIN',
    createdAt: '2025-03-15',
    lastLogin: 'Yesterday, 14:15 PM',
    status: 'active',
    failedAttempts: 0
  }
];

// In-memory cache synced with Firestore
let cachedAdminAccounts: AdminAccount[] = [...INITIAL_ADMIN_DATABASE];
let isFirestoreInitialized = false;

// Sync subscribers
const listeners = new Set<(accounts: AdminAccount[]) => void>();

export function subscribeAdminAccounts(callback: (accounts: AdminAccount[]) => void): () => void {
  listeners.add(callback);
  callback([...cachedAdminAccounts]);
  return () => {
    listeners.delete(callback);
  };
}

function notifySubscribers() {
  listeners.forEach(cb => cb([...cachedAdminAccounts]));
}

/**
 * Bootstraps Firestore and listens for live updates from Firebase Console
 */
export async function initializeFirestoreAdminSync(): Promise<void> {
  if (isFirestoreInitialized) return;
  isFirestoreInitialized = true;

  try {
    // Proactively seed initial admin accounts into Cloud Firestore so they exist
    for (const admin of INITIAL_ADMIN_DATABASE) {
      setDoc(doc(db, 'admins', admin.username), admin, { merge: true }).catch(err => {
        console.warn('Initial admin seed notice:', err);
      });
    }

    const adminColRef = collection(db, 'admins');

    // Attach real-time Firestore snapshot listener
    onSnapshot(adminColRef, async (snapshot) => {
      if (snapshot.empty) {
        // First boot: Seed initial admin credentials into Firestore
        console.log('Seeding initial admin accounts into Cloud Firestore...');
        for (const admin of INITIAL_ADMIN_DATABASE) {
          await setDoc(doc(db, 'admins', admin.username), admin, { merge: true }).catch(() => {});
        }
      } else {
        const remoteAccounts: AdminAccount[] = [];
        snapshot.forEach(docSnap => {
          remoteAccounts.push(docSnap.data() as AdminAccount);
        });

        if (remoteAccounts.length > 0) {
          cachedAdminAccounts = remoteAccounts;
          try {
            localStorage.setItem(STORAGE_KEY_ADMIN_DB, JSON.stringify(remoteAccounts));
          } catch {
            // ignore
          }
          notifySubscribers();
        }
      }
    }, (err) => {
      console.warn('Firestore snapshot listener notice:', err);
    });
  } catch (e) {
    console.error('Error initializing Firestore admin sync', e);
  }
}

// Trigger initialization
initializeFirestoreAdminSync();

export function getAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_DB);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load admin cache', e);
  }
  return cachedAdminAccounts;
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  cachedAdminAccounts = accounts;
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_DB, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to persist admin cache', e);
  }
  notifySubscribers();
}

/**
 * Spring Security DaoAuthenticationProvider Verification
 * Validates username/email and password against the Cloud Admin Database
 */
export function authenticateAdminCredentials(
  usernameOrEmail: string,
  plainPassword: string
): { success: boolean; admin?: AdminAccount; error?: string } {
  const accounts = getAdminAccounts();
  const cleanInput = usernameOrEmail.trim().toLowerCase();

  const found = accounts.find(
    acc => acc.username.toLowerCase() === cleanInput || acc.email.toLowerCase() === cleanInput
  );

  if (!found) {
    return {
      success: false,
      error: 'org.springframework.security.authentication.BadCredentialsException: Bad credentials (Admin username or email not found in admin database).'
    };
  }

  if (found.status === 'suspended') {
    return {
      success: false,
      error: 'org.springframework.security.authentication.LockedException: This administrator account has been suspended by governance policy.'
    };
  }

  // Password verification
  if (found.passwordHash !== plainPassword) {
    const newFailedAttempts = (found.failedAttempts || 0) + 1;
    const updated = accounts.map(acc => {
      if (acc.id === found.id) {
        return { ...acc, failedAttempts: newFailedAttempts };
      }
      return acc;
    });
    saveAdminAccounts(updated);

    // Sync failed attempt to Firestore safely using setDoc with merge: true
    setDoc(
      doc(db, 'admins', found.username),
      {
        ...found,
        failedAttempts: newFailedAttempts
      },
      { merge: true }
    ).catch(err => {
      console.warn('Sync failedAttempts notice:', err);
    });

    return {
      success: false,
      error: 'org.springframework.security.authentication.BadCredentialsException: Invalid password provided for administrator principal.'
    };
  }

  // Success: update lastLogin and reset failed attempts
  const nowStr = new Date().toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedAdmin: AdminAccount = {
    ...found,
    lastLogin: nowStr,
    failedAttempts: 0
  };

  const updated = accounts.map(acc => {
    if (acc.id === found.id) {
      return updatedAdmin;
    }
    return acc;
  });
  saveAdminAccounts(updated);

  // Sync login to Firestore safely using setDoc with merge: true
  setDoc(
    doc(db, 'admins', found.username),
    updatedAdmin,
    { merge: true }
  ).catch(err => {
    console.warn('Sync login notice:', err);
  });

  return {
    success: true,
    admin: updatedAdmin
  };
}

/**
 * Creates a new administrator account in the admin database
 */
export async function createAdminAccount(params: {
  username: string;
  email: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; message: string; admin?: AdminAccount }> {
  const accounts = getAdminAccounts();

  // Check unique username and email
  const usernameExists = accounts.some(
    a => a.username.toLowerCase() === params.username.trim().toLowerCase()
  );
  if (usernameExists) {
    return { success: false, message: `Admin username "${params.username}" is already registered.` };
  }

  const emailExists = accounts.some(
    a => a.email.toLowerCase() === params.email.trim().toLowerCase()
  );
  if (emailExists) {
    return { success: false, message: `Admin email "${params.email}" is already registered.` };
  }

  if (params.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const newAdmin: AdminAccount = {
    id: `adm-${Date.now().toString().slice(-4)}`,
    username: params.username.trim(),
    email: params.email.trim(),
    passwordHash: params.password,
    name: params.name.trim(),
    authority: 'ROLE_ADMIN',
    createdAt: new Date().toISOString().split('T')[0],
    lastLogin: 'Never',
    status: 'active',
    failedAttempts: 0
  };

  const updated = [newAdmin, ...accounts];
  saveAdminAccounts(updated);

  // Save to Cloud Firestore
  try {
    await setDoc(doc(db, 'admins', newAdmin.username), newAdmin);
  } catch (e) {
    console.error('Failed to write admin to Firestore', e);
  }

  return {
    success: true,
    message: `Admin account "${newAdmin.username}" successfully provisioned in Cloud Database.`,
    admin: newAdmin
  };
}

/**
 * Updates an admin account password
 */
export async function updateAdminPassword(
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' };
  }

  const accounts = getAdminAccounts();
  const target = accounts.find(a => a.id === adminId);
  if (!target) {
    return { success: false, message: 'Admin account not found.' };
  }

  const updated = accounts.map(a => {
    if (a.id === adminId) {
      return { ...a, passwordHash: newPassword };
    }
    return a;
  });

  saveAdminAccounts(updated);

  // Update in Cloud Firestore using setDoc with merge: true
  try {
    await setDoc(
      doc(db, 'admins', target.username),
      {
        ...target,
        passwordHash: newPassword
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Failed to update password in Firestore', e);
  }

  return { success: true, message: 'Administrator credentials updated successfully in Cloud Database.' };
}
