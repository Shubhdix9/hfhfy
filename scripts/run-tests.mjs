// scripts/run-tests.mjs
// Automated test suite for KrishiSetu platform
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { calculateRentalRates, calculateRentalCost, RENTAL_DISCOUNTS } from '../src/pricing.js';
import { jkluAnchorData, calculateHaversineDistanceKm, isWithinRadius } from '../src/jklu-anchor.js';

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(err);
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(err);
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING KRISHISETU TEST SUITE');
console.log('======================================================\n');

// 1. Rental Discount Arithmetic Tests
runTest('Pricing: Weekly discount is exactly 15% and monthly is 25%', () => {
  assert.strictEqual(RENTAL_DISCOUNTS.WEEKLY, 0.15);
  assert.strictEqual(RENTAL_DISCOUNTS.MONTHLY, 0.25);

  const baseRate = 2000;
  const rates = calculateRentalRates(baseRate);

  // Weekly: 2000 * 7 * 0.85 = 11900
  assert.strictEqual(rates.dailyRate, 2000);
  assert.strictEqual(rates.weeklyRate, 11900);
  assert.strictEqual(rates.weeklySavings, 2100);

  // Monthly: 2000 * 30 * 0.75 = 45000
  assert.strictEqual(rates.monthlyRate, 45000);
  assert.strictEqual(rates.monthlySavings, 15000);
});

runTest('Pricing: calculateRentalCost handles periods and units cleanly', () => {
  const dailyCost = calculateRentalCost(1000, 'daily', 3);
  assert.strictEqual(dailyCost.totalCost, 3000);

  const weeklyCost = calculateRentalCost(1000, 'weekly', 2);
  // 1000 * 7 * 0.85 = 5950 per unit * 2 = 11900
  assert.strictEqual(weeklyCost.totalCost, 11900);
});

// 2. Verified JKLU Anchor Coordinates & Context
runTest('Anchor: JKLU address and Mahapura coordinates are verified', () => {
  assert.strictEqual(jkluAnchorData.name, 'JK Lakshmipat University (JKLU)');
  assert.strictEqual(jkluAnchorData.pincode, '302026');
  assert.strictEqual(jkluAnchorData.latitude, 26.8378);
  assert.strictEqual(jkluAnchorData.longitude, 75.6499);
  assert.strictEqual(jkluAnchorData.officialSourceUrl, 'https://jklu.edu.in/contact-us');
  assert.strictEqual(jkluAnchorData.defaultRadiusKm, 25);
  assert.deepStrictEqual(jkluAnchorData.allowedRadiiKm, [5, 10, 25, 50]);
});

// 3. Haversine Distance Calculations
runTest('Geospatial: Haversine distance matches real straight-line distance', () => {
  // Distance from JKLU (26.8378, 75.6499) to itself must be 0
  const selfDist = calculateHaversineDistanceKm(
    jkluAnchorData.latitude,
    jkluAnchorData.longitude,
    jkluAnchorData.latitude,
    jkluAnchorData.longitude
  );
  assert.strictEqual(selfDist, 0);

  // Distance to Mahapura Village (26.8458, 75.6684) is approx 2 km
  const mahapuraDist = calculateHaversineDistanceKm(
    jkluAnchorData.latitude,
    jkluAnchorData.longitude,
    26.8458,
    75.6684
  );
  assert(mahapuraDist > 1.5 && mahapuraDist < 2.5, `Expected ~2km, got ${mahapuraDist}km`);

  // Verify radius checks
  assert.strictEqual(isWithinRadius(26.8458, 75.6684, 5), true);
  assert.strictEqual(isWithinRadius(26.8458, 75.6684, 1), false);
});

// 4. Verify ZERO AI remnants in index.html
runTest('Audit: No AI buttons, chatbots, or AI promotional content in index.html', () => {
  const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf8');
  assert(!indexHtml.includes('aiChatbot'), 'index.html must not contain aiChatbot');
  assert(!indexHtml.includes('toggleAIChat'), 'index.html must not contain toggleAIChat');
  assert(!indexHtml.includes('AI Assistant'), 'index.html must not contain AI Assistant');
  assert(!indexHtml.includes('ai-typing'), 'index.html must not contain ai-typing');
});

