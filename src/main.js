// src/main.js
// Main Application Controller for KrishiSetu
import { jkluAnchorData, calculateHaversineDistanceKm, formatDistanceLabel, isWithinRadius } from './jklu-anchor.js';
import {
  loadGoogleMapsScript,
  initGoogleMap,
  renderListingsOnMap,
  searchNearbyGooglePlaces,
  resetMapToJklu,
  centerOnUserLocation,
  setMapRadiusCircle,
  isGoogleMapsLoaded,
  getGoogleMap,
  drawOsrmDrivingRoute
} from './google-maps.js';
import { initSupabase, fetchPlatformCropListings, submitPlatformOrder } from './supabase-client.js';
import { fetchMandiRates, fetchImdWeather, fetchDataSourcesHealth, fetchPublicConfig } from './data-services.js';
import { baselineMarketplaceItems, baselineReviews } from './app-data.js';
import { calculateRentalCost } from './pricing.js';
import { openPaymentGatewayModal } from './payment-gateway.js';
import { t, setLanguage, getLanguage } from './i18n.js';
import { renderFarmerPanel, farmerState } from './modules/farmer-dashboard.js';
import { renderAdminPanel, adminState } from './modules/admin-dashboard.js';
import {
  renderMachineryOwnerPanel,
  renderWarehousePanel,
  renderTransporterPanel,
  renderFpoPanel,
  renderInputSupplierPanel,
  renderExpertPanel
} from './modules/role-dashboards.js';
import { openQuotationModal } from './modules/quotation-modal.js';
import {
  initAuth,
  getCurrentUser,
  isLoggedIn,
  subscribeAuth,
  requestMobileOtp,
  verifyMobileOtp,
  loginWithEmail,
  registerNewUser,
  quickLoginAs,
  logoutUser,
  isValidIndianMobile
} from './auth.js';

// Application State
let appConfig = null;
let currentRadiusKm = 25;
let currentSearchQuery = '';
let currentCategoryFilter = 'all';
let currentSortBy = 'distance';
let selectedItem = null;
let allItems = [...baselineMarketplaceItems];
let filteredItems = [];
let cart = [];
let reviews = [...baselineReviews];
let activeSection = 'home'; // 'home', 'map', 'farmer', 'admin', 'machinery', etc.
let savedListingIds = new Set(JSON.parse(localStorage.getItem('krishi_saved_listings') || '[]'));

// On DOM Loaded
document.addEventListener('DOMContentLoaded', async () => {
  await bootstrapApp();
});

async function bootstrapApp() {
  console.log('Bootstrapping KrishiSetu Platform...');

  // 1. Fetch public runtime configuration from /api/public-config
  appConfig = await fetchPublicConfig();

  // 2. Initialize Supabase
  if (appConfig?.supabase) {
    initSupabase(appConfig.supabase);
  }

  // 3. Try to merge any live listings from Supabase with baseline items
  try {
    const supabaseListings = await fetchPlatformCropListings();
    if (supabaseListings.connected && supabaseListings.data?.length > 0) {
      const formattedSupabase = supabaseListings.data.map(item => ({
        id: item.id,
        group: item.listing_group || 'produce',
        type: item.listing_type || 'buy',
        title: item.title,
        crop: item.crop_variety || item.title,
        price: Number(item.price_per_unit),
        unit: item.unit || '₹/kg',
        pricePerUnit: Number(item.price_per_unit),
        availableQuantity: Number(item.available_quantity),
        minOrderQuantity: Number(item.min_order_quantity || 1),
        qualityGrade: item.quality_grade || 'Standard',
        harvestDate: item.harvest_date,
        locality: item.locality_name || 'Jaipur',
        lat: Number(item.public_latitude),
        lng: Number(item.public_longitude),
        farmer: item.profiles?.full_name || 'Platform Farmer',
        isVerified: Boolean(item.profiles?.is_verified),
        description: item.description || ''
      }));
      allItems = [...formattedSupabase, ...baselineMarketplaceItems];
    }
  } catch (err) {
    console.warn('Could not load Supabase listings, using baseline verified items:', err);
  }

  // 4. Initialize Google Maps
  const mapsApiKey = appConfig?.googleMaps?.apiKey || import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const mapId = appConfig?.googleMaps?.mapId || import.meta.env?.VITE_GOOGLE_MAP_ID || '';

  const mapsReady = await loadGoogleMapsScript(mapsApiKey, mapId);
  if (mapsReady) {
    initGoogleMap('googleMapContainer', { initialRadiusKm: currentRadiusKm });
  }

  // 5. Setup Authentication & Session
  initAuth();
  subscribeAuth((user) => {
    updateAuthUI(user);
  });

  // 6. Setup UI Event Listeners
  setupEventListeners();

  // 7. Initial Filter & Render
  applyFiltersAndRender();

  // 8. Render initial reviews
  renderReviewsList();

  // 9. Render homepage continuous product showcase marquee
  renderProductShowcase();

  // 10. Update static translations
  updateTranslationsOnPage();

  // 11. Ensure background hero video streams cleanly with Safari autoplay compliance
  const heroVideo = document.getElementById('heroBgVideo') || document.querySelector('#homeSection video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    const remoteVideoUrl = appConfig?.homepageVideoUrl || import.meta.env?.VITE_HOMEPAGE_VIDEO_URL;
    if (remoteVideoUrl && remoteVideoUrl.trim() !== '') {
      heroVideo.src = remoteVideoUrl.trim();
      heroVideo.load();
    }

    const attemptPlay = () => {
      heroVideo.play().catch(err => {
        console.info('Hero video autoplay waiting for user interaction:', err?.message);
        const onFirstInteraction = () => {
          heroVideo.play().catch(() => {});
          window.removeEventListener('click', onFirstInteraction);
          window.removeEventListener('touchstart', onFirstInteraction);
          window.removeEventListener('scroll', onFirstInteraction);
        };
        window.addEventListener('click', onFirstInteraction, { once: true });
        window.addEventListener('touchstart', onFirstInteraction, { once: true });
        window.addEventListener('scroll', onFirstInteraction, { once: true });
      });
    };

    attemptPlay();
  }
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-nav-target');
      navigateToSection(target);
    });
  });

  // Language Toggle
  const langBtn = document.getElementById('languageToggleBtn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = getLanguage() === 'en' ? 'hi' : 'en';
      setLanguage(nextLang);
      langBtn.textContent = t('languageButton');
      updateTranslationsOnPage();
      applyFiltersAndRender();
      renderReviewsList();
    });
  }

  // Radius Buttons
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.radius-btn').forEach(b => b.classList.remove('bg-green-600', 'text-white'));
      document.querySelectorAll('.radius-btn').forEach(b => b.classList.add('bg-gray-100', 'text-gray-700'));

      e.currentTarget.classList.remove('bg-gray-100', 'text-gray-700');
      e.currentTarget.classList.add('bg-green-600', 'text-white');

      currentRadiusKm = parseInt(e.currentTarget.getAttribute('data-radius'), 10) || 25;
      setMapRadiusCircle(currentRadiusKm);
      applyFiltersAndRender();
    });
  });

  // Search Input
  const searchInput = document.getElementById('mapSearchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        applyFiltersAndRender();
      }, 250);
    });
  }

  // Category Filter
  const categorySelect = document.getElementById('mapCategoryFilter');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentCategoryFilter = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Sort Filter
  const sortSelect = document.getElementById('mapSortFilter');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Reset to JKLU
  const resetBtn = document.getElementById('resetToJkluBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetMapToJklu();
      showToast('Map centered back on verified JKLU Mahapura Anchor');
    });
  }

  // Use My Location
  const myLocBtn = document.getElementById('useMyLocationBtn');
  if (myLocBtn) {
    myLocBtn.addEventListener('click', () => {
      centerOnUserLocation(
        (coords) => showToast(`Location centered: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`),
        (errMsg) => showToast(errMsg, 'error')
      );
    });
  }

  // Search This Area Button
  const searchAreaBtn = document.getElementById('searchThisAreaBtn');
  if (searchAreaBtn) {
    searchAreaBtn.addEventListener('click', () => {
      const gMap = getGoogleMap();
      if (gMap) {
        const center = gMap.getCenter();
        searchNearbyGooglePlaces(center, currentRadiusKm * 1000, (places) => {
          showToast(`Found ${places.length} nearby agricultural places from Google Places`);
        });
      }
    });
  }

  // Mobile Map/List Toggle
  const toggleMobileViewBtn = document.getElementById('toggleMobileViewBtn');
  if (toggleMobileViewBtn) {
    toggleMobileViewBtn.addEventListener('click', () => {
      const mapCol = document.getElementById('mapColumn');
      const listCol = document.getElementById('listColumn');
      const isMapHidden = mapCol.classList.contains('hidden');

      if (isMapHidden) {
        mapCol.classList.remove('hidden');
        listCol.classList.add('hidden');
        toggleMobileViewBtn.textContent = '📋 ' + t('viewList');
      } else {
        mapCol.classList.add('hidden');
        listCol.classList.remove('hidden');
        toggleMobileViewBtn.textContent = '🗺️ ' + t('viewMap');
      }
    });
  }

  // Data Sources Diagnostics Modal
  const dataSourcesBtn = document.getElementById('dataSourcesBtn');
  if (dataSourcesBtn) {
    dataSourcesBtn.addEventListener('click', openDataSourcesModal);
  }

  // Close Drawer
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDetailsDrawer);
  }

  // Close Modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.add('hidden');
    }
  });
}

