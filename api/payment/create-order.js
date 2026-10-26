// api/payment/create-order.js
// Vercel Serverless Function & Vite dev API handler
// Implements Cashfree & Direct NPCI UPI Order Generation for KrishiSetu

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    let body = {};
    if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      // Buffer / Stream read if body parser didn't run
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      body = raw ? JSON.parse(raw) : {};
    }

    const {
      amount,
      buyerName = 'Farmer / Buyer',
      buyerPhone = '9876543210',
      buyerEmail = 'buyer@krishisetu.in',
      itemTitle = 'KrishiSetu Order',
      sellerUpiId = 'krishisetu.escrow@upi',
      sellerName = 'KrishiSetu Escrow'
    } = body;

    if (!amount || amount <= 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Valid amount is required' }));
      return;
    }

    const timestamp = Date.now();
    const orderId = `KRISHI_ORD_${timestamp}_${Math.floor(Math.random() * 1000)}`;

    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecret = process.env.CASHFREE_SECRET_KEY;
    const cashfreeEnv = process.env.CASHFREE_ENVIRONMENT || 'TEST'; // TEST or PROD

    let paymentSessionId = null;
    let paymentGatewayUsed = 'direct_npci_upi';

    // 1. If Cashfree credentials configured, attempt real order creation via Cashfree API
    if (cashfreeAppId && cashfreeSecret && cashfreeAppId !== 'your_cashfree_app_id') {
      try {
        const cashfreeBaseUrl = cashfreeEnv === 'PROD'
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders';

        const cfResponse = await fetch(cashfreeBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': cashfreeAppId,
            'x-client-secret': cashfreeSecret,
            'x-api-version': '2023-08-01'
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: Number(amount),
            order_currency: 'INR',
            customer_details: {
              customer_id: `CUST_${buyerPhone.replace(/\D/g, '') || timestamp}`,
              customer_name: buyerName,
              customer_email: buyerEmail,
              customer_phone: buyerPhone.replace(/\D/g, '').slice(-10) || '9876543210'
            },
            order_meta: {
              return_url: `https://krishisetu.in/order-status?order_id=${orderId}`,
              notify_url: `https://krishisetu.in/api/payment/webhook`
            },
            order_note: `KrishiSetu: ${itemTitle}`
          })
        });

        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          paymentSessionId = cfData.payment_session_id;
          paymentGatewayUsed = 'cashfree';
        }
      } catch (cfErr) {
        console.warn('Cashfree API error, falling back to Direct NPCI UPI:', cfErr.message);
      }
    }

    // 2. Direct NPCI UPI Intent & QR Generation (Standard Indian Banking Specification)
    const encodedSellerName = encodeURIComponent(sellerName);
    const encodedNote = encodeURIComponent(`KrishiSetu:${orderId.slice(-8)}`);
    const upiUri = `upi://pay?pa=${sellerUpiId}&pn=${encodedSellerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodedNote}`;

    // Universal UPI deep links for mobile 1-click payment
    const gpayUri = `gpay://upi/pay?pa=${sellerUpiId}&pn=${encodedSellerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodedNote}`;
    const phonepeUri = `phonepe://upi/pay?pa=${sellerUpiId}&pn=${encodedSellerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodedNote}`;
    const paytmUri = `paytmmp://upi/pay?pa=${sellerUpiId}&pn=${encodedSellerName}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodedNote}`;

    // Dynamic QR code API URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiUri)}`;

    const orderExpiryMinutes = 10;
    const expiresAt = new Date(timestamp + orderExpiryMinutes * 60 * 1000).toISOString();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      orderId,
      amount: Number(amount),
      currency: 'INR',
      gateway: paymentGatewayUsed,
      paymentSessionId,
      upi: {
        uri: upiUri,
        qrCodeUrl,
        gpayUri,
        phonepeUri,
        paytmUri,
        payeeVpa: sellerUpiId,
        payeeName: sellerName
      },
      expiresAt,
      createdAt: new Date(timestamp).toISOString()
    }));

  } catch (err) {
    console.error('Error creating payment order:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Failed to create payment order' }));
  }
}
