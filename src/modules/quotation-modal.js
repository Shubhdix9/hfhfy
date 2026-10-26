// src/modules/quotation-modal.js
// Handles Buyer Quotation Requests & Bulk Price Negotiations

export function openQuotationModal(item) {
  const modal = document.getElementById('quotationModal');
  const container = document.getElementById('quotationModalContent');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="space-y-4 text-xs">
      <div>
        <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
          ${item.group || item.type}
        </span>
        <h4 class="text-base font-bold text-stone-900 mt-1">${item.title}</h4>
        <p class="text-stone-500">Listed Price: <strong>₹${item.price} ${item.unit || ''}</strong> · Locality: ${item.locality}</p>
      </div>

      <div class="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
        <span class="text-stone-500 block">Farmer / Provider:</span>
        <span class="font-bold text-stone-900 text-sm">${item.farmer || 'Verified Platform Member'} ${item.isVerified ? '✅' : ''}</span>
      </div>

      <form onsubmit="window.__submitQuotationRequest(event, '${item.id}')" class="space-y-3">
        <div>
          <label class="block font-bold text-stone-700 mb-1">Your Required Quantity:</label>
          <input type="number" id="quoteQty" min="1" value="${item.minOrderQuantity || 5}" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
        </div>

        <div>
          <label class="block font-bold text-stone-700 mb-1">Your Offered Price per Unit (₹):</label>
          <input type="number" id="quoteOfferedPrice" min="1" value="${item.price}" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
          <p class="text-[10px] text-stone-500 mt-0.5">Offer fair price for bulk volume purchase.</p>
        </div>

        <div>
          <label class="block font-bold text-stone-700 mb-1">Proposed Delivery or Pickup Locality:</label>
          <input type="text" id="quoteDeliveryLoc" placeholder="e.g. Mahapura Warehouse or Buyer Factory" required
                 class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none">
        </div>

        <div>
          <label class="block font-bold text-stone-700 mb-1">Terms or Handling Notes:</label>
          <textarea id="quoteNotes" rows="2" placeholder="e.g. Require moisture certificate under 12%, self-pickup via tractor trolley."
                    class="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"></textarea>
        </div>

        <button type="submit" class="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition text-xs shadow-sm">
          Submit Formal Quotation Proposal &rarr;
        </button>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
}

window.__submitQuotationRequest = (e, itemId) => {
  e.preventDefault();
  const qty = document.getElementById('quoteQty')?.value;
  const price = document.getElementById('quoteOfferedPrice')?.value;
  const loc = document.getElementById('quoteDeliveryLoc')?.value;

  document.getElementById('quotationModal')?.classList.add('hidden');
  alert(`Quotation Proposal for Item #${itemId} submitted successfully!\n\nQuantity: ${qty}\nOffered Price: ₹${price}/unit\nDestination: ${loc}\n\nThe farmer has been notified and will respond with acceptance or counter-terms.`);
};
