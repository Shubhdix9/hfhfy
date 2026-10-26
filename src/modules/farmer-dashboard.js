// src/modules/farmer-dashboard.js
// Comprehensive Farmer Panel for KrishiSetu
// Features: My Farms, Crop Cycles, Harvest-to-Marketplace Generator, Tasks, Activity Diary,
// Sales Orders, Expert Consultations, Government Schemes, Expenses.

import { calculateHaversineDistanceKm, jkluAnchorData } from '../jklu-anchor.js';

export const farmerState = {
  farms: [
    {
      id: 'farm-1',
      name: 'Mahapura Main Plot (Khasra 412)',
      acres: 6.5,
      soilType: 'Loamy Sand (Sandy Loam)',
      irrigation: 'Solar Tube Well & Drip System',
      village: 'Mahapura, Jaipur',
      coordinates: '26.8458, 75.6684'
    },
    {
      id: 'farm-2',
      name: 'Ajmer Road Belt Field (Khasra 519)',
      acres: 4.0,
      soilType: 'Clay Loam',
      irrigation: 'Tube Well (Electric)',
      village: 'Bhankrota, Jaipur',
      coordinates: '26.8650, 75.7050'
    }
  ],
  cropCycles: [
    {
      id: 'cycle-1',
      farmId: 'farm-1',
      crop: 'Wheat (Raj 4037)',
      variety: 'Raj 4037 Certified',
      season: 'Rabi 2026',
      sownDate: '2025-11-15',
      expectedHarvest: '2026-04-10',
      status: 'Ready for Harvest',
      estimatedYieldQuintals: 65,
      actualHarvestYield: null,
      isHarvested: false,
      convertedToListing: false
    },
    {
      id: 'cycle-2',
      farmId: 'farm-1',
      crop: 'Mustard (Giriraj)',
      variety: 'Giriraj High Oil Content',
      season: 'Rabi 2026',
      sownDate: '2025-10-25',
      expectedHarvest: '2026-03-20',
      status: 'Harvested & Stored in Bags',
      estimatedYieldQuintals: 30,
      actualHarvestYield: 32.5,
      isHarvested: true,
      convertedToListing: false
    }
  ],
  tasks: [
    { id: 'task-1', title: 'Schedule Combine Harvester for Wheat Plot 412', dueDate: '2026-04-05', priority: 'High', completed: false },
    { id: 'task-2', title: 'Apply terminal light irrigation before sunset', dueDate: '2026-03-28', priority: 'Medium', completed: true },
    { id: 'task-3', title: 'Collect PMFBY insurance enrollment receipt from Tehsil office', dueDate: '2026-04-02', priority: 'Low', completed: false }
  ],
  activities: [
    { id: 'act-1', date: '2026-03-22', cycle: 'Wheat (Raj 4037)', type: 'Irrigation', cost: 450, notes: 'Terminal irrigation applied through drip lines.' },
    { id: 'act-2', date: '2026-03-10', cycle: 'Mustard (Giriraj)', type: 'Harvesting', cost: 3200, notes: 'Thresher machinery operated for 4 hours.' },
    { id: 'act-3', date: '2026-02-14', cycle: 'Wheat (Raj 4037)', type: 'Weeding', cost: 1200, notes: 'Manual weeding completed by local farm helpers.' }
  ],
  salesOrders: [
    {
      id: 'ORD-7821',
      buyerName: 'Jaipur Grain Wholesalers',
      item: 'Mustard (Giriraj)',
      quantity: '20 Quintals',
      amount: 118000,
      date: '2026-03-25',
      status: 'Ready for Pickup',
      paymentStatus: 'Pending Buyer Verification'
    },
    {
      id: 'ORD-6912',
      buyerName: 'Bio-Mass Pellets India',
      item: 'Wheat Straw Residue (Bhusa)',
      quantity: '50 Bales',
      amount: 25000,
      date: '2026-03-18',
      status: 'Delivered',
      paymentStatus: 'Direct Cash Settled'
    }
  ],
  expenses: [
    { item: 'Certified Wheat Seeds (Raj 4037)', category: 'Inputs', amount: 4800, date: '2025-11-10' },
    { item: 'DAP & Bio-Fertilizer', category: 'Inputs', amount: 6200, date: '2025-11-18' },
    { item: 'Tractor Rotavator Hire (Mahindra 575)', category: 'Machinery', amount: 3600, date: '2025-11-14' },
    { item: 'Labor for Weeding & Canal Maintenance', category: 'Labor', amount: 4400, date: '2026-02-15' }
  ],
  expertCases: [
    {
      id: 'EXP-101',
      crop: 'Wheat (Raj 4037)',
      symptoms: 'Yellowing of lower leaves and slight curling observed near field margins.',
      submittedDate: '2026-03-05',
      status: 'Resolved by Agronomist',
      expertName: 'Dr. K. L. Meena (Soil & Plant Nutrition Specialist)',
      diagnosis: 'Nitrogen deficiency combined with slight moisture stress.',
      recommendation: 'Foliar spray of 2% Urea or 19:19:19 NPK during cool evening hours. Ensure soil remains moist.'
    }
  ]
};

let _onPublishCallback = null;

/**
 * Initializes and renders the Farmer Panel UI inside container.
 */
