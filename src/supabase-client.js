// src/supabase-client.js
// Client interface for Supabase PostgreSQL database
import { createClient } from '@supabase/supabase-js';

let supabase = null;
let isConfigured = false;

export function initSupabase(config = {}) {
  const url = config.url ||
    (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) : '') || '';
  const anonKey = config.anonKey ||
    (typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) : '') || '';

  if (url && anonKey && !url.includes('your-project-id')) {
    try {
      supabase = createClient(url, anonKey);
      isConfigured = true;
      return { isConfigured: true, client: supabase };
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      isConfigured = false;
    }
  }

  isConfigured = false;
  return { isConfigured: false, client: null };
}

export function getSupabase() {
  return supabase;
}

export function isSupabaseReady() {
  return isConfigured && Boolean(supabase);
}

/**
 * Fetch published active crop listings from Supabase.
 * Respects RLS: only active listings with seller consent for public coordinates are returned.
 */
export async function fetchPlatformCropListings() {
  if (!isSupabaseReady()) {
    return {
      connected: false,
      message: 'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to load real platform listings.',
      data: []
    };
  }

  try {
    const { data, error } = await supabase
      .from('crop_listings')
      .select(`
        id,
        title,
        crop_variety,
        listing_type,
        listing_group,
        quality_grade,
        price_per_unit,
        unit,
        available_quantity,
        min_order_quantity,
        harvest_date,
        description,
        public_latitude,
        public_longitude,
        locality_name,
        created_at,
        updated_at,
        profiles:farmer_id (
          full_name,
          is_verified,
          verification_badge
        )
      `)
      .eq('status', 'active');

    if (error) throw error;

    return {
      connected: true,
      data: data || []
    };
  } catch (err) {
    console.error('Error fetching crop listings from Supabase:', err);
    return {
      connected: true,
      error: err.message,
      data: []
    };
  }
}

/**
 * Fetch machinery rentals from Supabase.
 */
export async function fetchPlatformMachineryListings() {
  if (!isSupabaseReady()) {
    return {
      connected: false,
      message: 'Supabase not configured.',
      data: []
    };
  }

  try {
    const { data, error } = await supabase
      .from('machinery_listings')
      .select('*')
      .eq('is_available', true);

    if (error) throw error;
    return { connected: true, data: data || [] };
  } catch (err) {
    return { connected: true, error: err.message, data: [] };
  }
}

/**
 * Submit an order to Supabase.
 * Strictly unpaid until payment gateway is configured later.
 */
export async function submitPlatformOrder(orderPayload) {
  if (!isSupabaseReady()) {
    // In local demo mode without database, generate pending reference
    return {
      success: true,
      isDemo: true,
      orderId: 'DEMO-' + Date.now().toString(36).toUpperCase(),
      paymentStatus: 'unpaid',
      message: 'Order created in local mode. Status: Pending / Unpaid (Payment gateway not configured).'
    };
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        total_amount_inr: orderPayload.totalAmount,
        payment_status: 'unpaid', // NEVER mark as paid without real gateway
        order_status: 'submitted',
        delivery_locality: orderPayload.deliveryLocality || 'Jaipur',
        notes: orderPayload.notes || 'Submitted via KrishiSetu buyer dashboard'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    if (orderPayload.items && orderPayload.items.length > 0) {
      const itemsToInsert = orderPayload.items.map(item => ({
        order_id: order.id,
        item_type: item.type || 'crop_listing',
        reference_id: item.id,
        title: item.title,
        unit_price_at_order: item.price,
        quantity: item.quantity,
        unit: item.unit || '₹',
        line_total_inr: item.price * item.quantity
      }));

      await supabase.from('order_items').insert(itemsToInsert);
    }

    return {
      success: true,
      orderId: order.id,
      paymentStatus: 'unpaid',
      message: 'Order placed successfully. Status: Pending / Unpaid (Payment gateway to be configured).'
    };
  } catch (err) {
    console.error('Error submitting order to Supabase:', err);
    return { success: false, error: err.message };
  }
}