/**
 * Filter items by radius from JKLU, search text, category, and sort.
 */
function applyFiltersAndRender() {
  filteredItems = allItems.filter(item => {
    // 1. Distance filter (Straight-line distance from JKLU anchor)
    const dist = calculateHaversineDistanceKm(
      jkluAnchorData.latitude,
      jkluAnchorData.longitude,
      item.lat,
      item.lng
    );
    item._distanceKm = dist;

    if (dist > currentRadiusKm) {
      return false;
    }

    // 2. Category filter
    if (currentCategoryFilter !== 'all') {
      if (item.group !== currentCategoryFilter && item.type !== currentCategoryFilter) {
        return false;
      }
    }

    // 3. Search query
    if (currentSearchQuery) {
      const q = currentSearchQuery;
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCrop = (item.crop || '').toLowerCase().includes(q);
      const matchLoc = (item.locality || '').toLowerCase().includes(q);
      const matchFarmer = (item.farmer || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCrop && !matchLoc && !matchFarmer) {
        return false;
      }
    }

    return true;
  });

  // Sort items
  if (currentSortBy === 'distance') {
    filteredItems.sort((a, b) => a._distanceKm - b._distanceKm);
  } else if (currentSortBy === 'price_asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (currentSortBy === 'price_desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  }

  // Update Count
  const countEl = document.getElementById('resultsCountBadge');
  if (countEl) {
    countEl.textContent = `${filteredItems.length} ${t('resultsCount')}`;
  }

  // Render cards in left panel
  renderListingCards(filteredItems);

  // Render pins on Google Map
  if (isGoogleMapsLoaded()) {
    renderListingsOnMap(filteredItems, (selected) => {
      highlightCard(selected.id);
    });
  }
}

/**
 * Renders listing cards in the left panel.
 */
