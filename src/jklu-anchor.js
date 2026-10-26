// src/jklu-anchor.js
// Verified JKLU location anchor and distance calculation utilities

import { jkluAnchorData } from './jklu-anchor-constant.js';

export { jkluAnchorData };

/**
 * Calculates straight-line distance in kilometres using the Haversine formula.
 * Strictly labeled as straight-line distance (never labeled driving distance).
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((R * c).toFixed(2));
}

export function formatDistanceLabel(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return 'Distance unavailable';
  }
  return `${distanceKm} km (straight-line)`;
}

export function isWithinRadius(targetLat, targetLng, radiusKm, centerLat = jkluAnchorData.latitude, centerLng = jkluAnchorData.longitude) {
  const dist = calculateHaversineDistanceKm(centerLat, centerLng, targetLat, targetLng);
  return dist <= radiusKm;
}

export function validateCoordinates(lat, lng) {
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  const isValid = !isNaN(nLat) && !isNaN(nLng) && nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
  return { isValid, lat: nLat, lng: nLng };
}
