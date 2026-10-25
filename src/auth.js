// src/auth.js
// Authentication & Session Management for KrishiSetu
// Supports: Mobile OTP Login, Email/Password, Registration, Role Switching, and Supabase Auth Integration

import { getSupabase } from './supabase-client.js';

const STORAGE_KEY = 'krishisetu_auth_user';

// Standard baseline users for roles
export const DEFAULT_PROFILES = {
  farmer: {
    id: 'USR-FARM-01',
    fullName: 'Ramesh Kumar Kumawat',
    role: 'farmer',
    roleLabel: 'Farmer (किसान)',
    phone: '9829012345',
    email: 'ramesh.farmer@krishisetu.in',
    village: 'Mahapura Village, Ajmer Road',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    landHoldings: '4.5 Acres (Wheat & Mustard)',
    isVerified: true,
    verificationBadge: 'Jamabandi Verified (Khasra 319)',
    avatar: '👨‍🌾'
  },
  buyer: {
    id: 'USR-BUY-01',
    fullName: 'Priya Sharma (Jaipur Agro Mills)',
    role: 'buyer',
    roleLabel: 'Agri Buyer (खरीदार / व्यापारी)',
    phone: '9829054321',
    email: 'priya.buyer@jaipuragromills.com',
    village: 'Mansarovar / Muhana Mandi Corridor',
    district: 'Jaipur',
    state: 'Rajasthan',
    businessType: 'Grain Procurement & Flour Processing',
    isVerified: true,
    verificationBadge: 'Mandi Trader License #RJ-JPR-2024-81',
    avatar: '🛒'
  },
  machinery: {
    id: 'USR-MACH-01',
    fullName: 'Sukhdev Singh Gurjar',
    role: 'machinery',
    roleLabel: 'Machinery Owner (कृषि यंत्र स्वामी)',
    phone: '9829067890',
    email: 'sukhdev.machinery@krishisetu.in',
    village: 'Mahapura SEZ Road',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    fleet: 'John Deere 5050D, Shaktiman Rotavator',
    isVerified: true,
    verificationBadge: 'Equipment Ownership Verified',
    avatar: '🚜'
  },
  transporter: {
    id: 'USR-TRANS-01',
    fullName: 'Mohan Lal Gurjar',
    role: 'transporter',
    roleLabel: 'Transporter (वाहन चालक / परिवहन)',
    phone: '9829098765',
    email: 'mohan.logistics@krishisetu.in',
    village: 'Sanganer Commercial Hub',
    district: 'Jaipur',
    state: 'Rajasthan',
    fleet: 'Eicher Pro 2049 (2.5T), Twin-Axle Farm Trolley',
    isVerified: true,
    verificationBadge: 'Commercial Goods Permit RJ-14-GA-8921',
    avatar: '🚚'
  },
  warehouse: {
    id: 'USR-WH-01',
    fullName: 'Kailash Choudhary',
    role: 'warehouse',
    roleLabel: 'Warehouse Operator (भंडारण संचालक)',
    phone: '9829077665',
    email: 'kailash.warehouse@krishisetu.in',
    village: 'Mahapura - Bagru Corridor',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    facility: 'Mahapura Multi-Chamber Cold Store & Silo',
    isVerified: true,
    verificationBadge: 'WDRA Registered Warehouse #WDRA-RJ-412',
    avatar: '🏪'
  },
  fpo: {
    id: 'USR-FPO-01',
    fullName: 'Devendra Patel',
    role: 'fpo',
    roleLabel: 'FPO Manager (एफपीओ प्रबंधक)',
    phone: '9829033445',
    email: 'devendra.fpo@jaipurkisan.org',
    village: 'Chomu - Jaipur Rural Cluster',
    district: 'Jaipur Rural',
    state: 'Rajasthan',
    fpoName: 'Jaipur Kisan Producer Company Ltd.',
    isVerified: true,
    verificationBadge: 'SFAC Registered FPO #RJ-FPO-089',
    avatar: '🌾'
  },
  admin: {
    id: 'USR-ADM-01',
    fullName: 'Platform Operations Admin',
    role: 'admin',
    roleLabel: 'Platform Administrator (व्यवस्थापक)',
    phone: '9829099999',
    email: 'admin@krishisetu.in',
    village: 'JKLU Technology Center',
    district: 'Jaipur',
    state: 'Rajasthan',
    isVerified: true,
    verificationBadge: 'System Superuser',
    avatar: '🔒'
  }
};

let currentUser = null;
const listeners = [];
let pendingOtpData = null;

// Initialize Auth
export function initAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse saved auth session:', e);
  }

  // Check Supabase session if ready
  const supabase = getSupabase();
  if (supabase) {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !currentUser) {
          currentUser = {
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'KrishiSetu User',
            email: session.user.email || '',
            phone: session.user.phone || '',
            role: session.user.user_metadata?.role || 'farmer',
            roleLabel: 'Authenticated User',
            isVerified: Boolean(session.user.email_confirmed_at),
            verificationBadge: 'Supabase Verified Account',
            avatar: '👤'
          };
          saveUser(currentUser);
          notifyListeners();
        }
      });
    } catch (err) {
      console.warn('Supabase auth session check failed:', err);
    }
  }

  return currentUser;
}

export function getCurrentUser() {
  return currentUser;
}

export function isLoggedIn() {
  return Boolean(currentUser);
}

export function subscribeAuth(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
    callback(currentUser);
  }
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb(currentUser);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

function saveUser(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  notifyListeners();
}

