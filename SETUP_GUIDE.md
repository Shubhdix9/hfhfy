# KrishiSetu (कृषि सेतु) — Advanced Setup & Integration Guide
**Live JKLU Jaipur Location • Google Maps • Official Agricultural Feeds • Supabase • Vercel**

---

## 1. Architecture Overview

KrishiSetu is engineered as a high-performance, modular web application deploying to **Vercel** with **Supabase (PostgreSQL)** for persistence, **Google Maps JavaScript API** for real geospatial discovery, and **Vercel Serverless Functions** for secure API integrations.

```text
├── index.html                  # Semantic 3-panel buyer workspace & marketing interface
├── vite.config.js              # Vite bundler & local dev serverless API middleware
├── package.json                # Dependencies, build & automated test scripts
├── .env.example                # Documented configuration template
├── api/                        # Vercel Serverless API endpoints (Protected backend secrets)
│   ├── public-config.js        # Returns safe client-only runtime configuration
│   ├── mandi-prices.js         # AGMARKNET daily rates proxy via data.gov.in
│   ├── weather.js              # IMD Jaipur Met Centre weather & advisories
│   └── health/data-sources.js  # Live health diagnostics for all data feeds
├── src/                        # Modular frontend architecture
│   ├── main.js                 # Core application controller
│   ├── google-maps.js          # Google Maps JS API, Places search & marker sync
│   ├── jklu-anchor.js          # Verified JKLU anchor & Haversine distance calculations
│   ├── jklu-anchor-constant.js # Single source of truth for JKLU location metadata
│   ├── supabase-client.js      # Supabase database client & order placement
│   ├── data-services.js        # Client fetchers for serverless API endpoints
│   ├── pricing.js              # Verified rental discount arithmetic (Daily, Weekly -15%, Monthly -25%)
│   ├── app-data.js             # Baseline verified agricultural items & reviews
│   └── i18n.js                 # Complete English & Hindi translations
├── supabase/migrations/
│   └── 20261025_krishisetu_core_schema.sql  # Complete schema, RLS policies & anchor seed
└── scripts/
    └── run-tests.mjs           # Automated test suite (npm test)
```

---

## 2. Verified JKLU Location Anchor

The platform default geospatial anchor is strictly anchored to the official address and verified campus coordinates:

* **Institution:** JK Lakshmipat University (JKLU)
* **Official Address:** Near Mahindra SEZ, P.O. Mahapura Ajmer Road, Jaipur – 302026, Rajasthan, India
* **Official Source:** [https://jklu.edu.in/contact-us](https://jklu.edu.in/contact-us)
* **Campus Context:** 30-acre campus in Mahapura off Ajmer Road, approximately 25 km from the heart of Jaipur
* **Verified Coordinates:** Latitude `26.8378`, Longitude `75.6499`
* **Geospatial Filtering:** Straight-line Haversine measurements with quick radius selectors (`5 km`, `10 km`, `25 km (Default)`, `50 km`) and "Reset to JKLU" button.

---

## 3. Google Maps Platform Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your Google Cloud project and enable billing.
3. Enable the following APIs in **APIs & Services > Library**:
   * **Maps JavaScript API**
   * **Places API (New)**
   * **Geocoding API**
4. Navigate to **APIs & Services > Credentials** and create an API Key:
   * **Application Restrictions:** Restrict by *HTTP Referrers (web sites)*:
     * `http://localhost:5173/*` (Local Vite development)
     * `https://*.vercel.app/*` (Vercel preview deployments)
     * `https://your-production-domain.com/*` (Custom production domain)
   * **API Restrictions:** Restrict key to *Maps JavaScript API*, *Places API*, and *Geocoding API*.
5. (Optional) In **Google Maps > Map Management**, create a Vector or Raster Map ID and copy the ID.
6. Set in your `.env` and Vercel environment variables:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key...
   VITE_GOOGLE_MAP_ID=your_map_id
   ```

*Note: If the Google Maps key is not configured or invalid, the application does NOT crash — it displays a clear setup banner and automatically provides a fully operable list-view experience.*

---

## 4. Supabase Database & RLS Setup

1. Sign in to [Supabase](https://supabase.com/) and create a new project (select AWS `ap-south-1` Mumbai region for optimal latency to Jaipur).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/20261025_krishisetu_core_schema.sql`](file:///Users/ghost/bussniess/supabase/migrations/20261025_krishisetu_core_schema.sql) and execute the SQL script. This will create:
   * 22 relational tables with appropriate data types and PostGIS/numeric coordinates.
   * Seeding of the verified JKLU anchor in `platform_settings`.
   * Row Level Security (RLS) policies enforcing:
     * Farmers only manage their own listings and plots.
     * Private exact farm plot coordinates remain hidden; only seller-approved public approximate coordinates are returned to buyers.
     * Orders are immutable snapshots from the time of checkout.
     * Unpaid order status is strictly maintained (no simulated fake payments).
4. In **Project Settings > API**, copy:
   * **Project URL** &rarr; `VITE_SUPABASE_URL`
   * **anon public key** &rarr; `VITE_SUPABASE_ANON_KEY`
5. Add these to your `.env` or Vercel Project Settings.

---

## 5. AGMARKNET / data.gov.in Mandi Integration

1. Register on [data.gov.in](https://www.data.gov.in/).
2. Navigate to the official catalog: [Current Daily Price of Various Commodities from Various Markets (Mandi)](https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi).
3. Generate your API key in **My Account > API Key**.
4. Configure the server-only secret (NEVER expose to frontend):
   ```bash
   DATA_GOV_IN_API_KEY=your_key_here
   ```
5. The serverless route [`api/mandi-prices.js`](file:///Users/ghost/bussniess/api/mandi-prices.js) proxies requests with a 1-hour in-memory cache, queries Rajasthan / Jaipur mandis, and returns min, max, and modal prices in the true unit (`₹/quintal`), with transparent equivalent `₹/kg`.

---

## 6. IMD Jaipur Met Centre Weather Integration

* **Official Portal:** [https://mausam.imd.gov.in/jaipur/](https://mausam.imd.gov.in/jaipur/)
* **Official API Reference:** [https://api.imd.gov.in/public/api_reference.html](https://api.imd.gov.in/public/api_reference.html)
* **Station ID:** Jaipur Met Centre (`42348`)
* Managed via [`api/weather.js`](file:///Users/ghost/bussniess/api/weather.js) with 30-minute caching.

---

## 7. Local Development & Automated Tests

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start local development server (includes serverless API middleware)
npm run dev

# 4. Run production build
npm run build
```

---

## 8. Deploying to Vercel

1. Push your changes to your GitHub repository.
2. In the [Vercel Dashboard](https://vercel.com/), click **Add New > Project** and import the repository.
3. Vercel automatically detects the **Vite** framework preset:
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * Serverless functions in `api/` are automatically deployed as serverless routes.
4. Under **Settings > Environment Variables**, add:
   * `VITE_GOOGLE_MAPS_API_KEY`
   * `VITE_GOOGLE_MAP_ID` (optional)
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `DATA_GOV_IN_API_KEY` (secret)
   * `IMD_API_KEY` (optional)
5. Click **Deploy**.
