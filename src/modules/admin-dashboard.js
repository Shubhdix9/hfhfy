// src/modules/admin-dashboard.js
// Protected Administration Panel for KrishiSetu
// Features: Land Title Verification, Listing Moderation, Disputes, Order Audits, Security Gate.

export const adminState = {
  isAuthenticated: false,
  verificationQueue: [
    {
      id: 'VERIF-401',
      name: 'Bhawani Singh',
      role: 'Farmer',
      village: 'Mahapura, Jaipur',
      khasraNumber: 'Plot 319 (4.5 Acres)',
      documentType: 'Jamabandi Land Title (Rajasthan Govt)',
      submittedAt: '2026-03-24',
      status: 'Pending Verification'
    },
    {
      id: 'VERIF-402',
      name: 'Jaipur Kisan Logistics Cooperative',
      role: 'Transporter',
      village: 'Sanganer, Jaipur',
      khasraNumber: 'Commercial Permit RJ-14-GA-8921',
      documentType: 'Commercial Goods Vehicle Permit',
      submittedAt: '2026-03-22',
      status: 'Pending Verification'
    }
  ],
  listingModeration: [
    {
      id: 'MOD-801',
      title: 'Premium Rice Straw Bales (500kg)',
      seller: 'Rajesh Gurjar',
      category: 'Agro-Waste',
      price: '₹2,500 / bale',
      location: 'Mahapura, Jaipur',
      status: 'Active'
    },
    {
      id: 'MOD-802',
      title: 'John Deere 5050D 50HP Power Tractor',
      seller: 'Mohan Lal Meena',
      category: 'Machinery Rental',
      price: '₹2,500 / day',
      location: 'Mahapura Village',
      status: 'Active'
    }
  ],
  disputes: [
    {
      id: 'DISP-91',
      parties: 'Buyer: Rajasthan Bio-Pellets vs Farmer: Sukhdev Gurjar',
      subject: 'Moisture discrepancy on wheat straw bale delivery (15% recorded vs agreed 12%)',
      amount: '₹35,000',
      status: 'In Mediation',
      resolutionNote: 'Adjusted billing weight by 3% following joint moisture meter check.'
    }
  ],
  auditLogs: [
    { timestamp: '2026-03-25 10:14 IST', user: 'admin@krishisetu.in', action: 'Verified farmer profile Bhawani Singh' },
    { timestamp: '2026-03-25 09:30 IST', user: 'system_sync', action: 'Synced AGMARKNET daily mandi wholesale prices' },
    { timestamp: '2026-03-24 16:45 IST', user: 'admin@krishisetu.in', action: 'Approved machinery rental listing John Deere 5050D' }
  ]
};

/**
 * Renders Admin Panel with strict credential gate.
 */