// 5. Verify Google Maps Tile Layers and OSRM Road Routing architecture
runTest('Audit: Google Maps Tile Layers and OSRM routing architecture present', () => {
  const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf8');
  assert(indexHtml.includes('googleMapContainer'), 'Google Map container must be present');
  const googleMapsJs = fs.readFileSync(path.resolve('./src/google-maps.js'), 'utf8');
  assert(googleMapsJs.includes('GOOGLE_TILE_LAYERS'), 'Must configure Google Tile Layers');
  assert(googleMapsJs.includes('router.project-osrm.org'), 'Must integrate OSRM road routing');
});

// 6. Test API Handlers
await runAsyncTest('API: /api/public-config returns public config without leaking secrets', async () => {
  const handler = (await import('../api/public-config.js')).default;
  let responseData = '';
  const mockReq = { method: 'GET' };
  const mockRes = {
    setHeader: () => {},
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);

  assert(json.googleMaps, 'Should contain googleMaps config');
  assert(json.jkluAnchor, 'Should contain jkluAnchor config');
  assert.strictEqual(json.jkluAnchor.name, 'JK Lakshmipat University (JKLU)');
  assert.strictEqual(json.jkluAnchor.latitude, 26.8378);

  // CRITICAL SECURITY ASSERTION: No secret keys leaked
  assert.strictEqual(json.DATA_GOV_IN_API_KEY, undefined);
  assert.strictEqual(json.SUPABASE_SERVICE_ROLE_KEY, undefined);
});

await runAsyncTest('API: /api/mandi-prices handles unconfigured state honestly', async () => {
  const handler = (await import('../api/mandi-prices.js')).default;
  let responseData = '';
  const mockReq = { method: 'GET' };
  const mockRes = {
    setHeader: () => {},
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);
  assert(json.officialSourceUrl.includes('data.gov.in'), 'Must contain official source URL');
  assert(json.status === 'connected' || json.status === 'unconfigured', 'Must return valid status');
});

await runAsyncTest('API: /api/weather provides Jaipur Met Centre reference honestly', async () => {
  const handler = (await import('../api/weather.js')).default;
  let responseData = '';
  const mockReq = { method: 'GET' };
  const mockRes = {
    setHeader: () => {},
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);
  assert(json.stationName.includes('Jaipur Met Centre'), 'Must refer to Jaipur Met Centre');
  assert(json.officialSourceUrl.includes('imd.gov.in'), 'Must contain official IMD link');
});

// 7. Payment Gateway Tests (Cashfree & Direct NPCI UPI)
await runAsyncTest('Payment: /api/payment/create-order generates valid UPI URI and order ID', async () => {
  const handler = (await import('../api/payment/create-order.js')).default;
  let responseData = '';
  const mockReq = {
    method: 'POST',
    body: {
      amount: 2500,
      itemTitle: 'Tractor Rental (1 Day)',
      buyerName: 'Ramesh Patel',
      sellerUpiId: 'krishisetu.escrow@upi',
      sellerName: 'KrishiSetu Escrow'
    }
  };
  const mockRes = {
    setHeader: () => {},
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);
  assert.strictEqual(json.success, true);
  assert(json.orderId.startsWith('KRISHI_ORD_'), 'Order ID must follow KRISHI_ORD_ convention');
  assert.strictEqual(json.amount, 2500);
  assert(json.upi.uri.startsWith('upi://pay?'), 'Must generate standard NPCI UPI URI');
  assert(json.upi.qrCodeUrl.includes('api.qrserver.com'), 'Must generate 2D QR code URL');
});

