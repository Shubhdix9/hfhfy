# KrishiSetu Autopilot: Engineering Changelog & Repair Audit

**Log Date**: 2026-10-25  
**Platform**: KrishiSetu (कृषि सेतु)  
**Location Anchor**: JK Lakshmipat University (JKLU), Jaipur – 302026

---

## 1. Discovered Issues & Resolved Repairs

### Issue 1: Missing Authentication & Role Login System
* **Observation**: User requested a proper login system with multiple roles and real validation.
* **Root Cause**: The platform had role dropdown selectors and role dashboards, but lacked a unified session manager, modal, OTP authentication, and profile dialog.
* **Repair Applied**:
  * Implemented [src/auth.js](file:///Users/ghost/bussniess/src/auth.js) supporting 10-digit Indian mobile OTP (+91), email/password login, farmer/trader registration with Jamabandi verification, and one-click demo role switching.
  * Added `#authModal` and `#profileModal` in [index.html](file:///Users/ghost/bussniess/index.html).
  * Wired responsive header pill and session state in [src/main.js](file:///Users/ghost/bussniess/src/main.js).
* **Verification**: Unit and script tests pass cleanly; session persists in `localStorage` and syncs with Supabase Auth.

### Issue 2: Leaflet Details Drawer Z-Index Trapping
* **Observation**: Clicking "View Details" on map cards did not show the item details drawer.
* **Root Cause**: `#itemDetailsDrawer` was configured with `z-20` inside `#mapColumn`, putting it below Leaflet's internal panes (`z-400` to `z-700`) and control pane (`z-1000`).
* **Repair Applied**: Elevated `#itemDetailsDrawer` to `style="z-index: 3000;"` with explicit `display: block` and direct `onclick="window.__selectListingCard()"` binding on map popups.
* **Verification**: Visual inspection via browser subagent confirmed the drawer slides out visibly over the map.

### Issue 3: Map Markers Appeared as "AI-Like" Purple & Orange Circle Icons
* **Observation**: User requested real Indian land and truck photos instead of generic purple/orange circle icons.
* **Root Cause**: `google-maps.js` used CSS circle markers with emoji characters and hardcoded purple (`#7c3aed`) and amber (`#d97706`) background colors.
* **Repair Applied**: Replaced with custom photographic teardrop pins enclosed in forest green frames (`#1b4332`), displaying verified Indian farmland, Indian tractors, and Indian commercial trucks with category pills.
* **Verification**: Zero purple/orange circle icons; verified via automated regex audit in `scripts/krishisetu-audit.mjs` and browser screenshot.

---

## 2. Test Execution Log

| Command | Suite / Check | Result | Exit Code |
| :--- | :--- | :---: | :---: |
| `npm run ks:audit` | Static Feature Audit & Manifest Check | ✅ PASSED | 0 |
| `npm run ks:doctor` | Platform Doctor & 11 Core Key Paths | ✅ PASSED | 0 |
| `npm test` | Mathematical & Geospatial Test Suite | ✅ PASSED (15/15) | 0 |
| `npm run build` | Vite Production Bundle Build | ✅ PASSED | 0 |
| `npm run ks:prepush` | Pre-Push Release Gate & Secret Safety | ✅ APPROVED | 0 |
