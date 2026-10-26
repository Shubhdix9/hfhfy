// src/modules/farmer-dashboard.js
// Comprehensive Farmer Panel for KrishiSetu
// Features: My Farms, Crop Cycles, Harvest-to-Marketplace Generator, Tasks, Activity Diary,
// Sales Orders, Expert Consultations, Government Schemes, Expenses.

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
        <div class="flex flex-wrap gap-2">
          <button onclick="window.__openRecordHarvestModal()" class="px-4 py-2.5 btn-forest text-xs font-bold shadow-sm">
            🌾 Record Harvest & Sell
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
        <button onclick="window.__switchFarmerTab('crops')" id="tab-btn-crops" class="farmer-tab-btn pb-3 text-stone-900 border-b-2 border-[#1b4332]">
          🌾 Crops, Harvest & Sell
        </button>
        <button onclick="window.__switchFarmerTab('farms')" id="tab-btn-farms" class="farmer-tab-btn pb-3 hover:text-stone-900">
          📍 My Plots
        </button>
        <button onclick="window.__switchFarmerTab('tasks')" id="tab-btn-tasks" class="farmer-tab-btn pb-3 hover:text-stone-900">
          📋 Tasks & Reminders
        </button>
        <button onclick="window.__switchFarmerTab('activities')" id="tab-btn-activities" class="farmer-tab-btn pb-3 hover:text-stone-900">
          📖 Activity Diary & Expenses
        </button>
        <button onclick="window.__switchFarmerTab('orders')" id="tab-btn-orders" class="farmer-tab-btn pb-3 hover:text-stone-900">
          📦 Orders (${farmerState.salesOrders.length})
        </button>
        <button onclick="window.__switchFarmerTab('consultations')" id="tab-btn-consultations" class="farmer-tab-btn pb-3 hover:text-stone-900">
          🧑‍🔬 Agronomist Cases
        </button>
        <button onclick="window.__switchFarmerTab('schemes')" id="tab-btn-schemes" class="farmer-tab-btn pb-3 hover:text-stone-900">
          🏛️ Schemes & PM-Kisan
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="farmerTabContent"></div>
    </div>
  `;

  renderCropsAndHarvestTab();
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

  if (tab === 'crops') renderCropsAndHarvestTab();
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