export function renderFarmerPanel(containerId, onPublishListing) {
  _onPublishCallback = onPublishListing;
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalSales = farmerState.salesOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalCost = farmerState.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netMargin = totalSales - totalCost;

  container.innerHTML = `
    <div class="space-y-8 max-w-6xl mx-auto">
      <!-- Farmer Header Banner -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
            👨‍🌾 Verified Farmer Workspace
          </span>
          <h2 class="text-2xl font-bold text-stone-900 mt-1">Kisan Farm Management & Operations</h2>
          <p class="text-xs text-stone-600">Managing 10.5 acres across Mahapura & Bhankrota belt · Sanganer Tehsil, Jaipur</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="window.__switchFarmerTab('addlisting')" class="px-4 py-2.5 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#143326] hover:to-[#22533e] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer">
            <span>➕</span> <span>List Product / Sell Produce</span>
          </button>
          <button onclick="window.__openRecordHarvestModal()" class="px-3.5 py-2.5 bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 text-xs font-semibold rounded-xl shadow-xs">
            🌾 Quick Harvest
          </button>
          <button onclick="window.__openAddActivityModal()" class="px-3.5 py-2.5 btn-earth text-xs font-semibold">
            📝 Log Activity
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Total Landholding</span>
          <p class="text-xl font-bold text-stone-900 mt-0.5">10.5 Acres</p>
          <span class="text-[10px] text-emerald-700 font-semibold">2 Active Farm Plots</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Current Season Crops</span>
          <p class="text-xl font-bold text-stone-900 mt-0.5">Wheat & Mustard</p>
          <span class="text-[10px] text-amber-700 font-semibold">Rabi 2026 Cycles</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Season Income (Sales)</span>
          <p class="text-xl font-bold text-emerald-800 mt-0.5">₹${totalSales.toLocaleString('en-IN')}</p>
          <span class="text-[10px] text-stone-500">${farmerState.salesOrders.length} Orders Fulfilled</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Total Farm Costs</span>
          <p class="text-xl font-bold text-stone-700 mt-0.5">₹${totalCost.toLocaleString('en-IN')}</p>
          <span class="text-[10px] text-emerald-700 font-semibold">Net Margin: ₹${netMargin.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Farmer Direct Payout UPI Settings (Instant Bank Settlement via UPI QR) -->
      <div class="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white p-6 rounded-2xl shadow-sm border border-emerald-700/60 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div class="space-y-1.5 max-w-xl">
          <div class="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-800/90 text-emerald-200 text-[11px] font-bold border border-emerald-600/40">
            <span>⚡ Instant Payout Settlement</span>
          </div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <span>💳</span> <span>Farmer Payout UPI Settings (किसान बैंक यूपीआई खाता)</span>
          </h3>
          <p class="text-xs text-emerald-100/90 leading-relaxed">
            Enter your UPI ID below. When buyers purchase your harvest, seeds, or truckload produce, the platform generates a dynamic scannable QR code linked directly to your UPI ID for immediate payment settlement.
          </p>
          <div id="farmerActiveUpiDisplay" class="pt-1 text-xs text-emerald-200 font-medium flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Settlement Account: <strong class="text-white font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30" id="farmerUpiBadgeText">${getActiveFarmerUpi()}</strong></span>
          </div>
        </div>

        <div class="bg-black/20 p-4 rounded-xl border border-white/15 backdrop-blur-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-stone-400 font-bold">UPI:</span>
            <input type="text"
                   id="farmerPayoutUpiInput"
                   value="${getActiveFarmerUpi()}"
                   placeholder="e.g. 9829012345@upi or name@bank"
                   class="pl-11 pr-3 py-2.5 bg-white text-stone-900 font-mono font-bold text-xs rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-60 shadow-inner">
          </div>
          <button type="button" onclick="window.__saveFarmerUpiId()"
                  class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs transition shadow-md whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer">
            <span>💾</span> <span>Save UPI</span>
          </button>
          <button type="button" onclick="window.__previewFarmerQr()"
                  class="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs transition border border-white/25 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer">
            <span>📲</span> <span>Test My QR</span>
          </button>
        </div>
      </div>

      <!-- Farmer Navigation Tabs -->
      <div class="border-b border-stone-200 flex space-x-6 text-xs font-bold text-stone-600 overflow-x-auto">
        <button onclick="window.__switchFarmerTab('addlisting')" id="tab-btn-addlisting" class="farmer-tab-btn pb-3 text-stone-900 border-b-2 border-[#1b4332] whitespace-nowrap flex items-center gap-1.5 cursor-pointer">
          <span>➕</span> <span>List Product / Produce</span>
        </button>
        <button onclick="window.__switchFarmerTab('crops')" id="tab-btn-crops" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          🌾 Crops & Harvest Cycles
        </button>
        <button onclick="window.__switchFarmerTab('farms')" id="tab-btn-farms" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          📍 My Plots
        </button>
        <button onclick="window.__switchFarmerTab('tasks')" id="tab-btn-tasks" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          📋 Tasks & Reminders
        </button>
        <button onclick="window.__switchFarmerTab('activities')" id="tab-btn-activities" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          📖 Activity Diary & Expenses
        </button>
        <button onclick="window.__switchFarmerTab('orders')" id="tab-btn-orders" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          📦 Orders (${farmerState.salesOrders.length})
        </button>
        <button onclick="window.__switchFarmerTab('consultations')" id="tab-btn-consultations" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          🧑‍🔬 Agronomist Cases
        </button>
        <button onclick="window.__switchFarmerTab('schemes')" id="tab-btn-schemes" class="farmer-tab-btn pb-3 hover:text-stone-900 whitespace-nowrap">
          🏛️ Schemes & PM-Kisan
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="farmerTabContent"></div>
    </div>
  `;

  renderAddListingPage();
}

/**
 * Tab 1: Crops, Harvest & Sell
 */
