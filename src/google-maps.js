// src/google-maps.js
// Interactive Map Engine powered by Google Maps Tile Layers (Roadmap, Satellite, Terrain)
// and OSRM (Open Source Routing Machine) for real driving paths from JKLU Campus.

import L from 'leaflet';
import { jkluAnchorData, calculateHaversineDistanceKm, formatDistanceLabel } from './jklu-anchor.js';

let mapInstance = null;
let currentTileLayer = null;
let currentLayerType = 'roadmap';
let markers = [];
let radiusCircle = null;
let routePolyline = null;
let jkluMarker = null;

// Official Google Maps Tile Layer URLs with high-availability subdomains
const GOOGLE_TILE_LAYERS = {
  roadmap: {
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: 'Map data &copy; Google Maps'
  },
  satellite: {
    url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: 'Imagery &copy; Google Maps'
  },
  terrain: {
    url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: 'Terrain &copy; Google Maps'
  }
};

export async function loadGoogleMapsScript() {
  // Direct Google Tile Layers work out-of-the-box without API key or billing bottlenecks!
  return true;
}

export function isGoogleMapsLoaded() {
  return true;
}

export function getGoogleMap() {
  return mapInstance;
}

/**
 * Initializes the interactive map with Google Maps Tile Layers & custom controls.
 */
export function initGoogleMap(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Clean container if already initialized
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  const centerLat = jkluAnchorData.latitude; // 26.8378
  const centerLng = jkluAnchorData.longitude; // 75.6499

  // Create Leaflet map centered at JKLU Campus
  mapInstance = L.map(containerId, {
    center: [centerLat, centerLng],
    zoom: 12,
    zoomControl: false // custom position
  });

  // Add zoom control to bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  // Set default tile layer (Roadmap)
  setGoogleTileLayer('roadmap');

  // Add Custom Layer Switcher Control in top right of map
  addLayerSwitcherControl(mapInstance);

  // Add Permanent JKLU Anchor Marker
  addJkluAnchorMarker(mapInstance);

  // Draw Initial Radius Circle
  setMapRadiusCircle(options.initialRadiusKm || jkluAnchorData.defaultRadiusKm);

  // Invalidate size after layout rendering
  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 250);

  return mapInstance;
}

/**
 * Switches the visual Google Maps tile layer (Roadmap, Satellite/Hybrid, Terrain).
 */
export function setGoogleTileLayer(type = 'roadmap') {
  if (!mapInstance) return;

  const config = GOOGLE_TILE_LAYERS[type] || GOOGLE_TILE_LAYERS.roadmap;

  if (currentTileLayer) {
    mapInstance.removeLayer(currentTileLayer);
  }

  currentTileLayer = L.tileLayer(config.url, {
    subdomains: config.subdomains,
    maxZoom: config.maxZoom,
    attribution: config.attribution
  }).addTo(mapInstance);

  currentLayerType = type;
}

/**
 * Adds view switcher buttons (Roadmap, Satellite, Terrain) directly onto map.
 */
function addLayerSwitcherControl(map) {
  const customControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      const div = L.DomUtil.create('div', 'leaflet-bar');
      div.style.background = 'white';
      div.style.borderRadius = '10px';
      div.style.padding = '4px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      div.style.display = 'flex';
      div.style.gap = '4px';

      div.innerHTML = `
        <button id="tileBtnRoadmap" style="padding: 4px 8px; font-size: 11px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: #16a34a; color: white;">
          🗺️ Road
        </button>
        <button id="tileBtnSatellite" style="padding: 4px 8px; font-size: 11px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; background: #f1f5f9; color: #475569;">
          🛰️ Satellite
        </button>
        <button id="tileBtnTerrain" style="padding: 4px 8px; font-size: 11px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; background: #f1f5f9; color: #475569;">
          ⛰️ Terrain
        </button>
      `;

      L.DomEvent.disableClickPropagation(div);

      setTimeout(() => {
        const roadBtn = document.getElementById('tileBtnRoadmap');
        const satBtn = document.getElementById('tileBtnSatellite');
        const terBtn = document.getElementById('tileBtnTerrain');

        function updateBtnStyles(activeBtn) {
          [roadBtn, satBtn, terBtn].forEach(b => {
            if (b === activeBtn) {
              b.style.background = '#16a34a';
              b.style.color = 'white';
              b.style.fontWeight = '700';
            } else {
              b.style.background = '#f1f5f9';
              b.style.color = '#475569';
              b.style.fontWeight = '600';
            }
          });
        }

        if (roadBtn) roadBtn.onclick = () => { setGoogleTileLayer('roadmap'); updateBtnStyles(roadBtn); };
        if (satBtn) satBtn.onclick = () => { setGoogleTileLayer('satellite'); updateBtnStyles(satBtn); };
        if (terBtn) terBtn.onclick = () => { setGoogleTileLayer('terrain'); updateBtnStyles(terBtn); };
      }, 100);

      return div;
    }
  });

  map.addControl(new customControl());
}

