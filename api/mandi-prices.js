// api/mandi-prices.js
// Vercel Serverless Function & Vite dev API handler
// Real data integration with data.gov.in / AGMARKNET

let cache = {
  data: null,
  timestamp: 0,
  ttlMs: 3600 * 1000 // 1 hour cache
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const now = Date.now();

  // If cache is fresh, return cached response
  if (cache.data && (now - cache.timestamp < cache.ttlMs)) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      ...cache.data,
      cached: true,
      cachedAt: new Date(cache.timestamp).toISOString()
    }));
    return;
  }

  // Check if API key is provided
  if (!apiKey || apiKey === 'your_data_gov_in_api_key_here') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'unconfigured',
      isConfigured: false,
      message: 'DATA_GOV_IN_API_KEY is not configured on the server. Please register on data.gov.in to obtain an official API key for daily AGMARKNET mandi feeds.',
      officialSourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi',
      catalogTitle: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
      sourceAgency: 'Directorate of Marketing & Inspection, Ministry of Agriculture and Farmers Welfare',
      records: [],
      lastCheckedAt: new Date().toISOString()
    }));
    return;
  }

  try {
    // Official data.gov.in AGMARKNET daily prices resource
    const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
    // Filter for Rajasthan / Jaipur / nearby districts
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=50&filters%5Bstate%5D=Rajasthan`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const apiResponse = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      throw new Error(`data.gov.in API returned HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
    }

    const payload = await apiResponse.json();
    const rawRecords = payload.records || [];

    const formattedRecords = rawRecords.map(r => {
      const minPrice = parseFloat(r.min_price || r.minprice || 0);
      const maxPrice = parseFloat(r.max_price || r.maxprice || 0);
      const modalPrice = parseFloat(r.modal_price || r.modalprice || 0);

      return {
        state: r.state || 'Rajasthan',
        district: r.district || 'Jaipur',
        market: r.market || 'Jaipur Mandi',
        commodity: r.commodity || 'Agricultural Commodity',
        variety: r.variety || 'Other',
        grade: r.grade || 'FAQ',
        arrivalDate: r.arrival_date || new Date().toISOString().split('T')[0],
        minPriceQuintal: minPrice,
        maxPriceQuintal: maxPrice,
        modalPriceQuintal: modalPrice,
        unit: '₹/quintal',
        // Transparent equivalent ₹/kg (1 quintal = 100 kg)
        equivalentModalKg: modalPrice > 0 ? (modalPrice / 100).toFixed(2) : '0'
      };
    });

    const result = {
      status: 'connected',
      isConfigured: true,
      officialSourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi',
      sourceAgency: 'Ministry of Agriculture and Farmers Welfare / AGMARKNET',
      records: formattedRecords,
      totalRecords: formattedRecords.length,
      lastCheckedAt: new Date().toISOString()
    };

    cache = {
      data: result,
      timestamp: now,
      ttlMs: 3600 * 1000
    };

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(result));

  } catch (error) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'temporarily_unavailable',
      isConfigured: true,
      message: `Failed to fetch live AGMARKNET feed from data.gov.in: ${error.message}`,
      officialSourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi',
      records: [],
      lastCheckedAt: new Date().toISOString()
    }));
  }
}