/**
 * Validates standard 10-digit Indian mobile number
 */
export function isValidIndianMobile(phone) {
  const clean = String(phone).replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(clean);
}

/**
 * Step 1: Request Mobile OTP
 */
export async function requestMobileOtp(rawPhone) {
  const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
  if (!isValidIndianMobile(cleanPhone)) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
    };
  }

  // Standard demo OTP is 123456
  const otp = '123456';
  pendingOtpData = {
    phone: cleanPhone,
    otp,
    requestedAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  // If Supabase is connected with phone auth enabled
  const supabase = getSupabase();
  if (supabase?.auth) {
    try {
      await supabase.auth.signInWithOtp({ phone: `+91${cleanPhone}` });
    } catch (err) {
      console.log('Supabase SMS OTP fallback active:', err.message);
    }
  }

  return {
    success: true,
    phone: cleanPhone,
    message: `Verification code sent to +91 ${cleanPhone}. (For testing, use code: 123456)`,
    otpHint: '123456'
  };
}

/**
 * Step 2: Verify OTP and log in
 */
export async function verifyMobileOtp(rawPhone, enteredOtp, preferredRole = 'farmer') {
  const cleanPhone = String(rawPhone).replace(/\D/g, '').slice(-10);
  const cleanOtp = String(enteredOtp).trim();

  if (!cleanOtp || cleanOtp.length !== 6) {
    return {
      success: false,
      error: 'Please enter the 6-digit OTP received on your mobile.'
    };
  }

  if (cleanOtp !== '123456' && (!pendingOtpData || cleanOtp !== pendingOtpData.otp)) {
    return {
      success: false,
      error: 'Invalid OTP entered. Please use verification code 123456 or request a new code.'
    };
  }

  // Find existing profile or match role profile
  const baseProfile = DEFAULT_PROFILES[preferredRole] || DEFAULT_PROFILES.farmer;
  const user = {
    ...baseProfile,
    id: `USR-PH-${cleanPhone.slice(-4)}`,
    phone: cleanPhone,
    authMethod: 'mobile_otp',
    loggedInAt: new Date().toISOString()
  };

  saveUser(user);
  pendingOtpData = null;

  return {
    success: true,
    user,
    message: `Welcome, ${user.fullName}! Successfully authenticated via OTP.`
  };
}

/**
 * Email & Password Login
 */
export async function loginWithEmail(email, password, preferredRole = 'farmer') {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const supabase = getSupabase();
  if (supabase?.auth) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        const user = {
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email,
          phone: data.user.user_metadata?.phone || '',
          role: data.user.user_metadata?.role || preferredRole,
          roleLabel: DEFAULT_PROFILES[preferredRole]?.roleLabel || 'Registered User',
          isVerified: Boolean(data.user.email_confirmed_at),
          verificationBadge: 'Verified Supabase Account',
          avatar: DEFAULT_PROFILES[preferredRole]?.avatar || '👤',
          authMethod: 'email_password'
        };
        saveUser(user);
        return { success: true, user };
      }
    } catch (e) {
      console.warn('Supabase signInWithPassword fallback:', e.message);
    }
  }

  // Local authentication fallback
  const baseProfile = DEFAULT_PROFILES[preferredRole] || DEFAULT_PROFILES.farmer;
  const user = {
    ...baseProfile,
    email: email.trim(),
    authMethod: 'email_password',
    loggedInAt: new Date().toISOString()
  };

  saveUser(user);
  return {
    success: true,
    user,
    message: `Logged in as ${user.fullName} (${user.roleLabel})`
  };
}

/**
 * Register New User
 */
export async function registerNewUser(formData) {
  const { fullName, phone, email, role = 'farmer', village, district, documentId } = formData;

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Please enter your full name.' };
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (!isValidIndianMobile(cleanPhone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  const roleMeta = DEFAULT_PROFILES[role] || DEFAULT_PROFILES.farmer;
  const newUser = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    fullName: fullName.trim(),
    phone: cleanPhone,
    email: email ? email.trim() : `${cleanPhone}@krishisetu.in`,
    role,
    roleLabel: roleMeta.roleLabel,
    village: village ? village.trim() : 'Mahapura, Ajmer Road',
    district: district ? district.trim() : 'Jaipur Rural',
    state: 'Rajasthan',
    documentId: documentId ? documentId.trim() : null,
    isVerified: Boolean(documentId),
    verificationBadge: documentId ? `Verified Document (${documentId})` : 'New Registered Member',
    avatar: roleMeta.avatar,
    registeredAt: new Date().toISOString(),
    authMethod: 'registration'
  };

  // Attempt to save to Supabase if connected
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('profiles').insert([{
        id: newUser.id,
        full_name: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        is_verified: newUser.isVerified,
        verification_badge: newUser.verificationBadge,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.log('Supabase profile insertion note:', err.message);
    }
  }

  saveUser(newUser);
  return {
    success: true,
    user: newUser,
    message: `Account created successfully for ${newUser.fullName}!`
  };
}

/**
 * Quick Switch to standard demo role profile
 */
export function quickLoginAs(roleKey) {
  const profile = DEFAULT_PROFILES[roleKey];
  if (!profile) return null;
  const user = {
    ...profile,
    authMethod: 'quick_role_switch',
    loggedInAt: new Date().toISOString()
  };
  saveUser(user);
  return user;
}

/**
 * Log out
 */
export async function logoutUser() {
  const supabase = getSupabase();
  if (supabase?.auth) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  saveUser(null);
  return { success: true };
}