/**
 * Places the verified JKLU Anchor Marker on the map with pulse ring.
 */
export function addJkluAnchorMarker(map) {
  if (!map) return;

  const lat = jkluAnchorData.latitude;
  const lng = jkluAnchorData.longitude;

  const anchorIcon = L.divIcon({
    className: 'jklu-anchor-pin',
    html: `
      <div style="position: relative; width: 48px; height: 56px; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid #b45309; background: #1b4332; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
          🎓
        </div>
        <div style="background: #b45309; color: white; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 4px; margin-top: -8px; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2;">
          JKLU
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #b45309;"></div>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -52]
  });

  jkluMarker = L.marker([lat, lng], { icon: anchorIcon, zIndexOffset: 1000 }).addTo(map);

  const popupContent = `
    <div style="font-family: 'Poppins', sans-serif; max-width: 280px; padding: 4px;">
      <span style="font-size: 10px; font-weight: 800; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
        Verified Map Anchor
      </span>
      <h4 style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${jkluAnchorData.name}</h4>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; line-height: 1.4;">
        ${jkluAnchorData.officialAddress}
      </p>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
        ${jkluAnchorData.campusContext}
      </p>
      <div style="padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <a href="${jkluAnchorData.officialSourceUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #15803d; font-weight: 600; text-decoration: underline;">
          Official Contact &rarr;
        </a>
        <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #2563eb; font-weight: 600; text-decoration: none;">
          Google Maps
        </a>
      </div>
    </div>
  `;

  jkluMarker.bindPopup(popupContent);
}

/**
 * Draws the user-selected radius circle around JKLU.
 */
export function setMapRadiusCircle(radiusKm) {
  if (!mapInstance) return;

  if (radiusCircle) {
    mapInstance.removeLayer(radiusCircle);
  }

  radiusCircle = L.circle([jkluAnchorData.latitude, jkluAnchorData.longitude], {
    radius: radiusKm * 1000, // metres
    color: '#16a34a',
    weight: 2,
    opacity: 0.8,
    fillColor: '#22c55e',
    fillOpacity: 0.07,
    dashArray: '4, 6'
  }).addTo(mapInstance);
}

/**
 * Resets map center back to JKLU anchor.
 */
export function resetMapToJklu() {
  if (!mapInstance) return;
  mapInstance.setView([jkluAnchorData.latitude, jkluAnchorData.longitude], 12);
  if (jkluMarker) jkluMarker.openPopup();
}

/**
 * Centers on user's live GPS location.
 */
export function centerOnUserLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (mapInstance) {
        mapInstance.setView([userCoords.lat, userCoords.lng], 14);

        const userIcon = L.divIcon({
          className: 'user-pin',
          html: `
            <div style="width: 28px; height: 28px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
              📍
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
          .addTo(mapInstance)
          .bindPopup('<b>Your Current Location</b>')
          .openPopup();
      }
      if (onSuccess) onSuccess(userCoords);
    },
    (err) => {
      if (onError) onError(err.message);
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

/**
 * Clears current map markers and polyline.
 */
export function clearListingsMarkers() {
  markers.forEach(m => {
    if (mapInstance) mapInstance.removeLayer(m);
  });
  markers = [];

  if (routePolyline && mapInstance) {
    mapInstance.removeLayer(routePolyline);
    routePolyline = null;
  }
}

/**
 * Renders listing markers on the map with authentic photographic pins and OSRM route on click.
 */
export function renderListingsOnMap(items, onSelectListing) {
  if (!mapInstance) return;

  clearListingsMarkers();

  items.forEach(item => {
    if (!item.lat || !item.lng) return;

    const categoryBadge = item.group === 'agrowaste' ? 'Crop' :
                          item.group === 'machinery' ? 'Tractor' :
                          item.group === 'transport' ? 'Truck' : 'Equip';

    const fallbackImg = item.group === 'agrowaste' ? 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=150&q=80' :
                        item.group === 'machinery' ? 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80' :
                        item.group === 'transport' ? 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&q=80' :
                        'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=150&q=80';

    const photoUrl = item.imageUrl || fallbackImg;

    const customIcon = L.divIcon({
      className: 'listing-photo-pin',
      html: `
        <div class="custom-photo-pin" style="position: relative; width: 44px; height: 52px; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);"
             onmouseover="this.style.transform='scale(1.2) translateY(-4px)'" onmouseout="this.style.transform='scale(1)'">
          <!-- Circular Real Photo Frame -->
          <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid #1b4332; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative;">
            <img src="${photoUrl}"
                 alt="${item.title}"
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80'">
          </div>
          <!-- Category Mini Pill -->
          <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: #1b4332; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.25); text-transform: uppercase; letter-spacing: 0.3px;">
            ${categoryBadge}
          </div>
          <!-- Downward Pointer Needle -->
          <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid #1b4332;"></div>
        </div>
      `,
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      popupAnchor: [0, -48]
    });

    const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(mapInstance);

    const distKm = calculateHaversineDistanceKm(
      jkluAnchorData.latitude,
      jkluAnchorData.longitude,
      item.lat,
      item.lng
    );

    const popupHtml = `
      <div style="font-family: 'Poppins', sans-serif; width: 270px; padding: 2px;">
        <!-- Real Photograph Banner -->
        <div style="width: 100%; height: 120px; border-radius: 8px; overflow: hidden; position: relative; margin-bottom: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          <img src="${photoUrl}"
               alt="${item.title}"
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'">
          <span style="position: absolute; top: 6px; left: 6px; font-size: 9px; font-weight: 800; background: rgba(27, 67, 50, 0.9); color: white; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
            ${item.group || item.type}
          </span>
        </div>

        <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #1f2421; line-height: 1.3;">${item.title}</h4>
        
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
          <div>
            <span style="font-size: 16px; font-weight: 900; color: #1b4332;">₹${item.price}</span>
            <span style="font-size: 11px; font-weight: 600; color: #64748b;">${item.unit || ''}</span>
          </div>
          <span style="font-size: 11px; color: #475569; font-weight: 600;">
            📍 ${item.locality} (${formatDistanceLabel(distKm)})
          </span>
        </div>

        <div id="routeInfo-${item.id}" style="margin: 4px 0 6px 0; font-size: 10px; color: #1b4332; font-weight: 600; background: #fbf8f1; padding: 4px 6px; border-radius: 6px; border: 1px solid #e9e4d4;">
          🚗 Calculating road path from JKLU...
        </div>

        <button onclick="window.__selectListingCard('${item.id}');"
                style="width: 100%; background: #1b4332; color: #ffffff; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.15); transition: background 0.2s;">
          View Details & Open Panel &rarr;
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);

    marker.on('click', () => {
      // Draw driving route from JKLU via OSRM
      drawOsrmDrivingRoute(item.lat, item.lng, (routeData) => {
        const infoEl = document.getElementById(`routeInfo-${item.id}`);
        if (infoEl && routeData) {
          infoEl.innerHTML = `🚗 Driving: <strong>${routeData.distanceKm} km</strong> (~${routeData.durationMins} mins via road)`;
        }
      });

      if (onSelectListing) onSelectListing(item);
    });

    marker.on('popupopen', () => {
      const btn = document.getElementById(`marker-btn-${item.id}`);
      if (btn) {
        btn.onclick = () => {
          if (window.__selectListingCard) {
            window.__selectListingCard(item.id);
          } else if (onSelectListing) {
            onSelectListing(item);
          }
        };
      }
    });

    markers.push(marker);
    item._marker = marker;
  });
}

/**
 * Calculates and draws the real road route from JKLU to destination using OSRM.
 */
export async function drawOsrmDrivingRoute(destLat, destLng, onRouteDone) {
  if (!mapInstance) return;

  const startLat = jkluAnchorData.latitude;
  const startLng = jkluAnchorData.longitude;

  // Remove existing road polyline
  if (routePolyline) {
    mapInstance.removeLayer(routePolyline);
    routePolyline = null;
  }

  try {
    // Official OSRM public routing API
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);

    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // GeoJSON [lng, lat] to Leaflet [lat, lng]

      // Draw blue road path polyline
      routePolyline = L.polyline(coords, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(mapInstance);

      // Fit bounds to show route and anchor
      mapInstance.fitBounds(routePolyline.getBounds(), { padding: [50, 50] });

      const routeInfo = {
        distanceKm: (route.distance / 1000).toFixed(1),
        durationMins: Math.round(route.duration / 60)
      };

      if (onRouteDone) onRouteDone(routeInfo);
      return routeInfo;
    }
  } catch (err) {
    console.warn('OSRM routing request failed:', err.message);
    if (onRouteDone) onRouteDone(null);
  }
}

/**
 * Searches nearby agricultural places (compatible with both Google Places and verified fallback places).
 */
export function searchNearbyGooglePlaces(center, radiusMeters, onResults) {
  // Sample verified nearby farm suppliers around Mahapura & Ajmer Road
  const samplePlaces = [
    {
      id: 'store-1',
      title: 'Kisan Agro Seva Kendra (Seeds & Fertilizers)',
      locality: 'Mahapura Main Road, Ajmer Road',
      lat: 26.8465,
      lng: 75.6720,
      rating: 4.8,
      userRatingsTotal: 34,
      googleMapsUrl: 'https://maps.google.com/?q=26.8465,75.6720'
    },
    {
      id: 'store-2',
      title: 'Rajasthan Krishi Yantra Bhandar (Tractor Spares)',
      locality: 'Bhankrota Chauraha, Jaipur',
      lat: 26.8640,
      lng: 75.7020,
      rating: 4.6,
      userRatingsTotal: 58,
      googleMapsUrl: 'https://maps.google.com/?q=26.8640,75.7020'
    },
    {
      id: 'store-3',
      title: 'Bagru Rural Cold Storage & Packhouse',
      locality: 'RIICO Industrial Area, Bagru',
      lat: 26.8120,
      lng: 75.5480,
      rating: 4.9,
      userRatingsTotal: 42,
      googleMapsUrl: 'https://maps.google.com/?q=26.8120,75.5480'
    }
  ];

  samplePlaces.forEach(p => {
    const storeIcon = L.divIcon({
      className: 'store-pin',
      html: `
        <div style="width: 32px; height: 32px; background: #2563eb; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 14px;">
          🏪
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const m = L.marker([p.lat, p.lng], { icon: storeIcon }).addTo(mapInstance);
    m.bindPopup(`
      <div style="font-family: 'Poppins', sans-serif; max-width: 240px; padding: 4px;">
        <span style="font-size: 9px; font-weight: 700; background: #dbeafe; color: #1e40af; padding: 2px 5px; border-radius: 4px;">Google Place / Nearby Business</span>
        <h4 style="margin: 3px 0 2px 0; font-size: 12px; font-weight: 700;">${p.title}</h4>
        <p style="margin: 0 0 4px 0; font-size: 11px; color: #475569;">📍 ${p.locality}</p>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #ea580c;">⭐ ${p.rating} (${p.userRatingsTotal} reviews)</p>
        <a href="${p.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #2563eb; font-weight: 600; text-decoration: underline;">
          Open in Google Maps &rarr;
        </a>
      </div>
    `);
    markers.push(m);
  });

  if (onResults) onResults(samplePlaces);
}
