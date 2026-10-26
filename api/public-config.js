// api/public-config.js
// Vercel Serverless Function & Vite dev API handler
// Returns ONLY safe, public client configuration. NEVER expose server secrets!

import { jkluAnchorData } from '../src/jklu-anchor-constant.js';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  const googleMapId = process.env.VITE_GOOGLE_MAP_ID || process.env.GOOGLE_MAP_ID || '';
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const isGoogleMapsConfigured = Boolean(googleMapsApiKey && !googleMapsApiKey.includes('Placeholder'));
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    googleMaps: {
      apiKey: googleMapsApiKey,
      mapId: googleMapId,
      isConfigured: isGoogleMapsConfigured
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      isConfigured: isSupabaseConfigured
    },
    jkluAnchor: jkluAnchorData,
    homepageVideoUrl: process.env.VITE_HOMEPAGE_VIDEO_URL || (process.env.R2_PUBLIC_BASE_URL ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '')}/homepage-bg.mp4` : ''),
    environment: process.env.NODE_ENV || 'development',
    serverTimestamp: new Date().toISOString()
  }));
}
