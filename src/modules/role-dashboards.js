// src/modules/role-dashboards.js
// Dedicated dashboards for Input Suppliers, Machinery Owners, Warehouses, Transporters, Experts, and FPO Managers.

export const providerData = {
  machineryFleet: [
    { id: 'M-1', model: 'John Deere 5050D (50 HP Power Reverser)', dailyRate: 2500, status: 'Available', bookingsCount: 14, locality: 'Mahapura Village', fuelType: 'Diesel', condition: 'Excellent' },
    { id: 'M-2', model: 'Mahindra 575 DI Heavy-Duty Tractor', dailyRate: 2000, status: 'On Active Lease', bookingsCount: 22, locality: 'Bhankrota Belt', fuelType: 'Diesel', condition: 'Good' },
    { id: 'M-3', model: 'Shaktiman 8.5ft Rotary Tiller (Rotavator)', dailyRate: 1200, status: 'Available', bookingsCount: 31, locality: 'Mahapura SEZ Road', fuelType: 'PTO Driven', condition: 'Recently Serviced' }
  ],
  machineryDamageReports: [
    { id: 'DAM-101', machineryId: 'M-2', date: '2026-03-12', renter: 'Ramesh Kumawat', issue: 'Minor hydraulic hose wear during 14-day field tillage. Replaced and settled under standard maintenance deposit.', cost: 850, status: 'Resolved' }
  ],
  warehouseFacilities: [
    { id: 'WH-1', name: 'Mahapura Agri Cold Storage Unit', totalCapacity: 1500, occupied: 1100, ratePerTonne: 450, locality: 'Mahapura Ajmer Road', type: 'Multi-Chamber Cold Store (-2°C to 10°C)' },
    { id: 'WH-2', name: 'Bagru Rural Grain Warehouse', totalCapacity: 3000, occupied: 1850, ratePerTonne: 280, locality: 'RIICO Industrial Area, Bagru', type: 'Dry Aerated Grain Silo' }
  ],
  warehouseDispatches: [
    { id: 'DIS-201', warehouse: 'WH-2', commodity: 'Wheat (Raj 4037)', quantity: '40 MT', destination: 'Jaipur Roller Flour Mill', dispatchDate: '2026-03-24', status: 'Dispatched via Transporter TR-1' },
    { id: 'DIS-202', warehouse: 'WH-1', commodity: 'Mustard Seed Lots', quantity: '15 MT', destination: 'Alwar Oil Extraction Plant', dispatchDate: '2026-03-20', status: 'Delivered' }
  ],
  transportVehicles: [
    { id: 'TR-1', vehicle: 'Eicher Pro 2049 (Commercial Mini Truck)', capacity: '2.5 Tonnes', ratePerKm: 35, baseFare: 800, status: 'Available for Hire', driver: 'Mohan Gurjar', route: 'Mahapura ⇄ Sanganer Mandi ⇄ Bagru', imageUrl: '/images/indian-agri-truck.jpg' },
    { id: 'TR-2', vehicle: 'Heavy Farm Tractor Trolley (Twin Axle)', capacity: '5.0 Tonnes', ratePerKm: 45, baseFare: 1200, status: 'Scheduled for Tomorrow', driver: 'Sukhdev Singh', route: 'Ajmer Road Belt Farms ⇄ Warehouses', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80' }
  ],
  transportDeliveries: [
    { id: 'DEL-301', bookingRef: 'ORD-7821', from: 'Mahapura Plot 412', to: 'Jaipur Wholesale Yard', distanceKm: 24, status: 'Delivery Confirmed (POD Signed)', date: '2026-03-22' }
  ],
  inputCatalog: [
    { id: 'IN-1', product: 'Certified Wheat Seeds (Raj 4037)', stockKg: 4500, pricePerKg: 38, brand: 'Rajasthan State Seed Corp', license: 'RAJ-SEED-2024-912' },
    { id: 'IN-2', product: 'Organic Bio-NPK Granules (50kg)', stockKg: 2800, pricePerKg: 24, brand: 'KRIBHCO Organic', license: 'FCO-FERT-RAJ-441' },
    { id: 'IN-3', product: 'Drip Lateral Pipes 16mm (500m Roll)', stockUnits: 45, pricePerUnit: 2400, brand: 'Jain Irrigation Systems', license: 'BIS-CM/L-6182' }
  ],
  inputOrders: [
    { id: 'INP-ORD-51', buyer: 'Mahapura Farmers Group (8 Farmers)', item: 'Certified Wheat Seeds', quantity: '800 kg', total: 30400, status: 'Ready for Collection' },
    { id: 'INP-ORD-52', buyer: 'Bhankrota Cooperative', item: 'Bio-NPK Granules', quantity: '1,200 kg', total: 28800, status: 'Fulfilled' }
  ],
  expertCases: [
    { id: 'CASE-701', farmerName: 'Bhawani Singh (Mahapura)', crop: 'Wheat (Raj 4037)', symptoms: 'Yellowing of lower leaf margins during earhead formation', appointmentDate: '2026-03-27 10:00 AM', status: 'Case Active', notes: 'Soil test indicates mild zinc and nitrogen deficiency. Recommended ZnSO4 0.5% spray.' },
    { id: 'CASE-702', farmerName: 'Ramprasad Meena (Bhankrota)', crop: 'Mustard', symptoms: 'Aphid infestation near flower clusters', appointmentDate: '2026-03-18', status: 'Resolved', notes: 'Advised biological control (Neem oil 1500 ppm). Pest population dropped below ETL threshold.' }
  ],
  fpoSummary: {
    fpoName: 'Jaipur Kisan Producer Company Ltd.',
    registeredMembers: 148,
    activeAggregation: 'Wheat (Raj 4037) - 350 Metric Tonnes Pooled',
    collectiveProcurement: 'Fertilizer Bulk Order (Saving 18% on MRP)',
    district: 'Jaipur Rural',
    boardDirectors: 5,
    paidUpCapital: '₹12,50,000'
  }
};

/**
 * 1. Renders Machinery Owner Dashboard
 */
export function renderMachineryOwnerPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-stone-100 text-stone-800">
            🚜 Machinery & Equipment Owner Fleet
          </span>
          <h3 class="text-xl font-bold text-stone-900 mt-1">Equipment Listings & Rental Bookings</h3>
          <p class="text-xs text-stone-500">Manage daily, weekly (15% off), and monthly (25% off) agricultural machinery leases.</p>
        </div>
        <button onclick="alert('Register new tractor or farm implement with engine details and lease rates.')" class="btn-forest px-4 py-2 text-xs">
          + Add New Machinery
        </button>
      </div>

      <!-- Fleet Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${providerData.machineryFleet.map(m => `
          <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2.5 text-xs shadow-sm">
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-stone-900 text-sm">${m.model}</h4>
              <span class="px-2 py-0.5 rounded font-bold text-[10px] ${m.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${m.status}
              </span>
            </div>
            <p class="text-stone-600">Base Daily Rate: <strong class="text-emerald-800 font-bold">₹${m.dailyRate}/day</strong></p>
            <p class="text-stone-500">Weekly (-15%): <strong>₹${Math.round(m.dailyRate * 7 * 0.85)}</strong> · Monthly (-25%): <strong>₹${Math.round(m.dailyRate * 30 * 0.75)}</strong></p>
            <div class="text-[11px] text-stone-500 pt-1 border-t space-y-0.5">
              <p>Locality: <strong>${m.locality}</strong></p>
              <p>Completed Bookings: <strong>${m.bookingsCount}</strong> · Condition: <strong>${m.condition}</strong></p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Damage Reports & Maintenance Log -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="font-bold text-stone-900 text-sm">🛠️ Maintenance & Incident Damage Log</h4>
        <div class="divide-y divide-stone-100 text-xs">
          ${providerData.machineryDamageReports.map(d => `
            <div class="py-2.5 flex justify-between items-start">
              <div>
                <span class="font-bold text-stone-900">Report #${d.id} · Machine: ${d.machineryId}</span>
                <p class="text-stone-600 mt-0.5">${d.issue}</p>
                <span class="text-[10px] text-stone-400">Renter: ${d.renter} · Date: ${d.date}</span>
              </div>
              <span class="px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded text-[10px]">${d.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. Renders Warehouse / Cold Storage Operator Dashboard
 */
export function renderWarehousePanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
            🏪 Warehouse & Cold Storage Operator
          </span>
          <h3 class="text-xl font-bold text-stone-900 mt-1">Storage Capacity & Space Allocation</h3>
          <p class="text-xs text-stone-500">Live storage occupancy, booking requests, and dispatch manifests.</p>
        </div>
        <button onclick="alert('Update storage capacity or add chamber')" class="btn-forest px-4 py-2 text-xs">
          Update Capacity
        </button>
      </div>

      <div class="space-y-4">
        ${providerData.warehouseFacilities.map(w => {
          const percent = Math.round((w.occupied / w.totalCapacity) * 100);
          return `
            <div class="bg-white p-5 rounded-xl border border-stone-200 text-xs space-y-3 shadow-sm">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-stone-900 text-sm">${w.name}</h4>
                  <p class="text-stone-500">📍 ${w.locality} · Rate: <strong>₹${w.ratePerTonne}/tonne/month</strong></p>
                  <span class="text-[10px] text-stone-400">${w.type}</span>
                </div>
                <span class="text-stone-900 font-bold text-sm">${w.occupied} / ${w.totalCapacity} MT</span>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-stone-500 mb-1">
                  <span>Occupancy: <strong>${percent}%</strong></span>
                  <span>Available Capacity: <strong>${w.totalCapacity - w.occupied} Metric Tonnes</strong></span>
                </div>
                <div class="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-[#1b4332] h-2.5 rounded-full" style="width: ${percent}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Dispatch & Manifests -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="font-bold text-stone-900 text-sm">📋 Dispatch Records & Outward Gate Passes</h4>
        <div class="divide-y divide-stone-100 text-xs">
          ${providerData.warehouseDispatches.map(dis => `
            <div class="py-2.5 flex justify-between items-center">
              <div>
                <span class="font-bold text-stone-900">${dis.commodity} (${dis.quantity})</span>
                <p class="text-stone-500">Destination: ${dis.destination} · Date: ${dis.dispatchDate}</p>
              </div>
              <span class="px-2 py-0.5 bg-stone-100 text-stone-700 font-semibold rounded text-[11px]">${dis.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. Renders Transporter / Logistics Dashboard
 */
export function renderTransporterPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-stone-100 text-stone-900">
            🚚 Agricultural Logistics & Transport
          </span>
          <h3 class="text-xl font-bold text-stone-900 mt-1">Vehicle Fleet & Transport Quotations</h3>
          <p class="text-xs text-stone-500">Connect with farmers needing farm-to-mandi and warehouse hauling.</p>
        </div>
        <button onclick="alert('Register new transport vehicle with commercial goods permit')" class="btn-forest px-4 py-2 text-xs">
          + Add Vehicle
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${providerData.transportVehicles.map(v => `
          <div class="bg-white rounded-xl border border-stone-200 text-xs overflow-hidden shadow-sm flex flex-col">
            ${v.imageUrl ? `
              <div class="relative h-44 w-full bg-stone-100 overflow-hidden">
                <img src="${v.imageUrl}" alt="${v.vehicle}" class="w-full h-full object-cover">
                <span class="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#1b4332]/90 text-white backdrop-blur-sm rounded font-bold text-[10px] shadow">
                  ${v.status}
                </span>
                <span class="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/60 text-white backdrop-blur-sm rounded font-semibold text-[10px]">
                  📷 Real Verified Vehicle
                </span>
              </div>
            ` : ''}
            <div class="p-4 space-y-2 flex-1">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-stone-900 text-sm">${v.vehicle}</h4>
                ${!v.imageUrl ? `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">${v.status}</span>` : ''}
              </div>
              <p class="text-stone-600">Payload Capacity: <strong>${v.capacity}</strong> · Driver: <strong>${v.driver}</strong></p>
              <p class="text-stone-600">Rate: <strong>₹${v.ratePerKm}/km</strong> (Base Fare: ₹${v.baseFare})</p>
              <p class="text-stone-500 text-[11px]">Primary Corridor: ${v.route}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Deliveries Log -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="font-bold text-stone-900 text-sm">📦 Delivery Confirmations (Proof of Delivery)</h4>
        <div class="divide-y divide-stone-100 text-xs">
          ${providerData.transportDeliveries.map(del => `
            <div class="py-2.5 flex justify-between items-center">
              <div>
                <span class="font-bold text-stone-900">${del.from} &rarr; ${del.to} (${del.distanceKm} km)</span>
                <p class="text-stone-500">Order Ref: ${del.bookingRef} · ${del.date}</p>
              </div>
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">${del.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. Renders Input Supplier Dashboard
 */
export function renderInputSupplierPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
            📦 Agricultural Input Supplier Workspace
          </span>
          <h3 class="text-xl font-bold text-stone-900 mt-1">Product Catalog, Seed Stock & Farm Orders</h3>
          <p class="text-xs text-stone-500">Certified seeds, bio-fertilizers, and micro-irrigation hardware.</p>
        </div>
        <button onclick="alert('Add new certified seed or fertilizer lot with batch license')" class="btn-forest px-4 py-2 text-xs">
          + Add Product Catalog Item
        </button>
      </div>

      <!-- Catalog Table -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="font-bold text-stone-900 text-sm">🌾 Live Inventory & Verified Product Catalog</h4>
        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-stone-100 text-stone-700 font-bold">
                <th class="p-3">Product Name</th>
                <th class="p-3">Manufacturer / Brand</th>
                <th class="p-3">Government License</th>
                <th class="p-3">Available Stock</th>
                <th class="p-3">Unit Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200">
              ${providerData.inputCatalog.map(item => `
                <tr class="hover:bg-stone-50">
                  <td class="p-3 font-bold text-stone-900">${item.product}</td>
                  <td class="p-3 text-stone-600">${item.brand}</td>
                  <td class="p-3 font-mono text-[11px] text-stone-500">${item.license}</td>
                  <td class="p-3 font-semibold">${item.stockKg ? `${item.stockKg} kg` : `${item.stockUnits} units`}</td>
                  <td class="p-3 font-bold text-emerald-800">₹${item.pricePerKg ? `${item.pricePerKg}/kg` : `${item.pricePerUnit}/unit`}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Orders Received -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h4 class="font-bold text-stone-900 text-sm">🛒 Bulk Group Orders from Farmers & Cooperatives</h4>
        <div class="divide-y divide-stone-100 text-xs">
          ${providerData.inputOrders.map(ord => `
            <div class="py-2.5 flex justify-between items-center">
              <div>
                <span class="font-bold text-stone-900">${ord.buyer}</span>
                <p class="text-stone-500">${ord.item} · ${ord.quantity}</p>
              </div>
              <div class="text-right">
                <span class="font-bold text-emerald-800 block">₹${ord.total.toLocaleString('en-IN')}</span>
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">${ord.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 5. Renders Agricultural Expert / Agronomist Dashboard
 */
export function renderExpertPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
            🧑‍🔬 Certified Agricultural Agronomist
          </span>
          <h3 class="text-xl font-bold text-stone-900 mt-1">Farmer Consultation Cases & Field Prescriptions</h3>
          <p class="text-xs text-stone-500">Provide direct human agronomic advice. Zero automated AI diagnosis.</p>
        </div>
        <button onclick="alert('Log new field visit note')" class="btn-forest px-4 py-2 text-xs">
          + New Advisory Note
        </button>
      </div>

      <div class="space-y-4">
        ${providerData.expertCases.map(c => `
          <div class="bg-white p-5 rounded-xl border border-stone-200 text-xs space-y-2 shadow-sm">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-800 rounded uppercase font-mono">#${c.id}</span>
                <h4 class="font-bold text-stone-900 text-sm mt-1">${c.farmerName} · Crop: ${c.crop}</h4>
              </div>
              <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">${c.status}</span>
            </div>
            <p class="text-stone-700"><strong>Symptoms Logged:</strong> ${c.symptoms}</p>
            <div class="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span class="font-bold text-stone-900 block mb-0.5">Agronomist Recommendation / Prescription:</span>
              <p class="text-stone-700">${c.notes}</p>
            </div>
            <div class="text-[11px] text-stone-400">Scheduled Appointment: ${c.appointmentDate}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 6. Renders FPO Manager Dashboard
 */
export function renderFpoPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fpo = providerData.fpoSummary;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800">
          🌾 Farmer Producer Organisation (FPO) Workspace
        </span>
        <h3 class="text-xl font-bold text-stone-900 mt-1">${fpo.fpoName}</h3>
        <p class="text-xs text-stone-500">${fpo.registeredMembers} Small & Marginal Farmer Members · ${fpo.district} · Paid-Up Capital: ${fpo.paidUpCapital}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2.5 shadow-sm">
          <h4 class="font-bold text-stone-900 text-sm">🌾 Crop Lot Aggregation for Bulk Buyer Bidding</h4>
          <p class="text-stone-700 font-semibold">${fpo.activeAggregation}</p>
          <p class="text-[11px] text-stone-500 leading-relaxed">Pooled from 42 member farmers in Mahapura and Sanganer. Better price realization through collective commercial bargaining.</p>
          <button onclick="alert('Viewing member allocations for pooled wheat lot (350 MT)')" class="btn-forest px-3 py-1.5 text-xs">
            View Member Allocations
          </button>
        </div>

        <div class="bg-white p-5 rounded-xl border border-stone-200 space-y-2.5 shadow-sm">
          <h4 class="font-bold text-stone-900 text-sm">🛒 Collective Procurement Pool</h4>
          <p class="text-stone-700 font-semibold">${fpo.collectiveProcurement}</p>
          <p class="text-[11px] text-stone-500 leading-relaxed">Members save significantly on wholesale certified seeds, neem-coated urea, and micro-irrigation supplies.</p>
          <button onclick="alert('Initiating new group purchase order for Kharif 2026')" class="btn-earth px-3 py-1.5 text-xs">
            New Group Purchase Order
          </button>
        </div>
      </div>
    </div>
  `;
}