function renderListingCards(items) {
  const container = document.getElementById('listingsCardsContainer');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div class="text-3xl mb-2">🌾</div>
        <h4 class="font-bold text-gray-700 text-sm mb-1">${t('noResultsFound')}</h4>
        <p class="text-xs text-gray-500">${t('noResultsHint')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const isSelected = selectedItem?.id === item.id;
    const isSaved = savedListingIds.has(item.id);
    const badgeBg = item.group === 'agrowaste' ? 'bg-emerald-100 text-emerald-800' :
                    item.group === 'machinery' ? 'bg-stone-200 text-stone-800' :
                    item.group === 'transport' ? 'bg-stone-200 text-stone-900' : 'bg-amber-100 text-amber-800';

    const fallbackImg = item.group === 'agrowaste' ? 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=150&q=80' :
                        item.group === 'machinery' ? 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80' :
                        item.group === 'transport' ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&q=80' :
                        'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=150&q=80';
    const photoUrl = item.imageUrl || fallbackImg;

    return `
      <div id="listing-card-${item.id}"
           class="listing-card p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${isSelected ? 'border-[#1b4332] bg-[#fbf8f1] shadow-sm' : 'border-stone-200 bg-white'}"
           onclick="window.__selectListingCard('${item.id}')">
        
        <div class="flex gap-3 items-center">
          <!-- Real Photo Thumbnail -->
          <div class="relative w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200 bg-stone-100" style="width: 72px; height: 72px;">
            <img src="${photoUrl}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='${fallbackImg}'">
            <span class="absolute top-1 left-1 text-[8px] font-extrabold px-1.5 py-0.2 rounded ${badgeBg} shadow-xs">
              ${item.group || item.type}
            </span>
          </div>

          <!-- Card Content -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-stone-900 text-xs leading-snug truncate pr-1" title="${item.title}">${item.title}</h4>
              <button onclick="event.stopPropagation(); window.__toggleSaveListing('${item.id}')"
                      title="${isSaved ? 'Remove from saved' : 'Save listing'}"
                      class="text-xs ${isSaved ? 'text-amber-600 font-bold' : 'text-stone-300 hover:text-stone-600'}">
                ${isSaved ? '★' : '☆'}
              </button>
            </div>
            
            <p class="text-[11px] text-stone-500 mt-0.5">
              📍 ${item.locality} · <strong>${formatDistanceLabel(item._distanceKm)}</strong>
            </p>

            <div class="flex items-baseline justify-between mt-1.5 pt-1 border-t border-stone-100">
              <div>
                <span class="text-sm font-black text-[#1b4332]">₹${item.price}</span>
                <span class="text-[10px] text-stone-500">${item.unit || ''}</span>
              </div>
              <button onclick="event.stopPropagation(); window.__openItemView('${item.id}')"
                      class="text-[11px] font-bold text-emerald-800 hover:underline">
                View &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global hook for card selection (pan map, draw route, NO popup)
window.__selectListingCard = (id) => {
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  selectedItem = item;
  highlightCard(id);

  // Pan Map to pin and open popup
  if (item._marker && getGoogleMap()) {
    getGoogleMap().setView([item.lat, item.lng], 13);
    item._marker.openPopup();
  }

  // Draw real driving route from JKLU via OSRM cleanly without opening popup
  drawOsrmDrivingRoute(item.lat, item.lng);
};

// Explicit "View" option hook — opens specifications modal dialog
window.__openItemView = (id) => {
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  selectedItem = item;
  highlightCard(id);

  if (item._marker && getGoogleMap()) {
    getGoogleMap().setView([item.lat, item.lng], 13);
    item._marker.openPopup();
  }

  drawOsrmDrivingRoute(item.lat, item.lng, (routeInfo) => {
    const roadEl = document.getElementById('drawerRoadDrivingInfo');
    if (roadEl) {
      if (routeInfo) {
        roadEl.innerHTML = `🚗 Real Road Distance: <strong>${routeInfo.distanceKm} km</strong> (~${routeInfo.durationMins} mins drive from JKLU)`;
      } else {
        roadEl.innerHTML = `🚗 Road distance from JKLU: ~${item._distanceKm} km`;
      }
    }
  });

  openDetailsDrawer(item);
};

function highlightCard(id) {
  document.querySelectorAll('.listing-card').forEach(c => {
    c.classList.remove('border-[#1b4332]', 'bg-[#fbf8f1]');
    c.classList.add('border-stone-200', 'bg-white');
  });

  const card = document.getElementById(`listing-card-${id}`);
  if (card) {
    card.classList.remove('border-stone-200', 'bg-white');
    card.classList.add('border-[#1b4332]', 'bg-[#fbf8f1]');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Opens right details drawer for selected listing with authentic photo and specs.
 */
function openDetailsDrawer(item) {
  selectedItem = item;
  const drawer = document.getElementById('itemDetailsDrawer');
  const content = document.getElementById('drawerDetailsContent');
  if (!drawer || !content) return;

  const isSaved = savedListingIds.has(item.id);
  const distKm = calculateHaversineDistanceKm(
    jkluAnchorData.latitude,
    jkluAnchorData.longitude,
    item.lat,
    item.lng
  );

  const fallbackImg = item.group === 'agrowaste' ? 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=600&q=80' :
                      item.group === 'machinery' ? 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80' :
                      item.group === 'transport' ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' :
                      'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80';
  const photoUrl = item.imageUrl || fallbackImg;

  let rentalRatesHtml = '';
  if (item.rates) {
    rentalRatesHtml = `
      <div class="bg-stone-50 p-3.5 rounded-xl border border-stone-200 my-3 shadow-xs">
        <h5 class="text-xs font-bold text-stone-700 uppercase mb-2">Flexible Lease Options (Pre-Calculated):</h5>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-white p-2 rounded-lg border border-stone-200 shadow-xs">
            <span class="block text-stone-500 font-medium text-[11px]">Daily</span>
            <span class="font-bold text-stone-900">₹${item.rates.dailyRate}</span>
          </div>
          <div class="bg-stone-100 p-2 rounded-lg border border-stone-300">
            <span class="block text-stone-700 font-medium text-[11px]">Weekly (-15%)</span>
            <span class="font-bold text-stone-900">₹${item.rates.weeklyRate}</span>
          </div>
          <div class="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <span class="block text-emerald-800 font-medium text-[11px]">Monthly (-25%)</span>
            <span class="font-bold text-emerald-950">₹${item.rates.monthlyRate}</span>
          </div>
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="space-y-4">
      <!-- Real High-Res Photo Banner with Location Badge -->
      <div class="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
        <img src="${photoUrl}" alt="${item.title}" class="w-full h-52 object-cover" onerror="this.src='${fallbackImg}'">
        <div class="absolute top-3 left-3 flex gap-2">
          <span class="px-2.5 py-1 bg-[#1b4332]/90 text-white rounded-lg font-bold text-[10px] tracking-wide uppercase shadow-sm">
            ${item.group || item.type}
          </span>
          <span class="px-2.5 py-1 bg-white/95 text-stone-800 rounded-lg font-bold text-[10px] shadow-sm">
            📍 Real Indian Farm Parcel
          </span>
        </div>
        <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[10px] font-semibold">
          📷 Verified Photograph
        </div>
      </div>

      <div>
        <h3 class="text-xl font-bold text-stone-900 leading-snug">${item.title}</h3>
        <p class="text-xs text-stone-500 mt-1">
          📍 ${item.locality} · <strong>${formatDistanceLabel(distKm)}</strong> straight-line from JKLU Anchor
        </p>
      </div>

      <!-- Real Road Driving Path Banner -->
      <div id="drawerRoadDrivingInfo" class="text-xs text-stone-700 bg-stone-100 border border-stone-200 p-2.5 rounded-xl font-semibold flex items-center gap-1.5">
        🚗 Calculating road path from JKLU via OSRM...
      </div>

      <div class="flex items-baseline space-x-2 pb-3 border-b border-stone-200">
        <span class="text-3xl font-black text-[#1b4332]">₹${item.price}</span>
        <span class="text-xs text-stone-500 font-semibold">${item.unit || ''}</span>
      </div>

      ${rentalRatesHtml}

      <div class="text-xs text-stone-700 leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
        <strong class="text-stone-900">Description & Field Context:</strong>
        <p class="mt-1 text-stone-600">${item.description || 'Verified agricultural listing on the KrishiSetu Rajasthan network.'}</p>
      </div>

      <div class="text-xs space-y-2 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
        <div class="flex justify-between items-center">
          <span class="text-stone-500">Cultivator / Provider:</span>
          <span class="font-bold text-stone-900">${item.farmer || 'Verified Platform Member'} ${item.isVerified ? '✅ (Jamabandi Verified)' : ''}</span>
        </div>
        ${item.qualityGrade ? `
          <div class="flex justify-between items-center">
            <span class="text-stone-500">Quality Grade:</span>
            <span class="font-semibold text-stone-900">${item.qualityGrade}</span>
          </div>
        ` : ''}
        ${item.availableQuantity ? `
          <div class="flex justify-between items-center">
            <span class="text-stone-500">Available Stock:</span>
            <span class="font-bold text-emerald-800">${item.availableQuantity}</span>
          </div>
        ` : ''}
        ${item.condition ? `
          <div class="flex justify-between items-center">
            <span class="text-stone-500">Operating Condition:</span>
            <span class="font-semibold text-stone-900">${item.condition}</span>
          </div>
        ` : ''}
        ${item.harvestDate ? `
          <div class="flex justify-between items-center">
            <span class="text-stone-500">Harvest / Date:</span>
            <span class="font-semibold text-stone-900">${item.harvestDate}</span>
          </div>
        ` : ''}
      </div>

      <div class="pt-2 space-y-2">
        <button onclick="window.__addItemToCart('${item.id}')"
                class="w-full btn-forest py-3 rounded-xl text-xs font-bold transition shadow-sm">
          🛒 Add to Cart
        </button>
        <button onclick="window.__openQuotationModal('${item.id}')"
                class="w-full btn-earth py-2.5 rounded-xl text-xs font-bold transition">
          📝 Request Formal Quotation & Bulk Price
        </button>
        ${item.rates || item.group === 'machinery' || item.group === 'equipment' || item.group === 'transport' ? `
          <button onclick="window.__openRentalModal('${item.id}')"
                  class="w-full btn-forest-outline py-2.5 rounded-xl text-xs font-semibold transition">
            🚜 Book Rental / Transport Lease
          </button>
        ` : ''}
        <button onclick="window.__toggleSaveListing('${item.id}')"
                class="w-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold py-2 rounded-xl text-xs transition">
          ${isSaved ? '★ Saved in Your Shortlist' : '☆ Save Listing & Farmer'}
        </button>
      </div>
    </div>
  `;

  drawer.classList.remove('hidden');
  drawer.style.display = 'flex';
  const scrollBody = drawer.querySelector('.overflow-y-auto') || drawer;
  scrollBody.scrollTop = 0;

  // Backdrop click to close
  drawer.onclick = (e) => {
    if (e.target === drawer) {
      closeDetailsDrawer();
    }
  };
}

function closeDetailsDrawer() {
  const drawer = document.getElementById('itemDetailsDrawer');
  if (drawer) {
    drawer.classList.add('hidden');
    drawer.style.display = 'none';
  }
}
window.__closeDetailsDrawer = closeDetailsDrawer;

// Global Cart Actions
window.__addItemToCart = (itemId) => {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      title: item.title,
      price: item.price,
      unit: item.unit || '₹',
      quantity: 1,
      type: item.group || item.type
    });
  }

  updateCartBadge();
  renderCartView();
  showToast(`Added "${item.title}" to cart`);
};

window.__openRentalModal = (itemId) => {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('rentalOptionsModal');
  const details = document.getElementById('rentalItemDetails');
  if (!modal || !details) return;

  const baseRate = item.dailyRate || item.price;
  const rates = calculateRentalCost(baseRate, 'daily', 1).rates;

  details.innerHTML = `
    <h4 class="font-bold text-gray-900">${item.title}</h4>
    <p class="text-xs text-gray-500">Base rate: ₹${baseRate}/day · Locality: ${item.locality}</p>
  `;

  document.getElementById('dailyPrice').textContent = `₹${rates.dailyRate}`;
  document.getElementById('weeklyPrice').textContent = `₹${rates.weeklyRate}`;
  document.getElementById('monthlyPrice').textContent = `₹${rates.monthlyRate}`;

  modal.setAttribute('data-selected-item-id', itemId);
  modal.classList.remove('hidden');
};

window.selectRentalPeriodInModal = (period) => {
  const modal = document.getElementById('rentalOptionsModal');
  const itemId = modal.getAttribute('data-selected-item-id');
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const baseRate = item.dailyRate || item.price;
  const cost = calculateRentalCost(baseRate, period, 1);

  cart.push({
    id: `${item.id}-${period}`,
    title: `${item.title} (${period.toUpperCase()} LEASE)`,
    price: cost.unitPrice,
    unit: `₹/${period}`,
    quantity: 1,
    type: 'machinery_rental'
  });

  modal.classList.add('hidden');
  updateCartBadge();
  renderCartView();
  showToast(`Booked ${period} lease for ${item.title}`);
};

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (badge) {
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function renderCartView() {
  const cartContainer = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  const totalEl = document.getElementById('cartTotal');
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center py-12">
        <div class="text-5xl mb-4">🛒</div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">${t('cartEmpty')}</h3>
        <p class="text-xs text-gray-500 mb-6">${t('cartEmptySubtext')}</p>
        <button onclick="window.__navigateToSection('map')"
                class="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition">
          ${t('continueShopping')}
        </button>
      </div>
    `;
    if (summary) summary.classList.add('hidden');
    return;
  }

  let totalAmount = 0;
  cartContainer.innerHTML = cart.map((item, index) => {
    const lineTotal = item.price * item.quantity;
    totalAmount += lineTotal;

    return `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div class="flex-1">
          <h4 class="font-bold text-gray-900 text-sm">${item.title}</h4>
          <span class="text-xs text-gray-500">₹${item.price} ${item.unit}</span>
        </div>
        <div class="flex items-center space-x-3">
          <div class="flex items-center border bg-white rounded-lg">
            <button onclick="window.__updateCartQty(${index}, -1)" class="px-2.5 py-1 text-gray-600 hover:bg-gray-100 text-sm font-bold">-</button>
            <span class="px-3 py-1 text-xs font-bold">${item.quantity}</span>
            <button onclick="window.__updateCartQty(${index}, 1)" class="px-2.5 py-1 text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
          </div>
          <span class="text-sm font-extrabold text-green-700 min-w-[70px] text-right">₹${lineTotal}</span>
          <button onclick="window.__removeCartItem(${index})" class="text-red-500 hover:text-red-700 text-xs px-2 py-1">✕</button>
        </div>
      </div>
    `;
  }).join('');

  if (summary && totalEl) {
    summary.classList.remove('hidden');
    totalEl.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
  }
}

