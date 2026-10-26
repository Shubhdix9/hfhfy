// src/data-services.js
// Client data service fetching real external feeds via protected serverless endpoints

export async function fetchMandiRates() {
  try {
    const res = await fetch('/api/mandi-prices');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch mandi prices:', err);
    return {
      status: 'temporarily_unavailable',
      isConfigured: false,
      message: err.message,
      records: [],
      officialSourceUrl: 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi'
    };
  }
}

export async function fetchImdWeather() {
  try {
    const res = await fetch('/api/weather');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch IMD weather:', err);
    return {
      status: 'temporarily_unavailable',
      isConfigured: false,
      message: err.message,
      stationName: 'Jaipur Met Centre',
      officialSourceUrl: 'https://mausam.imd.gov.in/jaipur/'
    };
  }
}

export async function fetchDataSourcesHealth() {
  try {
    const res = await fetch('/api/health/data-sources');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch data sources health:', err);
    return { status: 'error', sources: [] };
  }
}

export async function fetchPublicConfig() {
  try {
    const res = await fetch('/api/public-config');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch public config:', err);
    return null;
  }
}