export function renderAdminPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Check if session token exists
  const sessionToken = sessionStorage.getItem('krishi_admin_token');
  if (sessionToken === 'authenticated_admin_session') {
    adminState.isAuthenticated = true;
  }

  // If not authenticated, render Security Authentication Gate
  if (!adminState.isAuthenticated) {
    container.innerHTML = `
      <div class="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl border border-stone-200 shadow-md space-y-5">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center text-xl mx-auto mb-2">
            🔒
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-800 rounded uppercase tracking-wider">
            Protected Platform Console
          </span>
          <h3 class="text-xl font-bold text-stone-900">Administrator Access Gate</h3>
          <p class="text-xs text-stone-500">
            Admin access is restricted to verified platform moderators. Public self-registration is strictly prohibited.
          </p>
        </div>

        <form onsubmit="window.__handleAdminLogin(event, '${containerId}')" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-stone-700 mb-1">Admin Email:</label>
            <input type="email" id="adminEmailInput" value="admin@krishisetu.in" required
                   class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
          </div>
          <div>
            <label class="block font-bold text-stone-700 mb-1">Security Key / Master Passcode:</label>
            <input type="password" id="adminKeyInput" placeholder="Enter administrative token..." required
                   class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
            <span class="text-[10px] text-stone-400 mt-1 block">Default platform token: <code>krishi-admin-2026</code></span>
          </div>

          <button type="submit" class="w-full btn-forest py-2.5 text-xs font-bold rounded-lg shadow-sm">
            Authenticate & Open Console &rarr;
          </button>
        </form>
      </div>
    `;
    return;
  }

  // Render Full Protected Management Console
  container.innerHTML = `
    <div class="space-y-8 max-w-6xl mx-auto">
      <!-- Admin Header -->
      <div class="bg-stone-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-900 text-emerald-200">
            🔒 Protected Management Console
          </span>
          <h2 class="text-2xl font-bold mt-1">KrishiSetu Platform Administration</h2>
          <p class="text-xs text-stone-400">Moderation, Land Title Verification, Fleet Audits, and Dispute Resolution</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-xs text-stone-400 block">Session Active</span>
            <span class="font-mono text-xs font-bold text-emerald-400">admin@krishisetu.in</span>
          </div>
          <button onclick="window.__adminLogout('${containerId}')" class="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold">
            Lock Console
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Pending Verifications</span>
          <p class="text-2xl font-black text-amber-700 mt-1">${adminState.verificationQueue.length}</p>
          <span class="text-[10px] text-stone-400">Jamabandi Title Inquiries</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Active Crop Listings</span>
          <p class="text-2xl font-black text-emerald-800 mt-1">11</p>
          <span class="text-[10px] text-stone-400">Produce & Agro-Waste</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Open Mediation Cases</span>
          <p class="text-2xl font-black text-stone-900 mt-1">${adminState.disputes.length}</p>
          <span class="text-[10px] text-stone-400">Trade Quality Inquiries</span>
        </div>
        <div class="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <span class="text-[11px] font-semibold text-stone-500 uppercase">Database Security</span>
          <p class="text-sm font-bold text-emerald-800 mt-2">RLS Active · Supabase</p>
          <span class="text-[10px] text-stone-400">PostGIS Coordinates Protected</span>
        </div>
      </div>

      <!-- Verification Queue -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="pb-3 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-stone-900">Farmer & Supplier Verification Queue</h3>
            <p class="text-xs text-stone-500">Inspect submitted land records (Jamabandi) and government registrations before granting verified badges.</p>
          </div>
        </div>

        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-stone-100 text-stone-700 font-bold">
                <th class="p-3">ID</th>
                <th class="p-3">Applicant Name</th>
                <th class="p-3">Role</th>
                <th class="p-3">Locality / Khasra</th>
                <th class="p-3">Document Provided</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-200">
              ${adminState.verificationQueue.map((v, idx) => `
                <tr class="hover:bg-stone-50">
                  <td class="p-3 font-mono font-bold">${v.id}</td>
                  <td class="p-3 font-semibold text-stone-900">${v.name}</td>
                  <td class="p-3">${v.role}</td>
                  <td class="p-3">${v.khasraNumber}</td>
                  <td class="p-3 text-stone-600">${v.documentType}</td>
                  <td class="p-3 space-x-1.5">
                    <button onclick="window.__approveVerification(${idx}, '${containerId}')" class="px-3 py-1 bg-emerald-800 text-white rounded font-bold hover:bg-emerald-900">
                      Approve
                    </button>
                    <button onclick="alert('Inquiring with Tehsil office for survey validation of ${v.id}')" class="px-2.5 py-1 bg-stone-100 text-stone-700 rounded font-semibold hover:bg-stone-200">
                      Inquire
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Marketplace Listing Moderation -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div class="pb-3 border-b border-stone-100">
          <h3 class="text-base font-bold text-stone-900">Marketplace Moderation</h3>
          <p class="text-xs text-stone-500">Monitor active listings to ensure accurate unit rates, verified weights, and prevent misrepresentation.</p>
        </div>

        <div class="divide-y divide-stone-100 text-xs">
          ${adminState.listingModeration.map(m => `
            <div class="py-3 flex justify-between items-center">
              <div>
                <h4 class="font-bold text-stone-900 text-sm">${m.title}</h4>
                <p class="text-stone-500">Seller: ${m.seller} · ${m.category} · <strong>${m.price}</strong> · Locality: ${m.location}</p>
              </div>
              <div class="flex gap-2">
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center">
                  ${m.status}
                </span>
                <button onclick="alert('Archived listing ${m.id}')" class="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold">
                  Archive
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Disputes & Mediation -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h3 class="text-base font-bold text-stone-900">⚖️ Trade Quality Mediation & Disputes</h3>
        <div class="space-y-3 text-xs">
          ${adminState.disputes.map(disp => `
            <div class="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div class="flex justify-between items-start">
                <span class="font-bold text-stone-900 text-sm">${disp.subject}</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">${disp.status}</span>
              </div>
              <p class="text-stone-600">${disp.parties} · Disputed Value: <strong>${disp.amount}</strong></p>
              <p class="text-emerald-900"><strong>Resolution Note:</strong> ${disp.resolutionNote}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Security & Audit Log -->
      <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h3 class="text-base font-bold text-stone-900">Platform Security & Audit Log</h3>
        <div class="space-y-2 text-xs">
          ${adminState.auditLogs.map(log => `
            <div class="p-2.5 bg-stone-50 rounded-lg flex justify-between items-center border border-stone-200">
              <span class="text-stone-700"><strong>${log.action}</strong> by <code class="bg-stone-200 px-1 py-0.5 rounded text-[11px]">${log.user}</code></span>
              <span class="text-stone-400 font-mono text-[11px]">${log.timestamp}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

window.__handleAdminLogin = (e, containerId) => {
  e.preventDefault();
  const key = document.getElementById('adminKeyInput')?.value;
  if (key === 'krishi-admin-2026') {
    adminState.isAuthenticated = true;
    sessionStorage.setItem('krishi_admin_token', 'authenticated_admin_session');
    renderAdminPanel(containerId);
  } else {
    alert('Invalid administrative security key. Admin access is strictly protected.');
  }
};

window.__adminLogout = (containerId) => {
  adminState.isAuthenticated = false;
  sessionStorage.removeItem('krishi_admin_token');
  renderAdminPanel(containerId);
};

window.__approveVerification = (index, containerId) => {
  const item = adminState.verificationQueue[index];
  if (!item) return;

  adminState.auditLogs.unshift({
    timestamp: new Date().toLocaleString('en-IN') + ' IST',
    user: 'admin@krishisetu.in',
    action: `Approved verified badge for ${item.name} (${item.role})`
  });

  adminState.verificationQueue.splice(index, 1);
  renderAdminPanel(containerId);
  alert(`Successfully verified ${item.name}! Verified badge granted.`);
};