window.__updateCartQty = (index, delta) => {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartBadge();
  renderCartView();
};

window.__removeCartItem = (index) => {
  cart.splice(index, 1);
  updateCartBadge();
  renderCartView();
};

window.__checkoutCart = async () => {
  if (cart.length === 0) return;

  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  // Submit order to Supabase / server
  const orderRes = await submitPlatformOrder({
    totalAmount,
    items: cart,
    deliveryLocality: 'Mahapura / Jaipur'
  });

  const modal = document.getElementById('checkoutConfirmModal');
  if (modal) {
    document.getElementById('checkoutOrderId').textContent = orderRes.orderId || 'PENDING-ORD';
    document.getElementById('checkoutOrderTotal').textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    modal.classList.remove('hidden');
  }

  // Clear cart
  cart = [];
  updateCartBadge();
  renderCartView();
};

window.__payOnlineCart = async () => {
  if (cart.length === 0) return;

  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const titles = cart.map(i => i.title).join(', ');

  // Direct farmer settlement using active farmer UPI ID
  const farmerUpiId = localStorage.getItem('krishisetu_farmer_upi_id') || 'ramesh.farmer@upi';
  const farmerName = localStorage.getItem('krishisetu_farmer_name') || 'Ramesh Kumar (Farmer)';

  await openPaymentGatewayModal({
    amount: totalAmount,
    itemTitle: titles,
    buyerName: 'Agri Buyer',
    sellerUpiId: farmerUpiId,
    sellerName: farmerName,
    onSuccess: (verifiedPayment) => {
      // Clear cart on verified payment
      cart = [];
      updateCartBadge();
      renderCartView();
      showToast(`Payment of ₹${totalAmount.toLocaleString('en-IN')} verified! Receipt: ${verifiedPayment.receiptId}`, 'success');
    },
    onFailure: (err) => {
      showToast('Payment was not completed: ' + err.message, 'error');
    }
  });
};

