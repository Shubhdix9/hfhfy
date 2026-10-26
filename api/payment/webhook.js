// api/payment/webhook.js
// Vercel Serverless Function & Vite dev API handler
// Listens for asynchronous payment gateway notifications (Cashfree webhook)

import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature, x-webhook-timestamp');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const cashfreeSecret = process.env.CASHFREE_SECRET_KEY;

    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();

    // Verify HMAC signature if secret configured
    if (cashfreeSecret && signature && timestamp) {
      const dataToSign = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', cashfreeSecret)
        .update(dataToSign)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.warn('Invalid webhook signature received from Cashfree');
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
        return;
      }
    }

    const payload = rawBody ? JSON.parse(rawBody) : {};
    console.log('Payment Webhook received event:', payload.type, 'Order ID:', payload.data?.order?.order_id);

    // Successful webhook handling
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      received: true,
      orderId: payload.data?.order?.order_id || 'UNKNOWN',
      status: 'acknowledged',
      timestamp: new Date().toISOString()
    }));

  } catch (err) {
    console.error('Webhook error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message }));
  }
}
