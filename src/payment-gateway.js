// src/payment-gateway.js
// Interactive Cashfree & Direct NPCI UPI Payment Modal & Verification Module
// Pattern matches the student/landlord payment gateway architecture

let activePaymentOrder = null;
let countdownTimer = null;

/**
 * Initiates the payment workflow for a given order amount.
 */
export async function openPaymentGatewayModal({
  amount,
  itemTitle = 'Agricultural Order',
  buyerName = 'Farmer / Buyer',
  sellerUpiId = 'krishisetu.escrow@upi',
  sellerName = 'KrishiSetu Escrow',
  onSuccess,
  onFailure
}) {
  const modal = document.getElementById('paymentGatewayModal');
  const container = document.getElementById('paymentModalContent');
  if (!modal || !container) return;

  // Show Loading state
  container.innerHTML = `
    <div class="py-12 text-center text-gray-500">
      <div class="animate-spin text-3xl mb-3">⏳</div>
      <p class="text-sm font-semibold text-gray-800">Generating Secure UPI / Cashfree Order...</p>
      <p class="text-xs text-gray-500 mt-1">Connecting to banking network</p>
    </div>
  `;
  modal.classList.remove('hidden');

  try {
    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        itemTitle,
        buyerName,
        sellerUpiId,
        sellerName
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to create payment order (HTTP ${res.status})`);
    }

    const orderData = await res.json();
    activePaymentOrder = orderData;

    renderPaymentCheckoutUI(orderData, onSuccess, onFailure);

  } catch (err) {
    console.error('Payment order creation error:', err);
    container.innerHTML = `
      <div class="p-6 text-center text-red-600">
        <div class="text-3xl mb-2">⚠️</div>
        <h4 class="font-bold text-sm mb-1">Failed to Initialize Gateway</h4>
        <p class="text-xs text-gray-600 mb-4">${err.message}</p>
        <button onclick="document.getElementById('paymentGatewayModal').classList.add('hidden')"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-semibold text-gray-800">
          Close
        </button>
      </div>
    `;
    if (onFailure) onFailure(err);
  }
}

/**
 * Renders the interactive QR and UPI app checkout UI.
 */
function renderPaymentCheckoutUI(orderData, onSuccess, onFailure) {
  const container = document.getElementById('paymentModalContent');
  if (!container) return;

  const { orderId, amount, upi, gateway } = orderData;

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Order Header -->
      <div class="flex justify-between items-start pb-3 border-b">
        <div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase ${gateway === 'cashfree' ? 'bg-stone-100 text-stone-800' : 'bg-emerald-100 text-emerald-800'}">
            ${gateway === 'cashfree' ? 'Cashfree PG Gateway' : 'Direct NPCI UPI Gateway'}
          </span>
          <h4 class="text-base font-bold text-gray-900 mt-1">Order #${orderId.slice(-8)}</h4>
          <p class="text-[11px] text-gray-600 mt-0.5">🌾 Farmer / Payee: <strong class="text-stone-900">${upi.payeeName}</strong></p>
          <p class="text-[11px] text-emerald-800 font-medium mt-0.5">Direct Settlement: <code class="bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">${upi.payeeVpa}</code></p>
        </div>
        <div class="text-right">
          <span class="text-xs text-gray-500 block">Total Payable</span>
          <span class="text-xl font-extrabold text-green-700">₹${Number(amount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Expiry Countdown Timer -->
      <div class="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
        <span class="text-amber-800 font-semibold flex items-center gap-1.5">
          ⏱️ Order Expires In:
        </span>
        <span id="paymentTimerDisplay" class="font-mono font-bold text-amber-900 text-sm">10:00</span>
      </div>

      <!-- Scannable 2D QR Code -->
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
        <div class="inline-block p-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <img src="${upi.qrCodeUrl}" alt="Scan to pay via any UPI App" class="w-48 h-48 mx-auto rounded-lg">
        </div>
        <p class="text-xs font-bold text-gray-800 mt-2">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
        <p class="text-[11px] text-gray-600 mt-0.5">Payment transfers directly to Farmer: <code class="bg-gray-200 px-1.5 py-0.5 rounded font-mono font-bold text-gray-800">${upi.payeeVpa}</code></p>
      </div>

      <!-- Mobile 1-Click UPI Deep Links -->
      <div class="space-y-1.5">
        <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Or Pay Directly from Mobile Apps:</p>
        <div class="grid grid-cols-3 gap-2">
          <a href="${upi.gpayUri}" class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-lg text-center text-xs font-bold text-stone-800 block transition">
            Google Pay
          </a>
          <a href="${upi.phonepeUri}" class="p-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-center text-xs font-bold text-stone-900 block transition">
            PhonePe
          </a>
          <a href="${upi.paytmUri}" class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-lg text-center text-xs font-bold text-stone-800 block transition">
            Paytm
          </a>
        </div>
      </div>

      <!-- 12-Digit Bank UTR Confirmation Input -->
      <div class="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
        <label class="block text-xs font-bold text-gray-700">
          Enter 12-Digit Bank Ref / UTR Number:
        </label>
        <input type="text"
               id="paymentUtrInput"
               maxlength="12"
               placeholder="e.g. 428719283746"
               class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center focus:bg-white focus:ring-2 focus:ring-green-500 outline-none">
        <p class="text-[10px] text-gray-500">
          After completing payment in your UPI app, enter the 12-digit UTR found in the payment receipt details.
        </p>
      </div>

      <!-- Confirm Button -->
      <button id="confirmPaymentBtn"
              class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm">
        ✅ Verify & Confirm Payment
      </button>
    </div>
  `;

  // Start 10-Minute Countdown Timer
  startPaymentTimer(10 * 60);

  // Wire up verification button
  const confirmBtn = document.getElementById('confirmPaymentBtn');
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      const utrInput = document.getElementById('paymentUtrInput');
      const utr = utrInput ? utrInput.value.trim() : '';

      if (!utr || utr.length !== 12 || isNaN(utr)) {
        alert('Please enter a valid 12-digit numeric bank UTR / Reference number from your UPI app.');
        return;
      }

      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Verifying with bank...';

      try {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            utrNumber: utr,
            amount: orderData.amount
          })
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          clearInterval(countdownTimer);
          renderPaymentSuccessReceipt(verifyData);
          if (onSuccess) onSuccess(verifyData);
        } else {
          alert(verifyData.error || 'Payment verification failed.');
          confirmBtn.disabled = false;
          confirmBtn.textContent = '✅ Verify & Confirm Payment';
        }
      } catch (err) {
        alert('Verification error: ' + err.message);
        confirmBtn.disabled = false;
        confirmBtn.textContent = '✅ Verify & Confirm Payment';
      }
    };
  }
}