/**
 * Live Data Sources Health Modal
 */
async function openDataSourcesModal() {
  const modal = document.getElementById('dataSourcesModal');
  const container = document.getElementById('dataSourcesModalContent');
  if (!modal || !container) return;

  container.innerHTML = `
    <div class="py-8 text-center text-gray-500 text-sm">
      <div class="animate-spin text-2xl mb-2">⏳</div>
      Loading real data source statuses...
    </div>
  `;
  modal.classList.remove('hidden');

  const health = await fetchDataSourcesHealth();
  const sources = health.sources || [];

  container.innerHTML = `
    <div class="space-y-3">
      <div class="p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-green-900">
        <strong>Verified Map Anchor:</strong> ${jkluAnchorData.name}<br>
        <strong>Address:</strong> ${jkluAnchorData.officialAddress}<br>
        <strong>Coordinates:</strong> ${jkluAnchorData.latitude}, ${jkluAnchorData.longitude} (Mahapura, Ajmer Road)<br>
        <a href="${jkluAnchorData.officialSourceUrl}" target="_blank" class="underline font-semibold mt-1 inline-block">Official University Source</a>
      </div>

      <div class="divide-y divide-gray-200">
        ${sources.map(s => {
          const statusBadge = s.status === 'connected' ? '<span class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold text-[10px]">CONNECTED</span>' :
                              s.status === 'setup_required' ? '<span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">SETUP REQUIRED</span>' :
                              '<span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-bold text-[10px]">NOT CONFIGURED</span>';
          return `
            <div class="py-3">
              <div class="flex justify-between items-start">
                <span class="font-bold text-gray-800 text-xs">${s.name}</span>
                ${statusBadge}
              </div>
              <p class="text-[11px] text-gray-600 mt-1">${s.details}</p>
              ${s.officialSourceUrl && s.officialSourceUrl !== 'N/A' ? `
                <a href="${s.officialSourceUrl}" target="_blank" class="text-[10px] text-blue-600 hover:underline block mt-0.5">
                  Official Source Link &rarr;
                </a>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Mandi Rates Section Loader
 */
async function loadMandiRatesView() {
  const container = document.getElementById('mandiRatesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="py-8 text-center text-gray-500 text-sm">
      <div class="animate-spin text-2xl mb-2">⏳</div>
      Fetching official AGMARKNET mandi rates from data.gov.in...
    </div>
  `;

  const mandiData = await fetchMandiRates();

  if (!mandiData.isConfigured || mandiData.records?.length === 0) {
    container.innerHTML = `
      <div class="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
        <h4 class="font-bold text-amber-900 text-sm mb-1">AGMARKNET Mandi Feed Setup</h4>
        <p class="text-xs text-amber-800 max-w-lg mx-auto mb-3">
          ${mandiData.message || 'Configure DATA_GOV_IN_API_KEY in your server environment to stream daily wholesale prices.'}
        </p>
        <a href="${mandiData.officialSourceUrl || 'https://www.data.gov.in'}" target="_blank"
           class="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition">
          View Official AGMARKNET Catalog on data.gov.in &rarr;
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <div class="text-xs text-gray-500 mb-2 flex justify-between items-center">
        <span>Source: <strong>Ministry of Agriculture / AGMARKNET</strong></span>
        <span>Last Checked: ${new Date(mandiData.lastCheckedAt).toLocaleTimeString()}</span>
      </div>
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-gray-700 font-bold">
            <th class="p-2.5">Commodity</th>
            <th class="p-2.5">Mandi / Market</th>
            <th class="p-2.5">Arrival Date</th>
            <th class="p-2.5">Min Price</th>
            <th class="p-2.5">Max Price</th>
            <th class="p-2.5">Modal Price (₹/quintal)</th>
            <th class="p-2.5">Eq. ₹/kg</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${mandiData.records.map(r => `
            <tr class="hover:bg-gray-50">
              <td class="p-2.5 font-bold text-gray-900">${r.commodity} <span class="text-gray-400 font-normal">(${r.variety})</span></td>
              <td class="p-2.5">${r.market}, ${r.district}</td>
              <td class="p-2.5">${r.arrivalDate}</td>
              <td class="p-2.5 text-gray-600">₹${r.minPriceQuintal}</td>
              <td class="p-2.5 text-gray-600">₹${r.maxPriceQuintal}</td>
              <td class="p-2.5 font-bold text-green-700">₹${r.modalPriceQuintal}</td>
              <td class="p-2.5 text-gray-500 font-semibold">₹${r.equivalentModalKg}/kg</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * IMD Weather Loader
 */
async function loadWeatherView() {
  const container = document.getElementById('weatherViewContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="py-8 text-center text-gray-500 text-sm">
      <div class="animate-spin text-2xl mb-2">⏳</div>
      Loading IMD Jaipur Met Centre weather & advisories...
    </div>
  `;

  const weather = await fetchImdWeather();

  container.innerHTML = `
    <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-3">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">Official Met Centre</span>
          <h4 class="font-bold text-gray-900 text-base mt-1">${weather.stationName || 'Jaipur Met Centre (Station 42348)'}</h4>
          <p class="text-xs text-gray-600">${weather.localityContext || 'Observatory for Jaipur & Sanganer/Mahapura area'}</p>
        </div>
        <a href="${weather.officialSourceUrl}" target="_blank" class="text-xs text-blue-600 underline font-semibold">
          IMD Portal &rarr;
        </a>
      </div>

      <div class="bg-white p-3 rounded-lg border border-blue-100 text-xs">
        <h5 class="font-bold text-gray-800 mb-1">🌾 Regional Agromet Advisory:</h5>
        ${weather.agrometAdvisories ? weather.agrometAdvisories.map(a => `
          <p class="text-gray-700 mb-1"><strong>${a.title}:</strong> ${a.advisory}</p>
          <span class="text-[10px] text-gray-400">Issued by: ${a.source}</span>
        `).join('') : '<p class="text-gray-500">Visit IMD Jaipur portal for seasonal crop advisories.</p>'}
      </div>
    </div>
  `;
}

function renderReviewsList() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  container.innerHTML = reviews.map(rev => `
    <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="flex justify-between items-center mb-1">
        <span class="font-bold text-gray-900 text-xs">${rev.reviewerName} (${rev.userType})</span>
        <span class="text-amber-500 text-xs">${'⭐'.repeat(rev.rating)}</span>
      </div>
      <p class="text-xs text-gray-600">${rev.comment}</p>
      <span class="text-[10px] text-gray-400 mt-2 block">${rev.date}</span>
    </div>
  `).join('');
}

/**
 * Renders homepage continuous horizontal product showcase marquee
 */
function renderProductShowcase() {
  const track = document.getElementById('productShowcaseTrack');
  if (!track) return;

  const showcaseItems = allItems.slice(0, 10);
  if (showcaseItems.length === 0) return;

  // Duplicate list to create a seamless infinite loop animation
  const loopItems = [...showcaseItems, ...showcaseItems];

  track.innerHTML = loopItems.map(item => {
    const isSaved = savedListingIds.has(item.id);
    const badgeBg = item.group === 'agrowaste' ? 'bg-emerald-100 text-emerald-800' :
                    item.group === 'machinery' ? 'bg-stone-200 text-stone-800' :
                    item.group === 'transport' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-900';

    const fallbackImg = item.group === 'agrowaste' ? 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=400&q=80' :
                        item.group === 'machinery' ? 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80' :
                        item.group === 'transport' ? '/images/indian-agri-truck.jpg' :
                        'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80';
    const photoUrl = item.imageUrl || fallbackImg;

    return `
      <div class="product-showcase-card flex-shrink-0 w-72 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
        <!-- Thumbnail -->
        <div class="relative w-full h-40 bg-stone-100 overflow-hidden">
          <img src="${photoUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='${fallbackImg}'">
          <div class="absolute top-2.5 left-2.5 flex gap-1.5">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md ${badgeBg} shadow-xs uppercase">
              ${item.group || item.type}
            </span>
          </div>
          <button onclick="event.stopPropagation(); window.__toggleSaveListing('${item.id}')"
                  title="${isSaved ? 'Saved' : 'Save'}"
                  class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-xs shadow-xs hover:bg-white transition ${isSaved ? 'text-amber-500 font-bold' : 'text-stone-400'}">
            ${isSaved ? '★' : '☆'}
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 flex flex-col flex-1 justify-between space-y-3">
          <div>
            <h4 class="font-bold text-stone-900 text-sm leading-snug line-clamp-1" title="${item.title}">${item.title}</h4>
            <p class="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <span>📍 ${item.locality}</span>
            </p>
          </div>

          <div class="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span class="text-base font-black text-[#1b4332]">₹${item.price}</span>
              <span class="text-[10px] text-stone-500 font-medium">${item.unit || ''}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="window.__openItemView('${item.id}')"
                      class="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition">
                View &rarr;
              </button>
              <button onclick="window.__addItemToCart('${item.id}')"
                      title="Add to Cart"
                      class="px-2.5 py-1.5 btn-forest rounded-lg text-xs font-bold transition">
                🛒 Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global scroll controller for product showcase
window.__scrollProductTrack = (delta) => {
  const wrapper = document.getElementById('productShowcaseWrapper');
  if (wrapper) {
    wrapper.scrollBy({ left: delta, behavior: 'smooth' });
  }
};

function updateTranslationsOnPage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text) el.textContent = text;
  });

  const searchInput = document.getElementById('mapSearchInput');
  if (searchInput) {
    searchInput.placeholder = t('searchPlaceholder');
  }
}

function navigateToSection(sectionId) {
  activeSection = sectionId;
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));

  const targetSec = document.getElementById(`${sectionId}Section`);
  if (targetSec) targetSec.classList.remove('hidden');

  // Synchronize top nav bar highlight
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    if (btn.getAttribute('data-nav-target') === sectionId) {
      btn.classList.add('nav-active-earth');
    } else {
      btn.classList.remove('nav-active-earth');
    }
  });

  // Synchronize role dropdown selector
  const roleSelect = document.getElementById('roleNavigationSelect');
  if (roleSelect && roleSelect.value !== sectionId) {
    const hasOption = Array.from(roleSelect.options).some(o => o.value === sectionId);
    if (hasOption) roleSelect.value = sectionId;
  }

  // Trigger role-specific rendering
  if (sectionId === 'farmer') {
    renderFarmerPanel('farmerPanelContainer', handleFarmerPublishListing);
  } else if (sectionId === 'admin') {
    renderAdminPanel('adminPanelContainer');
  } else if (sectionId === 'machinery') {
    renderMachineryOwnerPanel('machineryPanelContainer');
  } else if (sectionId === 'warehouse') {
    renderWarehousePanel('warehousePanelContainer');
  } else if (sectionId === 'transporter') {
    renderTransporterPanel('transporterPanelContainer');
  } else if (sectionId === 'supplier') {
    renderInputSupplierPanel('supplierPanelContainer');
  } else if (sectionId === 'expert') {
    renderExpertPanel('expertPanelContainer');
  } else if (sectionId === 'fpo') {
    renderFpoPanel('fpoPanelContainer');
  } else if (sectionId === 'map') {
    setTimeout(() => {
      if (getGoogleMap()) {
        getGoogleMap().invalidateSize();
      }
    }, 150);
  } else if (sectionId === 'mandi') {
    loadMandiRatesView();
  } else if (sectionId === 'weather') {
    loadWeatherView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.__navigateToSection = navigateToSection;

window.__handleRoleNavigation = (role) => {
  navigateToSection(role);
};

// Callback when farmer publishes a new listing from recorded harvest
function handleFarmerPublishListing(newListing) {
  allItems.unshift(newListing);
  applyFiltersAndRender();
  showToast(`Published "${newListing.title}" to Live Marketplace!`, 'success');
}

// Buyer Saved Listings & Farmers
window.__toggleSaveListing = (itemId) => {
  if (savedListingIds.has(itemId)) {
    savedListingIds.delete(itemId);
    showToast('Removed from saved shortlist', 'info');
  } else {
    savedListingIds.add(itemId);
    showToast('Saved to your shortlist! ★', 'success');
  }
  localStorage.setItem('krishi_saved_listings', JSON.stringify(Array.from(savedListingIds)));
  applyFiltersAndRender();
  if (selectedItem?.id === itemId) {
    openDetailsDrawer(selectedItem);
  }
};

// Buyer Formal Quotation Modal Hook
window.__openQuotationModal = (itemId) => {
  const item = allItems.find(i => i.id === itemId);
  if (item) {
    openQuotationModal(item);
  }
};

// Order Tracking Workflow
window.__openTrackOrderModal = () => {
  document.getElementById('trackOrderModal')?.classList.remove('hidden');
};

window.__lookupOrderStatus = () => {
  const query = document.getElementById('trackOrderInput')?.value.trim().toUpperCase();
  const resEl = document.getElementById('trackOrderResult');
  if (!query || !resEl) return;

  const foundOrder = farmerState.salesOrders.find(o => o.id === query);
  if (foundOrder) {
    resEl.innerHTML = `
      <div class="space-y-1.5 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-bold text-stone-900">${foundOrder.id} · ${foundOrder.item}</span>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">${foundOrder.status}</span>
        </div>
        <p class="text-stone-600">Quantity: <strong>${foundOrder.quantity}</strong> · Value: <strong>₹${foundOrder.amount.toLocaleString('en-IN')}</strong></p>
        <p class="text-stone-500">Buyer: ${foundOrder.buyerName} · Date: ${foundOrder.date}</p>
        <div class="pt-1 border-t border-stone-200 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
          <span>Settlement: ${foundOrder.paymentStatus}</span>
          <span class="text-stone-400">JKLU Mahapura Hub</span>
        </div>
      </div>
    `;
  } else {
    resEl.innerHTML = `
      <div class="text-xs text-amber-800 p-2 bg-amber-50 rounded-lg border border-amber-200">
        Order reference <strong>${query}</strong> is pending driver assignment or awaiting offline settlement verification.
      </div>
    `;
  }
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `p-3 rounded-lg text-xs font-semibold text-white shadow-lg transition-all transform duration-300 ${
    type === 'error' ? 'bg-red-700' : 'bg-[#1b4332]'
  }`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// ============================================================================
// AUTHENTICATION & USER PROFILE CONTROLLER
// ============================================================================

function updateAuthUI(user) {
  const authContainer = document.getElementById('authHeaderContainer');
  const triggerBtn = document.getElementById('authTriggerBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');

  // Sync login section active session banner
  const sessionBanner = document.getElementById('authActiveSessionBanner');
  const sessionName = document.getElementById('authActiveSessionName');
  const sessionRole = document.getElementById('authActiveSessionRole');
  if (sessionBanner) {
    if (user) {
      sessionBanner.classList.remove('hidden');
      if (sessionName) sessionName.textContent = user.fullName;
      if (sessionRole) sessionRole.textContent = `${user.roleLabel || user.role} · ${user.village || 'Jaipur'}`;
    } else {
      sessionBanner.classList.add('hidden');
    }
  }

  if (!authContainer || !triggerBtn) return;

  if (user) {
    // Authenticated user pill
    triggerBtn.className = 'px-3 py-1.5 bg-[#1b4332] hover:bg-[#153427] text-white rounded-lg text-xs font-bold border border-emerald-400/40 transition flex items-center space-x-1.5 shadow-sm cursor-pointer';
    triggerBtn.innerHTML = `
      <span class="text-sm">${user.avatar || '👤'}</span>
      <span class="font-semibold text-stone-100 max-w-[120px] truncate">${user.fullName.split(' ')[0]}</span>
      <span class="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">${user.role}</span>
      <span class="text-[10px] text-stone-300">▼</span>
    `;

    triggerBtn.onclick = (e) => {
      e.stopPropagation();
      userMenuDropdown?.classList.toggle('hidden');
    };

    const userFullNameEl = document.getElementById('userMenuFullName');
    const userRoleDetailEl = document.getElementById('userMenuRoleDetail');
    if (userFullNameEl) userFullNameEl.textContent = user.fullName;
    if (userRoleDetailEl) userRoleDetailEl.textContent = `${user.roleLabel} · ${user.village || 'Jaipur'}`;
  } else {
    // Guest state
    triggerBtn.className = 'px-3 py-1.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-lg text-xs font-bold border border-emerald-500/40 transition flex items-center space-x-1.5 shadow-sm cursor-pointer';
    triggerBtn.innerHTML = `
      <span>🔑</span>
      <span>लॉग इन / Sign In</span>
    `;
    triggerBtn.onclick = () => window.__openAuthModal('otp');
    userMenuDropdown?.classList.add('hidden');
  }
}

// Close user menu on outside click
document.addEventListener('click', (e) => {
  const userMenu = document.getElementById('userMenuDropdown');
  const triggerBtn = document.getElementById('authTriggerBtn');
  if (userMenu && !userMenu.contains(e.target) && triggerBtn && !triggerBtn.contains(e.target)) {
    userMenu.classList.add('hidden');
  }
});

window.__openAuthModal = (defaultTab = 'otp') => {
  document.getElementById('userMenuDropdown')?.classList.add('hidden');
  navigateToSection('login');
  window.__switchAuthTab(defaultTab === 'switch' ? 'quick' : defaultTab);
  clearAuthFeedback();
};

window.__closeAuthModal = () => {
  navigateToSection('home');
  clearAuthFeedback();
};

window.__switchAuthTab = (tabName) => {
  const tabs = ['otp', 'email', 'register', 'quick'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const sec = document.getElementById(`authSection${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (t === tabName) {
      btn?.classList.add('bg-white', 'text-[#1b4332]', 'shadow-sm');
      btn?.classList.remove('text-stone-600');
      sec?.classList.remove('hidden');
    } else {
      btn?.classList.remove('bg-white', 'text-[#1b4332]', 'shadow-sm');
      btn?.classList.add('text-stone-600');
      sec?.classList.add('hidden');
    }
  });
  clearAuthFeedback();
};

function setAuthFeedback(message, type = 'error') {
  const el = document.getElementById('authModalFeedback');
  if (!el) return;
  el.className = `mt-4 p-2.5 rounded-lg text-xs font-medium ${
    type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
  }`;
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearAuthFeedback() {
  const el = document.getElementById('authModalFeedback');
  if (el) el.classList.add('hidden');
}

window.__handleRequestOtp = async () => {
  clearAuthFeedback();
  const phone = document.getElementById('authMobileInput')?.value;
  const res = await requestMobileOtp(phone);
  if (!res.success) {
    setAuthFeedback(res.error, 'error');
    return;
  }

  document.getElementById('otpVerifyGroup')?.classList.remove('hidden');
  const phoneDisplay = document.getElementById('otpSentPhoneDisplay');
  if (phoneDisplay) phoneDisplay.textContent = `+91 ${res.phone}`;
  setAuthFeedback(res.message, 'success');

  const otpInput = document.getElementById('authOtpCodeInput');
  if (otpInput) {
    otpInput.value = '123456'; // convenient auto-fill for frictionless verification
    otpInput.focus();
  }
};

window.__handleVerifyOtp = async () => {
  clearAuthFeedback();
  const phone = document.getElementById('authMobileInput')?.value;
  const otp = document.getElementById('authOtpCodeInput')?.value;
  const role = document.getElementById('authOtpRoleSelect')?.value || 'farmer';

  const res = await verifyMobileOtp(phone, otp, role);
  if (!res.success) {
    setAuthFeedback(res.error, 'error');
    return;
  }

  window.__closeAuthModal();
  showToast(res.message, 'success');
  handleRoleRedirection(res.user);
};

window.__handleEmailLogin = async () => {
  clearAuthFeedback();
  const email = document.getElementById('authEmailInput')?.value;
  const pass = document.getElementById('authPasswordInput')?.value;
  const role = document.getElementById('authEmailRoleSelect')?.value || 'farmer';

  const res = await loginWithEmail(email, pass, role);
  if (!res.success) {
    setAuthFeedback(res.error, 'error');
    return;
  }

  window.__closeAuthModal();
  showToast(res.message, 'success');
  handleRoleRedirection(res.user);
};

window.__handleRegisterUser = async () => {
  clearAuthFeedback();
  const fullName = document.getElementById('regFullName')?.value;
  const role = document.getElementById('regRole')?.value;
  const phone = document.getElementById('regPhone')?.value;
  const email = document.getElementById('regEmail')?.value;
  const village = document.getElementById('regVillage')?.value;
  const district = document.getElementById('regDistrict')?.value;
  const documentId = document.getElementById('regDocumentId')?.value;

  const res = await registerNewUser({ fullName, role, phone, email, village, district, documentId });
  if (!res.success) {
    setAuthFeedback(res.error, 'error');
    return;
  }

  window.__closeAuthModal();
  showToast(res.message, 'success');
  handleRoleRedirection(res.user);
};

window.__quickLogin = (roleKey) => {
  const user = quickLoginAs(roleKey);
  if (!user) return;
  window.__closeAuthModal();
  showToast(`Switched persona to ${user.fullName} (${user.roleLabel})`, 'success');
  handleRoleRedirection(user);
};

function handleRoleRedirection(user) {
  if (!user) return;
  const select = document.getElementById('roleNavigationSelect');
  if (user.role === 'admin') {
    adminState.isAuthenticated = true;
    if (select) select.value = 'admin';
    navigateToSection('admin');
  } else if (user.role === 'farmer') {
    if (select) select.value = 'farmer';
    navigateToSection('farmer');
  } else if (user.role === 'buyer') {
    if (select) select.value = 'map';
    navigateToSection('map');
  } else if (['machinery', 'warehouse', 'transporter', 'fpo', 'supplier', 'expert'].includes(user.role)) {
    if (select) select.value = user.role;
    navigateToSection(user.role);
  } else {
    if (select) select.value = 'home';
    navigateToSection('home');
  }
}

window.__openProfileModal = () => {
  document.getElementById('userMenuDropdown')?.classList.add('hidden');
  const user = getCurrentUser();
  if (!user) {
    window.__openAuthModal();
    return;
  }

  const content = document.getElementById('profileModalContent');
  if (content) {
    content.innerHTML = `
      <div class="flex items-center space-x-3 p-3 bg-[#fbf8f1] rounded-xl border border-stone-200">
        <span class="text-3xl">${user.avatar || '👤'}</span>
        <div>
          <h4 class="font-bold text-stone-900 text-sm">${user.fullName}</h4>
          <p class="text-xs text-stone-600 font-medium">${user.roleLabel}</p>
          <span class="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
            ✓ ${user.verificationBadge || 'Active KrishiSetu Member'}
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs pt-2">
        <div class="p-2 bg-stone-50 rounded-lg border border-stone-200">
          <span class="text-stone-500 block text-[10px]">Mobile Number</span>
          <strong class="text-stone-800">+91 ${user.phone}</strong>
        </div>
        <div class="p-2 bg-stone-50 rounded-lg border border-stone-200">
          <span class="text-stone-500 block text-[10px]">Email Address</span>
          <strong class="text-stone-800 truncate block">${user.email || 'N/A'}</strong>
        </div>
        <div class="p-2 bg-stone-50 rounded-lg border border-stone-200">
          <span class="text-stone-500 block text-[10px]">Village / Locality</span>
          <strong class="text-stone-800">${user.village || 'Mahapura, Ajmer Road'}</strong>
        </div>
        <div class="p-2 bg-stone-50 rounded-lg border border-stone-200">
          <span class="text-stone-500 block text-[10px]">District / State</span>
          <strong class="text-stone-800">${user.district || 'Jaipur Rural'}, Rajasthan</strong>
        </div>
      </div>
      ${user.landHoldings ? `
        <div class="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs">
          <span class="text-emerald-800 font-semibold block text-[11px]">Land Parcel Record:</span>
          <span class="text-stone-700">${user.landHoldings}</span>
        </div>
      ` : ''}
      ${user.fleet ? `
        <div class="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs">
          <span class="text-emerald-800 font-semibold block text-[11px]">Registered Machinery / Vehicles:</span>
          <span class="text-stone-700">${user.fleet}</span>
        </div>
      ` : ''}
    `;
  }

  document.getElementById('profileModal')?.classList.remove('hidden');
};

window.__logoutUser = async () => {
  document.getElementById('userMenuDropdown')?.classList.add('hidden');
  document.getElementById('profileModal')?.classList.add('hidden');
  await logoutUser();
  showToast('Logged out of KrishiSetu session', 'info');
  const select = document.getElementById('roleNavigationSelect');
  if (select) select.value = 'home';
  navigateToSection('home');
};