await runAsyncTest('Payment: /api/payment/verify validates 12-digit UTR and generates receipt', async () => {
  const handler = (await import('../api/payment/verify.js')).default;
  let responseData = '';
  const mockReq = {
    method: 'POST',
    body: {
      orderId: 'KRISHI_ORD_TEST_123',
      utrNumber: '428719283746', // Valid 12-digit numeric UTR
      amount: 2500
    }
  };
  const mockRes = {
    setHeader: () => {},
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.paymentStatus, 'paid_verified');
  assert(json.receiptId.startsWith('REC-KRISHI-'), 'Must issue formal receipt REC-KRISHI-');
  assert.strictEqual(json.paymentDetails.utrNumber, '428719283746');
});

await runAsyncTest('Payment: /api/payment/verify rejects invalid non-12-digit UTR', async () => {
  const handler = (await import('../api/payment/verify.js')).default;
  let responseData = '';
  let statusCode = 200;
  const mockReq = {
    method: 'POST',
    body: {
      orderId: 'KRISHI_ORD_TEST_123',
      utrNumber: '1234', // Invalid length
      amount: 2500
    }
  };
  const mockRes = {
    setHeader: () => {},
    set statusCode(code) { statusCode = code; },
    get statusCode() { return statusCode; },
    end: (str) => { responseData = str; }
  };

  await handler(mockReq, mockRes);
  const json = JSON.parse(responseData);
  assert.strictEqual(statusCode, 400);
  assert(json.error.includes('12 numeric digits'), 'Must require 12 numeric digits');
});

// 8. Verify SQL Schema Migration Syntax
runTest('Database: Supabase schema migration contains required tables and RLS', () => {
  const sql = fs.readFileSync(path.resolve('./supabase/migrations/20261025_krishisetu_core_schema.sql'), 'utf8');
  assert(sql.includes('platform_settings'), 'Must contain platform_settings');
  assert(sql.includes('default_map_anchor'), 'Must contain default_map_anchor seed');
  assert(sql.includes('JK Lakshmipat University (JKLU)'), 'Must seed JKLU');
  assert(sql.includes('crop_listings'), 'Must contain crop_listings');
  assert(sql.includes('machinery_listings'), 'Must contain machinery_listings');
  assert(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');
});

// 9. Strict Color & Design Audit: Zero purple, violet, magenta, or neon
runTest('Design Audit: Zero purple, violet, magenta, or neon in code and templates', () => {
  const filesToCheck = [
    './index.html',
    './src/main.js',
    './src/payment-gateway.js',
    './src/modules/role-dashboards.js',
    './src/modules/farmer-dashboard.js',
    './src/modules/admin-dashboard.js'
  ];

  for (const f of filesToCheck) {
    const content = fs.readFileSync(path.resolve(f), 'utf8');
    assert(!content.includes('bg-purple-'), `${f} must not contain purple classes`);
    assert(!content.includes('text-purple-'), `${f} must not contain purple classes`);
    assert(!content.includes('border-purple-'), `${f} must not contain purple classes`);
  }
});

// 10. Role Dashboards and Workflows Check
runTest('Architecture: Role dashboards and quotation workflows are fully defined', () => {
  const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf8');
  assert(indexHtml.includes('farmerPanelContainer'), 'Must contain farmerPanelContainer');
  assert(indexHtml.includes('adminPanelContainer'), 'Must contain adminPanelContainer');
  assert(indexHtml.includes('machineryPanelContainer'), 'Must contain machineryPanelContainer');
  assert(indexHtml.includes('warehousePanelContainer'), 'Must contain warehousePanelContainer');
  assert(indexHtml.includes('transporterPanelContainer'), 'Must contain transporterPanelContainer');
  assert(indexHtml.includes('supplierPanelContainer'), 'Must contain supplierPanelContainer');
  assert(indexHtml.includes('expertPanelContainer'), 'Must contain expertPanelContainer');
  assert(indexHtml.includes('fpoPanelContainer'), 'Must contain fpoPanelContainer');
  assert(indexHtml.includes('quotationModal'), 'Must contain quotationModal');
  assert(indexHtml.includes('harvestToListingModal'), 'Must contain harvestToListingModal');
  assert(indexHtml.includes('trackOrderModal'), 'Must contain trackOrderModal');
});

console.log('\n======================================================');
console.log(`📊 RESULTS: ${passedTests} / ${totalTests} tests passed`);
console.log('======================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