export function renderCropsAndHarvestTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-stone-900">Active Crop Cycles & Harvest Timelines</h3>
            <p class="text-xs text-stone-500">Track sown crops, estimated yields, and generate verified marketplace listings.</p>
          </div>
          <button onclick="window.__openAddCycleModal()" class="btn-earth px-3 py-1.5 text-xs font-semibold">
            + New Crop Cycle
          </button>
        </div>

        <div class="divide-y divide-stone-100">
          ${farmerState.cropCycles.map(c => `
            <div class="py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-stone-900 text-sm">${c.crop}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded ${c.isHarvested ? 'bg-stone-100 text-stone-700' : 'bg-emerald-100 text-emerald-800'}">
                    ${c.status}
                  </span>
                </div>
                <p class="text-xs text-stone-500 mt-1">
                  Season: <strong>${c.season}</strong> · Sown: ${c.sownDate} · Harvest: ${c.expectedHarvest}
                </p>
                <p class="text-xs text-stone-600 mt-0.5">
                  Estimated Yield: <strong>${c.estimatedYieldQuintals} Quintals</strong>
                  ${c.actualHarvestYield ? ` · Actual Recorded: <strong class="text-emerald-700 font-bold">${c.actualHarvestYield} Quintals</strong>` : ''}
                </p>
              </div>

              <div class="flex items-center gap-2">
                ${!c.isHarvested ? `
                  <button onclick="window.__openRecordHarvestModal('${c.id}')"
                          class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition shadow-sm">
                    🌾 Record Actual Harvest
                  </button>
                ` : !c.convertedToListing ? `
                  <button onclick="window.__generateListingFromHarvest('${c.id}')"
                          class="px-4 py-2 btn-forest text-xs font-bold transition shadow-sm">
                    🚀 Review & Publish Draft Listing &rarr;
                  </button>
                ` : `
                  <span class="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                    ✓ Listed on Live Marketplace
                  </span>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- How Generator Works Banner -->
      <div class="bg-stone-100 p-5 rounded-xl border border-stone-200 flex items-start space-x-3">
        <span class="text-2xl">📋</span>
        <div class="text-xs text-stone-700 space-y-1">
          <strong class="font-bold text-stone-900 block">Harvest-to-Marketplace Listing Protocol:</strong>
          <p>1. Record actual harvested quantity (in Quintals or Bales) once your harvest is weighed.</p>
          <p>2. KrishiSetu generates a <strong>Draft Listing</strong> automatically pre-populated with your verified plot location and harvest date.</p>
          <p>3. Review your asking price, quantity, and grade manually before clicking <strong>Publish</strong>. No listing is published without your manual review.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Tab 2: My Farms and Plots
 */
export function renderFarmsTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="space-y-4">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
          <div>
            <h3 class="text-base font-bold text-stone-900">Registered Farm Landholdings</h3>
            <p class="text-xs text-stone-500">Private coordinates protected under KrishiSetu Row Level Security (RLS).</p>
          </div>
          <button onclick="alert('Connect plot survey number (Khasra) dialog.')" class="btn-forest px-3 py-1.5 text-xs font-bold">
            + Add New Plot
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${farmerState.farms.map(f => `
            <div class="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-stone-900 text-sm">${f.name}</h4>
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">${f.acres} Acres</span>
              </div>
              <p class="text-stone-600"><strong>Soil Type:</strong> ${f.soilType}</p>
              <p class="text-stone-600"><strong>Irrigation:</strong> ${f.irrigation}</p>
              <p class="text-stone-500"><strong>Location:</strong> ${f.village} (GPS: ${f.coordinates})</p>
              <div class="pt-2 border-t border-stone-200 flex justify-between text-[11px] text-stone-500">
                <span>Status: Verified Rajasthan Jamabandi</span>
                <span class="text-emerald-800 font-semibold cursor-pointer hover:underline">Edit Details</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Tab 3: Tasks and Reminders
 */
export function renderTasksTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div class="flex justify-between items-center pb-3 border-b border-stone-100">
        <div>
          <h3 class="text-base font-bold text-stone-900">Farm Tasks & Crop Reminders</h3>
          <p class="text-xs text-stone-500">Scheduled fieldwork, fertilizer application dates, and administrative milestones.</p>
        </div>
        <button onclick="window.__openAddTaskModal()" class="btn-earth px-3 py-1.5 text-xs font-semibold">
          + Add Task
        </button>
      </div>

      <div class="space-y-2.5 text-xs">
        ${farmerState.tasks.map(t => `
          <div class="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <input type="checkbox" ${t.completed ? 'checked' : ''}
                     onchange="window.__toggleTaskComplete('${t.id}')"
                     class="w-4 h-4 text-[#1b4332] rounded border-stone-300 focus:ring-emerald-700 cursor-pointer">
              <div>
                <span class="font-bold text-stone-900 ${t.completed ? 'line-through text-stone-400' : ''}">${t.title}</span>
                <span class="text-[11px] text-stone-500 block">Due by: ${t.dueDate} · Priority: <strong class="text-stone-700">${t.priority}</strong></span>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}">
              ${t.completed ? 'DONE' : 'PENDING'}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Tab 4: Activities and Expenses
 */
export function renderActivitiesTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-stone-100">
          <h3 class="text-base font-bold text-stone-900">Farm Activity Diary</h3>
          <button onclick="window.__openAddActivityModal()" class="btn-earth px-3 py-1 text-xs font-semibold">+ Log Activity</button>
        </div>
        <div class="space-y-3">
          ${farmerState.activities.map(a => `
            <div class="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-stone-900">${a.type} · ${a.cycle}</span>
                <span class="text-stone-500 font-mono">${a.date}</span>
              </div>
              <p class="text-stone-600">${a.notes}</p>
              <span class="text-[11px] font-bold text-stone-700">Cost: ₹${a.cost}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-stone-100">
          <h3 class="text-base font-bold text-stone-900">Expense Ledger</h3>
          <span class="text-xs font-bold text-stone-700">Total: ₹${farmerState.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="divide-y divide-stone-100 text-xs">
          ${farmerState.expenses.map(e => `
            <div class="py-2.5 flex justify-between items-center">
              <div>
                <p class="font-semibold text-stone-900">${e.item}</p>
                <span class="text-[10px] text-stone-400">${e.category} · ${e.date}</span>
              </div>
              <span class="font-mono font-bold text-stone-800">₹${e.amount}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Tab 5: Sales and Orders
 */
export function renderOrdersTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div class="flex justify-between items-center pb-3 border-b border-stone-100">
        <div>
          <h3 class="text-base font-bold text-stone-900">Crop Sales & Buyer Inquiries</h3>
          <p class="text-xs text-stone-500">Manage buyer purchase orders and pickup schedules.</p>
        </div>
      </div>

      <div class="overflow-x-auto text-xs">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-stone-100 text-stone-700 font-bold">
              <th class="p-3">Order ID</th>
              <th class="p-3">Buyer</th>
              <th class="p-3">Crop Produce</th>
              <th class="p-3">Quantity</th>
              <th class="p-3">Amount</th>
              <th class="p-3">Status</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200">
            ${farmerState.salesOrders.map(o => `
              <tr class="hover:bg-stone-50">
                <td class="p-3 font-mono font-bold text-stone-800">${o.id}</td>
                <td class="p-3 font-semibold text-stone-900">${o.buyerName}</td>
                <td class="p-3">${o.item}</td>
                <td class="p-3 font-semibold">${o.quantity}</td>
                <td class="p-3 font-bold text-emerald-800">₹${o.amount.toLocaleString('en-IN')}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded font-bold text-[10px] bg-stone-100 text-stone-800">${o.status}</span></td>
                <td class="p-3">
                  <button onclick="alert('Confirming pickup schedule for ${o.id}')" class="btn-forest px-2.5 py-1 text-[11px]">
                    Manage
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Tab 6: Expert Consultations
 */
export function renderConsultationsTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div class="flex justify-between items-center pb-3 border-b border-stone-100">
        <div>
          <h3 class="text-base font-bold text-stone-900">Agronomist & Expert Consultations</h3>
          <p class="text-xs text-stone-500">Direct human agricultural expert guidance. Zero automated AI diagnosis.</p>
        </div>
        <button onclick="window.__openNewConsultationModal()" class="btn-forest px-3.5 py-2 text-xs font-bold shadow-sm">
          + Request Consultation
        </button>
      </div>

      <div class="space-y-4">
        ${farmerState.expertCases.map(c => `
          <div class="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">Case #${c.id}</span>
                <h4 class="font-bold text-stone-900 text-sm mt-1">${c.crop} Issue Report</h4>
              </div>
              <span class="text-stone-400 font-mono text-[11px]">${c.submittedDate}</span>
            </div>
            <p class="text-stone-700"><strong>Observed Symptoms:</strong> ${c.symptoms}</p>
            <div class="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
              <p class="text-stone-900 font-bold">Expert: ${c.expertName}</p>
              <p class="text-stone-700"><strong>Diagnosis:</strong> ${c.diagnosis}</p>
              <p class="text-emerald-900 font-medium"><strong>Recommended Treatment:</strong> ${c.recommendation}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Tab 7: Government Schemes
 */
export function renderSchemesTab() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  content.innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <div class="pb-3 border-b border-stone-100">
        <h3 class="text-base font-bold text-stone-900">Government Agricultural Schemes & Subsidies</h3>
        <p class="text-xs text-stone-500">Official schemes verified for Rajasthan & Jaipur district farmers.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-stone-900 text-sm mb-1">PM-Kisan Samman Nidhi</h4>
            <p class="text-stone-600 mb-2">Direct income support of ₹6,000/year to all landholding farmer families across 3 installments.</p>
          </div>
          <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-bold underline mt-2 block">
            Official PM-Kisan Portal &rarr;
          </a>
        </div>

        <div class="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-stone-900 text-sm mb-1">PM Fasal Bima Yojana (PMFBY)</h4>
            <p class="text-stone-600 mb-2">Comprehensive crop insurance against drought, unseasonal rainfall, and pests at nominal 1.5% - 2% premium.</p>
          </div>
          <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-bold underline mt-2 block">
            Official PMFBY Portal &rarr;
          </a>
        </div>

        <div class="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-stone-900 text-sm mb-1">Rajasthan Krishi Yantra Subsidy</h4>
            <p class="text-stone-600 mb-2">40% to 50% state subsidy on purchase of rotavators, seed drills, and certified farm equipment.</p>
          </div>
          <a href="https://rajkisan.rajasthan.gov.in" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-bold underline mt-2 block">
            RajKisan Portal &rarr;
          </a>
        </div>
      </div>
    </div>
  `;
}

// Global Tab Switcher
window.__switchFarmerTab = (tab) => {
  document.querySelectorAll('.farmer-tab-btn').forEach(b => {
    b.classList.remove('text-stone-900', 'border-b-2', 'border-[#1b4332]');
    b.classList.add('text-stone-600');
  });

  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-stone-600');
    activeBtn.classList.add('text-stone-900', 'border-b-2', 'border-[#1b4332]');
  }

  if (tab === 'addlisting') renderAddListingPage();
  else if (tab === 'crops') renderCropsAndHarvestTab();
  else if (tab === 'farms') renderFarmsTab();
  else if (tab === 'tasks') renderTasksTab();
  else if (tab === 'activities') renderActivitiesTab();
  else if (tab === 'orders') renderOrdersTab();
  else if (tab === 'consultations') renderConsultationsTab();
  else if (tab === 'schemes') renderSchemesTab();
};

window.__toggleTaskComplete = (taskId) => {
  const task = farmerState.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    renderTasksTab();
  }
};

// --------------------------------------------------------------------------
// MODAL CONTROLLERS & WORKFLOWS
// --------------------------------------------------------------------------

// 1. Record Harvest Yield Modal
window.__openRecordHarvestModal = (cycleId) => {
  const cycle = cycleId ? farmerState.cropCycles.find(c => c.id === cycleId) : farmerState.cropCycles[0];
  if (!cycle) return;

  const modal = document.getElementById('harvestToListingModal');
  const content = document.getElementById('harvestModalFormContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <form onsubmit="window.__submitRecordHarvest(event, '${cycle.id}')" class="space-y-4 text-xs">
      <div class="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <h5 class="font-bold text-stone-900 text-sm">${cycle.crop} (${cycle.season})</h5>
        <p class="text-stone-500">Estimated Yield: <strong>${cycle.estimatedYieldQuintals} Quintals</strong></p>
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Actual Harvested Yield (in Quintals):</label>
        <input type="number" id="actualHarvestQty" step="0.1" min="1" required value="${cycle.actualHarvestYield || cycle.estimatedYieldQuintals}"
               class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Storage Condition / Location:</label>
        <select id="harvestStorageType" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          <option value="Jute Bags on Farm">Clean Jute Bags (Farm Godown)</option>
          <option value="Air-tight Silo Storage">Air-tight Silo Storage</option>
          <option value="Cold Storage Facility">Cold Storage Facility</option>
        </select>
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Date Reaped / Threshed:</label>
        <input type="date" id="actualHarvestDate" value="${new Date().toISOString().split('T')[0]}" required
               class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('harvestToListingModal').classList.add('hidden')" class="btn-earth px-4 py-2 text-xs">
          Cancel
        </button>
        <button type="submit" class="btn-forest px-4 py-2 text-xs font-bold">
          Save Harvest Yield &rarr;
        </button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
};

window.__submitRecordHarvest = (e, cycleId) => {
  e.preventDefault();
  const cycle = farmerState.cropCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const qty = parseFloat(document.getElementById('actualHarvestQty')?.value) || cycle.estimatedYieldQuintals;
  cycle.actualHarvestYield = qty;
  cycle.isHarvested = true;
  cycle.status = 'Harvested & Stored';

  document.getElementById('harvestToListingModal').classList.add('hidden');
  renderCropsAndHarvestTab();

  // Prompt the farmer to review and generate a draft listing
  window.__generateListingFromHarvest(cycleId);
};

// 2. Draft Listing Generator Modal
window.__generateListingFromHarvest = (cycleId) => {
  const cycle = farmerState.cropCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const farm = farmerState.farms.find(f => f.id === cycle.farmId) || farmerState.farms[0];
  const modal = document.getElementById('harvestToListingModal');
  const content = document.getElementById('harvestModalFormContent');
  if (!modal || !content) return;

  const defaultPrice = cycle.crop.toLowerCase().includes('wheat') ? 2450 :
                       cycle.crop.toLowerCase().includes('mustard') ? 5600 : 1800;

  content.innerHTML = `
    <div class="space-y-4 text-xs">
      <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Draft Listing Generated</span>
        <h4 class="font-bold text-stone-900 text-sm mt-0.5">${cycle.crop} (${cycle.variety})</h4>
        <p class="text-stone-600 text-[11px] mt-0.5">Harvested Yield: <strong>${cycle.actualHarvestYield || cycle.estimatedYieldQuintals} Quintals</strong> · Plot: ${farm.name}</p>
      </div>

      <form onsubmit="window.__submitDraftListing(event, '${cycle.id}')" class="space-y-3">
        <div>
          <label class="block font-bold text-stone-700 mb-1">Listing Title:</label>
          <input type="text" id="draftListingTitle" value="Premium Certified ${cycle.crop} - Direct Farm Lot" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-stone-700 mb-1">Asking Price (₹/Quintal):</label>
            <input type="number" id="draftListingPrice" value="${defaultPrice}" required min="100"
                   class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          </div>
          <div>
            <label class="block font-bold text-stone-700 mb-1">Available Quantity (Quintals):</label>
            <input type="number" id="draftListingQty" value="${cycle.actualHarvestYield || cycle.estimatedYieldQuintals}" required min="1"
                   class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-stone-700 mb-1">Quality Grade:</label>
            <select id="draftListingGrade" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
              <option value="Grade A Premium">Grade A Premium (Clean & Moisture <12%)</option>
              <option value="Standard FAQ">Standard FAQ (Fair Average Quality)</option>
              <option value="Industrial / Feed Grade">Industrial / Feed Grade</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-stone-700 mb-1">Minimum Order Qty:</label>
            <input type="number" id="draftListingMoq" value="5" min="1"
                   class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-stone-700 mb-1">Batch Description / Quality Notes:</label>
          <textarea id="draftListingNotes" rows="2" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none"
                    placeholder="e.g., Cleaned, graded, moisture 10.8%, ready for immediate warehouse pickup."></textarea>
        </div>

        <div class="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" id="draftDiscloseConsent" checked class="w-4 h-4 text-[#1b4332] rounded">
            <span class="text-stone-700 text-[11px]">Display general locality (Mahapura) on public buyer map without disclosing exact residential door number.</span>
          </label>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <button type="button" onclick="document.getElementById('harvestToListingModal').classList.add('hidden')" class="btn-earth px-4 py-2 text-xs">
            Save as Draft
          </button>
          <button type="submit" class="btn-forest px-5 py-2 text-xs font-bold shadow-sm">
            Publish to Live Marketplace &rarr;
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.__submitDraftListing = (e, cycleId) => {
  e.preventDefault();
  const cycle = farmerState.cropCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const farm = farmerState.farms.find(f => f.id === cycle.farmId) || farmerState.farms[0];
  const title = document.getElementById('draftListingTitle')?.value || cycle.crop;
  const price = parseFloat(document.getElementById('draftListingPrice')?.value) || 2400;
  const qty = parseFloat(document.getElementById('draftListingQty')?.value) || 10;
  const grade = document.getElementById('draftListingGrade')?.value || 'Grade A';
  const moq = parseInt(document.getElementById('draftListingMoq')?.value, 10) || 1;
  const notes = document.getElementById('draftListingNotes')?.value || 'Fresh harvest.';

  const [lat, lng] = farm.coordinates.split(',').map(s => parseFloat(s.trim()));

  const newListing = {
    id: `listing-${Date.now()}`,
    title,
    group: 'produce',
    type: 'buy',
    crop: cycle.crop,
    price,
    unit: '₹/quintal',
    pricePerUnit: price,
    availableQuantity: qty,
    minOrderQuantity: moq,
    qualityGrade: grade,
    harvestDate: new Date().toISOString().split('T')[0],
    locality: farm.village,
    lat: lat || 26.8458,
    lng: lng || 75.6684,
    farmer: 'Bhawani Singh',
    isVerified: true,
    description: notes
  };

  cycle.convertedToListing = true;
  document.getElementById('harvestToListingModal').classList.add('hidden');
  renderCropsAndHarvestTab();

  if (_onPublishCallback) {
    _onPublishCallback(newListing);
  }
};

// 3. Add Crop Cycle Modal
window.__openAddCycleModal = () => {
  const modal = document.getElementById('harvestToListingModal');
  const content = document.getElementById('harvestModalFormContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <form onsubmit="window.__submitNewCycle(event)" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold text-stone-700 mb-1">Crop & Variety:</label>
        <input type="text" id="newCycleCrop" placeholder="e.g. Mustard (Giriraj) or Wheat (Raj 4037)" required
               class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-stone-700 mb-1">Plot / Field:</label>
          <select id="newCycleFarm" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
            ${farmerState.farms.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold text-stone-700 mb-1">Cropping Season:</label>
          <select id="newCycleSeason" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
            <option value="Rabi 2026">Rabi 2026</option>
            <option value="Kharif 2026">Kharif 2026</option>
            <option value="Zaid 2026">Zaid 2026</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-stone-700 mb-1">Sowing Date:</label>
          <input type="date" id="newCycleSownDate" value="${new Date().toISOString().split('T')[0]}" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
        </div>
        <div>
          <label class="block font-bold text-stone-700 mb-1">Expected Harvest Date:</label>
          <input type="date" id="newCycleHarvestDate" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
        </div>
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Estimated Target Yield (Quintals):</label>
        <input type="number" id="newCycleTargetYield" min="1" value="40" required
               class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('harvestToListingModal').classList.add('hidden')" class="btn-earth px-4 py-2 text-xs">
          Cancel
        </button>
        <button type="submit" class="btn-forest px-4 py-2 text-xs font-bold">
          Start Crop Cycle
        </button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
};

window.__submitNewCycle = (e) => {
  e.preventDefault();
  const crop = document.getElementById('newCycleCrop')?.value;
  const farmId = document.getElementById('newCycleFarm')?.value;
  const season = document.getElementById('newCycleSeason')?.value;
  const sown = document.getElementById('newCycleSownDate')?.value;
  const harvest = document.getElementById('newCycleHarvestDate')?.value;
  const target = parseFloat(document.getElementById('newCycleTargetYield')?.value) || 30;

  farmerState.cropCycles.push({
    id: `cycle-${Date.now()}`,
    farmId,
    crop,
    variety: crop,
    season,
    sownDate: sown,
    expectedHarvest: harvest,
    status: 'Growing / Vegetative',
    estimatedYieldQuintals: target,
    actualHarvestYield: null,
    isHarvested: false,
    convertedToListing: false
  });

  document.getElementById('harvestToListingModal').classList.add('hidden');
  renderCropsAndHarvestTab();
};

// 4. Log Activity Modal
window.__openAddActivityModal = () => {
  const modal = document.getElementById('harvestToListingModal');
  const content = document.getElementById('harvestModalFormContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <form onsubmit="window.__submitNewActivity(event)" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold text-stone-700 mb-1">Crop Cycle:</label>
        <select id="activityCycle" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          ${farmerState.cropCycles.map(c => `<option value="${c.crop}">${c.crop} (${c.season})</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-stone-700 mb-1">Activity Type:</label>
          <select id="activityType" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
            <option value="Irrigation">Irrigation</option>
            <option value="Fertilizer Application">Fertilizer Application</option>
            <option value="Weeding">Manual / Mechanical Weeding</option>
            <option value="Pest Scouting">Pest Scouting</option>
            <option value="Harvesting">Harvesting / Threshing</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-stone-700 mb-1">Cost Incurred (₹):</label>
          <input type="number" id="activityCost" min="0" value="0" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
        </div>
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Field Observations / Operational Notes:</label>
        <textarea id="activityNotes" rows="2" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none"
                  placeholder="e.g., Applied second nitrogen top-dressing before light canal flow."></textarea>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('harvestToListingModal').classList.add('hidden')" class="btn-earth px-4 py-2 text-xs">
          Cancel
        </button>
        <button type="submit" class="btn-forest px-4 py-2 text-xs font-bold">
          Log Entry
        </button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
};

window.__submitNewActivity = (e) => {
  e.preventDefault();
  const cycle = document.getElementById('activityCycle')?.value;
  const type = document.getElementById('activityType')?.value;
  const cost = parseFloat(document.getElementById('activityCost')?.value) || 0;
  const notes = document.getElementById('activityNotes')?.value || 'Field operation completed.';

  farmerState.activities.unshift({
    id: `act-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    cycle,
    type,
    cost,
    notes
  });

  if (cost > 0) {
    farmerState.expenses.unshift({
      item: `${type} for ${cycle}`,
      category: 'Operations',
      amount: cost,
      date: new Date().toISOString().split('T')[0]
    });
  }

  document.getElementById('harvestToListingModal').classList.add('hidden');
  renderActivitiesTab();
};

// 5. Agronomist Consultation Request Modal
window.__openNewConsultationModal = () => {
  const modal = document.getElementById('harvestToListingModal');
  const content = document.getElementById('harvestModalFormContent');
  if (!modal || !content) return;

  content.innerHTML = `
    <form onsubmit="window.__submitNewConsultation(event)" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold text-stone-700 mb-1">Affected Crop:</label>
        <select id="consultCrop" class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none">
          ${farmerState.cropCycles.map(c => `<option value="${c.crop}">${c.crop} (${c.season})</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="block font-bold text-stone-700 mb-1">Observed Symptoms / Damage:</label>
        <textarea id="consultSymptoms" rows="3" required class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white outline-none"
                  placeholder="Describe leaf discolouration, insect bites, wilting, or soil moisture behavior..."></textarea>
      </div>

      <div class="p-3 bg-stone-50 rounded-lg border border-stone-200">
        <span class="font-bold text-stone-800 block mb-0.5">Assigned Agronomist:</span>
        <p class="text-stone-600">Cases are assigned to registered Rajasthan Krishi Vigyan Kendra (KVK) and verified agronomists. No automated AI guessing.</p>
      </div>

      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('harvestToListingModal').classList.add('hidden')" class="btn-earth px-4 py-2 text-xs">
          Cancel
        </button>
        <button type="submit" class="btn-forest px-4 py-2 text-xs font-bold">
          Submit Case to Agronomist
        </button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
};

window.__submitNewConsultation = (e) => {
  e.preventDefault();
  const crop = document.getElementById('consultCrop')?.value;
  const symptoms = document.getElementById('consultSymptoms')?.value;

  farmerState.expertCases.unshift({
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    crop,
    symptoms,
    submittedDate: new Date().toISOString().split('T')[0],
    status: 'Assigned to Agronomist Dr. S. K. Sharma',
    expertName: 'Dr. S. K. Sharma (KVK Agronomy Specialist)',
    diagnosis: 'Under review by field agronomist.',
    recommendation: 'Awaiting laboratory inspection / field advisory callback.'
  });

  document.getElementById('harvestToListingModal').classList.add('hidden');
  renderConsultationsTab();
};

export function getActiveFarmerUpi() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('krishisetu_farmer_upi_id') || 'ramesh.farmer@upi';
  }
  return 'ramesh.farmer@upi';
}

window.__saveFarmerUpiId = () => {
  const input = document.getElementById('farmerPayoutUpiInput');
  const val = input ? input.value.trim() : '';
  if (!val || !val.includes('@')) {
    alert('Please enter a valid Indian UPI ID (e.g. 9829012345@upi or ramesh@okhdfcbank)');
    return;
  }
  localStorage.setItem('krishisetu_farmer_upi_id', val);
  const badge = document.getElementById('farmerUpiBadgeText');
  if (badge) badge.textContent = val;
  if (window.__showToast) {
    window.__showToast(`Payout UPI ID updated to ${val}! Buyers will scan your QR code on checkout.`, 'success');
  } else {
    alert(`Payout UPI ID successfully updated to: ${val}`);
  }
};

window.__previewFarmerQr = () => {
  const upi = getActiveFarmerUpi();
  const upiUri = `upi://pay?pa=${upi}&pn=${encodeURIComponent('Ramesh Kumar (Farmer)')}&cu=INR&tn=${encodeURIComponent('KrishiSetu Mandi Payout')}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiUri)}`;

  const modal = document.getElementById('paymentGatewayModal');
  const container = document.getElementById('paymentModalContent');
  if (modal && container) {
    container.innerHTML = `
      <div class="space-y-4 text-center">
        <div class="pb-3 border-b border-stone-200">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
            🌾 Farmer Direct QR Preview
          </span>
          <h4 class="text-base font-bold text-stone-900 mt-1">Your Direct Payout UPI QR Code</h4>
          <p class="text-xs text-stone-500">Test scan this QR code with any Indian UPI App</p>
        </div>
        <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 inline-block shadow-sm">
          <img src="${qrUrl}" alt="Farmer Payout QR Code" class="w-52 h-52 mx-auto rounded-xl">
          <p class="text-xs font-bold text-stone-800 mt-2 font-mono">${upi}</p>
          <p class="text-[10px] text-emerald-700 font-semibold mt-0.5">Payee: Ramesh Kumar (Farmer)</p>
        </div>
        <p class="text-xs text-stone-600 max-w-sm mx-auto">
          When buyers check out your harvest or produce, the platform automatically generates this dynamic QR code so payment settles directly into your UPI account.
        </p>
        <button onclick="document.getElementById('paymentGatewayModal').classList.add('hidden')"
                class="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold py-3 rounded-xl text-xs transition">
          Close Preview
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
  }
};

// --------------------------------------------------------------------------
// DEDICATED FULL-PAGE PRODUCT LISTING VIEW (NO POPUP)
// --------------------------------------------------------------------------

export const LISTING_PHOTO_PRESETS = [
  {
    name: 'Sharbati Wheat',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    group: 'produce',
    crop: 'Sharbati Wheat',
    price: 2450,
    unit: '₹/quintal'
  },
  {
    name: 'Giriraj Mustard',
    url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
    group: 'produce',
    crop: 'Giriraj Mustard',
    price: 5400,
    unit: '₹/quintal'
  },
  {
    name: 'Chana / Gram',
    url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    group: 'produce',
    crop: 'Desi Chana',
    price: 5100,
    unit: '₹/quintal'
  },
  {
    name: 'Rice Straw Bales',
    url: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80',
    group: 'agrowaste',
    crop: 'Rice Straw',
    price: 2500,
    unit: '₹/bale'
  },
  {
    name: 'Wheat Bhusa Fodder',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    group: 'agrowaste',
    crop: 'Wheat Straw',
    price: 1800,
    unit: '₹/quintal'
  },
  {
    name: 'Tractor 50HP',
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
    group: 'machinery',
    crop: 'Tractor',
    price: 2500,
    unit: '₹/day'
  },
  {
    name: 'Rotary Tiller',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    group: 'machinery',
    crop: 'Rotavator',
    price: 1200,
    unit: '₹/day'
  },
  {
    name: 'Warehouse Storage',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    group: 'storage',
    crop: 'Warehouse',
    price: 18,
    unit: '₹/bag/month'
  },
  {
    name: 'Farm Logistics Truck',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    group: 'transport',
    crop: 'Logistics',
    price: 4500,
    unit: '₹/trip'
  },
  {
    name: 'Fresh Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    group: 'produce',
    crop: 'Tomatoes',
    price: 32,
    unit: '₹/kg'
  },
  {
    name: 'Bio-Organic Inputs',
    url: 'https://images.unsplash.com/photo-1615811361543-6cf4b452a243?auto=format&fit=crop&w=600&q=80',
    group: 'seeds',
    crop: 'Bio-Fertilizer',
    price: 650,
    unit: '₹/bag'
  },
  {
    name: 'Pearl Millet (Bajra)',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    group: 'produce',
    crop: 'Bajra',
    price: 2200,
    unit: '₹/quintal'
  }
];

export const LOCATION_PRESETS = {
  mahapura: { name: 'Mahapura Village (Near JKLU Anchor)', lat: 26.8398, lng: 75.6512 },
  bhankrota: { name: 'Bhankrota Mandi Hub, Ajmer Road', lat: 26.8650, lng: 75.7050 },
  muhana: { name: 'Muhana Mandi Terminal, Jaipur', lat: 26.7980, lng: 75.7480 },
  bagru: { name: 'Bagru Farm & Industrial Zone', lat: 26.8120, lng: 75.5450 },
  chomu: { name: 'Chomu Agricultural Belt', lat: 27.1700, lng: 75.7200 },
  sanganer: { name: 'Sanganer Tehsil Yard', lat: 26.8180, lng: 75.7720 },
  bassi: { name: 'Bassi Organic Farm Zone', lat: 26.8320, lng: 76.0420 },
  kota: { name: 'Kota Hadoti Mandi', lat: 25.1800, lng: 75.8300 }
};

/**
 * Dedicated Full-Page Tab: List Produce / Sell on Marketplace
 */
export function renderAddListingPage() {
  const content = document.getElementById('farmerTabContent');
  if (!content) return;

  const currentUpi = getActiveFarmerUpi();

  content.innerHTML = `
    <div class="space-y-6">
      <!-- Top Title & Description Header -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <span>🛒 Live Marketplace Direct Listing</span>
          </div>
          <h3 class="text-xl font-bold text-stone-900 mt-1">List Produce, Crops & Machinery for Sale</h3>
          <p class="text-xs text-stone-600 mt-0.5">
            Add your agricultural harvest, seeds, agro-waste, or machinery directly to the buyer marketplace with exact farm coordinates and instant UPI payment.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Map Pinning Enabled</span>
          </span>
        </div>
      </div>

      <!-- Main Layout: Form (Left) & Real-time Live Buyer Card Preview (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Form Area (7 Cols) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          
          <!-- 1. Produce & Category Information -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
              <span>Produce & Category Information (फसल एवं श्रेणी)</span>
            </h4>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-stone-700">Product Title / Name (उत्पाद का नाम) *</label>
              <input type="text" id="newListingTitle"
                     value="Sharbati Golden Wheat (Grade A+)"
                     oninput="window.__updateListingLivePreview()"
                     placeholder="e.g. Sharbati Golden Wheat / Yellow Mustard Seeds / Rice Straw Bales"
                     class="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Marketplace Category *</label>
                <select id="newListingGroup" onchange="window.__updateListingLivePreview()"
                        class="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-stone-50">
                  <option value="produce">🌾 Food Grain & Harvest Produce</option>
                  <option value="agrowaste">🌿 Agro-Waste, Straw & Fodder (Bhusa)</option>
                  <option value="machinery">🚜 Farm Machinery & Implement Rental</option>
                  <option value="storage">🏬 Grain Storage & Warehouse Space</option>
                  <option value="transport">🚛 Farm Logistics & Tractor Transport</option>
                  <option value="seeds">🌱 Certified Seeds & Bio-Fertilizers</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Crop / Variety Name *</label>
                <input type="text" id="newListingCrop"
                       value="Sharbati Wheat"
                       oninput="window.__updateListingLivePreview()"
                       placeholder="e.g. Sharbati Wheat / Giriraj Mustard / Basmati"
                       class="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Quality Grade</label>
                <select id="newListingGrade" onchange="window.__updateListingLivePreview()"
                        class="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="Grade A+ Export Quality">Grade A+ Export Quality</option>
                  <option value="Grade 1 Mandi Clean">Grade 1 Mandi Clean</option>
                  <option value="Organic Certified NPOP">Organic Certified NPOP</option>
                  <option value="Standard Fair Average (FAQ)">Standard Fair Average (FAQ)</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Available Quantity *</label>
                <input type="number" id="newListingQuantity"
                       value="50" min="1"
                       oninput="window.__updateListingLivePreview()"
                       class="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Unit of Measure</label>
                <select id="newListingUnit" onchange="window.__updateListingLivePreview()"
                        class="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="₹/quintal">Quintals (₹/quintal)</option>
                  <option value="₹/kg">Kilograms (₹/kg)</option>
                  <option value="₹/bale">Bales (₹/bale)</option>
                  <option value="₹/day">Per Day (₹/day)</option>
                  <option value="₹/bag/month">Per Bag/Month (₹/bag/mo)</option>
                  <option value="₹/trip">Per Trip (₹/trip)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Asking Price (₹) *</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">₹</span>
                  <input type="number" id="newListingPrice"
                         value="2450" min="1"
                         oninput="window.__updateListingLivePreview()"
                         placeholder="2450"
                         class="w-full pl-7 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none">
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Minimum Order Quantity</label>
                <input type="number" id="newListingMinOrder"
                       value="5" min="1"
                       oninput="window.__updateListingLivePreview()"
                       class="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
            </div>
          </div>

          <!-- 2. Authentic Photographic Image Picker -->
          <div class="space-y-3 pt-2">
            <h4 class="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
              <span>Product Photograph (उत्पाद की तस्वीर)</span>
            </h4>
            <p class="text-[11px] text-stone-500">Pick from verified authentic agricultural photos below, or enter your own custom image URL.</p>

            <!-- Clickable Photo Presets -->
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2" id="listingPhotoPresetsContainer">
              ${LISTING_PHOTO_PRESETS.map((p, idx) => `
                <div onclick="window.__selectPhotoPreset('${p.url}', '${p.crop}', '${p.group}', ${p.price}, '${p.unit}')"
                     class="photo-preset-chip p-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:border-emerald-600 hover:bg-emerald-50/50 cursor-pointer transition text-center group ${idx === 0 ? 'ring-2 ring-emerald-600' : ''}">
                  <div class="w-full h-12 rounded-lg overflow-hidden bg-stone-200">
                    <img src="${p.url}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition">
                  </div>
                  <p class="text-[10px] font-bold text-stone-700 truncate mt-1">${p.name}</p>
                </div>
              `).join('')}
            </div>

            <div class="space-y-1.5 pt-1">
              <label class="text-xs font-bold text-stone-700">Custom Image URL</label>
              <input type="url" id="newListingImageUrl"
                     value="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"
                     oninput="window.__updateListingLivePreview()"
                     placeholder="https://... photo URL"
                     class="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-mono text-stone-700 focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>
          </div>

          <!-- 3. Precise Farm Location Option -->
          <div class="space-y-3 pt-2">
            <h4 class="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
              <span>Farm Location Option (खेत का स्थान एवं मानचित्र)</span>
            </h4>
            <p class="text-[11px] text-stone-500">
              Set your exact coordinates so buyers can locate your parcel on the interactive map, calculate live driving distance from the JKLU anchor, and arrange truck pickups.
            </p>

            <!-- Location Helper Buttons & Presets -->
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="window.__acquireLiveGpsLocation()"
                      class="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer">
                <span>📍</span> <span>Acquire My Live GPS Coordinates</span>
              </button>
              <span class="text-[11px] text-stone-400 font-bold">OR</span>
              <select id="locationPresetSelect" onchange="window.__applyLocationPreset(this.value)"
                      class="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 outline-none cursor-pointer">
                <option value="">⚡ Select Rajasthan Mandi / Hub Preset...</option>
                <option value="mahapura">Mahapura Village (Near JKLU) · 26.8398° N, 75.6512° E</option>
                <option value="bhankrota">Bhankrota Mandi Hub · 26.8650° N, 75.7050° E</option>
                <option value="muhana">Muhana Mandi Terminal · 26.7980° N, 75.7480° E</option>
                <option value="bagru">Bagru Industrial & Farm Belt · 26.8120° N, 75.5450° E</option>
                <option value="chomu">Chomu Agri Belt · 27.1700° N, 75.7200° E</option>
                <option value="sanganer">Sanganer Tehsil Yard · 26.8180° N, 75.7720° E</option>
                <option value="bassi">Bassi Organic Farm Zone · 26.8320° N, 76.0420° E</option>
                <option value="kota">Kota Hadoti Mandi · 25.1800° N, 75.8300° E</option>
              </select>
            </div>

            <div class="space-y-1.5 pt-1">
              <label class="text-xs font-bold text-stone-700">Locality & Village Name (स्थान का पता) *</label>
              <input type="text" id="newListingLocality"
                     value="Mahapura Village (Near JKLU Anchor)"
                     oninput="window.__updateListingLivePreview()"
                     placeholder="e.g. Mahapura Farm Parcel 4B, Ajmer Road, Jaipur"
                     class="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Latitude (°N)</label>
                <input type="number" step="0.0001" id="newListingLat"
                       value="26.8398"
                       oninput="window.__onCoordsChanged(); window.__updateListingLivePreview()"
                       class="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Longitude (°E)</label>
                <input type="number" step="0.0001" id="newListingLng"
                       value="75.6512"
                       oninput="window.__onCoordsChanged(); window.__updateListingLivePreview()"
                       class="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">
              </div>
            </div>

            <div id="distanceIndicatorBadge" class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span>📍</span> <span>Straight-line Distance from JKLU Anchor: <strong id="calculatedDistText">1.2 km (straight-line)</strong></span>
              </span>
              <span class="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">Within Service Radius</span>
            </div>
          </div>

          <!-- 4. Farmer Settlement UPI & Description -->
          <div class="space-y-3 pt-2">
            <h4 class="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
              <span>Settlement UPI Account & Quality Notes</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Farmer Direct Payout UPI ID *</label>
                <input type="text" id="newListingUpi"
                       value="${currentUpi}"
                       oninput="window.__updateListingLivePreview()"
                       placeholder="e.g. 9829012345@upi or ramesh@sbi"
                       class="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none">
                <span class="text-[10px] text-stone-500">Instant QR settlement will be generated for buyer payments</span>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-stone-700">Land Title / Verification</label>
                <input type="text" id="newListingJamabandi"
                       value="Khasra #412/2 Jamabandi Verified"
                       class="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 bg-stone-50 outline-none" readonly>
                <span class="text-[10px] text-emerald-700 font-bold">✓ Govt Jamabandi Record Verified</span>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-stone-700">Detailed Description & Crop Notes</label>
              <textarea id="newListingDesc" rows="3"
                        oninput="window.__updateListingLivePreview()"
                        placeholder="Describe harvest condition, moisture percentage, soil type, storage condition..."
                        class="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none">Certified clean Sharbati variety grown under drip irrigation. Strictly moisture-tested under 11.2%. Direct from farmer farm-gate at Mahapura, ready for immediate truck loading.</textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-2 flex flex-col sm:flex-row gap-3">
            <button type="button" onclick="window.__publishNewFarmerProduct()"
                    class="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#143326] hover:to-[#22533e] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer">
              <span>🚀</span> <span>Publish Listing to Buyer Marketplace</span>
            </button>
          </div>

          <!-- Success Notification Slot -->
          <div id="publishSuccessBanner" class="hidden"></div>
        </div>

        <!-- Live Buyer Card Preview (5 Cols) -->
        <div class="lg:col-span-5 space-y-4 sticky top-6">
          <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-stone-200">
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <span>👁️</span> <span>Live Buyer Card Preview</span>
              </h4>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Interactive Preview
              </span>
            </div>
            <p class="text-[11px] text-stone-500">
              This is exactly how crop buyers and grain merchants will see your listing card on the marketplace.
            </p>

            <!-- Preview Card container rendered live -->
            <div id="liveBuyerCardPreview"></div>

            <!-- Preview Info Notice -->
            <div class="bg-white p-3.5 rounded-xl border border-stone-200 text-xs space-y-2 text-stone-600">
              <div class="flex items-center gap-2 text-emerald-800 font-bold">
                <span>⚡</span> <span>What happens when published?</span>
              </div>
              <ul class="text-[11px] space-y-1 list-disc list-inside text-stone-500">
                <li>Pin drops immediately on the interactive Leaflet/Google Map</li>
                <li>Calculates road distance and drive time from JKLU anchor</li>
                <li>Generates UPI QR Code with your payout ID for instant checkout</li>
                <li>Accessible to all registered buyers, wholesale traders, and FPOs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  window.__onCoordsChanged();
  window.__updateListingLivePreview();
}

// --------------------------------------------------------------------------
// LISTING INTERACTION HANDLERS & PREVIEWS
// --------------------------------------------------------------------------

window.__selectPhotoPreset = (url, cropName, defaultGroup, price, unit) => {
  const imgInput = document.getElementById('newListingImageUrl');
  const cropInput = document.getElementById('newListingCrop');
  const titleInput = document.getElementById('newListingTitle');
  const groupSelect = document.getElementById('newListingGroup');
  const priceInput = document.getElementById('newListingPrice');
  const unitSelect = document.getElementById('newListingUnit');

  if (imgInput) imgInput.value = url;
  if (cropName && cropInput) cropInput.value = cropName;
  if (cropName && titleInput) titleInput.value = `${cropName} (Certified Quality)`;
  if (defaultGroup && groupSelect) groupSelect.value = defaultGroup;
  if (price && priceInput) priceInput.value = price;
  if (unit && unitSelect) unitSelect.value = unit;

  // Highlight selected preset chip
  document.querySelectorAll('.photo-preset-chip').forEach(el => {
    el.classList.remove('ring-2', 'ring-emerald-600');
  });
  if (event?.currentTarget) {
    event.currentTarget.classList.add('ring-2', 'ring-emerald-600');
  }

  window.__updateListingLivePreview();
};

window.__onCoordsChanged = () => {
  const lat = parseFloat(document.getElementById('newListingLat')?.value || '26.8398');
  const lng = parseFloat(document.getElementById('newListingLng')?.value || '75.6512');
  const badgeText = document.getElementById('calculatedDistText');
  if (!badgeText) return;

  if (!isNaN(lat) && !isNaN(lng)) {
    const dist = calculateHaversineDistanceKm(jkluAnchorData.latitude, jkluAnchorData.longitude, lat, lng);
    badgeText.textContent = `${dist} km (straight-line)`;
  }
};

window.__applyLocationPreset = (key) => {
  const item = LOCATION_PRESETS[key];
  if (!item) return;

  const locEl = document.getElementById('newListingLocality');
  const latEl = document.getElementById('newListingLat');
  const lngEl = document.getElementById('newListingLng');

  if (locEl) locEl.value = item.name;
  if (latEl) latEl.value = item.lat;
  if (lngEl) lngEl.value = item.lng;

  window.__onCoordsChanged();
  window.__updateListingLivePreview();
};

window.__acquireLiveGpsLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  const distText = document.getElementById('calculatedDistText');
  if (distText) distText.textContent = 'Acquiring GPS fix...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      const latEl = document.getElementById('newListingLat');
      const lngEl = document.getElementById('newListingLng');
      const locEl = document.getElementById('newListingLocality');

      if (latEl) latEl.value = lat;
      if (lngEl) lngEl.value = lng;
      if (locEl) locEl.value = `My Live GPS Farm Field (${lat}° N, ${lng}° E)`;

      window.__onCoordsChanged();
      window.__updateListingLivePreview();
      if (window.__showToast) {
        window.__showToast(`Acquired live GPS coordinates: ${lat}, ${lng}`, 'success');
      }
    },
    (err) => {
      console.warn('GPS location error:', err);
      window.__applyLocationPreset('mahapura');
      alert(`Could not acquire device GPS (${err.message}). Set to default Mahapura location.`);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

window.__updateListingLivePreview = () => {
  const container = document.getElementById('liveBuyerCardPreview');
  if (!container) return;

  const title = document.getElementById('newListingTitle')?.value.trim() || 'Product Title';
  const group = document.getElementById('newListingGroup')?.value || 'produce';
  const crop = document.getElementById('newListingCrop')?.value.trim() || 'Produce';
  const grade = document.getElementById('newListingGrade')?.value || 'Grade A+ Clean';
  const qty = document.getElementById('newListingQuantity')?.value || '50';
  const unit = document.getElementById('newListingUnit')?.value || '₹/quintal';
  const price = Number(document.getElementById('newListingPrice')?.value || 2450);
  const locality = document.getElementById('newListingLocality')?.value.trim() || 'Mahapura Village';
  const lat = parseFloat(document.getElementById('newListingLat')?.value || '26.8398');
  const lng = parseFloat(document.getElementById('newListingLng')?.value || '75.6512');
  const imgUrl = document.getElementById('newListingImageUrl')?.value.trim() || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
  const upi = document.getElementById('newListingUpi')?.value.trim() || getActiveFarmerUpi();

  const distKm = (!isNaN(lat) && !isNaN(lng))
    ? calculateHaversineDistanceKm(jkluAnchorData.latitude, jkluAnchorData.longitude, lat, lng)
    : 1.2;

  const badgeBg = group === 'agrowaste' ? 'bg-emerald-100 text-emerald-800' :
                  group === 'machinery' ? 'bg-stone-200 text-stone-800' :
                  group === 'transport' ? 'bg-stone-200 text-stone-900' :
                  group === 'storage' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900';

  container.innerHTML = `
    <div class="p-4 rounded-2xl border-2 border-[#1b4332] bg-white shadow-md space-y-3">
      <div class="flex gap-3 items-center">
        <div class="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200 bg-stone-100" style="width: 80px; height: 80px;">
          <img src="${imgUrl}" alt="${title}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=150&q=80'">
          <span class="absolute top-1 left-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded ${badgeBg} shadow-xs uppercase">
            ${group}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-stone-900 text-xs leading-snug truncate" title="${title}">${title}</h4>
            <span class="text-amber-500 text-xs">★</span>
          </div>
          <p class="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
            <span>📍 ${locality}</span>
          </p>
          <p class="text-[10px] text-emerald-800 font-bold mt-0.5">
            ${distKm} km (straight-line) from JKLU
          </p>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-semibold">${grade}</span>
            <span class="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Qty: ${qty}</span>
          </div>
        </div>
      </div>

      <div class="flex items-baseline justify-between pt-2 border-t border-stone-100">
        <div>
          <span class="text-xs text-stone-400">Price: </span>
          <span class="text-base font-extrabold text-[#1b4332]">₹${price.toLocaleString('en-IN')}</span>
          <span class="text-[11px] text-stone-500"> ${unit}</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ⚡ UPI QR Instant Settlement
          </span>
        </div>
      </div>

      <div class="pt-1 flex items-center justify-between text-[10px] text-stone-500 bg-stone-50 p-2 rounded-xl">
        <span class="flex items-center gap-1">
          <strong class="text-stone-800">Ramesh Kumawat</strong> · <span class="text-emerald-700 font-bold">Jamabandi Verified</span>
        </span>
        <span class="font-mono text-stone-600">${upi}</span>
      </div>
    </div>
  `;
};

window.__publishNewFarmerProduct = () => {
  const title = document.getElementById('newListingTitle')?.value.trim();
  const group = document.getElementById('newListingGroup')?.value || 'produce';
  const crop = document.getElementById('newListingCrop')?.value.trim() || 'Produce';
  const qualityGrade = document.getElementById('newListingGrade')?.value || 'Grade A+ Clean';
  const quantity = parseFloat(document.getElementById('newListingQuantity')?.value || '1');
  const unit = document.getElementById('newListingUnit')?.value || '₹/quintal';
  const price = parseFloat(document.getElementById('newListingPrice')?.value || '0');
  const minOrder = parseFloat(document.getElementById('newListingMinOrder')?.value || '1');
  const imageUrl = document.getElementById('newListingImageUrl')?.value.trim() || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
  const locality = document.getElementById('newListingLocality')?.value.trim() || 'Mahapura Village';
  const lat = parseFloat(document.getElementById('newListingLat')?.value || '26.8398');
  const lng = parseFloat(document.getElementById('newListingLng')?.value || '75.6512');
  const upi = document.getElementById('newListingUpi')?.value.trim() || getActiveFarmerUpi();
  const description = document.getElementById('newListingDesc')?.value.trim() || 'Verified quality farm produce directly from farmer parcel.';

  if (!title) {
    alert('Please enter a product title / name.');
    return;
  }
  if (isNaN(price) || price <= 0) {
    alert('Please enter a valid asking price.');
    return;
  }
  if (isNaN(quantity) || quantity <= 0) {
    alert('Please enter a valid available quantity.');
    return;
  }

  const distKm = calculateHaversineDistanceKm(jkluAnchorData.latitude, jkluAnchorData.longitude, lat, lng);

  const newId = 'farmer-prod-' + Date.now();
  const newListing = {
    id: newId,
    group: group,
    type: 'buy',
    title: title,
    crop: crop,
    price: price,
    pricePerUnit: price,
    unit: unit,
    availableQuantity: quantity,
    minOrderQuantity: minOrder,
    qualityGrade: qualityGrade,
    harvestDate: new Date().toISOString().split('T')[0],
    locality: locality,
    lat: lat,
    lng: lng,
    farmer: 'Ramesh Kumawat (Verified Farmer)',
    farmerUpi: upi,
    isVerified: true,
    imageUrl: imageUrl,
    description: description,
    _distanceKm: distKm
  };

  // 1. Call main.js publish callback
  if (_onPublishCallback) {
    _onPublishCallback(newListing);
  }

  // 2. Persist in localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('krishi_custom_listings') || '[]');
    existing.unshift(newListing);
    localStorage.setItem('krishi_custom_listings', JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not persist custom listing to localStorage:', e);
  }

  // 3. Render success banner
  const banner = document.getElementById('publishSuccessBanner');
  if (banner) {
    banner.classList.remove('hidden');
    banner.innerHTML = `
      <div class="p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-2 border-emerald-500 rounded-2xl text-emerald-950 space-y-3 shadow-md">
        <div class="flex items-start gap-3">
          <span class="text-2xl">🎉</span>
          <div>
            <h4 class="font-bold text-sm text-emerald-900">Successfully Published to Live Buyer Marketplace!</h4>
            <p class="text-xs text-emerald-800 mt-0.5">
              "${title}" is now active with pin coordinates [${lat}, ${lng}], at ${distKm} km from JKLU anchor. Payouts are routed to <strong>${upi}</strong>.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 pt-1">
          <button type="button" onclick="window.__viewNewlyListedProductOnBuyerMap('${newId}')"
                  class="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer">
            <span>🗺️</span> <span>View on Buyer Map & Marketplace &rarr;</span>
          </button>
          <button type="button" onclick="window.__switchFarmerTab('addlisting')"
                  class="px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-semibold rounded-xl text-xs transition cursor-pointer">
            ➕ List Another Product
          </button>
        </div>
      </div>
    `;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (window.__showToast) {
    window.__showToast(`Published "${title}" to Buyer Marketplace!`, 'success');
  }
};
