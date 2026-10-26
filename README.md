# KrishiSetu (कृषि सेतु) — Smart Agritech Platform

> **Live JKLU Jaipur Location • Google Maps Platform • Official AGMARKNET Mandi Feeds • IMD Jaipur Weather • Supabase (PostgreSQL) • Vercel**

KrishiSetu is an agritech platform designed for Indian farmers, machinery owners, and agribusinesses to connect directly without middlemen. It features a geospatial buyer workspace centered on **JK Lakshmipat University (JKLU), Mahapura, Jaipur**, flexible equipment leasing with transparent discount rules, and direct agro-waste trading to combat crop residue burning.

---

## 🚀 Key Features

* **Verified JKLU Mahapura Anchor**: Defaults directly to the verified JK Lakshmipat University campus in Mahapura, off Ajmer Road, Jaipur (`26.8378, 75.6499`). Includes 5, 10, 25, and 50 km straight-line radius filtering and a "Reset to JKLU" control.
* **Google Maps Platform Integration**: Clean 3-panel buyer workspace with real Google Maps JavaScript API, custom accessible pins, synchronized card selection, and Google Places nearby search for farm supply shops and cold storages.
* **Machinery & Equipment Rental**: Transparent rental calculation logic:
  * **Daily Rental**: Base rate
  * **Weekly Lease**: 15% discount (`dailyRate * 7 * 0.85`)
  * **Monthly Lease**: 25% discount (`dailyRate * 30 * 0.75`)
* **Agro-Waste Marketplace**: Direct trading of crop residues (Rice straw bales, wheat residue/bhusa, organic cotton stalks, sugarcane bagasse).
* **Official Government Agricultural Data**:
  * **AGMARKNET / data.gov.in**: Live daily wholesale commodity rates for Rajasthan/Jaipur mandis in true `₹/quintal` units.
  * **IMD Jaipur Met Centre**: Official station 42348 observations and regional agromet advisories.
  * **Honest Soil Status**: Explains absence of IoT sensor data without inventing fake readings.
* **Persistent Supabase Database**: Complete relational PostgreSQL schema with Row Level Security (RLS), location privacy (approximate public coordinates vs private exact farm coordinates), and immutable snapshot order line items.
* **Unpaid Checkout Safety**: Strictly maintains pending unpaid status until a real payment gateway is configured in a future release.
* **Zero AI Remnants**: Completely stripped of all AI chatbots, buttons, and suggestions as per product requirements.
* **Bilingual Support**: Dynamic toggle between English and Hindi across the entire interface.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES modules)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
* **Maps & Geolocation**: Google Maps JavaScript API, Places API, Geocoding API
* **Backend / Serverless**: Vercel Serverless Functions (`/api/*`)
* **Testing**: Automated test suite (`scripts/run-tests.mjs`)

---

## 🏁 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Run automated test suite
npm test

# 4. Start local development server (with serverless API handlers)
npm run dev

# 5. Build for production
npm run build
```

See [SETUP_GUIDE.md](file:///Users/ghost/bussniess/SETUP_GUIDE.md) for full configuration details (Google Cloud Console, Supabase migrations, data.gov.in API key, Vercel deployment).