function startPaymentTimer(totalSeconds) {
  if (countdownTimer) clearInterval(countdownTimer);
  let remaining = totalSeconds;

  const display = document.getElementById('paymentTimerDisplay');
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      if (display) display.textContent = 'EXPIRED';
      alert('Payment session expired. Please regenerate your payment order.');
      document.getElementById('paymentGatewayModal')?.classList.add('hidden');
      return;
    }

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    if (display) {
      display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function renderPaymentSuccessReceipt(verifyData) {
  const container = document.getElementById('paymentModalContent');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-4 space-y-4">
      <div class="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
        ✓
      </div>
      <div>
        <h4 class="text-xl font-bold text-gray-900">Payment Verified & Settled!</h4>
        <p class="text-xs text-gray-500 mt-1">Official Digital Tax Receipt Generated</p>
      </div>

      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left text-xs space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-500">Receipt ID:</span>
          <span class="font-mono font-bold text-gray-900">${verifyData.receiptId}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Order Reference:</span>
          <span class="font-mono text-gray-700">${verifyData.orderId}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Bank UTR Number:</span>
          <span class="font-mono font-bold text-green-800">${verifyData.paymentDetails?.utrNumber || 'N/A'}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Settlement Status:</span>
          <span class="px-2 py-0.5 bg-green-100 text-green-800 font-bold rounded text-[10px]">VERIFIED PAID</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Timestamp:</span>
          <span class="text-gray-600">${new Date(verifyData.verifiedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
        </div>
      </div>

      <button onclick="document.getElementById('paymentGatewayModal').classList.add('hidden'); window.__navigateToSection('map')"
              class="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-xs transition">
        Done & Return to Marketplace
      </button>
    </div>
  `;
}
