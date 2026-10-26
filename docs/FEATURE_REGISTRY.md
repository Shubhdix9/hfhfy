# KrishiSetu Feature Registry & Baseline Inventory

**Location Anchor**: JK Lakshmipat University (JKLU), Near Mahindra SEZ, Mahapura, Ajmer Road, Jaipur, Rajasthan – 302026 (`26.8378° N, 75.6499° E`)  
**Design Identity**: Forest Green (`#1b4332`), Natural Green (`#2d6a4f`), Warm Cream (`#fbf8f1`), Off-White, Charcoal. **Zero Purple/Violet, Zero Neon, Zero AI Chatbots, Zero Fabricated Data.**  
**Last Comprehensive Audit**: 2026-10-25  
**Manifest Source**: [features/feature-manifest.json](file:///Users/ghost/bussniess/features/feature-manifest.json)

---

## 1. Feature Inventory Summary

| ID | Feature Name | Primary Role | Route / UI Anchor | Status | Last Verified |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `FEAT-HOME-01` | Realistic Agricultural Business Homepage | Public / All | `#homeSection` | `implemented` | 2026-10-25 |
| `FEAT-AUTH-01` | Multi-Role Authentication & Session Management | Farmer, Buyer, Provider, Admin | `#authModal` | `implemented` | 2026-10-25 |
| `FEAT-MAP-01` | JKLU-Anchored Interactive Map & Photo Pins | Buyer / Farmer | `#mapSection` | `implemented` | 2026-10-25 |
| `FEAT-ROUTING-01` | OSRM Driving Distance & Route Polyline Engine | Buyer / Transporter | `#mapSection` | `implemented` | 2026-10-25 |
| `FEAT-MARKETPLACE-01`| Direct Crop & Farm Produce Marketplace | Buyer / Farmer | `#mapSection` | `implemented` | 2026-10-25 |
| `FEAT-MACHINERY-01` | Farm Machinery & Implement Leasing Engine | Farmer / Owner | `#machinerySection` | `implemented` | 2026-10-25 |
| `FEAT-WASTE-01` | Agro-Waste Trading (Stubble Burning Prevention) | Farmer / Buyer | `#mapSection?cat=agrowaste`| `implemented` | 2026-10-25 |
| `FEAT-DETAILS-01` | Photographic Item Specifications Drawer | All Users | `#itemDetailsDrawer` | `implemented` | 2026-10-25 |
| `FEAT-FARMER-01` | Farmer Production, Harvest & Sales Ledger | Farmer | `#farmerPanelSection` | `implemented` | 2026-10-25 |
| `FEAT-ROLES-01` | Multi-Stakeholder Provider Dashboards | Transporter, Warehouse, FPO, etc.| `#roleDashboardSection`| `implemented` | 2026-10-25 |
| `FEAT-ADMIN-01` | Admin Moderation, Land Verification & Dispute Gate| Platform Admin | `#adminPanelSection` | `implemented` | 2026-10-25 |
| `FEAT-QUOTATION-01` | Formal Buyer-Farmer Quotation Negotiation | Buyer / Farmer | `#quotationModal` | `implemented` | 2026-10-25 |
| `FEAT-CART-01` | Multi-Item Procurement Cart & Booking Ledger | Buyer | `#cartModal` | `implemented` | 2026-10-25 |
| `FEAT-TRACKING-01` | Transparent Booking Reference & Order Tracker | All Users | `#trackOrderModal` | `implemented` | 2026-10-25 |
| `FEAT-PAYMENT-01` | NPCI Dynamic UPI & Direct Bank Settlement Gateway | Buyer | `#paymentGatewayModal` | `implemented` | 2026-10-25 |
| `FEAT-WEATHER-01` | IMD Weather & Jaipur Met Centre Advisories | Farmer / All | `#weatherSection` | `implemented` | 2026-10-25 |
| `FEAT-MANDI-01` | Agmarknet Daily Rajasthan Mandi Rates | Farmer / Buyer | `#mandiSection` | `implemented` | 2026-10-25 |
| `FEAT-SUPABASE-01` | Supabase PostgreSQL Backend & RLS Policies | Backend / All | Schema Migration | `implemented` | 2026-10-25 |
| `FEAT-I18N-01` | Authentic Hindi / English Agritech Localization | All Users | `#languageToggleBtn` | `implemented` | 2026-10-25 |

---

## 2. Detailed Feature Specifications

### `FEAT-AUTH-01`: Multi-Role Authentication & Session Management
* **Route / Container**: `#authModal`, `#authHeaderContainer`, `#profileModal`
* **Supported Personas**:
  * 👨‍🌾 Farmer (`farmer`) — Ramesh Kumar (Mahapura, 4.5 Acres Jamabandi verified)
  * 🛒 Buyer (`buyer`) — Priya Sharma (Jaipur Agro Mills, Mandi License verified)
  * 🚜 Machinery Owner (`machinery`) — Sukhdev Gurjar (John Deere 5050D fleet)
  * 🚚 Transporter (`transporter`) — Mohan Lal Gurjar (Eicher 2.5T, Permit RJ-14)
  * 🏪 Warehouse Operator (`warehouse`) — Kailash Choudhary (Multi-Chamber Cold Store)
  * 🌾 FPO Manager (`fpo`) — Devendra Patel (Jaipur Kisan Producer Co.)
  * 🔒 Platform Administrator (`admin`) — Operations Superuser
* **Authentication Modes**:
  1. **Mobile OTP Login**: Validates standard 10-digit Indian phone numbers (`/^[6-9]\d{9}$/`). Generates 6-digit verification code with rural demo fallback code `123456`.
  2. **Email & Password**: Direct authentication with Supabase Auth or secure local profile session.
  3. **Registration**: Collects Full Name, Mobile, Village, District, Land/Permit proof ID.
  4. **Quick Role Switcher**: One-click persona switching for field demonstrations.
* **Session Persistence**: Stored under key `krishisetu_auth_user` in `localStorage`; synchronized with Supabase Auth session if active.

### `FEAT-MAP-01`: JKLU-Anchored Interactive Map & Photographic Pins
* **Anchor**: `26.8378, 75.6499` (JK Lakshmipat University, Mahapura, Jaipur).
* **Visual Pins**: Custom photographic teardrop pins enclosed in a 3px forest green frame showing real Indian farmland, Indian tractors, and Indian commercial transport trucks. Category badge pill (`TRACTOR`, `TRUCK`, `CROP`, `EQUIP`).
* **JKLU University Pin**: Dedicated amber/gold framed teardrop marker with `🎓 JKLU` badge.
* **Radius Filtering**: Interactive buttons for 5 km, 10 km, 25 km (Default), and 50 km.

### `FEAT-DETAILS-01`: Photographic Item Specifications Drawer
* **Container**: `#itemDetailsDrawer` mounted inside the map viewport.
* **Z-Index Layer**: Strictly elevated to `z-index: 3000` to sit above all Leaflet tile panes (`z-400`), popup panes (`z-700`), and controls (`z-1000`).
* **Visual Layout**:
  * Top banner: High-resolution authentic Indian parcel/equipment photograph with verification badges.
  * Rajasthan Jamabandi land record status.
  * Live straight-line and OSRM road driving distance from JKLU.
  * Mathematically accurate rental pricing breakdown.

### `FEAT-MACHINERY-01`: Farm Machinery Rental Engine
* **Arithmetic Guarantees**:
  * Daily Rate: Base rate ($R$).
  * Weekly Rate: $7 \times R \times 0.85$ (Exact 15% discount).
  * Monthly Rate: $30 \times R \times 0.75$ (Exact 25% discount).
* **Safety**: Zero hidden charges or floating-point truncation bugs.

### `FEAT-PAYMENT-01`: Transparent UPI Settlement Gateway
* **Protocol**: Direct NPCI UPI deep-link generation (`upi://pay?pa=...&pn=KrishiSetu...`).
* **Verification**: Requires real 12-digit bank UTR numbers. Zero fake automated payment success states.

---

## 3. Verification & Governance Safeguards
1. **Automated Testing**: Executed via `npm test` (`scripts/run-tests.mjs`). All 15 test suites must pass.
2. **Pre-Push Release Gate**: Executed via `npm run ks:prepush` before any Git push.
3. **Audit Checker**: Executed via `npm run ks:audit` to detect orphaned IDs or missing code references.
4. **Environment Safety**: Secrets in `.env` are strictly excluded from VCS commits.
